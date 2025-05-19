import { useState, useCallback, useEffect } from 'react';
import { Alcabala, AlcabalaFormData, PaginacionOptions } from '../models/Alcabala';

/**
 * Hook personalizado para la gestión de datos de Alcabala
 * 
 * Proporciona funcionalidades para listar, crear y actualizar valores de Alcabala
 */
export const useAlcabala = () => {
  // Estados
  const [alcabalas, setAlcabalas] = useState<Alcabala[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [tasaAlcabala, setTasaAlcabala] = useState<number>(0.03);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState<PaginacionOptions>({
    pagina: 1,
    porPagina: 10,
    total: 0
  });

  // Lista de años disponibles
  const [aniosDisponibles, setAniosDisponibles] = useState<{ value: string, label: string }[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarAlcabalas();
    cargarAniosDisponibles();
  }, []);

  // Cargar alcabalas (simulación de carga desde API)
  const cargarAlcabalas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        const alcabalasData: Alcabala[] = [
          { id: 1, anio: 2025, tasa: 0.03, estado: 'ACTIVO' },
          { id: 2, anio: 2024, tasa: 0.03, estado: 'ACTIVO' },
          { id: 3, anio: 2023, tasa: 0.03, estado: 'ACTIVO' },
          { id: 4, anio: 2022, tasa: 0.03, estado: 'ACTIVO' },
          { id: 5, anio: 2021, tasa: 0.03, estado: 'ACTIVO' },
          { id: 6, anio: 2020, tasa: 0.03, estado: 'ACTIVO' },
        ];
        
        setAlcabalas(alcabalasData);
        setPaginacion(prev => ({
          ...prev,
          total: alcabalasData.length
        }));
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar valores de Alcabala');
      setLoading(false);
    }
  }, []);

  // Cargar años disponibles
  const cargarAniosDisponibles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        const anios = [
          { value: '2020', label: '2020' },
          { value: '2021', label: '2021' },
          { value: '2022', label: '2022' },
          { value: '2023', label: '2023' },
          { value: '2024', label: '2024' },
          { value: '2025', label: '2025' },
          { value: '2026', label: '2026' },
        ];
        
        setAniosDisponibles(anios);
        setLoading(false);
      }, 300);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar años disponibles');
      setLoading(false);
    }
  }, []);

  // Manejar cambio de año
  const handleAnioChange = useCallback((anio: number | null) => {
    setAnioSeleccionado(anio);
  }, []);

  // Manejar cambio de tasa
  const handleTasaChange = useCallback((tasa: number) => {
    setTasaAlcabala(tasa);
  }, []);

  // Registrar nueva Alcabala
  const registrarAlcabala = useCallback(async () => {
    if (!anioSeleccionado) {
      setError('Debe seleccionar un año');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si ya existe un registro para el año seleccionado
      const existeAlcabala = alcabalas.some(a => a.anio === anioSeleccionado);
      
      if (existeAlcabala) {
        setError(`Ya existe un registro para el año ${anioSeleccionado}`);
        setLoading(false);
        return;
      }
      
      // En un caso real, esto sería una petición a la API
      // await fetch('/api/alcabalas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ anio: anioSeleccionado, tasa: tasaAlcabala }),
      // });
      
      // Simulación de registro exitoso
      setTimeout(() => {
        const nuevaAlcabala: Alcabala = {
          id: Math.max(0, ...alcabalas.map(a => a.id || 0)) + 1,
          anio: anioSeleccionado,
          tasa: tasaAlcabala,
          estado: 'ACTIVO',
          fechaCreacion: new Date()
        };
        
        setAlcabalas([nuevaAlcabala, ...alcabalas]);
        setPaginacion(prev => ({
          ...prev,
          total: prev.total + 1
        }));
        
        // Resetear formulario
        setAnioSeleccionado(null);
        
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar Alcabala');
      setLoading(false);
    }
  }, [anioSeleccionado, tasaAlcabala, alcabalas]);

  // Cambiar página de la lista
  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setPaginacion(prev => ({
      ...prev,
      pagina: nuevaPagina
    }));
  }, []);

  // Obtener elementos de la página actual
  const obtenerElementosPaginados = useCallback(() => {
    const inicio = (paginacion.pagina - 1) * paginacion.porPagina;
    const fin = inicio + paginacion.porPagina;
    return alcabalas.slice(inicio, fin);
  }, [alcabalas, paginacion]);

  return {
    alcabalas: obtenerElementosPaginados(),
    totalAlcabalas: alcabalas.length,
    aniosDisponibles,
    anioSeleccionado,
    tasaAlcabala,
    paginacion,
    loading,
    error,
    handleAnioChange,
    handleTasaChange,
    registrarAlcabala,
    cambiarPagina
  };
};

export default useAlcabala;