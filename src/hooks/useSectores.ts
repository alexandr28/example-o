// src/hooks/useSectores.ts
import { useState, useCallback, useEffect } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import SectorService from '../services/sectorService';
import { connectivityService } from '../services/connectivityService';
import { MockSectorService } from '../services/mockSectorService';

/**
 * Hook personalizado para la gestión de sectores
 * Versión modificada para no usar token
 */
export const useSectores = () => {
  // Estados
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(!connectivityService.getStatus());

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Sector[];
      
      // Verificar si podemos usar la API o necesitamos usar el mock
      if (!connectivityService.getStatus()) {
        console.log('Usando mock service para sectores (API no disponible)');
        data = await MockSectorService.getAll();
      } else {
        try {
          // Intentar cargar desde la API sin autenticación
          console.log('Intentando cargar desde la API sin autenticación');
          data = await SectorService.getAll();
        } catch (apiError: any) {
          console.error('Error al cargar desde API, usando mock service:', apiError);
          
          // Identificar específicamente si es un error CORS
          if (apiError.message && (
            apiError.message.includes('CORS') || 
            apiError.message.includes('cross-origin') ||
            apiError.message.includes('Failed to fetch')
          )) {
            setError('Error de conexión CORS: No se puede acceder al servidor. Trabajando en modo offline.');
          } else {
            setError(`Error al cargar datos: ${apiError.message}`);
          }
          
          data = await MockSectorService.getAll();
        }
      }
      
      // Establecer los datos en el estado
      setSectores(data);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar los sectores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Monitorear cambios en la conectividad
  useEffect(() => {
    return connectivityService.addListener((isOnline) => {
      setIsOfflineMode(!isOnline);
      if (isOnline) {
        // Si volvimos a estar online, intentamos sincronizar
        cargarSectores();
      }
    });
  }, [cargarSectores]);

  // Seleccionar un sector para editar
  const seleccionarSector = useCallback((sector: Sector) => {
    setSectorSeleccionado(sector);
    setModoEdicion(true);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setSectorSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Guardar un sector (crear o actualizar)
  const guardarSector = useCallback(async (data: SectorFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      let result: Sector;
      
      if (!connectivityService.getStatus()) {
        // Modo offline - usar mock service
        if (modoEdicion && sectorSeleccionado) {
          result = await MockSectorService.update(sectorSeleccionado.id, data);
        } else {
          result = await MockSectorService.create(data);
        }
      } else {
        try {
          // Intentar guardar en la API sin autenticación
          if (modoEdicion && sectorSeleccionado) {
            result = await SectorService.update(sectorSeleccionado.id, data);
          } else {
            result = await SectorService.create(data);
          }
        } catch (apiError) {
          console.error('Error al guardar en API, usando mock service:', apiError);
          
          // Fallar al servicio mock si hay error
          if (modoEdicion && sectorSeleccionado) {
            result = await MockSectorService.update(sectorSeleccionado.id, data);
          } else {
            result = await MockSectorService.create(data);
          }
        }
      }
      
      // Actualizar el estado local con el resultado
      if (modoEdicion && sectorSeleccionado) {
        setSectores(prev => prev.map(s => s.id === sectorSeleccionado.id ? result : s));
      } else {
        setSectores(prev => [...prev, result]);
      }
      
      // Limpiar selección
      limpiarSeleccion();
      
    } catch (err: any) {
      setError(err.message || 'Error al guardar el sector');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, sectorSeleccionado, limpiarSeleccion]);

  // Eliminar un sector
  const eliminarSector = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!connectivityService.getStatus()) {
        // Modo offline - usar mock service
        await MockSectorService.delete(id);
      } else {
        try {
          // Intentar eliminar en la API sin autenticación
          await SectorService.delete(id);
        } catch (apiError) {
          console.error('Error al eliminar en API, usando mock service:', apiError);
          
          // Fallar al servicio mock si hay error
          await MockSectorService.delete(id);
        }
      }
      
      // Actualizar el estado local
      setSectores(prev => prev.filter(s => s.id !== id));
      
      // Si el sector eliminado estaba seleccionado, limpiar selección
      if (sectorSeleccionado?.id === id) {
        limpiarSeleccion();
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el sector');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sectorSeleccionado, limpiarSeleccion]);

  // Sincronizar manualmente
  const sincronizarManualmente = useCallback(async () => {
    await connectivityService.forcePing();
    await cargarSectores();
  }, [cargarSectores]);

  return {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    hasPendingChanges: false, // Simplificado para esta implementación
    pendingChangesCount: 0,   // Simplificado para esta implementación
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente,
  };
};