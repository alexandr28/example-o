// src/hooks/useDirecciones.ts
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { 
  DireccionData, 
  CreateDireccionDTO, 
  UpdateDireccionDTO,
  BusquedaDireccionParams
} from '../services/direccionService';
import { SectorData } from '../services/sectorService';
import { BarrioData } from '../services/barrioService';
import { CalleData } from '../services/calleApiService';
import direccionService from '../services/direccionService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';
import calleService from '../services/calleApiService';

export const useDirecciones = () => {
  // Estados adicionales
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [barrios, setBarrios] = useState<BarrioData[]>([]);
  const [calles, setCalles] = useState<CalleData[]>([]);
  const [barriosFiltrados, setBarriosFiltrados] = useState<BarrioData[]>([]);
  const [callesFiltradas, setCallesFiltradas] = useState<CalleData[]>([]);
  const [loadingSectores, setLoadingSectores] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);
  const [loadingCalles, setLoadingCalles] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Hook genérico para CRUD
  const [state, actions] = useCrudEntity<DireccionData, CreateDireccionDTO, UpdateDireccionDTO>(
    direccionService,
    {
      entityName: 'Dirección',
      loadOnMount: true,
      useCache: true,
      searchDebounce: 300,
      sortFunction: (a, b) => {
        // Ordenar por sector, barrio y calle
        const sectorComparison = (a.nombreSector || '').localeCompare(b.nombreSector || '');
        if (sectorComparison !== 0) return sectorComparison;
        
        const barrioComparison = (a.nombreBarrio || '').localeCompare(b.nombreBarrio || '');
        if (barrioComparison !== 0) return barrioComparison;
        
        return (a.nombreCalle || '').localeCompare(b.nombreCalle || '');
      },
      localFilter: (items, filter) => {
        let filtered = items;
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(item => 
            item.direccionCompleta?.toLowerCase().includes(searchLower) ||
            item.nombreSector?.toLowerCase().includes(searchLower) ||
            item.nombreBarrio?.toLowerCase().includes(searchLower) ||
            item.nombreCalle?.toLowerCase().includes(searchLower) ||
            item.nombreVia?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.codigoSector) {
          filtered = filtered.filter(item => item.codigoSector === filter.codigoSector);
        }
        
        if (filter.codigoBarrio) {
          filtered = filtered.filter(item => item.codigoBarrio === filter.codigoBarrio);
        }
        
        if (filter.codigoCalle) {
          filtered = filtered.filter(item => item.codigoCalle === filter.codigoCalle);
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

  // Cargar calles
  const cargarCalles = useCallback(async () => {
    try {
      setLoadingCalles(true);
      const data = await calleService.getAll();
      setCalles(data);
      setCallesFiltradas(data);
    } catch (error) {
      console.error('Error cargando calles:', error);
    } finally {
      setLoadingCalles(false);
    }
  }, []);

  // Cargar todas las dependencias
  const cargarDependencias = useCallback(async () => {
    await Promise.all([
      cargarSectores(),
      cargarBarrios(),
      cargarCalles()
    ]);
  }, [cargarSectores, cargarBarrios, cargarCalles]);

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
    // Limpiar calles cuando cambia el sector
    setCallesFiltradas([]);
  }, [barrios]);

  // Filtrar calles por barrio
  const filtrarCallesPorBarrio = useCallback((codigoBarrio: number) => {
    if (!codigoBarrio || codigoBarrio === 0) {
      setCallesFiltradas(calles);
    } else {
      const callesFiltradas = calles.filter(c => c.codigoBarrio === codigoBarrio);
      setCallesFiltradas(callesFiltradas);
    }
  }, [calles]);

  // Buscar por nombre de vía
  const buscarPorNombreVia = useCallback(async (nombreVia: string) => {
    try {
      actions.setLoading(true);
      const direcciones = await direccionService.listarPorNombreVia(nombreVia);
      actions.setItems(direcciones);
    } catch (error) {
      console.error('Error buscando por nombre de vía:', error);
      actions.setError('Error al buscar direcciones');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Buscar por tipo de vía
  const buscarPorTipoVia = useCallback(async (codigoVia: number) => {
    try {
      actions.setLoading(true);
      const direcciones = await direccionService.listarPorTipoVia(codigoVia);
      actions.setItems(direcciones);
    } catch (error) {
      console.error('Error buscando por tipo de vía:', error);
      actions.setError('Error al buscar direcciones');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Buscar direcciones con criterios
  const buscarDirecciones = useCallback(async (criterios: BusquedaDireccionParams) => {
    try {
      actions.setLoading(true);
      const direcciones = await direccionService.buscarDirecciones(criterios);
      actions.setItems(direcciones);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      actions.setError('Error al buscar direcciones');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Crear dirección con validación
  const crearDireccion = useCallback(async (data: CreateDireccionDTO) => {
    // Validaciones
    if (!data.codigoSector) {
      throw new Error('Debe seleccionar un sector');
    }
    if (!data.codigoBarrio) {
      throw new Error('Debe seleccionar un barrio');
    }
    if (!data.codigoCalle) {
      throw new Error('Debe seleccionar una calle/mz');
    }
    
    return actions.createItem(data);
  }, [actions]);

  // Función para guardar (crear o actualizar)
  const guardarDireccion = useCallback(async (data: CreateDireccionDTO | UpdateDireccionDTO) => {
    if (state.selectedItem && modoEdicion) {
      // Actualizar
      return actions.updateItem(state.selectedItem.codigo, data as UpdateDireccionDTO);
    } else {
      // Crear
      return crearDireccion(data as CreateDireccionDTO);
    }
  }, [state.selectedItem, modoEdicion, actions, crearDireccion]);

  return {
    // Estado
    direcciones: state.items,
    direccionSeleccionada: state.selectedItem,
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
    calles,
    barriosFiltrados,
    callesFiltradas,
    loadingSectores,
    loadingBarrios,
    loadingCalles,
    
    // Acciones CRUD
    cargarDirecciones: actions.loadItems,
    crearDireccion,
    actualizarDireccion: actions.updateItem,
    eliminarDireccion: actions.deleteItem,
    seleccionarDireccion: actions.selectItem,
    buscarDirecciones: actions.search,
    limpiarSeleccion: actions.clearSelection,
    guardarDireccion,
    setModoEdicion,
    
    // Búsquedas específicas
    buscarPorNombreVia,
    buscarPorTipoVia,
    
    // Filtros
    filtrarBarriosPorSector,
    filtrarCallesPorBarrio,
    
    // Paginación
    setPagina: actions.setPage,
    setTamañoPagina: actions.setPageSize,
    siguientePagina: actions.nextPage,
    paginaAnterior: actions.previousPage,
    
    // Acciones adicionales
    cargarDependencias,
    cargarSectores,
    cargarBarrios,
    cargarCalles,
    refrescar: actions.refresh,
    limpiarError: actions.clearError,
    resetear: actions.reset
  };
};