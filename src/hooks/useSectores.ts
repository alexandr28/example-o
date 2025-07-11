// src/hooks/useCalles.ts
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { 
  CalleData, 
  CreateCalleDTO, 
  UpdateCalleDTO,
  TIPOS_VIA 
} from '../services/calleApiService';
import { SectorData } from '../services/sectorService';
import { BarrioData } from '../services/barrioService';
import calleService from '../services/calleApiService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';

export const useCalles = () => {
  // Estados adicionales
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [barrios, setBarrios] = useState<BarrioData[]>([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState<BarrioData[]>([]);
  const [loadingDependencias, setLoadingDependencias] = useState(false);

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
          filtered = filtered.filter(item => item.codigoVia === filter.codigoVia);
        }
        
        if (filter.codigoBarrio) {
          filtered = filtered.filter(item => item.codigoBarrio === filter.codigoBarrio);
        }
        
        if (filter.codigoSector) {
          // Filtrar por sector a través de los barrios
          const barriosDelSector = barrios
            .filter(b => b.codigoSector === filter.codigoSector)
            .map(b => b.codigo);
          filtered = filtered.filter(item => 
            barriosDelSector.includes(item.codigoBarrio)
          );
        }
        
        return filtered;
      }
    }
  );

  // Cargar dependencias (sectores y barrios)
  const cargarDependencias = useCallback(async () => {
    try {
      setLoadingDependencias(true);
      const [sectoresData, barriosData] = await Promise.all([
        sectorService.getAll(),
        barrioService.getAll()
      ]);
      setSectores(sectoresData);
      setBarrios(barriosData);
      setBarriosFiltrados(barriosData);
    } catch (error) {
      console.error('Error cargando dependencias:', error);
    } finally {
      setLoadingDependencias(false);
    }
  }, []);

  // Filtrar barrios por sector
  const filtrarBarriosPorSector = useCallback((codigoSector: number | null) => {
    if (!codigoSector) {
      setBarriosFiltrados(barrios);
    } else {
      const filtrados = barrios.filter(b => b.codigoSector === codigoSector);
      setBarriosFiltrados(filtrados);
    }
  }, [barrios]);

  // Cargar dependencias al montar
  useEffect(() => {
    cargarDependencias();
  }, [cargarDependencias]);

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
    if (!barrioExiste) {
      throw new Error('El barrio seleccionado no existe');
    }
    
    return actions.createItem(data);
  }, [actions, barrios]);

  // Obtener los tipos de vía disponibles
  const tiposVia = Object.values(TIPOS_VIA);

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
    
    // Dependencias
    sectores,
    barrios,
    barriosFiltrados,
    loadingDependencias,
    tiposVia,
    
    // Acciones CRUD
    cargarCalles: actions.loadItems,
    crearCalle,
    actualizarCalle: actions.updateItem,
    eliminarCalle: actions.deleteItem,
    seleccionarCalle: actions.selectItem,
    buscarCalles: actions.search,
    limpiarSeleccion: actions.clearSelection,
    
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
    refrescar: actions.refresh,
    limpiarError: actions.clearError,
    resetear: actions.reset
  };
};