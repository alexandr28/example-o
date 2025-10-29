// src/hooks/useCuentaCorriente.ts
import { useState, useCallback } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  cuentaCorrienteService,
  EstadoCuentaAnual,
  EstadoCuentaDetalle
} from '../services/cuentaCorrienteService';

/**
 * Hook para gestionar la Cuenta Corriente y Estado de Cuenta
 * NO requiere autenticación para ninguna operación
 */
export const useCuentaCorriente = () => {
  // Estados para Estado de Cuenta Anual
  const [estadoCuentaAnual, setEstadoCuentaAnual] = useState<EstadoCuentaAnual[]>([]);
  const [loadingEstadoCuenta, setLoadingEstadoCuenta] = useState(false);
  const [errorEstadoCuenta, setErrorEstadoCuenta] = useState<string | null>(null);

  // Estados para Detalle de Estado de Cuenta
  const [estadoCuentaDetalle, setEstadoCuentaDetalle] = useState<EstadoCuentaDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  /**
   * Cargar estado de cuenta anual de un contribuyente
   * GET /api/estadoCuenta/listar?codContribuyente=10
   */
  const cargarEstadoCuenta = useCallback(async (codContribuyente: number | string) => {
    try {
      setLoadingEstadoCuenta(true);
      setErrorEstadoCuenta(null);

      console.log('= [useCuentaCorriente] Cargando estado de cuenta para:', codContribuyente);

      const datos = await cuentaCorrienteService.listarEstadoCuenta(codContribuyente);

      setEstadoCuentaAnual(datos);
      console.log(` [useCuentaCorriente] ${datos.length} registros de estado de cuenta cargados`);

      return datos;

    } catch (error: any) {
      console.error('L [useCuentaCorriente] Error cargando estado de cuenta:', error);
      setErrorEstadoCuenta(error.message || 'Error al cargar estado de cuenta');
      NotificationService.error('Error al cargar el estado de cuenta');
      return [];
    } finally {
      setLoadingEstadoCuenta(false);
    }
  }, []);

  /**
   * Cargar detalle de estado de cuenta por año
   * GET /api/estadoCuenta/listarDetalle?codContribuyente=10&anio=2024
   */
  const cargarDetalleEstadoCuenta = useCallback(async (
    codContribuyente: number | string,
    anio: number
  ) => {
    try {
      setLoadingDetalle(true);
      setErrorDetalle(null);

      console.log('= [useCuentaCorriente] Cargando detalle para:', { codContribuyente, anio });

      const detalles = await cuentaCorrienteService.listarDetalleEstadoCuenta(
        codContribuyente,
        anio
      );

      setEstadoCuentaDetalle(detalles);
      console.log(` [useCuentaCorriente] ${detalles.length} detalles cargados`);

      return detalles;

    } catch (error: any) {
      console.error('L [useCuentaCorriente] Error cargando detalle:', error);
      setErrorDetalle(error.message || 'Error al cargar detalle del estado de cuenta');
      NotificationService.error('Error al cargar el detalle del estado de cuenta');
      return [];
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  /**
   * Limpiar el estado de cuenta anual
   */
  const limpiarEstadoCuenta = useCallback(() => {
    setEstadoCuentaAnual([]);
    setErrorEstadoCuenta(null);
  }, []);

  /**
   * Limpiar el detalle de estado de cuenta
   */
  const limpiarDetalle = useCallback(() => {
    setEstadoCuentaDetalle([]);
    setErrorDetalle(null);
  }, []);

  /**
   * Limpiar todos los estados
   */
  const limpiarTodo = useCallback(() => {
    limpiarEstadoCuenta();
    limpiarDetalle();
  }, [limpiarEstadoCuenta, limpiarDetalle]);

  return {
    // Estados de Estado de Cuenta Anual
    estadoCuentaAnual,
    loadingEstadoCuenta,
    errorEstadoCuenta,

    // Estados de Detalle
    estadoCuentaDetalle,
    loadingDetalle,
    errorDetalle,

    // Funciones
    cargarEstadoCuenta,
    cargarDetalleEstadoCuenta,
    limpiarEstadoCuenta,
    limpiarDetalle,
    limpiarTodo,
  };
};
