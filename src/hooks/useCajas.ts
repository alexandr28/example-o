// src/hooks/useCajas.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  cajaService,
  CajaData,
  CreateCajaDTO,
  UpdateCajaDTO,
  DeleteCajaDTO,
  ListarCajaParams
} from '../services/cajaService';

/**
 * Interface para el item de lista de caja
 */
export interface CajaListItem {
  codCaja: number;
  numcaja: string;
  descripcion: string;
  estado: string;
  usuario: string | null;
}

/**
 * Hook para gestionar cajas
 * NO requiere autenticacion para ninguna operacion
 */
export const useCajas = () => {
  const [cajas, setCajas] = useState<CajaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para controlar si ya se esta cargando
  const isLoadingRef = useRef(false);

  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (data: CajaData): CajaListItem => {
    return {
      codCaja: data.codCaja,
      numcaja: data.numcaja,
      descripcion: data.descripcion,
      estado: data.estado,
      usuario: data.usuario
    };
  };

  /**
   * Carga todas las cajas
   */
  const cargarCajas = useCallback(async (params?: ListarCajaParams) => {
    // Usar ref para evitar cargas multiples
    if (isLoadingRef.current) {
      console.log('[useCajas] Carga ya en proceso, omitiendo...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('[useCajas] Cargando cajas...');

      const datos = await cajaService.listar(params);

      setCajas(datos);
      console.log(`[useCajas] ${datos.length} cajas cargadas`);

    } catch (error: any) {
      console.error('[useCajas] Error:', error);
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
  const buscarCajas = useCallback(async (params: ListarCajaParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useCajas] Buscando con filtros:', params);

      const resultados = await cajaService.listar(params);

      setCajas(resultados);
      console.log(`[useCajas] ${resultados.length} resultados encontrados`);

    } catch (error: any) {
      console.error('[useCajas] Error en busqueda:', error);
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
  const crearCaja = useCallback(async (datos: CreateCajaDTO): Promise<CajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useCajas] Creando caja:', datos);

      const nuevaCaja = await cajaService.insertar(datos);

      NotificationService.success('Caja creada correctamente');

      // Recargar lista
      await cargarCajas();

      return nuevaCaja;

    } catch (error: any) {
      console.error('[useCajas] Error al crear:', error);
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
  const actualizarCaja = useCallback(async (datos: UpdateCajaDTO): Promise<CajaData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useCajas] Actualizando caja:', datos);

      const cajaActualizada = await cajaService.actualizar(datos);

      NotificationService.success('Caja actualizada correctamente');

      // Recargar lista
      await cargarCajas();

      return cajaActualizada;

    } catch (error: any) {
      console.error('[useCajas] Error al actualizar:', error);
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

      console.log('[useCajas] Eliminando caja:', codCaja);

      await cajaService.eliminar({ codCaja });

      NotificationService.success('Caja eliminada correctamente');

      // Recargar lista
      await cargarCajas();

      return true;

    } catch (error: any) {
      console.error('[useCajas] Error al eliminar:', error);
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
  const obtenerCaja = useCallback((codCaja: number): CajaData | null => {
    const caja = cajas.find(c => c.codCaja === codCaja);
    return caja || null;
  }, [cajas]);

  /**
   * Obtiene solo las cajas disponibles
   */
  const obtenerCajasDisponibles = useCallback((): CajaData[] => {
    return cajas.filter(caja => caja.estado === 'DISPONIBLE');
  }, [cajas]);

  /**
   * Convierte todas las cajas al formato de lista
   */
  const obtenerListaFormateada = useCallback((): CajaListItem[] => {
    return cajas.map(convertirAListItem);
  }, [cajas]);

  /**
   * Verifica si una caja esta disponible
   */
  const estaDisponible = useCallback((codCaja: number): boolean => {
    const caja = obtenerCaja(codCaja);
    return caja?.estado === 'DISPONIBLE';
  }, [obtenerCaja]);

  // Efecto para cargar cajas al montar
  useEffect(() => {
    // Solo cargar si no hay cajas y no esta cargando
    if (cajas.length === 0 && !loading && !isLoadingRef.current) {
      cargarCajas();
    }
  }, []); // Sin dependencias

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
    obtenerCajasDisponibles,
    obtenerListaFormateada,
    estaDisponible,
    convertirAListItem
  };
};
