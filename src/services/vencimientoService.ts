// src/services/vencimientoService.ts
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos de Vencimiento
 * Basado en el JSON de respuesta del API
 */
export interface VencimientoData {
  anio: number;
  mes: string;
  tipoImpuesto: string;
  diaSemana: string;
  ultimoDiaHabil: number; // Timestamp
  ultimoDiaHabilStr: string; // Formato: "YYYY-MM-DD"
}

/**
 * DTO para crear vencimientos por anio
 * Basado en el JSON del POST
 */
export interface CreateVencimientoDTO {
  anio: number;
}

/**
 * Servicio para gestionar los vencimientos
 * API Base: http://26.161.18.122:8085/api/vencimiento
 * NO requiere autenticacion
 */
class VencimientoService {
  private static instance: VencimientoService;
  private readonly endpoint = '/api/vencimiento';

  private constructor() {}

  static getInstance(): VencimientoService {
    if (!VencimientoService.instance) {
      VencimientoService.instance = new VencimientoService();
    }
    return VencimientoService.instance;
  }

  /**
   * Obtiene los vencimientos por anio usando query params
   * URL: GET http://26.161.18.122:8085/api/vencimiento?anio=2024
   * NO requiere autenticacion
   *
   * Ejemplo de respuesta JSON (array):
   * [
   *   {
   *     "anio": 2024,
   *     "mes": "Enero",
   *     "tipoImpuesto": "Arbitrial",
   *     "diaSemana": "Miercoles",
   *     "ultimoDiaHabil": 1706677200000,
   *     "ultimoDiaHabilStr": "2024-01-31"
   *   },
   *   ...
   * ]
   */
  async obtenerPorAnio(anio: number): Promise<VencimientoData[]> {
    try {
      console.log('[VencimientoService] Obteniendo vencimientos del anio:', anio);

      // Construir URL con query params
      const queryParams = new URLSearchParams({
        anio: anio.toString()
      });

      const url = `${API_CONFIG.baseURL}${this.endpoint}?${queryParams.toString()}`;

      console.log('[VencimientoService] GET URL:', url);

      // Peticion GET sin autenticacion
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticacion
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      console.log('[VencimientoService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VencimientoService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestURL: url
        });

        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[VencimientoService] Vencimientos obtenidos:', responseData);

      // Extraer el array del wrapper si existe
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      // Si ya es un array directamente
      if (Array.isArray(responseData)) {
        return responseData;
      }

      // Si no es ninguno de los anteriores, retornar array vacío
      return [];

    } catch (error: any) {
      console.error('[VencimientoService] Error obteniendo vencimientos:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los vencimientos (sin filtro de anio)
   * URL: GET http://26.161.18.122:8085/api/vencimiento
   * NO requiere autenticacion
   */
  async obtenerTodos(): Promise<VencimientoData[]> {
    try {
      console.log('[VencimientoService] Obteniendo todos los vencimientos');

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;

      console.log('[VencimientoService] GET URL:', url);

      // Peticion GET sin autenticacion
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      console.log('[VencimientoService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VencimientoService] Error Response:', errorText);
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[VencimientoService] Vencimientos obtenidos:', responseData);

      // Extraer el array del wrapper si existe
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      // Si ya es un array directamente
      if (Array.isArray(responseData)) {
        return responseData;
      }

      // Si no es ninguno de los anteriores, retornar array vacío
      return [];

    } catch (error: any) {
      console.error('[VencimientoService] Error obteniendo vencimientos:', error);
      throw error;
    }
  }

  /**
   * Crea vencimientos para un anio especifico usando POST sin autenticacion con JSON
   * URL: POST http://26.161.18.122:8085/api/vencimiento
   * NO requiere autenticacion
   *
   * Estructura JSON:
   * {
   *   "anio": 2025
   * }
   */
  async crear(datos: CreateVencimientoDTO): Promise<VencimientoData[]> {
    try {
      console.log('[VencimientoService] Creando vencimientos:', datos);

      // Validar que el anio este presente
      if (!datos.anio) {
        throw new Error('Falta el anio para crear los vencimientos');
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        anio: Number(datos.anio)
      };

      console.log('[VencimientoService] Datos a enviar:', datosParaEnviar);
      console.log('[VencimientoService] JSON stringificado:', JSON.stringify(datosParaEnviar, null, 2));

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;

      console.log('[VencimientoService] POST URL:', url);

      // Peticion POST sin autenticacion usando JSON
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticacion
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[VencimientoService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VencimientoService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestURL: url
        });

        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[VencimientoService] Vencimientos creados exitosamente:', responseData);

      NotificationService.success('Vencimientos creados exitosamente');

      // Extraer el array del wrapper si existe
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      // Si ya es un array directamente
      if (Array.isArray(responseData)) {
        return responseData;
      }

      // Si no es ninguno de los anteriores, retornar array vacío
      return [];

    } catch (error: any) {
      console.error('[VencimientoService] Error creando vencimientos:', error);
      NotificationService.error(error.message || 'Error al crear los vencimientos');
      throw error;
    }
  }
}

// Exportar la instancia singleton
const vencimientoService = VencimientoService.getInstance();
export default vencimientoService;

// Tambien exportar la clase para tests
export { VencimientoService };
