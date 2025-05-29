// src/hooks/useCalles.ts - REFACTORIZADO
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Calle, CalleFormData, TipoViaOption, TIPO_VIA_OPTIONS } from '../models/Calle';
import { Sector, Barrio } from '../models/';
import CalleService from '../services/calleApiService';
import SectorService from '../services/sectorService';
import BarrioService from '../services/barrioService';

export const useCalles = () => {
  // Hook genérico para operaciones CRUD de calles
  const {
    items: calles,
    selectedItem: calleSeleccionada,
    isEditMode: modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    loadItems: cargarCalles,
    searchItems: buscarCalles,
    selectItem: seleccionarCalle,
    clearSelection: limpiarSeleccion,
    saveItem: guardarCalle,
    deleteItem: eliminarCalle,
    setIsEditMode: setModoEdicion,
    refreshItems: sincronizarManualmente,
    setError
  } = useCrudEntity<Calle, CalleFormData>({
    entityName: 'Calles',
    service: CalleService,
    cacheKey: 'calles_cache',
    getItemId: (calle) => calle.id,
    validateData: (data) => {
      // Validar que tengamos calles con datos reales
      return data.some(calle => 
        calle.nombre && 
        !calle.nombre.includes('sin nombre') &&
        calle.nombre.trim().length > 0
      );
    }
  });

  // Estados adicionales
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState<Barrio[]>([]);
  const [tiposVia, setTiposVia] = useState<TipoViaOption[]>(TIPO_VIA_OPTIONS);
  const [loadingSectores, setLoadingSectores] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);
  const [loadingTiposVia, setLoadingTiposVia] = useState(false);

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      console.log('🔄 [useCalles] Cargando sectores...');
      
      const data = await SectorService.getAll();
      setSectores(data);
      
      // Guardar en caché
      localStorage.setItem('sectores_cache', JSON.stringify(data));
      console.log(`✅ [useCalles] ${data.length} sectores cargados`);
      
    } catch (error: any) {
      console.error('❌ [useCalles] Error al cargar sectores:', error);
      
      // Intentar cargar desde caché
      const cached = localStorage.getItem('sectores_cache');
      if (cached) {
        setSectores(JSON.parse(cached));
        console.log('📦 [useCalles] Sectores cargados desde caché');
      }
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Cargar barrios
  const cargarBarrios = useCallback(async () => {
    try {
      setLoadingBarrios(true);
      console.log('🔄 [useCalles] Cargando barrios...');
      
      const data = await BarrioService.getAll();
      setBarrios(data);
      
      // Guardar en caché
      localStorage.setItem('barrios_cache', JSON.stringify(data));
      console.log(`✅ [useCalles] ${data.length} barrios cargados`);
      
    } catch (error: any) {
      console.error('❌ [useCalles] Error al cargar barrios:', error);
      
      // Intentar cargar desde caché
      const cached = localStorage.getItem('barrios_cache');
      if (cached) {
        setBarrios(JSON.parse(cached));
        console.log('📦 [useCalles] Barrios cargados desde caché');
      }
    } finally {
      setLoadingBarrios(false);
    }
  }, []);

  // Cargar tipos de vía
  const cargarTiposVia = useCallback(async () => {
    try {
      setLoadingTiposVia(true);
      console.log('🎨 [useCalles] Cargando tipos de vía...');
      
      const tiposFromApi = await CalleService.getTiposVia();
      
      if (tiposFromApi && Array.isArray(tiposFromApi) && tiposFromApi.length > 0) {
        setTiposVia(tiposFromApi);
        
        // Guardar en caché
        localStorage.setItem('tipos_via_cache', JSON.stringify({
          tipos: tiposFromApi,
          timestamp: new Date().toISOString()
        }));
        
        console.log('✅ [useCalles] Tipos de vía cargados:', tiposFromApi.length);
      }
      
    } catch (error: any) {
      console.error('❌ [useCalles] Error al cargar tipos de vía:', error);
      
      // Usar tipos predefinidos como fallback
      setTiposVia(TIPO_VIA_OPTIONS);
    } finally {
      setLoadingTiposVia(false);
    }
  }, []);

  // Filtrar barrios por sector
  const filtrarBarriosPorSector = useCallback((sectorId: number) => {
    console.log('🔍 [useCalles] Filtrando barrios para sector:', sectorId);
    
    if (!sectorId || sectorId === 0) {
      setBarriosFiltrados([]);
      return;
    }
    
    const filtrados = barrios.filter(barrio => barrio.sectorId === sectorId);
    setBarriosFiltrados(filtrados);
    
    console.log(`✅ [useCalles] ${filtrados.length} barrios filtrados para sector ${sectorId}`);
  }, [barrios]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      // Cargar en paralelo para mejor performance
      await Promise.all([
        cargarCalles(),
        cargarSectores(),
        cargarBarrios(),
        cargarTiposVia()
      ]);
    };
    
    cargarDatosIniciales();
  }, [cargarCalles, cargarSectores, cargarBarrios, cargarTiposVia]);

  // Funciones adicionales específicas
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useCalles] Forzando modo online...');
    try {
      // Limpiar caché
      localStorage.removeItem('calles_cache');
      localStorage.removeItem('sectores_cache');
      localStorage.removeItem('barrios_cache');
      localStorage.removeItem('tipos_via_cache');
      
      // Recargar datos
      await Promise.all([
        cargarCalles(),
        cargarSectores(),
        cargarBarrios(),
        cargarTiposVia()
      ]);
      
      console.log('✅ [useCalles] Modo online forzado exitosamente');
    } catch (error: any) {
      console.error('❌ [useCalles] Error al forzar modo online:', error);
      setError('Error al forzar conexión: ' + error.message);
      throw error;
    }
  }, [cargarCalles, cargarSectores, cargarBarrios, cargarTiposVia, setError]);

  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useCalles] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://192.168.20.160:8080/api/via', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('🧪 [useCalles] Test response:', response.status, response.statusText);
      
      if (response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          
          if (Array.isArray(json) && json.length > 0) {
            const hayDatosReales = json.some(item => 
              item && 
              typeof item === 'object' && 
              (item.nombre || item.nombreVia) && 
              typeof (item.nombre || item.nombreVia) === 'string'
            );
            
            console.log('🧪 [useCalles] ¿API tiene datos reales?:', hayDatosReales);
            return hayDatosReales;
          }
          
          return false;
        } catch (e) {
          console.log('🧪 [useCalles] Test data no es JSON válido');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('🧪 [useCalles] Error en test de conexión:', error);
      return false;
    }
  }, []);

  // Obtener nombres
  const obtenerNombreSector = useCallback((sectorId: number): string => {
    const sector = sectores.find(s => s.id === sectorId);
    return sector?.nombre || `Sector ID: ${sectorId}`;
  }, [sectores]);

  const obtenerNombreBarrio = useCallback((barrioId: number): string => {
    const barrio = barrios.find(b => b.id === barrioId);
    return barrio?.nombre || `Barrio ID: ${barrioId}`;
  }, [barrios]);

  // Información de debug
  const debugInfo = process.env.NODE_ENV === 'development' ? {
    totalCalles: calles.length,
    totalSectores: sectores.length,
    totalBarrios: barrios.length,
    totalTiposVia: tiposVia.length,
    calleSeleccionada: calleSeleccionada?.nombre || 'Ninguna',
    modoEdicion,
    isOfflineMode,
    ultimaSync: lastSyncTime?.toLocaleTimeString() || 'Nunca',
    error,
    searchTerm
  } : null;

  return {
    // Estados principales
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Estados adicionales
    sectores,
    barrios,
    barriosFiltrados,
    tiposVia,
    loadingSectores,
    loadingBarrios,
    loadingTiposVia,
    
    // Funciones principales
    cargarCalles,
    buscarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    setModoEdicion,
    sincronizarManualmente,
    
    // Funciones adicionales
    cargarSectores,
    cargarBarrios,
    cargarTiposVia,
    filtrarBarriosPorSector,
    forzarModoOnline,
    testApiConnection,
    obtenerNombreSector,
    obtenerNombreBarrio,
    
    // Debug info
    debugInfo
  };
};