// src/services/asignacionCajaService.ts
import BaseApiService from './BaseApiService';
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para AsignacionCaja
 */
export interface AsignacionCajaData {
  codAsignacionCaja: number;
  codUsuario: number | null;
  codCaja: number | null;
  codTurno: number | null;
  fecha: number | null; // timestamp
  terminoBusqueda: string | null;
  numCaja: string;
  nombreUsuario: string;
  turno: string;
  estado: string;
  fechaStr: string;
}

export interface CreateAsignacionCajaDTO {
  codUsuario: number;
  codCaja: number;
  codTurno: number;
  fecha: string; // formato: "2025-11-07"
}

export interface UpdateAsignacionCajaDTO {
  codAsignacionCaja: number;
  codUsuario: number;
  codCaja: number;
  codTurno: number;
}

export interface DeleteAsignacionCajaDTO {
  codAsignacionCaja: number;
}

export interface ListarAsignacionCajaParams {
  terminoBusqueda?: string;
  fecha?: string; // formato: "2025-11-04"
  codUsuario?: number;
}

/**
 * Servicio para gestion de asignacion de caja
 *
 * IMPORTANTE: Este servicio NO requiere autenticacion
 * Todos los metodos (GET, POST, PUT, DELETE) funcionan sin token
 */
class AsignacionCajaService extends BaseApiService<AsignacionCajaData, CreateAsignacionCajaDTO, UpdateAsignacionCajaDTO> {
  private static instance: AsignacionCajaService;

  public static getInstance(): AsignacionCajaService {
    if (!AsignacionCajaService.instance) {
      AsignacionCajaService.instance = new AsignacionCajaService();
    }
    return AsignacionCajaService.instance;
  }

  private constructor() {
    super(
      '/api/asignacionCaja',
      {
        normalizeItem: (item: any) => ({
          codAsignacionCaja: item.codAsignacionCaja || 0,
          codUsuario: item.codUsuario ?? null,
          codCaja: item.codCaja ?? null,
          codTurno: item.codTurno ?? null,
          fecha: item.fecha ?? null,
          terminoBusqueda: item.terminoBusqueda ?? null,
          numCaja: item.numCaja || '',
          nombreUsuario: item.nombreUsuario || '',
          turno: item.turno || '',
          estado: item.estado || 'ACTIVO',
          fechaStr: item.fechaStr || ''
        }),
        validateItem: (item: AsignacionCajaData) => {
          return !!(item.codAsignacionCaja && item.numCaja);
        }
      },
      'asignacionCaja'
    );
  }

  /**
   * Lista asignaciones de caja con filtros
   * GET /api/asignacionCaja/listar?terminoBusqueda=h&fecha=2025-11-04&codUsuario=1
   * NO requiere autenticacion
   */
  async listar(params?: ListarAsignacionCajaParams): Promise<AsignacionCajaData[]> {
    try {
      console.log('[AsignacionCajaService] Listando asignaciones con parametros:', params);

      const url = buildApiUrl(this.endpoint + '/listar');

      // Construir query params
      const queryParams = new URLSearchParams();
      if (params?.terminoBusqueda) {
        queryParams.append('terminoBusqueda', params.terminoBusqueda);
      }
      if (params?.fecha) {
        queryParams.append('fecha', params.fecha);
      }
      if (params?.codUsuario !== undefined) {
        queryParams.append('codUsuario', String(params.codUsuario));
      }

      const getUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      console.log('[AsignacionCajaService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`[AsignacionCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AsignacionCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[AsignacionCajaService] Datos obtenidos:', responseData);

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
      console.error('[AsignacionCajaService] Error listando asignaciones:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva asignacion de caja
   * POST /api/asignacionCaja/insertar
   * Body: {codUsuario, codCaja, codTurno, fecha}
   * NO requiere autenticacion
   */
  async insertar(datos: CreateAsignacionCajaDTO): Promise<AsignacionCajaData> {
    try {
      console.log('[AsignacionCajaService] Insertando asignacion:', datos);

      const url = buildApiUrl(this.endpoint + '/insertar');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[AsignacionCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AsignacionCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[AsignacionCajaService] Asignacion creada:', responseData);

      // Extraer datos del wrapper si existe
      const created = responseData.data || responseData;
      const normalized = this.normalizeData([created])[0];

      return normalized;

    } catch (error: any) {
      console.error('[AsignacionCajaService] Error al insertar asignacion:', error);
      throw error;
    }
  }

  /**
   * Actualiza una asignacion de caja existente
   * PUT /api/asignacionCaja/actualizar
   * Body: {codAsignacionCaja, codUsuario, codCaja, codTurno}
   * NO requiere autenticacion
   */
  async actualizar(datos: UpdateAsignacionCajaDTO): Promise<AsignacionCajaData> {
    try {
      console.log('[AsignacionCajaService] Actualizando asignacion:', datos);

      const url = buildApiUrl(this.endpoint + '/actualizar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[AsignacionCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AsignacionCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[AsignacionCajaService] Asignacion actualizada:', responseData);

      // Extraer datos del wrapper si existe
      const updated = responseData.data || responseData;
      const normalized = this.normalizeData([updated])[0];

      return normalized;

    } catch (error: any) {
      console.error('[AsignacionCajaService] Error al actualizar asignacion:', error);
      throw error;
    }
  }

  /**
   * Elimina una asignacion de caja
   * PUT /api/asignacionCaja/eliminar
   * Body: {codAsignacionCaja}
   * NO requiere autenticacion
   */
  async eliminar(datos: DeleteAsignacionCajaDTO): Promise<void> {
    try {
      console.log('[AsignacionCajaService] Eliminando asignacion:', datos);

      const url = buildApiUrl(this.endpoint + '/eliminar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[AsignacionCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AsignacionCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[AsignacionCajaService] Asignacion eliminada exitosamente');

    } catch (error: any) {
      console.error('[AsignacionCajaService] Error al eliminar asignacion:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las asignaciones (alias para listar sin parametros)
   */
  async obtenerTodas(): Promise<AsignacionCajaData[]> {
    console.log('[AsignacionCajaService] Obteniendo todas las asignaciones');
    return this.listar();
  }

  /**
   * Busca asignaciones por termino de busqueda
   */
  async buscarPorTermino(termino: string): Promise<AsignacionCajaData[]> {
    console.log('[AsignacionCajaService] Buscando por termino:', termino);
    return this.listar({ terminoBusqueda: termino });
  }

  /**
   * Busca asignaciones por fecha
   */
  async buscarPorFecha(fecha: string): Promise<AsignacionCajaData[]> {
    console.log('[AsignacionCajaService] Buscando por fecha:', fecha);
    return this.listar({ fecha });
  }

  /**
   * Busca asignaciones por usuario
   */
  async buscarPorUsuario(codUsuario: number): Promise<AsignacionCajaData[]> {
    console.log('[AsignacionCajaService] Buscando por usuario:', codUsuario);
    return this.listar({ codUsuario });
  }
}

// Exportar instancia singleton
export const asignacionCajaService = AsignacionCajaService.getInstance();
