// src/services/sectorService.ts
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
  nombre: string;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateSectorDTO extends Partial<CreateSectorDTO> {
  estado?: string;
}

export interface BusquedaSectorParams {
  nombre?: string;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de sectores
 * 
 * Autenticación:
 * - Ningún método requiere autenticación según tu API
 */
class SectorService extends BaseApiService<SectorData, CreateSectorDTO, UpdateSectorDTO> {
  private static instance: SectorService;
  
  private constructor() {
    super(
      '/api/sector',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codSector || item.codigo || 0,
          nombre: item.nombre || item.nombreSector || '',
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: SectorData) => {
          // Validar que tenga código y nombre
          return !!item.codigo && !!item.nombre && item.nombre.trim().length > 0;
        }
      },
      'sector_cache',
      // Configuración de autenticación: ningún método requiere auth
      {
        GET: false,
        POST: false,
        PUT: false,
        DELETE: false,
        PATCH: false
      }
    );
  }
  
  static getInstance(): SectorService {
    if (!SectorService.instance) {
      SectorService.instance = new SectorService();
    }
    return SectorService.instance;
  }
  
  /**
   * Crea un nuevo sector
   * NO requiere autenticación
   */
  async crearSector(datos: CreateSectorDTO): Promise<SectorData> {
    try {
      console.log('📝 [SectorService] Creando sector:', datos);
      
      // Validaciones básicas
      if (!datos.nombre || datos.nombre.trim().length === 0) {
        throw new Error('El nombre del sector es requerido');
      }
      
      if (datos.nombre.trim().length < 3) {
        throw new Error('El nombre del sector debe tener al menos 3 caracteres');
      }
      
      // Preparar datos para enviar
      const datosCompletos: CreateSectorDTO = {
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || '',
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      // Usar el método create del BaseApiService
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error creando sector:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un sector existente
   * NO requiere autenticación
   */
  async actualizarSector(id: number, datos: UpdateSectorDTO): Promise<SectorData> {
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
      
      const datosCompletos = {
        ...datos,
        nombre: datos.nombre?.trim(),
        descripcion: datos.descripcion?.trim(),
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(id, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error actualizando sector:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un sector (cambio de estado lógico)
   * NO requiere autenticación
   */
  async eliminarSector(id: number): Promise<void> {
    try {
      console.log('🗑️ [SectorService] Eliminando sector:', id);
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
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
   * NO requiere autenticación
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
   * NO requiere autenticación
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
   * Verifica si un sector existe por nombre
   * NO requiere autenticación
   */
  async existePorNombre(nombre: string, excluirId?: number): Promise<boolean> {
    try {
      const sectores = await this.buscarPorNombre(nombre);
      
      return sectores.some(sector => 
        sector.nombre.toLowerCase() === nombre.toLowerCase() &&
        (!excluirId || sector.codigo !== excluirId)
      );
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error verificando existencia:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
const sectorService = SectorService.getInstance();
export default sectorService;

// Exportar también la clase por si se necesita extender
export { SectorService };