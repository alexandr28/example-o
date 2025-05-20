import { useState, useCallback, useEffect } from 'react';
import { Calle, CalleFormData } from '../models/Calle';
import CalleApiService from '../services/calleApiService';
import { connectivityService } from '../services/connectivityService';
//import { API_ENDPOINTS } from '../config/constants';

/**
 * Hook personalizado para la gestión de calles
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar calles
 * Incluye manejo de errores de conectividad y modo fallback
 */

//const API_URL = API_ENDPOINTS.VIA || 'http://localhost:8080/api/sector';
export const useCalles = () => {
  // Estados
  const [calles, setCalles] = useState<Calle[]>([]);
  const [calleSeleccionada, setCalleSeleccionada] = useState<Calle | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar calles desde la API
  const cargarCalles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si la API de vía está disponible específicamente
      const viaApiAvailable = connectivityService.getApiStatus('via');
      
      if (!viaApiAvailable) {
        console.log('API de vía no disponible, trabajando en modo offline');
        setIsOfflineMode(true);
        
        // Cargar datos locales si están disponibles
        const callesLocales = localStorage.getItem('calles_cache');
        if (callesLocales) {
          setCalles(JSON.parse(callesLocales));
        } else {
          // Datos de fallback si no hay nada en caché
          const callesFallback = [
            { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
            { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
            { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
          ];
          setCalles(callesFallback);
          // Guardar en caché para uso futuro
          localStorage.setItem('calles_cache', JSON.stringify(callesFallback));
        }
      } else {
        // Modo online - usar la API
        const data = await CalleApiService.getAll();
        setCalles(data);
        setIsOfflineMode(false);
        
        // Actualizar caché local
        localStorage.setItem('calles_cache', JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las calles');
      console.error('Error en cargarCalles:', err);
      
      // Si hay error, intentar usar datos de caché
      const callesLocales = localStorage.getItem('calles_cache');
      if (callesLocales) {
        setCalles(JSON.parse(callesLocales));
        setIsOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Monitorear cambios en la conectividad específica de la API de vías
  useEffect(() => {
    const unsubscribe = connectivityService.addListener((status, apiName) => {
      // Si es una notificación específica para la API de vía
      if (apiName === 'via') {
        setIsOfflineMode(!status);
        if (status) {
          // Si la API de vía volvió a estar online, intentamos sincronizar
          cargarCalles();
        }
      }
      // Si es una notificación general y no hay ninguna API específica
      else if (!apiName) {
        setIsOfflineMode(!status);
        if (status) {
          // Si toda la aplicación volvió a estar online, intentamos sincronizar
          cargarCalles();
        }
      }
    });
    
    return () => unsubscribe();
  }, [cargarCalles]);

  // Monitorear cambios en la conectividad específica de la API de vías
  useEffect(() => {
    const unsubscribe = connectivityService.addListener((status, apiName) => {
      // Si es una notificación específica para la API de vía
      if (apiName === 'via') {
        setIsOfflineMode(!status);
        if (status) {
          // Si la API de vía volvió a estar online, intentamos sincronizar
          cargarCalles();
        }
      }
      // Si es una notificación general y no hay ninguna API específica
      else if (!apiName) {
        setIsOfflineMode(!status);
        if (status) {
          // Si toda la aplicación volvió a estar online, intentamos sincronizar
          cargarCalles();
        }
      }
    });
    
    return () => unsubscribe();
  }, [cargarCalles]);

  // Seleccionar una calle para editar
  const seleccionarCalle = useCallback((calle: Calle) => {
    setCalleSeleccionada(calle);
    setModoEdicion(true);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setCalleSeleccionada(null);
    setModoEdicion(false);
  }, []);

  // Guardar una calle (crear o actualizar)
  const guardarCalle = useCallback(async (data: CalleFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      let result: Calle | null;
      
      // Verificar si la API de vía está disponible específicamente
      const viaApiAvailable = connectivityService.getApiStatus('via');
      
      if (!viaApiAvailable) {
        console.log('API de vía no disponible, guardando en modo offline');
        setIsOfflineMode(true);
        
        if (modoEdicion && calleSeleccionada) {
          // Actualizar localmente
          const updatedCalle: Calle = {
            ...calleSeleccionada,
            ...data
          };
          
          setCalles(prev => prev.map(c => c.id === calleSeleccionada.id ? updatedCalle : c));
          result = updatedCalle;
          
          // Guardar la operación pendiente
          const pendingChanges = JSON.parse(localStorage.getItem('pending_calles_changes') || '[]');
          pendingChanges.push({
            type: 'UPDATE',
            id: calleSeleccionada.id,
            data: data,
            timestamp: Date.now()
          });
          localStorage.setItem('pending_calles_changes', JSON.stringify(pendingChanges));
        } else {
          // Crear localmente con ID temporal
          const newId = Math.max(0, ...calles.map(c => c.id)) + 1;
          const newCalle: Calle = {
            id: newId,
            ...data
          };
          
          setCalles(prev => [...prev, newCalle]);
          result = newCalle;
          
          // Guardar la operación pendiente
          const pendingChanges = JSON.parse(localStorage.getItem('pending_calles_changes') || '[]');
          pendingChanges.push({
            type: 'CREATE',
            data: data,
            tempId: newId,
            timestamp: Date.now()
          });
          localStorage.setItem('pending_calles_changes', JSON.stringify(pendingChanges));
        }
        
        // Actualizar caché local
        localStorage.setItem('calles_cache', JSON.stringify([...calles]));
      } else {
        // Modo online - usar la API
        if (modoEdicion && calleSeleccionada) {
          result = await CalleApiService.update(calleSeleccionada.id, data);
          if (result) {
            setCalles(prev => prev.map(c => c.id === calleSeleccionada.id ? result! : c));
          }
        } else {
          result = await CalleApiService.create(data);
          if (result) {
            setCalles(prev => [...prev, result!]);
          }
        }
        
        setIsOfflineMode(false);
        
        // Actualizar caché local
        const updatedCalles = await CalleApiService.getAll();
        localStorage.setItem('calles_cache', JSON.stringify(updatedCalles));
      }
      
      // Limpiar selección
      limpiarSeleccion();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la calle');
      console.error('Error en guardarCalle:', err);
      
      // Si hay error de red, pasar a modo offline
      if (err.isOfflineError || !navigator.onLine) {
        setIsOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  }, [calles, calleSeleccionada, modoEdicion, limpiarSeleccion]);

  // Eliminar una calle
  const eliminarCalle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si la API de vía está disponible específicamente
      const viaApiAvailable = connectivityService.getApiStatus('via');
      
      if (!viaApiAvailable) {
        console.log('API de vía no disponible, eliminando en modo offline');
        setIsOfflineMode(true);
        
        // Eliminar localmente
        const updatedCalles = calles.filter(c => c.id !== id);
        setCalles(updatedCalles);
        
        // Guardar la operación pendiente
        const pendingChanges = JSON.parse(localStorage.getItem('pending_calles_changes') || '[]');
        pendingChanges.push({
          type: 'DELETE',
          id: id,
          timestamp: Date.now()
        });
        localStorage.setItem('pending_calles_changes', JSON.stringify(pendingChanges));
        
        // Actualizar caché local
        localStorage.setItem('calles_cache', JSON.stringify(updatedCalles));
      } else {
        // Modo online - usar la API
        await CalleApiService.delete(id);
        setCalles(prev => prev.filter(c => c.id !== id));
        setIsOfflineMode(false);
        
        // Actualizar caché local
        const updatedCalles = await CalleApiService.getAll();
        localStorage.setItem('calles_cache', JSON.stringify(updatedCalles));
      }
      
      // Si la calle eliminada estaba seleccionada, limpiar selección
      if (calleSeleccionada?.id === id) {
        limpiarSeleccion();
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la calle');
      console.error('Error en eliminarCalle:', err);
      
      // Si hay error de red, pasar a modo offline
      if (err.isOfflineError || !navigator.onLine) {
        setIsOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  }, [calles, calleSeleccionada, limpiarSeleccion]);

  // Búsqueda de calles
  const buscarCalles = useCallback(async (term: string) => {
    setSearchTerm(term);
    try {
      setLoading(true);
      
      // Verificar si la API de vía está disponible específicamente
      const viaApiAvailable = connectivityService.getApiStatus('via');
      
      // Si estamos en modo offline o el término está vacío, no hacemos búsqueda en la API
      if (!viaApiAvailable || !term.trim()) {
        // Filtrar localmente
        if (!term.trim()) {
          cargarCalles();
        } else {
          const termLower = term.toLowerCase();
          const callesCache = JSON.parse(localStorage.getItem('calles_cache') || '[]');
          const filtradas = callesCache.filter((calle: Calle) => 
            calle.nombre.toLowerCase().includes(termLower) || 
            calle.tipoVia.toLowerCase().includes(termLower)
          );
          setCalles(filtradas);
        }
      } else {
        // Buscar en la API
        const resultados = await CalleApiService.search(term);
        setCalles(resultados);
      }
    } catch (error) {
      console.error('Error al buscar calles:', error);
      
      // Si hay error, hacer búsqueda local
      const termLower = term.toLowerCase();
      const callesCache = JSON.parse(localStorage.getItem('calles_cache') || '[]');
      const filtradas = callesCache.filter((calle: Calle) => 
        calle.nombre.toLowerCase().includes(termLower) || 
        calle.tipoVia.toLowerCase().includes(termLower)
      );
      setCalles(filtradas);
    } finally {
      setLoading(false);
    }
  }, [cargarCalles]);

  // Sincronizar cambios pendientes
  const sincronizarCambios = useCallback(async () => {
    // Verificar si la API de vía está disponible específicamente
    const viaApiAvailable = connectivityService.getApiStatus('via');
    
    if (!viaApiAvailable) {
      return { success: false, message: 'No hay conexión disponible con la API de vías' };
    }
    
    try {
      setLoading(true);
      
      // Obtener cambios pendientes
      const pendingChanges = JSON.parse(localStorage.getItem('pending_calles_changes') || '[]');
      if (pendingChanges.length === 0) {
        return { success: true, message: 'No hay cambios pendientes para sincronizar' };
      }
      
      // Ordenar por timestamp para procesar en orden cronológico
      pendingChanges.sort((a: any, b: any) => a.timestamp - b.timestamp);
      
      // Procesar cada cambio pendiente
      const fallosIds: number[] = [];
      
      for (const change of pendingChanges) {
        try {
          if (change.type === 'CREATE') {
            await CalleApiService.create(change.data);
          } else if (change.type === 'UPDATE') {
            await CalleApiService.update(change.id, change.data);
          } else if (change.type === 'DELETE') {
            await CalleApiService.delete(change.id);
          }
        } catch (error) {
          console.error(`Error al sincronizar ${change.type} para ID ${change.id || change.tempId}:`, error);
          fallosIds.push(change.id || change.tempId);
        }
      }
      
      // Filtrar los cambios que fallaron para mantenerlos
      const failedChanges = pendingChanges.filter((change: any) => 
        fallosIds.includes(change.id || change.tempId)
      );
      
      // Actualizar la lista de cambios pendientes
      localStorage.setItem('pending_calles_changes', JSON.stringify(failedChanges));
      
      // Recargar datos actualizados
      const updatedCalles = await CalleApiService.getAll();
      setCalles(updatedCalles);
      localStorage.setItem('calles_cache', JSON.stringify(updatedCalles));
      
      return { 
        success: failedChanges.length === 0, 
        message: failedChanges.length === 0 
          ? 'Todos los cambios se sincronizaron correctamente' 
          : `${fallosIds.length} cambios no pudieron sincronizarse`
      };
    } catch (error) {
      console.error('Error al sincronizar cambios:', error);
      return { success: false, message: 'Error al sincronizar los cambios' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Contar cambios pendientes
  const contarCambiosPendientes = useCallback((): number => {
    try {
      const pendingChanges = JSON.parse(localStorage.getItem('pending_calles_changes') || '[]');
      return pendingChanges.length;
    } catch (error) {
      console.error('Error al contar cambios pendientes:', error);
      return 0;
    }
  }, []);

  return {
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    pendingChangesCount: contarCambiosPendientes(),
    cargarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    buscarCalles,
    sincronizarCambios,
    setModoEdicion,
  };
};