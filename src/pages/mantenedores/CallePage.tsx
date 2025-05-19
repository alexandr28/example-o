import { useState, useCallback } from 'react';
import { Calle, CalleFormData } from '../../models/Calle';
import { authGet, authPost, authPut, authDelete } from '../../api/authClient';

// URL base para la API de calles
const API_URL = 'http://localhost:8080/api/calles';

/**
 * Hook personalizado para la gestión de calles
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar calles
 * Incluye manejo de errores de conectividad y modo fallback
 */
export const useCalles = () => {
  // Estados
  const [calles, setCalles] = useState<Calle[]>([]);
  const [calleSeleccionada, setCalleSeleccionada] = useState<Calle | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Cargar calles desde la API
  const cargarCalles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        // Intentar cargar desde la API
        const data = await authGet(`${API_URL}`);
        
        if (data && Array.isArray(data)) {
          setCalles(data);
          setIsOfflineMode(false);
        } else {
          throw new Error('Formato de datos incorrecto');
        }
      } catch (apiError) {
        console.error('Error al cargar calles desde API:', apiError);
        
        // Verificar si es un error de conectividad
        if (!navigator.onLine || apiError.message.includes('fetch failed') || apiError.message.includes('network')) {
          console.log('Funcionando en modo sin conexión para calles');
          setIsOfflineMode(true);
          
          // Cargar datos locales de ejemplo para modo sin conexión
          const callesIniciales = [
            { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
            { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
            { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
          ];
          
          setCalles(callesIniciales);
        } else {
          // Si es otro tipo de error, propagarlo
          throw apiError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las calles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      if (modoEdicion && calleSeleccionada) {
        // Actualizar calle existente
        try {
          const response = await authPut(`${API_URL}/${calleSeleccionada.id}`, data);
          
          if (response) {
            // Actualizar estado local con datos del servidor
            setCalles(prev => prev.map(c => 
              c.id === calleSeleccionada.id ? response : c
            ));
            setIsOfflineMode(false);
          }
        } catch (apiError) {
          console.error('Error al actualizar calle en API:', apiError);
          
          // Verificar si es un error de conectividad
          if (!navigator.onLine || apiError.message.includes('fetch failed') || apiError.message.includes('network')) {
            console.log('Funcionando en modo sin conexión para actualizar calle');
            setIsOfflineMode(true);
            
            // Actualizar localmente en modo offline
            setCalles(prevCalles => 
              prevCalles.map(c => 
                c.id === calleSeleccionada.id ? { ...c, ...data } : c
              )
            );
          } else {
            // Si es otro tipo de error, propagarlo
            throw apiError;
          }
        }
      } else {
        // Crear nueva calle
        try {
          const response = await authPost(`${API_URL}`, data);
          
          if (response) {
            // Actualizar estado local con datos del servidor
            setCalles(prev => [...prev, response]);
            setIsOfflineMode(false);
          }
        } catch (apiError) {
          console.error('Error al crear calle en API:', apiError);
          
          // Verificar si es un error de conectividad
          if (!navigator.onLine || apiError.message.includes('fetch failed') || apiError.message.includes('network')) {
            console.log('Funcionando en modo sin conexión para crear calle');
            setIsOfflineMode(true);
            
            // Crear localmente en modo offline
            const nuevaCalle: Calle = {
              id: Math.max(0, ...calles.map(c => c.id || 0)) + 1,
              ...data,
            };
            
            setCalles(prevCalles => [...prevCalles, nuevaCalle]);
          } else {
            // Si es otro tipo de error, propagarlo
            throw apiError;
          }
        }
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la calle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [calles, calleSeleccionada, modoEdicion, limpiarSeleccion]);

  // Eliminar una calle
  const eliminarCalle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        // Intentar eliminar en la API
        await authDelete(`${API_URL}/${id}`);
        
        // Actualizar estado local
        setCalles(prevCalles => prevCalles.filter(c => c.id !== id));
        setIsOfflineMode(false);
      } catch (apiError) {
        console.error('Error al eliminar calle en API:', apiError);
        
        // Verificar si es un error de conectividad
        if (!navigator.onLine || apiError.message.includes('fetch failed') || apiError.message.includes('network')) {
          console.log('Funcionando en modo sin conexión para eliminar calle');
          setIsOfflineMode(true);
          
          // Eliminar localmente en modo offline
          setCalles(prevCalles => prevCalles.filter(c => c.id !== id));
        } else {
          // Si es otro tipo de error, propagarlo
          throw apiError;
        }
      }
      
      // Si la calle eliminada estaba seleccionada, limpiamos la selección
      if (calleSeleccionada?.id === id) {
        limpiarSeleccion();
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la calle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [calleSeleccionada, limpiarSeleccion]);

  return {
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    cargarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    setModoEdicion,
  };
};

// Exportación por defecto para mantener compatibilidad
export default useCalles;