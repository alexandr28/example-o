// src/hooks/useAranceles.ts
import { useState, useEffect, useCallback } from 'react';
import arancelService, { ArancelData, CreateArancelDTO, UpdateArancelDTO } from '../services/arancelService';

interface UseArancelesResult {
  aranceles: ArancelData[];
  loading: boolean;
  error: string | null;
  
  // Operaciones
  crearArancel: (datos: CreateArancelDTO) => Promise<ArancelData>;
  actualizarArancel: (codArancel: number, datos: UpdateArancelDTO) => Promise<ArancelData>;
  eliminarArancel: (codArancel: number) => Promise<void>;
  obtenerPorAnioYDireccion: (anio: number, codDireccion: number) => Promise<ArancelData | null>;
  recargar: () => Promise<void>;
}

/**
 * Hook para gestionar aranceles
 */
export const useAranceles = (anioInicial?: number): UseArancelesResult => {
  const [aranceles, setAranceles] = useState<ArancelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar aranceles
  const cargarAranceles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await arancelService.listarAranceles(anioInicial);
      setAranceles(data);
      
    } catch (error: any) {
      console.error('Error cargando aranceles:', error);
      setError(error.message || 'Error al cargar aranceles');
      setAranceles([]);
    } finally {
      setLoading(false);
    }
  }, [anioInicial]);

  // Cargar al montar y cuando cambie el año
  useEffect(() => {
    cargarAranceles();
  }, [cargarAranceles]);

  // Crear arancel
  const crearArancel = useCallback(async (datos: CreateArancelDTO): Promise<ArancelData> => {
    try {
      const nuevoArancel = await arancelService.crearArancel(datos);
      
      // Recargar lista
      await cargarAranceles();
      
      return nuevoArancel;
    } catch (error: any) {
      console.error('Error creando arancel:', error);
      throw error;
    }
  }, [cargarAranceles]);

  // Actualizar arancel
  const actualizarArancel = useCallback(async (
    codArancel: number, 
    datos: UpdateArancelDTO
  ): Promise<ArancelData> => {
    try {
      const arancelActualizado = await arancelService.actualizarArancel(codArancel, datos);
      
      // Actualizar en el estado local
      setAranceles(prev => prev.map(a => 
        a.codArancel === codArancel ? arancelActualizado : a
      ));
      
      return arancelActualizado;
    } catch (error: any) {
      console.error('Error actualizando arancel:', error);
      throw error;
    }
  }, []);

  // Eliminar arancel
  const eliminarArancel = useCallback(async (codArancel: number): Promise<void> => {
    try {
      await arancelService.eliminarArancel(codArancel);
      
      // Eliminar del estado local
      setAranceles(prev => prev.filter(a => a.codArancel !== codArancel));
      
    } catch (error: any) {
      console.error('Error eliminando arancel:', error);
      throw error;
    }
  }, []);

  // Obtener por año y dirección
  const obtenerPorAnioYDireccion = useCallback(async (
    anio: number, 
    codDireccion: number
  ): Promise<ArancelData | null> => {
    try {
      return await arancelService.obtenerPorAnioYDireccion(anio, codDireccion);
    } catch (error: any) {
      console.error('Error obteniendo arancel:', error);
      return null;
    }
  }, []);

  return {
    aranceles,
    loading,
    error,
    crearArancel,
    actualizarArancel,
    eliminarArancel,
    obtenerPorAnioYDireccion,
    recargar: cargarAranceles
  };
};

/**
 * Hook para obtener un arancel específico
 */
export const useArancel = (anio: number, codDireccion: number) => {
  const [arancel, setArancel] = useState<ArancelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarArancel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await arancelService.obtenerPorAnioYDireccion(anio, codDireccion);
        setArancel(data);
        
      } catch (error: any) {
        console.error('Error cargando arancel:', error);
        setError(error.message || 'Error al cargar el arancel');
        setArancel(null);
      } finally {
        setLoading(false);
      }
    };

    if (anio && codDireccion) {
      cargarArancel();
    }
  }, [anio, codDireccion]);

  return { arancel, loading, error };
};