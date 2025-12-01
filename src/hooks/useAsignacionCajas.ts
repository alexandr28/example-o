// src/hooks/useAsignacionCajas.ts
import { useState, useCallback, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  asignacionCajaService,
  AsignacionCajaData,
  CreateAsignacionCajaDTO,
  UpdateAsignacionCajaDTO,
  DeleteAsignacionCajaDTO,
  ListarAsignacionCajaParams
} from '../services/asignacionCajaService';

/**
 * Interface para el item de lista de asignacion de caja
 */
export interface AsignacionCajaListItem {
  codAsignacionCaja: number;
  numCaja: string;
  nombreUsuario: string;
  turno: string;
  fechaStr: string;
  estado: string;
}

/**
 * Hook para gestionar asignaciones de caja
 * NO requiere autenticacion para ninguna operacion
 */
export const useAsignacionCajas = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionCajaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para controlar si ya se esta cargando
  const isLoadingRef = useRef(false);

  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (data: AsignacionCajaData): AsignacionCajaListItem => {
    return {
      codAsignacionCaja: data.codAsignacionCaja,
      numCaja: data.numCaja,
      nombreUsuario: data.nombreUsuario,
      turno: data.turno,
      fechaStr: data.fechaStr,
      estado: data.estado
    };
  };

  /**
   * Carga todas las asignaciones de caja
   */
  const cargarAsignaciones = useCallback(async (params?: ListarAsignacionCajaParams) => {
    // Usar ref para evitar cargas multiples
    if (isLoadingRef.current) {
      console.log('[useAsignacionCajas] Carga ya en proceso, omitiendo...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('[useAsignacionCajas] Cargando asignaciones de caja...');

      const datos = await asignacionCajaService.listar(params);

      setAsignaciones(datos);
      console.log(`[useAsignacionCajas] ${datos.length} asignaciones cargadas`);

    } catch (error: any) {
      console.error('[useAsignacionCajas] Error:', error);
      setError(error.message || 'Error al cargar asignaciones');
      NotificationService.error('Error al cargar asignaciones de caja');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * Busca asignaciones con filtros
   */
  const buscarAsignaciones = useCallback(async (params: ListarAsignacionCajaParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAsignacionCajas] Buscando con filtros:', params);

      const resultados = await asignacionCajaService.listar(params);

      setAsignaciones(resultados);
      console.log(`[useAsignacionCajas] ${resultados.length} resultados encontrados`);

    } catch (error: any) {
      console.error('[useAsignacionCajas] Error en busqueda:', error);
      setError(error.message || 'Error al buscar asignaciones');
      NotificationService.error('Error al buscar asignaciones de caja');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca asignaciones por termino de busqueda
   */
  const buscarPorTermino = useCallback(async (termino: string) => {
    await buscarAsignaciones({ terminoBusqueda: termino });
  }, [buscarAsignaciones]);

  /**
   * Busca asignaciones por fecha
   */
  const buscarPorFecha = useCallback(async (fecha: string) => {
    await buscarAsignaciones({ fecha });
  }, [buscarAsignaciones]);

  /**
   * Busca asignaciones por usuario
   */
  const buscarPorUsuario = useCallback(async (codUsuario: number) => {
    await buscarAsignaciones({ codUsuario });
  }, [buscarAsignaciones]);

  /**
   * Crea una nueva asignacion de caja
   */
  const crearAsignacion = useCallback(async (datos: CreateAsignacionCajaDTO): Promise<AsignacionCajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAsignacionCajas] Creando asignacion:', datos);

      const nuevaAsignacion = await asignacionCajaService.insertar(datos);

      NotificationService.success('Asignacion de caja creada correctamente');

      // Recargar lista
      await cargarAsignaciones();

      return nuevaAsignacion;

    } catch (error: any) {
      console.error('[useAsignacionCajas] Error al crear:', error);
      setError(error.message || 'Error al crear asignacion');
      NotificationService.error(error.message || 'Error al crear asignacion de caja');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarAsignaciones]);

  /**
   * Actualiza una asignacion de caja existente
   */
  const actualizarAsignacion = useCallback(async (datos: UpdateAsignacionCajaDTO): Promise<AsignacionCajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAsignacionCajas] Actualizando asignacion:', datos);

      const asignacionActualizada = await asignacionCajaService.actualizar(datos);

      NotificationService.success('Asignacion de caja actualizada correctamente');

      // Recargar lista
      await cargarAsignaciones();

      return asignacionActualizada;

    } catch (error: any) {
      console.error('[useAsignacionCajas] Error al actualizar:', error);
      setError(error.message || 'Error al actualizar asignacion');
      NotificationService.error(error.message || 'Error al actualizar asignacion de caja');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarAsignaciones]);

  /**
   * Elimina una asignacion de caja
   */
  const eliminarAsignacion = useCallback(async (codAsignacionCaja: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useAsignacionCajas] Eliminando asignacion:', codAsignacionCaja);

      await asignacionCajaService.eliminar({ codAsignacionCaja });

      NotificationService.success('Asignacion de caja eliminada correctamente');

      // Recargar lista
      await cargarAsignaciones();

      return true;

    } catch (error: any) {
      console.error('[useAsignacionCajas] Error al eliminar:', error);
      setError(error.message || 'Error al eliminar asignacion');
      NotificationService.error(error.message || 'Error al eliminar asignacion de caja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarAsignaciones]);

  /**
   * Obtiene una asignacion especifica por codigo
   */
  const obtenerAsignacion = useCallback((codAsignacionCaja: number): AsignacionCajaData | null => {
    const asignacion = asignaciones.find(a => a.codAsignacionCaja === codAsignacionCaja);
    return asignacion || null;
  }, [asignaciones]);

  /**
   * Convierte todas las asignaciones al formato de lista
   */
  const obtenerListaFormateada = useCallback((): AsignacionCajaListItem[] => {
    return asignaciones.map(convertirAListItem);
  }, [asignaciones]);

  // Efecto deshabilitado - La carga ahora es manual a traves de los filtros
  // useEffect(() => {
  //   // Solo cargar si no hay asignaciones y no esta cargando
  //   if (asignaciones.length === 0 && !loading && !isLoadingRef.current) {
  //     cargarAsignaciones();
  //   }
  // }, []); // Sin dependencias

  return {
    // Estado
    asignaciones,
    loading,
    error,

    // Metodos de carga y busqueda
    cargarAsignaciones,
    buscarAsignaciones,
    buscarPorTermino,
    buscarPorFecha,
    buscarPorUsuario,

    // Metodos CRUD
    crearAsignacion,
    actualizarAsignacion,
    eliminarAsignacion,
    obtenerAsignacion,

    // Utilidades
    obtenerListaFormateada,
    convertirAListItem
  };
};
