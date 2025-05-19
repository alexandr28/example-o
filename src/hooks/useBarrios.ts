import { useState, useCallback, useEffect } from 'react';
import { Barrio, BarrioFormData, Sector } from '../models';
import { API_BASE_URL } from './../config/constants';
import { authGet, authPost, authPut, authDelete } from '../api/authClient';
import { 
  ApiResponse, 
  ApiErrorResponse,

} from '../types/apiTypes';

// URLs de los endpoints
const BARRIOS_API_URL = `${API_BASE_URL}/barrios`;
const SECTORES_API_URL = `${API_BASE_URL}/sectores`;

/**
 * Hook personalizado para la gestión de barrios
 * 
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar barrios
 */
export const useBarrios = () => {
  // Estados
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<Barrio | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cargar barrios desde la API
  const cargarBarrios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición a la API utilizando el cliente autenticado
      const response = await authGet(`${BARRIOS_API_URL}`) as ApiResponse<Barrio[]>;
      
      if (response && response.success === true) {
        setBarrios(response.data);
      } else {
        const errorResponse = response as ApiErrorResponse;
        throw new Error(errorResponse?.message || 'Error al cargar los barrios');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al cargar los barrios');
      console.error('Error en cargarBarrios:', error);
      
      // Modo fallback: Si hay un error de red, usar datos de caché local si existen
      const cachedBarrios = localStorage.getItem('cachedBarrios');
      if (cachedBarrios) {
        try {
          setBarrios(JSON.parse(cachedBarrios));
        } catch (cacheErr) {
          console.error('Error al cargar barrios desde caché:', cacheErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar sectores desde la API
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición a la API utilizando el cliente autenticado
      const response = await authGet(`${SECTORES_API_URL}`) as ApiResponse<Sector[]>;
      
      if (response && response.success === true) {
        setSectores(response.data);
      } else {
        const errorResponse = response as ApiErrorResponse;
        throw new Error(errorResponse?.message || 'Error al cargar los sectores');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al cargar los sectores');
      console.error('Error en cargarSectores:', error);
      
      // Modo fallback: Si hay un error de red, usar datos de caché local si existen
      const cachedSectores = localStorage.getItem('cachedSectores');
      if (cachedSectores) {
        try {
          setSectores(JSON.parse(cachedSectores));
        } catch (cacheErr) {
          console.error('Error al cargar sectores desde caché:', cacheErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    cargarSectores();
    cargarBarrios();
  }, [cargarSectores, cargarBarrios]);

  // Efecto para guardar en caché local los datos cargados
  useEffect(() => {
    if (barrios.length > 0) {
      localStorage.setItem('cachedBarrios', JSON.stringify(barrios));
    }
  }, [barrios]);

  useEffect(() => {
    if (sectores.length > 0) {
      localStorage.setItem('cachedSectores', JSON.stringify(sectores));
    }
  }, [sectores]);

  // Seleccionar un barrio para editar
  const seleccionarBarrio = useCallback((barrio: Barrio) => {
    setBarrioSeleccionado(barrio);
    setModoEdicion(true);
  }, []);

  // Limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setBarrioSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Manejar cambio en el término de búsqueda
  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  // Filtrar barrios por término de búsqueda (búsqueda local)
  const filtrarBarriosLocalmente = useCallback(() => {
    if (!searchTerm.trim()) return barrios;
    
    return barrios.filter(barrio => 
      barrio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (barrio.sector?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  }, [barrios, searchTerm]);

  // Guardar un barrio (crear o actualizar)
  const guardarBarrio = useCallback(async (data: BarrioFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Encontrar el sector correspondiente
      const sectorSeleccionado = sectores.find(s => s.id === parseInt(data.sectorId.toString()));
      
      if (!sectorSeleccionado) {
        throw new Error('Sector no encontrado');
      }
      
      // Preparamos los datos para enviar a la API
      const barrioData = {
        ...data,
        sectorId: parseInt(data.sectorId.toString()) // Aseguramos que sectorId sea un número
      };
      
      let response: ApiResponse<Barrio>;
      
      if (modoEdicion && barrioSeleccionado) {
        // Actualizar barrio existente mediante PUT
        response = await authPut(`${BARRIOS_API_URL}/${barrioSeleccionado.id}`, barrioData) as ApiResponse<Barrio>;
        
        if (response && response.success === true) {
          // Actualizamos el estado local con los datos devueltos por la API
          setBarrios(prevBarrios => 
            prevBarrios.map(b => 
              b.id === barrioSeleccionado.id 
                ? { ...response.data, sector: sectorSeleccionado } 
                : b
            )
          );
        } else {
          const errorResponse = response as ApiErrorResponse;
          throw new Error(errorResponse?.message || 'Error al actualizar el barrio');
        }
      } else {
        // Crear nuevo barrio mediante POST
        response = await authPost(BARRIOS_API_URL, barrioData) as ApiResponse<Barrio>;
        
        if (response && response.success === true) {
          // Añadimos el nuevo barrio al estado local con los datos devueltos por la API
          const nuevoBarrio = {
            ...response.data,
            sector: sectorSeleccionado
          };
          
          setBarrios(prevBarrios => [...prevBarrios, nuevoBarrio]);
        } else {
          const errorResponse = response as ApiErrorResponse;
          throw new Error(errorResponse?.message || 'Error al crear el barrio');
        }
      }
      
      // Actualizar caché local
      const updatedBarriosResponse = await authGet(BARRIOS_API_URL) as ApiResponse<Barrio[]>;
      if (updatedBarriosResponse && updatedBarriosResponse.success === true) {
        localStorage.setItem('cachedBarrios', JSON.stringify(updatedBarriosResponse.data));
      }
      
      // Resetear estados
      limpiarSeleccion();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al guardar el barrio');
      console.error('Error en guardarBarrio:', error);
    } finally {
      setLoading(false);
    }
  }, [barrios, barrioSeleccionado, modoEdicion, limpiarSeleccion, sectores]);

  // Eliminar un barrio
  const eliminarBarrio = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición DELETE a la API
      const response = await authDelete(`${BARRIOS_API_URL}/${id}`) as ApiResponse<Record<string, never>>;
      
      if (response && response.success === true) {
        // Actualizamos el estado local removiendo el barrio eliminado
        setBarrios(prevBarrios => prevBarrios.filter(b => b.id !== id));
        
        // Actualizar caché local
        const updatedBarriosResponse = await authGet(BARRIOS_API_URL) as ApiResponse<Barrio[]>;
        if (updatedBarriosResponse && updatedBarriosResponse.success === true) {
          localStorage.setItem('cachedBarrios', JSON.stringify(updatedBarriosResponse.data));
        }
        
        // Si el barrio eliminado estaba seleccionado, limpiamos la selección
        if (barrioSeleccionado?.id === id) {
          limpiarSeleccion();
        }
      } else {
        const errorResponse = response as ApiErrorResponse;
        throw new Error(errorResponse?.message || 'Error al eliminar el barrio');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al eliminar el barrio');
      console.error('Error en eliminarBarrio:', error);
    } finally {
      setLoading(false);
    }
  }, [barrioSeleccionado, limpiarSeleccion]);

  // Obtener barrio por ID
  const obtenerBarrioPorId = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Petición GET a la API para obtener un barrio específico
      const response = await authGet(`${BARRIOS_API_URL}/${id}`) as ApiResponse<Barrio>;
      
      if (response && response.success === true) {
        // Buscar el sector correspondiente para incluirlo en el objeto barrio
        const sector = sectores.find(s => s.id === response.data.sectorId);
        
        // Retornar el barrio con su sector asociado
        return {
          ...response.data,
          sector
        };
      } else {
        const errorResponse = response as ApiErrorResponse;
        throw new Error(errorResponse?.message || 'Error al obtener el barrio');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al obtener el barrio');
      console.error('Error en obtenerBarrioPorId:', error);
      
      // Si hay un error, buscar en el estado local
      return barrios.find(b => b.id === id) || null;
    } finally {
      setLoading(false);
    }
  }, [barrios, sectores]);

  // Buscar barrios por término en la API
  const buscarBarrios = useCallback(async () => {
    try {
      if (!searchTerm.trim()) {
        await cargarBarrios();
        return barrios;
      }
      
      setLoading(true);
      setError(null);
      
      // Petición GET a la API con parámetro de búsqueda
      const response = await authGet(`${BARRIOS_API_URL}?search=${encodeURIComponent(searchTerm)}`) as ApiResponse<Barrio[]>;
      
      if (response && response.success === true) {
        // Actualizar el estado con los resultados de la búsqueda
        setBarrios(response.data);
        return response.data;
      } else {
        const errorResponse = response as ApiErrorResponse;
        throw new Error(errorResponse?.message || 'Error al buscar barrios');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al buscar barrios');
      console.error('Error en buscarBarrios:', error);
      
      // Si hay un error, realizar búsqueda local
      return filtrarBarriosLocalmente();
    } finally {
      setLoading(false);
    }
  }, [barrios, searchTerm, cargarBarrios, filtrarBarriosLocalmente]);

  return {
    barrios,
    sectores,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    searchTerm,
    cargarBarrios,
    cargarSectores,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    obtenerBarrioPorId,
    buscarBarrios,
    handleSearchTermChange,
    filtrarBarriosLocalmente,
    setModoEdicion,
  };
};