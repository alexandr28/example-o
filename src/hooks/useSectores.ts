// src/hooks/useSectores.ts
import { useState, useCallback, useEffect } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import sectorService from '../services/sectorService';
import { NotificationService } from '../components/utils/Notification';

// Tipos del servicio
import type { SectorData, CuadranteData, UnidadUrbanaData } from '../services/sectorService';

/**
 * Adaptador para convertir SectorData (servicio) a Sector (modelo)
 */
const adaptSectorDataToModel = (data: SectorData): Sector => {
  return {
    id: data.codSector,  // Mapear codSector a id
    nombre: data.nombreSector,
    cuadrante: data.codCuadrante,
    nombreCuadrante: data.nombreCuadrante,
    codUnidadUrbana: data.codUnidadUrbana,
    unidadUrbana: data.unidadUrbana,
    descripcion: '',
    estado: 'ACTIVO', // Por defecto activo ya que no hay estado en API
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: undefined,
    usuarioCreacion: undefined,
    usuarioModificacion: undefined
  };
};

/**
 * Hook personalizado para gestión de sectores
 */
export const useSectores = () => {
  // Estados principales
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cuadrantes, setCuadrantes] = useState<CuadranteData[]>([]);
  const [loadingCuadrantes, setLoadingCuadrantes] = useState(false);
  const [unidadesUrbanas, setUnidadesUrbanas] = useState<UnidadUrbanaData[]>([]);
  const [loadingUnidadesUrbanas, setLoadingUnidadesUrbanas] = useState(false);
  
  // Estado para modo offline
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Verificar conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      NotificationService.info('Conexión restaurada');
    };
    
    const handleOffline = () => {
      setIsOfflineMode(true);
      NotificationService.warning('Trabajando sin conexión');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Cargar todos los sectores
   */
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [useSectores] Cargando sectores...');
      
      // Obtener datos del servicio
      const sectorData = await sectorService.getAll();
      
      // Convertir SectorData[] a Sector[]
      const sectoresAdaptados = sectorData.map(adaptSectorDataToModel);
      
      setSectores(sectoresAdaptados);
      setLastSyncTime(new Date());
      
      console.log(`✅ [useSectores] ${sectoresAdaptados.length} sectores cargados`);
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al cargar sectores:', error);
      
      if (isOfflineMode) {
        NotificationService.warning('Sin conexión. Mostrando datos en caché.');
      } else {
        setError(error.message || 'Error al cargar sectores');
        NotificationService.error('Error al cargar sectores');
      }
      
    } finally {
      setLoading(false);
    }
  }, [isOfflineMode]);

  /**
   * Buscar sectores por término
   */
  const buscarSectores = useCallback(async (term: string) => {
    try {
      setSearchTerm(term);
      
      if (!term.trim()) {
        await cargarSectores();
        return;
      }
      
      setLoading(true);
      
      // Usar búsqueda local por ahora
      const todosSectores = await sectorService.getAll();
      const filtrados = todosSectores.filter(sector => 
        sector.nombreSector.toLowerCase().includes(term.toLowerCase())
      );
      
      const sectoresAdaptados = filtrados.map(adaptSectorDataToModel);
      setSectores(sectoresAdaptados);
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error en búsqueda:', error);
      setError('Error al buscar sectores');
    } finally {
      setLoading(false);
    }
  }, [cargarSectores]);

  /**
   * Seleccionar un sector para edición
   */
  const seleccionarSector = useCallback((sector: Sector) => {
    setSectorSeleccionado(sector);
    setModoEdicion(true);
    console.log('📝 [useSectores] Sector seleccionado:', sector);
  }, []);

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    setSectorSeleccionado(null);
    setModoEdicion(false);
    setError(null);
  }, []);

  /**
   * Guardar sector (crear o actualizar)
   */
  const guardarSector = useCallback(async (data: SectorFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useSectores] Guardando sector:', data);
      console.log('🔄 [useSectores] Modo edición:', modoEdicion);
      
      if (modoEdicion && sectorSeleccionado) {
        // Modo edición
        console.log('📝 [useSectores] Actualizando sector ID:', sectorSeleccionado.id);

        // Validar que los campos requeridos estén presentes
        if (!data.codUnidadUrbana) {
          throw new Error('La unidad urbana es requerida');
        }

        if (!data.cuadrante) {
          throw new Error('El cuadrante es requerido');
        }

        const resultado = await sectorService.actualizarSector(
          sectorSeleccionado.id,
          {
            nombreSector: data.nombre.trim(),
            codCuadrante: data.cuadrante,
            codUnidadUrbana: data.codUnidadUrbana
          }
        );

        console.log('✅ [useSectores] Sector actualizado:', resultado);
        NotificationService.success('Sector actualizado correctamente');

      } else {
        // Modo creación
        console.log('➕ [useSectores] Creando nuevo sector');

        // Validar que los campos requeridos estén presentes
        if (!data.codUnidadUrbana) {
          throw new Error('La unidad urbana es requerida');
        }

        if (!data.cuadrante) {
          throw new Error('El cuadrante es requerido');
        }

        const resultado = await sectorService.crearSector({
          codUnidadUrbana: data.codUnidadUrbana,
          nombreSector: data.nombre.trim(),
          codCuadrante: data.cuadrante
        });

        console.log('✅ [useSectores] Sector creado:', resultado);

        // Verificar si se creó con éxito (incluso con ID temporal)
        if (resultado && resultado.codSector) {
          NotificationService.success('Sector creado correctamente');
        }
      }
      
      // IMPORTANTE: Recargar la lista después de crear/actualizar
      console.log('🔄 [useSectores] Recargando lista de sectores...');
      
      // Pequeña demora para asegurar que el servidor procesó el cambio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar lista
      await cargarSectores();
      
      // Limpiar formulario y cerrar modal
      limpiarSeleccion();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al guardar:', error);
      
      // Mensaje de error más específico
      let mensaje = 'Error al guardar el sector';
      
      if (error.message) {
        if (error.message.includes('403')) {
          mensaje = 'No tiene permisos para realizar esta acción';
        } else if (error.message.includes('400')) {
          mensaje = 'Datos inválidos. Verifique la información';
        } else if (error.message.includes('500')) {
          mensaje = 'Error del servidor. Intente nuevamente';
        } else if (error.message.includes('NaN')) {
          mensaje = 'Error al procesar la respuesta del servidor';
        } else {
          mensaje = error.message;
        }
      }
      
      setError(mensaje);
      NotificationService.error(mensaje);
      return false;
      
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, sectorSeleccionado, cargarSectores, limpiarSeleccion]);

  /**
   * Eliminar sector
   */
  const eliminarSector = useCallback(async (id: number): Promise<boolean> => {
    try {
      const confirmar = window.confirm('¿Está seguro de eliminar este sector?');
      if (!confirmar) return false;
      
      setLoading(true);
      
      // Nota: La nueva API no tiene eliminación lógica
      // Por ahora solo mostramos el mensaje
      console.log('Eliminación no implementada en la nueva API');
      throw new Error('La eliminación de sectores no está disponible en la nueva versión del API');
      
      NotificationService.success('Sector eliminado correctamente');
      
      // Recargar lista
      await cargarSectores();
      
      // Limpiar selección si era el sector eliminado
      if (sectorSeleccionado?.id === id) {
        limpiarSeleccion();
      }
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al eliminar:', error);
      const mensaje = error.message || 'Error al eliminar el sector';
      NotificationService.error(mensaje);
      return false;
      
    } finally {
      setLoading(false);
    }
  }, [sectorSeleccionado, cargarSectores, limpiarSeleccion]);

  /**
   * Sincronizar manualmente
   */
  const sincronizarManualmente = useCallback(async () => {
    if (!navigator.onLine) {
      NotificationService.warning('No hay conexión a internet');
      return;
    }
    
    await cargarSectores();
    NotificationService.success('Datos sincronizados');
  }, [cargarSectores]);

  /**
   * Cargar todos los cuadrantes
   */
  const cargarCuadrantes = useCallback(async () => {
    try {
      setLoadingCuadrantes(true);

      console.log('📋 [useSectores] Cargando cuadrantes...');

      const cuadrantesData = await sectorService.obtenerCuadrantes();

      setCuadrantes(cuadrantesData);

      console.log(`✅ [useSectores] ${cuadrantesData.length} cuadrantes cargados`);

    } catch (error: any) {
      console.error('❌ [useSectores] Error al cargar cuadrantes:', error);

      if (!isOfflineMode) {
        NotificationService.error('Error al cargar cuadrantes');
      }

    } finally {
      setLoadingCuadrantes(false);
    }
  }, [isOfflineMode]);

  /**
   * Cargar todas las unidades urbanas
   */
  const cargarUnidadesUrbanas = useCallback(async () => {
    try {
      setLoadingUnidadesUrbanas(true);

      console.log('📋 [useSectores] Cargando unidades urbanas...');

      const unidadesData = await sectorService.obtenerUnidadesUrbanas();

      setUnidadesUrbanas(unidadesData);

      console.log(`✅ [useSectores] ${unidadesData.length} unidades urbanas cargadas`);

    } catch (error: any) {
      console.error('❌ [useSectores] Error al cargar unidades urbanas:', error);

      if (!isOfflineMode) {
        NotificationService.error('Error al cargar unidades urbanas');
      }

    } finally {
      setLoadingUnidadesUrbanas(false);
    }
  }, [isOfflineMode]);

  /**
   * Forzar modo online (para testing)
   */
  const forzarModoOnline = useCallback(async () => {
    setIsOfflineMode(false);
    await cargarSectores();
  }, [cargarSectores]);

  // Cargar sectores, cuadrantes y unidades urbanas al montar
  useEffect(() => {
    cargarSectores();
    cargarCuadrantes();
    cargarUnidadesUrbanas();
  }, [cargarSectores, cargarCuadrantes, cargarUnidadesUrbanas]);

  return {
    // Estados
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    cuadrantes,
    loadingCuadrantes,
    unidadesUrbanas,
    loadingUnidadesUrbanas,

    // Funciones
    cargarSectores,
    cargarCuadrantes,
    cargarUnidadesUrbanas,
    buscarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente,
    forzarModoOnline,
  };
};