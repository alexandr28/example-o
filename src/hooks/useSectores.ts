import { useState, useCallback, useEffect } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import { authGet, authPost, authPut, authDelete } from '../api/authClient';

// URL base para la API de sectores
const API_URL = 'http://localhost:8080/api/sectores';

// Clave para almacenar cambios pendientes en localStorage
const PENDING_CHANGES_KEY = 'pending_sectors_changes';

// Tipo para cambios pendientes
type PendingChange = {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  id?: number;
  data?: SectorFormData;
  timestamp: number;
};

/**
 * Hook personalizado para la gestión de sectores
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar sectores
 * Incluye manejo de errores de conectividad y modo fallback
 */
export const useSectores = () => {
  // Estados
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  // Cargar cambios pendientes del localStorage
  const loadPendingChanges = useCallback(() => {
    try {
      const storedChanges = localStorage.getItem(PENDING_CHANGES_KEY);
      if (storedChanges) {
        const changes = JSON.parse(storedChanges) as PendingChange[];
        setPendingChanges(changes);
        setHasPendingChanges(changes.length > 0);
      }
    } catch (error) {
      console.error("Error al cargar cambios pendientes:", error);
    }
  }, []);

  // Guardar cambios pendientes en localStorage
  const savePendingChanges = useCallback((changes: PendingChange[]) => {
    try {
      localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(changes));
      setPendingChanges(changes);
      setHasPendingChanges(changes.length > 0);
    } catch (error) {
      console.error("Error al guardar cambios pendientes:", error);
    }
  }, []);

  // Añadir un cambio pendiente
  const addPendingChange = useCallback((change: PendingChange) => {
    const updatedChanges = [...pendingChanges, change];
    savePendingChanges(updatedChanges);
  }, [pendingChanges, savePendingChanges]);

  // Comprobar si hay conexión a Internet
  const checkOnlineStatus = useCallback(() => {
    return window.navigator.onLine;
  }, []);

  // Manejar cambios en el estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log('Conexión a Internet restablecida');
      setIsOfflineMode(false);
      // Intentar sincronizar los cambios pendientes
      sincronizarCambiosPendientes();
    };

    const handleOffline = () => {
      console.log('Conexión a Internet perdida');
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar cambios pendientes al iniciar
    loadPendingChanges();

    // Verificar estado inicial de conexión
    setIsOfflineMode(!checkOnlineStatus());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkOnlineStatus, loadPendingChanges]);

  // Función para sincronizar cambios pendientes con el servidor
  const sincronizarCambiosPendientes = useCallback(async () => {
    if (!checkOnlineStatus() || pendingChanges.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sincronizando cambios pendientes...');
      
      // Ordenar cambios por timestamp
      const sortedChanges = [...pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
      const failedChanges: PendingChange[] = [];

      // Procesar cada cambio secuencialmente
      for (const change of sortedChanges) {
        try {
          switch (change.type) {
            case 'CREATE':
              if (change.data) {
                await authPost(API_URL, change.data);
              }
              break;
            case 'UPDATE':
              if (change.id && change.data) {
                await authPut(`${API_URL}/${change.id}`, change.data);
              }
              break;
            case 'DELETE':
              if (change.id) {
                await authDelete(`${API_URL}/${change.id}`);
              }
              break;
          }
        } catch (error) {
          console.error(`Error al sincronizar cambio ${change.type}:`, error);
          failedChanges.push(change);
        }
      }

      // Actualizar lista de cambios pendientes con solo los que fallaron
      savePendingChanges(failedChanges);

      // Recargar sectores para obtener datos actualizados del servidor
      await cargarSectores();

      console.log('Sincronización completada');
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      setError('Error al sincronizar cambios. Inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [pendingChanges, checkOnlineStatus, savePendingChanges]);

  // Cargar sectores desde la API
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si hay conexión
      if (!checkOnlineStatus()) {
        console.log('Sin conexión a Internet, cargando datos locales');
        setIsOfflineMode(true);
        
        // Cargar datos locales de ejemplo para modo sin conexión
        const sectoresIniciales = [
          { id: 1, nombre: 'SECTOR JERUSALÉN' },
          { id: 2, nombre: 'URB. MANUEL ARÉVALO II' },
          { id: 3, nombre: 'PARQUE INDUSTRIAL' },
        ];
        
        setSectores(sectoresIniciales);
        setLoading(false);
        return;
      }
      
      try {
        // Intentar cargar desde la API
        const data = await authGet(`${API_URL}`);
        
        if (data && Array.isArray(data)) {
          setSectores(data);
          setIsOfflineMode(false);
        } else {
          throw new Error('Formato de datos incorrecto');
        }
      } catch (apiError) {
        console.error('Error al cargar sectores desde API:', apiError);
        
        setIsOfflineMode(true);
        
        // Cargar datos locales de ejemplo para modo sin conexión
        const sectoresIniciales = [
          { id: 1, nombre: 'SECTOR JERUSALÉN' },
          { id: 2, nombre: 'URB. MANUEL ARÉVALO II' },
          { id: 3, nombre: 'PARQUE INDUSTRIAL' },
        ];
        
        setSectores(sectoresIniciales);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los sectores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [checkOnlineStatus]);

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
      
      // Verificar si estamos en modo offline
      if (isOfflineMode || !checkOnlineStatus()) {
        console.log('Guardando en modo offline');
        
        if (modoEdicion && sectorSeleccionado) {
          // Actualizar sector existente localmente
          const sectorActualizado = { 
            ...sectorSeleccionado, 
            ...data 
          };
          
          setSectores(prevSectores => 
            prevSectores.map(s => 
              s.id === sectorSeleccionado.id ? sectorActualizado : s
            )
          );
          
          // Añadir el cambio a la lista de pendientes
          addPendingChange({
            type: 'UPDATE',
            id: sectorSeleccionado.id,
            data,
            timestamp: Date.now()
          });
        } else {
          // Crear nuevo sector localmente
          const nuevoSector: Sector = {
            id: Math.max(0, ...sectores.map(s => s.id || 0)) + 1,
            ...data,
          };
          
          setSectores(prevSectores => [...prevSectores, nuevoSector]);
          
          // Añadir el cambio a la lista de pendientes
          addPendingChange({
            type: 'CREATE',
            data,
            timestamp: Date.now()
          });
        }
        
        limpiarSeleccion();
        setLoading(false);
        return;
      }
      
      // Modo online - intentar guardar en el servidor
      try {
        if (modoEdicion && sectorSeleccionado) {
          // Actualizar sector existente
          const response = await authPut(`${API_URL}/${sectorSeleccionado.id}`, data);
          
          if (response) {
            // Actualizar estado local con datos del servidor
            setSectores(prev => prev.map(s => 
              s.id === sectorSeleccionado.id ? response : s
            ));
          }
        } else {
          // Crear nuevo sector
          const response = await authPost(`${API_URL}`, data);
          
          if (response) {
            // Actualizar estado local con datos del servidor
            setSectores(prev => [...prev, response]);
          }
        }
      } catch (apiError) {
        console.error('Error al guardar sector en API:', apiError);
        setIsOfflineMode(true);
        
        // Pasar al modo offline y guardar localmente
        if (modoEdicion && sectorSeleccionado) {
          // Actualizar sector existente localmente
          const sectorActualizado = { 
            ...sectorSeleccionado, 
            ...data 
          };
          
          setSectores(prevSectores => 
            prevSectores.map(s => 
              s.id === sectorSeleccionado.id ? sectorActualizado : s
            )
          );
          
          // Añadir el cambio a la lista de pendientes
          addPendingChange({
            type: 'UPDATE',
            id: sectorSeleccionado.id,
            data,
            timestamp: Date.now()
          });
        } else {
          // Crear nuevo sector localmente
          const nuevoSector: Sector = {
            id: Math.max(0, ...sectores.map(s => s.id || 0)) + 1,
            ...data,
          };
          
          setSectores(prevSectores => [...prevSectores, nuevoSector]);
          
          // Añadir el cambio a la lista de pendientes
          addPendingChange({
            type: 'CREATE',
            data,
            timestamp: Date.now()
          });
        }
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el sector');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sectores, sectorSeleccionado, modoEdicion, limpiarSeleccion, isOfflineMode, checkOnlineStatus, addPendingChange]);

  // Eliminar un sector
  const eliminarSector = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si estamos en modo offline
      if (isOfflineMode || !checkOnlineStatus()) {
        console.log('Eliminando en modo offline');
        
        // Eliminar sector localmente
        setSectores(prevSectores => prevSectores.filter(s => s.id !== id));
        
        // Añadir el cambio a la lista de pendientes
        addPendingChange({
          type: 'DELETE',
          id,
          timestamp: Date.now()
        });
        
        // Si el sector eliminado estaba seleccionado, limpiamos la selección
        if (sectorSeleccionado?.id === id) {
          limpiarSeleccion();
        }
        
        setLoading(false);
        return;
      }
      
      // Modo online - intentar eliminar en el servidor
      try {
        await authDelete(`${API_URL}/${id}`);
        
        // Actualizar estado local
        setSectores(prevSectores => prevSectores.filter(s => s.id !== id));
      } catch (apiError) {
        console.error('Error al eliminar sector en API:', apiError);
        setIsOfflineMode(true);
        
        // Pasar al modo offline y eliminar localmente
        setSectores(prevSectores => prevSectores.filter(s => s.id !== id));
        
        // Añadir el cambio a la lista de pendientes
        addPendingChange({
          type: 'DELETE',
          id,
          timestamp: Date.now()
        });
      }
      
      // Si el sector eliminado estaba seleccionado, limpiamos la selección
      if (sectorSeleccionado?.id === id) {
        limpiarSeleccion();
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el sector');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sectorSeleccionado, limpiarSeleccion, isOfflineMode, checkOnlineStatus, addPendingChange]);

  // Manejar sincronización manual
  const sincronizarManualmente = useCallback(async () => {
    await sincronizarCambiosPendientes();
    await cargarSectores();
  }, [sincronizarCambiosPendientes, cargarSectores]);

  return {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    hasPendingChanges,
    pendingChangesCount: pendingChanges.length,
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente,
  };
};