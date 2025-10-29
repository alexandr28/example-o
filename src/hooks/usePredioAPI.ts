// src/hooks/usePredioAPI.ts
import { useState, useEffect, useCallback } from 'react';
import { predioService } from '../services/predioService';
import { 
  Predio, 
  FiltroPredio,
  PredioFormData
} from '../models/Predio';
import { PredioData, CreatePredioDTO } from '../services/predioService';
import { NotificationService } from '../components/utils/Notification';

// Function to map PredioData to Predio
const mapPredioDataToModel = (data: PredioData): Predio => {
  return {
    codigoPredio: data.codPredio?.trim() || '',
    anio: data.anio,
    fechaAdquisicion: data.fechaAdquisicion,
    condicionPropiedad: data.condicionPropiedad || 'PROPIETARIO_UNICO',
    direccion: data.direccion,
    direccionId: data.codDireccion ? Number(data.codDireccion) : undefined,
    numeroFinca: data.numeroFinca,
    otroNumero: data.otroNumero,
    conductor: data.conductor || 'PRIVADO',
    estadoPredio: data.estadoPredio || 'TERMINADO',
    areaTerreno: data.areaTerreno || 0,
    numeroPisos: data.numeroPisos,
    totalAreaConstruccion: data.totalAreaConstruccion,
    valorTotalConstruccion: data.valorTotalConstruccion,
    valorTerreno: data.valorTerreno,
    autoavaluo: data.autoavaluo,
    
    // Códigos originales de la API
    codPredio: data.codPredio,
    codClasificacion: data.codClasificacion ? Number(data.codClasificacion) : undefined,
    estPredio: data.estPredio,
    codTipoPredio: data.codTipoPredio ? Number(data.codTipoPredio) : undefined,
    codCondicionPropiedad: data.codCondicionPropiedad ? Number(data.codCondicionPropiedad) : undefined,
    codDireccion: data.codDireccion ? Number(data.codDireccion) : undefined,
    codUsoPredio: data.codUsoPredio ? Number(data.codUsoPredio) : undefined,
    codListaConductor: data.codListaConductor ? Number(data.codListaConductor) : undefined,
    codUbicacionAreaVerde: data.codUbicacionAreaVerde ? Number(data.codUbicacionAreaVerde) : undefined,
    codEstado: data.codEstado ? Number(data.codEstado) : undefined,
    codUsuario: data.codUsuario,
    
    numeroCondominos: data.numeroCondominos ? Number(data.numeroCondominos) : undefined,
  };
};

interface UsoPredioOption {
  codUsoPredio: number;
  codGrupoUso: number;
  descripcionUso: string;
}

interface UsePrediosReturn {
  // Estado
  predios: Predio[];
  predioSeleccionado: Predio | null;
  loading: boolean;
  error: string | null;
  usosPredio: UsoPredioOption[];

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
  cargarTodosPredios: () => Promise<void>;
  cargarUsosPredio: () => Promise<void>;
  buscarPredios: (filtros: FiltroPredio) => Promise<void>;
  buscarPrediosConFiltros: (anio?: number, codPredioBase?: string, parametroBusqueda?: string) => Promise<void>;
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
  const [usosPredio, setUsosPredio] = useState<UsoPredioOption[]>([]);

  /**
   * Cargar todos los predios
   */
  const cargarPredios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const prediosData = await predioService.obtenerPredios();
      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);
      
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
   * Cargar todos los predios usando API GET /all
   * GET http://26.161.18.122:8085/api/predio/all
   */
  const cargarTodosPredios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 [usePredios] Cargando todos los predios desde API /all');

      const prediosData = await predioService.obtenerTodosPredios();
      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);

      NotificationService.success(`${prediosData.length} predios cargados desde API`);
      console.log(`✅ [usePredios] ${prediosData.length} predios cargados exitosamente`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar todos los predios';
      console.error('❌ [usePredios] Error:', err);
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar todos los usos de predios
   * GET http://26.161.18.122:8085/api/predio/usos
   */
  const cargarUsosPredio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 [usePredios] Cargando usos de predios desde API /usos');

      const usosData = await predioService.obtenerUsosPredio();
      setUsosPredio(usosData);

      console.log(`✅ [usePredios] ${usosData.length} usos cargados exitosamente`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar usos de predios';
      console.error('❌ [usePredios] Error:', err);
      setError(mensaje);
      NotificationService.error(mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar predios con filtros usando query params
   * GET http://26.161.18.122:8085/api/predio?anio=2024&codPredioBase=4&parametroBusqueda=
   */
  const buscarPrediosConFiltros = useCallback(async (
    anio?: number,
    codPredioBase?: string,
    parametroBusqueda?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [usePredios] Buscando predios con filtros:', { anio, codPredioBase, parametroBusqueda });

      const prediosData = await predioService.buscarPrediosConFiltros({
        anio,
        codPredioBase,
        parametroBusqueda
      });

      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);

      NotificationService.success(`${prediosData.length} predios encontrados`);
      console.log(`✅ [usePredios] ${prediosData.length} predios cargados`);
    } catch (err: any) {
      const mensaje = err.message || 'Error al buscar predios';
      console.error('❌ [usePredios] Error:', err);
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
      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);

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
      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);
      
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
        const predioMapeado = mapPredioDataToModel(predio);
        setPredioSeleccionado(predioMapeado);
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
      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);
      
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
      const prediosMapeados = prediosData.map(mapPredioDataToModel);
      setPredios(prediosMapeados);
      
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
   * Crear nuevo predio usando API POST sin autenticación
   * URL: POST http://26.161.18.122:8080/api/predio
   */
  const crearPredio = useCallback(async (datos: PredioFormData): Promise<Predio | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏠 [usePredios] Iniciando creación de predio:', datos);
      
      // Validaciones básicas
      if (!datos.numeroFinca) {
        throw new Error('El número de finca es requerido');
      }
      
      if (!datos.areaTerreno || datos.areaTerreno <= 0) {
        throw new Error('El área del terreno debe ser mayor a 0');
      }
      
      if (!datos.direccionId) {
        throw new Error('Debe seleccionar una dirección');
      }
      
      // Preparar datos según la estructura JSON exacta del API
      const datosApi = {
        anio: datos.anio || new Date().getFullYear(),
        codPredio: null, // SIEMPRE null - SQL lo asigna automáticamente
        numeroFinca: Number(datos.numeroFinca),
        otroNumero: String(datos.otroNumero || ""),
        codClasificacion: String(datos.clasificacionPredio || "0502"),
        estPredio: String(datos.estadoPredio || "2503"),
        codTipoPredio: String(datos.tipoPredio || "2601"),
        codCondicionPropiedad: String(datos.condicionPropiedad || "2701"),
        codDireccion: Number(datos.direccionId),
        codUsoPredio: Number(datos.usoPredio || 1),
        fechaAdquisicion: datos.fechaAdquisicion
          ? (datos.fechaAdquisicion instanceof Date
              ? datos.fechaAdquisicion.toISOString().split('T')[0]
              : String(datos.fechaAdquisicion).split('T')[0])
          : new Date().toISOString().split('T')[0],
        numeroCondominos: Number(datos.numeroCondominos || 2),
        codListaConductor: String(datos.conductor || "1401"),
        codUbicacionAreaVerde: Number(1),
        areaTerreno: Number(datos.areaTerreno),
        totalAreaConstruccion: datos.totalAreaConstruccion ? Number(datos.totalAreaConstruccion) : null,
        valorTotalConstruccion: datos.valorTotalConstruccion ? Number(datos.valorTotalConstruccion) : null,
        valorTerreno: datos.valorTerreno ? Number(datos.valorTerreno) : null,
        autoavaluo: datos.autoavaluo ? Number(datos.autoavaluo) : null,
        codEstado: String("0201"),
        codUsuario: Number(1)
      };
      
      console.log('📤 [usePredios] Datos preparados para API POST:', datosApi);
      
      const nuevoPredio = await predioService.crearPredio(datosApi);
      
      console.log('✅ [usePredios] Predio creado exitosamente:', nuevoPredio);
      
      // Actualizar lista de predios
      await cargarPredios();
      
      const predioMapeado = mapPredioDataToModel(nuevoPredio);
      NotificationService.success(`Predio ${nuevoPredio.codPredio || 'nuevo'} creado exitosamente`);
      return predioMapeado;
    } catch (err: any) {
      const mensaje = err.message || 'Error al crear predio';
      console.error('❌ [usePredios] Error creando predio:', err);
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
    _codigoPredio: string, 
    datos: PredioFormData
  ): Promise<Predio | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para la API según UpdatePredioDTO
      const datosApi: Partial<CreatePredioDTO> = {
        numeroFinca: datos.numeroFinca ? Number(datos.numeroFinca) : undefined,
        otroNumero: datos.otroNumero || undefined,
        areaTerreno: datos.areaTerreno,
        fechaAdquisicion: datos.fechaAdquisicion
          ? (datos.fechaAdquisicion instanceof Date
              ? datos.fechaAdquisicion.toISOString().split('T')[0]
              : String(datos.fechaAdquisicion).split('T')[0])
          : undefined,
        totalAreaConstruccion: datos.totalAreaConstruccion || undefined,
        valorTerreno: datos.valorTerreno || undefined,
        valorTotalConstruccion: datos.valorTotalConstruccion || undefined,
        autoavaluo: datos.autoavaluo || undefined
      };
      
      const anio = datos.anio || new Date().getFullYear();
      const codDireccion = datos.direccionId || 1; // Usar direccionId del formulario
      const predioActualizado = await predioService.actualizarPredio(anio, codDireccion, datosApi);
      
      // Actualizar lista
      await cargarPredios();
      
      const predioMapeado = mapPredioDataToModel(predioActualizado);
      NotificationService.success('Predio actualizado exitosamente');
      return predioMapeado;
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

  // NO cargar predios automáticamente al montar
  // Cada componente debe llamar explícitamente a cargarTodosPredios() o buscarPredios()
  // cuando lo necesite (por ejemplo, en su propio useEffect)
  // useEffect(() => {
  //   cargarTodosPredios();
  // }, [cargarTodosPredios]);

  return {
    // Estado
    predios,
    predioSeleccionado,
    loading,
    error,
    estadisticas,
    usosPredio,

    // Acciones
    cargarPredios,
    cargarTodosPredios,
    cargarUsosPredio,
    buscarPredios,
    buscarPrediosConFiltros,
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