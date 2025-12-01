// src/services/resolucionInteresService.ts
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos de Resolución de Interés
 * Basado en el JSON de respuesta del API
 */
export interface ResolucionInteresData {
  codResolucionInteres: number;
  descripcion: string;
  anioFiscal: number | null;
  tasa: number | null;
  fechaInicio: number; // Timestamp
  fechaFin: number; // Timestamp
  codEstado: string;
  estado: string;
  fechaInicioStr: string; // Formato: "YYYY-MM-DD"
  fechaFinStr: string; // Formato: "YYYY-MM-DD"
}

/**
 * DTO para crear una nueva resolución de interés
 * Basado en el JSON del POST
 */
export interface CreateResolucionInteresDTO {
  anioFiscal: number;
  descripcion: string;
  tasa: number;
}

/**
 * DTO para actualizar una resolución de interés
 * Basado en el JSON del PUT
 */
export interface UpdateResolucionInteresDTO {
  codResolucionInteres: number;
  anioFiscal: number;
  descripcion: string;
  tasa: number;
}

/**
 * DTO para eliminar una resolución de interés
 * Basado en el JSON del DELETE
 */
export interface DeleteResolucionInteresDTO {
  codResolucionInteres: number;
}

/**
 * Servicio para gestionar las resoluciones de interés
 * API Base: http://26.161.18.122:8085/api/resolucionInteres
 * NO requiere autenticación
 */
class ResolucionInteresService {
  private static instance: ResolucionInteresService;
  private readonly endpoint = '/api/resolucionInteres';

  private constructor() {}

  static getInstance(): ResolucionInteresService {
    if (!ResolucionInteresService.instance) {
      ResolucionInteresService.instance = new ResolucionInteresService();
    }
    return ResolucionInteresService.instance;
  }

  /**
   * Obtiene una resolución de interés por su código usando query params
   * URL: GET http://26.161.18.122:8085/api/resolucionInteres?codResolucionInteres=2
   * NO requiere autenticación
   *
   * Ejemplo de respuesta JSON:
   * {
   *   "codResolucionInteres": 2,
   *   "descripcion": "O.M. N° 025-2025-MDE ACTUALIZADA",
   *   "anioFiscal": null,
   *   "tasa": null,
   *   "fechaInicio": 1735707600000,
   *   "fechaFin": 1767157200000,
   *   "codEstado": "0201",
   *   "estado": "ACTIVO",
   *   "fechaInicioStr": "2025-01-01",
   *   "fechaFinStr": "2025-12-31"
   * }
   */
  async obtenerPorCodigo(codResolucionInteres: number): Promise<ResolucionInteresData> {
    try {
      console.log('[ResolucionInteresService] Obteniendo resolución:', codResolucionInteres);

      // Construir URL con query params
      const queryParams = new URLSearchParams({
        codResolucionInteres: codResolucionInteres.toString()
      });

      const url = `${API_CONFIG.baseURL}${this.endpoint}?${queryParams.toString()}`;

      console.log('[ResolucionInteresService] GET URL:', url);

      // Petición GET sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      console.log('[ResolucionInteresService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ResolucionInteresService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestURL: url
        });

        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[ResolucionInteresService] Resolución obtenida:', responseData);

      // Extraer los datos del wrapper si existe
      if (responseData && responseData.data) {
        // Si data es un array, retornar el primer elemento
        if (Array.isArray(responseData.data) && responseData.data.length > 0) {
          return responseData.data[0];
        }
        // Si data no es array, retornarlo directamente
        return responseData.data;
      }

      // Si no hay wrapper, retornar responseData directamente
      return responseData;

    } catch (error: any) {
      console.error('[ResolucionInteresService] Error obteniendo resolución:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las resoluciones de interés
   * URL: GET http://26.161.18.122:8085/api/resolucionInteres
   * NO requiere autenticación
   */
  async obtenerTodas(): Promise<ResolucionInteresData[]> {
    try {
      console.log('[ResolucionInteresService] Obteniendo todas las resoluciones');

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;

      console.log('[ResolucionInteresService] GET URL:', url);

      // Petición GET sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      console.log('[ResolucionInteresService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ResolucionInteresService] Error Response:', errorText);
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[ResolucionInteresService] Resoluciones obtenidas:', responseData);

      // Extraer el array del wrapper si existe
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      // Si ya es un array directamente
      if (Array.isArray(responseData)) {
        return responseData;
      }

      // Si no es ninguno de los anteriores, retornar array vacio
      return [];

    } catch (error: any) {
      console.error('[ResolucionInteresService] Error obteniendo resoluciones:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva resolución de interés usando POST sin autenticación con JSON
   * URL: POST http://26.161.18.122:8085/api/resolucionInteres
   * NO requiere autenticación
   *
   * Estructura JSON:
   * {
   *   "anioFiscal": 2025,
   *   "descripcion": "PRUEBA DE RESOLUCION INTERES",
   *   "tasa": 9.7
   * }
   */
  async crear(datos: CreateResolucionInteresDTO): Promise<ResolucionInteresData> {
    try {
      console.log('[ResolucionInteresService] Creando resolución de interés:', datos);

      // Validar que los datos requeridos estén presentes
      if (!datos.anioFiscal || !datos.descripcion || datos.tasa === undefined) {
        throw new Error('Faltan datos requeridos para crear la resolución de interés');
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        anioFiscal: Number(datos.anioFiscal),
        descripcion: String(datos.descripcion),
        tasa: Number(datos.tasa)
      };

      console.log('[ResolucionInteresService] Datos a enviar:', datosParaEnviar);
      console.log('[ResolucionInteresService] JSON stringificado:', JSON.stringify(datosParaEnviar, null, 2));

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;

      console.log('[ResolucionInteresService] POST URL:', url);

      // Petición POST sin autenticación usando JSON
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[ResolucionInteresService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ResolucionInteresService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestURL: url
        });

        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[ResolucionInteresService] Resolución creada exitosamente:', responseData);

      NotificationService.success('Resolución de interés creada exitosamente');

      // Extraer los datos del wrapper si existe
      if (responseData && responseData.data) {
        return responseData.data;
      }

      return responseData;

    } catch (error: any) {
      console.error('[ResolucionInteresService] Error creando resolución:', error);
      NotificationService.error(error.message || 'Error al crear la resolución de interés');
      throw error;
    }
  }

  /**
   * Actualiza una resolución de interés usando PUT sin autenticación con JSON
   * URL: PUT http://26.161.18.122:8085/api/resolucionInteres
   * NO requiere autenticación
   *
   * Estructura JSON:
   * {
   *   "codResolucionInteres": 1,
   *   "anioFiscal": 2024,
   *   "descripcion": "PRUEBA DE RESOLUCION INTERES",
   *   "tasa": 9.7
   * }
   */
  async actualizar(datos: UpdateResolucionInteresDTO): Promise<ResolucionInteresData> {
    try {
      console.log('[ResolucionInteresService] Actualizando resolución de interés:', datos);

      // Validar que los datos requeridos estén presentes
      if (!datos.codResolucionInteres || !datos.anioFiscal || !datos.descripcion || datos.tasa === undefined) {
        throw new Error('Faltan datos requeridos para actualizar la resolución de interés');
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        codResolucionInteres: Number(datos.codResolucionInteres),
        anioFiscal: Number(datos.anioFiscal),
        descripcion: String(datos.descripcion),
        tasa: Number(datos.tasa)
      };

      console.log('[ResolucionInteresService] Datos a enviar:', datosParaEnviar);
      console.log('[ResolucionInteresService] JSON stringificado:', JSON.stringify(datosParaEnviar, null, 2));

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;

      console.log('[ResolucionInteresService] PUT URL:', url);

      // Petición PUT sin autenticación usando JSON
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[ResolucionInteresService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ResolucionInteresService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestURL: url
        });

        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      const responseData = await response.json();
      console.log('[ResolucionInteresService] Resolución actualizada exitosamente:', responseData);

      NotificationService.success('Resolución de interés actualizada exitosamente');

      // Extraer los datos del wrapper si existe
      if (responseData && responseData.data) {
        return responseData.data;
      }

      return responseData;

    } catch (error: any) {
      console.error('[ResolucionInteresService] Error actualizando resolución:', error);
      NotificationService.error(error.message || 'Error al actualizar la resolución de interés');
      throw error;
    }
  }

  /**
   * Elimina una resolución de interés usando DELETE sin autenticación con JSON
   * URL: DELETE http://26.161.18.122:8085/api/resolucionInteres
   * NO requiere autenticación
   *
   * Estructura JSON:
   * {
   *   "codResolucionInteres": 1
   * }
   */
  async eliminar(datos: DeleteResolucionInteresDTO): Promise<void> {
    try {
      console.log('[ResolucionInteresService] Eliminando resolución de interés:', datos);

      // Validar que el código esté presente
      if (!datos.codResolucionInteres) {
        throw new Error('Falta el código de la resolución de interés para eliminar');
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        codResolucionInteres: Number(datos.codResolucionInteres)
      };

      console.log('[ResolucionInteresService] Datos a enviar:', datosParaEnviar);
      console.log('[ResolucionInteresService] JSON stringificado:', JSON.stringify(datosParaEnviar, null, 2));

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;

      console.log('[ResolucionInteresService] PUT URL:', url);

      // Petición PUT sin autenticación usando JSON
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[ResolucionInteresService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ResolucionInteresService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          requestURL: url
        });

        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }

      console.log('[ResolucionInteresService] Resolución eliminada exitosamente');

      NotificationService.success('Resolución de interés eliminada exitosamente');

    } catch (error: any) {
      console.error('[ResolucionInteresService] Error eliminando resolución:', error);
      NotificationService.error(error.message || 'Error al eliminar la resolución de interés');
      throw error;
    }
  }
}

// Exportar la instancia singleton
const resolucionInteresService = ResolucionInteresService.getInstance();
export default resolucionInteresService;

// También exportar la clase para tests
export { ResolucionInteresService };
