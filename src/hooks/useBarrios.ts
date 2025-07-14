// src/hooks/useBarrios.ts
import { useState, useCallback, useEffect } from 'react';
import { Barrio, BarrioFormData } from '../models/Barrio';
import barrioService from '../services/barrioService';
import { NotificationService } from '../components/utils/Notification';

// Tipos del servicio
import type { BarrioData } from '../services/barrioService';

/**
 * Adaptador para convertir BarrioData (servicio) a Barrio (modelo)
 */
const adaptBarrioDataToModel = (data: BarrioData): Barrio => {
  return {
    id: data.codigo,
    nombre: data.nombre,
    codSector: data.codSector || 0,
    descripcion: data.descripcion,
    estado: data.estado || 'ACTIVO',
    fechaRegistro: data.fechaRegistro,
    fechaModificacion: data.fechaModificacion,
    usuarioCreacion: data.codUsuario?.toString(),
    usuarioModificacion: data.codUsuario?.toString()
  };
};

/**
 * Hook personalizado para gestión de barrios
 */
export const useBarrios = () => {
  // Estados principales
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<Barrio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Estado para filtros
  const [filtroSector, setFiltroSector] = useState<number | null>(null);
  
  // Estado para modo offline
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Verificar conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      NotificationService.info('Conexión restaurada');
    };
    
    const handleOffline = () => {
      setIsOfflineMode(true);
      NotificationService.warning('Trabajando sin conexión');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Cargar todos los barrios
   */
  const cargarBarrios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [useBarrios] Cargando barrios...');
      
      // Obtener datos del servicio
      const barrioData = await barrioService.obtenerTodos();
      
      // Convertir BarrioData[] a Barrio[]
      const barriosAdaptados = barrioData.map(adaptBarrioDataToModel);
      
      setBarrios(barriosAdaptados);
      setLastSyncTime(new Date());
      
      console.log(`✅ [useBarrios] ${barriosAdaptados.length} barrios cargados`);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al cargar barrios:', error);
      
      if (isOfflineMode) {
        NotificationService.warning('Sin conexión. Mostrando datos locales');
        // Aquí podrías cargar datos del localStorage si los tienes
      } else {
        setError(error.message || 'Error al cargar barrios');
        NotificationService.error('Error al cargar los barrios');
      }
    } finally {
      setLoading(false);
    }
  }, [isOfflineMode]);

  /**
   * Buscar barrios por término
   */
  const buscarBarrios = useCallback(async (termino: string) => {
    try {
      setLoading(true);
      setError(null);
      setSearchTerm(termino);
      
      if (termino.trim() === '') {
        await cargarBarrios();
        return;
      }
      
      console.log('🔍 [useBarrios] Buscando barrios:', termino);
      
      const resultados = await barrioService.buscarPorNombre(termino);
      const barriosAdaptados = resultados.map(adaptBarrioDataToModel);
      
      setBarrios(barriosAdaptados);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al buscar:', error);
      setError(error.message || 'Error al buscar barrios');
      NotificationService.error('Error al buscar barrios');
    } finally {
      setLoading(false);
    }
  }, [cargarBarrios]);

  /**
   * Filtrar barrios por sector
   */
  const filtrarPorSector = useCallback(async (codSector: number | null) => {
    try {
      setLoading(true);
      setError(null);
      setFiltroSector(codSector);
      
      if (!codSector) {
        await cargarBarrios();
        return;
      }
      
      console.log('🔍 [useBarrios] Filtrando por sector:', codSector);
      
      const resultados = await barrioService.obtenerPorSector(codSector);
      const barriosAdaptados = resultados.map(adaptBarrioDataToModel);
      
      setBarrios(barriosAdaptados);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al filtrar:', error);
      setError(error.message || 'Error al filtrar barrios');
      NotificationService.error('Error al filtrar barrios');
    } finally {
      setLoading(false);
    }
  }, [cargarBarrios]);

  /**
   * Seleccionar barrio para edición
   */
  const seleccionarBarrio = useCallback((barrio: Barrio | null) => {
    console.log('📝 [useBarrios] Barrio seleccionado:', barrio);
    setBarrioSeleccionado(barrio);
    setModoEdicion(!!barrio);
  }, []);

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    console.log('🧹 [useBarrios] Limpiando selección');
    setBarrioSeleccionado(null);
    setModoEdicion(false);
    setError(null);
  }, []);

  /**
   * Guardar barrio (crear o actualizar)
   */
  const guardarBarrio = useCallback(async (data: BarrioFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useBarrios] Guardando barrio:', data);
      console.log('🔄 [useBarrios] Modo edición:', modoEdicion);
      
      // Validación de sector
      if (!data.codSector || data.codSector <= 0) {
        throw new Error('Debe seleccionar un sector');
      }
      
      if (modoEdicion && barrioSeleccionado) {
        // Modo edición
        console.log('📝 [useBarrios] Actualizando barrio ID:', barrioSeleccionado.id);
        
        const resultado = await barrioService.actualizarBarrio(
          barrioSeleccionado.id, 
          {
            nombre: data.nombre.trim(),
            codSector: data.codSector,
            descripcion: data.descripcion?.trim() || ''
          }
        );
        
        console.log('✅ [useBarrios] Barrio actualizado:', resultado);
        NotificationService.success('Barrio actualizado correctamente');
        
      } else {
        // Modo creación
        console.log('➕ [useBarrios] Creando nuevo barrio');
        
        const resultado = await barrioService.crearBarrio({
          nombre: data.nombre.trim(),
          codSector: data.codSector,
          descripcion: data.descripcion?.trim() || ''
        });
        
        console.log('✅ [useBarrios] Barrio creado:', resultado);
        
        if (resultado && resultado.codigo) {
          NotificationService.success('Barrio creado correctamente');
        }
      }
      
      // IMPORTANTE: Recargar la lista después de crear/actualizar
      console.log('🔄 [useBarrios] Recargando lista de barrios...');
      
      // Esperar un momento para que el servidor procese
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar lista
      await cargarBarrios();
      
      // Limpiar formulario y cerrar modal
      limpiarSeleccion();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al guardar:', error);
      
      let mensaje = 'Error al guardar el barrio';
      
      if (error.message) {
        if (error.message.includes('403')) {
          mensaje = 'No tiene permisos para realizar esta acción';
        } else if (error.message.includes('400')) {
          mensaje = 'Datos inválidos. Verifique la información';
        } else if (error.message.includes('sector')) {
          mensaje = 'Debe seleccionar un sector válido';
        } else if (error.message.includes('nombre')) {
          mensaje = error.message;
        } else {
          mensaje = error.message;
        }
      }
      
      setError(mensaje);
      NotificationService.error(mensaje);
      return false;
      
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, barrioSeleccionado, cargarBarrios, limpiarSeleccion]);

  /**
   * Eliminar barrio
   */
  const eliminarBarrio = useCallback(async (id: number): Promise<boolean> => {
    try {
      const confirmar = window.confirm('¿Está seguro de eliminar este barrio?');
      
      if (!confirmar) {
        return false;
      }
      
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useBarrios] Eliminando barrio ID:', id);
      
      await barrioService.eliminarBarrio(id);
      
      console.log('✅ [useBarrios] Barrio eliminado');
      NotificationService.success('Barrio eliminado correctamente');
      
      // Recargar lista
      await cargarBarrios();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al eliminar:', error);
      const mensaje = error.message || 'Error al eliminar el barrio';
      setError(mensaje);
      NotificationService.error(mensaje);
      return false;
      
    } finally {
      setLoading(false);
    }
  }, [cargarBarrios]);

  /**
   * Obtener barrios filtrados
   */
  const barriosFiltrados = useCallback(() => {
    let resultados = [...barrios];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const termino = searchTerm.toLowerCase();
      resultados = resultados.filter(barrio =>
        barrio.nombre.toLowerCase().includes(termino) ||
        barrio.descripcion?.toLowerCase().includes(termino)
      );
    }
    
    // Filtrar por sector si hay filtro activo
    if (filtroSector) {
      resultados = resultados.filter(barrio => 
        barrio.codSector === filtroSector
      );
    }
    
    // Ordenar por nombre
    resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    return resultados;
  }, [barrios, searchTerm, filtroSector]);

  /**
   * Efecto para cargar barrios al montar
   */
  useEffect(() => {
    cargarBarrios();
  }, [cargarBarrios]);

  /**
   * Verificar si existe un barrio con el mismo nombre
   */
  const verificarNombreExiste = useCallback((nombre: string, excluirId?: number): boolean => {
    const nombreNormalizado = nombre.trim().toLowerCase();
    
    return barrios.some(barrio => 
      barrio.nombre.toLowerCase() === nombreNormalizado &&
      (!excluirId || barrio.id !== excluirId)
    );
  }, [barrios]);

  /**
   * Obtener estadísticas de barrios
   */
  const obtenerEstadisticas = useCallback(() => {
    const total = barrios.length;
    const activos = barrios.filter(b => b.estado === 'ACTIVO').length;
    const inactivos = total - activos;
    
    // Barrios por sector
    const porSector = barrios.reduce((acc, barrio) => {
      const sector = barrio.codSector || 0;
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      total,
      activos,
      inactivos,
      porSector,
      ultimaActualizacion: lastSyncTime
    };
  }, [barrios, lastSyncTime]);

  return {
    // Estados
    barrios: barriosFiltrados(),
    barrioSeleccionado,
    loading,
    error,
    searchTerm,
    modoEdicion,
    filtroSector,
    isOfflineMode,
    
    // Métodos
    cargarBarrios,
    buscarBarrios,
    filtrarPorSector,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    verificarNombreExiste,
    
    // Estadísticas
    estadisticas: obtenerEstadisticas(),
    
    // Setters directos
    setSearchTerm,
    setFiltroSector
  };
};