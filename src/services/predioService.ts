// src/services/predioService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

import { CondicionPropiedad, EstadoPredio, TipoPredio, UsoPredio } from '@/models/Predio';


/**
 * Mapea la respuesta de la API al modelo interno
 */

export interface PredioData {
  anio?: number;
  codPredio?: string;
  numeroFinca?: string;
  otroNumero?: string;
  codClasificacion?: string;
  estPredio?: string;
  codTipoPredio?: string;
  codCondicionPropiedad?: string;
  codDireccion?: string;
  codUsoPredio?: string;
  fechaAdquisicion?: string;
  numeroCondominos?: string;
  codListaConductor?: string;
  codUbicacionAreaVerde?: string;
  areaTerreno: number;
  numeroPisos?: number;
  totalAreaConstruccion?: number;
  valorTotalConstruccion?: number;
  valorTerreno?: number;
  autoavaluo?: number;
  codEstado?: string;
  codUsuario?: number;
  direccion?: string;
  conductor?: string;
  estadoPredio?: string;
  condicionPropiedad?: string;
}
/**
 * DTOs para crear y actualizar predios
 */
export interface CreatePredioDTO {
  anio?: number;
  codPredio?: string;
  numeroFinca?: string;
  otroNumero?: string;
  codClasificacion?: string;
  estPredio?: string;
  codTipoPredio?: string;
  codCondicionPropiedad?: string;
  codDireccion?: string;
  codUsoPredio?: string;
  fechaAdquisicion?: string;
  numeroCondominos?: string;
  codListaConductor?: string;
  codUbicacionAreaVerde?: string;
  areaTerreno: number;
  numeroPisos?: number;
  totalAreaConstruccion?: number;
  valorTotalConstruccion?: number;
  valorTerreno?: number;
  autoavaluo?: number;
  codEstado?: string;
  codUsuario?: number;
  
}

export interface UpdatePredioDTO extends Partial<CreatePredioDTO> {}

export interface BusquedaPredioParams {
  codPredio?: string;
  anio?: number;
  direccion?: number;
}

/**
 * Respuesta de la API
 */
interface PredioApiListResponse {
  success: boolean;
  message: string;
  data: PredioData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestión de predios con form-data
 */
class PredioService extends BaseApiService<PredioData, CreatePredioDTO, UpdatePredioDTO> {
  private static instance: PredioService;
  
  private constructor() {
    super(
      '/api/predio',
      {
        normalizeItem: (item: any) => ({
         
            anio: item.anio,
            codPredio: item.codPredio || null,
            numeroFinca: item.numeroFinca,
            otroNumero: item.otroNumero,
            codClasificacion: item.codClasificacion,
            estPredio: item.estPredio,
            codTipoPredio: item.codTipoPredio,
            codCondicionPropiedad: item.codCondicionPropiedad,
            codDireccion: item.codDireccion,
            codUsoPredio: item.codUsoPredio,
            fechaAdquisicion: item.fechaAdquisicion,
            numeroCondominos: item.numeroCondominos,
            codListaConductor: item.codListaConductor,
            codUbicacionAreaVerde: item.codUbicacionAreaVerde,
            areaTerreno: parseFloat(item.areaTerreno?.toString() || '0'),
            numeroPisos: item.numeroPisos,
            totalAreaConstruccion: item.totalAreaConstruccion,
            valorTotalConstruccion: item.valorTotalConstruccion,
            valorTerreno: item.valorTerreno,
            autoavaluo: item.autoavaluo || null,
            codEstado: item.codEstado,
            codUsuario: item.codUsuario || null,
            direccion: item.direccion,
            conductor: item.conductor,
            estadoPredio: item.estadoPredio,
            condicionPropiedad: item.condicionPropiedad,
          }),

          validateItem: (item: PredioData) => {
          return !!(
            item.codPredio && 
            item.areaTerreno >= 0
          );
        }
      },
      'predios' // cacheKey
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
   * La API requiere parámetros específicos incluso para listar todos
   */
  async obtenerPredios(anio?: number): Promise<PredioData[]> {
    try {
      console.log('📋 [PredioService] Obteniendo todos los predios');
      
    
      
      // Agregar parámetros por defecto que la API podría esperar
      //queryParams.append('codUsuario', '1');
      // Si necesita más parámetros, agregarlos aquí
      
      let url = `${API_CONFIG.baseURL}${this.endpoint}`;
     
      const params= new URLSearchParams({
        codPredio: '20241',
        anio: anio?.toString() || '2024',
        codDireccion: '2'
      });
      url += `?${params.toString()}`; 
      console.log('📡 [PredioService] GET:', url);
      
      //Peticion directa sin autenticacion
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Intentar con diferentes headers que podrían ser necesarios
          // NO incluir Authorization
          // NO incluir Content-Type en GET
          
        }
        // NO incluir body en GET
      });
      
      console.log('📡 [PredioService] Response Status:', response.status);
      console.log('📡 [PredioService] Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('❌ [PredioService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        // Intentar leer el body del error
        const errorText = await response.text();
        console.error('❌ [PredioService] Error Body:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: PredioApiListResponse = await response.json();
      console.log('✅ [PredioService] Datos recibidos:', responseData);
      
      
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(data);
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [PredioService] Error:', error);
      
      
    }
    return PredioService.instance.normalizeData([]);
  }

  
  
  /**
   * Busca predios con filtros
   * Intenta primero con GET/query params
   */
  async buscarPredios(params: BusquedaPredioParams): Promise<PredioData[]> {
    try {
      console.log('🔍 [PredioService] Buscando predios con parámetros:', params);
      
      // Primero intentar con query parameters
      const queryParams = new URLSearchParams();
      
      if (params.codPredio) {
        queryParams.append('codPredio', params.codPredio);
      }
      if (params.anio) {
        queryParams.append('anio', params.anio.toString());
      }
      if (params.direccion) {
        queryParams.append('direccion', params.direccion.toString());
      }
      queryParams.append('codUsuario', '1');
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}?${queryParams.toString()}`;
      console.log('📡 [PredioService] Intentando GET:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          
        }
      });
      
      if (!response.ok) {
        console.error('❌ [PredioService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        throw new Error(`Error ${response.status}`);
      }
      
      const data: PredioApiListResponse = await response.json();
      
      if (data.success && data.data) {
        return data.data.map(item => (item));
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [PredioService] Error:', error);
      throw error;
    }
  }


  
  /**
   * Obtiene un predio por su código
   */
  async obtenerPredioPorCodigo(codigoPredio: string): Promise<PredioData | null> {
    try {
      console.log('🔍 [PredioService] Obteniendo predio:', codigoPredio);
      
      // Usar directamente POST con form-data
      const formData = new FormData();
      formData.append('codPredio', codigoPredio);
      formData.append('codUsuario', '1');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data: PredioApiListResponse = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const predio = (data.data[0]);
        console.log('✅ [PredioService] Predio encontrado');
        return predio;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ [PredioService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene predios por año usando form-data
   */
  async obtenerPrediosPorAnio(anio: number): Promise<PredioData[]> {
    return this.buscarPredios({ anio });
  }
  
  /**
   * Obtiene predios por dirección usando form-data
   */
  async obtenerPrediosPorDireccion(direccionId: number): Promise<PredioData[]> {
    return this.buscarPredios({ direccion: direccionId });
  }
  
  /**
   * Crea un nuevo predio
   * REQUIERE autenticación (método POST)
   */
  async crearPredio(datos: CreatePredioDTO): Promise<PredioData> {
    try {
      console.log('➕ [PredioService] Creando nuevo predio:', datos);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear predios');
      }
      
      const datosCompletos: CreatePredioDTO = {
        ...datos,
        anio: datos.anio || new Date().getFullYear(),
        codCondicionPropiedad: datos.codCondicionPropiedad || CondicionPropiedad.PROPIETARIO_UNICO,
        codEstado: datos.codEstado || EstadoPredio.TERMINADO,
        codTipoPredio: datos.codTipoPredio || TipoPredio.TERRENO,
        codUsoPredio: datos.codUsoPredio || UsoPredio.TERRENO,
        codDireccion: datos.codDireccion || DireccionPredio.CALLE,
      
        
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
  async actualizarPredio(anio: number, codDireccion: number, datos: UpdatePredioDTO): Promise<PredioData> {
    try {
      console.log('📝 [PredioService] Actualizando predio:',anio, codDireccion, datos);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar predios');
      }
      
      const response = await this.update(anio, codDireccion, datos);
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
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar predios');
      }
      
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
        const estado = predio.estadoPredio || 'SIN_ESTADO';
        estadisticas.porEstado[estado] = (estadisticas.porEstado[estado] || 0) + 1;
        
        const condicion = predio.condicionPropiedad || 'SIN_CONDICION';
        estadisticas.porCondicion[condicion] = (estadisticas.porCondicion[condicion] || 0) + 1;
        
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