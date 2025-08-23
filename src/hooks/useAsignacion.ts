// src/hooks/useAsignacion.ts
import { useState, useCallback } from 'react';
import { asignacionService, AsignacionPredio, AsignacionQueryParams } from '../services/asignacionService';

export interface UseAsignacionReturn {
  asignaciones: AsignacionPredio[];
  loading: boolean;
  error: string | null;
  buscarAsignaciones: (params: AsignacionQueryParams) => Promise<void>;
  obtenerAsignacionPorId: (id: number) => Promise<AsignacionPredio | null>;
  limpiarAsignaciones: () => void;
  limpiarError: () => void;
}

export const useAsignacion = (): UseAsignacionReturn => {
  const [asignaciones, setAsignaciones] = useState<AsignacionPredio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar asignaciones con parámetros específicos
   */
  const buscarAsignaciones = useCallback(async (params: AsignacionQueryParams) => {
    console.log('🔍 [useAsignacion] Iniciando búsqueda de asignaciones:', params);
    
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await asignacionService.buscarAsignaciones(params);
      console.log('✅ [useAsignacion] Asignaciones encontradas:', resultado.length);
      
      setAsignaciones(resultado);
      
      if (resultado.length === 0) {
        console.log('⚠️ [useAsignacion] No se encontraron asignaciones para los parámetros dados');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al buscar asignaciones';
      console.error('❌ [useAsignacion] Error en búsqueda:', errorMessage);
      setError(errorMessage);
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una asignación específica por ID
   */
  const obtenerAsignacionPorId = useCallback(async (id: number): Promise<AsignacionPredio | null> => {
    console.log('🔍 [useAsignacion] Obteniendo asignación por ID:', id);
    
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await asignacionService.obtenerAsignacionPorId(id);
      console.log('✅ [useAsignacion] Asignación encontrada:', resultado);
      
      return resultado;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener asignación';
      console.error('❌ [useAsignacion] Error al obtener por ID:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar la lista de asignaciones
   */
  const limpiarAsignaciones = useCallback(() => {
    console.log('🧹 [useAsignacion] Limpiando asignaciones');
    setAsignaciones([]);
    setError(null);
  }, []);

  /**
   * Limpiar mensajes de error
   */
  const limpiarError = useCallback(() => {
    console.log('🧹 [useAsignacion] Limpiando error');
    setError(null);
  }, []);

  return {
    asignaciones,
    loading,
    error,
    buscarAsignaciones,
    obtenerAsignacionPorId,
    limpiarAsignaciones,
    limpiarError
  };
};

export default useAsignacion;