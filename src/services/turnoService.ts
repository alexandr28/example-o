// src/services/turnoService.ts
import BaseApiService from './BaseApiService';
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Turno
 */
export interface TurnoData {
  codTurno: number;
  nombreTurno: string;
  horario: string;
}

export interface CreateTurnoDTO {
  nombreTurno: string;
  horario: string;
}

export interface UpdateTurnoDTO {
  codTurno: number;
  nombreTurno: string;
  horario: string;
}

export interface DeleteTurnoDTO {
  codTurno: number;
}

export interface ListarTurnoParams {
  nombreTurno?: string;
}

/**
 * Servicio para gestion de turnos
 *
 * IMPORTANTE: Este servicio NO requiere autenticacion
 * Todos los metodos (GET, POST, PUT, DELETE) funcionan sin token
 */
class TurnoService extends BaseApiService<TurnoData, CreateTurnoDTO, UpdateTurnoDTO> {
  private static instance: TurnoService;

  public static getInstance(): TurnoService {
    if (!TurnoService.instance) {
      TurnoService.instance = new TurnoService();
    }
    return TurnoService.instance;
  }

  private constructor() {
    super(
      '/api/turno',
      {
        normalizeItem: (item: any) => ({
          codTurno: item.codTurno || 0,
          nombreTurno: item.nombreTurno || '',
          horario: item.horario || ''
        }),
        validateItem: (item: TurnoData) => {
          return !!(item.codTurno && item.nombreTurno);
        }
      },
      'turno'
    );
  }

  /**
   * Lista todos los turnos
   * GET /api/turno
   * NO requiere autenticacion
   */
  async listar(params?: ListarTurnoParams): Promise<TurnoData[]> {
    try {
      console.log('[TurnoService] Listando turnos con parametros:', params);

      const url = buildApiUrl(this.endpoint);

      // Construir query params si existen
      const queryParams = new URLSearchParams();
      if (params?.nombreTurno) {
        queryParams.append('nombreTurno', params.nombreTurno);
      }

      const getUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      console.log('[TurnoService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`[TurnoService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TurnoService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[TurnoService] Datos obtenidos:', responseData);

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
      console.error('[TurnoService] Error listando turnos:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo turno
   * POST /api/turno/insertar
   * Body: {nombreTurno, horario}
   * NO requiere autenticacion
   */
  async insertar(datos: CreateTurnoDTO): Promise<TurnoData> {
    try {
      console.log('[TurnoService] Insertando turno:', datos);

      const url = buildApiUrl(this.endpoint + '/insertar');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[TurnoService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TurnoService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[TurnoService] Turno creado:', responseData);

      // Extraer datos del wrapper si existe
      const created = responseData.data || responseData;
      const normalized = this.normalizeData([created])[0];

      return normalized;

    } catch (error: any) {
      console.error('[TurnoService] Error al insertar turno:', error);
      throw error;
    }
  }

  /**
   * Actualiza un turno existente
   * PUT /api/turno/actualizar
   * Body: {codTurno, nombreTurno, horario}
   * NO requiere autenticacion
   */
  async actualizar(datos: UpdateTurnoDTO): Promise<TurnoData> {
    try {
      console.log('[TurnoService] Actualizando turno:', datos);

      const url = buildApiUrl(this.endpoint + '/actualizar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[TurnoService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TurnoService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[TurnoService] Turno actualizado:', responseData);

      // Extraer datos del wrapper si existe
      const updated = responseData.data || responseData;
      const normalized = this.normalizeData([updated])[0];

      return normalized;

    } catch (error: any) {
      console.error('[TurnoService] Error al actualizar turno:', error);
      throw error;
    }
  }

  /**
   * Elimina un turno
   * DELETE /api/turno/eliminar
   * Body: {codTurno}
   * NO requiere autenticacion
   */
  async eliminar(datos: DeleteTurnoDTO): Promise<void> {
    try {
      console.log('[TurnoService] Eliminando turno:', datos);

      const url = buildApiUrl(this.endpoint + '/eliminar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[TurnoService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TurnoService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[TurnoService] Turno eliminado exitosamente');

    } catch (error: any) {
      console.error('[TurnoService] Error al eliminar turno:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los turnos (alias para listar sin parametros)
   */
  async obtenerTodos(): Promise<TurnoData[]> {
    console.log('[TurnoService] Obteniendo todos los turnos');
    return this.listar();
  }

  /**
   * Busca turnos por nombre
   */
  async buscarPorNombre(nombreTurno: string): Promise<TurnoData[]> {
    console.log('[TurnoService] Buscando por nombre:', nombreTurno);
    return this.listar({ nombreTurno });
  }
}

// Exportar instancia singleton
export const turnoService = TurnoService.getInstance();
