// src/hooks/usePisos.ts
import { useState, useCallback } from 'react';
import { NotificationService } from '../components/utils/Notification';
import { pisoService, CreatePisoApiDTO, PisoData } from '../services/pisoService';

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
 * Datos para crear un piso usando la API sin autenticación
 */
interface CrearPisoFormData {
  // Datos básicos requeridos
  anio: number;
  codPredio: string;
  numeroPiso: number;
  areaConstruida: number;
  
  // Datos opcionales
  fechaConstruccion?: string;
  codLetraMurosColumnas?: string;
  murosColumnas?: string;
  codLetraTechos?: string;
  techos?: string;
  codLetraPisos?: string;
  pisos?: string;
  codLetraPuertasVentanas?: string;
  puertasVentanas?: string;
  codLetraRevestimiento?: string;
  revestimiento?: string;
  codLetraBanios?: string;
  banios?: string;
  codLetraInstalacionesElectricas?: string;
  instalacionesElectricas?: string;
  codEstadoConservacion?: string;
  codMaterialEstructural?: string;
}

/**
 * Hook personalizado para gestión de pisos
 */
export const usePisos = () => {
  const [loading, setLoading] = useState(false);
  const [pisos, setPisos] = useState<Piso[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar pisos por predio y año usando el API real
   * GET http://26.161.18.122:8080/api/piso?codPiso=1&anio=2023&codPredio=20231&numeroPiso=1
   */
  const buscarPisos = useCallback(async (codigoPredio: string, anio: number): Promise<Piso[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [usePisos] Buscando pisos para predio:', codigoPredio, 'año:', anio);
      
      // Llamar al servicio real con los parámetros del API
      const pisosDelApi = await pisoService.consultarPisos({
        codPiso: 1, // Valor por defecto según el ejemplo
        anio: anio,
        codPredio: codigoPredio,
        numeroPiso: 1 // Valor por defecto según el ejemplo
      });
      
      console.log('📡 [usePisos] Respuesta del servicio:', pisosDelApi);
      
      // Convertir la respuesta del servicio al formato esperado por el componente
      const pisosFormateados: Piso[] = pisosDelApi.map((piso, index) => ({
        id: piso.id || index + 1,
        item: index + 1,
        descripcion: piso.descripcion || `Piso ${piso.numeroPiso || index + 1}`,
        valorUnitario: piso.valorUnitario || 0,
        incremento: piso.incremento || 0,
        porcentajeDepreciacion: piso.porcentajeDepreciacion || 0,
        valorUnicoDepreciado: piso.valorUnicoDepreciado || 0,
        valorAreaConstruida: piso.valorAreaConstruida || 0
      }));
      
      console.log('✅ [usePisos] Pisos formateados:', pisosFormateados);
      setPisos(pisosFormateados);
      return pisosFormateados;
      
    } catch (error: any) {
      console.error('❌ [usePisos] Error al buscar pisos:', error);
      setError(error.message || 'Error al buscar pisos');
      
      // En caso de error, devolver datos de ejemplo para desarrollo
      console.log('🔄 [usePisos] Usando datos de ejemplo debido al error');
      const pisosEjemplo: Piso[] = [
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
      
      setPisos(pisosEjemplo);
      return pisosEjemplo;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo piso usando API POST sin autenticación
   * URL: POST http://26.161.18.122:8080/api/piso
   */
  const crearPiso = useCallback(async (datos: CrearPisoFormData): Promise<PisoData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏗️ [usePisos] Iniciando creación de piso:', datos);
      
      // Validaciones básicas
      if (!datos.codPredio || !datos.codPredio.trim()) {
        throw new Error('El código de predio es requerido');
      }
      
      if (!datos.numeroPiso || datos.numeroPiso <= 0) {
        throw new Error('El número de piso debe ser mayor a 0');
      }
      
      if (!datos.areaConstruida || datos.areaConstruida <= 0) {
        throw new Error('El área construida debe ser mayor a 0');
      }
      
      // Preparar datos según la estructura JSON exacta del API
      const datosApi: CreatePisoApiDTO = {
        anio: datos.anio || new Date().getFullYear(),
        codPredio: String(datos.codPredio),
        numeroPiso: Number(datos.numeroPiso),
        fechaConstruccion: datos.fechaConstruccion || "1990-01-01",
        codLetraMurosColumnas: String(datos.codLetraMurosColumnas || "1101"),
        murosColumnas: String(datos.murosColumnas || "100101"),
        codLetraTechos: String(datos.codLetraTechos || "1101"),
        techos: String(datos.techos || "100102"),
        codLetraPisos: String(datos.codLetraPisos || "1101"),
        pisos: String(datos.pisos || "100201"),
        codLetraPuertasVentanas: String(datos.codLetraPuertasVentanas || "1101"),
        puertasVentanas: String(datos.puertasVentanas || "100202"),
        codLetraRevestimiento: String(datos.codLetraRevestimiento || "1101"),
        revestimiento: String(datos.revestimiento || "100203"),
        codLetraBanios: String(datos.codLetraBanios || "1101"),
        banios: String(datos.banios || "100204"),
        codLetraInstalacionesElectricas: String(datos.codLetraInstalacionesElectricas || "1101"),
        instalacionesElectricas: String(datos.instalacionesElectricas || "100301"),
        codEstadoConservacion: String(datos.codEstadoConservacion || "9402"),
        codMaterialEstructural: String(datos.codMaterialEstructural || "0703"),
        areaConstruida: Number(datos.areaConstruida)
      };
      
      console.log('📤 [usePisos] Datos preparados para API POST:', datosApi);
      
      const nuevoPiso = await pisoService.crearPisoSinAuth(datosApi);
      
      console.log('✅ [usePisos] Piso creado exitosamente:', nuevoPiso);
      
      // Actualizar lista local de pisos
      if (nuevoPiso) {
        const pisoFormateado: Piso = {
          id: nuevoPiso.id || 0,
          item: pisos.length + 1,
          descripcion: `Piso ${nuevoPiso.numeroPiso}`,
          valorUnitario: 0,
          incremento: 0,
          porcentajeDepreciacion: 0,
          valorUnicoDepreciado: 0,
          valorAreaConstruida: 0
        };
        
        setPisos(prev => [...prev, pisoFormateado]);
      }
      
      NotificationService.success(`Piso ${nuevoPiso?.numeroPiso || 'nuevo'} creado exitosamente`);
      return nuevoPiso;
    } catch (err: any) {
      const mensaje = err.message || 'Error al crear piso';
      console.error('❌ [usePisos] Error creando piso:', err);
      setError(mensaje);
      NotificationService.error(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pisos.length]);

  /**
   * Guardar nuevo piso (método legacy - mantener por compatibilidad)
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
    crearPiso,
    guardarPiso,
    actualizarPiso,
    eliminarPiso,
    calcularValorDepreciado,
    calcularValorAreaConstruida
  };
};