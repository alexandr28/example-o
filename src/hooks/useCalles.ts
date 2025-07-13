// src/hooks/useCalles.ts
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { 
  CalleData, 
  CreateCalleDTO, 
  UpdateCalleDTO
} from '../services/calleApiService';
import { SectorData } from '../services/sectorService';
import { BarrioData } from '../services/barrioService';
import { TipoViaData } from '../services/viaService';
import calleService from '../services/calleApiService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';
import tipoViaService from '../services/viaService';

export const useCalles = () => {
  // Estados adicionales
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [barrios, setBarrios] = useState<BarrioData[]>([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState<BarrioData[]>([]);
  const [tiposVia, setTiposVia] = useState<TipoViaData[]>([]);
  const [loadingSectores, setLoadingSectores] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);
  const [loadingTiposVia, setLoadingTiposVia] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Hook genérico para CRUD
  const [state, actions] = useCrudEntity<CalleData, CreateCalleDTO, UpdateCalleDTO>(
    calleService,
    {
      entityName: 'Calle',
      loadOnMount: true,
      useCache: true,
      searchDebounce: 300,
      sortFunction: (a, b) => {
        // Ordenar por nombre de vía y luego por nombre
        const viaComparison = (a.nombreVia || '').localeCompare(b.nombreVia || '');
        if (viaComparison !== 0) return viaComparison;
        return a.nombre.localeCompare(b.nombre);
      },
      localFilter: (items, filter) => {
        let filtered = items;
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(item => 
            item.nombre.toLowerCase().includes(searchLower) ||
            item.nombreVia?.toLowerCase().includes(searchLower) ||
            item.nombreCompleto?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.codigoVia) {
          filtered = filtered.filter(item => 
            item.codigoVia === filter.codigoVia
          );
        }
        
        if (filter.codigoBarrio) {
          filtered = filtered.filter(item => 
            item.codigoBarrio === filter.codigoBarrio
          );
        }
        
        return filtered;
      }
    }
  );

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      const data = await sectorService.getAll();
      setSectores(data);
    } catch (error) {
      console.error('Error cargando sectores:', error);
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Cargar barrios
  const cargarBarrios = useCallback(async () => {
    try {
      setLoadingBarrios(true);
      const data = await barrioService.getAll();
      setBarrios(data);
      setBarriosFiltrados(data);
    } catch (error) {
      console.error('Error cargando barrios:', error);
    } finally {
      setLoadingBarrios(false);
    }
  }, []);

  // Cargar tipos de vía
  const cargarTiposVia = useCallback(async () => {
    try {
      setLoadingTiposVia(true);
      const data = await tipoViaService.getAll();
      setTiposVia(data);
    } catch (error) {
      console.error('Error cargando tipos de vía:', error);
    } finally {
      setLoadingTiposVia(false);
    }
  }, []);

  // Cargar todas las dependencias
  const cargarDependencias = useCallback(async () => {
    await Promise.all([
      cargarSectores(),
      cargarBarrios(),
      cargarTiposVia()
    ]);
  }, [cargarSectores, cargarBarrios, cargarTiposVia]);

  // Cargar dependencias al montar
  useEffect(() => {
    cargarDependencias();
  }, [cargarDependencias]);

  // Filtrar barrios por sector
  const filtrarBarriosPorSector = useCallback((codigoSector: number) => {
    if (!codigoSector || codigoSector === 0) {
      setBarriosFiltrados(barrios);
    } else {
      const barriosFiltrados = barrios.filter(b => b.codigoSector === codigoSector);
      setBarriosFiltrados(barriosFiltrados);
    }
  }, [barrios]);

  // Helpers para obtener nombres
  const obtenerNombreSector = useCallback((codigoSector: number): string => {
    const sector = sectores.find(s => s.codigo === codigoSector);
    return sector?.nombre || 'Sin sector';
  }, [sectores]);

  const obtenerNombreBarrio = useCallback((codigoBarrio: number): string => {
    const barrio = barrios.find(b => b.codigo === codigoBarrio);
    return barrio?.nombre || 'Sin barrio';
  }, [barrios]);

  const obtenerNombreTipoVia = useCallback((codigoVia: number): string => {
    const tipoVia = tiposVia.find(v => v.codigo === codigoVia);
    return tipoVia?.nombre || 'Sin tipo';
  }, [tiposVia]);

  // Buscar por tipo de vía
  const buscarPorTipoVia = useCallback((codigoVia: number) => {
    actions.setFilters({ codigoVia });
  }, [actions]);

  // Buscar por barrio
  const buscarPorBarrio = useCallback((codigoBarrio: number) => {
    actions.setFilters({ codigoBarrio });
  }, [actions]);

  // Buscar por sector
  const buscarPorSector = useCallback((codigoSector: number) => {
    actions.setFilters({ codigoSector });
    filtrarBarriosPorSector(codigoSector);
  }, [actions, filtrarBarriosPorSector]);

  // Crear calle con validación
  const crearCalle = useCallback(async (data: CreateCalleDTO) => {
    // Validar que el barrio existe
    const barrioExiste = barrios.some(b => b.codigo === data.codigoBarrio);
    if (!barrioExiste && data.codigoBarrio > 0) {
      throw new Error('El barrio seleccionado no existe');
    }
    
    return actions.createItem(data);
  }, [actions, barrios]);

  // Función para guardar (crear o actualizar)
  const guardarCalle = useCallback(async (data: CreateCalleDTO | UpdateCalleDTO) => {
    if (state.selectedItem && modoEdicion) {
      // Actualizar
      return actions.updateItem(state.selectedItem.codigo, data as UpdateCalleDTO);
    } else {
      // Crear
      return crearCalle(data as CreateCalleDTO);
    }
  }, [state.selectedItem, modoEdicion, actions, crearCalle]);

  return {
    // Estado
    calles: state.items,
    calleSeleccionada: state.selectedItem,
    loading: state.loading,
    error: state.error,
    page: state.page,
    pageSize: state.pageSize,
    totalItems: state.totalItems,
    totalPages: state.totalPages,
    searchTerm: state.searchTerm,
    isOffline: state.isOffline,
    modoEdicion,
    
    // Dependencias
    sectores,
    barrios,
    barriosFiltrados,
    tiposVia,
    loadingSectores,
    loadingBarrios,
    loadingTiposVia,
    
    // Acciones CRUD
    cargarCalles: actions.loadItems,
    crearCalle,
    actualizarCalle: actions.updateItem,
    eliminarCalle: actions.deleteItem,
    seleccionarCalle: actions.selectItem,
    buscarCalles: actions.search,
    limpiarSeleccion: actions.clearSelection,
    guardarCalle,
    setModoEdicion,
    
    // Paginación
    setPagina: actions.setPage,
    setTamañoPagina: actions.setPageSize,
    siguientePagina: actions.nextPage,
    paginaAnterior: actions.previousPage,
    
    // Acciones adicionales
    buscarPorTipoVia,
    buscarPorBarrio,
    buscarPorSector,
    filtrarBarriosPorSector,
    cargarDependencias,
    cargarSectores,
    cargarBarrios,
    cargarTiposVia,
    obtenerNombreSector,
    obtenerNombreBarrio,
    obtenerNombreTipoVia,
    refrescar: actions.refresh,
    limpiarError: actions.clearError,
    resetear: actions.reset
  };
};