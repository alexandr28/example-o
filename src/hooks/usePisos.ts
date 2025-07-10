// src/hooks/usePisos.ts
import { useState, useCallback } from 'react';
import { NotificationService } from '../components/utils/Notification';

// Interfaces
interface Piso {
  id: number;
  item: number;
  descripcion: string;
  valorUnitario: number;
  incremento: number;
  porcentajeDepreciacion: number;
  valorUnicoDepreciado: number;
  valorAreaConstruida: number;
}

interface PisoFormData {
  descripcion: string;
  fechaConstruccion: Date | null;
  antiguedad: string;
  estadoConservacion: string;
  areaConstruida: string;
  materialPredominante: string;
  formaRegistro: string;
  otrasInstalaciones: string;
  predioId: number | string;
  categorias: Record<string, Record<string, boolean>>;
}

/**
 * Hook personalizado para gestión de pisos
 */
export const usePisos = () => {
  const [loading, setLoading] = useState(false);
  const [pisos, setPisos] = useState<Piso[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar pisos por predio y año
   */
  const buscarPisos = useCallback(async (codigoPredio: string, anio: number): Promise<Piso[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      const pisosData: Piso[] = [
        {
          id: 1,
          item: 1,
          descripcion: 'Primer piso',
          valorUnitario: 731.52,
          incremento: 0.00,
          porcentajeDepreciacion: 0.32,
          valorUnicoDepreciado: 497.53,
          valorAreaConstruida: 40500.75
        },
        {
          id: 2,
          item: 2,
          descripcion: 'Segundo piso',
          valorUnitario: 731.52,
          incremento: 0.00,
          porcentajeDepreciacion: 0.32,
          valorUnicoDepreciado: 497.53,
          valorAreaConstruida: 40500.75
        },
        {
          id: 3,
          item: 3,
          descripcion: 'Tercer piso',
          valorUnitario: 850.00,
          incremento: 0.05,
          porcentajeDepreciacion: 0.28,
          valorUnicoDepreciado: 612.00,
          valorAreaConstruida: 52000.00
        }
      ];
      
      setPisos(pisosData);
      return pisosData;
      
    } catch (error: any) {
      console.error('Error al buscar pisos:', error);
      setError(error.message || 'Error al buscar pisos');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guardar nuevo piso
   */
  const guardarPiso = useCallback(async (data: PisoFormData): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Guardando piso:', data);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la llamada real a la API
      // const response = await pisoService.crear(data);
      
      NotificationService.success('Piso registrado correctamente');
      
    } catch (error: any) {
      console.error('Error al guardar piso:', error);
      setError(error.message || 'Error al guardar piso');
      NotificationService.error('Error al guardar el piso');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar piso existente
   */
  const actualizarPiso = useCallback(async (id: number, data: Partial<PisoFormData>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Actualizando piso:', id, data);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      NotificationService.success('Piso actualizado correctamente');
      
    } catch (error: any) {
      console.error('Error al actualizar piso:', error);
      setError(error.message || 'Error al actualizar piso');
      NotificationService.error('Error al actualizar el piso');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar piso
   */
  const eliminarPiso = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Eliminando piso:', id);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar lista local
      setPisos(prev => prev.filter(piso => piso.id !== id));
      
      NotificationService.success('Piso eliminado correctamente');
      
    } catch (error: any) {
      console.error('Error al eliminar piso:', error);
      setError(error.message || 'Error al eliminar piso');
      NotificationService.error('Error al eliminar el piso');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calcular valor unitario depreciado
   */
  const calcularValorDepreciado = useCallback((
    valorUnitario: number,
    porcentajeDepreciacion: number
  ): number => {
    return valorUnitario * (1 - porcentajeDepreciacion / 100);
  }, []);

  /**
   * Calcular valor área construida
   */
  const calcularValorAreaConstruida = useCallback((
    valorUnicoDepreciado: number,
    areaConstruida: number
  ): number => {
    return valorUnicoDepreciado * areaConstruida;
  }, []);

  return {
    // Estados
    pisos,
    loading,
    error,
    
    // Funciones
    buscarPisos,
    guardarPiso,
    actualizarPiso,
    eliminarPiso,
    calcularValorDepreciado,
    calcularValorAreaConstruida
  };
};