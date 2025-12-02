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
  manzana?: string;
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
  codigoBarrio?: number | null;
  codigoCalle?: number | null;  // codVia en el API
  cuadra?: number | null;       // Ahora es number en el API
  manzana?: string | null;
  lado?: string;                // Se convierte a codLado (8101=PAR, 8102=IMPAR, 8103=NINGUNO)
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  codUsuario?: number;
  ruta?: number;                // codRuta en el API
  zona?: number;                // codZona en el API
  ubicacionAreaVerde?: number;  // codUbicacionAreaVerde en el API
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
          manzana: item.manzana?.toString() || '',
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
  /**
   * Lista direcciones usando query params - NO requiere autenticación
   * URL: GET http://26.161.18.122:8085/api/direccion?parametrosBusqueda=b&codUsuario=3
   */
  async getAll(params?: any): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Obteniendo todas las direcciones con params:', params);

      // Construir URL con query parameters
      const queryParams = new URLSearchParams();

      // parametrosBusqueda (por defecto 'a' para traer todas)
      queryParams.append('parametrosBusqueda', params?.parametrosBusqueda || 'a');

      // codUsuario siempre se envía (requerido)
      queryParams.append('codUsuario', String(params?.codUsuario || 3));

      // Endpoint: /api/direccion con query params
      const url = `${API_CONFIG.baseURL}${this.endpoint}?${queryParams.toString()}`;
      console.log('📡 [DireccionService] GET:', url);
      console.log('📋 [DireccionService] Ejemplo: http://26.161.18.122:8085/api/direccion?parametrosBusqueda=b&codUsuario=3');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO requiere autenticación
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
      console.log('✅ [DireccionService] Tiene success?', responseData.success);
      console.log('✅ [DireccionService] Tiene data?', responseData.data);
      console.log('✅ [DireccionService] Tipo de datos:', Array.isArray(responseData) ? 'Array' : typeof responseData);

      // Manejar la estructura de respuesta con wrapper (success/data) - PRIMERO
      if (responseData && typeof responseData === 'object' && responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        console.log('📊 [DireccionService] Usando estructura con wrapper, normalizando', data.length, 'direcciones');

        if (data.length > 0) {
          console.log('✅ [DireccionService] Primer item del wrapper:', data[0]);
        }

        if (data.length === 0) {
          console.log('⚠️ [DireccionService] API retornó array vacío - no hay direcciones registradas');
          return [];
        }

        // Normalizar según la estructura del API /listarDireccion
        const direccionesNormalizadas = data.map((item: any) => ({
          id: item.codDireccion || 0,
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
          cuadra: item.cuadra !== null && item.cuadra !== undefined ? item.cuadra.toString() : '',
          manzana: item.manzana !== null && item.manzana !== undefined ? item.manzana.toString() : '',
          lado: item.codLado === 8101 ? 'PAR' : item.codLado === 8102 ? 'IMPAR' : item.codLado === 8103 ? 'NINGUNO' : '',
          loteInicial: item.loteInicial || undefined,
          loteFinal: item.loteFinal || undefined,
          descripcion: item.direccionCompleta || '',
          estado: 'ACTIVO',
          ruta: item.codRuta || undefined,
          zona: item.codZona || undefined,
          rutaNombre: item.ruta || '',
          zonaNombre: item.zona || ''
        }));

        console.log('✅ [DireccionService] Direcciones normalizadas:', direccionesNormalizadas.length);
        if (direccionesNormalizadas.length > 0) {
          console.log('✅ [DireccionService] Primera dirección normalizada:', direccionesNormalizadas[0]);
        }

        return direccionesNormalizadas;
      }

      // Si la respuesta es directamente un array (sin wrapper)
      if (Array.isArray(responseData)) {
        console.log('✅ [DireccionService] Cantidad de registros (array directo):', responseData.length);

        if (responseData.length > 0) {
          console.log('✅ [DireccionService] Primer item del array:', responseData[0]);
        }

        if (responseData.length === 0) {
          console.log('⚠️ [DireccionService] API retornó array vacío - no hay direcciones registradas');
          return [];
        }

        console.log('📊 [DireccionService] Normalizando', responseData.length, 'direcciones (array directo)');

        // Normalizar según la estructura del API /listarDireccion
        const direccionesNormalizadas = responseData.map((item: any) => ({
          id: item.codDireccion || 0,
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
          cuadra: item.cuadra !== null && item.cuadra !== undefined ? item.cuadra.toString() : '',
          manzana: item.manzana !== null && item.manzana !== undefined ? item.manzana.toString() : '',
          lado: item.codLado === 8101 ? 'PAR' : item.codLado === 8102 ? 'IMPAR' : item.codLado === 8103 ? 'NINGUNO' : '',
          loteInicial: item.loteInicial || undefined,
          loteFinal: item.loteFinal || undefined,
          descripcion: item.direccionCompleta || '',
          estado: 'ACTIVO',
          ruta: item.codRuta || undefined,
          zona: item.codZona || undefined,
          rutaNombre: item.ruta || '',
          zonaNombre: item.zona || ''
        }));

        console.log('✅ [DireccionService] Direcciones normalizadas:', direccionesNormalizadas.length);
        if (direccionesNormalizadas.length > 0) {
          console.log('✅ [DireccionService] Primera dirección normalizada:', direccionesNormalizadas[0]);
        }

        return direccionesNormalizadas;
      }

      console.log('⚠️ [DireccionService] Estructura de respuesta no reconocida, retornando array vacío');
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error completo:', error);
      // NO lanzar el error, devolver array vacío para que el componente use datos de ejemplo
      return [];
    }
  }
  
  /**
   * Obtiene todas las direcciones activas
   * URL: GET http://26.161.18.122:8085/api/direccion?parametrosBusqueda=a&codUsuario=3
   */
  async obtenerTodos(): Promise<DireccionData[]> {
    try {
      const params = {
        estado: 'ACTIVO',
        parametrosBusqueda: 'a',
        codUsuario: 3
      };
      const direcciones = await this.getAll(params);
      console.log(`✅ [DireccionService] obtenerTodos: ${direcciones.length} direcciones`);
      return direcciones;
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      return [];
    }
  }
  
  /**
   * Busca direcciones con parámetros específicos
   * URL: GET http://26.161.18.122:8085/api/direccion?parametrosBusqueda=b&codUsuario=3
   */
  async buscar(params: BusquedaDireccionParams): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('parametrosBusqueda', params.parametrosBusqueda || params.nombreVia || 'a');
      queryParams.append('codUsuario', String(params.codUsuario || 3));

      if (params.estado) {
        queryParams.append('estado', params.estado);
      }

      const url = `${API_CONFIG.baseURL}${this.endpoint}?${queryParams.toString()}`;
      console.log('📡 [DireccionService] GET buscar:', url);

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
   * POST http://26.161.18.122:8085/api/direccion sin autenticación
   * JSON: { codSector, codBarrio, codVia, cuadra, manzana, codLado, loteInicial, loteFinal, codZona, codRuta, codUbicacionAreaVerde, parametroBusqueda, codUsuario }
   */
  async crearDireccion(datos: CreateDireccionDTO): Promise<DireccionData> {
    try {
      console.log('🔍 [DireccionService] Creando dirección con datos:', datos);

      // Validaciones
      if (!datos.codigoSector) {
        throw new Error('Debe proporcionar el sector');
      }

      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }

      // Convertir lado a código (8101=PAR, 8102=IMPAR, 8103=NINGUNO)
      const codLado = datos.lado === 'PAR' ? 8101 : datos.lado === 'IMPAR' ? 8102 : 8103;

      // Construir el request según el nuevo formato del API
      const requestData = {
        codSector: datos.codigoSector,
        codBarrio: (datos.codigoBarrio && datos.codigoBarrio > 0) ? datos.codigoBarrio : null,
        codVia: datos.codigoCalle || null,
        cuadra: datos.cuadra || null,
        manzana: datos.manzana && datos.manzana.trim() !== '' ? datos.manzana.trim() : null,
        codLado: codLado,
        loteInicial: datos.loteInicial || 1,
        loteFinal: datos.loteFinal || 20,
        codZona: datos.zona || null,
        codRuta: datos.ruta || null,
        codUbicacionAreaVerde: datos.ubicacionAreaVerde || null,
        parametroBusqueda: null,
        codUsuario: datos.codUsuario || 1
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

      console.log('📡 [DireccionService] Response status:', response.status);
      console.log('📡 [DireccionService] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DireccionService] Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Try to parse response
      let responseData;
      const contentType = response.headers.get('content-type');
      console.log('📡 [DireccionService] Content-Type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('📡 [DireccionService] Respuesta JSON parseada:', responseData);
      } else {
        // If response is not JSON, it might be a simple text or number (ID)
        const responseText = await response.text();
        console.log('📡 [DireccionService] Respuesta no JSON (texto):', responseText);

        // If we get a number, it's likely the ID of the created direccion
        const possibleId = parseInt(responseText);
        if (!isNaN(possibleId) && possibleId > 0) {
          console.log('✅ [DireccionService] ID de dirección creada:', possibleId);
          // Return a basic direccion object with the new ID
          return {
            id: possibleId,
            codigo: possibleId,
            codigoSector: datos.codigoSector,
            codigoBarrio: datos.codigoBarrio,
            codigoCalle: datos.codigoCalle,
            cuadra: datos.cuadra,
            manzana: datos.manzana,
            lado: datos.lado,
            loteInicial: datos.loteInicial,
            loteFinal: datos.loteFinal,
            estado: 'ACTIVO'
          } as DireccionData;
        } else {
          // If it's just a success message or something else
          console.log('✅ [DireccionService] Respuesta exitosa (no numérica):', responseText);
          return {
            id: Date.now(),
            codigo: Date.now(),
            codigoSector: datos.codigoSector,
            codigoBarrio: datos.codigoBarrio,
            codigoCalle: datos.codigoCalle,
            cuadra: datos.cuadra,
            manzana: datos.manzana,
            lado: datos.lado,
            loteInicial: datos.loteInicial,
            loteFinal: datos.loteFinal,
            estado: 'ACTIVO'
          } as DireccionData;
        }
      }

      // Handle different response structures
      if (responseData) {
        // If response has success and data properties
        if (responseData.success && responseData.data) {
          console.log('✅ [DireccionService] Estructura con success/data');
          const direcciones = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
          const normalized = this.normalizeData(direcciones);
          if (normalized && normalized.length > 0) {
            return normalized[0];
          }
          console.warn('⚠️ [DireccionService] normalizeData devolvió array vacío, creando objeto manual');
        }

        // If response is directly the data
        if (responseData.codDireccion || responseData.id) {
          console.log('✅ [DireccionService] Estructura directa con codDireccion/id');
          const normalized = this.normalizeData([responseData]);
          if (normalized && normalized.length > 0) {
            return normalized[0];
          }
          console.warn('⚠️ [DireccionService] normalizeData devolvió array vacío, creando objeto manual');
        }

        // If response is an array
        if (Array.isArray(responseData) && responseData.length > 0) {
          console.log('✅ [DireccionService] Estructura de array');
          const normalized = this.normalizeData(responseData);
          if (normalized && normalized.length > 0) {
            return normalized[0];
          }
          console.warn('⚠️ [DireccionService] normalizeData devolvió array vacío, creando objeto manual');
        }

        // If response has success: true (even without data)
        if (responseData.success === true) {
          console.log('✅ [DireccionService] Respuesta con success: true (sin data explícita)');
          return {
            id: Date.now(),
            codigo: Date.now(),
            codigoSector: datos.codigoSector,
            codigoBarrio: datos.codigoBarrio,
            codigoCalle: datos.codigoCalle,
            cuadra: datos.cuadra,
            manzana: datos.manzana,
            lado: datos.lado,
            loteInicial: datos.loteInicial,
            loteFinal: datos.loteFinal,
            estado: 'ACTIVO'
          } as DireccionData;
        }
      }

      // If we reach here but the status was OK, assume success
      console.log('✅ [DireccionService] Respuesta exitosa pero estructura no reconocida, asumiendo éxito');
      return {
        id: Date.now(), // Temporary ID
        codigo: Date.now(),
        codigoSector: datos.codigoSector,
        codigoBarrio: datos.codigoBarrio,
        codigoCalle: datos.codigoCalle,
        cuadra: datos.cuadra,
        manzana: datos.manzana,
        lado: datos.lado,
        loteInicial: datos.loteInicial,
        loteFinal: datos.loteFinal,
        estado: 'ACTIVO'
      } as DireccionData;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      console.error('❌ [DireccionService] Error message:', error?.message);
      console.error('❌ [DireccionService] Error stack:', error?.stack);
      throw new Error(`Error al crear dirección: ${error?.message || 'Error desconocido'}`);
    }
  }
  
  /**
   * Actualiza una dirección existente
   * PUT http://26.161.18.122:8085/api/direccion sin autenticación
   * Soporta dos formatos: con barrio y sin barrio
   */
  async actualizarDireccion(id: number, datos: UpdateDireccionDTO): Promise<DireccionData> {
    try {
      console.log('🔍 [DireccionService] Actualizando dirección:', id, datos);

      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }

      // Convertir lado a código
      const codLado = datos.lado === 'PAR' ? 8101 : datos.lado === 'IMPAR' ? 8102 : 8103;

      // Determinar si tiene barrio o no
      const tieneBarrio = datos.codigoBarrio && datos.codigoBarrio > 0;

      let requestData: any;

      if (tieneBarrio) {
        // Método PUT con Barrio
        requestData = {
          codDireccion: id,
          codSector: null,
          codBarrio: datos.codigoBarrio,
          codVia: datos.codigoCalle,
          cuadra: datos.cuadra && datos.cuadra.trim() !== '' ? parseInt(datos.cuadra) : null,
          manzana: datos.manzana && datos.manzana.trim() !== '' ? datos.manzana.trim() : null,
          codLado: codLado,
          loteInicial: datos.loteInicial || 1,
          loteFinal: datos.loteFinal || 30,
          codZona: datos.zona,
          codRuta: datos.ruta,
          codUbicacionAreaVerde: datos.ubicacionAreaVerde || 1,
          parametroBusqueda: null,
          codUsuario: datos.codUsuario || 1
        };
      } else {
        // Método PUT sin Barrio
        requestData = {
          codDireccion: id,
          codSector: datos.codigoSector,
          codBarrio: null,
          codVia: datos.codigoCalle,
          cuadra: datos.cuadra && datos.cuadra.trim() !== '' ? parseInt(datos.cuadra) : null,
          manzana: datos.manzana && datos.manzana.trim() !== '' ? datos.manzana.trim() : null,
          codLado: codLado,
          loteInicial: datos.loteInicial || 1,
          loteFinal: datos.loteFinal || 30,
          codZona: datos.zona,
          codRuta: datos.ruta,
          codUbicacionAreaVerde: datos.ubicacionAreaVerde || 1,
          parametroBusqueda: null,
          codUsuario: datos.codUsuario || 1
        };
      }

      console.log('📡 [DireccionService] Enviando PUT a:', `${API_CONFIG.baseURL}${this.endpoint}`);
      console.log('📡 [DireccionService] Tipo:', tieneBarrio ? 'CON BARRIO' : 'SIN BARRIO');
      console.log('📡 [DireccionService] Datos a enviar:', requestData);

      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'PUT',
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
        // If response is not JSON, assume success
        const responseText = await response.text();
        console.log('📡 [DireccionService] Respuesta no JSON:', responseText);

        return {
          id: id,
          codigo: id,
          codigoSector: datos.codigoSector || 0,
          codigoBarrio: datos.codigoBarrio || 0,
          codigoCalle: datos.codigoCalle || 0,
          cuadra: datos.cuadra,
          manzana: datos.manzana,
          lado: datos.lado,
          loteInicial: datos.loteInicial,
          loteFinal: datos.loteFinal,
          estado: datos.estado || 'ACTIVO'
        } as DireccionData;
      }

      console.log('📡 [DireccionService] Respuesta recibida:', responseData);

      if (responseData.success && responseData.data) {
        const direcciones = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(direcciones)[0];
      }

      // If response has the data directly
      if (responseData.codDireccion || responseData.id) {
        return this.normalizeData([responseData])[0];
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