// src/hooks/useBarrios.ts - versión corregida para debugging

import { useState, useCallback, useEffect } from 'react';
import { Barrio, BarrioFormData, Sector } from '../models/';
import { BarrioService } from '../services/barrioService';
import { SectorService } from '../services/sectorService';

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
      
      console.log('🔄 Iniciando carga de barrios...');
      
      try {
        const data = await BarrioService.getAll();
        console.log('✅ Datos de barrios recibidos:', data);
        console.log('📊 Estructura del primer barrio:', data[0]);
        console.log('🔢 Cantidad de barrios:', data.length);
        
        // Verificar si los datos tienen la estructura correcta
        if (Array.isArray(data)) {
          setBarrios(data);
          localStorage.setItem('cachedBarrios', JSON.stringify(data));
          console.log(`✅ ${data.length} barrios establecidos en el estado`);
        } else {
          console.error('❌ Los datos no son un array:', data);
          setError('Los datos recibidos no tienen el formato esperado');
        }
        
      } catch (err: any) {
        console.error('❌ Error al cargar barrios desde API:', err);
        setError(err.message || 'Error al cargar los barrios');
        
        // Modo fallback: usar datos de caché local si existen
        const cachedBarrios = localStorage.getItem('cachedBarrios');
        if (cachedBarrios) {
          console.log('🔄 Utilizando datos de caché local');
          try {
            const parsedBarrios = JSON.parse(cachedBarrios);
            setBarrios(parsedBarrios);
            console.log('✅ Barrios cargados desde caché:', parsedBarrios.length);
          } catch (cacheErr) {
            console.error('❌ Error al cargar barrios desde caché:', cacheErr);
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
      
      console.log('🔄 Iniciando carga de sectores...');
      
      try {
        const data = await SectorService.getAll();
        console.log('✅ Datos de sectores recibidos:', data);
        console.log('🔢 Cantidad de sectores:', data.length);
        
        if (Array.isArray(data)) {
          setSectores(data);
          localStorage.setItem('cachedSectores', JSON.stringify(data));
          console.log(`✅ ${data.length} sectores establecidos en el estado`);
        } else {
          console.error('❌ Los datos de sectores no son un array:', data);
        }
        
      } catch (err: any) {
        console.error('❌ Error al cargar sectores desde API:', err);
        
        // Modo fallback
        const cachedSectores = localStorage.getItem('cachedSectores');
        if (cachedSectores) {
          console.log('🔄 Utilizando sectores desde caché local');
          try {
            const parsedSectores = JSON.parse(cachedSectores);
            setSectores(parsedSectores);
            console.log('✅ Sectores cargados desde caché:', parsedSectores.length);
          } catch (cacheErr) {
            console.error('❌ Error al cargar sectores desde caché:', cacheErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ... resto de funciones sin cambios ...

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
    seleccionarBarrio: setBarrioSeleccionado,
    limpiarSeleccion: () => {
      setBarrioSeleccionado(null);
      setModoEdicion(false);
    },
    guardarBarrio: async (data: BarrioFormData) => {
      // ... implementación existente ...
    },
    eliminarBarrio: async (id: number) => {
      // ... implementación existente ...
    },
    buscarBarrios: async (term: string) => {
      // ... implementación existente ...
    },
    setModoEdicion,
  };
};