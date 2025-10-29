// src/services/limpienzaPublicaService.ts
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interfaces para Arbitrio de Limpieza Publica
 */
export interface LimpiezaPublicaData {
  codigo: number | null;
  anio: number | null;
  tasaMensual: number;
  codZona: number | null;
  codCriterio: number | null;
  nombreZona: string | null;
  tasaAnual: number;
  criterioUso: string | null;
}

export interface CrearLimpiezaPublicaDTO {
  anio: number;
  tasaMensual: number;
  codZona: number;
  codCriterio: number;
}

export interface ActualizarLimpiezaPublicaDTO {
  anio: number;
  tasaMensual: number;
  codZona: number;
  codCriterio: number;
}

export interface LimpiezaPublicaResponse {
  success: boolean;
  message: string;
  data: LimpiezaPublicaData[];
}

class LimpiezaPublicaService {
  private static instance: LimpiezaPublicaService;
  private endpoint = '/api/arbitrioLimpiezaPublica';

  private constructor() {}

  static getInstance(): LimpiezaPublicaService {
    if (!LimpiezaPublicaService.instance) {
      LimpiezaPublicaService.instance = new LimpiezaPublicaService();
    }
    return LimpiezaPublicaService.instance;
  }

  /**
   * Listar arbitrios de limpieza publica
   * GET http://26.161.18.122:8085/api/arbitrioLimpiezaPublica?anio=2026
   * Sin autenticacion
   */
  async listarLimpiezaPublica(params?: { anio?: number }): Promise<LimpiezaPublicaData[]> {
    try {
      console.log('[LimpiezaPublicaService] Listando arbitrios con params:', params);

      const queryParams = new URLSearchParams();
      if (params?.anio) {
        queryParams.set('anio', params.anio.toString());
      }

      const url = `${API_CONFIG.baseURL}${this.endpoint}${params?.anio ? `?${queryParams.toString()}` : ''}`;
      console.log('[LimpiezaPublicaService] URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('[LimpiezaPublicaService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LimpiezaPublicaService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[LimpiezaPublicaService] Datos recibidos:', responseData);

      return this.normalizarDatos(responseData);

    } catch (error: any) {
      console.error('[LimpiezaPublicaService] Error listando limpieza publica:', error);
      throw error;
    }
  }

  /**
   * Listar arbitrios de limpieza publica - OTROS
   * GET http://26.161.18.122:8085/api/arbitrioLimpiezaPublica/listarArbitrioLimpiezaPublicaOtros?anio=2026
   * Sin autenticacion
   */
  async listarLimpiezaPublicaOtros(params?: { anio?: number }): Promise<LimpiezaPublicaData[]> {
    try {
      console.log('[LimpiezaPublicaService] Listando arbitrios OTROS con params:', params);

      const queryParams = new URLSearchParams();
      if (params?.anio) {
        queryParams.set('anio', params.anio.toString());
      }

      const url = `${API_CONFIG.baseURL}${this.endpoint}/listarArbitrioLimpiezaPublicaOtros${params?.anio ? `?${queryParams.toString()}` : ''}`;
      console.log('[LimpiezaPublicaService] URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('[LimpiezaPublicaService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LimpiezaPublicaService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[LimpiezaPublicaService] Datos OTROS recibidos:', responseData);

      return this.normalizarDatos(responseData);

    } catch (error: any) {
      console.error('[LimpiezaPublicaService] Error listando limpieza publica OTROS:', error);
      throw error;
    }
  }

  /**
   * Crear arbitrio de limpieza publica
   * POST http://26.161.18.122:8085/api/arbitrioLimpiezaPublica
   * Sin autenticacion
   */
  async crearLimpiezaPublica(datos: CrearLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> {
    try {
      console.log('[LimpiezaPublicaService] Creando arbitrio de limpieza publica:', datos);

      if (!datos.anio || !datos.codZona || !datos.codCriterio || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para crear el arbitrio de limpieza publica');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        tasaMensual: Number(datos.tasaMensual),
        codZona: Number(datos.codZona),
        codCriterio: Number(datos.codCriterio)
      };

      console.log('[LimpiezaPublicaService] Datos a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('[LimpiezaPublicaService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[LimpiezaPublicaService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LimpiezaPublicaService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[LimpiezaPublicaService] Arbitrio creado:', responseData);

      const nuevoArbitrio: LimpiezaPublicaData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        codZona: responseData.codZona || datos.codZona,
        codCriterio: responseData.codCriterio || datos.codCriterio,
        nombreZona: responseData.nombreZona || null,
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12),
        criterioUso: responseData.criterioUso || null
      };

      NotificationService.success('Arbitrio de limpieza publica creado exitosamente');
      return nuevoArbitrio;

    } catch (error: any) {
      console.error('[LimpiezaPublicaService] Error creando limpieza publica:', error);
      NotificationService.error(error.message || 'Error al crear arbitrio de limpieza publica');
      throw error;
    }
  }

  /**
   * Crear arbitrio de limpieza publica - OTROS
   * POST http://26.161.18.122:8085/api/arbitrioLimpiezaPublica/insertarArbitrioLimpiezaPublicaOtros
   * Sin autenticacion
   */
  async crearLimpiezaPublicaOtros(datos: CrearLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> {
    try {
      console.log('[LimpiezaPublicaService] Creando arbitrio OTROS de limpieza publica:', datos);

      if (!datos.anio || !datos.codZona || !datos.codCriterio || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para crear el arbitrio de limpieza publica OTROS');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        tasaMensual: Number(datos.tasaMensual),
        codZona: Number(datos.codZona),
        codCriterio: Number(datos.codCriterio)
      };

      console.log('[LimpiezaPublicaService] Datos OTROS a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}/insertarArbitrioLimpiezaPublicaOtros`;
      console.log('[LimpiezaPublicaService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[LimpiezaPublicaService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LimpiezaPublicaService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[LimpiezaPublicaService] Arbitrio OTROS creado:', responseData);

      const nuevoArbitrio: LimpiezaPublicaData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        codZona: responseData.codZona || datos.codZona,
        codCriterio: responseData.codCriterio || datos.codCriterio,
        nombreZona: responseData.nombreZona || null,
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12),
        criterioUso: responseData.criterioUso || null
      };

      NotificationService.success('Arbitrio de limpieza publica OTROS creado exitosamente');
      return nuevoArbitrio;

    } catch (error: any) {
      console.error('[LimpiezaPublicaService] Error creando limpieza publica OTROS:', error);
      NotificationService.error(error.message || 'Error al crear arbitrio de limpieza publica OTROS');
      throw error;
    }
  }

  /**
   * Actualizar arbitrio de limpieza publica
   * PUT http://26.161.18.122:8085/api/arbitrioLimpiezaPublica
   * Sin autenticacion
   */
  async actualizarLimpiezaPublica(datos: ActualizarLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> {
    try {
      console.log('[LimpiezaPublicaService] Actualizando arbitrio de limpieza publica:', datos);

      if (!datos.anio || !datos.codZona || !datos.codCriterio || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para actualizar el arbitrio de limpieza publica');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        tasaMensual: Number(datos.tasaMensual),
        codZona: Number(datos.codZona),
        codCriterio: Number(datos.codCriterio)
      };

      console.log('[LimpiezaPublicaService] Datos a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      console.log('[LimpiezaPublicaService] URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[LimpiezaPublicaService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LimpiezaPublicaService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[LimpiezaPublicaService] Arbitrio actualizado:', responseData);

      const arbitrioActualizado: LimpiezaPublicaData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        codZona: responseData.codZona || datos.codZona,
        codCriterio: responseData.codCriterio || datos.codCriterio,
        nombreZona: responseData.nombreZona || null,
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12),
        criterioUso: responseData.criterioUso || null
      };

      NotificationService.success('Arbitrio de limpieza publica actualizado exitosamente');
      return arbitrioActualizado;

    } catch (error: any) {
      console.error('[LimpiezaPublicaService] Error actualizando limpieza publica:', error);
      NotificationService.error(error.message || 'Error al actualizar arbitrio de limpieza publica');
      throw error;
    }
  }

  /**
   * Actualizar arbitrio de limpieza publica - OTROS
   * PUT http://26.161.18.122:8085/api/arbitrioLimpiezaPublica/actualizarArbitrioLimpiezaPublicaOtros
   * Sin autenticacion
   */
  async actualizarLimpiezaPublicaOtros(datos: ActualizarLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> {
    try {
      console.log('[LimpiezaPublicaService] Actualizando arbitrio OTROS de limpieza publica:', datos);

      if (!datos.anio || !datos.codZona || !datos.codCriterio || datos.tasaMensual === undefined) {
        throw new Error('Faltan datos requeridos para actualizar el arbitrio de limpieza publica OTROS');
      }

      const datosParaEnviar = {
        anio: Number(datos.anio),
        tasaMensual: Number(datos.tasaMensual),
        codZona: Number(datos.codZona),
        codCriterio: Number(datos.codCriterio)
      };

      console.log('[LimpiezaPublicaService] Datos OTROS a enviar:', datosParaEnviar);

      const url = `${API_CONFIG.baseURL}${this.endpoint}/actualizarArbitrioLimpiezaPublicaOtros`;
      console.log('[LimpiezaPublicaService] URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });

      console.log('[LimpiezaPublicaService] Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LimpiezaPublicaService] Error Response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[LimpiezaPublicaService] Arbitrio OTROS actualizado:', responseData);

      const arbitrioActualizado: LimpiezaPublicaData = {
        codigo: responseData.codigo || null,
        anio: responseData.anio || datos.anio,
        tasaMensual: responseData.tasaMensual || datos.tasaMensual,
        codZona: responseData.codZona || datos.codZona,
        codCriterio: responseData.codCriterio || datos.codCriterio,
        nombreZona: responseData.nombreZona || null,
        tasaAnual: responseData.tasaAnual || (datos.tasaMensual * 12),
        criterioUso: responseData.criterioUso || null
      };

      NotificationService.success('Arbitrio de limpieza publica OTROS actualizado exitosamente');
      return arbitrioActualizado;

    } catch (error: any) {
      console.error('[LimpiezaPublicaService] Error actualizando limpieza publica OTROS:', error);
      NotificationService.error(error.message || 'Error al actualizar arbitrio de limpieza publica OTROS');
      throw error;
    }
  }

  /**
   * Metodo privado para normalizar datos
   */
  private normalizarDatos(responseData: any): LimpiezaPublicaData[] {
    // Manejar estructura con wrapper {success, data}
    if (responseData && typeof responseData === 'object' && responseData.success && responseData.data) {
      const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      console.log('[LimpiezaPublicaService] Total registros:', data.length);

      return data.map((item: any) => ({
        codigo: item.codigo || null,
        anio: item.anio || null,
        tasaMensual: parseFloat(item.tasaMensual) || 0,
        codZona: item.codZona || null,
        codCriterio: item.codCriterio || null,
        nombreZona: item.nombreZona || null,
        tasaAnual: parseFloat(item.tasaAnual) || 0,
        criterioUso: item.criterioUso || null
      }));
    }

    // Si es array directo
    if (Array.isArray(responseData)) {
      return responseData.map((item: any) => ({
        codigo: item.codigo || null,
        anio: item.anio || null,
        tasaMensual: parseFloat(item.tasaMensual) || 0,
        codZona: item.codZona || null,
        codCriterio: item.codCriterio || null,
        nombreZona: item.nombreZona || null,
        tasaAnual: parseFloat(item.tasaAnual) || 0,
        criterioUso: item.criterioUso || null
      }));
    }

    return [];
  }
}

export default LimpiezaPublicaService.getInstance();
