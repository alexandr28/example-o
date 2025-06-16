// src/hooks/useCrudEntity.ts - CORREGIDO PARA MANEJAR VALORES NULL
import { useState, useCallback, useEffect } from 'react';

interface CrudService<T, F> {
  getAll: () => Promise<T[]>;
  getById: (id: number) => Promise<T>;
  create: (data: F) => Promise<T>;
  update: (id: number, data: F) => Promise<T>;
  delete: (id: number) => Promise<void>;
  search?: (term: string) => Promise<T[]>;
}

interface CrudOptions<T, F> {
  entityName: string;
  service: CrudService<T, F>;
  cacheKey: string;
  getItemId: (item: T) => number | undefined;
  validateData?: (data: T[]) => boolean;
}

export function useCrudEntity<T, F>({
  entityName,
  service,
  cacheKey,
  getItemId,
  validateData
}: CrudOptions<T, F>) {
  // Estados comunes
  const [items, setItems] = useState<T[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // 🔥 CARGAR DATOS CON MEJOR MANEJO DE ERRORES
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 [${entityName}] Cargando datos...`);
      
      try {
        const data = await service.getAll();
        
        // 🔥 VALIDACIÓN MEJORADA DE DATOS
        if (!Array.isArray(data)) {
          console.warn(`⚠️ [${entityName}] Los datos recibidos no son un array:`, data);
          throw new Error('Los datos recibidos no son válidos');
        }
        
        if (validateData && !validateData(data)) {
          console.warn(`⚠️ [${entityName}] Los datos no pasaron la validación`);
          throw new Error('Los datos recibidos no son válidos');
        }
        
        setItems(data);
        setIsOfflineMode(false);
        setLastSyncTime(new Date());
        
        // Guardar en caché de forma segura
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (cacheError) {
          console.warn(`⚠️ [${entityName}] Error al guardar en caché:`, cacheError);
        }
        
        console.log(`✅ [${entityName}] ${data.length} elementos cargados`);
        
      } catch (apiError: any) {
        console.error(`❌ [${entityName}] Error al cargar desde API:`, apiError);
        
        // 🔥 INTENTAR CARGAR DESDE CACHÉ CON MEJOR MANEJO
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached && cached !== 'null' && cached !== 'undefined') {
            const cachedData = JSON.parse(cached);
            
            if (Array.isArray(cachedData)) {
              setItems(cachedData);
              setIsOfflineMode(true);
              console.log(`📦 [${entityName}] ${cachedData.length} elementos cargados desde caché`);
            } else {
              throw new Error('Datos de caché no válidos');
            }
          } else {
            throw new Error('No hay datos en caché');
          }
        } catch (cacheError) {
          console.error(`❌ [${entityName}] Error al cargar desde caché:`, cacheError);
          setItems([]);
          setIsOfflineMode(true);
          throw apiError;
        }
      }
    } catch (err: any) {
      console.error(`❌ [${entityName}] Error general:`, err);
      setError(err.message || `Error al cargar ${entityName}`);
      
      // 🔥 NO LIMPIAR ITEMS SI YA TENEMOS DATOS
      if (items.length === 0) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [entityName, service, cacheKey, validateData, items.length]);

  // 🔥 BUSCAR ELEMENTOS CON MEJOR MANEJO
  const searchItems = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (!term || !term.trim()) {
      console.log(`🔍 [${entityName}] Término de búsqueda vacío, recargando todos los elementos`);
      await loadItems();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 [${entityName}] Buscando: "${term}"`);
      
      if (service.search && !isOfflineMode) {
        try {
          const results = await service.search(term);
          if (Array.isArray(results)) {
            setItems(results);
            console.log(`✅ [${entityName}] ${results.length} resultados encontrados`);
          } else {
            throw new Error('Resultados de búsqueda no válidos');
          }
        } catch (searchError) {
          console.warn(`⚠️ [${entityName}] Error en búsqueda API, usando búsqueda local`);
          // Fallback a búsqueda local
          const allItems = await service.getAll();
          const termLower = term.toLowerCase();
          const filtered = allItems.filter(item => {
            try {
              return JSON.stringify(item).toLowerCase().includes(termLower);
            } catch {
              return false;
            }
          });
          setItems(filtered);
        }
      } else {
        // Búsqueda local
        console.log(`🔍 [${entityName}] Realizando búsqueda local`);
        const termLower = term.toLowerCase();
        
        // Si no tenemos items, cargar primero
        let searchItems = items;
        if (searchItems.length === 0) {
          try {
            searchItems = await service.getAll();
          } catch {
            console.warn(`⚠️ [${entityName}] No se pudieron cargar elementos para búsqueda`);
            return;
          }
        }
        
        const filtered = searchItems.filter(item => {
          try {
            return JSON.stringify(item).toLowerCase().includes(termLower);
          } catch {
            return false;
          }
        });
        
        setItems(filtered);
        console.log(`✅ [${entityName}] ${filtered.length} elementos filtrados localmente`);
      }
    } catch (error: any) {
      console.error(`❌ [${entityName}] Error al buscar:`, error);
      setError(`Error al buscar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [entityName, service, isOfflineMode, loadItems, items]);

  // 🔥 SELECCIONAR ELEMENTO CON VALIDACIÓN
  const selectItem = useCallback((item: T) => {
    if (!item) {
      console.warn(`⚠️ [${entityName}] Intento de seleccionar elemento null/undefined`);
      return;
    }
    
    console.log(`🎯 [${entityName}] Elemento seleccionado:`, item);
    setSelectedItem(item);
    setIsEditMode(true);
  }, [entityName]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    console.log(`🧹 [${entityName}] Limpiando selección`);
    setSelectedItem(null);
    setIsEditMode(false);
  }, [entityName]);

  // 🔥 GUARDAR ELEMENTO CON MEJOR MANEJO
  const saveItem = useCallback(async (data: F): Promise<T | null> => {
    if (!data) {
      console.error(`❌ [${entityName}] No se pueden guardar datos null/undefined`);
      throw new Error('Datos no válidos para guardar');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`💾 [${entityName}] Guardando:`, data);
      
      let result: T;
      
      if (isEditMode && selectedItem) {
        const id = getItemId(selectedItem);
        if (id === undefined || id === null) {
          throw new Error('ID no válido para actualizar');
        }
        
        console.log(`📝 [${entityName}] Actualizando ID ${id}`);
        result = await service.update(id, data);
        
        // Actualizar en la lista
        setItems(prev => prev.map(item => 
          getItemId(item) === id ? result : item
        ));
      } else {
        console.log(`➕ [${entityName}] Creando nuevo`);
        result = await service.create(data);
        
        // Añadir a la lista
        setItems(prev => [...prev, result]);
      }
      
      clearSelection();
      setLastSyncTime(new Date());
      
      // 🔥 ACTUALIZAR CACHÉ DE FORMA SEGURA
      try {
        const currentItems = await service.getAll();
        localStorage.setItem(cacheKey, JSON.stringify(currentItems));
      } catch (cacheError) {
        console.warn(`⚠️ [${entityName}] Error al actualizar caché:`, cacheError);
      }
      
      console.log(`✅ [${entityName}] Guardado exitosamente`);
      return result;
      
    } catch (err: any) {
      console.error(`❌ [${entityName}] Error al guardar:`, err);
      setError(err.message || `Error al guardar ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, isEditMode, selectedItem, service, getItemId, cacheKey, clearSelection]);

  // 🔥 ELIMINAR ELEMENTO CON VALIDACIÓN
  const deleteItem = useCallback(async (id: number) => {
    if (!id || isNaN(id)) {
      console.error(`❌ [${entityName}] ID no válido para eliminar:`, id);
      throw new Error('ID no válido para eliminar');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ [${entityName}] Eliminando ID:`, id);
      
      await service.delete(id);
      
      // Remover de la lista
      setItems(prev => prev.filter(item => getItemId(item) !== id));
      
      // Limpiar selección si es el elemento eliminado
      if (selectedItem && getItemId(selectedItem) === id) {
        clearSelection();
      }
      
      // 🔥 ACTUALIZAR CACHÉ
      try {
        const updatedItems = items.filter(item => getItemId(item) !== id);
        localStorage.setItem(cacheKey, JSON.stringify(updatedItems));
      } catch (cacheError) {
        console.warn(`⚠️ [${entityName}] Error al actualizar caché después de eliminar:`, cacheError);
      }
      
      console.log(`✅ [${entityName}] Eliminado exitosamente`);
      
    } catch (err: any) {
      console.error(`❌ [${entityName}] Error al eliminar:`, err);
      setError(err.message || `Error al eliminar ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, service, items, selectedItem, getItemId, cacheKey, clearSelection]);

  // Recargar datos
  const refreshItems = useCallback(async () => {
    console.log(`🔄 [${entityName}] Refrescando datos...`);
    setSearchTerm('');
    await loadItems();
  }, [entityName, loadItems]);

  // 🔥 CARGAR DATOS INICIALES SOLO UNA VEZ
  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      if (mounted && items.length === 0 && !loading && !error) {
        console.log(`🚀 [${entityName}] Carga inicial de datos`);
        await loadItems();
      }
    };
    
    loadInitialData();
    
    return () => {
      mounted = false;
    };
  }, []); // Solo ejecutar una vez al montar

  return {
    // Estados
    items,
    selectedItem,
    isEditMode,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Funciones
    loadItems,
    searchItems,
    selectItem,
    clearSelection,
    saveItem,
    deleteItem,
    setIsEditMode,
    refreshItems,
    setError
  };
}