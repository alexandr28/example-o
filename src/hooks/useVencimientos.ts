// src/hooks/useVencimientos.ts
import { useState, useEffect, useCallback } from 'react';
import vencimientoService, {
  VencimientoData,
  CreateVencimientoDTO
} from '../services/vencimientoService';

/**
 * Hook para obtener todos los vencimientos
 * Carga automaticamente al montar el componente
 */
export function useVencimientos() {
  const [data, setData] = useState<VencimientoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const vencimientos = await vencimientoService.obtenerTodos();

        if (mounted) {
          setData(vencimientos);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[useVencimientos] Error:', err);
          setError(err.message || 'Error al cargar los vencimientos');
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

      const vencimientos = await vencimientoService.obtenerTodos();
      setData(vencimientos);
      setLoading(false);
    } catch (err: any) {
      console.error('[useVencimientos] Error en refetch:', err);
      setError(err.message || 'Error al recargar los vencimientos');
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
}

/**
 * Hook para obtener vencimientos por anio
 * @param anio - Anio fiscal para filtrar vencimientos
 * @param enabled - Si es false, no ejecuta la peticion automaticamente
 */
export function useVencimientosPorAnio(
  anio: number | null,
  enabled: boolean = true
) {
  const [data, setData] = useState<VencimientoData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!anio || !enabled) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const vencimientos = await vencimientoService.obtenerPorAnio(anio);

        if (mounted) {
          setData(vencimientos);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[useVencimientosPorAnio] Error:', err);
          setError(err.message || 'Error al cargar los vencimientos del anio');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [anio, enabled]);

  const refetch = useCallback(async () => {
    if (!anio) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const vencimientos = await vencimientoService.obtenerPorAnio(anio);
      setData(vencimientos);
      setLoading(false);
    } catch (err: any) {
      console.error('[useVencimientosPorAnio] Error en refetch:', err);
      setError(err.message || 'Error al recargar los vencimientos del anio');
      setLoading(false);
    }
  }, [anio]);

  return { data, loading, error, refetch };
}

/**
 * Hook para crear vencimientos de un anio especifico
 * Retorna una funcion mutate que ejecuta la creacion
 */
export function useCreateVencimientos() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VencimientoData[]>([]);

  const mutate = useCallback(async (datos: CreateVencimientoDTO): Promise<VencimientoData[] | null> => {
    try {
      setLoading(true);
      setError(null);

      const vencimientos = await vencimientoService.crear(datos);

      setData(vencimientos);
      setLoading(false);

      return vencimientos;
    } catch (err: any) {
      console.error('[useCreateVencimientos] Error:', err);
      setError(err.message || 'Error al crear los vencimientos');
      setLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
}

/**
 * Hook para obtener vencimientos agrupados por mes
 * Util para mostrar en tablas o calendarios
 */
export function useVencimientosAgrupados(anio: number | null) {
  const { data, loading, error, refetch } = useVencimientosPorAnio(anio);
  const [agrupados, setAgrupados] = useState<Record<string, VencimientoData[]>>({});

  useEffect(() => {
    if (data.length > 0) {
      const grupos = data.reduce((acc, vencimiento) => {
        const mes = vencimiento.mes;
        if (!acc[mes]) {
          acc[mes] = [];
        }
        acc[mes].push(vencimiento);
        return acc;
      }, {} as Record<string, VencimientoData[]>);

      setAgrupados(grupos);
    } else {
      setAgrupados({});
    }
  }, [data]);

  return { agrupados, data, loading, error, refetch };
}

/**
 * Hook para obtener vencimientos formateados como opciones para Select
 * Util para dropdowns y selects en formularios
 */
export function useVencimientosOptions(anio?: number) {
  const [options, setOptions] = useState<Array<{ value: number; label: string; data: VencimientoData }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const vencimientos = anio
          ? await vencimientoService.obtenerPorAnio(anio)
          : await vencimientoService.obtenerTodos();

        if (mounted) {
          const formattedOptions = vencimientos.map((vencimiento, index) => ({
            value: index,
            label: `${vencimiento.mes} ${vencimiento.anio} - ${vencimiento.tipoImpuesto}`,
            data: vencimiento
          }));

          setOptions(formattedOptions);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[useVencimientosOptions] Error:', err);
          setError(err.message || 'Error al cargar las opciones de vencimientos');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [anio]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const vencimientos = anio
        ? await vencimientoService.obtenerPorAnio(anio)
        : await vencimientoService.obtenerTodos();

      const formattedOptions = vencimientos.map((vencimiento, index) => ({
        value: index,
        label: `${vencimiento.mes} ${vencimiento.anio} - ${vencimiento.tipoImpuesto}`,
        data: vencimiento
      }));

      setOptions(formattedOptions);
      setLoading(false);
    } catch (err: any) {
      console.error('[useVencimientosOptions] Error en refetch:', err);
      setError(err.message || 'Error al recargar las opciones de vencimientos');
      setLoading(false);
    }
  }, [anio]);

  return { options, loading, error, refetch };
}
