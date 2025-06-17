// src/hooks/useBarrios.ts - IMPORTACIONES DIRECTAS
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCrudEntity } from './useCrudEntity';
import { Barrio, BarrioFormData, getBarrioDisplayName, isBarrioValid, DEFAULT_SECTOR_ID } from '../models/Barrio';
import { Sector } from '../models/Sector';
// Importar servicios directamente
import barrioService from '../services/barrioService';
import sectorService from '../services/sectorService';

export const useBarrios = () => {
  const isInitialized = useRef(false);
  
  // Estados adicionales para sectores
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loadingSectores, setLoadingSectores] = useState(false);
  
  const {
    items: barrios,
    selectedItem: barrioSeleccionado,
    isEditMode: modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    loadItems: cargarBarrios,
    searchItems: buscarBarrios,
    selectItem: seleccionarBarrio,
    clearSelection: limpiarSeleccion,
    saveItem: guardarBarrio,
    deleteItem: eliminarBarrio,
    setIsEditMode: setModoEdicion,
    refreshItems: sincronizarManualmente,
    setError
  } = useCrudEntity<Barrio, BarrioFormData>({
    entityName: 'Barrios',
    service: barrioService,
    cacheKey: 'barrios_cache',
    getItemId: (barrio) => barrio.id,
    validateData: (data) => {
      // 🔥 VALIDACIÓN MÁS PERMISIVA
      console.log('🔍 [useBarrios] Validando datos:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ [useBarrios] Los datos no son un array');
        return false;
      }
      
      if (data.length === 0) {
        console.warn('⚠️ [useBarrios] Array vacío');
        return true; // ✅ Aceptar array vacío como válido
      }
      
      // Contar barrios válidos
      const barriosValidos = data.filter(barrio => {
        // 🔥 VALIDACIÓN INDIVIDUAL DE BARRIO
        const tieneNombre = !!(barrio && 
          (barrio.nombre || barrio.nombreBarrio) && 
          (barrio.nombre || barrio.nombreBarrio).trim().length > 0);
          
        const tieneSector = !!(barrio && 
          barrio.sectorId !== undefined && 
          barrio.sectorId !== null);
        
        return tieneNombre && tieneSector;
      });
      
      const porcentajeValidos = data.length > 0 ?
        (barriosValidos.length / data.length) * 100 : 0;
      
      console.log(`📊 [useBarrios] ${barriosValidos.length}/${data.length} barrios válidos (${porcentajeValidos.toFixed(1)}%)`);
      
      // ✅ Aceptar si al menos el 50% son válidos
      return porcentajeValidos >= 50;
    }
  });

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    if (loadingSectores) return;
    
    try {
      setLoadingSectores(true);
      console.log('🔄 [useBarrios] Cargando sectores...');
      
      const data = await sectorService.getAll();
      
      // 🔥 ASEGURAR SECTOR DEFAULT
      const sectorDefault = { 
        id: DEFAULT_SECTOR_ID, 
        nombre: 'Sin Sector Asignado',
        estado: 1 
      };
      
      const tieneDefault = data.some(s => s.id === DEFAULT_SECTOR_ID);
      if (!tieneDefault) {
        console.log('➕ [useBarrios] Agregando sector por defecto');
        data.unshift(sectorDefault);
      }
      
      setSectores(data);
      console.log(`✅ [useBarrios] ${data.length} sectores cargados`);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al cargar sectores:', error);
      
      // Usar sectores por defecto
      setSectores([
        { id: DEFAULT_SECTOR_ID, nombre: 'Sin Sector Asignado', estado: 1 },
        { id: 2, nombre: 'Sector Norte', estado: 1 },
        { id: 3, nombre: 'Sector Sur', estado: 1 }
      ]);
    } finally {
      setLoadingSectores(false);
    }
  }, [loadingSectores]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const cargarDatosIniciales = async () => {
      console.log('🚀 [useBarrios] Iniciando carga de datos...');
      
      try {
        await cargarSectores();
        await cargarBarrios();
        console.log('✅ [useBarrios] Carga inicial completada');
      } catch (error) {
        console.error('❌ [useBarrios] Error en carga inicial:', error);
      }
    };
    
    cargarDatosIniciales();
  }, [cargarSectores, cargarBarrios]);

  // 🔥 FUNCIONES HELPER MEJORADAS
  const obtenerNombreSector = useCallback((sectorId: number | null): string => {
    if (!sectorId || sectorId === 0) return 'Sin sector';
    
    const sector = sectores.find(s => s.id === sectorId);
    return sector?.nombre || `Sector ID: ${sectorId}`;
  }, [sectores]);

  const buscarBarriosPorSector = useCallback((sectorId: number): Barrio[] => {
    if (!sectorId || sectorId === 0) return [];
    
    return barrios.filter(barrio => barrio.sectorId === sectorId);
  }, [barrios]);

  const validarBarrio = useCallback((barrio: Barrio): boolean => {
    return isBarrioValid(barrio);
  }, []);

  const obtenerBarrioCompleto = useCallback((barrioId: number): Barrio | null => {
    const barrio = barrios.find(b => b.id === barrioId);
    if (!barrio) return null;
    
    // Enriquecer con información del sector
    const sector = sectores.find(s => s.id === barrio.sectorId);
    return {
      ...barrio,
      sector
    };
  }, [barrios, sectores]);

  // 🔥 FUNCIONES DE NEGOCIO
  const guardarBarrioConValidacion = useCallback(async (data: BarrioFormData): Promise<Barrio | null> => {
    try {
      // Validar que el sector existe
      const sectorExiste = sectores.some(s => s.id === data.sectorId);
      if (!sectorExiste) {
        throw new Error(`El sector con ID ${data.sectorId} no existe`);
      }
      
      // Validar nombre único por sector
      const nombreDuplicado = barrios.some(b => 
        b.nombre?.toLowerCase() === data.nombre.toLowerCase() &&
        b.sectorId === data.sectorId &&
        (!barrioSeleccionado || b.id !== barrioSeleccionado.id)
      );
      
      if (nombreDuplicado) {
        throw new Error(`Ya existe un barrio llamado "${data.nombre}" en este sector`);
      }
      
      // Guardar
      return await guardarBarrio(data);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al guardar:', error);
      setError(error.message);
      throw error;
    }
  }, [sectores, barrios, barrioSeleccionado, guardarBarrio, setError]);

  const eliminarBarrioConValidacion = useCallback(async (id: number): Promise<void> => {
    try {
      // Aquí podrías agregar validaciones adicionales
      // Por ejemplo, verificar si el barrio tiene direcciones asociadas
      
      await eliminarBarrio(id);
      
    } catch (error: any) {
      console.error('❌ [useBarrios] Error al eliminar:', error);
      setError(error.message);
      throw error;
    }
  }, [eliminarBarrio, setError]);

  // 🔥 SINCRONIZACIÓN MEJORADA
  const sincronizarTodo = useCallback(async () => {
    console.log('🔄 [useBarrios] Sincronizando todo...');
    
    try {
      await Promise.all([
        cargarSectores(),
        sincronizarManualmente()
      ]);
      
      console.log('✅ [useBarrios] Sincronización completa');
    } catch (error) {
      console.error('❌ [useBarrios] Error en sincronización:', error);
      throw error;
    }
  }, [cargarSectores, sincronizarManualmente]);

  // 🔥 DEBUG Y ESTADÍSTICAS
  const estadisticas = {
    totalBarrios: barrios.length,
    totalSectores: sectores.length,
    barriosPorSector: sectores.map(sector => ({
      sector: sector.nombre,
      cantidad: barrios.filter(b => b.sectorId === sector.id).length
    })),
    isOfflineMode,
    lastSyncTime
  };

  return {
    // Estados principales
    barrios,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Estados adicionales
    sectores,
    loadingSectores,
    
    // Funciones CRUD principales
    cargarBarrios,
    buscarBarrios,
    seleccionarBarrio,
    limpiarSeleccion,
    setModoEdicion,
    
    // 🔥 FUNCIONES MEJORADAS
    guardarBarrio: guardarBarrioConValidacion,
    eliminarBarrio: eliminarBarrioConValidacion,
    sincronizarManualmente: sincronizarTodo,
    
    // Funciones adicionales
    cargarSectores,
    obtenerNombreSector,
    buscarBarriosPorSector,
    validarBarrio,
    obtenerBarrioCompleto,
    getBarrioDisplayName,
    
    // Debug y estadísticas
    estadisticas,
    setError
  };
};