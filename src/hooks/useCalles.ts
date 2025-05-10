import { useState, useCallback } from 'react';
import { Calle, CalleFormData } from '../models/Calle';

// Datos de ejemplo para pruebas
const callesIniciales: Calle[] = [
  { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
  { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
  { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
];

/**
 * Hook personalizado para la gestión de calles
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar calles
 */
export const useCalles = () => {
  // Estados
  const [calles, setCalles] = useState<Calle[]>(callesIniciales);
  const [calleSeleccionada, setCalleSeleccionada] = useState<Calle | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar calles (simula una petición a API)
  const cargarCalles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API
      // const response = await fetch('/api/calles');
      // const data = await response.json();
      // setCalles(data);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setCalles(callesIniciales);
    } catch (err) {
      setError('Error al cargar las calles');
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
        // Aquí iría la petición a la API para actualizar
        // await fetch(`/api/calles/${calleSeleccionada.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        
        // Actualizamos el estado local
        setCalles(prevCalles => 
          prevCalles.map(c => 
            c.id === calleSeleccionada.id 
              ? { ...c, ...data } 
              : c
          )
        );
      } else {
        // Crear nueva calle
        // Aquí iría la petición a la API para crear
        // const response = await fetch('/api/calles', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        // const nuevaCalle = await response.json();
        
        // Simulamos la creación con un ID nuevo
        const nuevaCalle: Calle = {
          id: Math.max(0, ...calles.map(c => c.id)) + 1,
          ...data,
        };
        
        // Actualizamos el estado local
        setCalles(prevCalles => [...prevCalles, nuevaCalle]);
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err) {
      setError('Error al guardar la calle');
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
      
      // Aquí iría la petición a la API para eliminar
      // await fetch(`/api/calles/${id}`, {
      //   method: 'DELETE',
      // });
      
      // Actualizamos el estado local
      setCalles(prevCalles => prevCalles.filter(c => c.id !== id));
      
      // Si la calle eliminada estaba seleccionada, limpiamos la selección
      if (calleSeleccionada?.id === id) {
        limpiarSeleccion();
      }
    } catch (err) {
      setError('Error al eliminar la calle');
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
    cargarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    setModoEdicion,
  };
};