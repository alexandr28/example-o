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
  codigoTipoVia?: number;
  codigoBarrioVia?: number;
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
  ruta?: number;
  zona?: number;
  rutaNombre?: string;
  zonaNombre?: string;
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
  ruta?: number;
  zona?: number;
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
          codigoTipoVia: item.codTipoVia || undefined,
          codigoBarrioVia: item.codBarrioVia || undefined,
          nombreSector: item.nombreSector || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreCalle: item.nombreVia || item.nombreCalle || '',
          nombreVia: item.nombreVia || '',
          nombreTipoVia: item.nombreTipoVia || '',
          cuadra: item.cuadra?.toString() || '',
          lado: item.codLado === 8101 ? 'PAR' : item.codLado === 8102 ? 'IMPAR' : 'NINGUNO',
          loteInicial: item.loteInicial ? parseInt(item.loteInicial) : undefined,
          loteFinal: item.loteFinal ? parseInt(item.loteFinal) : undefined,
          descripcion: item.direccionCompleta || 
            `${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} ${item.cuadra ? `CUADRA ${item.cuadra}` : ''}`.trim(),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario,
          ruta: item.codRuta || undefined,
          zona: item.codZona || undefined,
          rutaNombre: item.ruta || '',
          zonaNombre: item.zona || ''
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
      
      // Agregar parámetros requeridos
      queryParams.append('parametrosBusqueda', params?.parametrosBusqueda || 'a');
      queryParams.append('codUsuario', '1');
      
      // Agregar otros parámetros si existen
      if (params?.estado) {
        queryParams.append('estado', params.estado);
      }
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}/listarDireccion?${queryParams.toString()}`;
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
      console.log('✅ [DireccionService] Primer item del array:', responseData[0]);
      
      // Si la respuesta es directamente un array (nueva estructura)
      if (Array.isArray(responseData)) {
        console.log('📊 [DireccionService] Normalizando', responseData.length, 'direcciones');
        
        // Normalizar los datos según la nueva estructura de la API
        const direccionesNormalizadas = responseData.map((item: any) => ({
          id: item.codDireccion || Date.now() + Math.random(),
          codigo: item.codDireccion || 0,
          codigoSector: item.codSector || 0,
          codigoBarrio: item.codBarrio || 0,
          codigoCalle: item.codVia || 0,
          codigoTipoVia: item.codTipoVia || undefined,
          codigoBarrioVia: item.codBarrioVia || undefined,
          nombreSector: item.nombreSector || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreCalle: item.nombreVia || '',
          nombreVia: item.nombreVia || '',
          nombreTipoVia: item.nombreTipoVia || '',
          cuadra: item.cuadra?.toString() || '',
          lado: item.codLado === 8101 ? 'PAR' : item.codLado === 8102 ? 'IMPAR' : 'NINGUNO',
          loteInicial: item.loteInicial || undefined,
          loteFinal: item.loteFinal || undefined,
          descripcion: item.direccionCompleta || '',
          estado: 'ACTIVO',
          ruta: item.codRuta || undefined,
          zona: item.codZona || undefined,
          rutaNombre: item.ruta || '',
          zonaNombre: item.zona || ''
        }));
        
        console.log('✅ [DireccionService] Primera dirección normalizada:', direccionesNormalizadas[0]);
        console.log('✅ [DireccionService] Campos de primera dirección:', Object.keys(direccionesNormalizadas[0]));
        
        return direccionesNormalizadas;
      }
      
      // Manejar la estructura de respuesta antigua (si existe)
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(data);
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
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}/listarDireccion?${queryParams.toString()}`;
      
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
   * POST http://26.161.18.122:8080/api/direccion sin autenticación
   */
  async crearDireccion(datos: CreateDireccionDTO): Promise<DireccionData> {
    try {
      console.log('🔍 [DireccionService] Creando dirección con datos:', datos);
      
      // Validaciones
      if (!datos.codigoSector || !datos.codigoBarrio || !datos.codigoCalle) {
        throw new Error('Debe proporcionar sector, barrio y calle');
      }
      
      if (!datos.ruta) {
        throw new Error('Debe seleccionar una ruta');
      }
      
      if (!datos.zona) {
        throw new Error('Debe seleccionar una zona');
      }
      
      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }
      
      // Preparar datos en formato JSON según el ejemplo proporcionado
      const requestData = {
        codDireccion: null,
        codBarrioVia: datos.codigoBarrio,
        cuadra: datos.cuadra ? parseInt(datos.cuadra) : 1,
        codLado: datos.lado === 'PAR' ? 8101 : datos.lado === 'IMPAR' ? 8102 : 8103, // Mapear lado a código
        loteInicial: datos.loteInicial || 1,
        loteFinal: datos.loteFinal || 20,
        codUsuario: datos.codUsuario || 1,
        codZona: datos.zona || 1,
        codRuta: datos.ruta || 1,
        codVia: datos.codigoCalle,
        codBarrio: datos.codigoBarrio,
        parametroBusqueda: null
      };
      
      console.log('📡 [DireccionService] Enviando POST a:', `${API_CONFIG.baseURL}${this.endpoint}`);
      console.log('📡 [DireccionService] Datos a enviar:', requestData);
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Try to parse response
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // If response is not JSON, it might be a simple text or number (ID)
        const responseText = await response.text();
        console.log('📡 [DireccionService] Respuesta no JSON:', responseText);
        
        // If we get a number, it's likely the ID of the created direccion
        const possibleId = parseInt(responseText);
        if (!isNaN(possibleId) && possibleId > 0) {
          // Return a basic direccion object with the new ID
          return {
            id: possibleId,
            codigo: possibleId,
            codigoSector: datos.codigoSector,
            codigoBarrio: datos.codigoBarrio,
            codigoCalle: datos.codigoCalle,
            cuadra: datos.cuadra,
            lado: datos.lado,
            loteInicial: datos.loteInicial,
            loteFinal: datos.loteFinal,
            estado: 'ACTIVO'
          } as DireccionData;
        }
      }
      
      console.log('📡 [DireccionService] Respuesta recibida:', responseData);
      
      // Handle different response structures
      if (responseData) {
        // If response has success and data properties
        if (responseData.success && responseData.data) {
          const direcciones = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
          return this.normalizeData(direcciones)[0];
        }
        
        // If response is directly the data
        if (responseData.codDireccion || responseData.id) {
          return this.normalizeData([responseData])[0];
        }
        
        // If response is an array
        if (Array.isArray(responseData) && responseData.length > 0) {
          return this.normalizeData(responseData)[0];
        }
      }
      
      // If we reach here but the status was OK, assume success
      console.log('⚠️ [DireccionService] Respuesta exitosa pero estructura no reconocida, asumiendo éxito');
      return {
        id: Date.now(), // Temporary ID
        codigo: Date.now(),
        codigoSector: datos.codigoSector,
        codigoBarrio: datos.codigoBarrio,
        codigoCalle: datos.codigoCalle,
        cuadra: datos.cuadra,
        lado: datos.lado,
        loteInicial: datos.loteInicial,
        loteFinal: datos.loteFinal,
        estado: 'ACTIVO'
      } as DireccionData;
      
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