// src/hooks/useFraccionamiento.ts
import { useState, useCallback } from 'react';
import { fraccionamientoService } from '../services/fraccionamientoService';
import type {
  Fraccionamiento,
  DeudaFraccionamiento,
  CuotaFraccionamiento,
  SolicitudFraccionamientoForm,
  AprobacionFraccionamientoForm,
  FraccionamientoFiltros,
  EstadisticasFraccionamiento
} from '../types/fraccionamiento.types';

export const useFraccionamiento = () => {
  const [fraccionamientos, setFraccionamientos] = useState<Fraccionamiento[]>([]);
  const [fraccionamientoActual, setFraccionamientoActual] = useState<Fraccionamiento | null>(null);
  const [deudas, setDeudas] = useState<DeudaFraccionamiento[]>([]);
  const [cronograma, setCronograma] = useState<CuotaFraccionamiento[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasFraccionamiento | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear solicitud
  const crearSolicitud = useCallback(async (data: SolicitudFraccionamientoForm): Promise<Fraccionamiento | null> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.crearSolicitud(data);
      setFraccionamientoActual(resultado);
      return resultado;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al crear la solicitud';
      setError(mensajeError);
      throw new Error(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener solicitudes
  const obtenerSolicitudes = useCallback(async (filtros?: FraccionamientoFiltros): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.obtenerSolicitudes(filtros);
      setFraccionamientos(resultado);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al obtener las solicitudes';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener por ID
  const obtenerPorId = useCallback(async (id: number): Promise<Fraccionamiento | null> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.obtenerSolicitudPorId(id);
      setFraccionamientoActual(resultado);
      return resultado;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al obtener el fraccionamiento';
      setError(mensajeError);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener por código
  const obtenerPorCodigo = useCallback(async (codigo: string): Promise<Fraccionamiento | null> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.obtenerSolicitudPorCodigo(codigo);
      setFraccionamientoActual(resultado);
      return resultado;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al obtener el fraccionamiento';
      setError(mensajeError);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  // Aprobar solicitud
  const aprobarSolicitud = useCallback(async (id: number, data: AprobacionFraccionamientoForm): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.aprobarSolicitud(id, data);
      setFraccionamientoActual(resultado);
      return true;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al aprobar la solicitud';
      setError(mensajeError);
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  // Rechazar solicitud
  const rechazarSolicitud = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.rechazarSolicitud(id, motivo);
      setFraccionamientoActual(resultado);
      return true;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al rechazar la solicitud';
      setError(mensajeError);
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener deudas del contribuyente
  const obtenerDeudas = useCallback(async (codigoContribuyente: string): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.obtenerDeudasContribuyente(codigoContribuyente);
      setDeudas(resultado);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al obtener las deudas';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Generar cronograma
  const generarCronograma = useCallback(async (idFraccionamiento: number): Promise<CuotaFraccionamiento[]> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.generarCronograma(idFraccionamiento);
      setCronograma(resultado);
      return resultado;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al generar el cronograma';
      setError(mensajeError);
      return [];
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener cronograma
  const obtenerCronograma = useCallback(async (idFraccionamiento: number): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.obtenerCronograma(idFraccionamiento);
      setCronograma(resultado);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al obtener el cronograma';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Registrar pago de cuota
  const registrarPagoCuota = useCallback(async (
    idFraccionamiento: number,
    idCuota: number,
    monto: number
  ): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      await fraccionamientoService.registrarPagoCuota(idFraccionamiento, idCuota, monto);
      // Recargar cronograma
      await obtenerCronograma(idFraccionamiento);
      return true;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al registrar el pago';
      setError(mensajeError);
      return false;
    } finally {
      setCargando(false);
    }
  }, [obtenerCronograma]);

  // Buscar por contribuyente
  const buscarPorContribuyente = useCallback(async (codigoContribuyente: string): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.buscarPorContribuyente(codigoContribuyente);
      setFraccionamientos(resultado);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al buscar fraccionamientos';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Buscar por estado
  const buscarPorEstado = useCallback(async (estado: string): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.buscarPorEstado(estado);
      setFraccionamientos(resultado);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al buscar fraccionamientos';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.obtenerEstadisticas();
      setEstadisticas(resultado);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al obtener estadísticas';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  }, []);

  // Cancelar fraccionamiento
  const cancelarFraccionamiento = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fraccionamientoService.cancelarFraccionamiento(id, motivo);
      setFraccionamientoActual(resultado);
      return true;
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al cancelar el fraccionamiento';
      setError(mensajeError);
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar estado
  const limpiarEstado = useCallback(() => {
    setFraccionamientos([]);
    setFraccionamientoActual(null);
    setDeudas([]);
    setCronograma([]);
    setEstadisticas(null);
    setError(null);
  }, []);

  return {
    // Estado
    fraccionamientos,
    fraccionamientoActual,
    deudas,
    cronograma,
    estadisticas,
    cargando,
    error,

    // Métodos
    crearSolicitud,
    obtenerSolicitudes,
    obtenerPorId,
    obtenerPorCodigo,
    aprobarSolicitud,
    rechazarSolicitud,
    obtenerDeudas,
    generarCronograma,
    obtenerCronograma,
    registrarPagoCuota,
    buscarPorContribuyente,
    buscarPorEstado,
    obtenerEstadisticas,
    cancelarFraccionamiento,
    limpiarError,
    limpiarEstado
  };
};

export default useFraccionamiento;
