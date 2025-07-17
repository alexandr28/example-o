// src/hooks/useDirecciones.ts - CON IMPORTS CORREGIDOS
import { useState, useCallback, useEffect, useRef } from 'react';
import { SectorData } from '../services/sectorService';
import { BarrioData } from '../services/barrioService';
import { CalleData } from '../services/calleApiService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';
import calleService from '../services/calleApiService';
import { NotificationService } from '../components/utils/Notification';

// Definir las interfaces localmente por ahora
interface DireccionData {
  id: number;
  codigo?: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  estado?: string;
}

interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
}

interface UpdateDireccionDTO extends Partial<CreateDireccionDTO> {
  estado?: string;
}

interface BusquedaDireccionParams {
  codigoSector?: number;
  codigoBarrio?: number;
  nombreVia?: string;
  parametrosBusqueda?: string;
}

/**
 * Hook personalizado para gestión de direcciones
 */
export const useDirecciones = () => {
  // Estados principales
  const [direcciones, setDirecciones] = useState<DireccionData[]>([]);
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [barrios, setBarrios] = useState<BarrioData[]>([]);
  const [calles, setCalles] = useState<CalleData[]>([]);
  
  // Estados de filtrado
  const [barriosFiltrados, setBarriosFiltrados] = useState<BarrioData[]>([]);
  const [callesFiltradas, setCallesFiltradas] = useState<CalleData[]>([]);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingSectores, setLoadingSectores] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);
  const [loadingCalles, setLoadingCalles] = useState(false);
  
  // Estados de error
  const [error, setError] = useState<string | null>(null);
  
  // Estados de selección
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<DireccionData | null>(null);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<number | null>(null);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<number | null>(null);
  
  // Ref para evitar cargas duplicadas
  const cargaInicialRef = useRef(false);

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      const data = await sectorService.obtenerTodos();
      setSectores(data);
    } catch (error: any) {
      console.error('Error al cargar sectores:', error);
      NotificationService.error('Error al cargar sectores');
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Cargar barrios
  const cargarBarrios = useCallback(async () => {
    try {
      setLoadingBarrios(true);
      const data = await barrioService.obtenerTodos();
      setBarrios(data);
    } catch (error: any) {
      console.error('Error al cargar barrios:', error);
      NotificationService.error('Error al cargar barrios');
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
    } catch (error: any) {
      console.error('Error al cargar calles:', error);
      NotificationService.error('Error al cargar calles');
    } finally {
      setLoadingCalles(false);
    }
  }, []);

  // Cargar direcciones - Por ahora retorna array vacío
  const cargarDirecciones = useCallback(async (parametros?: BusquedaDireccionParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('Cargando direcciones con parámetros:', parametros);
      setDirecciones([]);
      
    } catch (error: any) {
      setError(error.message);
      NotificationService.error('Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear dirección - Placeholder
  const crearDireccion = useCallback(async (datos: CreateDireccionDTO): Promise<DireccionData | null> => {
    try {
      setLoading(true);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('Creando dirección:', datos);
      
      // Simular creación
      const nuevaDireccion: DireccionData = {
        id: Date.now(),
        ...datos,
        estado: 'ACTIVO'
      };
      
      setDirecciones(prev => [...prev, nuevaDireccion]);
      
      NotificationService.success('Dirección creada correctamente');
      return nuevaDireccion;
      
    } catch (error: any) {
      NotificationService.error(error.message || 'Error al crear dirección');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar dirección - Placeholder
  const actualizarDireccion = useCallback(async (id: number, datos: UpdateDireccionDTO): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('Actualizando dirección:', id, datos);
      
      setDirecciones(prev => 
        prev.map(dir => dir.id === id ? { ...dir, ...datos } : dir)
      );
      
      NotificationService.success('Dirección actualizada correctamente');
      return true;
      
    } catch (error: any) {
      NotificationService.error(error.message || 'Error al actualizar dirección');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar dirección - Placeholder
  const eliminarDireccion = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('Eliminando dirección:', id);
      
      setDirecciones(prev => prev.filter(dir => dir.id !== id));
      
      NotificationService.success('Dirección eliminada correctamente');
      return true;
      
    } catch (error: any) {
      NotificationService.error(error.message || 'Error al eliminar dirección');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar cambio de sector
  const handleSectorChange = useCallback((sectorId: number) => {
    setSectorSeleccionado(sectorId);
    setBarrioSeleccionado(null);
    
    // Filtrar barrios por sector
    const barriosFiltrados = barrios.filter(barrio => barrio.codSector === sectorId);
    setBarriosFiltrados(barriosFiltrados);
    setCallesFiltradas([]);
  }, [barrios]);

  // Manejar cambio de barrio
  const handleBarrioChange = useCallback((barrioId: number) => {
    setBarrioSeleccionado(barrioId);
    
    // Filtrar calles por barrio
    const callesFiltradas = calles.filter(calle => calle.codigoBarrio === barrioId);
    setCallesFiltradas(callesFiltradas);
  }, [calles]);

  // Buscar direcciones
  const buscarDirecciones = useCallback(async (criterios: BusquedaDireccionParams) => {
    await cargarDirecciones(criterios);
  }, [cargarDirecciones]);

  // Cargar datos iniciales
  useEffect(() => {
    if (!cargaInicialRef.current) {
      cargaInicialRef.current = true;
      
      // Cargar todos los datos necesarios
      Promise.all([
        cargarSectores(),
        cargarBarrios(),
        cargarCalles(),
        cargarDirecciones()
      ]).catch(error => {
        console.error('Error en carga inicial:', error);
      });
    }
  }, [cargarSectores, cargarBarrios, cargarCalles, cargarDirecciones]);

  return {
    // Datos
    direcciones,
    sectores,
    barrios,
    calles,
    barriosFiltrados,
    callesFiltradas,
    direccionSeleccionada,
    
    // Estados
    loading,
    loadingSectores,
    loadingBarrios,
    loadingCalles,
    error,
    
    // Funciones
    cargarDirecciones,
    cargarSectores,
    cargarBarrios,
    cargarCalles,
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion,
    buscarDirecciones,
    setDireccionSeleccionada,
    handleSectorChange,
    handleBarrioChange
  };
};