// src/hooks/useBarrios.ts
import { useCallback, useEffect, useRef } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Barrio, BarrioFormData } from '../models/Barrio';
import BarrioService from '../services/barrioService';

export const useBarrios = () => {
  const isInitialized = useRef(false);
  
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

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      console.log('🔄 [useBarrios] Carga inicial de datos');
      cargarBarrios();
    }
  }, []);

  // Funciones adicionales específicas de barrios
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useBarrios] Forzando modo online...');
    try {
      // Limpiar caché
      localStorage.removeItem('barrios_cache');
      // Recargar datos
      await cargarBarrios();
      console.log('✅ [useBarrios] Modo online forzado exitosamente');
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al forzar modo online:', error);
      setError('Error al forzar conexión: ' + error.message);
      throw error;
    }
  }, [cargarBarrios, setError]);

  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useBarrios] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://192.168.20.160:8080/api/barrio', {
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
              item.nombre && 
              typeof item.nombre === 'string' &&
              item.nombre.trim().length > 0 &&
              !item.nombre.match(/^Barrio \d+$/)
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
    hasPendingChanges: false, // Por ahora no implementado
    pendingChangesCount: 0,   // Por ahora no implementado
    
    // Funciones del hook genérico
    cargarBarrios,
    buscarBarrios: (term: string) => buscarBarrios(term), // Wrapper para mantener compatibilidad
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    setModoEdicion,
    sincronizarManualmente,
    
    // Funciones adicionales específicas
    forzarModoOnline,
    testApiConnection,
    
    // Debug info
    debugInfo
  };
};