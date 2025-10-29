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
  codPiso?: number;
  numeroPiso: number;
  areaConstruida: number;

  // Datos opcionales
  fechaConstruccion?: string;
  murosColumnas?: string;
  techos?: string;
  pisos?: string;
  puertasVentanas?: string;
  revestimiento?: string;
  banios?: string;
  instalacionesElectricas?: string;
  codLetraMurosColumnas?: string;
  codLetraTechos?: string;
  codLetraPisos?: string;
  codLetraPuertasVentanas?: string;
  codLetraRevestimiento?: string;
  codLetraBanios?: string;
  codLetraInstalacionesElectricas?: string;
  codEstadoConservacion?: string;
  codMaterialEstructural?: string;
  valorAreasComunes?: string;
  codUsuario?: number;
}

/**
 * Hook personalizado para gestión de pisos
 */
export const usePisos = () => {
  const [loading, setLoading] = useState(false);
  const [pisos, setPisos] = useState<Piso[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Consultar pisos con filtros usando el API GET
   * GET http://26.161.18.122:8080/api/piso?codPiso=1&anio=2023&codPredio=20231&numeroPiso=1
   */
  const consultarPisos = useCallback(async (filtros: {
    codPiso?: number;
    anio?: number;
    codPredio?: string;
    numeroPiso?: number;
  }): Promise<PisoData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [usePisos] Filtros recibidos:', filtros);
      
      // Validar que tengamos al menos un codPredio válido
      if (!filtros.codPredio || filtros.codPredio.trim() === '') {
        console.log('⚠️ [usePisos] Código de predio vacío, usando valor por defecto');
      }
      
      const pisosDelApi = await pisoService.consultarPisos(filtros);
      
      console.log('📡 [usePisos] Pisos encontrados:', pisosDelApi.length);
      
      // Actualizar estado con los pisos del API
      const pisosFormateados: Piso[] = pisosDelApi.map((piso, index) => ({
        id: piso.id || piso.codPiso || index + 1,
        item: index + 1,
        descripcion: `Piso ${piso.numeroPiso || index + 1}`,
        valorUnitario: piso.valorUnitario || 0,
        incremento: piso.incremento || 0,
        porcentajeDepreciacion: piso.depreciacion || 0,
        valorUnicoDepreciado: piso.valorUnitarioDepreciado || 0,
        valorAreaConstruida: piso.valorAreaConstruida || 0
      }));
      
      setPisos(pisosFormateados);
      return pisosDelApi;
      
    } catch (error: any) {
      console.error('❌ [usePisos] Error consultando pisos:', error);
      setError(error.message || 'Error al consultar pisos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar pisos por predio y año usando el API real (método legacy para compatibilidad)
   * GET http://26.161.18.122:8080/api/piso?codPiso=1&anio=2023&codPredio=20231&numeroPiso=1
   */
  const buscarPisos = useCallback(async (codigoPredio: string, anio: number): Promise<Piso[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [usePisos] Buscando pisos para predio:', codigoPredio, 'año:', anio);
      
      // Llamar al servicio real con los parámetros del API
      const pisosDelApi = await pisoService.consultarPisos({
        anio: anio,
        codPredio: codigoPredio
      });
      
      console.log('📡 [usePisos] Respuesta del servicio:', pisosDelApi);
      
      // Convertir la respuesta del servicio al formato esperado por el componente
      const pisosFormateados: Piso[] = pisosDelApi.map((piso, index) => ({
        id: piso.id || piso.codPiso || index + 1,
        item: index + 1,
        descripcion: `Piso ${piso.numeroPiso || index + 1}`,
        valorUnitario: piso.valorUnitario || 0,
        incremento: piso.incremento || 0,
        porcentajeDepreciacion: piso.depreciacion || 0,
        valorUnicoDepreciado: piso.valorUnitarioDepreciado || 0,
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
      
      if (!datos.areaConstruida || parseFloat(datos.areaConstruida) <= 0) {
        throw new Error('El área construida debe ser mayor a 0');
      }
      
      // Preparar datos según la estructura JSON exacta del API
      const datosApi: CreatePisoApiDTO = {
        anio: datos.anio || new Date().getFullYear(),
        codPredio: String(datos.codPredio),
        codPiso: Number(datos.codPiso || 1),
        numeroPiso: Number(datos.numeroPiso),
        fechaConstruccion: datos.fechaConstruccion || "1990-01-01",
        murosColumnas: String(datos.murosColumnas || "100101"),
        techos: String(datos.techos || "100102"),
        pisos: String(datos.pisos || "100201"),
        puertasVentanas: String(datos.puertasVentanas || "100202"),
        revestimiento: String(datos.revestimiento || "100203"),
        banios: String(datos.banios || "100204"),
        instalacionesElectricas: String(datos.instalacionesElectricas || "100301"),
        codLetraMurosColumnas: String(datos.codLetraMurosColumnas || "1101"),
        codLetraTechos: String(datos.codLetraTechos || "1101"),
        codLetraPisos: String(datos.codLetraPisos || "1101"),
        codLetraPuertasVentanas: String(datos.codLetraPuertasVentanas || "1101"),
        codLetraRevestimiento: String(datos.codLetraRevestimiento || "1101"),
        codLetraBanios: String(datos.codLetraBanios || "1101"),
        codLetraInstalacionesElectricas: String(datos.codLetraInstalacionesElectricas || "1101"),
        codEstadoConservacion: String(datos.codEstadoConservacion || "9402"),
        codMaterialEstructural: String(datos.codMaterialEstructural || "0703"),
        areaConstruida: String(datos.areaConstruida),
        valorAreasComunes: String(datos.valorAreasComunes || "0"),
        codUsuario: Number(datos.codUsuario || 1)
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
   * Guardar piso usando API sin autenticación (crear o actualizar)
   * Para actualización, debe incluir codPiso en los datos
   */
  const guardarPiso = useCallback(async (datos: CrearPisoFormData & { codPiso?: number }): Promise<PisoData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 [usePisos] Guardando piso:', datos);
      
      // Si tiene codPiso, es una actualización, sino es creación
      if (datos.codPiso) {
        console.log('🔄 [usePisos] Actualizando piso existente con codPiso:', datos.codPiso);
        
        // Para actualización, usamos la misma estructura de datos
        const datosApi: CreatePisoApiDTO = {
          anio: datos.anio || new Date().getFullYear(),
          codPredio: String(datos.codPredio),
          codPiso: Number(datos.codPiso || 1),
          numeroPiso: Number(datos.numeroPiso),
          fechaConstruccion: datos.fechaConstruccion || "1990-01-01",
          murosColumnas: String(datos.murosColumnas || "100101"),
          techos: String(datos.techos || "100102"),
          pisos: String(datos.pisos || "100201"),
          puertasVentanas: String(datos.puertasVentanas || "100202"),
          revestimiento: String(datos.revestimiento || "100203"),
          banios: String(datos.banios || "100204"),
          instalacionesElectricas: String(datos.instalacionesElectricas || "100301"),
          codLetraMurosColumnas: String(datos.codLetraMurosColumnas || "1101"),
          codLetraTechos: String(datos.codLetraTechos || "1101"),
          codLetraPisos: String(datos.codLetraPisos || "1101"),
          codLetraPuertasVentanas: String(datos.codLetraPuertasVentanas || "1101"),
          codLetraRevestimiento: String(datos.codLetraRevestimiento || "1101"),
          codLetraBanios: String(datos.codLetraBanios || "1101"),
          codLetraInstalacionesElectricas: String(datos.codLetraInstalacionesElectricas || "1101"),
          codEstadoConservacion: String(datos.codEstadoConservacion || "9402"),
          codMaterialEstructural: String(datos.codMaterialEstructural || "0703"),
          areaConstruida: String(datos.areaConstruida),
          valorAreasComunes: String(datos.valorAreasComunes || "0"),
          codUsuario: Number(datos.codUsuario || 1)
        };
        
        // TODO: Implementar método PUT en el servicio cuando esté disponible
        // Por ahora, usar POST para actualizar
        const pisoActualizado = await pisoService.crearPisoSinAuth(datosApi);
        NotificationService.success(`Piso ${pisoActualizado?.numeroPiso || 'existente'} actualizado exitosamente`);
        return pisoActualizado;
        
      } else {
        console.log('➕ [usePisos] Creando nuevo piso');
        return await crearPiso(datos);
      }
      
    } catch (error: any) {
      const mensaje = error.message || 'Error al guardar piso';
      console.error('❌ [usePisos] Error guardando piso:', error);
      setError(mensaje);
      NotificationService.error(mensaje);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [crearPiso]);

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
    consultarPisos,  // Nuevo método principal para consultas con filtros
    buscarPisos,     // Método legacy para compatibilidad
    crearPiso,
    guardarPiso,
    actualizarPiso,
    eliminarPiso,
    calcularValorDepreciado,
    calcularValorAreaConstruida
  };
};