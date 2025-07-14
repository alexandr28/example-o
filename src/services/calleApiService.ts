// src/services/calleApiService.ts - CORREGIDO CON ENDPOINTS CORRECTOS

import BaseApiService from './BaseApiService';
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Calle/Via
 */
export interface CalleData {
  codigo: number;
  nombre: string;
  codigoVia?: number;
  nombreVia?: string;
  codigoBarrio?: number;
  tipo?: string;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateCalleDTO {
  codTipoVia: number;
  nombreVia: string;
  codSector: number;
  codBarrio: number;
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
 * GET: /api/via/listarVia
 * POST: /api/via
 * NO REQUIERE AUTENTICACIÓN
 */
class CalleApiService extends BaseApiService<CalleData, CreateCalleDTO, UpdateCalleDTO> {
  private static instance: CalleApiService;
  
  private constructor() {
    super(
      '/api/via', // Endpoint base para CRUD
      {
        normalizeItem: (item: any) => ({
          codigo: item.codVia || item.codigo || 0,
          nombre: item.nombreVia || item.nombre || '',
          codigoVia: item.codTipoVia || item.codigoVia,
          nombreVia: item.nombreVia || '',
          codigoBarrio: item.codBarrio || item.codigoBarrio,
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
   * Sobrescribir getAll para usar el endpoint de listado
   */
  async getAll(params?: any): Promise<CalleData[]> {
    try {
      console.log('📋 [CalleApiService] Obteniendo todas las vías');
      
      // Usar el endpoint específico para listar
      const url = buildApiUrl('/api/via/listarVia');
      const queryParams = new URLSearchParams(params || {});
      
      const response = await fetch(`${url}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || []);
      
      return this.normalizeData(items);
    } catch (error) {
      console.error('❌ [CalleApiService] Error obteniendo vías:', error);
      throw error;
    }
  }
  
  /**
   * Crear nueva vía/calle
   */
  async create(data: CreateCalleDTO): Promise<CalleData> {
    try {
      console.log('📝 [CalleApiService] Creando vía con datos:', data);
      
      // Usar fetch directamente para POST
      const url = buildApiUrl(this.endpoint);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      console.log('📡 Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al crear vía: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Respuesta del servidor:', responseData);
      
      // Crear objeto de respuesta
      const created: CalleData = {
        codigo: responseData.codVia || responseData.id || 0,
        nombre: data.nombreVia,
        codigoVia: data.codTipoVia,
        nombreVia: data.nombreVia,
        codigoBarrio: data.codBarrio,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      this.clearCache();
      return created;
      
    } catch (error: any) {
      console.error('❌ [CalleApiService] Error creando vía:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar vía (si el endpoint lo soporta)
   */
  async update(id: number, data: UpdateCalleDTO): Promise<CalleData> {
    try {
      const url = buildApiUrl(`${this.endpoint}/${id}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar vía: ${response.status}`);
      }
      
      const responseData = await response.json();
      this.clearCache();
      
      return this.normalizeData([responseData])[0];
    } catch (error) {
      console.error('❌ [CalleApiService] Error actualizando vía:', error);
      throw error;
    }
  }
  
  /**
   * Buscar vías por nombre
   */
  async buscarPorNombre(nombre: string): Promise<CalleData[]> {
    try {
      const params: BusquedaCalleParams = {
        nombre: nombre.trim(),
        estado: 'ACTIVO'
      };
      
      return await this.getAll(params);
      
    } catch (error: any) {
      console.error('❌ [CalleApiService] Error buscando vías:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const calleService = CalleApiService.getInstance();
export default calleService;

// Exportar también la clase
export { CalleApiService };