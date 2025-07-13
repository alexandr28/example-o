// src/services/predioService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { 
  Predio, 
  PredioApiResponse, 
  mapPredioApiToModel,
  CondicionPropiedad,
  ConductorPredio,
  EstadoPredio
} from '../models/Predio';

/**
 * Interfaces para el servicio de Predio
 */
export interface CreatePredioDTO {
  codContribuyente?: number;
  codDireccion?: number;
  codPredio?: string;
  numeroFinca?: string;
  otroNumero?: string;
  areaTerreno: number;
  fechaAdquisicion?: string | null;
  condicionPropiedad?: string;
  conductor?: string;
  estadoPredio?: string;
  numeroPisos?: number;
  totalAreaConstruccion?: number;
  valorTerreno?: number;
  valorTotalConstruccion?: number;
  autoavaluo?: number;
  codUsuario?: number;
  anio?: number;
}

export interface UpdatePredioDTO extends Partial<CreatePredioDTO> {
  estado?: string;
}

export interface BusquedaPredioParams {
  codigoPredio?: string;
  codContribuyente?: number;
  anio?: number;
  estadoPredio?: string;
  condicionPropiedad?: string;
  codUsuario?: number;
}

/**
 * Respuesta de la API
 */
interface PredioApiListResponse {
  success: boolean;
  message: string;
  data: PredioApiResponse[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestión de predios
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class PredioService extends BaseApiService<Predio, CreatePredioDTO, UpdatePredioDTO> {
  private static instance: PredioService;
  
  private constructor() {
    super(
      API_CONFIG.endpoints.predio,
      {
        normalizeItem: (item: any): Predio => {
          // Si el item ya es un PredioApiResponse, mapearlo
          if (item.codPredio !== undefined) {
            return mapPredioApiToModel(item as PredioApiResponse);
          }
          
          // Si no, intentar normalizar manualmente
          return {
            id: item.id || 0,
            codigoPredio: item.codigoPredio || item.codPredio?.trim() || '',
            anio: item.anio,
            fechaAdquisicion: item.fechaAdquisicion,
            condicionPropiedad: item.condicionPropiedad || CondicionPropiedad.PROPIETARIO_UNICO,
            direccion: item.direccion || '',
            direccionId: item.direccionId || item.codDireccion,
            numeroFinca: item.numeroFinca,
            otroNumero: item.otroNumero,
            conductor: item.conductor || ConductorPredio.PRIVADO,
            estadoPredio: item.estadoPredio || EstadoPredio.TERMINADO,
            areaTerreno: parseFloat(item.areaTerreno?.toString() || '0'),
            numeroPisos: item.numeroPisos,
            totalAreaConstruccion: item.totalAreaConstruccion,
            valorTotalConstruccion: item.valorTotalConstruccion,
            valorTerreno: item.valorTerreno,
            autoavaluo: item.autoavaluo,
            numeroCondominos: item.numeroCondominos,
            estado: item.estado || 'ACTIVO',
            codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
          };
        },
        
        validateItem: (item: Predio) => {
          // Validar que tenga los campos requeridos
          return !!(item.codigoPredio && item.areaTerreno >= 0);
        }
      }
    );
  }
  
  public static getInstance(): PredioService {
    if (!PredioService.instance) {
      PredioService.instance = new PredioService();
    }
    return PredioService.instance;
  }
  
  /**
   * Obtiene todos los predios
   * NO requiere autenticación (método GET)
   */
  async obtenerPredios(): Promise<Predio[]> {
    try {
      console.log('📋 [PredioService] Obteniendo todos los predios');
      
      const response = await this.makeRequest<PredioApiListResponse>('', {
        method: 'GET'
      });
      
      // La respuesta viene en el formato { success, message, data }
      if (response.success && response.data) {
        const predios = response.data.map(item => mapPredioApiToModel(item));
        console.log(`✅ [PredioService] ${predios.length} predios obtenidos`);
        return predios;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo predios:', error);
      throw error;
    }
  }
  
  /**
   * Busca predios con filtros
   * NO requiere autenticación (método GET)
   */
  async buscarPredios(params: BusquedaPredioParams): Promise<Predio[]> {
    try {
      console.log('🔍 [PredioService] Buscando predios con parámetros:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.codigoPredio) {
        queryParams.append('codigoPredio', params.codigoPredio);
      }
      if (params.codContribuyente) {
        queryParams.append('codContribuyente', params.codContribuyente.toString());
      }
      if (params.anio) {
        queryParams.append('anio', params.anio.toString());
      }
      if (params.estadoPredio) {
        queryParams.append('estadoPredio', params.estadoPredio);
      }
      if (params.condicionPropiedad) {
        queryParams.append('condicionPropiedad', params.condicionPropiedad);
      }
      
      const response = await this.makeRequest<PredioApiListResponse>(
        `?${queryParams.toString()}`,
        { method: 'GET' }
      );
      
      if (response.success && response.data) {
        const predios = response.data.map(item => mapPredioApiToModel(item));
        console.log(`✅ [PredioService] ${predios.length} predios encontrados`);
        return predios;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [PredioService] Error buscando predios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un predio por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPredioPorCodigo(codigoPredio: string): Promise<Predio | null> {
    try {
      console.log('🔍 [PredioService] Obteniendo predio:', codigoPredio);
      
      const response = await this.makeRequest<PredioApiListResponse>(
        `?codigoPredio=${codigoPredio}`,
        { method: 'GET' }
      );
      
      if (response.success && response.data && response.data.length > 0) {
        const predio = mapPredioApiToModel(response.data[0]);
        console.log('✅ [PredioService] Predio encontrado:', predio);
        return predio;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo predio:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo predio
   * REQUIERE autenticación (método POST)
   */
  async crearPredio(datos: CreatePredioDTO): Promise<Predio> {
    try {
      console.log('➕ [PredioService] Creando nuevo predio:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear predios');
      }
      
      // Preparar datos con valores por defecto
      const datosCompletos: CreatePredioDTO = {
        ...datos,
        anio: datos.anio || new Date().getFullYear(),
        estadoPredio: datos.estadoPredio || EstadoPredio.TERMINADO,
        condicionPropiedad: datos.condicionPropiedad || CondicionPropiedad.PROPIETARIO_UNICO,
        conductor: datos.conductor || ConductorPredio.PRIVADO,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      const response = await this.create(datosCompletos);
      console.log('✅ [PredioService] Predio creado exitosamente');
      return response;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error creando predio:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un predio existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarPredio(codigoPredio: string, datos: UpdatePredioDTO): Promise<Predio> {
    try {
      console.log('📝 [PredioService] Actualizando predio:', codigoPredio, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar predios');
      }
      
      // El ID para la actualización podría ser el código del predio
      const response = await this.update(codigoPredio, datos);
      console.log('✅ [PredioService] Predio actualizado exitosamente');
      return response;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error actualizando predio:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un predio (cambio de estado lógico)
   * REQUIERE autenticación (método PUT o DELETE)
   */
  async eliminarPredio(codigoPredio: string): Promise<void> {
    try {
      console.log('🗑️ [PredioService] Eliminando predio:', codigoPredio);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar predios');
      }
      
      // Cambiar estado a INACTIVO en lugar de eliminar físicamente
      await this.update(codigoPredio, {
        estado: 'INACTIVO'
      });
      
      console.log('✅ [PredioService] Predio marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error eliminando predio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene predios por contribuyente
   * NO requiere autenticación (método GET)
   */
  async obtenerPrediosPorContribuyente(codContribuyente: number): Promise<Predio[]> {
    try {
      console.log('🔍 [PredioService] Obteniendo predios del contribuyente:', codContribuyente);
      
      return await this.buscarPredios({ codContribuyente });
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo predios por contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de predios
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    porEstado: Record<string, number>;
    porCondicion: Record<string, number>;
    areaTerrenoTotal: number;
    areaConstruidaTotal: number;
  }> {
    try {
      const predios = await this.obtenerPredios();
      
      const estadisticas = {
        total: predios.length,
        porEstado: {} as Record<string, number>,
        porCondicion: {} as Record<string, number>,
        areaTerrenoTotal: 0,
        areaConstruidaTotal: 0
      };
      
      predios.forEach(predio => {
        // Por estado
        const estado = predio.estadoPredio || 'SIN_ESTADO';
        estadisticas.porEstado[estado] = (estadisticas.porEstado[estado] || 0) + 1;
        
        // Por condición
        const condicion = predio.condicionPropiedad || 'SIN_CONDICION';
        estadisticas.porCondicion[condicion] = (estadisticas.porCondicion[condicion] || 0) + 1;
        
        // Áreas
        estadisticas.areaTerrenoTotal += predio.areaTerreno || 0;
        estadisticas.areaConstruidaTotal += predio.totalAreaConstruccion || 0;
      });
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const predioService = PredioService.getInstance();