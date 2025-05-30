// src/hooks/useSectores.ts
import { useCallback, useEffect, useRef } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Sector, SectorFormData } from '../models/Sector';
import SectorService from '../services/sectorService';

export const useSectores = () => {
  const isInitialized = useRef(false);
  
  const {
    items: sectores,
    selectedItem: sectorSeleccionado,
    isEditMode: modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    loadItems: cargarSectores,
    searchItems: buscarSectores,
    selectItem: seleccionarSector,
    clearSelection: limpiarSeleccion,
    saveItem: guardarSector,
    deleteItem: eliminarSector,
    setIsEditMode: setModoEdicion,
    refreshItems: sincronizarManualmente,
    setError
  } = useCrudEntity<Sector, SectorFormData>({
    entityName: 'Sectores',
    service: SectorService,
    cacheKey: 'sectores_cache',
    getItemId: (sector) => sector.id,
    validateData: (data) => {
      // Validar que tengamos sectores con nombres reales
      return Array.isArray(data) && data.length > 0 && data.some(sector => 
        sector.nombre && 
        !sector.nombre.match(/^Sector \d+$/) &&
        sector.nombre.trim().length > 0
      );
    }
  });

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log('🔄 [useSectores] Carga inicial de datos');
      cargarSectores();
    }
  }, []);

  // Funciones adicionales específicas de sectores
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useSectores] Forzando modo online...');
    try {
      // Limpiar caché
      localStorage.removeItem('sectores_cache');
      // Recargar datos
      await cargarSectores();
      console.log('✅ [useSectores] Modo online forzado exitosamente');
    } catch (error: any) {
      console.error('❌ [useSectores] Error al forzar modo online:', error);
      setError('Error al forzar conexión: ' + error.message);
      throw error;
    }
  }, [cargarSectores, setError]);

  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useSectores] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://192.168.20.160:8080/api/sector', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('🧪 [useSectores] Test response:', response.status, response.statusText);
      
      if (response.ok) {
        const text = await response.text();
        console.log('🧪 [useSectores] Test content preview:', text.substring(0, 200));
        
        try {
          const json = JSON.parse(text);
          console.log('🧪 [useSectores] Test data parsed:', json);
          
          // Verificar si los datos son válidos y reales
          if (Array.isArray(json) && json.length > 0) {
            const hayDatosReales = json.some(item => 
              item && 
              typeof item === 'object' && 
              item.nombre && 
              typeof item.nombre === 'string' &&
              item.nombre.trim().length > 0 &&
              !item.nombre.match(/^Sector \d+$/)
            );
            
            console.log('🧪 [useSectores] ¿API tiene datos reales?:', hayDatosReales);
            return hayDatosReales;
          }
          
          return false;
        } catch (e) {
          console.log('🧪 [useSectores] Test data no es JSON válido');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('🧪 [useSectores] Error en test de conexión:', error);
      return false;
    }
  }, []);

  // Información de debug para desarrollo
  const debugInfo = process.env.NODE_ENV === 'development' ? {
    totalSectores: sectores.length,
    sectorSeleccionado: sectorSeleccionado?.nombre || 'Ninguno',
    modoEdicion,
    isOfflineMode,
    ultimaSync: lastSyncTime?.toLocaleTimeString() || 'Nunca',
    error,
    searchTerm
  } : null;

  return {
    // Estados del hook genérico
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    hasPendingChanges: false, // Por ahora no implementado
    pendingChangesCount: 0,   // Por ahora no implementado
    
    // Funciones del hook genérico
    cargarSectores,
    buscarSectores: (term: string) => buscarSectores(term), // Wrapper para mantener compatibilidad
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente,
    
    // Funciones adicionales específicas
    forzarModoOnline,
    testApiConnection,
    
    // Debug info
    debugInfo
  };
};