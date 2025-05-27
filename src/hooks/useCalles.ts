// src/hooks/useCalles.ts - VERSIÓN COMPLETA CON TIPOVIA INTEGRADO
import { useState, useCallback, useEffect } from 'react';
import { Calle, CalleFormData, TipoViaOption, TIPO_VIA_OPTIONS } from '../models/Calle';
import CalleApiService from '../services/calleApiService';

/**
 * Hook personalizado para la gestión de calles
 * VERSIÓN COMPLETA con integración total de TipoVia
 */
export const useCalles = () => {
  // Estados principales para calles
  const [calles, setCalles] = useState<Calle[]>([]);
  const [calleSeleccionada, setCalleSeleccionada] = useState<Calle | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // NUEVOS estados para TipoVia
  const [tiposVia, setTiposVia] = useState<TipoViaOption[]>(TIPO_VIA_OPTIONS);
  const [loadingTiposVia, setLoadingTiposVia] = useState(false);
  const [errorTiposVia, setErrorTiposVia] = useState<string | null>(null);

  // Estados adicionales para métricas y control
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);

  // Datos de fallback para emergencias
  const callesFallback: Calle[] = [
    { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
    { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
    { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
  ];

  // Función para validar que los datos sean reales (no mock)
  const validarDatosReales = useCallback((data: Calle[]): boolean => {
    if (!data || data.length === 0) {
      console.log('🔍 [useCalles] validarDatosReales: No hay datos');
      return false;
    }
    
    console.log('🔍 [useCalles] Validando datos recibidos:', data.length, 'calles');
    
    // Verificar que las calles tengan nombres reales (no genéricos)
    const datosReales = data.filter(calle => {
      if (!calle || !calle.nombre) return false;
      
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
    
    console.log('🔍 [useCalles] Calles con datos reales:', datosReales.length, '/', data.length);
    
    // Si tenemos al menos algunos datos reales, considerar como datos reales
    return datosReales.length > 0;
  }, []);

  // NUEVA función para cargar tipos de vía desde la API
  const cargarTiposVia = useCallback(async () => {
    try {
      setLoadingTiposVia(true);
      setErrorTiposVia(null);
      
      console.log('🎨 [useCalles] Iniciando carga de tipos de vía...');
      
      const tiposFromApi = await CalleApiService.getTiposVia();
      
      if (tiposFromApi && Array.isArray(tiposFromApi) && tiposFromApi.length > 0) {
        console.log('✅ [useCalles] Tipos de vía obtenidos desde API:', tiposFromApi.length);
        
        // Validar que los tipos tengan la estructura correcta
        const tiposValidos = tiposFromApi.filter(tipo => 
          tipo && 
          typeof tipo === 'object' && 
          typeof tipo.value === 'string' && 
          typeof tipo.label === 'string' &&
          tipo.value.trim() !== '' &&
          tipo.label.trim() !== ''
        );
        
        if (tiposValidos.length > 0) {
          setTiposVia(tiposValidos);
          
          // Guardar en caché con timestamp
          const cacheData = {
            tipos: tiposValidos,
            timestamp: new Date().toISOString(),
            source: 'api'
          };
          localStorage.setItem('tipos_via_cache', JSON.stringify(cacheData));
          
          console.log('✅ [useCalles] Tipos de vía guardados en caché:', tiposValidos.length);
        } else {
          console.warn('⚠️ [useCalles] API devolvió tipos de vía con estructura inválida');
          throw new Error('Tipos de vía con estructura inválida');
        }
      } else {
        console.warn('⚠️ [useCalles] API no devolvió tipos de vía válidos, usando predefinidos');
        setTiposVia(TIPO_VIA_OPTIONS);
      }
      
    } catch (error: any) {
      console.error('❌ [useCalles] Error al cargar tipos de vía:', error);
      setErrorTiposVia(error.message || 'Error al cargar tipos de vía');
      
      // Intentar cargar desde caché
      try {
        const cachedData = localStorage.getItem('tipos_via_cache');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          
          // Verificar que el caché no sea muy antiguo (24 horas)
          if (parsed.timestamp && parsed.tipos) {
            const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas
            
            if (cacheAge < maxAge && Array.isArray(parsed.tipos) && parsed.tipos.length > 0) {
              setTiposVia(parsed.tipos);
              console.log('📦 [useCalles] Tipos de vía cargados desde caché (edad:', Math.round(cacheAge / (60 * 1000)), 'min)');
              return;
            } else {
              console.warn('⚠️ [useCalles] Caché de tipos de vía expirado o inválido');
            }
          }
        }
      } catch (cacheError) {
        console.error('❌ [useCalles] Error al parsear caché de tipos de vía:', cacheError);
      }
      
      // Fallback final a tipos predefinidos
      console.log('🔄 [useCalles] Usando tipos de vía predefinidos como fallback');
      setTiposVia(TIPO_VIA_OPTIONS);
    } finally {
      setLoadingTiposVia(false);
    }
  }, []);

  // Cargar calles desde la API (función mejorada)
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
        
        console.log('📊 [useCalles] Datos cargados desde API:', callesData.length, 'calles');
        
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
      
      // Actualizar estado con los datos obtenidos
      setCalles(callesData);
      setLastSyncTime(new Date());
      
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
  }, [validarDatosReales]);

  // Buscar calles con término específico
  const buscarCalles = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // Si el término está vacío, cargar todas las calles
      await cargarCalles();
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`🔍 [useCalles] Buscando calles con término: "${term}"`);
      
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
        console.log(`🔍 [useCalles] Búsqueda local completada: ${filteredCalles.length} resultados`);
      } else {
        // Modo online - intentar búsqueda en la API
        try {
          console.log('🔍 [useCalles] Realizando búsqueda en API');
          const results = await CalleApiService.search(term);
          
          if (results && Array.isArray(results)) {
            setCalles(results);
            console.log(`🔍 [useCalles] Búsqueda API completada: ${results.length} resultados`);
          } else {
            console.warn('⚠️ [useCalles] Búsqueda API devolvió datos inválidos');
            // Fallback a búsqueda local
            const termLower = term.toLowerCase();
            const filteredCalles = calles.filter(calle => 
              (calle.nombre && calle.nombre.toLowerCase().includes(termLower)) ||
              (calle.tipoVia && calle.tipoVia.toLowerCase().includes(termLower))
            );
            setCalles(filteredCalles);
            console.log(`🔍 [useCalles] Fallback a búsqueda local: ${filteredCalles.length} resultados`);
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
          console.log(`🔍 [useCalles] Búsqueda local por error: ${filteredCalles.length} resultados`);
        }
      }
    } catch (error) {
      console.error('❌ [useCalles] Error general en búsqueda:', error);
      setError('Error al buscar calles');
    } finally {
      setLoading(false);
    }
  }, [calles, isOfflineMode, cargarCalles]);

  // Seleccionar calle para edición
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

  // Guardar calle (crear o actualizar) con sincronización de tipos de vía
  const guardarCalle = useCallback(async (data: CalleFormData) => {
    try {
      setLoading(true);
      setError(null);
      setPendingChangesCount(prev => prev + 1);
      
      console.log('💾 [useCalles] Guardando calle:', data);
      
      let result: Calle;
      
      if (modoEdicion && calleSeleccionada) {
        console.log('📝 [useCalles] Modo edición - actualizando calle ID:', calleSeleccionada.id);
        result = await CalleApiService.update(calleSeleccionada.id!, data);
        
        // Actualizar en la lista local
        setCalles(prev => prev.map(c => c.id === calleSeleccionada.id ? result : c));
      } else {
        console.log('➕ [useCalles] Modo creación - creando nueva calle');
        result = await CalleApiService.create(data);
        
        // Agregar a la lista local
        setCalles(prev => [...prev, result]);
      }
      
      console.log('✅ [useCalles] Calle guardada exitosamente:', result);
      
      // Limpiar selección
      limpiarSeleccion();
      setLastSyncTime(new Date());
      
      // Actualizar caché de calles
      setTimeout(() => {
        const callesActualizadas = modoEdicion 
          ? calles.map(c => c.id === calleSeleccionada!.id ? result : c)
          : [...calles, result];
        
        localStorage.setItem('calles_cache', JSON.stringify(callesActualizadas));
        console.log('💾 [useCalles] Caché de calles actualizado');
      }, 100);
      
      // IMPORTANTE: Recargar tipos de vía por si se agregó uno nuevo
      console.log('🔄 [useCalles] Recargando tipos de vía después de guardar...');
      await cargarTiposVia();
      
      return result;
      
    } catch (err: any) {
      console.error('❌ [useCalles] Error en guardarCalle:', err);
      setError(err.message || 'Error al guardar la calle');
      throw err;
    } finally {
      setLoading(false);
      setPendingChangesCount(prev => Math.max(0, prev - 1));
    }
  }, [modoEdicion, calleSeleccionada, calles, limpiarSeleccion, cargarTiposVia]);

  // Eliminar calle con sincronización de tipos de vía
  const eliminarCalle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      setPendingChangesCount(prev => prev + 1);
      
      console.log('🗑️ [useCalles] Eliminando calle ID:', id);
      
      await CalleApiService.delete(id);
      
      // Remover de la lista local
      setCalles(prev => prev.filter(c => c.id !== id));
      
      // Si la calle eliminada estaba seleccionada, limpiar selección
      if (calleSeleccionada?.id === id) {
        limpiarSeleccion();
      }
      
      console.log('✅ [useCalles] Calle eliminada exitosamente');
      setLastSyncTime(new Date());
      
      // Actualizar caché
      setTimeout(() => {
        const callesActualizadas = calles.filter(c => c.id !== id);
        localStorage.setItem('calles_cache', JSON.stringify(callesActualizadas));
        console.log('💾 [useCalles] Caché actualizado después de eliminar');
      }, 100);
      
      // IMPORTANTE: Recargar tipos de vía por si se eliminó el último de un tipo
      console.log('🔄 [useCalles] Recargando tipos de vía después de eliminar...');
      await cargarTiposVia();
      
    } catch (err: any) {
      console.error('❌ [useCalles] Error al eliminar:', err);
      setError(err.message || 'Error al eliminar la calle');
      throw err;
    } finally {
      setLoading(false);
      setPendingChangesCount(prev => Math.max(0, prev - 1));
    }
  }, [calleSeleccionada, calles, limpiarSeleccion, cargarTiposVia]);

  // Función para forzar modo online
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useCalles] FORZANDO modo online...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Forzar carga directa desde API sin fallback
      console.log('🚀 [useCalles] Carga FORZADA desde API...');
      const callesData = await CalleApiService.getAll();
      
      console.log('📊 [useCalles] Datos forzados de API:', callesData.length, 'calles');
      
      if (callesData && Array.isArray(callesData) && callesData.length > 0) {
        setCalles(callesData);
        setIsOfflineMode(false);
        setLastSyncTime(new Date());
        
        // Guardar en caché
        localStorage.setItem('calles_cache', JSON.stringify(callesData));
        
        // También recargar tipos de vía
        console.log('🎨 [useCalles] Recargando tipos de vía en modo forzado...');
        await cargarTiposVia();
        
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
  }, [cargarTiposVia]);

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
          console.log('🧪 [useCalles] Test data parsed, count:', Array.isArray(json) ? json.length : 'N/A');
          
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

  // Sincronización manual completa
  const sincronizarManualmente = useCallback(async () => {
    console.log('🔄 [useCalles] Sincronización manual iniciada');
    
    // Probar conexión primero
    const isConnected = await testApiConnection();
    
    if (isConnected) {
      console.log('✅ [useCalles] Conexión OK, recargando todos los datos');
      await Promise.all([
        cargarCalles(),
        cargarTiposVia()
      ]);
      console.log('✅ [useCalles] Sincronización manual completada');
    } else {
      console.warn('⚠️ [useCalles] Sin conexión, manteniendo datos actuales');
      setError('No se pudo conectar con el servidor para sincronizar');
    }
  }, [testApiConnection, cargarCalles, cargarTiposVia]);

  // Obtener estadísticas de tipos de vía
  const getEstadisticasTiposVia = useCallback(() => {
    const tiposUsados = calles.reduce((acc, calle) => {
      if (calle.tipoVia) {
        acc[calle.tipoVia] = (acc[calle.tipoVia] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const tiposDisponibles = tiposVia.length;
    const tiposEnUso = Object.keys(tiposUsados).length;
    const tipoMasUsado = Object.entries(tiposUsados).reduce(
      (max, [tipo, count]) => count > max.count ? { tipo, count } : max,
      { tipo: '', count: 0 }
    );

    return {
      tiposDisponibles,
      tiposEnUso,
      tiposUsados,
      tipoMasUsado: tipoMasUsado.count > 0 ? tipoMasUsado : null,
      cobertura: tiposDisponibles > 0 ? (tiposEnUso / tiposDisponibles) * 100 : 0
    };
  }, [calles, tiposVia]);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    console.log('🎬 [useCalles] Hook montado, iniciando carga inicial');
    
    const cargarDatosIniciales = async () => {
      // Cargar en paralelo para mejor performance
      await Promise.all([
        cargarCalles(),
        cargarTiposVia()
      ]);
      
      console.log('🎬 [useCalles] Carga inicial completada');
    };
    
    cargarDatosIniciales();
  }, [cargarCalles, cargarTiposVia]);

  // Debug detallado en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stats = getEstadisticasTiposVia();
      
      console.log('🔍 [useCalles] Estado actual completo:');
      console.log('📊 Calles:', {
        total: calles.length,
        seleccionada: calleSeleccionada?.nombre || 'ninguna',
        searchTerm: searchTerm || 'sin filtro'
      });
      console.log('🎨 Tipos de vía:', {
        disponibles: tiposVia.length,
        enUso: stats.tiposEnUso,
        cobertura: `${stats.cobertura.toFixed(1)}%`,
        masUsado: stats.tipoMasUsado?.tipo || 'ninguno'
      });
      console.log('⚙️ Estados:', {
        loading,
        loadingTiposVia,
        modoEdicion,
        isOfflineMode,
        pendingChanges: pendingChangesCount
      });
      console.log('🔄 Sync:', {
        lastSync: lastSyncTime?.toLocaleTimeString() || 'nunca',
        error: error || 'ninguno',
        errorTiposVia: errorTiposVia || 'ninguno'
      });
    }
  }, [
    calles, tiposVia, calleSeleccionada, searchTerm, loading, loadingTiposVia, 
    modoEdicion, isOfflineMode, pendingChangesCount, lastSyncTime, error, errorTiposVia, getEstadisticasTiposVia
  ]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      console.log('🔚 [useCalles] Hook desmontado, limpiando recursos');
      // Aquí podrías cancelar requests pendientes si fuera necesario
    };
  }, []);

  // RETURN - Interface completa del hook
  return {
    // ==========================================
    // ESTADOS PRINCIPALES - CALLES
    // ==========================================
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,

    // ==========================================
    // ESTADOS TIPOS DE VÍA (NUEVOS)
    // ==========================================
    tiposVia,
    loadingTiposVia,
    errorTiposVia,

    // ==========================================
    // ESTADOS ADICIONALES (NUEVOS)
    // ==========================================
    lastSyncTime,
    pendingChangesCount,

    // ==========================================
    // FUNCIONES PRINCIPALES - CALLES
    // ==========================================
    cargarCalles,
    buscarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    setModoEdicion,

    // ==========================================
    // FUNCIONES TIPOS DE VÍA (NUEVAS)
    // ==========================================
    cargarTiposVia,

    // ==========================================
    // FUNCIONES DE CONECTIVIDAD
    // ==========================================
    forzarModoOnline,
    testApiConnection,
    sincronizarCambios: sincronizarManualmente,

    // ==========================================
    // FUNCIONES DE UTILIDAD (NUEVAS)
    // ==========================================
    getEstadisticasTiposVia,

    // ==========================================
    // FUNCIONES DE VALIDACIÓN
    // ==========================================
    validarDatosReales,

    // ==========================================
    // MÉTODOS DE CACHE (NUEVOS)
    // ==========================================
    limpiarCache: () => {
      localStorage.removeItem('calles_cache');
      localStorage.removeItem('tipos_via_cache');
      console.log('🧹 [useCalles] Cache limpiado completamente');
    },

    obtenerInfoCache: () => {
      const callesCache = localStorage.getItem('calles_cache');
      const tiposCache = localStorage.getItem('tipos_via_cache');
      
      return {
        calles: {
          existe: !!callesCache,
          tamaño: callesCache ? callesCache.length : 0,
          elementos: callesCache ? JSON.parse(callesCache).length || 0 : 0
        },
        tiposVia: {
          existe: !!tiposCache,
          tamaño: tiposCache ? tiposCache.length : 0,
          timestamp: tiposCache ? JSON.parse(tiposCache).timestamp || null : null
        }
      };
    },

    // ==========================================
    // UTILIDADES DE DEBUG (DESARROLLO)
    // ==========================================
    debugInfo: process.env.NODE_ENV === 'development' ? {
      estadoCompleto: () => ({
        calles: {
          total: calles.length,
          seleccionada: calleSeleccionada,
          ultimaBusqueda: searchTerm,
          modoEdicion
        },
        tiposVia: {
          disponibles: tiposVia,
          estadisticas: getEstadisticasTiposVia(),
          loading: loadingTiposVia,
          error: errorTiposVia
        },
        conectividad: {
          offline: isOfflineMode,
          ultimaSync: lastSyncTime,
          cambiosPendientes: pendingChangesCount
        },
        cache: {
          calles: !!localStorage.getItem('calles_cache'),
          tiposVia: !!localStorage.getItem('tipos_via_cache')
        }
      }),
      
      forzarEstado: (nuevoEstado: Partial<{
        calles: Calle[];
        tiposVia: TipoViaOption[];
        isOfflineMode: boolean;
      }>) => {
        if (nuevoEstado.calles) setCalles(nuevoEstado.calles);
        if (nuevoEstado.tiposVia) setTiposVia(nuevoEstado.tiposVia);
        if (nuevoEstado.isOfflineMode !== undefined) setIsOfflineMode(nuevoEstado.isOfflineMode);
        console.log('🔧 [useCalles] Estado forzado para debug:', nuevoEstado);
      },

      simularError: (tipo: 'calles' | 'tiposVia', mensaje: string) => {
        if (tipo === 'calles') {
          setError(mensaje);
        } else {
          setErrorTiposVia(mensaje);
        }
        console.log('⚠️ [useCalles] Error simulado:', tipo, mensaje);
      }
    } : undefined,

    // ==========================================
    // COMPATIBILIDAD HACIA ATRÁS
    // ==========================================
    // Mantenemos nombres anteriores por compatibilidad
    sincronizarManualmente,
    
    // ==========================================
    // MÉTRICAS Y ESTADÍSTICAS
    // ==========================================
    metricas: {
      totalCalles: calles.length,
      totalTiposVia: tiposVia.length,
      tiposEnUso: [...new Set(calles.map(c => c.tipoVia))].length,
      ultimaActualizacion: lastSyncTime,
      modoConexion: isOfflineMode ? 'offline' : 'online',
      cambiosPendientes: pendingChangesCount,
      estadoCache: {
        callesEnCache: !!localStorage.getItem('calles_cache'),
        tiposViaEnCache: !!localStorage.getItem('tipos_via_cache')
      }
    }
  };
};

export default useCalles;