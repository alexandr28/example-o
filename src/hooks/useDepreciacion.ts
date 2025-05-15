import { useState, useCallback, useEffect } from 'react';
import { Depreciacion, Material, Antiguedad, FiltroDepreciacion, DepreciacionPaginacionOptions } from '../models/Depreciacion';

/**
 * Hook personalizado para la gestión de datos de Depreciación
 * 
 * Proporciona funcionalidades para listar, crear y actualizar valores de depreciación
 */
export const useDepreciacion = () => {
  // Estados
  const [depreciaciones, setDepreciaciones] = useState<Depreciacion[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [tipoCasaSeleccionado, setTipoCasaSeleccionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState<DepreciacionPaginacionOptions>({
    pagina: 1,
    porPagina: 10,
    total: 0
  });

  // Lista de años disponibles
  const [aniosDisponibles, setAniosDisponibles] = useState<{ value: string, label: string }[]>([]);
  
  // Lista de tipos de casa disponibles
  const [tiposCasa, setTiposCasa] = useState<{ value: string, label: string }[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDepreciaciones();
    cargarAniosDisponibles();
    cargarTiposCasa();
  }, []);

  // Cargar depreciaciones (simulación de carga desde API)
  const cargarDepreciaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        const depreciacionesData: Depreciacion[] = [
          { 
            id: 1, 
            anio: 2025, 
            tipoCasa: 'Casa-Habitación',
            material: Material.CONCRETO, 
            antiguedad: Antiguedad.HASTA_5,
            porcMuyBueno: 0.00,
            porcBueno: 0.00,
            porcRegular: 0.00,
            porcMalo: 0.00,
            estado: 'ACTIVO' 
          },
          { 
            id: 2, 
            anio: 2025, 
            tipoCasa: 'Casa-Habitación',
            material: Material.LADRILLO, 
            antiguedad: Antiguedad.HASTA_5,
            porcMuyBueno: 0.00,
            porcBueno: 0.00,
            porcRegular: 0.00,
            porcMalo: 0.00,
            estado: 'ACTIVO' 
          },
          { 
            id: 3, 
            anio: 2025, 
            tipoCasa: 'Casa-Habitación',
            material: Material.ADOBE, 
            antiguedad: Antiguedad.HASTA_5,
            porcMuyBueno: 0.00,
            porcBueno: 0.00,
            porcRegular: 0.00,
            porcMalo: 0.00,
            estado: 'ACTIVO' 
          },
          { 
            id: 4, 
            anio: 2025, 
            tipoCasa: 'Casa-Habitación',
            material: Material.CONCRETO, 
            antiguedad: Antiguedad.HASTA_10,
            porcMuyBueno: 0.00,
            porcBueno: 0.00,
            porcRegular: 0.00,
            porcMalo: 0.00,
            estado: 'ACTIVO' 
          },
          { 
            id: 5, 
            anio: 2025, 
            tipoCasa: 'Casa-Habitación',
            material: Material.LADRILLO, 
            antiguedad: Antiguedad.HASTA_10,
            porcMuyBueno: 0.00,
            porcBueno: 0.00,
            porcRegular: 0.00,
            porcMalo: 0.00,
            estado: 'ACTIVO' 
          },
          { 
            id: 6, 
            anio: 2025, 
            tipoCasa: 'Casa-Habitación',
            material: Material.ADOBE, 
            antiguedad: Antiguedad.HASTA_10,
            porcMuyBueno: 0.00,
            porcBueno: 0.00,
            porcRegular: 0.00,
            porcMalo: 0.00,
            estado: 'ACTIVO' 
          },
        ];
        
        setDepreciaciones(depreciacionesData);
        setPaginacion(prev => ({
          ...prev,
          total: depreciacionesData.length
        }));
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar valores de depreciación');
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

  // Cargar tipos de casa
  const cargarTiposCasa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        const tipos = [
          { value: 'Casa-Habitación', label: 'Casa-Habitación' },
          { value: 'Tienda-Depósito', label: 'Tienda-Depósito' },
          { value: 'Edificio', label: 'Edificio' },
          { value: 'Clínica-Hospital', label: 'Clínica-Hospital' },
          { value: 'Oficina', label: 'Oficina' },
        ];
        
        setTiposCasa(tipos);
        setLoading(false);
      }, 300);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar tipos de casa');
      setLoading(false);
    }
  }, []);

  // Manejar cambio de año
  const handleAnioChange = useCallback((anio: number | null) => {
    setAnioSeleccionado(anio);
  }, []);

  // Manejar cambio de tipo de casa
  const handleTipoCasaChange = useCallback((tipoCasa: string | null) => {
    setTipoCasaSeleccionado(tipoCasa);
  }, []);

  // Registrar nueva depreciación
  const registrarDepreciacion = useCallback(async () => {
    if (!anioSeleccionado || !tipoCasaSeleccionado) {
      setError('Debe seleccionar un año y un tipo de casa');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si ya existen registros para el año y tipo de casa seleccionados
      const existeDepreciacion = depreciaciones.some(d => 
        d.anio === anioSeleccionado && d.tipoCasa === tipoCasaSeleccionado
      );
      
      if (existeDepreciacion) {
        setError(`Ya existen registros para el año ${anioSeleccionado} y tipo ${tipoCasaSeleccionado}`);
        setLoading(false);
        return;
      }
      
      // En un caso real, esto sería una petición a la API
      // await fetch('/api/depreciaciones', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ anio: anioSeleccionado, tipoCasa: tipoCasaSeleccionado }),
      // });
      
      // Simulación de registro exitoso - generación de valores iniciales
      setTimeout(() => {
        // Crear todos los posibles valores por material y antigüedad
        const materiales = [Material.CONCRETO, Material.LADRILLO, Material.ADOBE];
        const antiguedades = [Antiguedad.HASTA_5, Antiguedad.HASTA_10, Antiguedad.HASTA_15, 
                             Antiguedad.HASTA_20, Antiguedad.HASTA_25];
        
        const nuevasDepreciaciones: Depreciacion[] = [];
        let id = Math.max(0, ...depreciaciones.map(d => d.id || 0));
        
        materiales.forEach(material => {
          antiguedades.forEach(antiguedad => {
            nuevasDepreciaciones.push({
              id: ++id,
              anio: anioSeleccionado,
              tipoCasa: tipoCasaSeleccionado,
              material,
              antiguedad,
              porcMuyBueno: 0.00,
              porcBueno: 0.00,
              porcRegular: 0.00,
              porcMalo: 0.00,
              estado: 'ACTIVO',
              fechaCreacion: new Date()
            });
          });
        });
        
        // Añadir las nuevas depreciaciones al estado
        setDepreciaciones([...depreciaciones, ...nuevasDepreciaciones]);
        setPaginacion(prev => ({
          ...prev,
          total: prev.total + nuevasDepreciaciones.length
        }));
        
        // Mostrar mensaje de éxito
        alert('Registro de depreciación generado con éxito');
        
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar depreciación');
      setLoading(false);
    }
  }, [anioSeleccionado, tipoCasaSeleccionado, depreciaciones]);

  // Buscar depreciaciones
  const buscarDepreciaciones = useCallback(() => {
    // En un caso real, esto sería una petición a la API con filtros
    // por ahora, simulamos un filtrado local
    
    setLoading(true);
    
    setTimeout(() => {
      let depreciacionesFiltradas = [...depreciaciones];
      
      if (anioSeleccionado) {
        depreciacionesFiltradas = depreciacionesFiltradas.filter(d => d.anio === anioSeleccionado);
      }
      
      if (tipoCasaSeleccionado) {
        depreciacionesFiltradas = depreciacionesFiltradas.filter(d => d.tipoCasa === tipoCasaSeleccionado);
      }
      
      setDepreciaciones(depreciacionesFiltradas);
      setPaginacion(prev => ({
        ...prev,
        total: depreciacionesFiltradas.length,
        pagina: 1
      }));
      
      setLoading(false);
    }, 300);
  }, [anioSeleccionado, tipoCasaSeleccionado, depreciaciones]);

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
    return depreciaciones.slice(inicio, fin);
  }, [depreciaciones, paginacion]);

  return {
    depreciaciones: obtenerElementosPaginados(),
    totalDepreciaciones: depreciaciones.length,
    aniosDisponibles,
    tiposCasa,
    anioSeleccionado,
    tipoCasaSeleccionado,
    paginacion,
    loading,
    error,
    handleAnioChange,
    handleTipoCasaChange,
    registrarDepreciacion,
    buscarDepreciaciones,
    cambiarPagina
  };
};

export default useDepreciacion;