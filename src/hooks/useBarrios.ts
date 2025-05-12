import { useState, useCallback, useEffect } from 'react';
import { Barrio, BarrioFormData, Sector } from '../models';

// Datos de ejemplo para pruebas
const barriosIniciales: Barrio[] = [
  { id: 1, nombre: 'BARRIO 1', sectorId: 1, sector: { id: 1, nombre: 'SECTOR CENTRAL' } },
  { id: 2, nombre: 'BARRIO 2', sectorId: 1, sector: { id: 1, nombre: 'SECTOR CENTRAL' } },
  { id: 3, nombre: 'BARRIO 3', sectorId: 1, sector: { id: 1, nombre: 'SECTOR CENTRAL' } },
];

// Sectores para el selector (los mismos que se usan en el hook de sectores)
const sectoresIniciales: Sector[] = [
  { id: 1, nombre: 'SECTOR CENTRAL' },
  { id: 2, nombre: 'SECTOR JERUSALÉN' },
  { id: 3, nombre: 'URB. MANUEL ARÉVALO II' },
  { id: 4, nombre: 'PARQUE INDUSTRIAL' },
];

/**
 * Hook personalizado para la gestión de barrios
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar barrios
 */
export const useBarrios = () => {
  // Estados
  const [barrios, setBarrios] = useState<Barrio[]>(barriosIniciales);
  const [sectores, setSectores] = useState<Sector[]>(sectoresIniciales);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<Barrio | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar barrios (simula una petición a API)
  const cargarBarrios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API
      // const response = await fetch('/api/barrios');
      // const data = await response.json();
      // setBarrios(data);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setBarrios(barriosIniciales);
    } catch (err) {
      setError('Error al cargar los barrios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar sectores (simula una petición a API)
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API
      // const response = await fetch('/api/sectores');
      // const data = await response.json();
      // setSectores(data);
      
      // Simulamos un retardo
      await new Promise(resolve => setTimeout(resolve, 500));
      setSectores(sectoresIniciales);
    } catch (err) {
      setError('Error al cargar los sectores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarSectores();
    cargarBarrios();
  }, [cargarSectores, cargarBarrios]);

  // Seleccionar un barrio para editar
  const seleccionarBarrio = useCallback((barrio: Barrio) => {
    setBarrioSeleccionado(barrio);
    setModoEdicion(true);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setBarrioSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Guardar un barrio (crear o actualizar)
  const guardarBarrio = useCallback(async (data: BarrioFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar el sector correspondiente
      const sectorSeleccionado = sectores.find(s => s.id === parseInt(data.sectorId.toString()));
      
      if (!sectorSeleccionado) {
        throw new Error('Sector no encontrado');
      }
      
      if (modoEdicion && barrioSeleccionado) {
        // Actualizar barrio existente
        // Aquí iría la petición a la API para actualizar
        // await fetch(`/api/barrios/${barrioSeleccionado.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        
        // Actualizamos el estado local
        setBarrios(prevBarrios => 
          prevBarrios.map(b => 
            b.id === barrioSeleccionado.id 
              ? { 
                  ...b, 
                  ...data, 
                  sector: sectorSeleccionado 
                } 
              : b
          )
        );
      } else {
        // Crear nuevo barrio
        // Aquí iría la petición a la API para crear
        // const response = await fetch('/api/barrios', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        // const nuevoBarrio = await response.json();
        
        // Simulamos la creación con un ID nuevo
        const nuevoBarrio: Barrio = {
          id: Math.max(0, ...barrios.map(b => b.id)) + 1,
          ...data,
          sector: sectorSeleccionado
        };
        
        // Actualizamos el estado local
        setBarrios(prevBarrios => [...prevBarrios, nuevoBarrio]);
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err) {
      setError('Error al guardar el barrio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [barrios, barrioSeleccionado, modoEdicion, limpiarSeleccion, sectores]);

  // Eliminar un barrio
  const eliminarBarrio = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API para eliminar
      // await fetch(`/api/barrios/${id}`, {
      //   method: 'DELETE',
      // });
      
      // Actualizamos el estado local
      setBarrios(prevBarrios => prevBarrios.filter(b => b.id !== id));
      
      // Si el barrio eliminado estaba seleccionado, limpiamos la selección
      if (barrioSeleccionado?.id === id) {
        limpiarSeleccion();
      }
    } catch (err) {
      setError('Error al eliminar el barrio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [barrioSeleccionado, limpiarSeleccion]);

  return {
    barrios,
    sectores,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarBarrios,
    cargarSectores,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    setModoEdicion,
  };
};