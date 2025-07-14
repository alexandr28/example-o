// src/services/calleApiService.ts - USANDO ENDPOINT CORRECTO

import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Calle/Via
 */
export interface CalleData {
  codigo: number;
  nombre: string;
  tipo?: string;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateCalleDTO {
  nombre: string;
  tipo?: string;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateCalleDTO extends Partial<CreateCalleDTO> {
  estado?: string;
  fechaModificacion?: string;
}

export interface BusquedaCalleParams {
  nombre?: string;
  tipo?: string;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de calles/vías
 * USA EL ENDPOINT: /api/via/listarVia
 * NO REQUIERE AUTENTICACIÓN
 */
class CalleApiService extends BaseApiService<CalleData, CreateCalleDTO, UpdateCalleDTO> {
  private static instance: CalleApiService;
  
  private constructor() {
    super(
      '/api/via/listarVia', // ← ENDPOINT CORRECTO
      {
        normalizeItem: (item: any) => ({
          codigo: item.codVia || item.codigo || 0,
          nombre: item.nombreVia || item.nombre || '',
          tipo: item.tipoVia || item.tipo || 'CALLE',
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: CalleData) => {
          return !!item.codigo && !!item.nombre && item.nombre.trim().length > 0;
        }
      },
      'calle_cache'
    );
  }
  
  static getInstance(): CalleApiService {
    if (!CalleApiService.instance) {
      CalleApiService.instance = new CalleApiService();
    }
    return CalleApiService.instance;
  }
  
  /**
   * Sobrescribir getAll para manejar el endpoint específico
   */
  async getAll(params?: any): Promise<CalleData[]> {
    try {
      console.log('📋 [CalleApiService] Obteniendo todas las vías');
      
      // El endpoint listarVia puede requerir parámetros específicos
      const queryParams = {
        ...API_CONFIG.defaultParams,
        ...params
      };
      
      return await super.getAll(queryParams);
    } catch (error) {
      console.error('❌ [CalleApiService] Error obteniendo vías:', error);
      throw error;
    }
  }
  
  /**
   * Buscar calles/vías por nombre
   */
  async buscarPorNombre(nombre: string): Promise<CalleData[]> {
    try {
      const params: BusquedaCalleParams = {
        nombre: nombre.trim(),
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [CalleApiService] Error buscando vías:', error);
      throw error;
    }
  }
  
  /**
   * Obtener vías activas
   */
  async obtenerActivas(): Promise<CalleData[]> {
    try {
      return await this.search({ estado: 'ACTIVO' });
    } catch (error: any) {
      console.error('❌ [CalleApiService] Error obteniendo vías activas:', error);
      throw error;
    }
  }
  
  /**
   * Verificar si existe una vía por nombre
   */
  async existePorNombre(nombre: string, excluirId?: number): Promise<boolean> {
    try {
      const vias = await this.buscarPorNombre(nombre);
      
      return vias.some(via => 
        via.nombre.toLowerCase() === nombre.toLowerCase() &&
        (!excluirId || via.codigo !== excluirId)
      );
      
    } catch (error: any) {
      console.error('❌ [CalleApiService] Error verificando existencia:', error);
      return false;
    }
  }
  
  /**
   * NOTA: Los métodos create, update y delete pueden no estar disponibles
   * si el endpoint /api/via/listarVia es solo de lectura
   */
  
  async create(data: CreateCalleDTO): Promise<CalleData> {
    console.warn('⚠️ [CalleApiService] El endpoint listarVia puede no soportar creación');
    throw new Error('Operación no soportada por el endpoint');
  }
  
  async update(id: number, data: UpdateCalleDTO): Promise<CalleData> {
    console.warn('⚠️ [CalleApiService] El endpoint listarVia puede no soportar actualización');
    throw new Error('Operación no soportada por el endpoint');
  }
  
  async delete(id: number): Promise<void> {
    console.warn('⚠️ [CalleApiService] El endpoint listarVia puede no soportar eliminación');
    throw new Error('Operación no soportada por el endpoint');
  }
}

// Exportar instancia singleton
const calleService = CalleApiService.getInstance();
export default calleService;

// Exportar también la clase por si se necesita extender
export { CalleApiService };