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
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
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
          return !!(item.codigo && item.nombre);
        }
      },
      'sector'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): SectorService {
    if (!SectorService.instance) {
      SectorService.instance = new SectorService();
    }
    return SectorService.instance;
  }
  
  /**
   * Lista todos los sectores
   * NO requiere autenticación (método GET)
   */
  async listarSectores(incluirInactivos: boolean = false): Promise<SectorData[]> {
    try {
      console.log('🔍 [SectorService] Listando sectores');
      
      const sectores = await this.getAll();
      
      // Filtrar por estado si es necesario
      if (!incluirInactivos) {
        return sectores.filter(s => s.estado === 'ACTIVO');
      }
      
      return sectores;
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error listando sectores:', error);
      throw error;
    }
  }
  
  /**
   * Busca sectores por nombre
   * NO requiere autenticación (método GET)
   */
  async buscarPorNombre(nombre: string): Promise<SectorData[]> {
    try {
      console.log('🔍 [SectorService] Buscando sectores por nombre:', nombre);
      
      if (!nombre || nombre.trim().length < 2) {
        return [];
      }
      
      return await this.search({ 
        nombre: nombre.trim(),
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error buscando sectores:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un sector por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigo(codigo: number): Promise<SectorData | null> {
    try {
      console.log('🔍 [SectorService] Obteniendo sector por código:', codigo);
      
      return await this.getById(codigo);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo sector:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un nombre de sector ya existe
   * NO requiere autenticación (método GET)
   */
  async verificarNombreExiste(nombre: string, excluirCodigo?: number): Promise<boolean> {
    try {
      const sectores = await this.buscarPorNombre(nombre);
      
      if (excluirCodigo) {
        return sectores.some(s => 
          s.nombre.toLowerCase() === nombre.toLowerCase() && 
          s.codigo !== excluirCodigo
        );
      }
      
      return sectores.some(s => s.nombre.toLowerCase() === nombre.toLowerCase());
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error verificando nombre:', error);
      return false;
    }
  }
  
  /**
   * Crea un nuevo sector
   * REQUIERE autenticación (método POST)
   */
  async crearSector(datos: CreateSectorDTO): Promise<SectorData> {
    try {
      console.log('➕ [SectorService] Creando sector:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear sectores');
      }
      
      // Validar datos
      if (!datos.nombre || datos.nombre.trim().length < 3) {
        throw new Error('El nombre del sector debe tener al menos 3 caracteres');
      }
      
      // Verificar si el nombre ya existe
      const existe = await this.verificarNombreExiste(datos.nombre);
      if (existe) {
        throw new Error('Ya existe un sector con ese nombre');
      }
      
      const datosCompletos = {
        ...datos,
        nombre: datos.nombre.trim().toUpperCase(),
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error creando sector:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un sector existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarSector(codigo: number, datos: UpdateSectorDTO): Promise<SectorData> {
    try {
      console.log('📝 [SectorService] Actualizando sector:', codigo, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar sectores');
      }
      
      // Validar nombre si se está actualizando
      if (datos.nombre) {
        if (datos.nombre.trim().length < 3) {
          throw new Error('El nombre del sector debe tener al menos 3 caracteres');
        }
        
        // Verificar si el nuevo nombre ya existe
        const existe = await this.verificarNombreExiste(datos.nombre, codigo);
        if (existe) {
          throw new Error('Ya existe otro sector con ese nombre');
        }
      }
      
      const datosCompletos = {
        ...datos,
        nombre: datos.nombre ? datos.nombre.trim().toUpperCase() : undefined,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(codigo, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error actualizando sector:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un sector (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarSector(codigo: number): Promise<void> {
    try {
      console.log('🗑️ [SectorService] Eliminando sector:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar sectores');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(codigo, {
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
   * Reactiva un sector inactivo
   * REQUIERE autenticación (método PUT)
   */
  async reactivarSector(codigo: number): Promise<SectorData> {
    try {
      console.log('♻️ [SectorService] Reactivando sector:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para reactivar sectores');
      }
      
      return await this.update(codigo, {
        estado: 'ACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error reactivando sector:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de sectores
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
  }> {
    try {
      const sectores = await this.getAll();
      
      return {
        total: sectores.length,
        activos: sectores.filter(s => s.estado === 'ACTIVO').length,
        inactivos: sectores.filter(s => s.estado === 'INACTIVO').length
      };
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const sectorService = SectorService.getInstance();
export default sectorService;

// Exportar también la clase por si se necesita extender
export { SectorService };