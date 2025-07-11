// src/services/barrioService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Barrio
 */
export interface BarrioData {
  codigo: number;
  codigoSector: number;
  nombre: string;
  nombreSector?: string;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateBarrioDTO {
  codigoSector: number;
  nombre: string;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateBarrioDTO extends Partial<CreateBarrioDTO> {
  estado?: string;
}

export interface BusquedaBarrioParams {
  nombre?: string;
  codigoSector?: number;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de barrios
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class BarrioService extends BaseApiService<BarrioData, CreateBarrioDTO, UpdateBarrioDTO> {
  private static instance: BarrioService;
  
  private constructor() {
    super(
      '/api/barrio',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codBarrio || item.codigo || 0,
          codigoSector: item.codSector || item.codigoSector || 0,
          nombre: item.nombre || item.nombreBarrio || '',
          nombreSector: item.nombreSector || '',
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: BarrioData) => {
          // Validar que tenga código, nombre y sector
          return !!(item.codigo && item.nombre && item.codigoSector);
        }
      },
      'barrio'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): BarrioService {
    if (!BarrioService.instance) {
      BarrioService.instance = new BarrioService();
    }
    return BarrioService.instance;
  }
  
  /**
   * Lista todos los barrios
   * NO requiere autenticación (método GET)
   */
  async listarBarrios(incluirInactivos: boolean = false): Promise<BarrioData[]> {
    try {
      console.log('🔍 [BarrioService] Listando barrios');
      
      const barrios = await this.getAll();
      
      // Filtrar por estado si es necesario
      if (!incluirInactivos) {
        return barrios.filter(b => b.estado === 'ACTIVO');
      }
      
      return barrios;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error listando barrios:', error);
      throw error;
    }
  }
  
  /**
   * Lista barrios por sector
   * NO requiere autenticación (método GET)
   */
  async listarPorSector(codigoSector: number, incluirInactivos: boolean = false): Promise<BarrioData[]> {
    try {
      console.log('🔍 [BarrioService] Listando barrios del sector:', codigoSector);
      
      const barrios = await this.search({ 
        codigoSector,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      if (!incluirInactivos) {
        return barrios.filter(b => b.estado === 'ACTIVO');
      }
      
      return barrios;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error listando barrios por sector:', error);
      throw error;
    }
  }
  
  /**
   * Busca barrios por nombre
   * NO requiere autenticación (método GET)
   */
  async buscarPorNombre(nombre: string, codigoSector?: number): Promise<BarrioData[]> {
    try {
      console.log('🔍 [BarrioService] Buscando barrios por nombre:', nombre);
      
      if (!nombre || nombre.trim().length < 2) {
        return [];
      }
      
      const params: BusquedaBarrioParams = {
        nombre: nombre.trim(),
        codUsuario: API_CONFIG.defaultParams.codUsuario
      };
      
      if (codigoSector) {
        params.codigoSector = codigoSector;
      }
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error buscando barrios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un barrio por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigo(codigo: number): Promise<BarrioData | null> {
    try {
      console.log('🔍 [BarrioService] Obteniendo barrio por código:', codigo);
      
      return await this.getById(codigo);
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error obteniendo barrio:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un nombre de barrio ya existe en un sector
   * NO requiere autenticación (método GET)
   */
  async verificarNombreExiste(
    nombre: string, 
    codigoSector: number, 
    excluirCodigo?: number
  ): Promise<boolean> {
    try {
      const barrios = await this.buscarPorNombre(nombre, codigoSector);
      
      if (excluirCodigo) {
        return barrios.some(b => 
          b.nombre.toLowerCase() === nombre.toLowerCase() && 
          b.codigoSector === codigoSector &&
          b.codigo !== excluirCodigo
        );
      }
      
      return barrios.some(b => 
        b.nombre.toLowerCase() === nombre.toLowerCase() && 
        b.codigoSector === codigoSector
      );
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error verificando nombre:', error);
      return false;
    }
  }
  
  /**
   * Crea un nuevo barrio
   * REQUIERE autenticación (método POST)
   */
  async crearBarrio(datos: CreateBarrioDTO): Promise<BarrioData> {
    try {
      console.log('➕ [BarrioService] Creando barrio:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear barrios');
      }
      
      // Validar datos
      if (!datos.nombre || datos.nombre.trim().length < 3) {
        throw new Error('El nombre del barrio debe tener al menos 3 caracteres');
      }
      
      if (!datos.codigoSector || datos.codigoSector <= 0) {
        throw new Error('Debe seleccionar un sector válido');
      }
      
      // Verificar si el nombre ya existe en el sector
      const existe = await this.verificarNombreExiste(datos.nombre, datos.codigoSector);
      if (existe) {
        throw new Error('Ya existe un barrio con ese nombre en el sector seleccionado');
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
      console.error('❌ [BarrioService] Error creando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un barrio existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarBarrio(codigo: number, datos: UpdateBarrioDTO): Promise<BarrioData> {
    try {
      console.log('📝 [BarrioService] Actualizando barrio:', codigo, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar barrios');
      }
      
      // Obtener barrio actual para validaciones
      const barrioActual = await this.getById(codigo);
      if (!barrioActual) {
        throw new Error('Barrio no encontrado');
      }
      
      // Validar nombre si se está actualizando
      if (datos.nombre) {
        if (datos.nombre.trim().length < 3) {
          throw new Error('El nombre del barrio debe tener al menos 3 caracteres');
        }
        
        // Verificar si el nuevo nombre ya existe
        const sectorId = datos.codigoSector || barrioActual.codigoSector;
        const existe = await this.verificarNombreExiste(datos.nombre, sectorId, codigo);
        if (existe) {
          throw new Error('Ya existe otro barrio con ese nombre en el sector');
        }
      }
      
      const datosCompletos = {
        ...datos,
        nombre: datos.nombre ? datos.nombre.trim().toUpperCase() : undefined,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(codigo, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error actualizando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un barrio (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarBarrio(codigo: number): Promise<void> {
    try {
      console.log('🗑️ [BarrioService] Eliminando barrio:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar barrios');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(codigo, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [BarrioService] Barrio marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error eliminando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Reactiva un barrio inactivo
   * REQUIERE autenticación (método PUT)
   */
  async reactivarBarrio(codigo: number): Promise<BarrioData> {
    try {
      console.log('♻️ [BarrioService] Reactivando barrio:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para reactivar barrios');
      }
      
      return await this.update(codigo, {
        estado: 'ACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error reactivando barrio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de barrios
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(codigoSector?: number): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porSector?: { [key: number]: number };
  }> {
    try {
      let barrios: BarrioData[];
      
      if (codigoSector) {
        barrios = await this.listarPorSector(codigoSector, true);
      } else {
        barrios = await this.getAll();
      }
      
      const estadisticas: any = {
        total: barrios.length,
        activos: barrios.filter(b => b.estado === 'ACTIVO').length,
        inactivos: barrios.filter(b => b.estado === 'INACTIVO').length
      };
      
      // Si no se especifica sector, agrupar por sector
      if (!codigoSector) {
        estadisticas.porSector = barrios.reduce((acc, barrio) => {
          acc[barrio.codigoSector] = (acc[barrio.codigoSector] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });
      }
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const barrioService = BarrioService.getInstance();
export default barrioService;

// Exportar también la clase por si se necesita extender
export { BarrioService };