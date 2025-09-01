// src/hooks/useCrudEntity.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import BaseApiService from '../services/BaseApiService';

/**
 * Opciones para el hook CRUD
 */
export interface UseCrudEntityOptions<T> {
  // Nombre de la entidad para mensajes
  entityName: string;
  // Si debe cargar datos al montar el componente
  loadOnMount?: boolean;
  // Función para filtrar resultados localmente
  localFilter?: (items: T[], filter: any) => T[];
  // Función para ordenar resultados
  sortFunction?: (a: T, b: T) => number;
  // Si debe usar cache
  useCache?: boolean;
  // Tiempo de debounce para búsquedas (ms)
  searchDebounce?: number;
  // Callback después de operaciones exitosas
  onSuccess?: (operation: 'create' | 'update' | 'delete', data?: T) => void;
  // Callback para errores
  onError?: (operation: string, error: Error) => void;
}

/**
 * Estado del hook CRUD
 */
export interface CrudEntityState<T> {
  // Datos
  items: T[];
  selectedItem: T | null;
  
  // Estados de carga
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Errores
  error: string | null;
  
  // Paginación
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Búsqueda y filtros
  searchTerm: string;
  filters: Record<string, any>;
  
  // Otros estados
  isOffline: boolean;
}

/**
 * Acciones del hook CRUD
 */
export interface CrudEntityActions<T, CreateDTO, UpdateDTO> {
  // Operaciones CRUD
  loadItems: (params?: any) => Promise<void>;
  createItem: (data: CreateDTO) => Promise<T | null>;
  updateItem: (id: string | number, data: UpdateDTO) => Promise<T | null>;
  deleteItem: (id: string | number) => Promise<boolean>;
  
  // Selección
  selectItem: (item: T | null) => void;
  getItemById: (id: string | number) => Promise<T | null>;
  
  // Búsqueda y filtros
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  search: (term?: string) => Promise<void>;
  
  // Paginación
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Utilidades
  refresh: () => Promise<void>;
  clearError: () => void;
  clearSelection: () => void;
  reset: () => void;
}

/**
 * Hook genérico para operaciones CRUD
 * Funciona con cualquier servicio que extienda BaseApiService
 */
export function useCrudEntity<T extends { id?: number; codigo?: number }, CreateDTO = any, UpdateDTO = any>(
  service: BaseApiService<T, CreateDTO, UpdateDTO>,
  options: UseCrudEntityOptions<T> = { entityName: 'Item' }
): [CrudEntityState<T>, CrudEntityActions<T, CreateDTO, UpdateDTO>] {
  const {
    entityName,
    loadOnMount = true,
    localFilter,
    sortFunction,
    useCache = true,
    searchDebounce = 300,
    onSuccess,
    onError
  } = options;

  // Estados
  const [state, setState] = useState<CrudEntityState<T>>({
    items: [],
    selectedItem: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
    searchTerm: '',
    filters: {},
    isOffline: !navigator.onLine
  });

  // Referencias
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Verificar conexión
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función auxiliar para obtener el ID de un item
  const getItemId = (item: T): string | number => {
    return (item.id || item.codigo || 0) as string | number;
  };

  // Cargar items
  const loadItems = useCallback(async (params?: any) => {
    try {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setState(prev => ({ ...prev, loading: true, error: null }));

      const queryParams = {
        page: state.page,
        pageSize: state.pageSize,
        search: state.searchTerm,
        ...state.filters,
        ...params
      };

      const items = await service.getAll(queryParams, useCache);
      
      // Aplicar filtro local si existe
      let filteredItems = localFilter && (state.searchTerm || Object.keys(state.filters).length > 0)
        ? localFilter(items, { search: state.searchTerm, ...state.filters })
        : items;

      // Aplicar ordenamiento si existe
      if (sortFunction) {
        filteredItems = [...filteredItems].sort(sortFunction);
      }

      setState(prev => ({
        ...prev,
        items: filteredItems,
        totalItems: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / prev.pageSize),
        loading: false,
        error: null
      }));

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      const errorMessage = error.message || `Error al cargar ${entityName}s`;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      onError?.('load', error);
      console.error(`Error cargando ${entityName}s:`, error);
    }
  }, [service, state.page, state.pageSize, state.searchTerm, state.filters, localFilter, sortFunction, useCache, entityName, onError]);

  // Crear item
  const createItem = useCallback(async (data: CreateDTO): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, creating: true, error: null }));

      const newItem = await service.create(data);
      
      NotificationService.success(`${entityName} creado exitosamente`);
      
      // Recargar lista para mantener sincronización
      await loadItems();
      
      setState(prev => ({ ...prev, creating: false, selectedItem: newItem }));
      
      onSuccess?.('create', newItem);
      
      return newItem;

    } catch (error: any) {
      const errorMessage = error.message || `Error al crear ${entityName}`;
      setState(prev => ({ ...prev, creating: false, error: errorMessage }));
      
      NotificationService.error(errorMessage);
      onError?.('create', error);
      
      return null;
    }
  }, [service, entityName, loadItems, onSuccess, onError]);

  // Actualizar item
  const updateItem = useCallback(async (id: string | number, data: UpdateDTO): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }));

      const updatedItem = await service.update(id, data);
      
      NotificationService.success(`${entityName} actualizado exitosamente`);
      
      // Actualizar en la lista local
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          getItemId(item) === id ? updatedItem : item
        ),
        selectedItem: prev.selectedItem && getItemId(prev.selectedItem) === id 
          ? updatedItem 
          : prev.selectedItem,
        updating: false
      }));
      
      onSuccess?.('update', updatedItem);
      
      return updatedItem;

    } catch (error: any) {
      const errorMessage = error.message || `Error al actualizar ${entityName}`;
      setState(prev => ({ ...prev, updating: false, error: errorMessage }));
      
      NotificationService.error(errorMessage);
      onError?.('update', error);
      
      return null;
    }
  }, [service, entityName, onSuccess, onError]);

  // Eliminar item
  const deleteItem = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const confirmar = window.confirm(`¿Está seguro de eliminar este ${entityName}?`);
      if (!confirmar) return false;

      setState(prev => ({ ...prev, deleting: true, error: null }));

      await service.delete(id);
      
      NotificationService.success(`${entityName} eliminado exitosamente`);
      
      // Actualizar lista local
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => getItemId(item) !== id),
        selectedItem: prev.selectedItem && getItemId(prev.selectedItem) === id 
          ? null 
          : prev.selectedItem,
        deleting: false,
        totalItems: prev.totalItems - 1
      }));
      
      onSuccess?.('delete');
      
      return true;

    } catch (error: any) {
      const errorMessage = error.message || `Error al eliminar ${entityName}`;
      setState(prev => ({ ...prev, deleting: false, error: errorMessage }));
      
      NotificationService.error(errorMessage);
      onError?.('delete', error);
      
      return false;
    }
  }, [service, entityName, onSuccess, onError]);

  // Seleccionar item
  const selectItem = useCallback((item: T | null) => {
    setState(prev => ({ ...prev, selectedItem: item }));
  }, []);

  // Obtener item por ID
  const getItemById = useCallback(async (id: string | number): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const item = await service.getById(id);
      
      setState(prev => ({ ...prev, loading: false }));
      
      return item;
      
    } catch (error: any) {
      const errorMessage = error.message || `Error al obtener ${entityName}`;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      onError?.('getById', error);
      
      return null;
    }
  }, [service, entityName, onError]);

  // Establecer término de búsqueda
  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term, page: 1 }));
  }, []);

  // Establecer filtros
  const setFilters = useCallback((filters: Record<string, any>) => {
    setState(prev => ({ ...prev, filters, page: 1 }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: {}, searchTerm: '', page: 1 }));
  }, []);

  // Buscar con debounce
  const search = useCallback(async (term?: string) => {
    if (term !== undefined) {
      setSearchTerm(term);
    }

    // Cancelar búsqueda anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Aplicar debounce
    searchTimeoutRef.current = setTimeout(() => {
      loadItems();
    }, searchDebounce);
  }, [setSearchTerm, loadItems, searchDebounce]);

  // Cambiar página
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page: Math.max(1, Math.min(page, prev.totalPages)) }));
  }, []);

  // Cambiar tamaño de página
  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize: Math.max(1, pageSize), page: 1 }));
  }, []);

  // Página siguiente
  const nextPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages)
    }));
  }, []);

  // Página anterior
  const previousPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1)
    }));
  }, []);

  // Refrescar datos
  const refresh = useCallback(async () => {
    service.clearCache();
    await loadItems();
  }, [service, loadItems]);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItem: null }));
  }, []);

  // Resetear todo
  const reset = useCallback(() => {
    setState({
      items: [],
      selectedItem: null,
      loading: false,
      creating: false,
      updating: false,
      deleting: false,
      error: null,
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
      searchTerm: '',
      filters: {},
      isOffline: !navigator.onLine
    });
    service.clearCache();
  }, [service]);

  // Cargar datos al montar si está configurado
  useEffect(() => {
    if (loadOnMount) {
      loadItems();
    }
  }, []); // Solo al montar

  // Recargar cuando cambian página o filtros
  useEffect(() => {
    if (!loadOnMount) return;
    
    const timeoutId = setTimeout(() => {
      loadItems();
    }, 100); // Pequeño debounce para evitar múltiples llamadas

    return () => clearTimeout(timeoutId);
  }, [state.page, state.pageSize]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Acciones
  const actions: CrudEntityActions<T, CreateDTO, UpdateDTO> = {
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    selectItem,
    getItemById,
    setSearchTerm,
    setFilters,
    clearFilters,
    search,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    refresh,
    clearError,
    clearSelection,
    reset
  };

  return [state, actions];
}