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
  obtenerEstadisticas: () => Promise<any>;
  
  // Alícuotas
  alicuotas: UITData[];
  cargarAlicuotas: (anio: number) => Promise<void>;
  
  // Control de año
  aniosDisponibles: number[];
  anioSeleccionado: number;
  setAnioSeleccionado: (anio: number) => void;
  
  // Cálculo de impuesto
  montoCalculo: string;
  setMontoCalculo: (monto: string) => void;
  resultadoCalculo: number | null;
  calcularImpuesto: () => Promise<void>;
  
  // Actualizar alícuotas
  actualizarAlicuotas: (alicuotas: UITData[]) => Promise<void>;
  
  // Utils
  handleAnioChange: (anio: number) => void;
  handleMontoChange: (monto: string) => void;
}

// Datos de demostración para fallback
const DEMO_UIT_DATA: UITData[] = [
  {
    id: 2025,
    codUit: 2025,
    anio: 2025,
    valor: 5350,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2025-01-01',
    fechaVigenciaHasta: '2025-12-31'
  },
  {
    id: 2024,
    codUit: 2024,
    anio: 2024,
    valor: 5150,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2024-01-01',
    fechaVigenciaHasta: '2024-12-31'
  },
  {
    id: 2023,
    codUit: 2023,
    anio: 2023,
    valor: 4950,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2023-01-01',
    fechaVigenciaHasta: '2023-12-31'
  }
];

const DEMO_ALICUOTAS: UITData[] = [
  {
    id: 101,
    codUit: 101,
    anio: 2025,
    valor: 0,
    alicuota: 0.2,
    rangoInicial: 0,
    rangoFinal: 5,
    impuestoParcial: 0,
    impuestoAcumulado: 0,
    estado: 'ACTIVO'
  },
  {
    id: 102,
    codUit: 102,
    anio: 2025,
    valor: 0,
    alicuota: 0.6,
    rangoInicial: 5,
    rangoFinal: 60,
    impuestoParcial: 0.01,
    impuestoAcumulado: 0.01,
    estado: 'ACTIVO'
  },
  {
    id: 103,
    codUit: 103,
    anio: 2025,
    valor: 0,
    alicuota: 1.0,
    rangoInicial: 60,
    rangoFinal: 999999,
    impuestoParcial: 0.33,
    impuestoAcumulado: 0.34,
    estado: 'ACTIVO'
  }
];

/**
 * Hook para gestionar valores UIT
 */
export const useUIT = (): UseUITResult => {
  const [uits, setUits] = useState<UITData[]>([]);
  const [alicuotas, setAlicuotas] = useState<UITData[]>([]);
  const [uitSeleccionada, setUitSeleccionada] = useState<UITData | null>(null);
  const [uitVigente, setUitVigente] = useState<UITData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [montoCalculo, setMontoCalculo] = useState<string>('');
  const [resultadoCalculo, setResultadoCalculo] = useState<number | null>(null);

  // Generar años disponibles
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear + 5 - i);
    setAniosDisponibles(years);
  }, []);

  // Función auxiliar para manejar errores de autenticación
  const handleAuthError = useCallback((error: any): boolean => {
    if (error.message?.includes('403') || error.statusCode === 403) {
      console.warn('⚠️ Error 403: Usando datos de demostración');
      return true;
    }
    return false;
  }, []);

  // Función auxiliar para generar datos demo
  const generarDatosDemo = useCallback((anio?: number) => {
    if (anio) {
      return DEMO_UIT_DATA.filter(u => u.anio === anio);
    }
    return DEMO_UIT_DATA;
  }, []);

  const generarAlicuotasDemo = useCallback((anio: number) => {
    return DEMO_ALICUOTAS.map(a => ({
      ...a,
      anio: anio,
      id: anio * 100 + (a.id % 100)
    }));
  }, []);

  const generarHistorialDemo = useCallback((anioInicio?: number, anioFin?: number) => {
    const inicio = anioInicio || new Date().getFullYear() - 5;
    const fin = anioFin || new Date().getFullYear();
    
    return DEMO_UIT_DATA.filter(u => u.anio >= inicio && u.anio <= fin);
  }, []);

  const generarEstadisticasDemo = useCallback((uitsData: UITData[]) => {
    const anioActual = new Date().getFullYear();
    const uitActual = uitsData.find(u => u.anio === anioActual);
    const uitAnterior = uitsData.find(u => u.anio === anioActual - 1);
    
    let variacionAnual = 0;
    if (uitActual && uitAnterior) {
      variacionAnual = ((uitActual.valor - uitAnterior.valor) / uitAnterior.valor) * 100;
    }
    
    return {
      totalRegistros: uitsData.length,
      anioMinimo: Math.min(...uitsData.map(u => u.anio)),
      anioMaximo: Math.max(...uitsData.map(u => u.anio)),
      variacionAnual: variacionAnual.toFixed(2),
      aniosDisponibles: uitsData.length
    };
  }, []);

  // Cargar UITs por año
  const cargarUITs = useCallback(async (anio?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await uitService.listarUITs(anio);
      console.log('✅ [useUIT] Cargados', data.length, 'elementos del API para año', anio);
      
      setUits(data);
      
      // Si no hay año específico, actualizar UIT vigente
      if (!anio && data.length > 0) {
        const vigente = await uitService.obtenerVigente();
        setUitVigente(vigente);
      }
      
    } catch (error: any) {
      console.error('❌ [useUIT] Error cargando UITs:', error);
      setError(error.message || 'Error al cargar los valores UIT');
      setUits([]); // Limpiar datos en caso de error
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, generarDatosDemo, generarAlicuotasDemo]);

  // Cargar alícuotas por año
  const cargarAlicuotas = useCallback(async (anio: number) => {
    try {
      const data = await uitService.obtenerAlicuotasPorAnio(anio);
      setAlicuotas(data);
    } catch (error: any) {
      if (handleAuthError(error)) {
        setAlicuotas(generarAlicuotasDemo(anio));
      } else {
        console.error('Error cargando alícuotas:', error);
        setAlicuotas([]);
      }
    }
  }, [handleAuthError, generarAlicuotasDemo]);

  // Cargar historial de UITs
  const cargarHistorial = useCallback(async (anioInicio?: number, anioFin?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await uitService.obtenerHistorial(anioInicio, anioFin);
      setUits(data);
      
    } catch (error: any) {
      console.error('Error cargando historial:', error);
      
      if (handleAuthError(error)) {
        const historialDemo = generarHistorialDemo(anioInicio, anioFin);
        setUits(historialDemo);
        setError(null);
      } else {
        setError(error.message || 'Error al cargar el historial');
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, generarHistorialDemo]);

  // Cargar datos iniciales - simplificado para evitar conflictos
  useEffect(() => {
    let mounted = true;

    const cargarInicial = async () => {
      if (!mounted) return;
      
      try {
        // Solo cargar datos del año seleccionado (incluye UITs y alícuotas)
        await cargarUITs(anioSeleccionado);
      } catch (error) {
        console.error('❌ [useUIT] Error en carga inicial:', error);
      }
    };
    
    // Delay para evitar múltiples llamadas
    const timer = setTimeout(() => {
      cargarInicial();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []); // Solo ejecutar una vez al montar

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
      
      if (handleAuthError(error)) {
        NotificationService.info('Función disponible solo con autenticación');
        throw new Error('Se requiere autenticación para crear valores UIT');
      }
      
      throw error;
    }
  }, [cargarUITs, handleAuthError]);

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
      
      if (handleAuthError(error)) {
        NotificationService.info('Función disponible solo con autenticación');
        throw new Error('Se requiere autenticación para actualizar valores UIT');
      }
      
      throw error;
    }
  }, [uitSeleccionada, uitVigente, handleAuthError]);

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
      
      if (handleAuthError(error)) {
        NotificationService.info('Función disponible solo con autenticación');
        throw new Error('Se requiere autenticación para eliminar valores UIT');
      }
      
      throw error;
    }
  }, [uitSeleccionada, handleAuthError]);

  // Seleccionar UIT
  const seleccionarUIT = useCallback((uit: UITData | null) => {
    setUitSeleccionada(uit);
  }, []);

  // Calcular monto UIT
  const calcularMontoUIT = useCallback(async (cantidadUITs: number, anio?: number) => {
    try {
      return await uitService.calcularMontoUIT(cantidadUITs, anio);
    } catch (error: any) {
      if (handleAuthError(error)) {
        // Hacer cálculo local con datos demo
        const uitAnio = anio ? 
          uits.find(u => u.anio === anio) : 
          uitVigente;
          
        if (!uitAnio) {
          throw new Error('No se encontró valor UIT para el cálculo');
        }
        
        return {
          valor: cantidadUITs * uitAnio.valor,
          uitUsado: uitAnio
        };
      }
      
      throw error;
    }
  }, [uits, uitVigente, handleAuthError]);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(async () => {
    try {
      return await uitService.obtenerEstadisticas();
    } catch (error: any) {
      if (handleAuthError(error)) {
        return generarEstadisticasDemo(uits);
      }
      throw error;
    }
  }, [uits, handleAuthError, generarEstadisticasDemo]);

  // Calcular impuesto
  const calcularImpuesto = useCallback(async () => {
    if (!montoCalculo || parseFloat(montoCalculo) <= 0) {
      setResultadoCalculo(null);
      return;
    }

    try {
      const resultado = await uitService.calcularImpuesto(
        parseFloat(montoCalculo), 
        anioSeleccionado
      );
      
      if (resultado) {
        setResultadoCalculo(resultado.impuesto);
        NotificationService.success(
          `Impuesto calculado: S/ ${resultado.impuesto.toFixed(2)}`
        );
      }
    } catch (error: any) {
      console.error('Error calculando impuesto:', error);
      
      if (handleAuthError(error)) {
        // Cálculo local con datos demo
        const uitAnio = uits.find(u => u.anio === anioSeleccionado && !u.rangoInicial);
        if (uitAnio && alicuotas.length > 0) {
          const baseImponible = parseFloat(montoCalculo);
          const baseEnUITs = baseImponible / uitAnio.valor;
          
          const alicuotaAplicable = alicuotas.find(a => {
            const inicio = a.rangoInicial || 0;
            const fin = a.rangoFinal || Infinity;
            return baseEnUITs >= inicio && baseEnUITs <= fin;
          });
          
          if (alicuotaAplicable) {
            const impuesto = baseImponible * ((alicuotaAplicable.alicuota || 0) / 100);
            setResultadoCalculo(impuesto);
            NotificationService.success(
              `Impuesto calculado: S/ ${impuesto.toFixed(2)}`
            );
          }
        }
      } else {
        NotificationService.error('Error al calcular el impuesto');
      }
    }
  }, [montoCalculo, anioSeleccionado, uits, alicuotas, handleAuthError]);

  // Actualizar alícuotas
  const actualizarAlicuotas = useCallback(async (nuevasAlicuotas: UITData[]) => {
    setAlicuotas(nuevasAlicuotas);
    NotificationService.info('Alícuotas actualizadas localmente');
  }, []);

  // Handlers
  const handleAnioChange = useCallback((anio: number) => {
    setAnioSeleccionado(anio);
    setResultadoCalculo(null);
    cargarAlicuotas(anio);
  }, [cargarAlicuotas]);

  const handleMontoChange = useCallback((monto: string) => {
    setMontoCalculo(monto);
    setResultadoCalculo(null);
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
    obtenerEstadisticas,
    
    // Alícuotas
    alicuotas,
    cargarAlicuotas,
    
    // Control de año
    aniosDisponibles,
    anioSeleccionado,
    setAnioSeleccionado,
    
    // Cálculo
    montoCalculo,
    setMontoCalculo,
    resultadoCalculo,
    calcularImpuesto,
    
    // Utils
    actualizarAlicuotas,
    handleAnioChange,
    handleMontoChange
  };
};