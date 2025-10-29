// src/hooks/useSerenazgo.ts
import { useState, useCallback, useEffect } from 'react';
import serenazgoService, {
  SerenazgoData,
  CrearSerenazgoDTO,
  ActualizarSerenazgoDTO
} from '../services/serenazgoService';

interface UseSerenazgoResult {
  serenazgos: SerenazgoData[];
  loading: boolean;
  error: string | null;

  // Operaciones
  listarSerenazgo: (params?: { anio?: number }) => Promise<void>;
  crearSerenazgo: (datos: CrearSerenazgoDTO) => Promise<SerenazgoData>;
  actualizarSerenazgo: (datos: ActualizarSerenazgoDTO) => Promise<SerenazgoData>;
  recargar: () => Promise<void>;
}

/**
 * Hook para gestionar arbitrios de serenazgo
 */
export const useSerenazgo = (anioInicial?: number): UseSerenazgoResult => {
  const [serenazgos, setSerenazgos] = useState<SerenazgoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anioActual, setAnioActual] = useState<number | undefined>(anioInicial);

  // Listar arbitrios de serenazgo
  const listarSerenazgo = useCallback(async (params?: { anio?: number }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useSerenazgo] Listando serenazgos con params:', params);

      const anio = params?.anio || anioActual;
      const data = await serenazgoService.listarSerenazgo(anio ? { anio } : undefined);

      console.log('[useSerenazgo] Serenazgos cargados:', data.length);
      setSerenazgos(data);

      if (anio) {
        setAnioActual(anio);
      }

    } catch (error: any) {
      console.error('[useSerenazgo] Error listando serenazgos:', error);
      setError(error.message || 'Error al listar arbitrios de serenazgo');
      setSerenazgos([]);
    } finally {
      setLoading(false);
    }
  }, [anioActual]);

  // Crear arbitrio de serenazgo
  const crearSerenazgo = useCallback(async (datos: CrearSerenazgoDTO): Promise<SerenazgoData> => {
    try {
      setLoading(true);
      console.log('[useSerenazgo] Creando serenazgo:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codGrupoUso) {
        throw new Error('Debe proporcionar un grupo de uso');
      }

      if (!datos.codCuadrante) {
        throw new Error('Debe proporcionar un cuadrante');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const nuevoSerenazgo = await serenazgoService.crearSerenazgo(datos);

      // Actualizar estado local
      setSerenazgos(prev => [...prev, nuevoSerenazgo]);

      // Recargar lista para asegurar sincronizacion
      try {
        console.log('[useSerenazgo] Recargando datos despues de crear...');
        await listarSerenazgo({ anio: datos.anio });
      } catch (err) {
        console.warn('[useSerenazgo] Error recargando datos:', err);
      }

      console.log('[useSerenazgo] Serenazgo creado exitosamente');
      return nuevoSerenazgo;

    } catch (error: any) {
      console.error('[useSerenazgo] Error creando serenazgo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarSerenazgo]);

  // Actualizar arbitrio de serenazgo
  const actualizarSerenazgo = useCallback(async (datos: ActualizarSerenazgoDTO): Promise<SerenazgoData> => {
    try {
      setLoading(true);
      console.log('[useSerenazgo] Actualizando serenazgo:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codGrupoUso) {
        throw new Error('Debe proporcionar un grupo de uso');
      }

      if (!datos.codCuadrante) {
        throw new Error('Debe proporcionar un cuadrante');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const serenazgoActualizado = await serenazgoService.actualizarSerenazgo(datos);

      // Actualizar estado local - buscar por combinacion anio + codGrupoUso + codCuadrante
      setSerenazgos(prev => prev.map(s =>
        s.anio === datos.anio &&
        s.codGrupoUso === datos.codGrupoUso &&
        s.codCuadrante === datos.codCuadrante
          ? serenazgoActualizado
          : s
      ));

      // Recargar lista para asegurar sincronizacion
      try {
        console.log('[useSerenazgo] Recargando datos despues de actualizar...');
        await listarSerenazgo({ anio: datos.anio });
      } catch (err) {
        console.warn('[useSerenazgo] Error recargando datos:', err);
      }

      console.log('[useSerenazgo] Serenazgo actualizado exitosamente');
      return serenazgoActualizado;

    } catch (error: any) {
      console.error('[useSerenazgo] Error actualizando serenazgo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarSerenazgo]);

  // Recargar datos
  const recargar = useCallback(async () => {
    await listarSerenazgo(anioActual ? { anio: anioActual } : undefined);
  }, [listarSerenazgo, anioActual]);

  // Cargar datos iniciales si se proporciona año
  useEffect(() => {
    if (anioInicial) {
      listarSerenazgo({ anio: anioInicial });
    }
  }, [anioInicial, listarSerenazgo]);

  return {
    serenazgos,
    loading,
    error,
    listarSerenazgo,
    crearSerenazgo,
    actualizarSerenazgo,
    recargar
  };
};

/**
 * Hook para obtener un arbitrio de serenazgo especifico
 */
export const useSerenazgoEspecifico = (
  anio: number,
  codGrupoUso: number,
  codCuadrante: number
) => {
  const [serenazgo, setSerenazgo] = useState<SerenazgoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarSerenazgo = async () => {
      if (!anio || !codGrupoUso || !codCuadrante) {
        setSerenazgo(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Listar por año y buscar la combinacion especifica
        const data = await serenazgoService.listarSerenazgo({ anio });
        const serenazgoEncontrado = data.find(
          s => s.codGrupoUso === codGrupoUso && s.codCuadrante === codCuadrante
        );

        setSerenazgo(serenazgoEncontrado || null);

      } catch (error: any) {
        console.error('[useSerenazgoEspecifico] Error:', error);
        setError(error.message);
        setSerenazgo(null);
      } finally {
        setLoading(false);
      }
    };

    cargarSerenazgo();
  }, [anio, codGrupoUso, codCuadrante]);

  return { serenazgo, loading, error };
};
