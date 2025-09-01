// src/hooks/useAranceles.ts
import { useState, useEffect, useCallback } from 'react';
import arancelService, { ArancelData, CreateArancelDTO, UpdateArancelDTO, CrearArancelApiDTO, ActualizarArancelApiDTO } from '../services/arancelService';

interface UseArancelesResult {
  aranceles: ArancelData[];
  loading: boolean;
  error: string | null;
  
  // Operaciones
  crearArancel: (datos: CreateArancelDTO) => Promise<ArancelData>;
  crearArancelSinAuth: (datos: CrearArancelApiDTO) => Promise<ArancelData>; // Nuevo método sin autenticación
  actualizarArancel: (codArancel: number, datos: UpdateArancelDTO) => Promise<ArancelData>;
  actualizarArancelSinAuth: (datos: ActualizarArancelApiDTO) => Promise<ArancelData>; // Nuevo método PUT sin autenticación
  eliminarArancel: (codArancel: number) => Promise<void>;
  obtenerPorAnioYDireccion: (anio: number, codDireccion: number) => Promise<ArancelData | null>;
  recargar: () => Promise<void>;
  cargarPorAnio: (anio: number) => Promise<void>;
  // Nuevos métodos para la API general
  cargarTodosAranceles: () => Promise<void>;
  buscarAranceles: (parametroBusqueda: string, anio?: number) => Promise<void>;
}

/**
 * Hook para gestionar aranceles
 */
export const useAranceles = (anioInicial?: number): UseArancelesResult => {
  const [aranceles, setAranceles] = useState<ArancelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar aranceles usando GET con query params
  const cargarAranceles = useCallback(async (params?: { 
    anio?: number; 
    codDireccion?: number;
    codUsuario?: number;
    parametroBusqueda?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta para el API GET
      const queryParams = {
        anio: params?.anio || anioInicial,
        codDireccion: params?.codDireccion,
        codUsuario: params?.codUsuario || 1,
        parametroBusqueda: params?.parametroBusqueda || 'a'
      };
      
      console.log('🔄 [useAranceles] Cargando aranceles con query params:', queryParams);
      console.log('📡 [useAranceles] URL ejemplo: http://26.161.18.122:8085/api/arancel?codDireccion=' + 
                  (queryParams.codDireccion || '') + '&anio=' + (queryParams.anio || '') + 
                  '&parametroBusqueda=' + queryParams.parametroBusqueda + '&codUsuario=' + queryParams.codUsuario);
      
      // Hacer petición con los parámetros proporcionados
      const data = await arancelService.listarAranceles(queryParams);
      console.log('✅ [useAranceles] Datos recibidos del API:', data);
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

  // Actualizar arancel usando PUT JSON sin autenticación
  const actualizarArancelSinAuth = useCallback(async (datos: ActualizarArancelApiDTO): Promise<ArancelData> => {
    try {
      console.log('📝 [useAranceles] Actualizando arancel sin autenticación:', datos);
      
      // Validaciones básicas
      if (!datos.codArancel) {
        throw new Error('Debe proporcionar un código de arancel');
      }
      
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }
      
      if (!datos.codDireccion) {
        throw new Error('Debe proporcionar un código de dirección');
      }
      
      if (datos.costo === undefined || datos.costo < 0) {
        throw new Error('Debe proporcionar un costo válido');
      }
      
      const arancelActualizado = await arancelService.actualizarArancelSinAuth(datos);
      
      // Actualizar estado local inmediatamente
      setAranceles(prev => prev.map(arancel => 
        arancel.codArancel === datos.codArancel ? arancelActualizado : arancel
      ));
      
      // Recargar lista para asegurar sincronización
      try {
        console.log('🔄 [useAranceles] Recargando datos después de la actualización...');
        await cargarAranceles({ anio: datos.anio, codDireccion: datos.codDireccion });
        console.log('✅ [useAranceles] Datos recargados exitosamente');
      } catch (err) {
        console.warn('⚠️ [useAranceles] Error recargando datos:', err);
      }
      
      console.log('✅ [useAranceles] Arancel actualizado exitosamente usando API sin autenticación');
      return arancelActualizado;
      
    } catch (error: any) {
      console.error('❌ [useAranceles] Error actualizando arancel sin auth:', error);
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

  // Cargar todos los aranceles usando la nueva API general
  const cargarTodosAranceles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useAranceles] Cargando todos los aranceles con API general');
      
      const data = await arancelService.obtenerTodosAranceles();
      console.log('✅ [useAranceles] Todos los aranceles cargados:', data);
      setAranceles(data);
      
    } catch (error: any) {
      console.error('❌ [useAranceles] Error cargando todos los aranceles:', error);
      setError(error.message || 'Error al cargar todos los aranceles');
      setAranceles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar aranceles con parámetro de búsqueda usando la nueva API
  const buscarAranceles = useCallback(async (parametroBusqueda: string, anio?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useAranceles] Buscando aranceles:', { parametroBusqueda, anio });
      
      const data = await arancelService.listarAranceles({
        parametroBusqueda,
        anio: anio || new Date().getFullYear(),
        codUsuario: 1
      });
      
      console.log('✅ [useAranceles] Aranceles encontrados:', data);
      setAranceles(data);
      
    } catch (error: any) {
      console.error('❌ [useAranceles] Error buscando aranceles:', error);
      setError(error.message || 'Error al buscar aranceles');
      setAranceles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    aranceles,
    loading,
    error,
    crearArancel,
    crearArancelSinAuth, // Nuevo método sin autenticación
    actualizarArancel,
    actualizarArancelSinAuth, // Nuevo método PUT sin autenticación
    eliminarArancel,
    obtenerPorAnioYDireccion,
    recargar: cargarAranceles,
    cargarPorAnio,
    // Nuevos métodos para la API general
    cargarTodosAranceles,
    buscarAranceles
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