// src/hooks/generic/useCrudEntity.ts
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

  // Cargar datos
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 [${entityName}] Cargando datos...`);
      
      try {
        const data = await service.getAll();
        
        if (validateData && !validateData(data)) {
          throw new Error('Datos inválidos recibidos de la API');
        }
        
        setItems(data);
        setIsOfflineMode(false);
        setLastSyncTime(new Date());
        
        // Guardar en caché
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log(`✅ [${entityName}] ${data.length} elementos cargados`);
        
      } catch (apiError: any) {
        console.error(`❌ [${entityName}] Error al cargar desde API:`, apiError);
        
        // Intentar cargar desde caché
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          setItems(cachedData);
          setIsOfflineMode(true);
          console.log(`📦 [${entityName}] Datos cargados desde caché`);
        } else {
          throw apiError;
        }
      }
    } catch (err: any) {
      setError(err.message || `Error al cargar ${entityName}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entityName, service, cacheKey, validateData]);

  // Buscar elementos
  const searchItems = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      await loadItems();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (service.search && !isOfflineMode) {
        const results = await service.search(term);
        setItems(results);
      } else {
        // Búsqueda local
        const termLower = term.toLowerCase();
        const allItems = await service.getAll();
        const filtered = allItems.filter(item => 
          JSON.stringify(item).toLowerCase().includes(termLower)
        );
        setItems(filtered);
      }
    } catch (error: any) {
      console.error(`❌ [${entityName}] Error al buscar:`, error);
      setError(`Error al buscar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [entityName, service, isOfflineMode, loadItems]);

  // Seleccionar elemento
  const selectItem = useCallback((item: T) => {
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

  // Guardar elemento
  const saveItem = useCallback(async (data: F): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`💾 [${entityName}] Guardando:`, data);
      
      let result: T;
      
      if (isEditMode && selectedItem) {
        const id = getItemId(selectedItem);
        if (id === undefined) throw new Error('ID no válido');
        
        console.log(`📝 [${entityName}] Actualizando ID ${id}`);
        result = await service.update(id, data);
        
        setItems(prev => prev.map(item => 
          getItemId(item) === id ? result : item
        ));
      } else {
        console.log(`➕ [${entityName}] Creando nuevo`);
        result = await service.create(data);
        setItems(prev => [...prev, result]);
      }
      
      clearSelection();
      setLastSyncTime(new Date());
      
      // Actualizar caché
      const updatedItems = isEditMode && selectedItem
        ? items.map(item => getItemId(item) === getItemId(selectedItem) ? result : item)
        : [...items, result];
      
      localStorage.setItem(cacheKey, JSON.stringify(updatedItems));
      
      console.log(`✅ [${entityName}] Guardado exitosamente`);
      return result;
      
    } catch (err: any) {
      console.error(`❌ [${entityName}] Error al guardar:`, err);
      setError(err.message || `Error al guardar ${entityName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityName, isEditMode, selectedItem, service, getItemId, items, cacheKey, clearSelection]);

  // Eliminar elemento
  const deleteItem = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ [${entityName}] Eliminando ID:`, id);
      
      await service.delete(id);
      
      setItems(prev => prev.filter(item => getItemId(item) !== id));
      
      if (selectedItem && getItemId(selectedItem) === id) {
        clearSelection();
      }
      
      // Actualizar caché
      const updatedItems = items.filter(item => getItemId(item) !== id);
      localStorage.setItem(cacheKey, JSON.stringify(updatedItems));
      
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
    setSearchTerm('');
    await loadItems();
  }, [loadItems]);

  // Cargar datos al montar
  useEffect(() => {
    loadItems();
  }, [loadItems]);

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