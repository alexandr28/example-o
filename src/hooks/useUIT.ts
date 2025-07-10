// src/hooks/useUIT.ts
import { useState, useCallback, useEffect } from 'react';
import { UIT, Alicuota } from '../models/UIT';
import { uitService } from '../services/uitService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Hook personalizado para la gestión de UIT y cálculos de impuestos
 * Conectado con la API real
 */
export const useUIT = () => {
  // Estados
  const [uits, setUits] = useState<UIT[]>([]);
  const [alicuotas, setAlicuotas] = useState<Alicuota[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [montoCalculo, setMontoCalculo] = useState<number>(0);
  const [resultadoCalculo, setResultadoCalculo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de años disponibles
  const [aniosDisponibles, setAniosDisponibles] = useState<{ value: string, label: string }[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar todos los datos iniciales
  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar UITs, alícuotas y años disponibles en paralelo
      const [uitsData, alicuotasData, aniosData] = await Promise.all([
        cargarUIT(),
        cargarAlicuotas(),
        cargarAniosDisponibles()
      ]);
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar UIT desde la API
  const cargarUIT = useCallback(async () => {
    try {
      setError(null);
      
      const uitsData = await uitService.obtenerTodos();
      setUits(uitsData);
      
      console.log(`✅ [useUIT] ${uitsData.length} UITs cargados`);
      return uitsData;
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar UITs';
      setError(mensaje);
      console.error('❌ [useUIT] Error:', err);
      return [];
    }
  }, []);

  // Cargar alícuotas desde la API
  const cargarAlicuotas = useCallback(async () => {
    try {
      setError(null);
      
      const alicuotasData = await uitService.obtenerAlicuotas();
      setAlicuotas(alicuotasData);
      
      console.log(`✅ [useUIT] ${alicuotasData.length} alícuotas cargadas`);
      return alicuotasData;
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al cargar alícuotas';
      setError(mensaje);
      console.error('❌ [useUIT] Error:', err);
      return [];
    }
  }, []);

  // Cargar años disponibles
  const cargarAniosDisponibles = useCallback(async () => {
    try {
      const anios = await uitService.obtenerAniosDisponibles();
      
      // Generar lista de años desde 1991 hasta el año actual + 5
      const currentYear = new Date().getFullYear();
      const startYear = 1991;
      const endYear = currentYear + 5;
      
      const todosLosAnios = [];
      for (let year = endYear; year >= startYear; year--) {
        todosLosAnios.push({
          value: year.toString(),
          label: year.toString()
        });
      }
      
      setAniosDisponibles(todosLosAnios);
      
      // Si hay años con datos, seleccionar el más reciente
      if (anios.length > 0) {
        setAnioSeleccionado(anios[0]);
      }
      
      return todosLosAnios;
    } catch (err) {
      console.error('❌ [useUIT] Error al cargar años:', err);
      return [];
    }
  }, []);

  // Manejar cambio de año
  const handleAnioChange = useCallback(async (anio: number | null) => {
    setAnioSeleccionado(anio);
    setResultadoCalculo(null);
    
    if (anio) {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar UITs del año seleccionado
        const uitsAnio = await uitService.obtenerPorAnio(anio);
        setUits(uitsAnio);
        
        console.log(`✅ [useUIT] ${uitsAnio.length} UITs cargados para el año ${anio}`);
      } catch (err: any) {
        const mensaje = err.message || `Error al cargar UITs del año ${anio}`;
        setError(mensaje);
        console.error('❌ [useUIT] Error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Manejar cambio de monto
  const handleMontoChange = useCallback((monto: number) => {
    setMontoCalculo(monto);
    setResultadoCalculo(null);
  }, []);

  // Calcular impuesto basado en UIT
  const calcularImpuesto = useCallback(async () => {
    if (!anioSeleccionado || montoCalculo <= 0) {
      setError('Debe seleccionar un año y un monto válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const resultado = await uitService.calcularImpuesto(anioSeleccionado, montoCalculo);
      setResultadoCalculo(resultado);
      
      console.log(`✅ [useUIT] Impuesto calculado: S/ ${resultado.toFixed(2)}`);
      NotificationService.success(`Impuesto calculado: S/ ${resultado.toFixed(2)}`);
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al calcular impuesto';
      setError(mensaje);
      NotificationService.error(mensaje);
      console.error('❌ [useUIT] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [anioSeleccionado, montoCalculo]);

  // Actualizar alícuotas (por ahora es local, se puede implementar API si existe)
  const actualizarAlicuotas = useCallback(async (nuevasAlicuotas: Alicuota[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Si hay un endpoint para actualizar alícuotas, usarlo aquí
      // Por ahora solo actualizamos localmente
      setAlicuotas(nuevasAlicuotas);
      
      NotificationService.success('Alícuotas actualizadas correctamente');
      console.log('✅ [useUIT] Alícuotas actualizadas');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al actualizar alícuotas';
      setError(mensaje);
      NotificationService.error(mensaje);
      console.error('❌ [useUIT] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo UIT
  const crearUIT = useCallback(async (datos: {
    anio: number;
    valorUit: number;
    alicuota: number;
    rangoInicial: number;
    rangoFinal: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const nuevoUit = await uitService.crear(datos);
      
      // Recargar UITs
      await cargarUIT();
      
      console.log('✅ [useUIT] UIT creado exitosamente');
      return nuevoUit;
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al crear UIT';
      setError(mensaje);
      console.error('❌ [useUIT] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarUIT]);

  // Actualizar UIT existente
  const actualizarUIT = useCallback(async (id: number, datos: Partial<{
    anio: number;
    valorUit: number;
    alicuota: number;
    rangoInicial: number;
    rangoFinal: number;
  }>) => {
    try {
      setLoading(true);
      setError(null);
      
      const uitActualizado = await uitService.actualizar(id, datos);
      
      // Recargar UITs
      await cargarUIT();
      
      console.log('✅ [useUIT] UIT actualizado exitosamente');
      return uitActualizado;
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al actualizar UIT';
      setError(mensaje);
      console.error('❌ [useUIT] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarUIT]);

  // Eliminar UIT
  const eliminarUIT = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await uitService.eliminar(id);
      
      // Recargar UITs
      await cargarUIT();
      
      console.log('✅ [useUIT] UIT eliminado exitosamente');
      
    } catch (err: any) {
      const mensaje = err.message || 'Error al eliminar UIT';
      setError(mensaje);
      console.error('❌ [useUIT] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarUIT]);

  return {
    // Estados
    uits,
    alicuotas,
    aniosDisponibles,
    anioSeleccionado,
    montoCalculo,
    resultadoCalculo,
    loading,
    error,
    
    // Handlers principales
    handleAnioChange,
    handleMontoChange,
    calcularImpuesto,
    actualizarAlicuotas,
    
    // CRUD operations
    crearUIT,
    actualizarUIT,
    eliminarUIT,
    
    // Refresh
    recargar: cargarDatosIniciales
  };
};

export default useUIT;