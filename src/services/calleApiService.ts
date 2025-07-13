// src/services/calleApiService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import tipoViaService from './viaService';

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

/**
 * Servicio para gestión de calles
 * 
 * NOTA: Las calles en realidad vienen del endpoint de vías
 * Este servicio actúa como un adaptador para mantener la compatibilidad
 */
class CalleService extends BaseApiService<CalleData, CreateCalleDTO, UpdateCalleDTO> {
  private static instance: CalleService;
  
  private constructor() {
    super(
      '/api/via', // Usamos el mismo endpoint que vías
      {
        normalizeItem: (item: any) => {
          if (!item || typeof item !== 'object') {
            console.warn('⚠️ [CalleService] Item inválido recibido:', item);
            return null;
          }

          // Debug para ver qué campos vienen de la API
          console.log('📝 [CalleService] Item recibido de vías:', item);

          // Adaptamos los datos de vía a formato de calle
          // Las vías que tienen codBarrio son calles específicas
          const codigo = parseInt(item.codVia || item.codigo || '0');
          const codigoBarrio = item.codBarrio !== null && item.codBarrio !== undefined 
            ? parseInt(item.codBarrio) 
            : 0;
          const codigoVia = parseInt(item.codTipoVia || '0'); // El tipo de vía
          const nombre = (item.nombreVia || item.nombre || '').toString().trim();

          if (!nombre) {
            console.warn('⚠️ [CalleService] Item sin nombre:', item);
            return null;
          }

          return {
            codigo: codigo,
            codigoBarrio: codigoBarrio,
            codigoVia: codigoVia,
            nombre: nombre,
            nombreBarrio: item.nombreBarrio || '',
            nombreVia: item.descTipoVia || item.tipoVia || '',
            nombreCompleto: nombre, // Ya viene completo desde la API
            descripcion: item.descTipoVia || item.descripcion || '',
            estado: item.estado || 'ACTIVO',
            fechaRegistro: item.fechaRegistro || null,
            fechaModificacion: item.fechaModificacion || null,
            codUsuario: parseInt(item.codUsuario || API_CONFIG.defaultParams.codUsuario || '1')
          } as CalleData;
        },
        
        validateItem: (item: CalleData) => {
          if (!item || typeof item !== 'object') {
            return false;
          }

          // Para las vías/calles, solo validar que tenga nombre
          // No requerir barrio porque puede ser 0
          const hasValidNombre = typeof item.nombre === 'string' && item.nombre.trim().length > 0;
          const hasValidCodigo = typeof item.codigo === 'number' && item.codigo >= 0;

          // Log para debugging
          console.log('🔍 [CalleService] Validando item:', {
            codigo: item.codigo,
            nombre: item.nombre,
            codigoBarrio: item.codigoBarrio,
            codigoVia: item.codigoVia,
            esValido: hasValidNombre && hasValidCodigo
          });

          // Aceptar todos los items que tengan nombre válido
          return hasValidNombre && hasValidCodigo;
        }
      },
      'calle',
      // Configuración de autenticación
      {
        GET: false,    // GET no requiere token
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
   * Usa el servicio de vías y filtra solo las que tienen barrio
   */
  async listarCalles(incluirInactivos: boolean = false): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Listando calles desde vías');
      
      // Obtener todas las vías
      const todasLasVias = await tipoViaService.listarTiposVia();
      
      // Normalizar y filtrar solo las que son calles (tienen barrio)
      const calles = this.normalizeData(todasLasVias);
      
      // Filtrar por estado si es necesario
      if (!incluirInactivos) {
        return calles.filter(c => c.estado === 'ACTIVO');
      }
      
      return calles;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error listando calles:', error);
      return [];
    }
  }
  
  /**
   * Sobrescribe el método getAll para usar el endpoint de vías
   */
  public async getAll(params?: any): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Obteniendo calles desde endpoint de vías');
      
      // Hacer la petición al endpoint de vías
      const response = await this.makeRequest<any>('/listarVia', {
        method: 'GET'
      });

      // La API devuelve un objeto con data
      const data = response.data || [];
      
      // Normalizar y filtrar solo calles (las que tienen barrio)
      const calles = this.normalizeData(data);
      
      return calles;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error obteniendo calles:', error);
      return [];
    }
  }

  /**
   * Lista calles por barrio
   */
  async listarPorBarrio(codigoBarrio: number, incluirInactivos: boolean = false): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Listando calles del barrio:', codigoBarrio);
      
      const todasLasCalles = await this.listarCalles(incluirInactivos);
      return todasLasCalles.filter(c => c.codigoBarrio === codigoBarrio);
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error listando calles por barrio:', error);
      return [];
    }
  }
  
  /**
   * Lista calles por tipo de vía
   */
  async listarPorTipoVia(codigoVia: number, incluirInactivos: boolean = false): Promise<CalleData[]> {
    try {
      console.log('🔍 [CalleService] Listando calles por tipo de vía:', codigoVia);
      
      const todasLasCalles = await this.listarCalles(incluirInactivos);
      return todasLasCalles.filter(c => c.codigoVia === codigoVia);
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error listando calles por tipo de vía:', error);
      return [];
    }
  }
  
  /**
   * Busca calles por nombre
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
      
      const todasLasCalles = await this.listarCalles(true);
      let callesFiltradas = todasLasCalles.filter(c => 
        c.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      
      if (codigoBarrio) {
        callesFiltradas = callesFiltradas.filter(c => c.codigoBarrio === codigoBarrio);
      }
      
      if (codigoVia) {
        callesFiltradas = callesFiltradas.filter(c => c.codigoVia === codigoVia);
      }
      
      return callesFiltradas;
      
    } catch (error: any) {
      console.error('❌ [CalleService] Error buscando calles:', error);
      return [];
    }
  }

  /**
   * Sobrescribe el método search
   */
  public async search(params: any): Promise<CalleData[]> {
    try {
      const todasLasCalles = await this.listarCalles(true);
      let callesFiltradas = todasLasCalles;
      
      if (params.nombre) {
        callesFiltradas = callesFiltradas.filter(c => 
          c.nombre.toLowerCase().includes(params.nombre.toLowerCase())
        );
      }
      
      if (params.codigoBarrio) {
        callesFiltradas = callesFiltradas.filter(c => c.codigoBarrio === params.codigoBarrio);
      }
      
      if (params.codigoVia) {
        callesFiltradas = callesFiltradas.filter(c => c.codigoVia === params.codigoVia);
      }
      
      return callesFiltradas;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      return [];
    }
  }
}

// Exportar instancia singleton
const calleService = CalleService.getInstance();
export default calleService;

// Exportar también la clase por si se necesita extender
export { CalleService };