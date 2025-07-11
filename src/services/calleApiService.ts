// src/services/calleApiService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Calle
 */
export interface CalleData {
  codigo: number;
  codigoBarrio: number;
  codigoVia: number;
  nombre: string;
  nombreBarrio?: string;
  nombreVia?: string;
  nombreCompleto?: string;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateCalleDTO {
  codigoBarrio: number;
  codigoVia: number;
  nombre: string;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateCalleDTO extends Partial<CreateCalleDTO> {
  estado?: string;
}

export interface BusquedaCalleParams {
  nombre?: string;
  codigoBarrio?: number;
  codigoVia?: number;
  estado?: string;
  codUsuario?: number;
}

// Tipos de vía comunes
export const TIPOS_VIA = {
  AVENIDA: { codigo: 1, abreviatura: 'AV.', nombre: 'AVENIDA' },
  CALLE: { codigo: 2, abreviatura: 'CA.', nombre: 'CALLE' },
  JIRON: { codigo: 3, abreviatura: 'JR.', nombre: 'JIRÓN' },
  PASAJE: { codigo: 4, abreviatura: 'PJ.', nombre: 'PASAJE' },
  ALAMEDA: { codigo: 5, abreviatura: 'AL.', nombre: 'ALAMEDA' },
  MALECON: { codigo: 6, abreviatura: 'ML.', nombre: 'MALECÓN' },
  CARRETERA: { codigo: 7, abreviatura: 'CARR.', nombre: 'CARRETERA' },
  PLAZA: { codigo: 8, abreviatura: 'PZ.', nombre: 'PLAZA' },
  PARQUE: { codigo: 9, abreviatura: 'PQ.', nombre: 'PARQUE' }
} as const;

/**
 * Servicio para gestión de calles
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class CalleService extends BaseApiService<CalleData, CreateCalleDTO, UpdateCalleDTO> {
  private static instance: CalleService;
  
  private constructor() {
    super(
      '/api/calle',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codCalle || item.codigo || 0,
          codigoBarrio: item.codBarrio || item.codigoBarrio || 0,
          codigoVia: item.codVia || item.codigoVia || 0,
          nombre: item.nombre || item.nombreCalle || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreVia: item.nombreVia || item.tipoVia || '',
          nombreCompleto: item.nombreCompleto || CalleService.construirNombreCompleto(item),
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: CalleData) => {
          // Validar que tenga código, nombre, barrio y vía
          return !!(item.codigo && item.nombre && item.codigoBarrio && item.codigoVia);
        }
      },
      'calle'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): CalleService {
    if (!CalleService.instance) {
      CalleService.instance = new CalleService();
    }
    return CalleService.instance;
  }
  
  /**
   * Construye el nombre completo de la calle
   */
  private static construirNombreCompleto(item: any): string {
    const tipoVia = item.nombreVia || item.tipoVia || '';
    const nombreCalle = item.nombre || item.nombreCalle || '';
    
    if (tipoVia && nombreCalle) {
      return `${tipoVia} ${nombreCalle}`.trim();
    }
    
    return nombreCalle;
  }
  
  /**
   * Lista todas las calles
   * NO requiere autenticación (método GET)
   */
  async listarCalles(incluirInactivos: boolean = false): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Listando calles');
      
      const calles = await this.getAll();
      
      // Filtrar por estado si es necesario
      if (!incluirInactivos) {
        return calles.filter(c => c.estado === 'ACTIVO');
      }
      
      return calles;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error listando calles:', error);
      throw error;
    }
  }
  
  /**
   * Lista calles por barrio
   * NO requiere autenticación (método GET)
   */
  async listarPorBarrio(codigoBarrio: number, incluirInactivos: boolean = false): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Listando calles del barrio:', codigoBarrio);
      
      const calles = await this.search({ 
        codigoBarrio,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      if (!incluirInactivos) {
        return calles.filter(c => c.estado === 'ACTIVO');
      }
      
      return calles;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error listando calles por barrio:', error);
      throw error;
    }
  }
  
  /**
   * Lista calles por tipo de vía
   * NO requiere autenticación (método GET)
   */
  async listarPorTipoVia(codigoVia: number, incluirInactivos: boolean = false): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Listando calles por tipo de vía:', codigoVia);
      
      const calles = await this.search({ 
        codigoVia,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      if (!incluirInactivos) {
        return calles.filter(c => c.estado === 'ACTIVO');
      }
      
      return calles;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error listando calles por tipo de vía:', error);
      throw error;
    }
  }
  
  /**
   * Busca calles por nombre
   * NO requiere autenticación (método GET)
   */
  async buscarPorNombre(
    nombre: string, 
    codigoBarrio?: number,
    codigoVia?: number
  ): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Buscando calles por nombre:', nombre);
      
      if (!nombre || nombre.trim().length < 2) {
        return [];
      }
      
      const params: BusquedaCalleParams = {
        nombre: nombre.trim(),
        codUsuario: API_CONFIG.defaultParams.codUsuario
      };
      
      if (codigoBarrio) {
        params.codigoBarrio = codigoBarrio;
      }
      
      if (codigoVia) {
        params.codigoVia = codigoVia;
      }
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error buscando calles:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una calle por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigo(codigo: number): Promise<CalleData | null> {
    try {
      console.log('🔍 [CalleService] Obteniendo calle por código:', codigo);
      
      return await this.getById(codigo);
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error obteniendo calle:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un nombre de calle ya existe en un barrio
   * NO requiere autenticación (método GET)
   */
  async verificarNombreExiste(
    nombre: string, 
    codigoBarrio: number,
    codigoVia: number,
    excluirCodigo?: number
  ): Promise<boolean> {
    try {
      const calles = await this.buscarPorNombre(nombre, codigoBarrio, codigoVia);
      
      if (excluirCodigo) {
        return calles.some(c => 
          c.nombre.toLowerCase() === nombre.toLowerCase() && 
          c.codigoBarrio === codigoBarrio &&
          c.codigoVia === codigoVia &&
          c.codigo !== excluirCodigo
        );
      }
      
      return calles.some(c => 
        c.nombre.toLowerCase() === nombre.toLowerCase() && 
        c.codigoBarrio === codigoBarrio &&
        c.codigoVia === codigoVia
      );
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error verificando nombre:', error);
      return false;
    }
  }
  
  /**
   * Crea una nueva calle
   * REQUIERE autenticación (método POST)
   */
  async crearCalle(datos: CreateCalleDTO): Promise<CalleData> {
    try {
      console.log('➕ [CalleService] Creando calle:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear calles');
      }
      
      // Validar datos
      if (!datos.nombre || datos.nombre.trim().length < 3) {
        throw new Error('El nombre de la calle debe tener al menos 3 caracteres');
      }
      
      if (!datos.codigoBarrio || datos.codigoBarrio <= 0) {
        throw new Error('Debe seleccionar un barrio válido');
      }
      
      if (!datos.codigoVia || datos.codigoVia <= 0) {
        throw new Error('Debe seleccionar un tipo de vía válido');
      }
      
      // Verificar si el nombre ya existe
      const existe = await this.verificarNombreExiste(
        datos.nombre, 
        datos.codigoBarrio, 
        datos.codigoVia
      );
      
      if (existe) {
        throw new Error('Ya existe una calle con ese nombre en el barrio seleccionado');
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
      console.error('❌ [CalleService] Error creando calle:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una calle existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarCalle(codigo: number, datos: UpdateCalleDTO): Promise<CalleData> {
    try {
      console.log('📝 [CalleService] Actualizando calle:', codigo, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar calles');
      }
      
      // Obtener calle actual para validaciones
      const calleActual = await this.getById(codigo);
      if (!calleActual) {
        throw new Error('Calle no encontrada');
      }
      
      // Validar nombre si se está actualizando
      if (datos.nombre) {
        if (datos.nombre.trim().length < 3) {
          throw new Error('El nombre de la calle debe tener al menos 3 caracteres');
        }
        
        // Verificar si el nuevo nombre ya existe
        const barrioId = datos.codigoBarrio || calleActual.codigoBarrio;
        const viaId = datos.codigoVia || calleActual.codigoVia;
        
        const existe = await this.verificarNombreExiste(
          datos.nombre, 
          barrioId, 
          viaId, 
          codigo
        );
        
        if (existe) {
          throw new Error('Ya existe otra calle con ese nombre en el barrio');
        }
      }
      
      const datosCompletos = {
        ...datos,
        nombre: datos.nombre ? datos.nombre.trim().toUpperCase() : undefined,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(codigo, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error actualizando calle:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una calle (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarCalle(codigo: number): Promise<void> {
    try {
      console.log('🗑️ [CalleService] Eliminando calle:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar calles');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(codigo, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [CalleService] Calle marcada como inactiva');
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error eliminando calle:', error);
      throw error;
    }
  }
  
  /**
   * Reactiva una calle inactiva
   * REQUIERE autenticación (método PUT)
   */
  async reactivarCalle(codigo: number): Promise<CalleData> {
    try {
      console.log('♻️ [CalleService] Reactivando calle:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para reactivar calles');
      }
      
      return await this.update(codigo, {
        estado: 'ACTIVO',
        fechaModificación: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error reactivando calle:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de calles
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(codigoBarrio?: number): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porBarrio?: { [key: number]: number };
    porTipoVia?: { [key: number]: number };
  }> {
    try {
      let calles: CalleData[];
      
      if (codigoBarrio) {
        calles = await this.listarPorBarrio(codigoBarrio, true);
      } else {
        calles = await this.getAll();
      }
      
      const estadisticas: any = {
        total: calles.length,
        activos: calles.filter(c => c.estado === 'ACTIVO').length,
        inactivos: calles.filter(c => c.estado === 'INACTIVO').length
      };
      
      // Si no se especifica barrio, agrupar por barrio y tipo de vía
      if (!codigoBarrio) {
        estadisticas.porBarrio = calles.reduce((acc, calle) => {
          acc[calle.codigoBarrio] = (acc[calle.codigoBarrio] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });
        
        estadisticas.porTipoVia = calles.reduce((acc, calle) => {
          acc[calle.codigoVia] = (acc[calle.codigoVia] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });
      }
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los tipos de vía disponibles
   */
  getTiposVia() {
    return Object.values(TIPOS_VIA);
  }
}

// Exportar instancia singleton
const calleService = CalleService.getInstance();
export default calleService;

// Exportar también la clase por si se necesita extender
export { CalleService };