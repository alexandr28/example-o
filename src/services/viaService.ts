// src/services/viaService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Tipo de Vía
 */
export interface TipoViaData {
  codigo: number;
  codigoTipoVia: string;
  nombre: string;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateTipoViaDTO {
  codigoTipoVia: string;
  nombre: string;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateTipoViaDTO extends Partial<CreateTipoViaDTO> {
  estado?: string;
}

/**
 * Servicio para gestión de tipos de vía
 * 
 * Endpoints:
 * - GET /api/via/listarVia - No requiere token
 * - POST /api/via - Requiere token
 */
class TipoViaService extends BaseApiService<TipoViaData, CreateTipoViaDTO, UpdateTipoViaDTO> {
  private static instance: TipoViaService;
  
  private constructor() {
    super(
      '/api/via',
      {
        normalizeItem: (item: any) => {
          if (!item || typeof item !== 'object') {
            console.warn('⚠️ [TipoViaService] Item inválido recibido:', item);
            return null;
          }

          // La API devuelve: codVia, codTipoVia, codBarrio, nombreVia, descTipoVia
          const codigo = parseInt(item.codVia || item.codigo || '0');
          const nombre = (item.nombreVia || item.nombre || '').toString().trim();

          if (!codigo || !nombre) {
            console.warn('⚠️ [TipoViaService] Item sin campos requeridos:', item);
            return null;
          }

          return {
            codigo: codigo,
            codigoTipoVia: (item.codTipoVia || '').toString(),
            nombre: nombre,
            descripcion: item.descTipoVia || item.descripcion || '',
            estado: item.estado || 'ACTIVO',
            fechaRegistro: item.fechaRegistro || null,
            fechaModificacion: item.fechaModificacion || null,
            codUsuario: parseInt(item.codUsuario || API_CONFIG.defaultParams.codUsuario || '1')
          } as TipoViaData;
        },
        
        validateItem: (item: TipoViaData) => {
          if (!item || typeof item !== 'object') {
            return false;
          }

          const hasValidCodigo = typeof item.codigo === 'number' && item.codigo > 0;
          const hasValidNombre = typeof item.nombre === 'string' && item.nombre.trim().length > 0;

          return hasValidCodigo && hasValidNombre;
        }
      },
      'tipoVia',
      {
        GET: false,    // GET no requiere token
        POST: true,    // POST requiere token
        PUT: true,
        DELETE: true,
        PATCH: true
      }
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): TipoViaService {
    if (!TipoViaService.instance) {
      TipoViaService.instance = new TipoViaService();
    }
    return TipoViaService.instance;
  }

  /**
   * Lista todos los tipos de vía
   * Endpoint específico: /api/via/listarVia
   */
  async listarTiposVia(): Promise<TipoViaData[]> {
    try {
      console.log('🔍 [TipoViaService] Listando tipos de vía');
      
      // Usar endpoint específico
      const response = await this.makeRequest<any>('/listarVia', {
        method: 'GET'
      });

      // La API devuelve un objeto con data
      const data = response.data || [];
      const normalized = this.normalizeData(data);
      
      return normalized;
      
    } catch (error: any) {
      console.error('❌ [TipoViaService] Error listando tipos de vía:', error);
      return [];
    }
  }

  /**
   * Override del método getAll para usar el endpoint correcto
   */
  public async getAll(params?: any): Promise<TipoViaData[]> {
    return this.listarTiposVia();
  }
}

// Exportar instancia singleton
const tipoViaService = TipoViaService.getInstance();
export default tipoViaService;

// Exportar también la clase por si se necesita extender
export { TipoViaService };