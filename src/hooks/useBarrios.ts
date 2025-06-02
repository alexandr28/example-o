// src/hooks/useBarrios.ts - CORREGIDO PARA MANEJAR SECTOR NULL
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Barrio, BarrioFormData, getBarrioDisplayName, isBarrioValid, DEFAULT_SECTOR_ID } from '../models/Barrio';
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
      // 🔥 VALIDACIÓN MÁS PERMISIVA
      console.log('🔍 [useBarrios] Validando datos:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ [useBarrios] Los datos no son un array');
        return false;
      }
      
      if (data.length === 0) {
        console.warn('⚠️ [useBarrios] Array vacío');
        return false;
      }
      
      // Contar barrios válidos
      const barriosValidos = data.filter(barrio => isBarrioValid(barrio));
      const porcentajeValidos = (barriosValidos.length / data.length) * 100;
      
      console.log(`📊 [useBarrios] ${barriosValidos.length}/${data.length} barrios válidos (${porcentajeValidos.toFixed(1)}%)`);
      
      // Aceptar si al menos el 50% son válidos (más permisivo)
      return porcentajeValidos >= 50;
    }
  });

  // Cargar sectores con mejor manejo de errores
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      console.log('🔄 [useBarrios] Cargando sectores...');
      
      const data = await SectorService.getAll();
      
      // 🔥 ASEGURAR QUE EXISTE UN SECTOR POR DEFECTO
      const sectorDefault = { id: DEFAULT_SECTOR_ID, nombre: 'Sin Sector Asignado' };
      const tieneDefault = data.some(s => s.id === DEFAULT_SECTOR_ID);
      
      if (!tieneDefault) {
        console.log('➕ [useBarrios] Agregando sector por defecto');
        data.unshift(sectorDefault);
      }
      
      setSectores(data);
      
      // Guardar en caché
      localStorage.setItem('sectores_cache', JSON.stringify(data));
      console.log(`✅ [useBarrios] ${data.length} sectores cargados (incluye sector default)`);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al cargar sectores:', error);
      
      // Intentar cargar desde caché
      const cached = localStorage.getItem('sectores_cache');
      if (cached) {
        const cachedSectores = JSON.parse(cached);
        setSectores(cachedSectores);
        console.log('📦 [useBarrios] Sectores cargados desde caché');
      } else {
        // Si no hay caché, crear al menos el sector por defecto
        const sectorDefault = { id: DEFAULT_SECTOR_ID, nombre: 'Sin Sector Asignado' };
        setSectores([sectorDefault]);
        console.log('🆘 [useBarrios] Usando solo sector por defecto');
      }
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Obtener nombre del sector con mejor manejo
  const obtenerNombreSector = useCallback((sectorId: number): string => {
    if (!sectorId || sectorId === 0) {
      return 'Sin Sector';
    }
    
    const sector = sectores.find(s => s.id === sectorId);
    return sector?.nombre || `Sector ID: ${sectorId}`;
  }, [sectores]);

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log('🔄 [useBarrios] Carga inicial de datos');
      
      // Cargar sectores primero, luego barrios
      cargarSectores().then(() => {
        return cargarBarrios();
      }).catch(error => {
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
      await cargarSectores();
      await cargarBarrios();
      
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
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
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
          console.log('🧪 [useBarrios] Test data parsed - count:', Array.isArray(json) ? json.length : 'no array');
          
          // Verificar si tenemos datos válidos
          if (Array.isArray(json) && json.length > 0) {
            // Contar elementos con datos válidos
            const validItems = json.filter(item => 
              item && 
              typeof item === 'object' && 
              (item.nombreBarrio || item.nombre)
            );
            
            console.log('🧪 [useBarrios] Items válidos encontrados:', validItems.length);
            return validItems.length > 0;
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
    barrioSeleccionado: barrioSeleccionado ? getBarrioDisplayName(barrioSeleccionado) : 'Ninguno',
    modoEdicion,
    isOfflineMode,
    ultimaSync: lastSyncTime?.toLocaleTimeString() || 'Nunca',
    error,
    searchTerm,
    barriosConSectorNull: barrios.filter(b => !b.sector).length,
    barriosConSectorValido: barrios.filter(b => b.sectorId > 0).length
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