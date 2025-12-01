// src/hooks/useMantenedorCaja.ts
import { useState, useCallback, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  mantenedorCajaService,
  MantenedorCajaData,
  CreateMantenedorCajaDTO,
  UpdateMantenedorCajaDTO,
  DeleteMantenedorCajaDTO,
  ListarMantenedorCajaParams
} from '../services/mantenedorCajaService';

/**
 * Interface para el item de lista de cajas
 */
export interface MantenedorCajaListItem {
  codCaja: number;
  descripcion: string;
  usuario: string | null;
  numcaja: string;
  estado: string;
}

/**
 * Hook para gestionar mantenedor de cajas
 * NO requiere autenticacion para ninguna operacion
 */
export const useMantenedorCaja = () => {
  const [cajas, setCajas] = useState<MantenedorCajaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para controlar si ya se esta cargando
  const isLoadingRef = useRef(false);

  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (data: MantenedorCajaData): MantenedorCajaListItem => {
    return {
      codCaja: data.codCaja,
      descripcion: data.descripcion,
      usuario: data.usuario,
      numcaja: data.numcaja,
      estado: data.estado
    };
  };

  /**
   * Carga todas las cajas
   */
  const cargarCajas = useCallback(async (params?: ListarMantenedorCajaParams) => {
    // Usar ref para evitar cargas multiples
    if (isLoadingRef.current) {
      console.log('[useMantenedorCaja] Carga ya en proceso, omitiendo...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('[useMantenedorCaja] Cargando cajas...');

      const datos = await mantenedorCajaService.listar(params);

      setCajas(datos);
      console.log(`[useMantenedorCaja] ${datos.length} cajas cargadas`);

    } catch (error: any) {
      console.error('[useMantenedorCaja] Error:', error);
      setError(error.message || 'Error al cargar cajas');
      NotificationService.error('Error al cargar cajas');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * Busca cajas con filtros
   */
  const buscarCajas = useCallback(async (params: ListarMantenedorCajaParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useMantenedorCaja] Buscando con filtros:', params);

      const resultados = await mantenedorCajaService.listar(params);

      setCajas(resultados);
      console.log(`[useMantenedorCaja] ${resultados.length} resultados encontrados`);

    } catch (error: any) {
      console.error('[useMantenedorCaja] Error en busqueda:', error);
      setError(error.message || 'Error al buscar cajas');
      NotificationService.error('Error al buscar cajas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca cajas por descripcion
   */
  const buscarPorDescripcion = useCallback(async (descripcion: string) => {
    await buscarCajas({ descripcion });
  }, [buscarCajas]);

  /**
   * Busca cajas por usuario
   */
  const buscarPorUsuario = useCallback(async (codUsuario: number) => {
    await buscarCajas({ codUsuario });
  }, [buscarCajas]);

  /**
   * Crea una nueva caja
   */
  const crearCaja = useCallback(async (datos: CreateMantenedorCajaDTO): Promise<MantenedorCajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useMantenedorCaja] Creando caja:', datos);

      const nuevaCaja = await mantenedorCajaService.insertar(datos);

      NotificationService.success('Caja creada correctamente');

      // Recargar lista
      await cargarCajas();

      return nuevaCaja;

    } catch (error: any) {
      console.error('[useMantenedorCaja] Error al crear:', error);
      setError(error.message || 'Error al crear caja');
      NotificationService.error(error.message || 'Error al crear caja');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarCajas]);

  /**
   * Actualiza una caja existente
   */
  const actualizarCaja = useCallback(async (datos: UpdateMantenedorCajaDTO): Promise<MantenedorCajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useMantenedorCaja] Actualizando caja:', datos);

      const cajaActualizada = await mantenedorCajaService.actualizar(datos);

      NotificationService.success('Caja actualizada correctamente');

      // Recargar lista
      await cargarCajas();

      return cajaActualizada;

    } catch (error: any) {
      console.error('[useMantenedorCaja] Error al actualizar:', error);
      setError(error.message || 'Error al actualizar caja');
      NotificationService.error(error.message || 'Error al actualizar caja');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarCajas]);

  /**
   * Elimina una caja
   */
  const eliminarCaja = useCallback(async (codCaja: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useMantenedorCaja] Eliminando caja:', codCaja);

      await mantenedorCajaService.eliminar({ codCaja });

      NotificationService.success('Caja eliminada correctamente');

      // Recargar lista
      await cargarCajas();

      return true;

    } catch (error: any) {
      console.error('[useMantenedorCaja] Error al eliminar:', error);
      setError(error.message || 'Error al eliminar caja');
      NotificationService.error(error.message || 'Error al eliminar caja');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarCajas]);

  /**
   * Obtiene una caja especifica por codigo
   */
  const obtenerCaja = useCallback((codCaja: number): MantenedorCajaData | null => {
    const caja = cajas.find(c => c.codCaja === codCaja);
    return caja || null;
  }, [cajas]);

  /**
   * Convierte todas las cajas al formato de lista
   */
  const obtenerListaFormateada = useCallback((): MantenedorCajaListItem[] => {
    return cajas.map(convertirAListItem);
  }, [cajas]);

  /**
   * Obtiene cajas disponibles
   */
  const obtenerCajasDisponibles = useCallback((): MantenedorCajaData[] => {
    return cajas.filter(c => c.estado === 'DISPONIBLE');
  }, [cajas]);

  /**
   * Verifica si una caja esta disponible
   */
  const estaDisponible = useCallback((codCaja: number): boolean => {
    const caja = cajas.find(c => c.codCaja === codCaja);
    return caja?.estado === 'DISPONIBLE';
  }, [cajas]);

  return {
    // Estado
    cajas,
    loading,
    error,

    // Metodos de carga y busqueda
    cargarCajas,
    buscarCajas,
    buscarPorDescripcion,
    buscarPorUsuario,

    // Metodos CRUD
    crearCaja,
    actualizarCaja,
    eliminarCaja,
    obtenerCaja,

    // Utilidades
    obtenerListaFormateada,
    obtenerCajasDisponibles,
    estaDisponible,
    convertirAListItem
  };
};
