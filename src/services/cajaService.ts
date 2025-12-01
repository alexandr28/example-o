// src/services/cajaService.ts
import BaseApiService from './BaseApiService';
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Caja
 */
export interface CajaData {
  codCaja: number;
  descripcion: string;
  usuario: string | null;
  numcaja: string;
  estado: string;
}

export interface CreateCajaDTO {
  descripcion: string;
}

export interface UpdateCajaDTO {
  codCaja: number;
  descripcion: string;
}

export interface DeleteCajaDTO {
  codCaja: number;
}

export interface ListarCajaParams {
  descripcion?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestion de cajas
 *
 * IMPORTANTE: Este servicio NO requiere autenticacion
 * Todos los metodos (GET, POST, PUT, DELETE) funcionan sin token
 */
class CajaService extends BaseApiService<CajaData, CreateCajaDTO, UpdateCajaDTO> {
  private static instance: CajaService;

  public static getInstance(): CajaService {
    if (!CajaService.instance) {
      CajaService.instance = new CajaService();
    }
    return CajaService.instance;
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
        validateItem: (item: CajaData) => {
          return !!(item.codCaja && item.numcaja);
        }
      },
      'caja'
    );
  }

  /**
   * Lista cajas con filtros
   * GET /api/caja/listar?descripcion=C&codUsuario=1
   * NO requiere autenticacion
   */
  async listar(params?: ListarCajaParams): Promise<CajaData[]> {
    try {
      console.log('[CajaService] Listando cajas con parametros:', params);

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
      console.log('[CajaService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`[CajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[CajaService] Datos obtenidos:', responseData);

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
      console.error('[CajaService] Error listando cajas:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva caja
   * POST /api/caja/insertar
   * Body: {descripcion}
   * NO requiere autenticacion
   */
  async insertar(datos: CreateCajaDTO): Promise<CajaData> {
    try {
      console.log('[CajaService] Insertando caja:', datos);

      const url = buildApiUrl(this.endpoint + '/insertar');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[CajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[CajaService] Caja creada:', responseData);

      // Extraer datos del wrapper si existe
      const created = responseData.data || responseData;
      const normalized = this.normalizeData([created])[0];

      return normalized;

    } catch (error: any) {
      console.error('[CajaService] Error al insertar caja:', error);
      throw error;
    }
  }

  /**
   * Actualiza una caja existente
   * PUT /api/caja/actualizar
   * Body: {codCaja, descripcion}
   * NO requiere autenticacion
   */
  async actualizar(datos: UpdateCajaDTO): Promise<CajaData> {
    try {
      console.log('[CajaService] Actualizando caja:', datos);

      const url = buildApiUrl(this.endpoint + '/actualizar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[CajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[CajaService] Caja actualizada:', responseData);

      // Extraer datos del wrapper si existe
      const updated = responseData.data || responseData;
      const normalized = this.normalizeData([updated])[0];

      return normalized;

    } catch (error: any) {
      console.error('[CajaService] Error al actualizar caja:', error);
      throw error;
    }
  }

  /**
   * Elimina una caja
   * DELETE /api/caja/eliminar
   * Body: {codCaja}
   * NO requiere autenticacion
   */
  async eliminar(datos: DeleteCajaDTO): Promise<void> {
    try {
      console.log('[CajaService] Eliminando caja:', datos);

      const url = buildApiUrl(this.endpoint + '/eliminar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[CajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[CajaService] Caja eliminada exitosamente');

    } catch (error: any) {
      console.error('[CajaService] Error al eliminar caja:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las cajas (alias para listar sin parametros)
   */
  async obtenerTodas(): Promise<CajaData[]> {
    console.log('[CajaService] Obteniendo todas las cajas');
    return this.listar();
  }

  /**
   * Busca cajas por descripcion
   */
  async buscarPorDescripcion(descripcion: string): Promise<CajaData[]> {
    console.log('[CajaService] Buscando por descripcion:', descripcion);
    return this.listar({ descripcion });
  }

  /**
   * Busca cajas por usuario
   */
  async buscarPorUsuario(codUsuario: number): Promise<CajaData[]> {
    console.log('[CajaService] Buscando por usuario:', codUsuario);
    return this.listar({ codUsuario });
  }

  /**
   * Obtiene cajas disponibles
   */
  async obtenerDisponibles(): Promise<CajaData[]> {
    console.log('[CajaService] Obteniendo cajas disponibles');
    const todas = await this.listar();
    return todas.filter(caja => caja.estado === 'DISPONIBLE');
  }
}

// Exportar instancia singleton
export const cajaService = CajaService.getInstance();
