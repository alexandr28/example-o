// src/hooks/useLimpiezaPublica.ts
import { useState, useCallback, useEffect } from 'react';
import limpienzaPublicaService, {
  LimpiezaPublicaData,
  CrearLimpiezaPublicaDTO,
  ActualizarLimpiezaPublicaDTO
} from '../services/limpienzaPublicaService';

interface UseLimpiezaPublicaResult {
  limpiezaPublica: LimpiezaPublicaData[];
  limpiezaPublicaOtros: LimpiezaPublicaData[];
  loading: boolean;
  error: string | null;

  // Operaciones normales
  listarLimpiezaPublica: (params?: { anio?: number }) => Promise<void>;
  crearLimpiezaPublica: (datos: CrearLimpiezaPublicaDTO) => Promise<LimpiezaPublicaData>;
  actualizarLimpiezaPublica: (datos: ActualizarLimpiezaPublicaDTO) => Promise<LimpiezaPublicaData>;

  // Operaciones OTROS
  listarLimpiezaPublicaOtros: (params?: { anio?: number }) => Promise<void>;
  crearLimpiezaPublicaOtros: (datos: CrearLimpiezaPublicaDTO) => Promise<LimpiezaPublicaData>;
  actualizarLimpiezaPublicaOtros: (datos: ActualizarLimpiezaPublicaDTO) => Promise<LimpiezaPublicaData>;

  recargar: () => Promise<void>;
}

/**
 * Hook para gestionar arbitrios de limpieza publica (normal y otros)
 */
export const useLimpiezaPublica = (anioInicial?: number): UseLimpiezaPublicaResult => {
  const [limpiezaPublica, setLimpiezaPublica] = useState<LimpiezaPublicaData[]>([]);
  const [limpiezaPublicaOtros, setLimpiezaPublicaOtros] = useState<LimpiezaPublicaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anioActual, setAnioActual] = useState<number | undefined>(anioInicial);

  // Listar arbitrios de limpieza publica normales
  const listarLimpiezaPublica = useCallback(async (params?: { anio?: number }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useLimpiezaPublica] Listando limpieza publica con params:', params);

      const anio = params?.anio || anioActual;
      const data = await limpienzaPublicaService.listarLimpiezaPublica(anio ? { anio } : undefined);

      console.log('[useLimpiezaPublica] Limpieza publica cargados:', data.length);
      setLimpiezaPublica(data);

      if (anio) {
        setAnioActual(anio);
      }

    } catch (error: any) {
      console.error('[useLimpiezaPublica] Error listando limpieza publica:', error);
      setError(error.message || 'Error al listar arbitrios de limpieza publica');
      setLimpiezaPublica([]);
    } finally {
      setLoading(false);
    }
  }, [anioActual]);

  // Listar arbitrios de limpieza publica OTROS
  const listarLimpiezaPublicaOtros = useCallback(async (params?: { anio?: number }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useLimpiezaPublica] Listando limpieza publica OTROS con params:', params);

      const anio = params?.anio || anioActual;
      const data = await limpienzaPublicaService.listarLimpiezaPublicaOtros(anio ? { anio } : undefined);

      console.log('[useLimpiezaPublica] Limpieza publica OTROS cargados:', data.length);
      setLimpiezaPublicaOtros(data);

      if (anio) {
        setAnioActual(anio);
      }

    } catch (error: any) {
      console.error('[useLimpiezaPublica] Error listando limpieza publica OTROS:', error);
      setError(error.message || 'Error al listar arbitrios de limpieza publica OTROS');
      setLimpiezaPublicaOtros([]);
    } finally {
      setLoading(false);
    }
  }, [anioActual]);

  // Crear arbitrio de limpieza publica
  const crearLimpiezaPublica = useCallback(async (datos: CrearLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> => {
    try {
      setLoading(true);
      console.log('[useLimpiezaPublica] Creando limpieza publica:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codZona) {
        throw new Error('Debe proporcionar una zona');
      }

      if (!datos.codCriterio) {
        throw new Error('Debe proporcionar un criterio');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const nuevoArbitrio = await limpienzaPublicaService.crearLimpiezaPublica(datos);

      // Actualizar estado local
      setLimpiezaPublica(prev => [...prev, nuevoArbitrio]);

      // Recargar lista
      try {
        console.log('[useLimpiezaPublica] Recargando datos despues de crear...');
        await listarLimpiezaPublica({ anio: datos.anio });
      } catch (err) {
        console.warn('[useLimpiezaPublica] Error recargando datos:', err);
      }

      console.log('[useLimpiezaPublica] Limpieza publica creado exitosamente');
      return nuevoArbitrio;

    } catch (error: any) {
      console.error('[useLimpiezaPublica] Error creando limpieza publica:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarLimpiezaPublica]);

  // Crear arbitrio de limpieza publica OTROS
  const crearLimpiezaPublicaOtros = useCallback(async (datos: CrearLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> => {
    try {
      setLoading(true);
      console.log('[useLimpiezaPublica] Creando limpieza publica OTROS:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codZona) {
        throw new Error('Debe proporcionar una zona');
      }

      if (!datos.codCriterio) {
        throw new Error('Debe proporcionar un criterio');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const nuevoArbitrio = await limpienzaPublicaService.crearLimpiezaPublicaOtros(datos);

      // Actualizar estado local
      setLimpiezaPublicaOtros(prev => [...prev, nuevoArbitrio]);

      // Recargar lista
      try {
        console.log('[useLimpiezaPublica] Recargando datos OTROS despues de crear...');
        await listarLimpiezaPublicaOtros({ anio: datos.anio });
      } catch (err) {
        console.warn('[useLimpiezaPublica] Error recargando datos OTROS:', err);
      }

      console.log('[useLimpiezaPublica] Limpieza publica OTROS creado exitosamente');
      return nuevoArbitrio;

    } catch (error: any) {
      console.error('[useLimpiezaPublica] Error creando limpieza publica OTROS:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarLimpiezaPublicaOtros]);

  // Actualizar arbitrio de limpieza publica
  const actualizarLimpiezaPublica = useCallback(async (datos: ActualizarLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> => {
    try {
      setLoading(true);
      console.log('[useLimpiezaPublica] Actualizando limpieza publica:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codZona) {
        throw new Error('Debe proporcionar una zona');
      }

      if (!datos.codCriterio) {
        throw new Error('Debe proporcionar un criterio');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const arbitrioActualizado = await limpienzaPublicaService.actualizarLimpiezaPublica(datos);

      // Actualizar estado local
      setLimpiezaPublica(prev => prev.map(lp =>
        lp.anio === datos.anio &&
        lp.codZona === datos.codZona &&
        lp.codCriterio === datos.codCriterio
          ? arbitrioActualizado
          : lp
      ));

      // Recargar lista
      try {
        console.log('[useLimpiezaPublica] Recargando datos despues de actualizar...');
        await listarLimpiezaPublica({ anio: datos.anio });
      } catch (err) {
        console.warn('[useLimpiezaPublica] Error recargando datos:', err);
      }

      console.log('[useLimpiezaPublica] Limpieza publica actualizado exitosamente');
      return arbitrioActualizado;

    } catch (error: any) {
      console.error('[useLimpiezaPublica] Error actualizando limpieza publica:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarLimpiezaPublica]);

  // Actualizar arbitrio de limpieza publica OTROS
  const actualizarLimpiezaPublicaOtros = useCallback(async (datos: ActualizarLimpiezaPublicaDTO): Promise<LimpiezaPublicaData> => {
    try {
      setLoading(true);
      console.log('[useLimpiezaPublica] Actualizando limpieza publica OTROS:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codZona) {
        throw new Error('Debe proporcionar una zona');
      }

      if (!datos.codCriterio) {
        throw new Error('Debe proporcionar un criterio');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const arbitrioActualizado = await limpienzaPublicaService.actualizarLimpiezaPublicaOtros(datos);

      // Actualizar estado local
      setLimpiezaPublicaOtros(prev => prev.map(lp =>
        lp.anio === datos.anio &&
        lp.codZona === datos.codZona &&
        lp.codCriterio === datos.codCriterio
          ? arbitrioActualizado
          : lp
      ));

      // Recargar lista
      try {
        console.log('[useLimpiezaPublica] Recargando datos OTROS despues de actualizar...');
        await listarLimpiezaPublicaOtros({ anio: datos.anio });
      } catch (err) {
        console.warn('[useLimpiezaPublica] Error recargando datos OTROS:', err);
      }

      console.log('[useLimpiezaPublica] Limpieza publica OTROS actualizado exitosamente');
      return arbitrioActualizado;

    } catch (error: any) {
      console.error('[useLimpiezaPublica] Error actualizando limpieza publica OTROS:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarLimpiezaPublicaOtros]);

  // Recargar todos los datos
  const recargar = useCallback(async () => {
    const anio = anioActual ? { anio: anioActual } : undefined;
    await Promise.all([
      listarLimpiezaPublica(anio),
      listarLimpiezaPublicaOtros(anio)
    ]);
  }, [listarLimpiezaPublica, listarLimpiezaPublicaOtros, anioActual]);

  // Cargar datos iniciales si se proporciona año
  useEffect(() => {
    if (anioInicial) {
      Promise.all([
        listarLimpiezaPublica({ anio: anioInicial }),
        listarLimpiezaPublicaOtros({ anio: anioInicial })
      ]);
    }
  }, [anioInicial, listarLimpiezaPublica, listarLimpiezaPublicaOtros]);

  return {
    limpiezaPublica,
    limpiezaPublicaOtros,
    loading,
    error,
    listarLimpiezaPublica,
    crearLimpiezaPublica,
    actualizarLimpiezaPublica,
    listarLimpiezaPublicaOtros,
    crearLimpiezaPublicaOtros,
    actualizarLimpiezaPublicaOtros,
    recargar
  };
};

/**
 * Hook para obtener un arbitrio especifico de limpieza publica
 */
export const useLimpiezaPublicaEspecifica = (
  anio: number,
  codZona: number,
  codCriterio: number,
  tipo: 'normal' | 'otros' = 'normal'
) => {
  const [arbitrio, setArbitrio] = useState<LimpiezaPublicaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarArbitrio = async () => {
      if (!anio || !codZona || !codCriterio) {
        setArbitrio(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Listar por año y buscar la combinacion especifica
        const data = tipo === 'normal'
          ? await limpienzaPublicaService.listarLimpiezaPublica({ anio })
          : await limpienzaPublicaService.listarLimpiezaPublicaOtros({ anio });

        const arbitrioEncontrado = data.find(
          lp => lp.codZona === codZona && lp.codCriterio === codCriterio
        );

        setArbitrio(arbitrioEncontrado || null);

      } catch (error: any) {
        console.error('[useLimpiezaPublicaEspecifica] Error:', error);
        setError(error.message);
        setArbitrio(null);
      } finally {
        setLoading(false);
      }
    };

    cargarArbitrio();
  }, [anio, codZona, codCriterio, tipo]);

  return { arbitrio, loading, error };
};
