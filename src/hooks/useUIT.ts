import { useState, useCallback, useEffect } from 'react';
import { UIT, Alicuota, CalculoUIT } from '../models/UIT';

/**
 * Hook personalizado para la gestión de UIT y cálculos de impuestos
 * 
 * Proporciona funcionalidades para obtener, listar y calcular impuestos basados en UIT
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
    cargarUIT();
    cargarAlicuotas();
    cargarAniosDisponibles();
  }, []);

  // Cargar UIT (simulación de carga desde API)
  const cargarUIT = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        const uitsData: UIT[] = [
          { anio: 2025, uit: 5350, tasa: 0.2, rangoInicial: 0.00, rangoFinal: 80250, impuestoParcial: 0.00, impuestoAcumulado: 'ACTIVO' },
          { anio: 2025, uit: 5350, tasa: 0.6, rangoInicial: 80251, rangoFinal: 321000, impuestoParcial: 0.00, impuestoAcumulado: 'ACTIVO' },
          { anio: 2025, uit: 5350, tasa: 1.0, rangoInicial: 321001, rangoFinal: 1.0, impuestoParcial: 0.00, impuestoAcumulado: 'INACTIVO' },
        ];
        
        setUits(uitsData);
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar UIT');
      setLoading(false);
    }
  }, []);

  // Cargar alícuotas
  const cargarAlicuotas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        const alicuotasData: Alicuota[] = [
          { id: 1, descripcion: 'Hasta 15 UIT :', tasa: 0.20, uitMinimo: 0, uitMaximo: 15 },
          { id: 2, descripcion: 'Mas de 15 UIT hasta 60 UIT :', tasa: 0.60, uitMinimo: 15, uitMaximo: 60 },
          { id: 3, descripcion: 'Mas de 60 UIT :', tasa: 1.00, uitMinimo: 60 }, // uitMaximo es undefined
        ];
        
        setAlicuotas(alicuotasData);
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar alícuotas');
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
          { value: '2023', label: '2023' },
          { value: '2024', label: '2024' },
          { value: '2025', label: '2025' },
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

  // Manejar cambio de monto
  const handleMontoChange = useCallback((monto: number) => {
    setMontoCalculo(monto);
  }, []);

  // Calcular impuesto
  const calcularImpuesto = useCallback(() => {
    if (!anioSeleccionado || montoCalculo <= 0) {
      setError('Debe seleccionar un año y un monto válido');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Lógica para calcular el impuesto según las alícuotas
      // En un caso real, podría hacerse mediante una llamada a la API
      
      // Simulación de cálculo
      let resultado = 0;
      
      // Obtener valor de la UIT para el año seleccionado
      const uitDelAnio = uits.find(u => u.anio === anioSeleccionado)?.uit || 5350;
      
      // Calcular el impuesto según los rangos
      for (const alicuota of alicuotas) {
        const minimo = (alicuota.uitMinimo || 0) * uitDelAnio;
        const maximo = alicuota.uitMaximo !== undefined ? alicuota.uitMaximo * uitDelAnio : Infinity;
        
        if (montoCalculo > minimo) {
          const montoEnRango = Math.min(montoCalculo, maximo) - minimo;
          if (montoEnRango > 0) {
            resultado += montoEnRango * (alicuota.tasa / 100);
          }
        }
      }
      
      setResultadoCalculo(resultado);
      setLoading(false);
      
    } catch (err: any) {
      setError(err.message || 'Error al calcular impuesto');
      setLoading(false);
    }
  }, [anioSeleccionado, montoCalculo, alicuotas, uits]);

  // Actualizar alícuotas
  const actualizarAlicuotas = useCallback(async (nuevasAlicuotas: Alicuota[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // En un caso real, esto sería una petición a la API
      // await fetch('/api/alicuotas', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(nuevasAlicuotas),
      // });
      
      // Simulación de actualización exitosa
      setTimeout(() => {
        setAlicuotas(nuevasAlicuotas);
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Error al actualizar alícuotas');
      setLoading(false);
    }
  }, []);

  return {
    uits,
    alicuotas,
    aniosDisponibles,
    anioSeleccionado,
    montoCalculo,
    resultadoCalculo,
    loading,
    error,
    handleAnioChange,
    handleMontoChange,
    calcularImpuesto,
    actualizarAlicuotas
  };
};

export default useUIT;