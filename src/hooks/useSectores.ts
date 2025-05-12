import { useState, useCallback } from 'react';
import { Sector, SectorFormData } from '../models/Sector';

// Datos de ejemplo para pruebas
const sectoresIniciales: Sector[] = [
  { id: 1, nombre: 'SECTOR JERUSALÉN' },
  { id: 2, nombre: 'URB. MANUEL ARÉVALO II' },
  { id: 3, nombre: 'PARQUE INDUSTRIAL' },
];

/**
 * Hook personalizado para la gestión de sectores
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar sectores
 */
export const useSectores = () => {
  // Estados
  const [sectores, setSectores] = useState<Sector[]>(sectoresIniciales);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Seleccionar un sector para editar
  const seleccionarSector = useCallback((sector: Sector) => {
    setSectorSeleccionado(sector);
    setModoEdicion(true);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setSectorSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Guardar un sector (crear o actualizar)
  const guardarSector = useCallback(async (data: SectorFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (modoEdicion && sectorSeleccionado) {
        // Actualizar sector existente
        // Aquí iría la petición a la API para actualizar
        // await fetch(`/api/sectores/${sectorSeleccionado.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        
        // Actualizamos el estado local
        setSectores(prevSectores => 
          prevSectores.map(s => 
            s.id === sectorSeleccionado.id 
              ? { ...s, ...data } 
              : s
          )
        );
      } else {
        // Crear nuevo sector
        // Aquí iría la petición a la API para crear
        // const response = await fetch('/api/sectores', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        // const nuevoSector = await response.json();
        
        // Simulamos la creación con un ID nuevo
        const nuevoSector: Sector = {
          id: Math.max(0, ...sectores.map(s => s.id)) + 1,
          ...data,
        };
        
        // Actualizamos el estado local
        setSectores(prevSectores => [...prevSectores, nuevoSector]);
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err) {
      setError('Error al guardar el sector');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sectores, sectorSeleccionado, modoEdicion, limpiarSeleccion]);

  // Eliminar un sector
  const eliminarSector = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí iría la petición a la API para eliminar
      // await fetch(`/api/sectores/${id}`, {
      //   method: 'DELETE',
      // });
      
      // Actualizamos el estado local
      setSectores(prevSectores => prevSectores.filter(s => s.id !== id));
      
      // Si el sector eliminado estaba seleccionado, limpiamos la selección
      if (sectorSeleccionado?.id === id) {
        limpiarSeleccion();
      }
    } catch (err) {
      setError('Error al eliminar el sector');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sectorSeleccionado, limpiarSeleccion]);

  return {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
  };
};