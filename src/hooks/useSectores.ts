// src/hooks/useSectores.ts - CORREGIDO PARA MOSTRAR NOMBRES REALES
import { useState, useCallback, useEffect } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import SectorService from '../services/sectorService';
import { MockSectorService } from '../services/mockSectorService';

export const useSectores = () => {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Función para validar que los datos sean reales y no mock
  const validarDatosReales = (data: Sector[]): boolean => {
    if (!data || data.length === 0) {
      console.log('🔍 [useSectores] validarDatosReales: No hay datos');
      return false;
    }
    
    console.log('🔍 [useSectores] Validando datos recibidos:', data);
    
    // Verificar que los sectores tengan nombres reales (no genéricos ni mock)
    const datosReales = data.filter(sector => {
      if (!sector || !sector.nombre) {
        return false;
      }
      
      const nombre = sector.nombre.trim();
      
      // Excluir nombres que son claramente mock o genéricos
      const esMockOGenerico = 
        nombre.match(/^Sector \d+$/) ||                    // "Sector 1", "Sector 2"
        nombre.includes('(datos inválidos)') ||            // Sectores marcados como inválidos
        nombre.includes('(sin nombre)') ||                 // Sectores sin nombre
        nombre === '' ||                                   // Vacíos
        nombre.length < 3;                                // Muy cortos
      
      return !esMockOGenerico;
    });
    
    console.log('🔍 [useSectores] Sectores con datos reales:', datosReales);
    console.log('🔍 [useSectores] Total reales vs total:', datosReales.length, '/', data.length);
    
    // Si tenemos al menos algunos datos reales, considerar como datos reales
    return datosReales.length > 0;
  };

  // Cargar sectores desde la API
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [useSectores] Iniciando carga de sectores...');
      
      let sectoresData: Sector[] = [];
      let fuenteDatos = '';
      let esApiReal = false;
      
      // Intentar cargar desde API primero
      try {
        console.log('🔄 [useSectores] Intentando cargar desde API...');
        sectoresData = await SectorService.getAll();
        
        console.log('📊 [useSectores] Datos cargados desde API:', sectoresData);
        
        // Validar que los datos sean reales
        if (sectoresData && Array.isArray(sectoresData) && sectoresData.length > 0) {
          const sonDatosReales = validarDatosReales(sectoresData);
          
          if (sonDatosReales) {
            console.log('✅ [useSectores] API devolvió datos REALES');
            fuenteDatos = 'API Real';
            esApiReal = true;
            setIsOfflineMode(false);
          } else {
            console.warn('⚠️ [useSectores] API devolvió datos mock/genéricos');
            // Aún así usar los datos de la API, pero marcar como posible problema
            fuenteDatos = 'API (datos posiblemente mock)';
            esApiReal = true;
            setIsOfflineMode(false);
          }
        } else {
          console.warn('⚠️ [useSectores] API devolvió datos vacíos o inválidos');
          throw new Error('API no devolvió datos válidos');
        }
        
      } catch (apiError: any) {
        console.error('❌ [useSectores] Error al cargar desde API:', apiError);
        
        // Fallback a mock service solo en caso de error real
        console.log('🔄 [useSectores] Usando MockService como fallback...');
        try {
          sectoresData = await MockSectorService.getAll();
          fuenteDatos = 'MockService (fallback)';
          esApiReal = false;
          setIsOfflineMode(true);
          console.log('📊 [useSectores] Datos cargados desde MockService:', sectoresData);
        } catch (mockError) {
          console.error('❌ [useSectores] Error también en MockService:', mockError);
          sectoresData = [];
          fuenteDatos = 'Ninguno (error total)';
          esApiReal = false;
          setIsOfflineMode(true);
        }
      }
      
      console.log(`📈 [useSectores] Resultado final:`);
      console.log(`📈 [useSectores] - Fuente: ${fuenteDatos}`);
      console.log(`📈 [useSectores] - Cantidad: ${sectoresData.length}`);
      console.log(`📈 [useSectores] - Es API real: ${esApiReal}`);
      console.log(`📈 [useSectores] - Modo offline: ${!esApiReal}`);
      console.log(`📈 [useSectores] - Datos:`, sectoresData);
      
      // Actualizar estado con los datos obtenidos
      setSectores(sectoresData);
      
      // Guardar en caché si son datos reales
      if (esApiReal && sectoresData.length > 0) {
        try {
          localStorage.setItem('sectores_cache', JSON.stringify(sectoresData));
          console.log('💾 [useSectores] Datos guardados en caché');
        } catch (cacheError) {
          console.warn('⚠️ [useSectores] Error al guardar en caché:', cacheError);
        }
      }
      
    } catch (err: any) {
      console.error('❌ [useSectores] Error general en cargarSectores:', err);
      setError(err.message || 'Error al cargar los sectores');
      
      // Último recurso: intentar cargar desde caché
      try {
        const cachedData = localStorage.getItem('sectores_cache');
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          if (Array.isArray(parsedCache) && parsedCache.length > 0) {
            console.log('📦 [useSectores] Usando datos desde caché:', parsedCache);
            setSectores(parsedCache);
            setIsOfflineMode(true);
            return;
          }
        }
      } catch (cacheError) {
        console.error('❌ [useSectores] Error al cargar desde caché:', cacheError);
      }
      
      // Si todo falla, dejar array vacío
      setSectores([]);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para forzar modo online (reconectar con API)
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useSectores] FORZANDO modo online...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Forzar carga directa desde API sin fallback
      console.log('🚀 [useSectores] Carga FORZADA desde API...');
      const sectoresData = await SectorService.getAll();
      
      console.log('📊 [useSectores] Datos forzados de API:', sectoresData);
      
      if (sectoresData && Array.isArray(sectoresData) && sectoresData.length > 0) {
        setSectores(sectoresData);
        setIsOfflineMode(false);
        
        // Guardar en caché
        localStorage.setItem('sectores_cache', JSON.stringify(sectoresData));
        
        console.log('✅ [useSectores] Modo online FORZADO exitosamente');
      } else {
        throw new Error('API no devolvió datos válidos al forzar conexión');
      }
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al forzar modo online:', error);
      setError('Error al forzar conexión: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Test de conexión con la API
  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useSectores] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:8080/api/sector', {
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

  // Resto de funciones del hook...
  const seleccionarSector = useCallback((sector: Sector) => {
    console.log('🎯 [useSectores] Sector seleccionado:', sector);
    setSectorSeleccionado(sector);
    setModoEdicion(true);
  }, []);

  const limpiarSeleccion = useCallback(() => {
    console.log('🧹 [useSectores] Limpiando selección');
    setSectorSeleccionado(null);
    setModoEdicion(false);
  }, []);

  const guardarSector = useCallback(async (data: SectorFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useSectores] Guardando sector:', data);
      
      let result: Sector;
      
      if (modoEdicion && sectorSeleccionado) {
        console.log('📝 [useSectores] Modo edición - actualizando sector');
        result = await SectorService.update(sectorSeleccionado.id, data);
        
        // Actualizar en la lista
        setSectores(prev => prev.map(s => s.id === sectorSeleccionado.id ? result : s));
      } else {
        console.log('➕ [useSectores] Modo creación - creando nuevo sector');
        result = await SectorService.create(data);
        
        // Agregar a la lista
        setSectores(prev => [...prev, result]);
      }
      
      console.log('✅ [useSectores] Sector guardado exitosamente:', result);
      
      // Limpiar selección
      limpiarSeleccion();
      
      // Actualizar caché
      setTimeout(() => {
        const sectoresActualizados = modoEdicion 
          ? sectores.map(s => s.id === sectorSeleccionado!.id ? result : s)
          : [...sectores, result];
        
        localStorage.setItem('sectores_cache', JSON.stringify(sectoresActualizados));
      }, 100);
      
      return result;
      
    } catch (err: any) {
      console.error('❌ [useSectores] Error en guardarSector:', err);
      setError(err.message || 'Error al guardar el sector');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, sectorSeleccionado, sectores, limpiarSeleccion]);

  const eliminarSector = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useSectores] Eliminando sector ID:', id);
      
      await SectorService.delete(id);
      
      // Remover de la lista
      setSectores(prev => prev.filter(s => s.id !== id));
      
      // Si el sector eliminado estaba seleccionado, limpiar selección
      if (sectorSeleccionado?.id === id) {
        limpiarSeleccion();
      }
      
      console.log('✅ [useSectores] Sector eliminado exitosamente');
      
      // Actualizar caché
      setTimeout(() => {
        const sectoresActualizados = sectores.filter(s => s.id !== id);
        localStorage.setItem('sectores_cache', JSON.stringify(sectoresActualizados));
      }, 100);
      
    } catch (err: any) {
      console.error('❌ [useSectores] Error al eliminar:', err);
      setError(err.message || 'Error al eliminar el sector');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sectorSeleccionado, sectores, limpiarSeleccion]);

  const sincronizarManualmente = useCallback(async () => {
    console.log('🔄 [useSectores] Sincronización manual iniciada');
    
    // Probar conexión primero
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      console.log('✅ [useSectores] Conexión OK, recargando datos');
      await cargarSectores();
    } else {
      console.warn('⚠️ [useSectores] Sin conexión, manteniendo datos actuales');
      setError('No se pudo conectar con el servidor para sincronizar');
    }
  }, [testApiConnection, cargarSectores]);

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    console.log('🎬 [useSectores] Hook montado, iniciando carga inicial');
    cargarSectores();
  }, [cargarSectores]);

  // Efecto para debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [useSectores] Estado actual:');
      console.log('- Sectores:', sectores);
      console.log('- Loading:', loading);
      console.log('- Error:', error);
      console.log('- Offline mode:', isOfflineMode);
      console.log('- Sector seleccionado:', sectorSeleccionado);
    }
  }, [sectores, loading, error, isOfflineMode, sectorSeleccionado]);

  return {
    // Estados
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    hasPendingChanges: false, // Simplificado por ahora
    pendingChangesCount: 0,   // Simplificado por ahora
    
    // Funciones
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente,
    forzarModoOnline,
    testApiConnection,
  };
};