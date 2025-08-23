// src/services/arancelService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * IMPORTANTE: Esta API acepta tanto form-data como query parameters.
 * Desde el navegador SOLO podemos usar query parameters en GET.
 * Las peticiones GET NO requieren autenticación.
 */

export interface ArancelData {
  codArancel: number | null;
  anio: number;
  codDireccion: number;
  costo: number | null;
  codUsuario: number | null;
  costoArancel: number;
}

export interface CreateArancelDTO {
  anio: number;
  codDireccion: number;
  costoArancel: number;
  codUsuario?: number;
}

// DTO específico para la API POST sin autenticación usando JSON
export interface CrearArancelApiDTO {
  codArancel: null; // Se asigna por SQL
  anio: number;
  codDireccion: number;
  costo: number;
  codUsuario: number;
}

export type UpdateArancelDTO = Partial<CreateArancelDTO>;

export interface ArancelResponse {
  success: boolean;
  message: string;
  data: ArancelData[];
  pagina: number | null;
  limite: number | null;
  totalPaginas: number | null;
  totalRegistros: number | null;
}

class ArancelService extends BaseApiService<ArancelData, CreateArancelDTO, UpdateArancelDTO> {
  private static instance: ArancelService;
  
  private constructor() {
    super(
      '/api/arancel',
      {
        normalizeItem: (item: any) => ({
          codArancel: item.codArancel || null,
          anio: item.anio || new Date().getFullYear(),
          codDireccion: item.codDireccion || 0,
          costo: item.costo || null,
          codUsuario: item.codUsuario || null,
          costoArancel: parseFloat(item.costoArancel || '0')
        }),
        
        validateItem: (item: ArancelData) => {
          return !!(
            item.anio && 
            item.codDireccion && 
            item.costoArancel >= 0
          );
        }
      },
      'arancel'
    );
  }
  
  static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }

  /**
   * Lista aranceles por parámetros - NO requiere autenticación
   * IMPORTANTE: Hacemos la petición directamente sin usar BaseApiService
   * para evitar que se envíen headers de autenticación
   */
  async listarAranceles(params?: { 
    anio?: number; 
    codDireccion?: number; 
    codUsuario?: number 
  }): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles con parámetros:', params);
      
      // Construir URL con query parameters - SIEMPRE incluir codDireccion y codUsuario
      let url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      // Construir parámetros de consulta - OBLIGATORIOS para evitar 403
      const queryParams = new URLSearchParams();
      
      // IMPORTANTE: El API requiere estos parámetros para evitar 403
      if (params?.anio) queryParams.set('anio', params.anio.toString());
      if (params?.codDireccion) {
        queryParams.set('codDireccion', params.codDireccion.toString());
      } else {
        // Si no se proporciona codDireccion, usar 1 como valor por defecto
        queryParams.set('codDireccion', '1');
      }
      queryParams.set('codUsuario', (params?.codUsuario || 1).toString());
      
      url += `?${queryParams.toString()}`;
      
      console.log('📡 [ArancelService] GET:', url);
      console.log('📋 [ArancelService] Query params construidos:', queryParams.toString());
      
      // Petición directa sin headers de autenticación para evitar 403
      const response = await fetch(url, {
        method: 'GET',
        // NO incluir headers que puedan causar CORS o autenticación
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response Headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        
        // Mensaje específico para error 403
        if (response.status === 403) {
          throw new Error(`Acceso denegado (403). Verifique que el API esté configurado para permitir peticiones sin autenticación.`);
        }
        
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ [ArancelService] Raw data recibida:', data);
      
      // El API puede devolver diferentes estructuras
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && typeof data === 'object') {
        // Verificar si tiene una propiedad data
        if (data.data && Array.isArray(data.data)) {
          items = data.data;
        } else if (data.success !== undefined) {
          // Es una respuesta con estructura de éxito/error
          items = data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : [];
        } else {
          // Es un solo objeto, convertir a array
          items = [data];
        }
      }
      
      console.log('✅ [ArancelService] Items to normalize:', items);
      const normalized = this.normalizeData(items);
      console.log('✅ [ArancelService] Datos normalizados:', normalized);
      
      return normalized;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error completo:', error);
      // Re-throw con mejor información
      if (error.message.includes('403')) {
        throw new Error('Error 403: El servidor rechazó la petición. Verifique la configuración del API y los parámetros requeridos.');
      }
      throw error;
    }
  }
  
  /**
   * Obtiene un arancel por año y dirección - NO requiere autenticación
   */
  async obtenerPorAnioYDireccion(anio: number, codDireccion: number): Promise<ArancelData | null> {
    try {
      console.log('🔍 [ArancelService] Obteniendo arancel:', { anio, codDireccion });
      
      const params = new URLSearchParams({
        codDireccion: codDireccion.toString(),
        anio: anio.toString(),
        codUsuario: '1'
      });
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}?${params.toString()}`;
      console.log('📡 [ArancelService] GET:', url);
      
      // Petición directa sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        const aranceles = this.normalizeData(Array.isArray(responseData.data) ? responseData.data : [responseData.data]);
        return aranceles.find(a => a.codDireccion === codDireccion && a.anio === anio) || null;
      }
      
      return null;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo arancel - POST puede usar FormData
   */
  async crearArancel(datos: CreateArancelDTO): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando arancel:', datos);
      
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('codDireccion', datos.codDireccion.toString());
      formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', (datos.codUsuario || 1).toString());
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
        // NO incluir headers, el navegador los configura automáticamente para FormData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel creado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error('Error al crear el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al crear el arancel');
      throw error;
    }
  }
  
  /**
   * Crea un nuevo arancel usando POST sin autenticación con JSON
   * URL: POST http://26.161.18.122:8080/api/arancel
   * NO requiere autenticación
   */
  async crearArancelSinAuth(datos: CrearArancelApiDTO): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando arancel sin autenticación:', datos);
      
      // Validar que los datos requeridos estén presentes
      if (!datos.anio || !datos.codDireccion || datos.costo === undefined || !datos.codUsuario) {
        throw new Error('Faltan datos requeridos para crear el arancel');
      }

      // IMPORTANTE: Asegurar que codArancel siempre sea null
      const datosParaEnviar = {
        codArancel: null, // FORZAR a null - SQL lo asigna automáticamente
        anio: Number(datos.anio), // Asegurar que sea número
        codDireccion: Number(datos.codDireccion), // Asegurar que sea número
        costo: Number(datos.costo), // Asegurar que sea número
        codUsuario: Number(datos.codUsuario) // Asegurar que sea número
      };

      // Ejemplo de datos válidos para comparar con Postman:
      console.log('📋 [ArancelService] Ejemplo válido para Postman:');
      console.log(`{
  "codArancel": null,
  "anio": ${datosParaEnviar.anio},
  "codDireccion": ${datosParaEnviar.codDireccion},
  "costo": ${datosParaEnviar.costo},
  "codUsuario": ${datosParaEnviar.codUsuario}
}`);
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      console.log('📡 [ArancelService] URL para crear:', url);
      console.log('📡 [ArancelService] Datos a enviar (con codArancel null):', datosParaEnviar);
      console.log('📡 [ArancelService] JSON stringificado a enviar:', JSON.stringify(datosParaEnviar, null, 2));
      
      // Petición POST sin autenticación usando JSON
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datosParaEnviar)
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [ArancelService] Arancel creado exitosamente:', responseData);
      
      // Normalizar la respuesta según la estructura esperada
      const arancelCreado: ArancelData = {
        codArancel: responseData.codArancel || responseData.id || null,
        anio: responseData.anio || datos.anio,
        codDireccion: responseData.codDireccion || datos.codDireccion,
        costo: responseData.costo || datos.costo,
        codUsuario: responseData.codUsuario || datos.codUsuario,
        costoArancel: responseData.costo || datos.costo // Mapear costo a costoArancel
      };
      
      console.log('✅ [ArancelService] Arancel normalizado:', arancelCreado);
      return arancelCreado;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error creando arancel sin auth:', error);
      console.error('❌ [ArancelService] Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Helper para crear un arancel con valores por defecto
   * Facilita la creación proporcionando valores comunes sin autenticación
   * 
   * @example
   * // Ejemplo de uso:
   * arancelService.crearArancelConDefaults({
   *   anio: 2019,
   *   codDireccion: 1,
   *   costo: 100.8,
   *   codUsuario: 1
   * });
   */
  crearArancelConDefaults(datos: {
    anio: number;
    codDireccion: number;
    costo: number;
    codUsuario?: number;
  }): Promise<ArancelData> {
    // IMPORTANTE: codArancel SIEMPRE debe ser null - SQL lo asigna automáticamente
    const arancelCompleto: CrearArancelApiDTO = {
      codArancel: null, // SIEMPRE null - asignado por SQL
      anio: datos.anio,
      codDireccion: datos.codDireccion,
      costo: datos.costo,
      codUsuario: datos.codUsuario || 1
    };

    console.log('🔨 [ArancelService] Helper - Creando con valores por defecto:', arancelCompleto);
    return this.crearArancelSinAuth(arancelCompleto);
  }

  /**
   * Actualiza un arancel - PUT requiere FormData
   * IMPORTANTE: Usar URL completa para evitar problemas con proxy
   */
  async actualizarArancel(codArancel: number, datos: UpdateArancelDTO): Promise<ArancelData> {
    try {
      console.log('📝 [ArancelService] Actualizando arancel:', codArancel, datos);
      
      // IMPORTANTE: Usar FormData, no JSON
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.codDireccion !== undefined) formData.append('codDireccion', datos.codDireccion.toString());
      if (datos.costoArancel !== undefined) formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', '1');
      
      console.log('📡 [ArancelService] Enviando FormData para actualización');
      
      // IMPORTANTE: Usar URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`;
      console.log('🌐 [ArancelService] URL completa:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        body: formData
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: response.url
        });
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      console.log('✅ [ArancelService] Respuesta:', responseData);
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel actualizado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error(responseData.message || 'Error al actualizar el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error completo:', error);
      console.error('❌ [ArancelService] Stack:', error.stack);
      NotificationService.error(error.message || 'Error al actualizar el arancel');
      throw error;
    }
  }
  
  /**
   * Elimina un arancel
   */
  async eliminarArancel(codArancel: number): Promise<void> {
    try {
      console.log('🗑️ [ArancelService] Eliminando arancel:', codArancel);
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      NotificationService.success('Arancel eliminado exitosamente');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al eliminar el arancel');
      throw error;
    }
  }
}

// Exportar la instancia singleton
const arancelService = ArancelService.getInstance();
export default arancelService;

// También exportar la clase para tests
export { ArancelService };