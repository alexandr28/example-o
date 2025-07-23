// src/hooks/useUIT.ts
import { useState, useEffect, useCallback } from 'react';
import { uitService, UITData, CreateUITDTO, UpdateUITDTO } from '../services/uitService';
import { NotificationService } from '../components/utils/Notification';

interface UseUITResult {
  // Estados
  uits: UITData[];
  uitSeleccionada: UITData | null;
  uitVigente: UITData | null;
  loading: boolean;
  error: string | null;
  
  // Métodos principales
  cargarUITs: (anio?: number) => Promise<void>;
  cargarHistorial: (anioInicio?: number, anioFin?: number) => Promise<void>;
  crearUIT: (datos: CreateUITDTO) => Promise<UITData>;
  actualizarUIT: (id: number, datos: UpdateUITDTO) => Promise<UITData>;
  eliminarUIT: (id: number) => Promise<void>;
  
  // Métodos de selección
  seleccionarUIT: (uit: UITData | null) => void;
  
  // Métodos de cálculo
  calcularMontoUIT: (cantidadUITs: number, anio?: number) => Promise<{ valor: number; uitUsado: UITData }>;
  
  // Estadísticas
  obtenerEstadisticas: () => Promise<{
    total: number;
    activos: number;
    inactivos: number;
    uitActual: UITData | null;
    promedioUltimos5Anios: number;
    incrementoAnual: number;
  }>;
}

/**
 * Hook para gestionar valores UIT
 */
export const useUIT = (): UseUITResult => {
  const [uits, setUits] = useState<UITData[]>([]);
  const [uitSeleccionada, setUitSeleccionada] = useState<UITData | null>(null);
  const [uitVigente, setUitVigente] = useState<UITData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar UITs por año
  const cargarUITs = useCallback(async (anio?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await uitService.listarUITs(anio);
      setUits(data);
      
      // Si no hay año específico, actualizar UIT vigente
      if (!anio) {
        const vigente = await uitService.obtenerVigente();
        setUitVigente(vigente);
      }
      
    } catch (error: any) {
      console.error('Error cargando UITs:', error);
      setError(error.message || 'Error al cargar los valores UIT');
      setUits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar historial de UITs
  const cargarHistorial = useCallback(async (anioInicio?: number, anioFin?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await uitService.obtenerHistorial(anioInicio, anioFin);
      setUits(data);
      
    } catch (error: any) {
      console.error('Error cargando historial:', error);
      setError(error.message || 'Error al cargar el historial');
      setUits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar UIT vigente al montar
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const vigente = await uitService.obtenerVigente();
        setUitVigente(vigente);
        
        // Cargar también los últimos 5 años
        const anioActual = new Date().getFullYear();
        await cargarHistorial(anioActual - 5, anioActual);
      } catch (error) {
        console.error('Error en carga inicial:', error);
      }
    };
    
    cargarInicial();
  }, [cargarHistorial]);

  // Crear UIT
  const crearUIT = useCallback(async (datos: CreateUITDTO): Promise<UITData> => {
    try {
      const nuevoUIT = await uitService.crearUIT(datos);
      
      // Recargar lista
      await cargarUITs();
      
      // Si es del año actual, actualizar UIT vigente
      if (datos.anio === new Date().getFullYear()) {
        setUitVigente(nuevoUIT);
      }
      
      return nuevoUIT;
    } catch (error: any) {
      console.error('Error creando UIT:', error);
      throw error;
    }
  }, [cargarUITs]);

  // Actualizar UIT
  const actualizarUIT = useCallback(async (id: number, datos: UpdateUITDTO): Promise<UITData> => {
    try {
      const uitActualizada = await uitService.actualizarUIT(id, datos);
      
      // Actualizar en el estado local
      setUits(prev => prev.map(u => 
        u.id === id ? uitActualizada : u
      ));
      
      // Si es la seleccionada, actualizar
      if (uitSeleccionada?.id === id) {
        setUitSeleccionada(uitActualizada);
      }
      
      // Si es la vigente, actualizar
      if (uitVigente?.id === id) {
        setUitVigente(uitActualizada);
      }
      
      return uitActualizada;
    } catch (error: any) {
      console.error('Error actualizando UIT:', error);
      throw error;
    }
  }, [uitSeleccionada, uitVigente]);

  // Eliminar UIT
  const eliminarUIT = useCallback(async (id: number) => {
    try {
      await uitService.eliminarUIT(id);
      
      // Actualizar estado local
      setUits(prev => prev.map(u => 
        u.id === id ? { ...u, estado: 'INACTIVO' } : u
      ));
      
      // Si es la seleccionada, limpiar
      if (uitSeleccionada?.id === id) {
        setUitSeleccionada(null);
      }
      
    } catch (error: any) {
      console.error('Error eliminando UIT:', error);
      throw error;
    }
  }, [uitSeleccionada]);

  // Seleccionar UIT
  const seleccionarUIT = useCallback((uit: UITData | null) => {
    setUitSeleccionada(uit);
  }, []);

  // Calcular monto UIT
  const calcularMontoUIT = useCallback(async (cantidadUITs: number, anio?: number) => {
    return await uitService.calcularMontoUIT(cantidadUITs, anio);
  }, []);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(async () => {
    return await uitService.obtenerEstadisticas();
  }, []);

  return {
    // Estados
    uits,
    uitSeleccionada,
    uitVigente,
    loading,
    error,
    
    // Métodos
    cargarUITs,
    cargarHistorial,
    crearUIT,
    actualizarUIT,
    eliminarUIT,
    seleccionarUIT,
    calcularMontoUIT,
    obtenerEstadisticas
  };
};

/**
 * Hook para obtener un UIT específico por año
 */
export const useUITPorAnio = (anio: number) => {
  const [uit, setUit] = useState<UITData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarUIT = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await uitService.obtenerPorAnio(anio);
        setUit(data);
        
      } catch (error: any) {
        console.error('Error cargando UIT:', error);
        setError(error.message || 'Error al cargar el valor UIT');
        setUit(null);
      } finally {
        setLoading(false);
      }
    };

    if (anio) {
      cargarUIT();
    }
  }, [anio]);

  return { uit, loading, error };
};