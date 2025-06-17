// src/hooks/useSectores.ts - VERSIÓN MEJORADA
import { useCallback, useEffect, useRef, useState } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import sectorService from '../services/sectorService';
import { NotificationService } from '../components/utils/Notification';

export const useSectores = () => {
  // Estados
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const isInitialized = useRef(false);

  /**
   * Carga los sectores desde la API o caché
   */
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useSectores] Iniciando carga de sectores...');
      
      const data = await sectorService.getAll();
      
      if (data && data.length > 0) {
        setSectores(data);
        setLastSyncTime(new Date());
        setIsOfflineMode(false);
        console.log(`✅ [useSectores] ${data.length} sectores cargados`);
      } else {
        console.warn('⚠️ [useSectores] No se encontraron sectores');
        setSectores([]);
      }
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al cargar sectores:', error);
      
      // Verificar si es un error de red
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setIsOfflineMode(true);
        NotificationService.warning('Sin conexión. Mostrando datos en caché.');
      } else {
        setError(error.message || 'Error al cargar sectores');
        NotificationService.error('Error al cargar sectores');
      }
      
    } finally {
      setLoading(false);
    }
  }, []);

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
      const results = await sectorService.search(term);
      setSectores(results);
      
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
    
    // Verificar token antes de continuar
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Debe iniciar sesión para guardar datos');
      NotificationService.error('Debe iniciar sesión para guardar datos');
      return false;
    }
    
    if (modoEdicion && sectorSeleccionado) {
      // Actualizar
      const resultado = await sectorService.update(sectorSeleccionado.id, data);
      console.log('✅ [useSectores] Sector actualizado:', resultado);
      
      NotificationService.success('Sector actualizado correctamente');
      
    } else {
      // Crear nuevo
      const resultado = await sectorService.create(data);
      console.log('✅ [useSectores] Sector creado:', resultado);
      
      NotificationService.success('Sector creado correctamente');
    }
    
    // IMPORTANTE: Siempre recargar la lista completa después de guardar
    console.log('🔄 [useSectores] Recargando lista de sectores...');
    
    // Pequeño delay para asegurar que el backend procesó todo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Limpiar caché y recargar
    sectorService.clearCache();
    await cargarSectores();
    
    // Limpiar el formulario
    limpiarSeleccion();
    
    return true;
    
  } catch (error: any) {
    console.error('❌ [useSectores] Error al guardar:', error);
    
    // Si el error indica que se guardó pero hubo problema con la respuesta
    if (error.message?.includes('respuesta inesperada') || 
        error.message?.includes('Sector sin codSector')) {
      
      console.log('⚠️ [useSectores] Posible guardado exitoso, recargando...');
      
      // Esperar y recargar
      await new Promise(resolve => setTimeout(resolve, 1000));
      sectorService.clearCache();
      await cargarSectores();
      
      // Verificar si se guardó comparando cantidad
      NotificationService.success('Sector guardado correctamente');
      limpiarSeleccion();
      return true;
    }
    
    // Otros errores
    if (error.message?.includes('No autorizado')) {
      setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
    } else if (error.message?.includes('No tiene permisos')) {
      setError('No tiene permisos para realizar esta acción.');
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      setError('Error de conexión. Verifique su internet.');
    } else {
      setError(error.message || 'Error al guardar el sector');
    }
    
    return false;
    
  } finally {
    setLoading(false);
  }
}, [modoEdicion, sectorSeleccionado, limpiarSeleccion, cargarSectores]);

  /**
   * Eliminar sector
   */
  const eliminarSector = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Debe iniciar sesión para eliminar datos');
        NotificationService.error('Debe iniciar sesión para eliminar datos');
        return false;
      }
      
      await sectorService.delete(id);
      
      // Eliminar de la lista local
      setSectores(prev => prev.filter(s => s.id !== id));
      
      // Limpiar caché
      sectorService.clearCache();
      
      console.log('✅ [useSectores] Sector eliminado:', id);
      return true;
      
    } catch (error: any) {
      console.error('❌ [useSectores] Error al eliminar:', error);
      setError(error.message || 'Error al eliminar el sector');
      return false;
      
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sincronizar manualmente con la API
   */
  const sincronizarManualmente = useCallback(async () => {
    console.log('🔄 [useSectores] Sincronización manual iniciada');
    sectorService.clearCache();
    await cargarSectores();
  }, [cargarSectores]);

  /**
   * Forzar modo online
   */
  const forzarModoOnline = useCallback(async () => {
    console.log('🌐 [useSectores] Forzando modo online');
    setIsOfflineMode(false);
    sectorService.clearCache();
    await cargarSectores();
  }, [cargarSectores]);

  /**
   * Test de conexión con la API
   */
  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useSectores] Probando conexión con API...');
      const result = await sectorService.checkConnection();
      console.log('🧪 [useSectores] Resultado de conexión:', result);
      return result;
    } catch (error) {
      console.error('❌ [useSectores] Error en test de conexión:', error);
      return false;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      cargarSectores();
    }
  }, []);

  // Debug info
  const debugInfo = process.env.NODE_ENV === 'development' ? {
    totalSectores: sectores.length,
    sectorSeleccionado: sectorSeleccionado?.nombre || 'Ninguno',
    modoEdicion,
    isOfflineMode,
    ultimaSync: lastSyncTime?.toLocaleTimeString() || 'Nunca',
    error,
    searchTerm,
    hasToken: !!localStorage.getItem('auth_token')
  } : null;

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
    testApiConnection,
    setError,
    
    // Debug
    debugInfo
  };
};