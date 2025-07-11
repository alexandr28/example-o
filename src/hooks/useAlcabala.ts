// src/hooks/useAlcabala.ts
import { useCallback, useEffect, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import BaseApiService from '../services/BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

// Interfaces para Alcabala (sin export para evitar conflictos)
interface AlcabalaData {
  id: number;
  año: number;
  tasa: number;
  baseImponible?: number;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

interface CreateAlcabalaDTO {
  año: number;
  tasa: number;
  baseImponible?: number;
  descripcion?: string;
  codUsuario?: number;
}

interface UpdateAlcabalaDTO extends Partial<CreateAlcabalaDTO> {
  estado?: string;
}

// Servicio de Alcabala
class AlcabalaService extends BaseApiService<AlcabalaData, CreateAlcabalaDTO, UpdateAlcabalaDTO> {
  private static instance: AlcabalaService;
  
  private constructor() {
    super(
      '/api/alcabala',
      {
        normalizeItem: (item: any) => ({
          id: item.idAlcabala || item.id || 0,
          año: item.año || item.anio || new Date().getFullYear(),
          tasa: parseFloat(item.tasa || '0'),
          baseImponible: item.baseImponible ? parseFloat(item.baseImponible) : undefined,
          descripcion: item.descripcion || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: AlcabalaData) => {
          return !!item.año && item.tasa >= 0;
        }
      },
      'alcabala_cache' // Agregar el cacheKey como tercer parámetro
    );
  }
  
  static getInstance(): AlcabalaService {
    if (!AlcabalaService.instance) {
      AlcabalaService.instance = new AlcabalaService();
    }
    return AlcabalaService.instance;
  }
  
  // Métodos específicos de Alcabala
  async obtenerPorAño(año: number): Promise<AlcabalaData | null> {
    try {
      const items = await this.search({ año, estado: 'ACTIVO' });
      return items[0] || null;
    } catch (error) {
      console.error(`Error obteniendo alcabala del año ${año}:`, error);
      return null;
    }
  }
  
  async verificarExiste(año: number): Promise<boolean> {
    try {
      const item = await this.obtenerPorAño(año);
      return !!item;
    } catch (error) {
      return false;
    }
  }
}

// Instancia del servicio
const alcabalaService = AlcabalaService.getInstance();

// Hook de Alcabala
export const useAlcabala = () => {
  // Estados adicionales para el año actual
  const [añoActual] = useState(new Date().getFullYear());
  const [añosDisponibles, setAñosDisponibles] = useState<number[]>([]);

  const [state, actions] = useCrudEntity<AlcabalaData, CreateAlcabalaDTO, UpdateAlcabalaDTO>(
    alcabalaService,
    {
      entityName: 'Alcabala',
      loadOnMount: true,
      useCache: true,
      searchDebounce: 300,
      sortFunction: (a, b) => b.año - a.año, // Ordenar por año descendente
      localFilter: (items, filter) => {
        let filtered = items;
        
        if (filter.año) {
          filtered = filtered.filter(item => item.año === filter.año);
        }
        
        if (filter.estado) {
          filtered = filtered.filter(item => item.estado === filter.estado);
        }
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(item => 
            item.descripcion?.toLowerCase().includes(searchLower) ||
            item.año.toString().includes(searchLower)
          );
        }
        
        return filtered;
      }
    }
  );

  // Calcular años disponibles basado en los datos
  useEffect(() => {
    const años = [...new Set(state.items.map(item => item.año))].sort((a, b) => b - a);
    
    // Agregar años futuros si no existen
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      if (!años.includes(year)) {
        años.push(year);
      }
    }
    
    setAñosDisponibles(años.sort((a, b) => b - a));
  }, [state.items]);

  // Buscar por año
  const buscarPorAño = useCallback((año: number) => {
    actions.setFilters({ año });
  }, [actions]);

  // Obtener alcabala del año actual
  const obtenerAlcabalaActual = useCallback(() => {
    return state.items.find(item => item.año === añoActual && item.estado === 'ACTIVO');
  }, [state.items, añoActual]);

  // Crear alcabala con validaciones
  const crearAlcabala = useCallback(async (data: CreateAlcabalaDTO) => {
    // Validar que no exista alcabala para ese año
    const existe = state.items.some(item => 
      item.año === data.año && item.estado === 'ACTIVO'
    );
    
    if (existe) {
      throw new Error(`Ya existe una alcabala activa para el año ${data.año}`);
    }
    
    // Validar tasa
    if (data.tasa < 0 || data.tasa > 100) {
      throw new Error('La tasa debe estar entre 0 y 100');
    }
    
    return actions.createItem(data);
  }, [actions, state.items]);

  // Actualizar alcabala con validaciones
  const actualizarAlcabala = useCallback(async (id: string | number, data: UpdateAlcabalaDTO) => {
    // Si se está actualizando la tasa, validar
    if (data.tasa !== undefined && (data.tasa < 0 || data.tasa > 100)) {
      throw new Error('La tasa debe estar entre 0 y 100');
    }
    
    return actions.updateItem(id, data);
  }, [actions]);

  // Desactivar alcabala (cambio de estado)
  const desactivarAlcabala = useCallback(async (id: number) => {
    return actions.updateItem(id, { estado: 'INACTIVO' });
  }, [actions]);

  return {
    // Estado
    alcabalas: state.items,
    alcabalaSeleccionada: state.selectedItem,
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
    añoActual,
    añosDisponibles,
    alcabalaActual: obtenerAlcabalaActual(),
    
    // Acciones CRUD
    cargarAlcabalas: actions.loadItems,
    crearAlcabala,
    actualizarAlcabala,
    eliminarAlcabala: actions.deleteItem,
    desactivarAlcabala,
    seleccionarAlcabala: actions.selectItem,
    buscarAlcabalas: actions.search,
    limpiarSeleccion: actions.clearSelection,
    
    // Búsquedas específicas
    buscarPorAño,
    obtenerAlcabalaActual,
    
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

// Exportar tipos si otros componentes los necesitan
export type { AlcabalaData, CreateAlcabalaDTO, UpdateAlcabalaDTO };