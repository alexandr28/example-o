// src/hooks/useBarrios.ts
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { 
  BarrioData, 
  CreateBarrioDTO, 
  UpdateBarrioDTO 
} from '../services/barrioService';
import { SectorData } from '../services/sectorService';
import barrioService from '../services/barrioService';
import sectorService from '../services/sectorService';

export const useBarrios = () => {
  // Estados adicionales específicos de barrios
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [loadingSectores, setLoadingSectores] = useState(false);

  // Usar el hook genérico actualizado
  const [state, actions] = useCrudEntity<BarrioData, CreateBarrioDTO, UpdateBarrioDTO>(
    barrioService,
    {
      entityName: 'Barrio',
      loadOnMount: true,
      useCache: true,
      searchDebounce: 300,
      sortFunction: (a, b) => a.nombre.localeCompare(b.nombre),
      localFilter: (items, filter) => {
        let filtered = items;
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(item => 
            item.nombre.toLowerCase().includes(searchLower) ||
            item.nombreSector?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.codigoSector) {
          filtered = filtered.filter(item => 
            item.codigoSector === filter.codigoSector
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

  // Cargar sectores al montar
  useEffect(() => {
    cargarSectores();
  }, [cargarSectores]);

  // Función helper para buscar por sector
  const buscarPorSector = useCallback((codigoSector: number) => {
    actions.setFilters({ codigoSector });
  }, [actions]);

  // Función helper para crear barrio con validación
  const crearBarrio = useCallback(async (data: CreateBarrioDTO) => {
    // Validar que el sector existe
    const sectorExiste = sectores.some(s => s.codigo === data.codigoSector);
    if (!sectorExiste) {
      throw new Error('El sector seleccionado no existe');
    }
    
    return actions.createItem(data);
  }, [actions, sectores]);

  return {
    // Estado del hook genérico
    barrios: state.items,
    barrioSeleccionado: state.selectedItem,
    loading: state.loading,
    error: state.error,
    page: state.page,
    pageSize: state.pageSize,
    totalItems: state.totalItems,
    totalPages: state.totalPages,
    searchTerm: state.searchTerm,
    isOffline: state.isOffline,
    
    // Estados adicionales
    sectores,
    loadingSectores,
    
    // Acciones del hook genérico
    cargarBarrios: actions.loadItems,
    crearBarrio,
    actualizarBarrio: actions.updateItem,
    eliminarBarrio: actions.deleteItem,
    seleccionarBarrio: actions.selectItem,
    buscarBarrios: actions.search,
    limpiarSeleccion: actions.clearSelection,
    
    // Acciones de paginación
    setPagina: actions.setPage,
    setTamañoPagina: actions.setPageSize,
    siguientePagina: actions.nextPage,
    paginaAnterior: actions.previousPage,
    
    // Acciones adicionales
    buscarPorSector,
    cargarSectores,
    refrescar: actions.refresh,
    limpiarError: actions.clearError,
    resetear: actions.reset
  };
};