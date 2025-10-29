// src/hooks/useParquesJardines.ts
import { useState, useCallback, useEffect } from 'react';
import parquesJardinesService, {
  ParquesJardinesData,
  CrearParquesJardinesDTO,
  ActualizarParquesJardinesDTO
} from '../services/parquesJardinesService';

interface UseParquesJardinesResult {
  parquesJardines: ParquesJardinesData[];
  loading: boolean;
  error: string | null;

  // Operaciones
  listarParquesJardines: (params?: { anio?: number }) => Promise<void>;
  crearParquesJardines: (datos: CrearParquesJardinesDTO) => Promise<ParquesJardinesData>;
  actualizarParquesJardines: (datos: ActualizarParquesJardinesDTO) => Promise<ParquesJardinesData>;
  recargar: () => Promise<void>;
}

/**
 * Hook para gestionar arbitrios de parques y jardines
 */
export const useParquesJardines = (anioInicial?: number): UseParquesJardinesResult => {
  const [parquesJardines, setParquesJardines] = useState<ParquesJardinesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anioActual, setAnioActual] = useState<number | undefined>(anioInicial);

  // Listar arbitrios de parques y jardines
  const listarParquesJardines = useCallback(async (params?: { anio?: number }) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useParquesJardines] Listando parques y jardines con params:', params);

      const anio = params?.anio || anioActual;
      const data = await parquesJardinesService.listarParquesJardines(anio ? { anio } : undefined);

      console.log('[useParquesJardines] Parques y jardines cargados:', data.length);
      setParquesJardines(data);

      if (anio) {
        setAnioActual(anio);
      }

    } catch (error: any) {
      console.error('[useParquesJardines] Error listando parques y jardines:', error);
      setError(error.message || 'Error al listar arbitrios de parques y jardines');
      setParquesJardines([]);
    } finally {
      setLoading(false);
    }
  }, [anioActual]);

  // Crear arbitrio de parques y jardines
  const crearParquesJardines = useCallback(async (datos: CrearParquesJardinesDTO): Promise<ParquesJardinesData> => {
    try {
      setLoading(true);
      console.log('[useParquesJardines] Creando parques y jardines:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codRuta) {
        throw new Error('Debe proporcionar una ruta');
      }

      if (!datos.codUbicacion) {
        throw new Error('Debe proporcionar una ubicación');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const nuevoParqueJardin = await parquesJardinesService.crearParquesJardines(datos);

      // Actualizar estado local
      setParquesJardines(prev => [...prev, nuevoParqueJardin]);

      // Recargar lista para asegurar sincronizacion
      try {
        console.log('[useParquesJardines] Recargando datos despues de crear...');
        await listarParquesJardines({ anio: datos.anio });
      } catch (err) {
        console.warn('[useParquesJardines] Error recargando datos:', err);
      }

      console.log('[useParquesJardines] Parques y jardines creado exitosamente');
      return nuevoParqueJardin;

    } catch (error: any) {
      console.error('[useParquesJardines] Error creando parques y jardines:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarParquesJardines]);

  // Actualizar arbitrio de parques y jardines
  const actualizarParquesJardines = useCallback(async (datos: ActualizarParquesJardinesDTO): Promise<ParquesJardinesData> => {
    try {
      setLoading(true);
      console.log('[useParquesJardines] Actualizando parques y jardines:', datos);

      // Validaciones
      if (!datos.anio) {
        throw new Error('Debe proporcionar un año');
      }

      if (!datos.codRuta) {
        throw new Error('Debe proporcionar una ruta');
      }

      if (!datos.codUbicacion) {
        throw new Error('Debe proporcionar una ubicación');
      }

      if (datos.tasaMensual === undefined || datos.tasaMensual < 0) {
        throw new Error('Debe proporcionar una tasa mensual válida');
      }

      const parqueJardinActualizado = await parquesJardinesService.actualizarParquesJardines(datos);

      // Actualizar estado local - buscar por combinacion anio + codRuta + codUbicacion
      setParquesJardines(prev => prev.map(pj =>
        pj.anio === datos.anio &&
        pj.codRuta === datos.codRuta &&
        pj.codUbicacion === datos.codUbicacion
          ? parqueJardinActualizado
          : pj
      ));

      // Recargar lista para asegurar sincronizacion
      try {
        console.log('[useParquesJardines] Recargando datos despues de actualizar...');
        await listarParquesJardines({ anio: datos.anio });
      } catch (err) {
        console.warn('[useParquesJardines] Error recargando datos:', err);
      }

      console.log('[useParquesJardines] Parques y jardines actualizado exitosamente');
      return parqueJardinActualizado;

    } catch (error: any) {
      console.error('[useParquesJardines] Error actualizando parques y jardines:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [listarParquesJardines]);

  // Recargar datos
  const recargar = useCallback(async () => {
    await listarParquesJardines(anioActual ? { anio: anioActual } : undefined);
  }, [listarParquesJardines, anioActual]);

  // Cargar datos iniciales si se proporciona año
  useEffect(() => {
    if (anioInicial) {
      listarParquesJardines({ anio: anioInicial });
    }
  }, [anioInicial, listarParquesJardines]);

  return {
    parquesJardines,
    loading,
    error,
    listarParquesJardines,
    crearParquesJardines,
    actualizarParquesJardines,
    recargar
  };
};

/**
 * Hook para obtener un arbitrio de parques y jardines especifico
 */
export const useParqueJardinEspecifico = (
  anio: number,
  codRuta: number,
  codUbicacion: number
) => {
  const [parqueJardin, setParqueJardin] = useState<ParquesJardinesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarParqueJardin = async () => {
      if (!anio || !codRuta || !codUbicacion) {
        setParqueJardin(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Listar por año y buscar la combinacion especifica
        const data = await parquesJardinesService.listarParquesJardines({ anio });
        const parqueJardinEncontrado = data.find(
          pj => pj.codRuta === codRuta && pj.codUbicacion === codUbicacion
        );

        setParqueJardin(parqueJardinEncontrado || null);

      } catch (error: any) {
        console.error('[useParqueJardinEspecifico] Error:', error);
        setError(error.message);
        setParqueJardin(null);
      } finally {
        setLoading(false);
      }
    };

    cargarParqueJardin();
  }, [anio, codRuta, codUbicacion]);

  return { parqueJardin, loading, error };
};
