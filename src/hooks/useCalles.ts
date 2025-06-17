// src/hooks/useCalles.ts - IMPORTACIONES DIRECTAS
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Calle, CalleFormData, TipoViaOption, TIPO_VIA_OPTIONS } from '../models/Calle';
import { Sector, Barrio } from '../models';
// Importar servicios directamente
import calleService from '../services/calleApiService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';

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
    service: calleService,
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
      
      const porcentajeValidas = data.length > 0 ?
        (callesConNombre.length / data.length) * 100 : 0;
      
      console.log(`📊 [useCalles] ${callesConNombre.length}/${data.length} calles válidas (${porcentajeValidas.toFixed(1)}%)`);
      
      // ✅ Aceptar si al menos el 50% son válidas
      return porcentajeValidas >= 50;
    }
  });

  // Estados adicionales para sectores, barrios y tipos de vía
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
      
      const data = await sectorService.getAll();
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
      
      const data = await barrioService.getAll();
      
      // Asegurar que existe un barrio por defecto
      const barrioDefault = { id: 1, nombre: 'Sin Barrio Asignado', sectorId: 1, estado: 1 };
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
        setBarrios([{ id: 1, nombre: 'Sin Barrio Asignado', sectorId: 1, estado: 1 }]);
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
      
      const tiposFromApi = await calleService.getTiposVia();
      
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
      
      // Intentar desde caché
      const cached = localStorage.getItem('tipos_via_cache');
      if (cached) {
        try {
          const { tipos } = JSON.parse(cached);
          setTiposVia(tipos);
          console.log('📦 [useCalles] Tipos de vía cargados desde caché');
          return;
        } catch (e) {
          console.error('❌ [useCalles] Error al parsear caché:', e);
        }
      }
      
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

  const testApiConnection = useCallback(async () => {
    console.log('🔍 [useCalles] Probando conexión con la API...');
    try {
      const isConnected = await calleService.checkConnection();
      console.log(`✅ [useCalles] Estado de conexión: ${isConnected ? 'ONLINE' : 'OFFLINE'}`);
      return isConnected;
    } catch (error) {
      console.error('❌ [useCalles] Error al probar conexión:', error);
      return false;
    }
  }, []);

  // Funciones helper para obtener nombres
  const obtenerNombreSector = useCallback((sectorId: number | null): string => {
    if (!sectorId) return 'Sin sector';
    const sector = sectores.find(s => s.id === sectorId);
    return sector?.nombre || `Sector ${sectorId}`;
  }, [sectores]);

  const obtenerNombreBarrio = useCallback((barrioId: number | null): string => {
    if (!barrioId) return 'Sin barrio';
    const barrio = barrios.find(b => b.id === barrioId);
    return barrio?.nombre || `Barrio ${barrioId}`;
  }, [barrios]);

  // Debug info
  const debugInfo = {
    totalCalles: calles.length,
    totalSectores: sectores.length,
    totalBarrios: barrios.length,
    totalTiposVia: tiposVia.length,
    isOfflineMode,
    lastSyncTime
  };

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
    
    // Debug
    debugInfo
  };
};