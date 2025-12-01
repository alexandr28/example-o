// src/hooks/useTurnos.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  turnoService,
  TurnoData,
  CreateTurnoDTO,
  UpdateTurnoDTO,
  DeleteTurnoDTO,
  ListarTurnoParams
} from '../services/turnoService';

/**
 * Interface para el item de lista de turno
 */
export interface TurnoListItem {
  codTurno: number;
  nombreTurno: string;
  horario: string;
}

/**
 * Hook para gestionar turnos
 * NO requiere autenticacion para ninguna operacion
 */
export const useTurnos = () => {
  const [turnos, setTurnos] = useState<TurnoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para controlar si ya se esta cargando
  const isLoadingRef = useRef(false);

  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (data: TurnoData): TurnoListItem => {
    return {
      codTurno: data.codTurno,
      nombreTurno: data.nombreTurno,
      horario: data.horario
    };
  };

  /**
   * Carga todos los turnos
   */
  const cargarTurnos = useCallback(async (params?: ListarTurnoParams) => {
    // Usar ref para evitar cargas multiples
    if (isLoadingRef.current) {
      console.log('[useTurnos] Carga ya en proceso, omitiendo...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('[useTurnos] Cargando turnos...');

      const datos = await turnoService.listar(params);

      setTurnos(datos);
      console.log(`[useTurnos] ${datos.length} turnos cargados`);

    } catch (error: any) {
      console.error('[useTurnos] Error:', error);
      setError(error.message || 'Error al cargar turnos');
      NotificationService.error('Error al cargar turnos');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * Busca turnos con filtros
   */
  const buscarTurnos = useCallback(async (params: ListarTurnoParams) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTurnos] Buscando con filtros:', params);

      const resultados = await turnoService.listar(params);

      setTurnos(resultados);
      console.log(`[useTurnos] ${resultados.length} resultados encontrados`);

    } catch (error: any) {
      console.error('[useTurnos] Error en busqueda:', error);
      setError(error.message || 'Error al buscar turnos');
      NotificationService.error('Error al buscar turnos');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca turnos por nombre
   */
  const buscarPorNombre = useCallback(async (nombreTurno: string) => {
    await buscarTurnos({ nombreTurno });
  }, [buscarTurnos]);

  /**
   * Crea un nuevo turno
   */
  const crearTurno = useCallback(async (datos: CreateTurnoDTO): Promise<TurnoData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTurnos] Creando turno:', datos);

      const nuevoTurno = await turnoService.insertar(datos);

      NotificationService.success('Turno creado correctamente');

      // Recargar lista
      await cargarTurnos();

      return nuevoTurno;

    } catch (error: any) {
      console.error('[useTurnos] Error al crear:', error);
      setError(error.message || 'Error al crear turno');
      NotificationService.error(error.message || 'Error al crear turno');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarTurnos]);

  /**
   * Actualiza un turno existente
   */
  const actualizarTurno = useCallback(async (datos: UpdateTurnoDTO): Promise<TurnoData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTurnos] Actualizando turno:', datos);

      const turnoActualizado = await turnoService.actualizar(datos);

      NotificationService.success('Turno actualizado correctamente');

      // Recargar lista
      await cargarTurnos();

      return turnoActualizado;

    } catch (error: any) {
      console.error('[useTurnos] Error al actualizar:', error);
      setError(error.message || 'Error al actualizar turno');
      NotificationService.error(error.message || 'Error al actualizar turno');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarTurnos]);

  /**
   * Elimina un turno
   */
  const eliminarTurno = useCallback(async (codTurno: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useTurnos] Eliminando turno:', codTurno);

      await turnoService.eliminar({ codTurno });

      NotificationService.success('Turno eliminado correctamente');

      // Recargar lista
      await cargarTurnos();

      return true;

    } catch (error: any) {
      console.error('[useTurnos] Error al eliminar:', error);
      setError(error.message || 'Error al eliminar turno');
      NotificationService.error(error.message || 'Error al eliminar turno');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarTurnos]);

  /**
   * Obtiene un turno especifico por codigo
   */
  const obtenerTurno = useCallback((codTurno: number): TurnoData | null => {
    const turno = turnos.find(t => t.codTurno === codTurno);
    return turno || null;
  }, [turnos]);

  /**
   * Convierte todos los turnos al formato de lista
   */
  const obtenerListaFormateada = useCallback((): TurnoListItem[] => {
    return turnos.map(convertirAListItem);
  }, [turnos]);

  // Efecto para cargar turnos al montar
  useEffect(() => {
    // Solo cargar si no hay turnos y no esta cargando
    if (turnos.length === 0 && !loading && !isLoadingRef.current) {
      cargarTurnos();
    }
  }, []); // Sin dependencias

  return {
    // Estado
    turnos,
    loading,
    error,

    // Metodos de carga y busqueda
    cargarTurnos,
    buscarTurnos,
    buscarPorNombre,

    // Metodos CRUD
    crearTurno,
    actualizarTurno,
    eliminarTurno,
    obtenerTurno,

    // Utilidades
    obtenerListaFormateada,
    convertirAListItem
  };
};
