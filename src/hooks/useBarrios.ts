// src/hooks/useBarrios.ts - CORREGIDO CON SECTORES
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Barrio, BarrioFormData } from '../models/Barrio';
import { Sector } from '../models/Sector';
import BarrioService from '../services/barrioService';
import SectorService from '../services/sectorService';

export const useBarrios = () => {
  const isInitialized = useRef(false);
  
  // Estados adicionales para sectores
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loadingSectores, setLoadingSectores] = useState(false);
  
  const {
    items: barrios,
    selectedItem: barrioSeleccionado,
    isEditMode: modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    loadItems: cargarBarrios,
    searchItems: buscarBarrios,
    selectItem: seleccionarBarrio,
    clearSelection: limpiarSeleccion,
    saveItem: guardarBarrio,
    deleteItem: eliminarBarrio,
    setIsEditMode: setModoEdicion,
    refreshItems: sincronizarManualmente,
    setError
  } = useCrudEntity<Barrio, BarrioFormData>({
    entityName: 'Barrios',
    service: BarrioService,
    cacheKey: 'barrios_cache',
    getItemId: (barrio) => barrio.id,
    validateData: (data) => {
      // Validar que tengamos barrios con nombres reales
      return Array.isArray(data) && data.length > 0 && data.some(barrio => 
        barrio.nombre && 
        !barrio.nombre.match(/^Barrio \d+$/) &&
        barrio.nombre.trim().length > 0
      );
    }
  });

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      console.log('🔄 [useBarrios] Cargando sectores...');
      
      const data = await SectorService.getAll();
      setSectores(data);
      
      // Guardar en caché
      localStorage.setItem('sectores_cache', JSON.stringify(data));
      console.log(`✅ [useBarrios] ${data.length} sectores cargados`);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al cargar sectores:', error);
      
      // Intentar cargar desde caché
      const cached = localStorage.getItem('sectores_cache');
      if (cached) {
        setSectores(JSON.parse(cached));
        console.log('📦 [useBarrios] Sectores cargados desde caché');
      }
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Obtener nombre del sector
  const obtenerNombreSector = useCallback((sectorId: number): string => {
    const sector = sectores.find(s => s.id === sectorId);
    return sector?.nombre || `Sector ID: ${sectorId}`;
  }, [sectores]);

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log('🔄 [useBarrios] Carga inicial de datos');
      
      // Cargar sectores y barrios en paralelo
      Promise.all([
        cargarSectores(),
        cargarBarrios()
      ]).catch(error => {
        console.error('❌ [useBarrios] Error en carga inicial:', error);
      });
    }
  }, [cargarSectores, cargarBarrios]);

  // Funciones adicionales específicas de barrios
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useBarrios] Forzando modo online...');
    try {
      // Limpiar caché
      localStorage.removeItem('barrios_cache');
      localStorage.removeItem('sectores_cache');
      
      // Recargar datos
      await Promise.all([
        cargarSectores(),
        cargarBarrios()
      ]);
      
      console.log('✅ [useBarrios] Modo online forzado exitosamente');
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al forzar modo online:', error);
      setError('Error al forzar conexión: ' + error.message);
      throw error;
    }
  }, [cargarBarrios, cargarSectores, setError]);

  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useBarrios] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Probar endpoint de barrios
      const response = await fetch('/api/barrio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('🧪 [useBarrios] Test response:', response.status, response.statusText);
      
      if (response.ok) {
        const text = await response.text();
        console.log('🧪 [useBarrios] Test content preview:', text.substring(0, 200));
        
        try {
          const json = JSON.parse(text);
          console.log('🧪 [useBarrios] Test data parsed:', json);
          
          // Verificar si los datos son válidos y reales
          if (Array.isArray(json) && json.length > 0) {
            const hayDatosReales = json.some(item => 
              item && 
              typeof item === 'object' && 
              (item.nombre || item.nombreBarrio) && 
              typeof (item.nombre || item.nombreBarrio) === 'string' &&
              (item.nombre || item.nombreBarrio).trim().length > 0 &&
              !(item.nombre || item.nombreBarrio).match(/^Barrio \d+$/)
            );
            
            console.log('🧪 [useBarrios] ¿API tiene datos reales?:', hayDatosReales);
            return hayDatosReales;
          }
          
          return false;
        } catch (e) {
          console.log('🧪 [useBarrios] Test data no es JSON válido');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('🧪 [useBarrios] Error en test de conexión:', error);
      return false;
    }
  }, []);

  // Información de debug para desarrollo
  const debugInfo = process.env.NODE_ENV === 'development' ? {
    totalBarrios: barrios.length,
    totalSectores: sectores.length,
    barrioSeleccionado: barrioSeleccionado?.nombre || 'Ninguno',
    modoEdicion,
    isOfflineMode,
    ultimaSync: lastSyncTime?.toLocaleTimeString() || 'Nunca',
    error,
    searchTerm
  } : null;

  return {
    // Estados del hook genérico
    barrios,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Estados adicionales
    sectores,
    loadingSectores,
    
    // Funciones del hook genérico
    cargarBarrios,
    buscarBarrios: (term: string) => buscarBarrios(term),
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    setModoEdicion,
    sincronizarManualmente,
    
    // Funciones adicionales específicas
    cargarSectores,
    forzarModoOnline,
    testApiConnection,
    obtenerNombreSector,
    
    // Debug info
    debugInfo
  };
};