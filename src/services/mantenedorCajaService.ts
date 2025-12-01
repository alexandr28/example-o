// src/services/mantenedorCajaService.ts
import BaseApiService from './BaseApiService';
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Mantenedor de Caja
 */
export interface MantenedorCajaData {
  codCaja: number;
  descripcion: string;
  usuario: string | null;
  numcaja: string;
  estado: string;
}

export interface CreateMantenedorCajaDTO {
  descripcion: string;
}

export interface UpdateMantenedorCajaDTO {
  codCaja: number;
  descripcion: string;
}

export interface DeleteMantenedorCajaDTO {
  codCaja: number;
}

export interface ListarMantenedorCajaParams {
  descripcion?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestion de mantenedor de cajas
 *
 * IMPORTANTE: Este servicio NO requiere autenticacion
 * Todos los metodos (GET, POST, PUT) funcionan sin token
 */
class MantenedorCajaService extends BaseApiService<MantenedorCajaData, CreateMantenedorCajaDTO, UpdateMantenedorCajaDTO> {
  private static instance: MantenedorCajaService;

  public static getInstance(): MantenedorCajaService {
    if (!MantenedorCajaService.instance) {
      MantenedorCajaService.instance = new MantenedorCajaService();
    }
    return MantenedorCajaService.instance;
  }

  private constructor() {
    super(
      '/api/caja',
      {
        normalizeItem: (item: any) => ({
          codCaja: item.codCaja || 0,
          descripcion: item.descripcion || '',
          usuario: item.usuario ?? null,
          numcaja: item.numcaja || '',
          estado: item.estado || 'DISPONIBLE'
        }),
        validateItem: (item: MantenedorCajaData) => {
          return !!(item.codCaja && item.descripcion);
        }
      },
      'mantenedorCaja'
    );
  }

  /**
   * Lista cajas con filtros
   * GET /api/caja/listar?descripcion=C&codUsuario=1
   * NO requiere autenticacion
   */
  async listar(params?: ListarMantenedorCajaParams): Promise<MantenedorCajaData[]> {
    try {
      console.log('[MantenedorCajaService] Listando cajas con parametros:', params);

      const url = buildApiUrl(this.endpoint + '/listar');

      // Construir query params
      const queryParams = new URLSearchParams();
      if (params?.descripcion) {
        queryParams.append('descripcion', params.descripcion);
      }
      if (params?.codUsuario !== undefined) {
        queryParams.append('codUsuario', String(params.codUsuario));
      }

      const getUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      console.log('[MantenedorCajaService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`[MantenedorCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MantenedorCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[MantenedorCajaService] Datos obtenidos:', responseData);

      // Procesar respuesta - puede ser un array directo o wrapped
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        items = responseData.data;
      } else {
        items = [responseData];
      }

      return this.normalizeData(items);

    } catch (error: any) {
      console.error('[MantenedorCajaService] Error listando cajas:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva caja
   * POST /api/caja/insertar
   * Body: {descripcion}
   * NO requiere autenticacion
   */
  async insertar(datos: CreateMantenedorCajaDTO): Promise<MantenedorCajaData> {
    try {
      console.log('[MantenedorCajaService] Insertando caja:', datos);

      const url = buildApiUrl(this.endpoint + '/insertar');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[MantenedorCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MantenedorCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[MantenedorCajaService] Caja creada:', responseData);

      // Extraer datos del wrapper si existe
      const created = responseData.data || responseData;
      const normalized = this.normalizeData([created])[0];

      return normalized;

    } catch (error: any) {
      console.error('[MantenedorCajaService] Error al insertar caja:', error);
      throw error;
    }
  }

  /**
   * Actualiza una caja existente
   * PUT /api/caja/actualizar
   * Body: {codCaja, descripcion}
   * NO requiere autenticacion
   */
  async actualizar(datos: UpdateMantenedorCajaDTO): Promise<MantenedorCajaData> {
    try {
      console.log('[MantenedorCajaService] Actualizando caja:', datos);

      const url = buildApiUrl(this.endpoint + '/actualizar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[MantenedorCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MantenedorCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[MantenedorCajaService] Caja actualizada:', responseData);

      // Extraer datos del wrapper si existe
      const updated = responseData.data || responseData;
      const normalized = this.normalizeData([updated])[0];

      return normalized;

    } catch (error: any) {
      console.error('[MantenedorCajaService] Error al actualizar caja:', error);
      throw error;
    }
  }

  /**
   * Elimina una caja
   * PUT /api/caja/eliminar
   * Body: {codCaja}
   * NO requiere autenticacion
   */
  async eliminar(datos: DeleteMantenedorCajaDTO): Promise<void> {
    try {
      console.log('[MantenedorCajaService] Eliminando caja:', datos);

      const url = buildApiUrl(this.endpoint + '/eliminar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[MantenedorCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MantenedorCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[MantenedorCajaService] Caja eliminada exitosamente');

    } catch (error: any) {
      console.error('[MantenedorCajaService] Error al eliminar caja:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las cajas (alias para listar sin parametros)
   */
  async obtenerTodas(): Promise<MantenedorCajaData[]> {
    console.log('[MantenedorCajaService] Obteniendo todas las cajas');
    return this.listar();
  }

  /**
   * Busca cajas por descripcion
   */
  async buscarPorDescripcion(descripcion: string): Promise<MantenedorCajaData[]> {
    console.log('[MantenedorCajaService] Buscando por descripcion:', descripcion);
    return this.listar({ descripcion });
  }

  /**
   * Busca cajas por usuario
   */
  async buscarPorUsuario(codUsuario: number): Promise<MantenedorCajaData[]> {
    console.log('[MantenedorCajaService] Buscando por usuario:', codUsuario);
    return this.listar({ codUsuario });
  }
}

// Exportar instancia singleton
export const mantenedorCajaService = MantenedorCajaService.getInstance();
