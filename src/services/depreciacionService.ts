// src/services/depreciacionService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Depreciación API
 */
export interface DepreciacionApiData {
  id: number;
  anio: number;
  codTipoCasa: string;
  descripcionTipoCasa: string;
  material: string;
  antiguedad: string;
  muyBueno: number;
  bueno: number;
  regular: number;
  malo: number;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
}

export interface DepreciacionFormattedData {
  id: number;
  anio: number;
  codTipoCasa: string;
  tipoCasa: string;
  material: string;
  antiguedad: string;
  porcMuyBueno: number;
  porcBueno: number;
  porcRegular: number;
  porcMalo: number;
  estado: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
}

export interface ConsultaDepreciacionParams {
  anio?: number;
  codTipoCasa?: string;
}

export interface CrearDepreciacionDTO {
  codDepreciacion?: null; // Se genera automáticamente en SQL
  codDepreciacionAnterior?: null;
  anio: string;
  codTipoCasa: string;
  codNivelAntiguedad: string;
  codMaterialEstructural: string;
  muyBueno: number;
  bueno: number;
  regular: number;
  malo: number;
  nivelAntiguedad?: null;
  materialEstructural?: null;
}

/**
 * Servicio para gestión de depreciación
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class DepreciacionService extends BaseApiService<DepreciacionFormattedData, any, any> {
  private static instance: DepreciacionService;
  
  private constructor() {
    super(
      '/api/depreciacion',
      {
        normalizeItem: (item: any) => ({
          id: item.id || item.codDepreciacion || 0,
          anio: item.anio || item.año || new Date().getFullYear(),
          codTipoCasa: item.codTipoCasa || '',
          tipoCasa: item.descripcionTipoCasa || item.tipoCasa || '',
          material: item.material || '',
          antiguedad: item.antiguedad || '',
          porcMuyBueno: parseFloat(item.muyBueno?.toString() || item.porcMuyBueno?.toString() || '0'),
          porcBueno: parseFloat(item.bueno?.toString() || item.porcBueno?.toString() || '0'),
          porcRegular: parseFloat(item.regular?.toString() || item.porcRegular?.toString() || '0'),
          porcMalo: parseFloat(item.malo?.toString() || item.porcMalo?.toString() || '0'),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion
        }),
        
        validateItem: (item: DepreciacionFormattedData) => {
          return !!(
            item.id && 
            item.anio > 1990 && 
            item.anio <= 2100 && 
            item.codTipoCasa &&
            item.material &&
            item.antiguedad
          );
        }
      },
      'depreciacion'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): DepreciacionService {
    if (!DepreciacionService.instance) {
      DepreciacionService.instance = new DepreciacionService();
    }
    return DepreciacionService.instance;
  }
  
  /**
   * Consulta depreciaciones usando el API específico con GET y query params
   * URL: GET http://26.161.18.122:8080/api/depreciacion?anio=2024&codTipoCasa=0501
   * NO requiere autenticación
   */
  async consultarDepreciaciones(params: ConsultaDepreciacionParams): Promise<DepreciacionFormattedData[]> {
    try {
      console.log('[DepreciacionService] Consultando depreciaciones - Año:', params.anio || new Date().getFullYear(), 'Código:', params.codTipoCasa || '0501');
      
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      // Año por defecto si no se proporciona
      const anioFinal = params.anio || new Date().getFullYear();
      queryParams.append('anio', anioFinal.toString());
      
      // Código tipo de casa por defecto si no se proporciona
      const codTipoCasaFinal = params.codTipoCasa || '0501';
      queryParams.append('codTipoCasa', codTipoCasaFinal);
      
      // Construir URL completa
      const queryString = queryParams.toString();
      const url = `${API_CONFIG.baseURL}${this.endpoint}${queryString ? `?${queryString}` : ''}`;
      
      // Petición GET sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization para GET
          // NO incluir Content-Type en GET
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DepreciacionService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        // Mensaje específico para error 403
        if (response.status === 403) {
          throw new Error(`Acceso denegado (403). Verifique los parámetros: anio=${anioFinal}, codTipoCasa=${codTipoCasaFinal}`);
        }
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      
      // El API devuelve un objeto con estructura {success: true, data: [...]}
      let items = [];
      if (Array.isArray(responseData)) {
        // Caso raro: array directo
        items = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Verificar si tiene estructura {success: true, data: [...]}
        if (responseData.success !== undefined && responseData.data) {
          if (Array.isArray(responseData.data)) {
            items = responseData.data;
          } else {
            // Si data no es array pero existe, convertir a array
            items = [responseData.data];
          }
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // Fallback: solo data array
          items = responseData.data;
        } else {
          // Es un solo objeto, convertir a array
          items = [responseData];
        }
      }
      
      // Normalizar datos según la estructura real del API
      const depreciacionesFormateadas = items.map((item: any, index: number) => {
        
        const depreciacionFormateada = {
          id: item.codDepreciacion || item.id || `temp_${index + 1}`,
          anio: item.anio || item.año || anioFinal,
          codTipoCasa: item.codTipoCasa?.trim() || codTipoCasaFinal, // Trim espacios en blanco
          tipoCasa: item.descripcionTipoCasa || item.tipoCasa || `Tipo ${(item.codTipoCasa || codTipoCasaFinal)?.trim()}`,
          material: item.materialEstructural || item.material || '', // Usar materialEstructural primero
          antiguedad: item.nivelAntiguedad || item.antiguedad || '', // Usar nivelAntiguedad primero
          porcMuyBueno: parseFloat(item.muyBueno?.toString() || item.porcMuyBueno?.toString() || '0'),
          porcBueno: parseFloat(item.bueno?.toString() || item.porcBueno?.toString() || '0'),
          porcRegular: parseFloat(item.regular?.toString() || item.porcRegular?.toString() || '0'),
          porcMalo: parseFloat(item.malo?.toString() || item.porcMalo?.toString() || '0'),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion
        };
        
        return depreciacionFormateada;
      });
      
      console.log(`[DepreciacionService] ${depreciacionesFormateadas.length} depreciaciones procesadas`);
      return depreciacionesFormateadas;
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error completo:', error);
      console.error('❌ [DepreciacionService] Stack trace:', error.stack);
      
      // Re-throw con mejor información de error
      if (error.message.includes('403')) {
        throw new Error('Error 403: El servidor rechazó la petición. Verifique la configuración del API y los parámetros requeridos.');
      }
      
      throw error;
    }
  }
  
  /**
   * Lista todas las depreciaciones usando la API con parámetros por defecto
   * NO requiere autenticación (método GET)
   */
  async listarDepreciaciones(anio?: number, codTipoCasa?: string): Promise<DepreciacionFormattedData[]> {
    try {
      console.log('🔍 [DepreciacionService] Listando depreciaciones');
      
      return await this.consultarDepreciaciones({
        anio: anio || new Date().getFullYear(),
        codTipoCasa: codTipoCasa || '0501'
      });
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error listando depreciaciones:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene tipos de casa disponibles
   * Esto podría ser un endpoint separado o datos hardcodeados
   */
  async obtenerTiposCasa(): Promise<{ value: string, label: string }[]> {
    try {
      console.log('🔍 [DepreciacionService] Obteniendo tipos de casa disponibles');
      
      // Por ahora devolvemos tipos hardcodeados
      // En el futuro esto podría venir de un endpoint separado
      const tiposCasa = [
        { value: '0501', label: 'Casa-Habitación' },
        { value: '0502', label: 'Tienda-Depósito' },
        { value: '0503', label: 'Edificio' },
        { value: '0504', label: 'Clínica-Hospital' },
        { value: '0505', label: 'Oficina' },
      ];
      
      console.log('✅ [DepreciacionService] Tipos de casa obtenidos:', tiposCasa);
      return tiposCasa;
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error obteniendo tipos de casa:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene años disponibles
   * Genera un rango de años desde 2020 hasta año actual + 2
   */
  async obtenerAniosDisponibles(): Promise<{ value: string, label: string }[]> {
    try {
      console.log('🔍 [DepreciacionService] Obteniendo años disponibles');
      
      const anioActual = new Date().getFullYear();
      const anioInicio = 2020;
      const anioFin = anioActual + 2;
      
      const años = [];
      for (let año = anioInicio; año <= anioFin; año++) {
        años.push({
          value: año.toString(),
          label: año.toString()
        });
      }
      
      console.log('✅ [DepreciacionService] Años disponibles:', años);
      return años;
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error obteniendo años disponibles:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva depreciación usando POST sin autenticación
   * URL: POST http://26.161.18.122:8080/api/depreciacion
   * NO requiere autenticación
   */
  async crearDepreciacion(datos: CrearDepreciacionDTO): Promise<DepreciacionFormattedData> {
    try {
      console.log('➕ [DepreciacionService] Creando depreciación:', datos);
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      console.log('📡 [DepreciacionService] URL para crear:', url);
      console.log('📡 [DepreciacionService] Datos a enviar:', datos);
      
      // Petición POST sin autenticación
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datos)
      });
      
      console.log('📡 [DepreciacionService] Response Status:', response.status);
      console.log('📡 [DepreciacionService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DepreciacionService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [DepreciacionService] Depreciación creada exitosamente:', responseData);
      
      // Normalizar la respuesta
      const depreciacionCreada = {
        id: responseData.codDepreciacion || responseData.id || 0,
        anio: parseInt(responseData.anio || datos.anio),
        codTipoCasa: responseData.codTipoCasa || datos.codTipoCasa,
        tipoCasa: responseData.descripcionTipoCasa || `Tipo ${responseData.codTipoCasa || datos.codTipoCasa}`,
        material: responseData.materialEstructural || responseData.codMaterialEstructural || datos.codMaterialEstructural,
        antiguedad: responseData.nivelAntiguedad || responseData.codNivelAntiguedad || datos.codNivelAntiguedad,
        porcMuyBueno: parseFloat(responseData.muyBueno?.toString() || datos.muyBueno.toString()),
        porcBueno: parseFloat(responseData.bueno?.toString() || datos.bueno.toString()),
        porcRegular: parseFloat(responseData.regular?.toString() || datos.regular.toString()),
        porcMalo: parseFloat(responseData.malo?.toString() || datos.malo.toString()),
        estado: responseData.estado || 'ACTIVO',
        fechaRegistro: responseData.fechaRegistro || new Date().toISOString(),
        fechaModificacion: responseData.fechaModificacion
      };
      
      console.log('✅ [DepreciacionService] Depreciación normalizada:', depreciacionCreada);
      return depreciacionCreada;
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error creando depreciación:', error);
      console.error('❌ [DepreciacionService] Stack trace:', error.stack);
      throw error;
    }
  }
  
  /**
   * Actualiza una depreciación existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarDepreciacion(id: number, datos: any): Promise<DepreciacionFormattedData> {
    try {
      console.log('📝 [DepreciacionService] Actualizando depreciación:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar depreciaciones');
      }
      
      return await this.update(id, datos);
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error actualizando depreciación:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una depreciación (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarDepreciacion(id: number): Promise<void> {
    try {
      console.log('🗑️ [DepreciacionService] Eliminando depreciación:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar depreciaciones');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [DepreciacionService] Depreciación marcada como inactiva');
      
    } catch (error: any) {
      console.error('❌ [DepreciacionService] Error eliminando depreciación:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const depreciacionService = DepreciacionService.getInstance();

// Exportar también la clase por si se necesita extender
export default DepreciacionService;