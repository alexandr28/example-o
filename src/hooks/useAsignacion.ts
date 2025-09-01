// src/hooks/useAsignacion.ts
import { useState, useCallback } from 'react';
import { asignacionService, AsignacionPredio, AsignacionQueryParams, CreateAsignacionAPIDTO } from '../services/asignacionService';
import { NotificationService } from '../components/utils/Notification';

export interface UseAsignacionReturn {
  asignaciones: AsignacionPredio[];
  loading: boolean;
  error: string | null;
  buscarAsignaciones: (params: AsignacionQueryParams) => Promise<void>;
  obtenerAsignacionPorId: (id: number) => Promise<AsignacionPredio | null>;
  crearAsignacionAPI: (datos: CreateAsignacionAPIDTO) => Promise<AsignacionPredio | null>;
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
   * Crear una nueva asignación usando API directa
   */
  const crearAsignacionAPI = useCallback(async (datos: CreateAsignacionAPIDTO): Promise<AsignacionPredio | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useAsignacion] Creando asignación con API directa:', datos);
      
      // Validar datos requeridos
      if (!datos.anio || !datos.codPredio || !datos.codContribuyente) {
        throw new Error('Año, código de predio y código de contribuyente son requeridos');
      }
      
      const nuevaAsignacion = await asignacionService.crearAsignacionAPI(datos);
      
      console.log('✅ [useAsignacion] Asignación creada exitosamente:', nuevaAsignacion);
      
      // Agregar a la lista actual
      setAsignaciones(prev => [nuevaAsignacion, ...prev]);
      
      NotificationService.success('Asignación de predio creada correctamente');
      
      return nuevaAsignacion;
      
    } catch (error: any) {
      console.error('❌ [useAsignacion] Error al crear asignación:', error);
      setError(error.message || 'Error al crear asignación de predio');
      NotificationService.error(error.message || 'Error al crear asignación de predio');
      return null;
    } finally {
      setLoading(false);
    }
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
    crearAsignacionAPI,
    limpiarAsignaciones,
    limpiarError
  };
};

export default useAsignacion;