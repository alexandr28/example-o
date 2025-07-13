// src/services/barrioService.ts - VERSIÓN CORREGIDA
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Barrio
 */
export interface BarrioData {
  codigo: number;
  codigoSector: number; // Puede ser 0 cuando la API devuelve null
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
        normalizeItem: (item: any) => {
          // Manejo seguro para items vacíos o nulos
          if (!item || typeof item !== 'object') {
            console.warn('⚠️ [BarrioService] Item inválido recibido:', item);
            return null;
          }

          // La API devuelve codBarrio, nombreBarrio y codSector
          const codigo = parseInt(item.codBarrio || item.codigo || '0');
          const codigoSector = item.codSector !== null && item.codSector !== undefined 
            ? parseInt(item.codSector) 
            : 0; // Usar 0 como valor por defecto cuando codSector es null
          const nombre = (item.nombreBarrio || item.nombre || '').toString().trim();

          // Si no tiene los campos mínimos requeridos, retornar null
          if (!codigo || !nombre) {
            console.warn('⚠️ [BarrioService] Item sin campos requeridos:', item);
            return null;
          }

          return {
            codigo: codigo,
            codigoSector: codigoSector,
            nombre: nombre,
            nombreSector: item.nombreSector || '',
            descripcion: item.descripcion || '',
            estado: item.estado || 'ACTIVO',
            fechaRegistro: item.fechaRegistro || null,
            fechaModificacion: item.fechaModificacion || null,
            codUsuario: parseInt(item.codUsuario || API_CONFIG.defaultParams.codUsuario || '1')
          } as BarrioData;
        },
        
        validateItem: (item: BarrioData) => {
          // Validación más robusta
          if (!item || typeof item !== 'object') {
            console.warn('⚠️ [BarrioService] Item inválido en validación:', item);
            return false;
          }

          // Para barrios, el código y nombre son obligatorios
          // codigoSector puede ser 0 cuando viene null de la API
          const hasValidCodigo = typeof item.codigo === 'number' && item.codigo > 0;
          const hasValidNombre = typeof item.nombre === 'string' && item.nombre.trim().length > 0;
          // Aceptar codigoSector >= 0 (incluye 0 para valores null)
          const hasValidSector = typeof item.codigoSector === 'number' && item.codigoSector >= 0;

          const isValid = hasValidCodigo && hasValidNombre && hasValidSector;

          if (!isValid) {
            console.warn('⚠️ [BarrioService] Item no válido:', {
              item,
              hasValidCodigo,
              hasValidNombre,
              hasValidSector
            });
          }

          return isValid;
        }
      },
      'barrio',
      // Configuración de autenticación: GET no requiere token, POST/PUT/DELETE sí
      {
        GET: false,    // ← IMPORTANTE: GET no requiere token
        POST: true,
        PUT: true,
        DELETE: true,
        PATCH: true
      }
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
   * Sobrescribe el método getAll para manejar respuestas vacías
   */
  public async getAll(params?: any): Promise<BarrioData[]> {
    try {
      console.log('🔍 [BarrioService] Obteniendo todos los barrios');
      
      // Usar el método getAll de la clase base que maneja correctamente los headers
      const barrios = await super.getAll(params);
      
      return barrios;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error obteniendo barrios:', error);
      
      // Si es un error 404, retornar array vacío
      if (error.statusCode === 404) {
        console.log('ℹ️ [BarrioService] Endpoint no encontrado, retornando array vacío');
        return [];
      }
      
      // Para otros errores, retornar array vacío para no romper la UI
      console.warn('⚠️ [BarrioService] Retornando array vacío debido a error');
      return [];
    }
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
      if (!incluirInactivos && barrios.length > 0) {
        return barrios.filter(b => b.estado === 'ACTIVO');
      }
      
      return barrios;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error listando barrios:', error);
      // En caso de error, retornar array vacío para no romper la UI
      return [];
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
      
      if (!incluirInactivos && barrios.length > 0) {
        return barrios.filter(b => b.estado === 'ACTIVO');
      }
      
      return barrios;
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error listando barrios por sector:', error);
      return [];
    }
  }

  // ... resto de los métodos permanecen igual pero con manejo mejorado de errores ...
  
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
      
      const results = await this.search(params);
      return results || [];
      
    } catch (error: any) {
      console.error('❌ [BarrioService] Error buscando barrios:', error);
      return [];
    }
  }

  /**
   * Sobrescribe el método search para manejar respuestas vacías
   */
  public async search(params: any): Promise<BarrioData[]> {
    try {
      // Usar el método search de la clase base
      const results = await super.search(params);
      return results;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      // Retornar array vacío en caso de error para no romper la UI
      return [];
    }
  }
}

// Exportar instancia singleton
const barrioService = BarrioService.getInstance();
export default barrioService;

// Exportar también la clase por si se necesita extender
export { BarrioService };