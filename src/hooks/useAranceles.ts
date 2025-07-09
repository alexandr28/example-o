// src/hooks/useAranceles.ts
import { useState, useCallback, useEffect } from 'react';
import { arancelService } from '../services/arancelService';
import { NotificationService } from '../components/utils/Notification';

// Tipos
export interface Arancel {
  id: number;
  anio: number;
  direccionId: number;
  monto: number;
  estado: boolean;
  // Datos adicionales de la dirección
  direccion?: {
    codigo: string;
    sector: string;
    barrio: string;
    tipoVia: string;
    nombreVia: string;
    cuadra: number;
    lado: string;
    loteInicial: number;
    loteFinal: number;
  };
}

export interface ArancelFormData {
  anio: number;
  direccionId: number;
  monto: number;
}

export interface ArancelDireccion {
  id: number;
  anio: number;
  direccion: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  monto: number;
  estado: boolean;
}

export const useAranceles = () => {
  // Estados
  const [aranceles, setAranceles] = useState<Arancel[]>([]);
  const [arancelesPorDireccion, setArancelesPorDireccion] = useState<ArancelDireccion[]>([]);
  const [arancelSeleccionado, setArancelSeleccionado] = useState<Arancel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache key
  const CACHE_KEY = 'aranceles_cache';

  // Cargar todos los aranceles
  const cargarAranceles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await arancelService.obtenerTodos();
      setAranceles(data);
      
      // Guardar en caché
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('No se pudo guardar en caché:', e);
      }
      
    } catch (err: any) {
      console.error('Error al cargar aranceles:', err);
      setError(err.message || 'Error al cargar aranceles');
      
      // Intentar cargar desde caché
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          setAranceles(JSON.parse(cached));
          NotificationService.warning('Trabajando sin conexión');
        }
      } catch (e) {
        console.error('Error al cargar caché:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar aranceles por año y dirección
  const buscarArancelesPorDireccion = useCallback(async (anio: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await arancelService.buscarPorAnio(anio);
      
      // Mapear los datos para incluir información de dirección expandida
      const arancelesConDireccion: ArancelDireccion[] = data.map(arancel => ({
        id: arancel.id,
        anio: arancel.anio,
        direccion: formatearDireccionCompleta(arancel.direccion),
        sector: arancel.direccion?.sector || '',
        barrio: arancel.direccion?.barrio || '',
        tipoVia: arancel.direccion?.tipoVia || '',
        nombreVia: arancel.direccion?.nombreVia || '',
        cuadra: arancel.direccion?.cuadra || 0,
        lado: arancel.direccion?.lado || '',
        loteInicial: arancel.direccion?.loteInicial || 0,
        loteFinal: arancel.direccion?.loteFinal || 0,
        monto: arancel.monto,
        estado: arancel.estado
      }));
      
      setArancelesPorDireccion(arancelesConDireccion);
      
    } catch (err: any) {
      console.error('Error al buscar aranceles:', err);
      setError(err.message || 'Error al buscar aranceles');
      setArancelesPorDireccion([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo arancel
  const crearArancel = useCallback(async (datos: ArancelFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const nuevoArancel = await arancelService.crear(datos);
      
      // Actualizar lista
      setAranceles(prev => [...prev, nuevoArancel]);
      
      // Limpiar caché para forzar recarga
      localStorage.removeItem(CACHE_KEY);
      
      NotificationService.success('Arancel creado exitosamente');
      
      // Recargar datos
      await cargarAranceles();
      
      return nuevoArancel;
      
    } catch (err: any) {
      console.error('Error al crear arancel:', err);
      const mensaje = err.message || 'Error al crear arancel';
      setError(mensaje);
      NotificationService.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarAranceles]);

  // Actualizar arancel
  const actualizarArancel = useCallback(async (id: number, datos: Partial<ArancelFormData>) => {
    try {
      setLoading(true);
      setError(null);
      
      const arancelActualizado = await arancelService.actualizar(id, datos);
      
      // Actualizar en la lista
      setAranceles(prev => 
        prev.map(a => a.id === id ? arancelActualizado : a)
      );
      
      // Limpiar caché
      localStorage.removeItem(CACHE_KEY);
      
      NotificationService.success('Arancel actualizado exitosamente');
      
      // Recargar datos
      await cargarAranceles();
      
      return arancelActualizado;
      
    } catch (err: any) {
      console.error('Error al actualizar arancel:', err);
      const mensaje = err.message || 'Error al actualizar arancel';
      setError(mensaje);
      NotificationService.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarAranceles]);

  // Eliminar arancel
  const eliminarArancel = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await arancelService.eliminar(id);
      
      // Actualizar lista
      setAranceles(prev => prev.filter(a => a.id !== id));
      setArancelesPorDireccion(prev => prev.filter(a => a.id !== id));
      
      // Limpiar caché
      localStorage.removeItem(CACHE_KEY);
      
      NotificationService.success('Arancel eliminado exitosamente');
      
    } catch (err: any) {
      console.error('Error al eliminar arancel:', err);
      const mensaje = err.message || 'Error al eliminar arancel';
      setError(mensaje);
      NotificationService.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Seleccionar arancel
  const seleccionarArancel = useCallback((arancel: Arancel | null) => {
    setArancelSeleccionado(arancel);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setArancelSeleccionado(null);
  }, []);

  // Formatear dirección completa
  const formatearDireccionCompleta = (direccion: any): string => {
    if (!direccion) return '';
    
    return `${direccion.sector} + ${direccion.barrio} + ${direccion.tipoVia} + ${direccion.nombreVia} + CUADRA ${direccion.cuadra} + LADO ${direccion.lado} + LT ${direccion.loteInicial} - ${direccion.loteFinal}`;
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarAranceles();
  }, [cargarAranceles]);

  return {
    // Estados
    aranceles,
    arancelesPorDireccion,
    arancelSeleccionado,
    loading,
    error,
    
    // Funciones principales
    cargarAranceles,
    buscarArancelesPorDireccion,
    
    // CRUD
    crearArancel,
    actualizarArancel,
    eliminarArancel,
    
    // Selección
    seleccionarArancel,
    limpiarSeleccion,
    
    // Utils
    refrescar: cargarAranceles
  };
};