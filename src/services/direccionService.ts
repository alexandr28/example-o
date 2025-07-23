// src/services/direccionService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interface para los datos de dirección
 */
export interface DireccionData {
  id: number;
  codigo?: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateDireccionDTO extends Partial<CreateDireccionDTO> {
  estado?: string;
}

export interface BusquedaDireccionParams {
  codigoSector?: number;
  codigoBarrio?: number;
  codigoCalle?: number;
  nombreVia?: string;
  parametrosBusqueda?: string;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de direcciones
 * NO requiere autenticación
 */
class DireccionService extends BaseApiService<DireccionData, CreateDireccionDTO, UpdateDireccionDTO> {
  private static instance: DireccionService;
  
  private constructor() {
    super(
      '/api/direccion',
      {
        normalizeItem: (item: any) => ({
          // Mapeo correcto basado en la respuesta real de la API
          id: item.codDireccion || item.id || 0,
          codigo: item.codDireccion || item.codigo,
          codigoSector: item.codSector || item.codigoSector || 0,
          codigoBarrio: item.codBarrio || item.codigoBarrio || 0,
          codigoCalle: item.codVia || item.codigoCalle || 0,
          nombreSector: item.nombreSector || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreCalle: item.nombreVia || item.nombreCalle || '',
          nombreVia: item.nombreVia || '',
          nombreTipoVia: item.nombreTipoVia || 'CALLE',
          cuadra: item.cuadra?.toString() || '',
          lado: item.lado || 'D',
          loteInicial: parseInt(item.loteInicial || '1'),
          loteFinal: parseInt(item.loteFinal || '1'),
          descripcion: item.descripcion || 
            `${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} ${item.cuadra ? `CUADRA ${item.cuadra}` : ''}`.trim(),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: DireccionData) => {
          // Validación mínima para aceptar más registros
          return !!item.id;
        }
      },
      'direccion_cache'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): DireccionService {
    if (!DireccionService.instance) {
      DireccionService.instance = new DireccionService();
    }
    return DireccionService.instance;
  }
  
  /**
   * Sobrescribe el método getAll para manejar correctamente las peticiones sin autenticación
   */
  async getAll(params?: any): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Obteniendo todas las direcciones');
      
      // Construir URL con query parameters
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros requeridos para form-data
      queryParams.append('parametrosBusqueda', params?.parametrosBusqueda || 'a');
      queryParams.append('codUsuario', '1');
      
      // Agregar otros parámetros si existen
      if (params?.estado) {
        queryParams.append('estado', params.estado);
      }
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}/listarDireccionPorNombreVia?${queryParams.toString()}`;
      console.log('📡 [DireccionService] GET:', url);
      
      // Petición directa sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization
          // NO incluir Content-Type en GET
        }
      });
      
      console.log('📡 [DireccionService] Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DireccionService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [DireccionService] Datos recibidos:', responseData);
      
      // Manejar la estructura de respuesta
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        console.log('📊 [DireccionService] Normalizando', data.length, 'direcciones');
        
        // Normalizar los datos según la estructura real de la API
        const direccionesNormalizadas = data.map((item: any) => ({
          id: item.codDireccion || 0,
          codigo: item.codDireccion || 0,
          codigoSector: item.codSector || 0,
          codigoBarrio: item.codBarrio || 0,
          codigoCalle: item.codVia || 0,
          nombreSector: item.nombreSector || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreCalle: item.nombreVia || '',
          nombreVia: item.nombreVia || '',
          nombreTipoVia: item.nombreTipoVia || 'CALLE',
          cuadra: item.cuadra?.toString() || '',
          lado: item.lado || '-',
          loteInicial: parseInt(item.loteInicial || '0'),
          loteFinal: parseInt(item.loteFinal || '0'),
          descripcion: `${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} ${item.cuadra ? `CUADRA ${item.cuadra}` : ''}`.trim(),
          estado: 'ACTIVO'
        }));
        
        return direccionesNormalizadas;
      }
      
      // Si la respuesta es directamente un array
      if (Array.isArray(responseData)) {
        return this.normalizeData(responseData);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error completo:', error);
      // NO lanzar el error, devolver array vacío para que el componente use datos de ejemplo
      return [];
    }
  }
  
  /**
   * Obtiene todas las direcciones activas
   */
  async obtenerTodos(): Promise<DireccionData[]> {
    try {
      const params = { 
        estado: 'ACTIVO',
        parametrosBusqueda: 'a' // Para obtener todas
      };
      const direcciones = await this.getAll(params);
      console.log(`✅ [DireccionService] obtenerTodos: ${direcciones.length} direcciones`);
      return direcciones;
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      // Devolver array vacío en caso de error
      return [];
    }
  }
  
  /**
   * Busca direcciones con parámetros específicos
   */
  async buscar(params: BusquedaDireccionParams): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones:', params);
      
      const queryParams = new URLSearchParams();
      queryParams.append('parametrosBusqueda', params.parametrosBusqueda || params.nombreVia || 'a');
      queryParams.append('codUsuario', '1');
      
      if (params.estado) {
        queryParams.append('estado', params.estado);
      }
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}/listarDireccionPorNombreVia?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(data);
      }
      
      return [];
      
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      return [];
    }
  }
  
  /**
   * Busca direcciones por nombre de vía
   */
  async buscarPorNombreVia(nombreVia: string): Promise<DireccionData[]> {
    try {
      if (!nombreVia || nombreVia.length < 1) {
        // Si no hay término de búsqueda, devolver todas
        return await this.obtenerTodos();
      }
      
      const params: BusquedaDireccionParams = {
        parametrosBusqueda: nombreVia.trim(),
        estado: 'ACTIVO'
      };
      
      return await this.buscar(params);
    } catch (error) {
      console.error('Error al buscar por nombre de vía:', error);
      return [];
    }
  }
  
  /**
   * Crea una nueva dirección
   */
  async crearDireccion(datos: CreateDireccionDTO): Promise<DireccionData> {
    try {
      // Validaciones
      if (!datos.codigoSector || !datos.codigoBarrio || !datos.codigoCalle) {
        throw new Error('Debe proporcionar sector, barrio y calle');
      }
      
      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }
      
      // Usar FormData para POST
      const formData = new FormData();
      formData.append('codigoSector', datos.codigoSector.toString());
      formData.append('codigoBarrio', datos.codigoBarrio.toString());
      formData.append('codigoCalle', datos.codigoCalle.toString());
      if (datos.cuadra) formData.append('cuadra', datos.cuadra);
      if (datos.lado) formData.append('lado', datos.lado);
      if (datos.loteInicial) formData.append('loteInicial', datos.loteInicial.toString());
      if (datos.loteFinal) formData.append('loteFinal', datos.loteFinal.toString());
      if (datos.descripcion) formData.append('descripcion', datos.descripcion);
      formData.append('codUsuario', '1');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const direcciones = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(direcciones)[0];
      }
      
      throw new Error('Error al crear la dirección');
      
    } catch (error) {
      console.error('Error al crear dirección:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección existente
   */
  async actualizarDireccion(id: number, datos: UpdateDireccionDTO): Promise<DireccionData> {
    try {
      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }
      
      // Usar FormData para PUT
      const formData = new FormData();
      if (datos.codigoSector) formData.append('codigoSector', datos.codigoSector.toString());
      if (datos.codigoBarrio) formData.append('codigoBarrio', datos.codigoBarrio.toString());
      if (datos.codigoCalle) formData.append('codigoCalle', datos.codigoCalle.toString());
      if (datos.cuadra) formData.append('cuadra', datos.cuadra);
      if (datos.lado) formData.append('lado', datos.lado);
      if (datos.loteInicial) formData.append('loteInicial', datos.loteInicial.toString());
      if (datos.loteFinal) formData.append('loteFinal', datos.loteFinal.toString());
      if (datos.descripcion) formData.append('descripcion', datos.descripcion);
      if (datos.estado) formData.append('estado', datos.estado);
      formData.append('codUsuario', '1');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const direcciones = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(direcciones)[0];
      }
      
      throw new Error('Error al actualizar la dirección');
      
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una dirección (cambio de estado lógico)
   */
  async eliminarDireccion(id: number): Promise<void> {
    try {
      await this.actualizarDireccion(id, {
        estado: 'INACTIVO'
      });
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      throw error;
    }
  }
}

// Exportar la instancia singleton
const direccionService = DireccionService.getInstance();
export default direccionService;