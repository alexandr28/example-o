// src/services/sectorService.ts - VERSIÓN CORREGIDA CON nombreSector

import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Sector
 */
export interface SectorData {
  codigo: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateSectorDTO {
  nombreSector: string;  // ← IMPORTANTE: Usar nombreSector, no nombre
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateSectorDTO {
  nombreSector?: string;  // ← IMPORTANTE: Usar nombreSector
  descripcion?: string;
  estado?: string;
  fechaModificacion?: string;
}

export interface BusquedaSectorParams {
  nombre?: string;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de sectores
 * IMPORTANTE: El API espera "nombreSector" no "nombre"
 */
class SectorService extends BaseApiService<SectorData, CreateSectorDTO, UpdateSectorDTO> {
  private static instance: SectorService;
  
  private constructor() {
    super(
      '/api/sector',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codSector || item.codigo || 0,
          nombre: item.nombre || item.nombreSector || '',  // Mapear nombreSector a nombre
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: SectorData) => {
          return !!item.codigo && !!item.nombre && item.nombre.trim().length > 0;
        }
      },
      'sector_cache'
    );
  }
  
  static getInstance(): SectorService {
    if (!SectorService.instance) {
      SectorService.instance = new SectorService();
    }
    return SectorService.instance;
  }
  
  /**
   * Sobrescribir create para manejar la respuesta numérica
   */
  async create(data: CreateSectorDTO): Promise<SectorData> {
    try {
      console.log('📝 [SectorService] Creando sector con datos:', data);
      
      // IMPORTANTE: Asegurarse de que NO se envíe ningún header de autorización
      const response = await fetch(buildApiUrl(this.endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO Authorization header
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
      console.log('📋 Tipo de respuesta:', typeof responseText);
      console.log('📋 Longitud respuesta:', responseText.length);
      console.log('📋 Respuesta exacta:', responseText);
      
      // Limpiar la respuesta de espacios y comillas
      const cleanResponse = responseText.trim().replace(/['"]/g, '');
      
      // Si la respuesta es "null" (string) o vacía
      if (cleanResponse === 'null' || cleanResponse === '' || responseText.trim() === '') {
        console.log('⚠️ Servidor devolvió null o vacío, pero status es OK');
        console.log('✅ Asumiendo éxito, creando con ID temporal');
        
        // Generar un ID temporal único
        const tempId = Math.floor(Date.now() / 1000); // Usar segundos para evitar IDs muy largos
        
        const nuevoSector: SectorData = {
          codigo: tempId,
          nombre: data.nombreSector,
          descripcion: data.descripcion || '',
          estado: 'ACTIVO',
          fechaRegistro: new Date().toISOString(),
          codUsuario: data.codUsuario || API_CONFIG.defaultParams.codUsuario
        };
        
        this.clearCache();
        
        // Importante: El ID es temporal, será actualizado al recargar
        console.log('ℹ️ Sector creado con ID temporal:', tempId);
        
        return nuevoSector;
      }
      
      // Intentar parsear como número
      const responseNumber = parseInt(cleanResponse, 10);
      
      // Si es un número válido y positivo
      if (!isNaN(responseNumber) && responseNumber > 0) {
        console.log('✅ Sector creado con ID:', responseNumber);
        
        const nuevoSector: SectorData = {
          codigo: responseNumber,
          nombre: data.nombreSector,
          descripcion: data.descripcion || '',
          estado: 'ACTIVO',
          fechaRegistro: new Date().toISOString(),
          codUsuario: data.codUsuario || API_CONFIG.defaultParams.codUsuario
        };
        
        this.clearCache();
        return nuevoSector;
      }
      
      // Si el parse resulta en NaN o número inválido, pero el status es OK
      if (response.ok) {
        console.log('⚠️ No se pudo parsear el ID, pero la respuesta fue exitosa');
        console.log('✅ Creando con ID temporal');
        
        const tempId = Math.floor(Date.now() / 1000);
        
        const nuevoSector: SectorData = {
          codigo: tempId,
          nombre: data.nombreSector,
          descripcion: data.descripcion || '',
          estado: 'ACTIVO',
          fechaRegistro: new Date().toISOString(),
          codUsuario: data.codUsuario || API_CONFIG.defaultParams.codUsuario
        };
        
        this.clearCache();
        return nuevoSector;
      }
      
      // Si llegamos aquí, algo salió mal
      console.error('❌ Respuesta no manejable:', responseText);
      throw new Error(`Error al crear sector`);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error al crear:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo sector
   * IMPORTANTE: Convierte "nombre" a "nombreSector" para el API
   */
  async crearSector(datos: { nombre: string; descripcion?: string }): Promise<SectorData> {
    try {
      // Validaciones
      if (!datos.nombre || datos.nombre.trim().length === 0) {
        throw new Error('El nombre del sector es requerido');
      }
      
      if (datos.nombre.trim().length < 3) {
        throw new Error('El nombre del sector debe tener al menos 3 caracteres');
      }
      
      // IMPORTANTE: Convertir nombre a nombreSector
      const datosParaAPI: CreateSectorDTO = {
        nombreSector: datos.nombre.trim(),  // ← Usar nombreSector
        descripcion: datos.descripcion?.trim() || ''
        // NO incluir codUsuario si no es necesario
      };
      
      console.log('📤 Enviando al API:', datosParaAPI);
      
      const resultado = await this.create(datosParaAPI);
      
      return resultado;
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error creando sector:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un sector existente
   */
  async actualizarSector(id: number, datos: { nombre?: string; descripcion?: string; estado?: string }): Promise<SectorData> {
    try {
      console.log('📝 [SectorService] Actualizando sector:', id, datos);
      
      // Validaciones
      if (datos.nombre !== undefined) {
        if (datos.nombre.trim().length === 0) {
          throw new Error('El nombre del sector no puede estar vacío');
        }
        
        if (datos.nombre.trim().length < 3) {
          throw new Error('El nombre del sector debe tener al menos 3 caracteres');
        }
      }
      
      // Convertir nombre a nombreSector para el API
      const datosParaAPI: UpdateSectorDTO = {};
      
      if (datos.nombre !== undefined) {
        datosParaAPI.nombreSector = datos.nombre.trim();
      }
      if (datos.descripcion !== undefined) {
        datosParaAPI.descripcion = datos.descripcion.trim();
      }
      if (datos.estado !== undefined) {
        datosParaAPI.estado = datos.estado;
      }
      
      datosParaAPI.fechaModificacion = new Date().toISOString();
      
      return await this.update(id, datosParaAPI);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error actualizando sector:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un sector (cambio de estado lógico)
   */
  async eliminarSector(id: number): Promise<void> {
    try {
      console.log('🗑️ [SectorService] Eliminando sector:', id);
      
      await this.update(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [SectorService] Sector marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error eliminando sector:', error);
      throw error;
    }
  }
  
  /**
   * Busca sectores por nombre
   */
  async buscarPorNombre(nombre: string): Promise<SectorData[]> {
    try {
      const params: BusquedaSectorParams = {
        nombre: nombre.trim(),
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error buscando sectores:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene sectores activos
   */
  async obtenerActivos(): Promise<SectorData[]> {
    try {
      return await this.search({ estado: 'ACTIVO' });
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo sectores activos:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los sectores
   */
  async obtenerTodos(params?: BusquedaSectorParams): Promise<SectorData[]> {
    try {
      console.log('📋 [SectorService] Obteniendo todos los sectores');
      
      const queryParams = {
        ...API_CONFIG.defaultParams,
        ...params
      };
      
      return await this.getAll(queryParams);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo sectores:', error);
      throw error;
    }
  }
}

// IMPORTANTE: Necesitamos importar buildApiUrl
import { buildApiUrl } from '../config/api.unified.config';

// Exportar instancia singleton
const sectorService = SectorService.getInstance();
export default sectorService;

export { SectorService };