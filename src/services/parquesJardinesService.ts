// src/services/parquesJardinesService.ts
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interfaces para Arbitrio de Parques y Jardines
 */
export interface ParquesJardinesData {
  codigo: number | null;
  anio: number | null;
  codRuta: number | null;
  codUbicacion: number | null;
  tasaMensual: number;
  nombreRuta: string;
  ubicacionAreaVerde: string | null;
  tasaAnual: number;
}

export interface CrearParquesJardinesDTO {
  anio: number;
  codRuta: number;
  codUbicacion: number;
  tasaMensual: number;
}

export interface ActualizarParquesJardinesDTO {
  anio: number;
  codRuta: number;
  codUbicacion: number;
  tasaMensual: number;
}

export interface ParquesJardinesResponse {
  success: boolean;
  message: string;
  data: ParquesJardinesData[];
}

class ParquesJardinesService {
  private static instance: ParquesJardinesService;
  private endpoint = '/api/arbitrioParquesJardines';

  private constructor() {}

  static getInstance(): ParquesJardinesService {
    if (!ParquesJardinesService.instance) {
      ParquesJardinesService.instance = new ParquesJardinesService();
    }
    return ParquesJardinesService.instance;
  }

  /**
   * Listar arbitrios de parques y jardines
   * GET http://26.161.18.122:8085/api/arbitrioParquesJardines?anio=2026
   * Sin autenticacion
   */
  async listarParquesJardines(params?: { anio?: number }): Promise<ParquesJardinesData[]> {
    try {
      console.log('[ParquesJardinesService] Listando arbitrios con params:', params);

      // Construir URL con query params
      const queryParams = new URLSearchParams();
      if (params?.anio) {
        queryParams.set('anio', params.anio.toString());
      }

      const url = `${API_CONFIG.baseURL}${this.endpoint}${params?.anio ? `?${queryParams.toString()}` : ''}`;
      console.log('[ParquesJardinesService] URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO autenticacion
        }
      });

      console.log('[ParquesJardinesService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ParquesJardinesService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[ParquesJardinesService] Datos recibidos:', responseData);

      // Manejar estructura con wrapper {success, data}
      if (responseData && typeof responseData === 'object' && responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        console.log('[ParquesJardinesService] Total registros:', data.length);

        // Normalizar datos
        const datosNormalizados = data.map((item: any) => ({
          codigo: item.codigo || null,
          anio: item.anio || null,
          codRuta: item.codRuta || null,
          codUbicacion: item.codUbicacion || null,
          tasaMensual: parseFloat(item.tasaMensual) || 0,
          nombreRuta: item.nombreRuta || '',
          ubicacionAreaVerde: item.ubicacionAreaVerde || null,
          tasaAnual: parseFloat(item.tasaAnual) || 0
        }));

        return datosNormalizados;
      }

      // Si es array directo
      if (Array.isArray(responseData)) {
        const datosNormalizados = responseData.map((item: any) => ({
          codigo: item.codigo || null,
          anio: item.anio || null,
          codRuta: item.codRuta || null,
          codUbicacion: item.codUbicacion || null,
          tasaMensual: parseFloat(item.tasaMensual) || 0,
          nombreRuta: item.nombreRuta || '',
          ubicacionAreaVerde: item.ubicacionAreaVerde || null,
          tasaAnual: parseFloat(item.tasaAnual) || 0
        }));

        return datosNormalizados;
      }

      return [];

    } catch (error: any) {
      console.error('[ParquesJardinesService] Error listando parques y jardines:', error);
      throw error;
    }
  }

  /**
   * Crear arbitrio de parques y jardines
   * POST http://26.161.18.122:8085/api/arbitrioParquesJardines
   * Sin autenticacion
   * Body: { anio, codRuta, codUbicacion, tasaMensual }
   */
  async crearParquesJardines(datos: CrearParquesJardinesDTO): Promise<ParquesJardinesData> {
    try {
      console.log('[ParquesJardinesService] Creando arbitrio de parques y jardines:', datos);

      // Validar datos requeridos
      if (!datos.anio || !datos.codRuta || !datos.codUbicacion || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para crear el arbitrio de parques y jardines');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        codRuta: Number(datos.codRuta),
        codUbicacion: Number(datos.codUbicacion),
        tasaMensual: Number(datos.tasaMensual)
      };

      console.log('[ParquesJardinesService] Datos a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('[ParquesJardinesService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO autenticacion
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[ParquesJardinesService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ParquesJardinesService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[ParquesJardinesService] Arbitrio creado:', responseData);

      // Normalizar respuesta
      const nuevoArbitrio: ParquesJardinesData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        codRuta: responseData.codRuta || datos.codRuta,
        codUbicacion: responseData.codUbicacion || datos.codUbicacion,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        nombreRuta: responseData.nombreRuta || '',
        ubicacionAreaVerde: responseData.ubicacionAreaVerde || null,
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12)
      };

      NotificationService.success('Arbitrio de parques y jardines creado exitosamente');
      return nuevoArbitrio;

    } catch (error: any) {
      console.error('[ParquesJardinesService] Error creando parques y jardines:', error);
      NotificationService.error(error.message || 'Error al crear arbitrio de parques y jardines');
      throw error;
    }
  }

  /**
   * Actualizar arbitrio de parques y jardines
   * PUT http://26.161.18.122:8085/api/arbitrioParquesJardines
   * Sin autenticacion
   * Body: { anio, codRuta, codUbicacion, tasaMensual }
   */
  async actualizarParquesJardines(datos: ActualizarParquesJardinesDTO): Promise<ParquesJardinesData> {
    try {
      console.log('[ParquesJardinesService] Actualizando arbitrio de parques y jardines:', datos);

      // Validar datos requeridos
      if (!datos.anio || !datos.codRuta || !datos.codUbicacion || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para actualizar el arbitrio de parques y jardines');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        codRuta: Number(datos.codRuta),
        codUbicacion: Number(datos.codUbicacion),
        tasaMensual: Number(datos.tasaMensual)
      };

      console.log('[ParquesJardinesService] Datos a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('[ParquesJardinesService] URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO autenticacion
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[ParquesJardinesService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ParquesJardinesService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[ParquesJardinesService] Arbitrio actualizado:', responseData);

      // Normalizar respuesta
      const arbitrioActualizado: ParquesJardinesData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        codRuta: responseData.codRuta || datos.codRuta,
        codUbicacion: responseData.codUbicacion || datos.codUbicacion,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        nombreRuta: responseData.nombreRuta || '',
        ubicacionAreaVerde: responseData.ubicacionAreaVerde || null,
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12)
      };

      NotificationService.success('Arbitrio de parques y jardines actualizado exitosamente');
      return arbitrioActualizado;

    } catch (error: any) {
      console.error('[ParquesJardinesService] Error actualizando parques y jardines:', error);
      NotificationService.error(error.message || 'Error al actualizar arbitrio de parques y jardines');
      throw error;
    }
  }
}

export default ParquesJardinesService.getInstance();
