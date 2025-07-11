// src/hooks/useAranceles.ts
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { 
  ArancelData, 
  CreateArancelDTO, 
  UpdateArancelDTO,
  UNIDADES_MEDIDA,
  CATEGORIAS_ARANCEL
} from '../services/arancelService';
import arancelService from '../services/arancelService';

// Extender el tipo ArancelData para incluir un codigo numérico opcional
interface ArancelDataExtended extends ArancelData {
  codigo: string;
  id: number;
}

export const useAranceles = () => {
  // Estados adicionales para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalActivos: 0,
    totalInactivos: 0,
    porCategoria: {} as Record<string, number>,
    costoPromedio: 0
  });

  // Usar any para evitar conflictos de tipo, pero mantener la funcionalidad
  const [state, actions] = useCrudEntity<any, CreateArancelDTO, UpdateArancelDTO>(
    arancelService as any,
    {
      entityName: 'Arancel',
      loadOnMount: true,
      useCache: true,
      searchDebounce: 300,
      sortFunction: (a, b) => {
        // Ordenar por categoría, luego por código
        const catComparison = (a.categoria || '').localeCompare(b.categoria || '');
        if (catComparison !== 0) return catComparison;
        return a.codigo.localeCompare(b.codigo);
      },
      localFilter: (items, filter) => {
        let filtered = items;
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter((item: ArancelData) => 
            item.codigo.toLowerCase().includes(searchLower) ||
            item.descripcion.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.categoria) {
          filtered = filtered.filter((item: ArancelData) => item.categoria === filter.categoria);
        }
        
        if (filter.subcategoria) {
          filtered = filtered.filter((item: ArancelData) => item.subcategoria === filter.subcategoria);
        }
        
        if (filter.unidadMedida) {
          filtered = filtered.filter((item: ArancelData) => item.unidadMedida === filter.unidadMedida);
        }
        
        if (filter.estado) {
          filtered = filtered.filter((item: ArancelData) => item.estado === filter.estado);
        }
        
        if (filter.vigente !== undefined) {
          const ahora = new Date().toISOString();
          filtered = filtered.filter((item: ArancelData) => {
            const vigenciaOk = (!item.vigenciaDesde || item.vigenciaDesde <= ahora) &&
                             (!item.vigenciaHasta || item.vigenciaHasta >= ahora);
            return filter.vigente ? vigenciaOk : !vigenciaOk;
          });
        }
        
        return filtered;
      }
    }
  );

  // Tipar correctamente los datos
  const aranceles: ArancelData[] = state.items;
  const arancelSeleccionado: ArancelData | null = state.selectedItem;

  // Calcular estadísticas cuando cambian los items
  useEffect(() => {
    const activos = aranceles.filter(item => item.estado === 'ACTIVO');
    const inactivos = aranceles.filter(item => item.estado === 'INACTIVO');
    
    const porCategoria = aranceles.reduce((acc, item) => {
      const cat = item.categoria || 'SIN CATEGORÍA';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const costoTotal = aranceles.reduce((sum, item) => sum + item.costoUnitario, 0);
    const costoPromedio = aranceles.length > 0 ? costoTotal / aranceles.length : 0;
    
    setEstadisticas({
      totalActivos: activos.length,
      totalInactivos: inactivos.length,
      porCategoria,
      costoPromedio
    });
  }, [aranceles]);

  // Buscar por categoría
  const buscarPorCategoria = useCallback((categoria: string) => {
    actions.setFilters({ categoria });
  }, [actions]);

  // Buscar por unidad de medida
  const buscarPorUnidadMedida = useCallback((unidadMedida: string) => {
    actions.setFilters({ unidadMedida });
  }, [actions]);

  // Buscar solo vigentes
  const buscarVigentes = useCallback(() => {
    actions.setFilters({ vigente: true });
  }, [actions]);

  // Crear arancel con validaciones
  const crearArancel = useCallback(async (data: CreateArancelDTO) => {
    // Validar código único
    const existe = aranceles.some(item => 
      item.codigo === data.codigo && item.estado === 'ACTIVO'
    );
    
    if (existe) {
      throw new Error(`Ya existe un arancel activo con el código ${data.codigo}`);
    }
    
    // Validar costo
    if (data.costoUnitario < 0) {
      throw new Error('El costo unitario no puede ser negativo');
    }
    
    const result = await actions.createItem(data);
    return result as ArancelData | null;
  }, [actions, aranceles]);

  // Actualizar arancel
  const actualizarArancel = useCallback(async (id: string | number, data: UpdateArancelDTO) => {
    const result = await actions.updateItem(id, data);
    return result as ArancelData | null;
  }, [actions]);

  // Duplicar arancel
  const duplicarArancel = useCallback(async (id: number, nuevoCodigo: string) => {
    const original = aranceles.find(item => item.id === id);
    if (!original) {
      throw new Error('Arancel no encontrado');
    }
    
    const nuevoArancel: CreateArancelDTO = {
      codigo: nuevoCodigo,
      descripcion: `${original.descripcion} (COPIA)`,
      unidadMedida: original.unidadMedida,
      costoUnitario: original.costoUnitario,
      categoria: original.categoria,
      subcategoria: original.subcategoria,
      vigenciaDesde: new Date().toISOString()
    };
    
    return crearArancel(nuevoArancel);
  }, [aranceles, crearArancel]);

  // Seleccionar arancel tipado
  const seleccionarArancel = useCallback((arancel: ArancelData | null) => {
    actions.selectItem(arancel);
  }, [actions]);

  return {
    // Estado
    aranceles,
    arancelSeleccionado,
    loading: state.loading,
    error: state.error,
    page: state.page,
    pageSize: state.pageSize,
    totalItems: state.totalItems,
    totalPages: state.totalPages,
    searchTerm: state.searchTerm,
    isOffline: state.isOffline,
    
    // Estados de operaciones
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    
    // Datos adicionales
    estadisticas,
    unidadesMedida: Object.values(UNIDADES_MEDIDA),
    categorias: Object.values(CATEGORIAS_ARANCEL),
    
    // Acciones CRUD
    cargarAranceles: actions.loadItems,
    crearArancel,
    actualizarArancel,
    eliminarArancel: actions.deleteItem,
    seleccionarArancel,
    buscarAranceles: actions.search,
    limpiarSeleccion: actions.clearSelection,
    
    // Acciones específicas
    duplicarArancel,
    buscarPorCategoria,
    buscarPorUnidadMedida,
    buscarVigentes,
    
    // Filtros
    setFiltros: actions.setFilters,
    limpiarFiltros: actions.clearFilters,
    
    // Paginación
    setPagina: actions.setPage,
    setTamañoPagina: actions.setPageSize,
    siguientePagina: actions.nextPage,
    paginaAnterior: actions.previousPage,
    
    // Utilidades
    refrescar: actions.refresh,
    limpiarError: actions.clearError,
    resetear: actions.reset
  };
};