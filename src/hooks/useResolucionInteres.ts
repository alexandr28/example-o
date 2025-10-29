// src/hooks/useResolucionInteres.ts
import { useState, useEffect, useCallback } from 'react';
import resolucionInteresService, {
  ResolucionInteresData,
  CreateResolucionInteresDTO,
  UpdateResolucionInteresDTO,
  DeleteResolucionInteresDTO
} from '../services/resolucionInteresService';

/**
 * Hook para obtener todas las resoluciones de interes
 * Carga automaticamente al montar el componente
 */
export function useResolucionesInteres() {
  const [data, setData] = useState<ResolucionInteresData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const resoluciones = await resolucionInteresService.obtenerTodas();

        if (mounted) {
          setData(resoluciones);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[useResolucionesInteres] Error:', err);
          setError(err.message || 'Error al cargar las resoluciones de interes');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const resoluciones = await resolucionInteresService.obtenerTodas();
      setData(resoluciones);
      setLoading(false);
    } catch (err: any) {
      console.error('[useResolucionesInteres] Error en refetch:', err);
      setError(err.message || 'Error al recargar las resoluciones de interes');
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
}

/**
 * Hook para obtener una resolucion de interes por codigo
 * @param codResolucionInteres - Codigo de la resolucion a buscar
 * @param enabled - Si es false, no ejecuta la peticion automaticamente
 */
export function useResolucionInteresPorCodigo(
  codResolucionInteres: number | null,
  enabled: boolean = true
) {
  const [data, setData] = useState<ResolucionInteresData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!codResolucionInteres || !enabled) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const resolucion = await resolucionInteresService.obtenerPorCodigo(codResolucionInteres);

        if (mounted) {
          setData(resolucion);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[useResolucionInteresPorCodigo] Error:', err);
          setError(err.message || 'Error al cargar la resolucion de interes');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [codResolucionInteres, enabled]);

  const refetch = useCallback(async () => {
    if (!codResolucionInteres) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resolucion = await resolucionInteresService.obtenerPorCodigo(codResolucionInteres);
      setData(resolucion);
      setLoading(false);
    } catch (err: any) {
      console.error('[useResolucionInteresPorCodigo] Error en refetch:', err);
      setError(err.message || 'Error al recargar la resolucion de interes');
      setLoading(false);
    }
  }, [codResolucionInteres]);

  return { data, loading, error, refetch };
}

/**
 * Hook para crear una nueva resolucion de interes
 * Retorna una funcion mutate que ejecuta la creacion
 */
export function useCreateResolucionInteres() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResolucionInteresData | null>(null);

  const mutate = useCallback(async (datos: CreateResolucionInteresDTO): Promise<ResolucionInteresData | null> => {
    try {
      setLoading(true);
      setError(null);

      const resolucion = await resolucionInteresService.crear(datos);

      setData(resolucion);
      setLoading(false);

      return resolucion;
    } catch (err: any) {
      console.error('[useCreateResolucionInteres] Error:', err);
      setError(err.message || 'Error al crear la resolucion de interes');
      setLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
}

/**
 * Hook para actualizar una resolucion de interes existente
 * Retorna una funcion mutate que ejecuta la actualizacion
 */
export function useUpdateResolucionInteres() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResolucionInteresData | null>(null);

  const mutate = useCallback(async (datos: UpdateResolucionInteresDTO): Promise<ResolucionInteresData | null> => {
    try {
      setLoading(true);
      setError(null);

      const resolucion = await resolucionInteresService.actualizar(datos);

      setData(resolucion);
      setLoading(false);

      return resolucion;
    } catch (err: any) {
      console.error('[useUpdateResolucionInteres] Error:', err);
      setError(err.message || 'Error al actualizar la resolucion de interes');
      setLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
}

/**
 * Hook para eliminar una resolucion de interes
 * Retorna una funcion mutate que ejecuta la eliminacion
 */
export function useDeleteResolucionInteres() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const mutate = useCallback(async (datos: DeleteResolucionInteresDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await resolucionInteresService.eliminar(datos);

      setSuccess(true);
      setLoading(false);

      return true;
    } catch (err: any) {
      console.error('[useDeleteResolucionInteres] Error:', err);
      setError(err.message || 'Error al eliminar la resolucion de interes');
      setLoading(false);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
}

/**
 * Hook para obtener resoluciones formateadas como opciones para Select
 * Util para dropdowns y selects en formularios
 */
export function useResolucionInteresOptions() {
  const [options, setOptions] = useState<Array<{ value: number; label: string; data: ResolucionInteresData }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const resoluciones = await resolucionInteresService.obtenerTodas();

        if (mounted) {
          const formattedOptions = resoluciones.map((resolucion) => ({
            value: resolucion.codResolucionInteres,
            label: `${resolucion.descripcion} - ${resolucion.anioFiscal || 'N/A'}`,
            data: resolucion
          }));

          setOptions(formattedOptions);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[useResolucionInteresOptions] Error:', err);
          setError(err.message || 'Error al cargar las opciones de resoluciones');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const resoluciones = await resolucionInteresService.obtenerTodas();

      const formattedOptions = resoluciones.map((resolucion) => ({
        value: resolucion.codResolucionInteres,
        label: `${resolucion.descripcion} - ${resolucion.anioFiscal || 'N/A'}`,
        data: resolucion
      }));

      setOptions(formattedOptions);
      setLoading(false);
    } catch (err: any) {
      console.error('[useResolucionInteresOptions] Error en refetch:', err);
      setError(err.message || 'Error al recargar las opciones de resoluciones');
      setLoading(false);
    }
  }, []);

  return { options, loading, error, refetch };
}
