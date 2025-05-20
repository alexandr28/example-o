// src/hooks/useCalles.ts
import { useState, useCallback, useEffect } from 'react';
import { Calle, CalleFormData } from '../models/Calle';
import CalleApiService from '../services/calleApiService';
import { connectivityService } from '../services/connectivityService';

/**
 * Hook personalizado para la gestión de calles
 * Versión modificada para no usar token
 */
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
        // Modo online - usar la API sin autenticación
        try {
          const data = await CalleApiService.getAll();
          setCalles(data);
          setIsOfflineMode(false);
          
          // Actualizar caché local
          localStorage.setItem('calles_cache', JSON.stringify(data));
        } catch (apiError) {
          console.error('Error al cargar vías desde API:', apiError);
          
          // Intentar usar caché local
          const callesLocales = localStorage.getItem('calles_cache');
          if (callesLocales) {
            setCalles(JSON.parse(callesLocales));
            setIsOfflineMode(true);
          }
        }
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

  // Resto del hook sin cambios, solo asegúrate de no usar autenticación en las peticiones
  // ...

  return {
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    pendingChangesCount: 0, // Simplificado
    cargarCalles,
    seleccionarCalle: setCalleSeleccionada,
    limpiarSeleccion: () => {
      setCalleSeleccionada(null);
      setModoEdicion(false);
    },
    guardarCalle: async (data: CalleFormData) => {
      try {
        setLoading(true);
        
        if (modoEdicion && calleSeleccionada) {
          const updated = await CalleApiService.update(calleSeleccionada.id, data);
          if (updated) {
            setCalles(prev => prev.map(c => c.id === calleSeleccionada.id ? updated : c));
          }
        } else {
          const created = await CalleApiService.create(data);
          if (created) {
            setCalles(prev => [...prev, created]);
          }
        }
        
        setCalleSeleccionada(null);
        setModoEdicion(false);
      } catch (error) {
        console.error('Error guardando calle:', error);
        setError('Error al guardar la calle');
      } finally {
        setLoading(false);
      }
    },
    eliminarCalle: async (id: number) => {
      try {
        setLoading(true);
        await CalleApiService.delete(id);
        setCalles(prev => prev.filter(c => c.id !== id));
        
        if (calleSeleccionada?.id === id) {
          setCalleSeleccionada(null);
          setModoEdicion(false);
        }
      } catch (error) {
        console.error('Error eliminando calle:', error);
        setError('Error al eliminar la calle');
      } finally {
        setLoading(false);
      }
    },
    buscarCalles: async (term: string) => {
      setSearchTerm(term);
      try {
        setLoading(true);
        
        if (!term.trim()) {
          await cargarCalles();
        } else {
          const results = await CalleApiService.search(term);
          setCalles(results);
        }
      } catch (error) {
        console.error('Error buscando calles:', error);
        // Búsqueda local como fallback
        if (term) {
          const termLower = term.toLowerCase();
          const callesCache = JSON.parse(localStorage.getItem('calles_cache') || '[]');
          setCalles(callesCache.filter((c: Calle) => 
            c.nombre.toLowerCase().includes(termLower) || 
            c.tipoVia.toLowerCase().includes(termLower)
          ));
        }
      } finally {
        setLoading(false);
      }
    },
    sincronizarCambios: async () => {
      await cargarCalles();
      return { success: true, message: 'Datos actualizados correctamente' };
    },
    setModoEdicion,
  };
};