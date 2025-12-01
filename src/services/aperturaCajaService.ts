// src/services/aperturaCajaService.ts
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para AperturaCaja
 */
export interface AperturaCajaData {
  codAperturaCaja?: number;
  codAsignacionCaja: number;
  fecha: string; // formato: "2025-11-07"
  montoApertura: number;
  montoCierre?: number;
  estado?: string;
  fechaApertura?: string;
  fechaCierre?: string;
}

export interface AperturaCajaDTO {
  codAsignacionCaja: number;
  fecha: string; // formato: "2025-11-07"
  montoApertura: number;
}

export interface CierreCajaDTO {
  codAperturaCaja: number;
  codAsignacionCaja: number;
  fecha: string; // formato: "2025-11-07"
  montoApertura: number;
}

/**
 * Servicio para gestion de apertura y cierre de caja
 *
 * IMPORTANTE: Este servicio NO requiere autenticacion
 * Todos los metodos (POST, PUT) funcionan sin token
 */
class AperturaCajaService {
  private static instance: AperturaCajaService;
  private endpoint = '/api/aperturaCaja';

  public static getInstance(): AperturaCajaService {
    if (!AperturaCajaService.instance) {
      AperturaCajaService.instance = new AperturaCajaService();
    }
    return AperturaCajaService.instance;
  }

  private constructor() {
    console.log('[AperturaCajaService] Inicializado');
    console.log(`  - Endpoint: "${this.endpoint}"`);
    console.log('  - Autenticacion: NO REQUERIDA');
  }

  /**
   * Realiza la apertura de una caja
   * POST /api/aperturaCaja/apertura
   * Body: {codAsignacionCaja, fecha, montoApertura}
   * NO requiere autenticacion
   */
  async apertura(datos: AperturaCajaDTO): Promise<AperturaCajaData> {
    try {
      console.log('[AperturaCajaService] Realizando apertura de caja:', datos);

      // Validar datos requeridos
      if (!datos.codAsignacionCaja || !datos.fecha || datos.montoApertura === undefined) {
        throw new Error('Todos los campos son requeridos para la apertura');
      }

      const url = buildApiUrl(this.endpoint + '/apertura');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[AperturaCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AperturaCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[AperturaCajaService] Apertura realizada exitosamente:', responseData);

      // Extraer datos del wrapper si existe
      const aperturaData = responseData.data || responseData;

      // Normalizar respuesta
      const normalized: AperturaCajaData = {
        codAperturaCaja: aperturaData.codAperturaCaja,
        codAsignacionCaja: aperturaData.codAsignacionCaja || datos.codAsignacionCaja,
        fecha: aperturaData.fecha || datos.fecha,
        montoApertura: aperturaData.montoApertura || datos.montoApertura,
        estado: aperturaData.estado || 'ABIERTA',
        fechaApertura: aperturaData.fechaApertura
      };

      return normalized;

    } catch (error: any) {
      console.error('[AperturaCajaService] Error en apertura de caja:', error);
      throw error;
    }
  }

  /**
   * Realiza el cierre de una caja
   * PUT /api/aperturaCaja/cierre
   * Body: {codAperturaCaja, codAsignacionCaja, fecha, montoApertura}
   * NO requiere autenticacion
   */
  async cierre(datos: CierreCajaDTO): Promise<AperturaCajaData> {
    try {
      console.log('[AperturaCajaService] Realizando cierre de caja:', datos);

      // Validar datos requeridos
      if (!datos.codAperturaCaja || !datos.codAsignacionCaja || !datos.fecha || datos.montoApertura === undefined) {
        throw new Error('Todos los campos son requeridos para el cierre');
      }

      const url = buildApiUrl(this.endpoint + '/cierre');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[AperturaCajaService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AperturaCajaService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[AperturaCajaService] Cierre realizado exitosamente:', responseData);

      // Extraer datos del wrapper si existe
      const cierreData = responseData.data || responseData;

      // Normalizar respuesta
      const normalized: AperturaCajaData = {
        codAperturaCaja: cierreData.codAperturaCaja || datos.codAperturaCaja,
        codAsignacionCaja: cierreData.codAsignacionCaja || datos.codAsignacionCaja,
        fecha: cierreData.fecha || datos.fecha,
        montoApertura: cierreData.montoApertura || datos.montoApertura,
        montoCierre: cierreData.montoCierre,
        estado: cierreData.estado || 'CERRADA',
        fechaApertura: cierreData.fechaApertura,
        fechaCierre: cierreData.fechaCierre
      };

      return normalized;

    } catch (error: any) {
      console.error('[AperturaCajaService] Error en cierre de caja:', error);
      throw error;
    }
  }

  /**
   * Valida si una caja puede ser abierta
   */
  async validarApertura(codAsignacionCaja: number, fecha: string): Promise<boolean> {
    try {
      console.log('[AperturaCajaService] Validando apertura para:', { codAsignacionCaja, fecha });

      // Aqui se pueden agregar validaciones adicionales
      // Por ejemplo, verificar si ya hay una apertura activa para esta asignacion

      return true;
    } catch (error: any) {
      console.error('[AperturaCajaService] Error validando apertura:', error);
      return false;
    }
  }

  /**
   * Valida si una caja puede ser cerrada
   */
  async validarCierre(codAperturaCaja: number): Promise<boolean> {
    try {
      console.log('[AperturaCajaService] Validando cierre para:', codAperturaCaja);

      // Aqui se pueden agregar validaciones adicionales
      // Por ejemplo, verificar si hay transacciones pendientes

      return true;
    } catch (error: any) {
      console.error('[AperturaCajaService] Error validando cierre:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const aperturaCajaService = AperturaCajaService.getInstance();
