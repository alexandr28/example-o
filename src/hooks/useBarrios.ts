// src/hooks/useBarrios.ts
import { useState, useCallback, useEffect } from 'react';
import { Barrio, BarrioFormData, Sector } from '../models/';
import { BarrioService } from '../services/barrioService';
import { connectivityService } from '../services/connectivityService';

/**
 * Hook personalizado para la gestión de barrios
 * Versión modificada para no usar token
 */
export const useBarrios = () => {
  // Estados
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<Barrio | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cargar barrios desde la API
  const cargarBarrios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición a la API sin autenticación
      try {
        const barrios = await BarrioService.getAll();
        setBarrios(barrios);
        
        // Actualizar caché local
        localStorage.setItem('cachedBarrios', JSON.stringify(barrios));
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Error al cargar los barrios');
        console.error('Error en cargarBarrios:', error);
        
        // Modo fallback: Si hay un error de red, usar datos de caché local si existen
        const cachedBarrios = localStorage.getItem('cachedBarrios');
        if (cachedBarrios) {
          try {
            setBarrios(JSON.parse(cachedBarrios));
          } catch (cacheErr) {
            console.error('Error al cargar barrios desde caché:', cacheErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar sectores desde la API
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición a la API sin autenticación
      try {
        // Usar fetch directamente porque estamos modificando los servicios para no usar autenticación
        const response = await fetch('/api/sector');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setSectores(data);
        
        // Actualizar caché local
        localStorage.setItem('cachedSectores', JSON.stringify(data));
        } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Error al cargar los sectores');
        console.error('Error en cargarSectores:', error);
        
        // Modo fallback: Si hay un error de red, usar datos de caché local si existen
        const cachedSectores = localStorage.getItem('cachedSectores');
        if (cachedSectores) {
          try {
            setSectores(JSON.parse(cachedSectores));
          } catch (cacheErr) {
            console.error('Error al cargar sectores desde caché:', cacheErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    cargarSectores();
    cargarBarrios();
  }, [cargarSectores, cargarBarrios]);

  // Efecto para guardar en caché local los datos cargados
  useEffect(() => {
    if (barrios.length > 0) {
      localStorage.setItem('cachedBarrios', JSON.stringify(barrios));
    }
  }, [barrios]);

  useEffect(() => {
    if (sectores.length > 0) {
      localStorage.setItem('cachedSectores', JSON.stringify(sectores));
    }
  }, [sectores]);

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

  // Manejar cambio en el término de búsqueda
  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  // Filtrar barrios por término de búsqueda (búsqueda local)
  const filtrarBarriosLocalmente = useCallback(() => {
    if (!searchTerm.trim()) return barrios;
    
    return barrios.filter(barrio => 
      barrio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (barrio.sector?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  }, [barrios, searchTerm]);

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
      
      // Preparamos los datos para enviar a la API
      const barrioData = {
        ...data,
        sectorId: parseInt(data.sectorId.toString()) // Aseguramos que sectorId sea un número
      };
      
      let nuevoBarrio: Barrio;
      
      if (modoEdicion && barrioSeleccionado) {
        // Actualizar barrio existente mediante el servicio
        try {
          nuevoBarrio = await BarrioService.update(barrioSeleccionado.id, barrioData);
          
          // Actualizamos el estado local con los datos devueltos por la API
          setBarrios(prevBarrios => 
            prevBarrios.map(b => 
              b.id === barrioSeleccionado.id 
                ? { ...nuevoBarrio, sector: sectorSeleccionado } 
                : b
            )
          );
        } catch (updateError) {
          console.error('Error al actualizar barrio:', updateError);
          throw new Error('Error al actualizar el barrio');
        }
      } else {
        // Crear nuevo barrio mediante el servicio
        try {
          nuevoBarrio = await BarrioService.create(barrioData);
          
          // Añadimos el nuevo barrio al estado local con los datos devueltos por la API
          setBarrios(prevBarrios => [
            ...prevBarrios, 
            { ...nuevoBarrio, sector: sectorSeleccionado }
          ]);
        } catch (createError) {
          console.error('Error al crear barrio:', createError);
          throw new Error('Error al crear el barrio');
        }
      }
      
      // Actualizar caché local
      await cargarBarrios();
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al guardar el barrio');
      console.error('Error en guardarBarrio:', error);
    } finally {
      setLoading(false);
    }
  }, [barrios, barrioSeleccionado, modoEdicion, limpiarSeleccion, sectores, cargarBarrios]);

  // Eliminar un barrio
  const eliminarBarrio = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición DELETE a la API
      try {
        await BarrioService.delete(id);
        
        // Actualizamos el estado local removiendo el barrio eliminado
        setBarrios(prevBarrios => prevBarrios.filter(b => b.id !== id));
        
        // Actualizar caché local
        await cargarBarrios();
        
        // Si el barrio eliminado estaba seleccionado, limpiamos la selección
        if (barrioSeleccionado?.id === id) {
          limpiarSeleccion();
        }
      } catch (deleteError) {
        console.error('Error al eliminar barrio:', deleteError);
        throw new Error('Error al eliminar el barrio');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al eliminar el barrio');
      console.error('Error en eliminarBarrio:', error);
    } finally {
      setLoading(false);
    }
  }, [barrioSeleccionado, limpiarSeleccion, cargarBarrios]);

  // Obtener barrio por ID
  const obtenerBarrioPorId = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición GET a la API para obtener un barrio específico
      try {
        const barrio = await BarrioService.getById(id);
        
        // Buscar el sector correspondiente para incluirlo en el objeto barrio
        const sector = sectores.find(s => s.id === barrio.sectorId);
        
        // Retornar el barrio con su sector asociado
        return {
          ...barrio,
          sector
        };
      } catch (getError) {
        console.error('Error al obtener barrio por ID:', getError);
        
        // Si hay un error, buscar en el estado local
        return barrios.find(b => b.id === id) || null;
      }
    } finally {
      setLoading(false);
    }
  }, [barrios, sectores]);

  // Búsqueda de barrios
  const buscarBarrios = useCallback(async () => {
    try {
      if (!searchTerm.trim()) {
        await cargarBarrios();
        return barrios;
      }
      
      setLoading(true);
      setError(null);
      
      // Petición GET a la API con parámetro de búsqueda
      try {
        const resultados = await BarrioService.search(searchTerm);
        
        // Actualizar el estado con los resultados de la búsqueda
        setBarrios(resultados);
        return resultados;
      } catch (searchError) {
        console.error('Error al buscar barrios:', searchError);
        
        // Si hay error, realizar búsqueda local
        return filtrarBarriosLocalmente();
      }
    } finally {
      setLoading(false);
    }
  }, [barrios, searchTerm, cargarBarrios, filtrarBarriosLocalmente]);

  return {
    barrios,
    sectores,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    searchTerm,
    cargarBarrios,
    cargarSectores,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    obtenerBarrioPorId,
    buscarBarrios,
    handleSearchTermChange,
    filtrarBarriosLocalmente,
    setModoEdicion,
  };
};