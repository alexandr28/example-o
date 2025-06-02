// src/hooks/useCalles.ts - CORREGIDO PARA API REAL
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
      // 🔥 VALIDACIÓN MÁS PERMISIVA PARA CALLES
      console.log('🔍 [useCalles] Validando datos:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ [useCalles] Los datos no son un array');
        return false;
      }
      
      if (data.length === 0) {
        console.warn('⚠️ [useCalles] Array vacío');
        return true; // ✅ Aceptar array vacío como válido
      }
      
      // Contar calles que tienen al menos nombre
      const callesConNombre = data.filter(calle => 
        calle && 
        typeof calle === 'object' && 
        (calle.nombre || calle.nombreVia) &&
        typeof (calle.nombre || calle.nombreVia) === 'string' &&
        (calle.nombre || calle.nombreVia).trim().length > 0
      );
      
      const porcentajeValidas = data.length > 0 ? (callesConNombre.length / data.length) * 100 : 100;
      
      console.log(`📊 [useCalles] ${callesConNombre.length}/${data.length} calles con nombre válido (${porcentajeValidas.toFixed(1)}%)`);
      
      // ✅ Aceptar si al menos el 30% tienen nombre válido (muy permisivo)
      return porcentajeValidas >= 30;
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

  // Cargar sectores con sector por defecto
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      console.log('🔄 [useCalles] Cargando sectores...');
      
      const data = await SectorService.getAll();
      
      // Asegurar que existe un sector por defecto
      const sectorDefault = { id: 1, nombre: 'Sin Sector Asignado' };
      const tieneDefault = data.some(s => s.id === 1);
      
      if (!tieneDefault) {
        console.log('➕ [useCalles] Agregando sector por defecto');
        data.unshift(sectorDefault);
      }
      
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
      } else {
        // Solo sector por defecto
        setSectores([{ id: 1, nombre: 'Sin Sector Asignado' }]);
      }
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Cargar barrios con barrio por defecto
  const cargarBarrios = useCallback(async () => {
    try {
      setLoadingBarrios(true);
      console.log('🔄 [useCalles] Cargando barrios...');
      
      const data = await BarrioService.getAll();
      
      // Asegurar que existe un barrio por defecto
      const barrioDefault = { id: 1, nombre: 'Sin Barrio Asignado', sectorId: 1 };
      const tieneDefault = data.some(b => b.id === 1);
      
      if (!tieneDefault) {
        console.log('➕ [useCalles] Agregando barrio por defecto');
        data.unshift(barrioDefault);
      }
      
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
      } else {
        // Solo barrio por defecto
        setBarrios([{ id: 1, nombre: 'Sin Barrio Asignado', sectorId: 1 }]);
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
      } else {
        console.log('📦 [useCalles] Usando tipos de vía predefinidos');
        setTiposVia(TIPO_VIA_OPTIONS);
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
      console.log('🚀 [useCalles] Iniciando carga de datos...');
      
      try {
        // Cargar en secuencia para evitar problemas de dependencias
        await cargarSectores();
        await cargarBarrios();
        await cargarTiposVia();
        await cargarCalles();
        
        console.log('✅ [useCalles] Carga inicial completada');
      } catch (error) {
        console.error('❌ [useCalles] Error en carga inicial:', error);
      }
    };
    
    cargarDatosIniciales();
  }, []); // Solo ejecutar una vez

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
        cargarSectores(),
        cargarBarrios(),
        cargarTiposVia(),
        cargarCalles()
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
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch('/api/via/listarVia', {
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
          
          // Verificar estructura esperada: {success: true, data: [...]}
          if (json.success === true && Array.isArray(json.data)) {
            const validItems = json.data.filter(item => 
              item && 
              typeof item === 'object' && 
              (item.nombreVia || item.nombre)
            );
            
            console.log('🧪 [useCalles] Items válidos encontrados:', validItems.length);
            return validItems.length > 0;
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
    return barrio?.nombre || barrio?.nombreBarrio || `Barrio ID: ${barrioId}`;
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
    searchTerm,
    barriosFiltrados: barriosFiltrados.length
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