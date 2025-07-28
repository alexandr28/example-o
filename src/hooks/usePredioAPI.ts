// src/hooks/usePredioAPI.ts
import { useState, useEffect, useCallback } from 'react';
import { predioService } from '../services/predioService';
import { 
  Predio, 
  FiltroPredio,
  PredioFormData 
} from '../models/Predio';
import { NotificationService } from '../components/utils/Notification';

interface UsePrediosReturn {
  // Estado
  predios: Predio[];
  predioSeleccionado: Predio | null;
  loading: boolean;
  error: string | null;
  
  // Estadísticas
  estadisticas: {
    total: number;
    porEstado: Record<string, number>;
    porCondicion: Record<string, number>;
    areaTerrenoTotal: number;
    areaConstruidaTotal: number;
  } | null;
  
  // Acciones
  cargarPredios: () => Promise<void>;
  buscarPredios: (filtros: FiltroPredio) => Promise<void>;
  buscarPrediosConFormData: (codPredio?: string, anio?: number, direccion?: number) => Promise<void>;
  obtenerPredioPorCodigo: (codigoPredio: string) => Promise<void>;
  obtenerPrediosPorAnio: (anio: number) => Promise<void>;
  obtenerPrediosPorDireccion: (direccionId: number) => Promise<void>;
  seleccionarPredio: (predio: Predio | null) => void;
  crearPredio: (datos: PredioFormData) => Promise<Predio | null>;
  actualizarPredio: (codigoPredio: string, datos: PredioFormData) => Promise<Predio | null>;
  eliminarPredio: (codigoPredio: string) => Promise<boolean>;
  limpiarSeleccion: () => void;
  cargarEstadisticas: () => Promise<void>;
}

/**
 * Hook personalizado para gestión de predios
 */
export const usePredios = (): UsePrediosReturn => {
  const [predios, setPredios] = useState<Predio[]>([]);
  const [predioSeleccionado, setPredioSeleccionado] = useState<Predio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<UsePrediosReturn['estadisticas']>(null);

  /**
   * Cargar todos los predios
   */
  const cargarPredios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const prediosData = await predioService.obtenerPredios();
      setPredios(prediosData);
      
      NotificationService.success(`${prediosData.length} predios cargados`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar predios';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar predios con filtros (método legacy)
   */
  const buscarPredios = useCallback(async (filtros: FiltroPredio) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convertir filtros al formato de la API con form-data
      const parametros = {
        codPredio: filtros.codigoPredio,
        anio: filtros.anio,
        direccion: filtros.direccionId
      };
      
      const prediosData = await predioService.buscarPredios(parametros);
      setPredios(prediosData);
      
      NotificationService.info(`${prediosData.length} predios encontrados`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al buscar predios';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar predios usando form-data con los parámetros específicos
   */
  const buscarPrediosConFormData = useCallback(async (
    codPredio?: string, 
    anio?: number, 
    direccion?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const parametros = {
        ...(codPredio && { codPredio }),
        ...(anio && { anio }),
        ...(direccion && { direccion })
      };
      
      const prediosData = await predioService.buscarPredios(parametros);
      setPredios(prediosData);
      
      NotificationService.info(`${prediosData.length} predios encontrados`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al buscar predios';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener predio por código
   */
  const obtenerPredioPorCodigo = useCallback(async (codigoPredio: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const predio = await predioService.obtenerPredioPorCodigo(codigoPredio);
      
      if (predio) {
        setPredioSeleccionado(predio);
        NotificationService.success('Predio encontrado');
      } else {
        NotificationService.warning('No se encontró el predio');
      }
    } catch (err: any) {
      const mensaje = err.message || 'Error al obtener predio';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener predios por año
   */
  const obtenerPrediosPorAnio = useCallback(async (anio: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const prediosData = await predioService.obtenerPrediosPorAnio(anio);
      setPredios(prediosData);
      
      NotificationService.info(`${prediosData.length} predios del año ${anio}`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al obtener predios por año';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener predios por dirección
   */
  const obtenerPrediosPorDireccion = useCallback(async (direccionId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const prediosData = await predioService.obtenerPrediosPorDireccion(direccionId);
      setPredios(prediosData);
      
      NotificationService.info(`${prediosData.length} predios en esta dirección`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al obtener predios por dirección';
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Seleccionar un predio
   */
  const seleccionarPredio = useCallback((predio: Predio | null) => {
    setPredioSeleccionado(predio);
  }, []);

  /**
   * Crear nuevo predio
   */
  const crearPredio = useCallback(async (datos: PredioFormData): Promise<Predio | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para la API
      const datosApi = {
        anio: datos.anio || new Date().getFullYear(),
        numeroFinca: datos.numeroFinca,
        otroNumero: datos.otroNumero,
        areaTerreno: datos.areaTerreno,
        fechaAdquisicion: datos.fechaAdquisicion?.toString() || null,
        condicionPropiedad: datos.condicionPropiedad,
        conductor: datos.conductor,
        estadoPredio: datos.estadoPredio,
        numeroPisos: datos.numeroPisos,
        totalAreaConstruccion: datos.totalAreaConstruccion,
        valorTerreno: datos.valorTerreno,
        valorTotalConstruccion: datos.valorTotalConstruccion,
        autoavaluo: datos.autoavaluo,
        codDireccion: datos.direccionId
      };
      
      const nuevoPredio = await predioService.crearPredio(datosApi);
      
      // Actualizar lista
      await cargarPredios();
      
      NotificationService.success('Predio creado exitosamente');
      return nuevoPredio;
    } catch (err: any) {
      const mensaje = err.message || 'Error al crear predio';
      setError(mensaje);
      NotificationService.error(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarPredios]);

  /**
   * Actualizar predio existente
   */
  const actualizarPredio = useCallback(async (
    codigoPredio: string, 
    datos: PredioFormData
  ): Promise<Predio | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para la API
      const datosApi = {
        numeroFinca: datos.numeroFinca,
        otroNumero: datos.otroNumero,
        areaTerreno: datos.areaTerreno,
        fechaAdquisicion: datos.fechaAdquisicion?.toString() || null,
        condicionPropiedad: datos.condicionPropiedad,
        conductor: datos.conductor,
        estadoPredio: datos.estadoPredio,
        numeroPisos: datos.numeroPisos,
        totalAreaConstruccion: datos.totalAreaConstruccion,
        valorTerreno: datos.valorTerreno,
        valorTotalConstruccion: datos.valorTotalConstruccion,
        autoavaluo: datos.autoavaluo
      };
      
      const predioActualizado = await predioService.actualizarPredio(codigoPredio, datosApi);
      
      // Actualizar lista
      await cargarPredios();
      
      NotificationService.success('Predio actualizado exitosamente');
      return predioActualizado;
    } catch (err: any) {
      const mensaje = err.message || 'Error al actualizar predio';
      setError(mensaje);
      NotificationService.error(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarPredios]);

  /**
   * Eliminar predio (cambio de estado)
   */
  const eliminarPredio = useCallback(async (codigoPredio: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await predioService.eliminarPredio(codigoPredio);
      
      // Actualizar lista
      await cargarPredios();
      
      NotificationService.success('Predio eliminado exitosamente');
      return true;
    } catch (err: any) {
      const mensaje = err.message || 'Error al eliminar predio';
      setError(mensaje);
      NotificationService.error(mensaje);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarPredios]);

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    setPredioSeleccionado(null);
  }, []);

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await predioService.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  // Cargar predios al montar el componente
  useEffect(() => {
    cargarPredios();
  }, [cargarPredios]);

  return {
    // Estado
    predios,
    predioSeleccionado,
    loading,
    error,
    estadisticas,
    
    // Acciones
    cargarPredios,
    buscarPredios,
    buscarPrediosConFormData,
    obtenerPredioPorCodigo,
    obtenerPrediosPorAnio,
    obtenerPrediosPorDireccion,
    seleccionarPredio,
    crearPredio,
    actualizarPredio,
    eliminarPredio,
    limpiarSeleccion,
    cargarEstadisticas
  };
};