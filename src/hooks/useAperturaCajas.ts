// src/hooks/useAperturaCajas.ts
import { useState, useCallback } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  aperturaCajaService,
  AperturaCajaData,
  AperturaCajaDTO,
  CierreCajaDTO
} from '../services/aperturaCajaService';

/**
 * Interface para el estado de una apertura de caja
 */
export interface AperturaCajaState {
  codAperturaCaja?: number;
  codAsignacionCaja: number;
  fecha: string;
  montoApertura: number;
  montoCierre?: number;
  estado: 'ABIERTA' | 'CERRADA';
  fechaApertura?: string;
  fechaCierre?: string;
}

/**
 * Hook para gestionar apertura y cierre de cajas
 * NO requiere autenticacion para ninguna operacion
 */
export const useAperturaCajas = () => {
  const [aperturaActual, setAperturaActual] = useState<AperturaCajaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Realiza la apertura de una caja
   */
  const abrirCaja = useCallback(async (datos: AperturaCajaDTO): Promise<AperturaCajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAperturaCajas] Abriendo caja:', datos);

      // Validar datos
      if (!datos.codAsignacionCaja || !datos.fecha || datos.montoApertura === undefined) {
        throw new Error('Todos los campos son requeridos para la apertura');
      }

      // Validar que el monto sea positivo
      if (datos.montoApertura < 0) {
        throw new Error('El monto de apertura debe ser mayor o igual a 0');
      }

      // Realizar apertura
      const apertura = await aperturaCajaService.apertura(datos);

      // Guardar apertura actual
      setAperturaActual(apertura);

      NotificationService.success('Caja abierta correctamente');

      return apertura;

    } catch (error: any) {
      console.error('[useAperturaCajas] Error al abrir caja:', error);
      setError(error.message || 'Error al abrir caja');
      NotificationService.error(error.message || 'Error al abrir caja');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realiza el cierre de una caja
   */
  const cerrarCaja = useCallback(async (datos: CierreCajaDTO): Promise<AperturaCajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAperturaCajas] Cerrando caja:', datos);

      // Validar datos
      if (!datos.codAperturaCaja || !datos.codAsignacionCaja || !datos.fecha || datos.montoApertura === undefined) {
        throw new Error('Todos los campos son requeridos para el cierre');
      }

      // Realizar cierre
      const cierre = await aperturaCajaService.cierre(datos);

      // Limpiar apertura actual
      setAperturaActual(null);

      NotificationService.success('Caja cerrada correctamente');

      return cierre;

    } catch (error: any) {
      console.error('[useAperturaCajas] Error al cerrar caja:', error);
      setError(error.message || 'Error al cerrar caja');
      NotificationService.error(error.message || 'Error al cerrar caja');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Valida si se puede realizar una apertura
   */
  const validarApertura = useCallback(async (codAsignacionCaja: number, fecha: string): Promise<boolean> => {
    try {
      console.log('[useAperturaCajas] Validando apertura...');

      // Validar que no haya una apertura activa
      if (aperturaActual && aperturaActual.estado === 'ABIERTA') {
        NotificationService.warning('Ya existe una caja abierta. Debe cerrarla antes de abrir otra.');
        return false;
      }

      const esValida = await aperturaCajaService.validarApertura(codAsignacionCaja, fecha);

      if (!esValida) {
        NotificationService.warning('No se puede realizar la apertura de caja en este momento');
      }

      return esValida;

    } catch (error: any) {
      console.error('[useAperturaCajas] Error validando apertura:', error);
      return false;
    }
  }, [aperturaActual]);

  /**
   * Valida si se puede realizar un cierre
   */
  const validarCierre = useCallback(async (codAperturaCaja: number): Promise<boolean> => {
    try {
      console.log('[useAperturaCajas] Validando cierre...');

      // Validar que haya una apertura activa
      if (!aperturaActual || aperturaActual.estado !== 'ABIERTA') {
        NotificationService.warning('No hay una caja abierta para cerrar');
        return false;
      }

      const esValido = await aperturaCajaService.validarCierre(codAperturaCaja);

      if (!esValido) {
        NotificationService.warning('No se puede realizar el cierre de caja en este momento');
      }

      return esValido;

    } catch (error: any) {
      console.error('[useAperturaCajas] Error validando cierre:', error);
      return false;
    }
  }, [aperturaActual]);

  /**
   * Limpia el estado de la apertura actual
   */
  const limpiarAperturaActual = useCallback(() => {
    setAperturaActual(null);
    setError(null);
  }, []);

  /**
   * Establece una apertura como actual (util para cargar estado guardado)
   */
  const setearAperturaActual = useCallback((apertura: AperturaCajaData | null) => {
    setAperturaActual(apertura);
  }, []);

  /**
   * Verifica si hay una caja abierta actualmente
   */
  const tieneCajaAbierta = useCallback((): boolean => {
    return aperturaActual !== null && aperturaActual.estado === 'ABIERTA';
  }, [aperturaActual]);

  /**
   * Obtiene el codigo de la apertura actual
   */
  const obtenerCodAperturaActual = useCallback((): number | null => {
    return aperturaActual?.codAperturaCaja || null;
  }, [aperturaActual]);

  /**
   * Obtiene el monto de apertura actual
   */
  const obtenerMontoAperturaActual = useCallback((): number | null => {
    return aperturaActual?.montoApertura || null;
  }, [aperturaActual]);

  return {
    // Estado
    aperturaActual,
    loading,
    error,

    // Operaciones principales
    abrirCaja,
    cerrarCaja,

    // Validaciones
    validarApertura,
    validarCierre,

    // Utilidades
    limpiarAperturaActual,
    setearAperturaActual,
    tieneCajaAbierta,
    obtenerCodAperturaActual,
    obtenerMontoAperturaActual
  };
};
