// src/hooks/useDirecciones.ts - VERSIÓN ACTUALIZADA
import { useState, useCallback, useEffect } from 'react';
import { direccionService } from '../services/direcionService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';
import calleApiService from '../services/calleApiService';
import { Direccion, DireccionFormData, Sector, Barrio, Calle, LadoDireccion } from '../models';
import { NotificationService } from '../components/utils/Notification';

interface UseDireccionesReturn {
  // Estados
  direcciones: Direccion[];
  sectores: Sector[];
  barrios: Barrio[];
  barriosFiltrados: Barrio[];
  calles: Calle[];
  callesFiltradas: Calle[];
  lados: { value: string; label: string }[];
  direccionSeleccionada: Direccion | null;
  sectorSeleccionado: number | null;
  barrioSeleccionado: number | null;
  modoEdicion: boolean;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  
  // Métodos
  cargarDirecciones: () => Promise<void>;
  cargarDependencias: () => Promise<void>;
  buscarDirecciones: (term: string) => Promise<void>;
  buscarPorTipoVia: (parametros: string) => Promise<void>;
  buscarPorNombreVia: (nombre?: string) => Promise<void>;
  seleccionarDireccion: (direccion: Direccion) => void;
  handleSectorChange: (sectorId: number) => void;
  handleBarrioChange: (barrioId: number) => void;
  limpiarSeleccion: () => void;
  guardarDireccion: (data: DireccionFormData) => Promise<void>;
  eliminarDireccion: (id: number) => Promise<void>;
  setModoEdicion: (modo: boolean) => void;
  setSearchTerm: (term: string) => void;
}

export const useDirecciones = (): UseDireccionesReturn => {
  // Estados principales
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [calles, setCalles] = useState<Calle[]>([]);
  
  // Estados de filtrado
  const [barriosFiltrados, setBarriosFiltrados] = useState<Barrio[]>([]);
  const [callesFiltradas, setCallesFiltradas] = useState<Calle[]>([]);
  
  // Estados de selección
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<number | null>(null);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<number | null>(null);
  
  // Estados de UI
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Opciones de lados
  const lados = [
    { value: LadoDireccion.NINGUNO, label: 'Ninguno' },
    { value: LadoDireccion.IZQUIERDO, label: 'Izquierdo' },
    { value: LadoDireccion.DERECHO, label: 'Derecho' },
    { value: LadoDireccion.PAR, label: 'Par' },
    { value: LadoDireccion.IMPAR, label: 'Impar' }
  ];
  
  /**
   * Cargar todas las direcciones
   */
  const cargarDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useDirecciones] Cargando direcciones...');
      
      const data = await direccionService.getAll();
      setDirecciones(data);
      
      console.log(`✅ [useDirecciones] ${data.length} direcciones cargadas`);
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error al cargar direcciones:', err);
      setError(err.message || 'Error al cargar direcciones');
      NotificationService.error('Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Buscar direcciones por tipo de vía
   */
  const buscarPorTipoVia = useCallback(async (parametros: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useDirecciones] Buscando por tipo de vía:', parametros);
      
      const data = await direccionService.buscarPorTipoVia({
        parametrosBusqueda: parametros,
        codUsuario: 1 // Siempre enviar codUsuario: 1
      });
      
      setDirecciones(data);
      console.log(`✅ [useDirecciones] ${data.length} direcciones encontradas`);
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error en búsqueda por tipo de vía:', err);
      setError(err.message || 'Error al buscar direcciones');
      NotificationService.error('Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Buscar direcciones por nombre de vía
   * ACTUALIZADO: Solo usa nombreVia y codUsuario según la API
   */
  const buscarPorNombreVia = useCallback(async (nombre?: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useDirecciones] Buscando por nombre de vía:', nombre);
      
      const data = await direccionService.buscarPorNombreVia({
        nombreVia: nombre || 'a', // Valor por defecto 'a' si no se especifica
        codUsuario: 1 // Siempre enviar codUsuario: 1
      });
      
      setDirecciones(data);
      console.log(`✅ [useDirecciones] ${data.length} direcciones encontradas`);
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error en búsqueda por nombre de vía:', err);
      setError(err.message || 'Error al buscar direcciones');
      NotificationService.error('Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Buscar direcciones genérico
   */
  const buscarDirecciones = useCallback(async (term: string) => {
    if (!term.trim()) {
      await cargarDirecciones();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [useDirecciones] Buscando direcciones:', term);
      
      // Usar buscarPorNombreVia con el término de búsqueda
      await buscarPorNombreVia(term);
      
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error en búsqueda:', err);
      setError(err.message || 'Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones, buscarPorNombreVia]);
  
  /**
   * Cargar dependencias (sectores, barrios, calles)
   */
  const cargarDependencias = useCallback(async () => {
    try {
      console.log('🔄 [useDirecciones] Cargando dependencias...');
      
      const [sectoresData, barriosData, callesData] = await Promise.all([
        sectorService.getAll(),
        barrioService.getAll(),
        calleApiService.getAll()
      ]);
      
      setSectores(sectoresData);
      setBarrios(barriosData);
      setCalles(callesData);
      
      console.log('✅ [useDirecciones] Dependencias cargadas:', {
        sectores: sectoresData.length,
        barrios: barriosData.length,
        calles: callesData.length
      });
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error al cargar dependencias:', err);
      setError('Error al cargar datos necesarios');
    }
  }, []);
  
  /**
   * Manejar cambio de sector
   */
  const handleSectorChange = useCallback((sectorId: number) => {
    console.log('🔄 [useDirecciones] Sector cambiado:', sectorId);
    setSectorSeleccionado(sectorId);
    
    // Filtrar barrios del sector
    const barriosDelSector = barrios.filter(b => b.sectorId === sectorId);
    setBarriosFiltrados(barriosDelSector);
    
    // Limpiar selección de barrio si no pertenece al nuevo sector
    if (barrioSeleccionado && !barriosDelSector.find(b => b.id === barrioSeleccionado)) {
      setBarrioSeleccionado(null);
      setCallesFiltradas([]);
    }
  }, [barrios, barrioSeleccionado]);
  
  /**
   * Manejar cambio de barrio
   */
  const handleBarrioChange = useCallback((barrioId: number) => {
    console.log('🔄 [useDirecciones] Barrio cambiado:', barrioId);
    setBarrioSeleccionado(barrioId);
    
    // Filtrar calles del barrio
    const callesDelBarrio = calles.filter(c => c.barrioId === barrioId);
    setCallesFiltradas(callesDelBarrio);
  }, [calles]);
  
  /**
   * Seleccionar dirección
   */
  const seleccionarDireccion = useCallback((direccion: Direccion) => {
    console.log('📍 [useDirecciones] Dirección seleccionada:', direccion);
    setDireccionSeleccionada(direccion);
    setModoEdicion(false);
    
    // Actualizar sector y barrio seleccionados
    if (direccion.sectorId) {
      handleSectorChange(direccion.sectorId);
    }
    if (direccion.barrioId) {
      handleBarrioChange(direccion.barrioId);
    }
  }, [handleSectorChange, handleBarrioChange]);
  
  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    console.log('🧹 [useDirecciones] Limpiando selección');
    setDireccionSeleccionada(null);
    setSectorSeleccionado(null);
    setBarrioSeleccionado(null);
    setBarriosFiltrados([]);
    setCallesFiltradas([]);
    setModoEdicion(false);
  }, []);
  
  /**
   * Guardar dirección (crear o actualizar)
   */
  const guardarDireccion = useCallback(async (data: DireccionFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (modoEdicion && direccionSeleccionada) {
        console.log('📝 [useDirecciones] Actualizando dirección:', direccionSeleccionada.id);
        await direccionService.update(direccionSeleccionada.id, data);
      } else {
        console.log('➕ [useDirecciones] Creando nueva dirección');
        await direccionService.create(data);
      }
      
      // Recargar direcciones y limpiar formulario
      await cargarDirecciones();
      limpiarSeleccion();
      
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error al guardar dirección:', err);
      setError(err.message || 'Error al guardar dirección');
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, direccionSeleccionada, cargarDirecciones, limpiarSeleccion]);
  
  /**
   * Eliminar dirección
   */
  const eliminarDireccion = useCallback(async (id: number) => {
    try {
      const confirmar = window.confirm('¿Está seguro de eliminar esta dirección?');
      if (!confirmar) return;
      
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useDirecciones] Eliminando dirección:', id);
      await direccionService.delete(id);
      
      // Recargar direcciones y limpiar selección
      await cargarDirecciones();
      limpiarSeleccion();
      
      NotificationService.success('Dirección eliminada exitosamente');
    } catch (err: any) {
      console.error('❌ [useDirecciones] Error al eliminar dirección:', err);
      setError(err.message || 'Error al eliminar dirección');
      NotificationService.error('Error al eliminar dirección');
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones, limpiarSeleccion]);
  
  // Efecto para filtrar barrios cuando cambia el sector
  useEffect(() => {
    if (sectorSeleccionado) {
      const filtrados = barrios.filter(b => b.sectorId === sectorSeleccionado);
      setBarriosFiltrados(filtrados);
    } else {
      setBarriosFiltrados([]);
    }
  }, [sectorSeleccionado, barrios]);
  
  // Efecto para filtrar calles cuando cambia el barrio
  useEffect(() => {
    if (barrioSeleccionado) {
      const filtradas = calles.filter(c => c.barrioId === barrioSeleccionado);
      setCallesFiltradas(filtradas);
    } else {
      setCallesFiltradas([]);
    }
  }, [barrioSeleccionado, calles]);
  
  return {
    // Estados
    direcciones,
    sectores,
    barrios,
    barriosFiltrados,
    calles,
    callesFiltradas,
    lados,
    direccionSeleccionada,
    sectorSeleccionado,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    searchTerm,
    
    // Métodos
    cargarDirecciones,
    cargarDependencias,
    buscarDirecciones,
    buscarPorTipoVia,
    buscarPorNombreVia,
    seleccionarDireccion,
    handleSectorChange,
    handleBarrioChange,
    limpiarSeleccion,
    guardarDireccion,
    eliminarDireccion,
    setModoEdicion,
    setSearchTerm
  };
};