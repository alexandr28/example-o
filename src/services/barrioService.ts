// src/services/barrioService.ts - VERSIÓN SIN AUTENTICACIÓN

import BaseApiService from './BaseApiService';
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Barrio
 */
export interface BarrioData {
  codigo: number;
  nombre: string;
  codSector?: number;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateBarrioDTO {
  nombreBarrio: string;     // ← API espera nombreBarrio
  codSector: number;        // ← API espera codSector
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateBarrioDTO {
  nombreBarrio?: string;    // ← API espera nombreBarrio
  codSector?: number;
  descripcion?: string;
  estado?: string;
  fechaModificacion?: string;
}

export interface BusquedaBarrioParams {
  nombre?: string;
  codSector?: number;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de barrios
 * NO REQUIERE AUTENTICACIÓN
 */
class BarrioService extends BaseApiService<BarrioData, CreateBarrioDTO, UpdateBarrioDTO> {
  private static instance: BarrioService;
  
  private constructor() {
    super(
      '/api/barrio',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codBarrio || item.codigo || 0,
          nombre: item.nombre || item.nombreBarrio || '',
          codSector: item.codSector || 0,
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: BarrioData) => {
          return !!item.codigo && !!item.nombre && item.nombre.trim().length > 0;
        }
      },
      'barrio_cache'
    );
  }
  
  static getInstance(): BarrioService {
    if (!BarrioService.instance) {
      BarrioService.instance = new BarrioService();
    }
    return BarrioService.instance;
  }
  
  /**
   * Sobrescribir create para manejar la respuesta del servidor
   */
  async create(data: CreateBarrioDTO): Promise<BarrioData> {
    try {
      console.log('📝 [BarrioService] Creando barrio con datos:', data);
      
      // Usar fetch directamente para evitar headers no deseados
      const response = await fetch(buildApiUrl(this.endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO Authorization
        },
        body: JSON.stringify(data)
      });
      
      console.log('📡 Status:', response.status);
      const responseText = await response.text();
      console.log('📡 Respuesta:', responseText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText || response.statusText}`);
      }
      
      // Manejar diferentes tipos de respuesta
      const cleanResponse = responseText.trim().replace(/['"]/g, '');
      
      // Si la respuesta es null o vacía pero el status es OK
      if (cleanResponse === 'null' || cleanResponse === '' || response.ok) {
        console.log('✅ Barrio creado exitosamente');
        
        // Crear objeto con ID temporal
        const tempId = Math.floor(Date.now() / 1000);
        
        const nuevoBarrio: BarrioData = {
          codigo: tempId,
          nombre: data.nombreBarrio,
          codSector: data.codSector,
          descripcion: data.descripcion || '',
          estado: 'ACTIVO',
          fechaRegistro: new Date().toISOString(),
          codUsuario: data.codUsuario || API_CONFIG.defaultParams.codUsuario
        };
        
        this.clearCache();
        return nuevoBarrio;
      }
      
      // Si es un número (ID del barrio creado)
      const responseNumber = parseInt(cleanResponse, 10);
      if (!isNaN(responseNumber) && responseNumber > 0) {
        console.log('✅ Barrio creado con ID:', responseNumber);
        
        const nuevoBarrio: BarrioData = {
          codigo: responseNumber,
          nombre: data.nombreBarrio,
          codSector: data.codSector,
          descripcion: data.descripcion || '',
          estado: 'ACTIVO',
          fechaRegistro: new Date().toISOString(),
          codUsuario: data.codUsuario || API_CONFIG.defaultParams.codUsuario
        };
        
        this.clearCache();
        return nuevoBarrio;
      }
      
      throw new Error('Respuesta inesperada del servidor');
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error al crear:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo barrio
   * Convierte los campos al formato esperado por el API
   */
  async crearBarrio(datos: { 
    nombre: string; 
    codSector: number;
    descripcion?: string 
  }): Promise<BarrioData> {
    try {
      // Validaciones
      if (!datos.nombre || datos.nombre.trim().length === 0) {
        throw new Error('El nombre del barrio es requerido');
      }
      
      if (!datos.codSector || datos.codSector <= 0) {
        throw new Error('Debe seleccionar un sector');
      }
      
      // Convertir al formato del API
      const datosParaAPI: CreateBarrioDTO = {
        nombreBarrio: datos.nombre.trim(),    // ← nombre → nombreBarrio
        codSector: datos.codSector,
        descripcion: datos.descripcion?.trim() || ''
      };
      
      console.log('📤 Enviando al API:', datosParaAPI);
      
      const resultado = await this.create(datosParaAPI);
      
      return resultado;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error creando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un barrio existente
   */
  async actualizarBarrio(id: number, datos: { 
    nombre?: string; 
    codSector?: number;
    descripcion?: string;
    estado?: string;
  }): Promise<BarrioData> {
    try {
      console.log('📝 [BarrioService] Actualizando barrio:', id, datos);
      
      // Validaciones
      if (datos.nombre !== undefined && datos.nombre.trim().length === 0) {
        throw new Error('El nombre del barrio no puede estar vacío');
      }
      
      if (datos.codSector !== undefined && datos.codSector <= 0) {
        throw new Error('El sector no es válido');
      }
      
      // Convertir al formato del API
      const datosParaAPI: UpdateBarrioDTO = {};
      
      if (datos.nombre !== undefined) {
        datosParaAPI.nombreBarrio = datos.nombre.trim();
      }
      if (datos.codSector !== undefined) {
        datosParaAPI.codSector = datos.codSector;
      }
      if (datos.descripcion !== undefined) {
        datosParaAPI.descripcion = datos.descripcion.trim();
      }
      if (datos.estado !== undefined) {
        datosParaAPI.estado = datos.estado;
      }
      
      datosParaAPI.fechaModificacion = new Date().toISOString();
      
      // Usar fetch directamente para el PUT también
      const response = await fetch(buildApiUrl(`${this.endpoint}/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaAPI)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Manejar respuesta
      const responseText = await response.text();
      
      // Asumir éxito si el status es OK
      const barrioActualizado: BarrioData = {
        codigo: id,
        nombre: datos.nombre || '',
        codSector: datos.codSector || 0,
        descripcion: datos.descripcion || '',
        estado: datos.estado || 'ACTIVO',
        fechaModificacion: new Date().toISOString()
      };
      
      this.clearCache();
      return barrioActualizado;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error actualizando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un barrio (cambio de estado lógico)
   */
  async eliminarBarrio(id: number): Promise<void> {
    try {
      console.log('🗑️ [BarrioService] Eliminando barrio:', id);
      
      await this.actualizarBarrio(id, {
        estado: 'INACTIVO'
      });
      
      console.log('✅ [BarrioService] Barrio marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error eliminando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Busca barrios por nombre
   */
  async buscarPorNombre(nombre: string): Promise<BarrioData[]> {
    try {
      const params: BusquedaBarrioParams = {
        nombre: nombre.trim(),
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error buscando barrios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene barrios por sector
   */
  async obtenerPorSector(codSector: number): Promise<BarrioData[]> {
    try {
      const params: BusquedaBarrioParams = {
        codSector,
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error obteniendo barrios por sector:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene barrios activos
   */
  async obtenerActivos(): Promise<BarrioData[]> {
    try {
      return await this.search({ estado: 'ACTIVO' });
    } catch (error: any) {
      console.error('❌ [BarrioService] Error obteniendo barrios activos:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los barrios
   */
  async obtenerTodos(params?: BusquedaBarrioParams): Promise<BarrioData[]> {
    try {
      console.log('📋 [BarrioService] Obteniendo todos los barrios');
      
      const queryParams = {
        ...API_CONFIG.defaultParams,
        ...params
      };
      
      return await this.getAll(queryParams);
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error obteniendo barrios:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const barrioService = BarrioService.getInstance();
export default barrioService;

export { BarrioService };