// src/hooks/useDirecciones.ts
import { useState, useCallback, useEffect } from 'react';
import { direccionService } from '../services/direccionService';
import { NotificationService } from '../components/utils/Notification';

// Tipos
export interface Direccion {
  id: number;
  codigo: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  estado: number;
  // Datos adicionales para edición
  codSector?: number;
  codBarrio?: number;
  codTipoVia?: number;
}

export interface DireccionFormData {
  sector: string;
  barrio: string;
  calleMz: string;
  cuadra: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
}

interface FiltrosDireccion {
  sector?: string;
  barrio?: string;
  nombreVia?: string;
  tipoVia?: string;
}

/**
 * Hook personalizado para gestionar direcciones
 */
export const useDirecciones = () => {
  // Estados principales
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Cache key
  const CACHE_KEY = 'direcciones_cache';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // Verificar si el cache es válido
  const isCacheValid = useCallback((): boolean => {
    try {
      const cacheTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      if (!cacheTimestamp) return false;
      
      const now = new Date().getTime();
      const cacheTime = parseInt(cacheTimestamp);
      return (now - cacheTime) < CACHE_TTL;
    } catch {
      return false;
    }
  }, []);

  // Cargar direcciones desde caché
  const cargarDesdeCache = useCallback((): boolean => {
    try {
      if (!isCacheValid()) {
        console.log('📦 Cache expirado o no válido');
        return false;
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setDirecciones(data);
        console.log(`📦 ${data.length} direcciones cargadas desde caché`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al cargar caché:', error);
      return false;
    }
  }, [isCacheValid]);

  // Guardar en caché
  const guardarEnCache = useCallback((data: Direccion[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, new Date().getTime().toString());
      console.log('💾 Direcciones guardadas en caché');
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  }, []);

  // Limpiar caché
  const limpiarCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(`${CACHE_KEY}_timestamp`);
      console.log('🧹 Caché limpiado');
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }, []);

  // Cargar todas las direcciones
  const cargarDirecciones = useCallback(async (forzarRecarga: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar desde caché si no se fuerza recarga
      if (!forzarRecarga && cargarDesdeCache()) {
        setIsOfflineMode(false);
        return;
      }

      console.log('🔄 Cargando direcciones desde el servidor...');
      const data = await direccionService.obtenerTodas();
      
      if (Array.isArray(data)) {
        setDirecciones(data);
        setIsOfflineMode(false);
        guardarEnCache(data);
        console.log(`✅ ${data.length} direcciones cargadas del servidor`);
      } else {
        throw new Error('Formato de datos incorrecto');
      }
    } catch (err: any) {
      console.error('❌ Error al cargar direcciones:', err);
      setError(err.message || 'Error al cargar direcciones');
      
      // Intentar cargar desde caché en caso de error
      if (cargarDesdeCache()) {
        NotificationService.warning('Trabajando sin conexión - Datos desde caché');
        setIsOfflineMode(true);
      } else {
        NotificationService.error('Error al cargar direcciones');
        setDirecciones([]);
      }
    } finally {
      setLoading(false);
    }
  }, [cargarDesdeCache, guardarEnCache]);

  // Buscar direcciones por nombre de vía
  const buscarPorNombreVia = useCallback(async (nombreVia: string) => {
    if (!nombreVia || nombreVia.trim().length < 2) {
      await cargarDirecciones();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await direccionService.buscarPorNombreVia(nombreVia);
      setDirecciones(data);
      
      console.log(`✅ ${data.length} direcciones encontradas para "${nombreVia}"`);
      
      if (data.length === 0) {
        NotificationService.info(`No se encontraron direcciones con "${nombreVia}"`);
      }
    } catch (err: any) {
      console.error('❌ Error al buscar:', err);
      setError(err.message || 'Error al buscar direcciones');
      
      // Búsqueda local en modo offline
      if (isOfflineMode) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const allData = JSON.parse(cached);
          const filtered = allData.filter((d: Direccion) => 
            d.nombreVia.toLowerCase().includes(nombreVia.toLowerCase())
          );
          setDirecciones(filtered);
          NotificationService.info(`${filtered.length} resultados desde caché`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isOfflineMode, cargarDirecciones]);

  // Buscar direcciones con filtros combinados
  const buscarConFiltros = useCallback(async (filtros: FiltrosDireccion) => {
    try {
      setLoading(true);
      setError(null);

      const data = await direccionService.buscar(filtros);
      setDirecciones(data);
      
      console.log(`✅ ${data.length} direcciones encontradas con filtros`);
      
      if (data.length === 0) {
        NotificationService.info('No se encontraron direcciones con los criterios especificados');
      }
    } catch (err: any) {
      console.error('❌ Error al buscar con filtros:', err);
      setError(err.message || 'Error al buscar direcciones');
      
      // Búsqueda local en caso de error
      if (isOfflineMode) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const allData: Direccion[] = JSON.parse(cached);
          let filtered = allData;
          
          if (filtros.sector) {
            filtered = filtered.filter(d => d.sector === filtros.sector);
          }
          if (filtros.barrio) {
            filtered = filtered.filter(d => d.barrio === filtros.barrio);
          }
          if (filtros.nombreVia) {
            filtered = filtered.filter(d => 
              d.nombreVia.toLowerCase().includes(filtros.nombreVia!.toLowerCase())
            );
          }
          if (filtros.tipoVia) {
            filtered = filtered.filter(d => d.tipoVia === filtros.tipoVia);
          }
          
          setDirecciones(filtered);
          NotificationService.info(`${filtered.length} resultados desde caché`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isOfflineMode]);

  // Obtener una dirección por código
  const obtenerPorCodigo = useCallback(async (codigo: number): Promise<Direccion | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await direccionService.obtenerPorCodigo(codigo);
      return data;
    } catch (err: any) {
      console.error('❌ Error al obtener dirección:', err);
      setError(err.message || 'Error al obtener dirección');
      
      // Buscar en caché
      const direccion = direcciones.find(d => d.id === codigo);
      if (direccion) {
        return direccion;
      }
      
      // Si no está en la lista actual, buscar en caché completo
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const allData: Direccion[] = JSON.parse(cached);
        return allData.find(d => d.id === codigo) || null;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [direcciones]);

  // Crear dirección
  const crearDireccion = useCallback(async (datos: DireccionFormData): Promise<Direccion | null> => {
    try {
      setLoading(true);
      setError(null);

      const nuevaDireccion = await direccionService.crear(datos);
      
      // Actualizar lista agregando la nueva dirección
      setDirecciones(prev => [...prev, nuevaDireccion]);
      
      // Limpiar caché para forzar recarga
      limpiarCache();
      
      NotificationService.success('Dirección creada exitosamente');
      return nuevaDireccion;
    } catch (err: any) {
      console.error('❌ Error al crear:', err);
      const mensaje = err.message || 'Error al crear dirección';
      setError(mensaje);
      NotificationService.error(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  }, [limpiarCache]);

  // Actualizar dirección
  const actualizarDireccion = useCallback(async (codigo: number, datos: DireccionFormData): Promise<Direccion | null> => {
    try {
      setLoading(true);
      setError(null);

      const direccionActualizada = await direccionService.actualizar(codigo, datos);
      
      // Actualizar en la lista
      setDirecciones(prev => 
        prev.map(d => d.id === codigo ? direccionActualizada : d)
      );
      
      // Limpiar caché
      limpiarCache();
      
      NotificationService.success('Dirección actualizada exitosamente');
      return direccionActualizada;
    } catch (err: any) {
      console.error('❌ Error al actualizar:', err);
      const mensaje = err.message || 'Error al actualizar dirección';
      setError(mensaje);
      NotificationService.error(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  }, [limpiarCache]);

  // Eliminar dirección
  const eliminarDireccion = useCallback(async (codigo: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await direccionService.eliminar(codigo);
      
      // Actualizar lista
      setDirecciones(prev => prev.filter(d => d.id !== codigo));
      
      // Limpiar caché
      limpiarCache();
      
      NotificationService.success('Dirección eliminada exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error al eliminar:', err);
      const mensaje = err.message || 'Error al eliminar dirección';
      setError(mensaje);
      NotificationService.error(mensaje);
      return false;
    } finally {
      setLoading(false);
    }
  }, [limpiarCache]);

  // Seleccionar dirección
  const seleccionarDireccion = useCallback((direccion: Direccion | null) => {
    setDireccionSeleccionada(direccion);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setDireccionSeleccionada(null);
  }, []);

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDirecciones();
  }, []);

  return {
    // Estados
    direcciones,
    direccionSeleccionada,
    loading,
    error,
    isOfflineMode,
    
    // Funciones principales
    cargarDirecciones,
    buscarPorNombreVia,
    buscarConFiltros,
    obtenerPorCodigo,
    
    // CRUD
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion,
    
    // Selección
    seleccionarDireccion,
    limpiarSeleccion,
    
    // Utilidades
    limpiarError,
    limpiarCache,
    refrescar: () => cargarDirecciones(true),
    totalDirecciones: direcciones.length
  };
};