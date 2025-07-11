// src/hooks/useSectores.ts
import { useState, useCallback, useEffect } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import sectorService from '../services/sectorService';
import { NotificationService } from '../components/utils/Notification';

// Tipos del servicio
import type { SectorData, CreateSectorDTO } from '../services/sectorService';

/**
 * Adaptador para convertir SectorData (servicio) a Sector (modelo)
 */
const adaptSectorDataToModel = (data: SectorData): Sector => {
  return {
    id: data.codigo,  // Mapear codigo a id
    nombre: data.nombre,
    descripcion: data.descripcion,
    estado: data.estado || 'ACTIVO',
    fechaRegistro: data.fechaRegistro,
    fechaModificacion: data.fechaModificacion,
    usuarioCreacion: data.codUsuario?.toString(),
    usuarioModificacion: data.codUsuario?.toString()
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
        sector.nombre.toLowerCase().includes(term.toLowerCase())
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
      
      let resultado: SectorData;
      
      if (modoEdicion && sectorSeleccionado) {
        // Actualizar
        resultado = await sectorService.update(sectorSeleccionado.id, {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim()
        });
        console.log('✅ [useSectores] Sector actualizado:', resultado);
        NotificationService.success('Sector actualizado correctamente');
        
      } else {
        // Crear nuevo
        const createDto: CreateSectorDTO = {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim() || '',
          codUsuario: 1
        };
        resultado = await sectorService.create(createDto);
        console.log('✅ [useSectores] Sector creado:', resultado);
        NotificationService.success('Sector creado correctamente');
      }
      
      // Recargar lista completa
      await cargarSectores();
      
      // Limpiar selección después de guardar
      limpiarSeleccion();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al guardar:', error);
      const mensaje = error.message || 'Error al guardar el sector';
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
      
      // Cambiar estado a INACTIVO en lugar de eliminar
      await sectorService.update(id, { estado: 'INACTIVO' });
      
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
   * Forzar modo online (para testing)
   */
  const forzarModoOnline = useCallback(async () => {
    setIsOfflineMode(false);
    await cargarSectores();
  }, [cargarSectores]);

  // Cargar sectores al montar
  useEffect(() => {
    cargarSectores();
  }, [cargarSectores]);

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
    
    // Funciones
    cargarSectores,
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