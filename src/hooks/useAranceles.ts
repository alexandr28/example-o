// src/hooks/useAranceles.ts
import { useState, useEffect, useCallback } from 'react';
import arancelService, { ArancelData, CreateArancelDTO, UpdateArancelDTO, CrearArancelApiDTO } from '../services/arancelService';

interface UseArancelesResult {
  aranceles: ArancelData[];
  loading: boolean;
  error: string | null;
  
  // Operaciones
  crearArancel: (datos: CreateArancelDTO) => Promise<ArancelData>;
  crearArancelSinAuth: (datos: CrearArancelApiDTO) => Promise<ArancelData>; // Nuevo método sin autenticación
  actualizarArancel: (codArancel: number, datos: UpdateArancelDTO) => Promise<ArancelData>;
  eliminarArancel: (codArancel: number) => Promise<void>;
  obtenerPorAnioYDireccion: (anio: number, codDireccion: number) => Promise<ArancelData | null>;
  recargar: () => Promise<void>;
  cargarPorAnio: (anio: number) => Promise<void>;
}

/**
 * Hook para gestionar aranceles
 */
export const useAranceles = (anioInicial?: number): UseArancelesResult => {
  const [aranceles, setAranceles] = useState<ArancelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar aranceles con parámetros flexibles
  const cargarAranceles = useCallback(async (params?: { 
    anio?: number; 
    codDireccion?: number 
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // IMPORTANTE: El API requiere codDireccion para evitar error 403
      const queryParams = {
        anio: params?.anio || anioInicial,
        codDireccion: params?.codDireccion || 1, // Valor por defecto para evitar 403
        codUsuario: 1
      };
      
      console.log('🔄 [useAranceles] Cargando aranceles con parámetros:', queryParams);
      
      // Solo hacer la petición si tenemos al menos el año
      if (!queryParams.anio) {
        console.log('⚠️ [useAranceles] No se proporcionó año, saltando petición');
        setAranceles([]);
        return;
      }
      
      const data = await arancelService.listarAranceles(queryParams);
      console.log('✅ [useAranceles] Datos recibidos:', data);
      setAranceles(data);
      
    } catch (error: any) {
      console.error('❌ [useAranceles] Error cargando aranceles:', error);
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

  // Crear arancel (método original con FormData)
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

  // Crear arancel sin autenticación usando JSON POST
  const crearArancelSinAuth = useCallback(async (datos: CrearArancelApiDTO): Promise<ArancelData> => {
    try {
      console.log('➕ [useAranceles] Creando arancel sin autenticación:', datos);
      
      // Validaciones básicas
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }
      
      if (!datos.codDireccion) {
        throw new Error('Debe proporcionar un código de dirección');
      }
      
      if (datos.costo === undefined || datos.costo < 0) {
        throw new Error('Debe proporcionar un costo válido');
      }
      
      const nuevoArancel = await arancelService.crearArancelSinAuth(datos);
      
      // Actualizar estado local inmediatamente
      setAranceles(prev => [...prev, nuevoArancel]);
      
      // Recargar lista para asegurar sincronización
      try {
        console.log('🔄 [useAranceles] Recargando datos después del registro...');
        await cargarAranceles({ anio: datos.anio });
        console.log('✅ [useAranceles] Datos recargados exitosamente');
      } catch (err) {
        console.warn('⚠️ [useAranceles] Error recargando datos:', err);
      }
      
      console.log('✅ [useAranceles] Arancel creado exitosamente usando API sin autenticación');
      return nuevoArancel;
      
    } catch (error: any) {
      console.error('❌ [useAranceles] Error creando arancel sin auth:', error);
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

  // Función específica para cargar por año (usado por ListaArancelesPorDireccion)
  const cargarPorAnio = useCallback(async (anio: number) => {
    await cargarAranceles({ anio, codDireccion: 1 });
  }, [cargarAranceles]);

  return {
    aranceles,
    loading,
    error,
    crearArancel,
    crearArancelSinAuth, // Nuevo método sin autenticación
    actualizarArancel,
    eliminarArancel,
    obtenerPorAnioYDireccion,
    recargar: cargarAranceles,
    cargarPorAnio
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