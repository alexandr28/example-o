// src/services/serenazgoService.ts
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interfaces para Arbitrio de Serenazgo
 */
export interface SerenazgoData {
  codigo: number | null;
  anio: number | null;
  codGrupoUso: number | null;
  codCuadrante: number | null;
  tasaMensual: number;
  nombreCuadrante: string;
  grupoUso: string;
  tasaAnual: number;
}

export interface CrearSerenazgoDTO {
  anio: number;
  codGrupoUso: number;
  codCuadrante: number;
  tasaMensual: number;
}

export interface ActualizarSerenazgoDTO {
  anio: number;
  codGrupoUso: number;
  codCuadrante: number;
  tasaMensual: number;
}

export interface SerenazgoResponse {
  success: boolean;
  message: string;
  data: SerenazgoData[];
}

class SerenazgoService {
  private static instance: SerenazgoService;
  private endpoint = '/api/arbitrioSerenazgo';

  private constructor() {}

  static getInstance(): SerenazgoService {
    if (!SerenazgoService.instance) {
      SerenazgoService.instance = new SerenazgoService();
    }
    return SerenazgoService.instance;
  }

  /**
   * Listar arbitrios de serenazgo
   * GET http://26.161.18.122:8085/api/arbitrioSerenazgo?anio=2025
   * Sin autenticacion
   */
  async listarSerenazgo(params?: { anio?: number }): Promise<SerenazgoData[]> {
    try {
      console.log('[SerenazgoService] Listando arbitrios con params:', params);

      // Construir URL con query params
      const queryParams = new URLSearchParams();
      if (params?.anio) {
        queryParams.set('anio', params.anio.toString());
      }

      const url = `${API_CONFIG.baseURL}${this.endpoint}${params?.anio ? `?${queryParams.toString()}` : ''}`;
      console.log('[SerenazgoService] URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO autenticacion
        }
      });

      console.log('[SerenazgoService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SerenazgoService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[SerenazgoService] Datos recibidos:', responseData);

      // Manejar estructura con wrapper {success, data}
      if (responseData && typeof responseData === 'object' && responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        console.log('[SerenazgoService] Total registros:', data.length);

        // Normalizar datos
        const datosNormalizados = data.map((item: any) => ({
          codigo: item.codigo || null,
          anio: item.anio || null,
          codGrupoUso: item.codGrupoUso || null,
          codCuadrante: item.codCuadrante || null,
          tasaMensual: parseFloat(item.tasaMensual) || 0,
          nombreCuadrante: item.nombreCuadrante || '',
          grupoUso: item.grupoUso || '',
          tasaAnual: parseFloat(item.tasaAnual) || 0
        }));

        return datosNormalizados;
      }

      // Si es array directo
      if (Array.isArray(responseData)) {
        const datosNormalizados = responseData.map((item: any) => ({
          codigo: item.codigo || null,
          anio: item.anio || null,
          codGrupoUso: item.codGrupoUso || null,
          codCuadrante: item.codCuadrante || null,
          tasaMensual: parseFloat(item.tasaMensual) || 0,
          nombreCuadrante: item.nombreCuadrante || '',
          grupoUso: item.grupoUso || '',
          tasaAnual: parseFloat(item.tasaAnual) || 0
        }));

        return datosNormalizados;
      }

      return [];

    } catch (error: any) {
      console.error('[SerenazgoService] Error listando serenazgo:', error);
      throw error;
    }
  }

  /**
   * Crear arbitrio de serenazgo
   * POST http://26.161.18.122:8085/api/arbitrioSerenazgo
   * Sin autenticacion
   * Body: { anio, codGrupoUso, codCuadrante, tasaMensual }
   */
  async crearSerenazgo(datos: CrearSerenazgoDTO): Promise<SerenazgoData> {
    try {
      console.log('[SerenazgoService] Creando arbitrio de serenazgo:', datos);

      // Validar datos requeridos
      if (!datos.anio || !datos.codGrupoUso || !datos.codCuadrante || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para crear el arbitrio de serenazgo');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        codGrupoUso: Number(datos.codGrupoUso),
        codCuadrante: Number(datos.codCuadrante),
        tasaMensual: Number(datos.tasaMensual)
      };

      console.log('[SerenazgoService] Datos a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('[SerenazgoService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO autenticacion
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[SerenazgoService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SerenazgoService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[SerenazgoService] Arbitrio creado:', responseData);

      // Normalizar respuesta
      const nuevoArbitrio: SerenazgoData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        codGrupoUso: responseData.codGrupoUso || datos.codGrupoUso,
        codCuadrante: responseData.codCuadrante || datos.codCuadrante,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        nombreCuadrante: responseData.nombreCuadrante || '',
        grupoUso: responseData.grupoUso || '',
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12)
      };

      NotificationService.success('Arbitrio de serenazgo creado exitosamente');
      return nuevoArbitrio;

    } catch (error: any) {
      console.error('[SerenazgoService] Error creando serenazgo:', error);
      NotificationService.error(error.message || 'Error al crear arbitrio de serenazgo');
      throw error;
    }
  }

  /**
   * Actualizar arbitrio de serenazgo
   * PUT http://26.161.18.122:8085/api/arbitrioSerenazgo
   * Sin autenticacion
   * Body: { anio, codGrupoUso, codCuadrante, tasaMensual }
   */
  async actualizarSerenazgo(datos: ActualizarSerenazgoDTO): Promise<SerenazgoData> {
    try {
      console.log('[SerenazgoService] Actualizando arbitrio de serenazgo:', datos);

      // Validar datos requeridos
      if (!datos.anio || !datos.codGrupoUso || !datos.codCuadrante || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para actualizar el arbitrio de serenazgo');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        codGrupoUso: Number(datos.codGrupoUso),
        codCuadrante: Number(datos.codCuadrante),
        tasaMensual: Number(datos.tasaMensual)
      };

      console.log('[SerenazgoService] Datos a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('[SerenazgoService] URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO autenticacion
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[SerenazgoService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SerenazgoService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[SerenazgoService] Arbitrio actualizado:', responseData);

      // Normalizar respuesta
      const arbitrioActualizado: SerenazgoData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        codGrupoUso: responseData.codGrupoUso || datos.codGrupoUso,
        codCuadrante: responseData.codCuadrante || datos.codCuadrante,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        nombreCuadrante: responseData.nombreCuadrante || '',
        grupoUso: responseData.grupoUso || '',
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12)
      };

      NotificationService.success('Arbitrio de serenazgo actualizado exitosamente');
      return arbitrioActualizado;

    } catch (error: any) {
      console.error('[SerenazgoService] Error actualizando serenazgo:', error);
      NotificationService.error(error.message || 'Error al actualizar arbitrio de serenazgo');
      throw error;
    }
  }
}

export default SerenazgoService.getInstance();
