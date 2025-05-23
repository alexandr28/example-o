// src/hooks/useCalles.ts - CORREGIDO PARA MOSTRAR NOMBRES REALES
import { useState, useCallback, useEffect } from 'react';
import { Calle, CalleFormData } from '../models/Calle';
import CalleApiService from '../services/calleApiService';

/**
 * Hook personalizado para la gestión de calles
 * Versión corregida para mostrar nombres reales de la API
 */
export const useCalles = () => {
  // Estados
  const [calles, setCalles] = useState<Calle[]>([]);
  const [calleSeleccionada, setCalleSeleccionada] = useState<Calle | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de fallback solo para emergencias
  const callesFallback: Calle[] = [
    { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
    { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
    { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
  ];

  // Función para validar que los datos sean reales
  const validarDatosReales = (data: Calle[]): boolean => {
    if (!data || data.length === 0) {
      console.log('🔍 [useCalles] validarDatosReales: No hay datos');
      return false;
    }
    
    console.log('🔍 [useCalles] Validando datos recibidos:', data);
    
    // Verificar que las calles tengan nombres reales (no genéricos)
    const datosReales = data.filter(calle => {
      if (!calle || !calle.nombre) {
        return false;
      }
      
      const nombre = calle.nombre.trim();
      
      // Excluir nombres que son claramente mock o genéricos
      const esMockOGenerico = 
        nombre.match(/^Calle sin nombre \d+$/) ||         // "Calle sin nombre 1"
        nombre.match(/^Calle \d+$/) ||                    // "Calle 1", "Calle 2"
        nombre.includes('(datos inválidos)') ||           // Marcados como inválidos
        nombre.includes('(sin nombre)') ||                // Sin nombre
        nombre === '' ||                                  // Vacíos
        nombre.length < 3;                               // Muy cortos
      
      return !esMockOGenerico;
    });
    
    console.log('🔍 [useCalles] Calles con datos reales:', datosReales);
    console.log('🔍 [useCalles] Total reales vs total:', datosReales.length, '/', data.length);
    
    // Si tenemos al menos algunos datos reales, considerar como datos reales
    return datosReales.length > 0;
  };

  // Cargar calles desde la API
  const cargarCalles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [useCalles] Iniciando carga de calles...');
      
      let callesData: Calle[] = [];
      let fuenteDatos = '';
      let esApiReal = false;
      
      // Intentar cargar desde API primero
      try {
        console.log('🔄 [useCalles] Intentando cargar desde API...');
        callesData = await CalleApiService.getAll();
        
        console.log('📊 [useCalles] Datos cargados desde API:', callesData);
        
        // Validar que los datos sean reales y válidos
        if (callesData && Array.isArray(callesData) && callesData.length > 0) {
          // Verificar que todos los elementos tengan estructura válida
          const datosValidos = callesData.every(calle => 
            calle && 
            typeof calle === 'object' && 
            calle.nombre && 
            typeof calle.nombre === 'string' &&
            calle.nombre.trim() !== '' &&
            calle.tipoVia &&
            typeof calle.tipoVia === 'string'
          );
          
          if (datosValidos) {
            const sonDatosReales = validarDatosReales(callesData);
            
            if (sonDatosReales) {
              console.log('✅ [useCalles] API devolvió datos REALES válidos');
              fuenteDatos = 'API Real';
              esApiReal = true;
              setIsOfflineMode(false);
            } else {
              console.warn('⚠️ [useCalles] API devolvió datos válidos pero posiblemente mock');
              fuenteDatos = 'API (posible mock)';
              esApiReal = true;
              setIsOfflineMode(false);
            }
          } else {
            console.warn('⚠️ [useCalles] API devolvió datos con estructura inválida');
            throw new Error('Datos de API con estructura inválida');
          }
        } else {
          console.warn('⚠️ [useCalles] API devolvió datos vacíos o inválidos');
          throw new Error('API no devolvió datos válidos');
        }
        
      } catch (apiError: any) {
        console.error('❌ [useCalles] Error al cargar desde API:', apiError);
        setError(apiError.message || 'Error al conectar con la API');
        
        // Intentar usar datos de caché local
        console.log('🔄 [useCalles] Intentando usar caché local...');
        const callesCache = localStorage.getItem('calles_cache');
        if (callesCache) {
          try {
            const cacheData = JSON.parse(callesCache);
            if (Array.isArray(cacheData) && cacheData.length > 0) {
              callesData = cacheData;
              fuenteDatos = 'Caché Local';
              esApiReal = true; // Asumir que el caché contiene datos reales
              setIsOfflineMode(true);
              console.log('📦 [useCalles] Datos cargados desde caché');
            } else {
              throw new Error('Caché local vacío o inválido');
            }
          } catch (cacheError) {
            console.error('❌ [useCalles] Error al parsear caché:', cacheError);
            throw new Error('Error en caché local');
          }
        } else {
          throw new Error('No hay caché local disponible');
        }
      }
      
      console.log(`📈 [useCalles] Resultado final:`);
      console.log(`📈 [useCalles] - Fuente: ${fuenteDatos}`);
      console.log(`📈 [useCalles] - Cantidad: ${callesData.length}`);
      console.log(`📈 [useCalles] - Es API real: ${esApiReal}`);
      console.log(`📈 [useCalles] - Modo offline: ${!esApiReal}`);
      console.log(`📈 [useCalles] - Datos:`, callesData);
      
      // Actualizar estado con los datos obtenidos
      setCalles(callesData);
      
      // Guardar en caché si son datos de API real
      if (esApiReal && callesData.length > 0 && fuenteDatos === 'API Real') {
        try {
          localStorage.setItem('calles_cache', JSON.stringify(callesData));
          console.log('💾 [useCalles] Datos guardados en caché');
        } catch (cacheError) {
          console.warn('⚠️ [useCalles] Error al guardar en caché:', cacheError);
        }
      }
      
    } catch (err: any) {
      console.error('❌ [useCalles] Error general en cargarCalles:', err);
      setError(err.message || 'Error al cargar las calles');
      
      // Último recurso: usar datos fallback
      console.log('🔄 [useCalles] Usando datos fallback como último recurso');
      setCalles(callesFallback);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar calles
  const buscarCalles = useCallback(async (term: string) => {
    setSearchTerm(term);
    setLoading(true);
    
    try {
      if (!term.trim()) {
        // Si el término está vacío, cargar todas las calles
        await cargarCalles();
        return;
      }
      
      console.log(`🔍 [useCalles] Buscando calles con término: "${term}"`);
      
      // Si estamos en modo offline, hacer búsqueda local
      if (isOfflineMode) {
        console.log('🔍 [useCalles] Realizando búsqueda local (modo offline)');
        const termLower = term.toLowerCase();
        
        // Obtener todas las calles disponibles
        let callesToSearch = calles;
        
        // Si no hay calles cargadas, intentar obtener de caché
        if (calles.length === 0) {
          const callesCache = localStorage.getItem('calles_cache');
          if (callesCache) {
            try {
              callesToSearch = JSON.parse(callesCache);
            } catch (e) {
              console.error('Error al parsear caché para búsqueda:', e);
              callesToSearch = callesFallback;
            }
          } else {
            callesToSearch = callesFallback;
          }
        }
        
        // Realizar la búsqueda local
        const filteredCalles = callesToSearch.filter(calle => 
          (calle.nombre && calle.nombre.toLowerCase().includes(termLower)) ||
          (calle.tipoVia && calle.tipoVia.toLowerCase().includes(termLower))
        );
        
        setCalles(filteredCalles);
      } else {
        // Modo online - intentar búsqueda en la API
        try {
          console.log('🔍 [useCalles] Realizando búsqueda en API');
          const results = await CalleApiService.search(term);
          
          if (results && Array.isArray(results)) {
            setCalles(results);
          } else {
            console.warn('⚠️ [useCalles] Búsqueda API devolvió datos inválidos');
            // Fallback a búsqueda local
            const termLower = term.toLowerCase();
            const filteredCalles = calles.filter(calle => 
              (calle.nombre && calle.nombre.toLowerCase().includes(termLower)) ||
              (calle.tipoVia && calle.tipoVia.toLowerCase().includes(termLower))
            );
            setCalles(filteredCalles);
          }
        } catch (searchError) {
          console.error('❌ [useCalles] Error en búsqueda API, fallback a búsqueda local:', searchError);
          
          // Búsqueda local como fallback
          const termLower = term.toLowerCase();
          const filteredCalles = calles.filter(calle => 
            (calle.nombre && calle.nombre.toLowerCase().includes(termLower)) ||
            (calle.tipoVia && calle.tipoVia.toLowerCase().includes(termLower))
          );
          
          setCalles(filteredCalles);
          setIsOfflineMode(true);
        }
      }
    } catch (error) {
      console.error('Error general en búsqueda:', error);
      setError('Error al buscar calles');
    } finally {
      setLoading(false);
    }
  }, [calles, isOfflineMode, cargarCalles]);

  // Seleccionar calle
  const seleccionarCalle = useCallback((calle: Calle) => {
    console.log('🎯 [useCalles] Calle seleccionada:', calle);
    setCalleSeleccionada(calle);
    setModoEdicion(true);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    console.log('🧹 [useCalles] Limpiando selección');
    setCalleSeleccionada(null);
    setModoEdicion(false);
  }, []);

  // Guardar calle
  const guardarCalle = useCallback(async (data: CalleFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useCalles] Guardando calle:', data);
      
      let result: Calle;
      
      if (modoEdicion && calleSeleccionada) {
        console.log('📝 [useCalles] Modo edición - actualizando calle');
        result = await CalleApiService.update(calleSeleccionada.id!, data);
        
        // Actualizar en la lista
        setCalles(prev => prev.map(c => c.id === calleSeleccionada.id ? result : c));
      } else {
        console.log('➕ [useCalles] Modo creación - creando nueva calle');
        result = await CalleApiService.create(data);
        
        // Agregar a la lista
        setCalles(prev => [...prev, result]);
      }
      
      console.log('✅ [useCalles] Calle guardada exitosamente:', result);
      
      // Limpiar selección
      limpiarSeleccion();
      
      // Actualizar caché
      setTimeout(() => {
        const callesActualizadas = modoEdicion 
          ? calles.map(c => c.id === calleSeleccionada!.id ? result : c)
          : [...calles, result];
        
        localStorage.setItem('calles_cache', JSON.stringify(callesActualizadas));
      }, 100);
      
      return result;
      
    } catch (err: any) {
      console.error('❌ [useCalles] Error en guardarCalle:', err);
      setError(err.message || 'Error al guardar la calle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, calleSeleccionada, calles, limpiarSeleccion]);

  // Eliminar calle
  const eliminarCalle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useCalles] Eliminando calle ID:', id);
      
      await CalleApiService.delete(id);
      
      // Remover de la lista
      setCalles(prev => prev.filter(c => c.id !== id));
      
      // Si la calle eliminada estaba seleccionada, limpiar selección
      if (calleSeleccionada?.id === id) {
        limpiarSeleccion();
      }
      
      console.log('✅ [useCalles] Calle eliminada exitosamente');
      
      // Actualizar caché
      setTimeout(() => {
        const callesActualizadas = calles.filter(c => c.id !== id);
        localStorage.setItem('calles_cache', JSON.stringify(callesActualizadas));
      }, 100);
      
    } catch (err: any) {
      console.error('❌ [useCalles] Error al eliminar:', err);
      setError(err.message || 'Error al eliminar la calle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [calleSeleccionada, calles, limpiarSeleccion]);

  // Función para forzar modo online
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useCalles] FORZANDO modo online...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Forzar carga directa desde API sin fallback
      console.log('🚀 [useCalles] Carga FORZADA desde API...');
      const callesData = await CalleApiService.getAll();
      
      console.log('📊 [useCalles] Datos forzados de API:', callesData);
      
      if (callesData && Array.isArray(callesData) && callesData.length > 0) {
        setCalles(callesData);
        setIsOfflineMode(false);
        
        // Guardar en caché
        localStorage.setItem('calles_cache', JSON.stringify(callesData));
        
        console.log('✅ [useCalles] Modo online FORZADO exitosamente');
      } else {
        throw new Error('API no devolvió datos válidos al forzar conexión');
      }
      
    } catch (error: any) {
      console.error('❌ [useCalles] Error al forzar modo online:', error);
      setError('Error al forzar conexión: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Test de conexión con la API
  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useCalles] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:8080/api/via', {
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
        console.log('🧪 [useCalles] Test content preview:', text.substring(0, 200));
        
        try {
          const json = JSON.parse(text);
          console.log('🧪 [useCalles] Test data parsed:', json);
          
          // Verificar si los datos son válidos y reales
          if (Array.isArray(json) && json.length > 0) {
            const hayDatosReales = json.some(item => 
              item && 
              typeof item === 'object' && 
              (item.nombreVia || item.nombre) && 
              typeof (item.nombreVia || item.nombre) === 'string' &&
              (item.nombreVia || item.nombre).trim().length > 0 &&
              !(item.nombreVia || item.nombre).match(/^Calle sin nombre \d+$/)
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

  // Sincronización manual
  const sincronizarManualmente = useCallback(async () => {
    console.log('🔄 [useCalles] Sincronización manual iniciada');
    
    // Probar conexión primero
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      console.log('✅ [useCalles] Conexión OK, recargando datos');
      await cargarCalles();
    } else {
      console.warn('⚠️ [useCalles] Sin conexión, manteniendo datos actuales');
      setError('No se pudo conectar con el servidor para sincronizar');
    }
  }, [testApiConnection, cargarCalles]);

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('🎬 [useCalles] Hook montado, iniciando carga inicial');
    cargarCalles();
  }, [cargarCalles]);

  // Debug en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [useCalles] Estado actual:');
      console.log('- Calles:', calles);
      console.log('- Loading:', loading);
      console.log('- Error:', error);
      console.log('- Offline mode:', isOfflineMode);
      console.log('- Calle seleccionada:', calleSeleccionada);
      console.log('- Search term:', searchTerm);
    }
  }, [calles, loading, error, isOfflineMode, calleSeleccionada, searchTerm]);

  return {
    // Estados
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    pendingChangesCount: 0, // Simplificado por ahora
    
    // Funciones
    cargarCalles,
    buscarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    setModoEdicion,
    forzarModoOnline,
    testApiConnection,
    sincronizarCambios: sincronizarManualmente,
  };
};

export default useCalles;