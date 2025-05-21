// src/hooks/useBarrios.ts
import { useState, useCallback, useEffect } from 'react';
import { Barrio, BarrioFormData, Sector } from '../models/';
import { BarrioService } from '../services/barrioService';
import { SectorService } from '../services/sectorService';

/**
 * Hook personalizado para la gestión de barrios
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
      
      try {
        console.log('Cargando barrios desde la API...');
        const data = await BarrioService.getAll();
        setBarrios(data);
        
        // Actualizar caché local para uso offline
        localStorage.setItem('cachedBarrios', JSON.stringify(data));
        console.log(`${data.length} barrios cargados correctamente`);
      } catch (err: any) {
        console.error('Error al cargar barrios desde API:', err);
        setError(err.message || 'Error al cargar los barrios');
        
        // Modo fallback: Si hay error de red, usar datos de caché local si existen
        const cachedBarrios = localStorage.getItem('cachedBarrios');
        if (cachedBarrios) {
          console.log('Utilizando datos de caché local');
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
      
      try {
        console.log('Cargando sectores desde la API...');
        const data = await SectorService.getAll();
        setSectores(data);
        
        // Actualizar caché local
        localStorage.setItem('cachedSectores', JSON.stringify(data));
        console.log(`${data.length} sectores cargados correctamente`);
      } catch (err: any) {
        console.error('Error al cargar sectores desde API:', err);
        
        // Modo fallback: Si hay error de red, usar datos de caché local si existen
        const cachedSectores = localStorage.getItem('cachedSectores');
        if (cachedSectores) {
          console.log('Utilizando datos de caché local para sectores');
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
      
      // Preparamos los datos para enviar a la API
      const barrioData = {
        ...data,
        sectorId: parseInt(data.sectorId.toString()) // Aseguramos que sectorId sea un número
      };
      
      let nuevoBarrio: Barrio;
      
      if (modoEdicion && barrioSeleccionado) {
        // Actualizar barrio existente mediante el servicio
        console.log(`Actualizando barrio ID ${barrioSeleccionado.id}:`, barrioData);
        nuevoBarrio = await BarrioService.update(barrioSeleccionado.id, barrioData);
        
        // Encontrar el sector correspondiente
        const sectorSeleccionado = sectores.find(s => s.id === parseInt(data.sectorId.toString()));
        
        // Actualizamos el estado local con los datos devueltos por la API
        setBarrios(prevBarrios => 
          prevBarrios.map(b => 
            b.id === barrioSeleccionado.id 
              ? { ...nuevoBarrio, sector: sectorSeleccionado } 
              : b
          )
        );
        
        console.log('Barrio actualizado correctamente:', nuevoBarrio);
      } else {
        // Crear nuevo barrio mediante el servicio
        console.log('Creando nuevo barrio:', barrioData);
        nuevoBarrio = await BarrioService.create(barrioData);
        
        // Encontrar el sector correspondiente
        const sectorSeleccionado = sectores.find(s => s.id === parseInt(data.sectorId.toString()));
        
        // Añadimos el nuevo barrio al estado local con los datos devueltos por la API
        setBarrios(prevBarrios => [
          ...prevBarrios, 
          { ...nuevoBarrio, sector: sectorSeleccionado }
        ]);
        
        console.log('Barrio creado correctamente:', nuevoBarrio);
      }
      
      // Limpiar selección
      limpiarSeleccion();
      
      // Actualizar caché local
      setTimeout(() => cargarBarrios(), 300);
      
      return nuevoBarrio;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al guardar el barrio';
      setError(errorMsg);
      console.error('Error en guardarBarrio:', err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [barrios, barrioSeleccionado, modoEdicion, limpiarSeleccion, sectores, cargarBarrios]);

  // Eliminar un barrio
  const eliminarBarrio = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Eliminando barrio ID ${id}...`);
      await BarrioService.delete(id);
      
      // Actualizar el estado local
      setBarrios(prev => prev.filter(b => b.id !== id));
      console.log('Barrio eliminado correctamente');
      
      // Si el barrio eliminado estaba seleccionado, limpiar selección
      if (barrioSeleccionado?.id === id) {
        limpiarSeleccion();
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el barrio');
      console.error('Error al eliminar barrio:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [barrioSeleccionado, limpiarSeleccion]);

  // Buscar barrios
  const buscarBarrios = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    try {
      setLoading(true);
      setError(null);
      
      if (!term.trim()) {
        await cargarBarrios();
        return;
      }
      
      console.log(`Buscando barrios con término "${term}"...`);
      
      try {
        const resultados = await BarrioService.search(term);
        setBarrios(resultados);
        console.log(`${resultados.length} barrios encontrados`);
      } catch (searchError) {
        console.error('Error al buscar barrios:', searchError);
        
        // Si hay error, realizar búsqueda local en los barrios ya cargados
        const termLower = term.toLowerCase();
        const barriosFiltrados = barrios.filter(barrio => 
          barrio.nombre.toLowerCase().includes(termLower) ||
          (barrio.sector?.nombre && barrio.sector.nombre.toLowerCase().includes(termLower))
        );
        
        console.log(`${barriosFiltrados.length} barrios encontrados localmente`);
        setBarrios(barriosFiltrados);
      }
    } finally {
      setLoading(false);
    }
  }, [barrios, cargarBarrios]);

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
    buscarBarrios,
    setModoEdicion,
  };
};