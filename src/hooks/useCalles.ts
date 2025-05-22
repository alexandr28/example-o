// src/hooks/useCalles.ts
import { useState, useCallback, useEffect } from 'react';
import { Calle, CalleFormData } from '../models/Calle';
import CalleApiService from '../services/calleApiService';
import { connectivityService } from '../services/connectivityService';

/**
 * Hook personalizado para la gestión de calles
 * Versión mejorada con manejo de datos incompletos y modo offline
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

  // Datos de ejemplo para fallback
  const callesFallback: Calle[] = [
    { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
    { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
    { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
    { id: 4, tipoVia: 'avenida', nombre: 'España' },
    { id: 5, tipoVia: 'calle', nombre: 'San Martín' },
  ];

  // Cargar calles desde la API o fallback
  const cargarCalles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carga de calles...');
      
      // Intentar cargar desde la API
      try {
        console.log('🌐 Intentando cargar desde API...');
        const callsFromApi = await CalleApiService.getAll();
        
        // Verificar si los datos recibidos son válidos
        if (Array.isArray(callsFromApi) && callsFromApi.length > 0) {
          console.log('✅ Datos recibidos de API:', callsFromApi);
          
          // Normalizar los datos para asegurar una estructura consistente
          const callesNormalizadas = callsFromApi.map((calle, index) => {
            // Si calle es undefined o no es un objeto, crear un objeto válido
            if (!calle || typeof calle !== 'object') {
              console.warn(`⚠️ Calle inválida en índice ${index}:`, calle);
              return {
                id: 1000 + index,
                tipoVia: 'calle',
                nombre: `Calle ${index + 1}`
              };
            }
            
            // Si tiene propiedades mínimas pero le falta alguna, completarla
            return {
              id: calle.id || 1000 + index,
              tipoVia: calle.tipoVia || 'calle',
              nombre: calle.nombre || `Calle sin nombre ${index + 1}`
            };
          });
          
          setCalles(callesNormalizadas);
          setIsOfflineMode(false);
          
          // Actualizar caché local
          localStorage.setItem('calles_cache', JSON.stringify(callesNormalizadas));
          
          console.log('✅ Calles cargadas y normalizadas correctamente');
        } else {
          // Los datos no son un array o está vacío
          console.warn('⚠️ Datos inválidos recibidos de la API:', callsFromApi);
          throw new Error('Formato de datos inválido desde la API');
        }
      } catch (apiError) {
        console.error('❌ Error al cargar desde API:', apiError);
        
        // Intentar usar datos de caché local
        const callesCache = localStorage.getItem('calles_cache');
        if (callesCache) {
          console.log('📦 Usando caché local');
          try {
            const callesCacheData = JSON.parse(callesCache);
            if (Array.isArray(callesCacheData) && callesCacheData.length > 0) {
              setCalles(callesCacheData);
            } else {
              // La caché está vacía o no es un array
              console.warn('⚠️ Caché local inválida, usando datos fallback');
              setCalles(callesFallback);
            }
          } catch (cacheError) {
            console.error('❌ Error al parsear caché:', cacheError);
            // Si hay error en la caché, usar datos fallback
            setCalles(callesFallback);
          }
        } else {
          // No hay caché, usar datos fallback
          console.log('📦 No hay caché, usando datos fallback');
          setCalles(callesFallback);
        }
        
        setIsOfflineMode(true);
      }
    } catch (err: any) {
      console.error('❌ Error general en cargarCalles:', err);
      setError(err.message || 'Error al cargar las calles');
      
      // En caso de error, asegurar que tengamos al menos datos fallback
      setCalles(callesFallback);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar calles (versión mejorada)
  const buscarCalles = useCallback(async (term: string) => {
    setSearchTerm(term);
    setLoading(true);
    
    try {
      if (!term.trim()) {
        // Si el término está vacío, cargar todas las calles
        await cargarCalles();
        return;
      }
      
      console.log(`🔍 Buscando calles con término: "${term}"`);
      
      // Si estamos en modo offline, hacer búsqueda local
      if (isOfflineMode) {
        console.log('🔍 Realizando búsqueda local (modo offline)');
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
          console.log('🔍 Realizando búsqueda en API');
          const results = await CalleApiService.search(term);
          
          // Normalizar los resultados
          const callesNormalizadas = results.map((calle, index) => ({
            id: calle.id || 2000 + index,
            tipoVia: calle.tipoVia || 'calle',
            nombre: calle.nombre || `Resultado ${index + 1}`
          }));
          
          setCalles(callesNormalizadas);
        } catch (searchError) {
          console.error('❌ Error en búsqueda API, fallback a búsqueda local:', searchError);
          
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

  // Resto de la lógica de hook (seleccionarCalle, guardarCalle, etc.)
  // ...

  // Monitorear cambios en la conectividad
  useEffect(() => {
    return connectivityService.addListener((status) => {
      setIsOfflineMode(!status);
      if (status) {
        // Si recuperamos la conexión, intentar cargar datos frescos
        cargarCalles();
      }
    });
  }, [cargarCalles]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarCalles();
  }, [cargarCalles]);

  return {
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    pendingChangesCount: 0, // Simplificado
    cargarCalles,
    buscarCalles,
    // ...resto de retornos
  };
};

export default useCalles;