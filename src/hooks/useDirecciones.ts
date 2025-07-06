// src/hooks/useDirecciones.ts
import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '../components/utils/Notification';
import { LadoDireccion } from '../models';
import { DireccionFormData } from '../models/Direcciones';

// Importar el servicio de direcciones actualizado
import { DireccionService, Direccion } from '../services/direccionService';

// Crear instancia del servicio de direcciones
const direccionService = DireccionService.getInstance();

// Opciones de lado por defecto
const LADOS_OPTIONS = [
  { value: LadoDireccion.NINGUNO, label: 'Ninguno' },
  { value: LadoDireccion.IZQUIERDO, label: 'Izquierdo' },
  { value: LadoDireccion.DERECHO, label: 'Derecho' },
  { value: LadoDireccion.PAR, label: 'Par' },
  { value: LadoDireccion.IMPAR, label: 'Impar' }
];

/**
 * Hook para gestionar direcciones usando solo el servicio real
 */
export const useDirecciones = () => {
  // Estados principales
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conectado, setConectado] = useState(false);

  /**
   * Verifica la conexión con el servidor
   */
  const verificarConexion = useCallback(async () => {
    try {
      const estaConectado = await direccionService.verificarConexion();
      setConectado(estaConectado);
      return estaConectado;
    } catch (error) {
      setConectado(false);
      return false;
    }
  }, []);

  /**
   * Carga todas las direcciones del servidor
   */
  const cargarDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useDirecciones] Cargando direcciones...');
      
      const data = await direccionService.obtenerTodas();
      
      if (data && data.length > 0) {
        console.log(`✅ [useDirecciones] ${data.length} direcciones cargadas`);
        setDirecciones(data);
        setConectado(true);
      } else {
        console.warn('⚠️ [useDirecciones] No se encontraron direcciones');
        setDirecciones([]);
        NotificationService.info('No se encontraron direcciones registradas');
      }
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error:', error);
      setError('Error al cargar direcciones');
      NotificationService.error('Error al cargar las direcciones');
      setDirecciones([]);
      setConectado(false);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar recreación

  /**
   * Busca direcciones por nombre de vía
   */
  const buscarPorNombreVia = useCallback(async (nombreVia: string) => {
    if (!nombreVia || nombreVia.trim().length < 1) {
      await cargarDirecciones();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 [useDirecciones] Buscando: "${nombreVia}"`);
      
      const resultados = await direccionService.buscarPorNombreVia(nombreVia);
      
      console.log(`✅ [useDirecciones] ${resultados.length} direcciones encontradas`);
      setDirecciones(resultados);
      
      if (resultados.length === 0) {
        NotificationService.info(`No se encontraron direcciones con "${nombreVia}"`);
      }
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error en búsqueda:', error);
      setError('Error al buscar direcciones');
      setDirecciones([]);
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones]);

  /**
   * Busca direcciones por tipo de vía
   */
  const buscarPorTipoVia = useCallback(async (tipoVia: string) => {
    if (!tipoVia) {
      await cargarDirecciones();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 [useDirecciones] Buscando por tipo: "${tipoVia}"`);
      
      const resultados = await direccionService.buscarPorTipoVia(tipoVia);
      
      console.log(`✅ [useDirecciones] ${resultados.length} direcciones encontradas`);
      setDirecciones(resultados);
      
      if (resultados.length === 0) {
        NotificationService.info(`No se encontraron direcciones tipo "${tipoVia}"`);
      }
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error en búsqueda:', error);
      setError('Error al buscar direcciones');
      setDirecciones([]);
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones]);

  /**
   * Busca direcciones con filtros combinados
   */
  const buscarConFiltros = useCallback(async (filtros: {
    tipo?: string;
    nombre?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useDirecciones] Buscando con filtros:', filtros);
      
      const resultados = await direccionService.buscarConFiltros(filtros);
      
      console.log(`✅ [useDirecciones] ${resultados.length} direcciones encontradas`);
      setDirecciones(resultados);
      
      if (resultados.length === 0) {
        NotificationService.info('No se encontraron direcciones con los criterios especificados');
      }
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error en búsqueda:', error);
      setError('Error al buscar direcciones');
      setDirecciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Selecciona una dirección
   */
  const seleccionarDireccion = useCallback((direccion: Direccion) => {
    console.log('📍 [useDirecciones] Dirección seleccionada:', direccion);
    setDireccionSeleccionada(direccion);
  }, []);

  /**
   * Limpia la selección actual
   */
  const limpiarSeleccion = useCallback(() => {
    console.log('🧹 [useDirecciones] Limpiando selección');
    setDireccionSeleccionada(null);
  }, []);

  /**
   * Crea una nueva dirección
   */
  const crearDireccion = useCallback(async (datos: {
    codBarrioVia: number;
    cuadra: number;
    codLado?: string;
    loteInicial: number;
    loteFinal: number;
    codSector: number;
    codBarrio: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useDirecciones] Creando dirección:', datos);
      
      // Agregar codUsuario (por defecto 1)
      const datosCompletos = {
        ...datos,
        codUsuario: 1
      };
      
      const nuevaDireccion = await direccionService.crear(datosCompletos);
      
      console.log('✅ [useDirecciones] Dirección creada:', nuevaDireccion);
      
      // Recargar la lista de direcciones
      await cargarDirecciones();
      
      return nuevaDireccion;
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error al crear:', error);
      setError('Error al crear la dirección');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones]);

  /**
   * Actualiza una dirección existente
   */
  const actualizarDireccion = useCallback(async (
    id: number,
    datos: Partial<{
      codBarrioVia: number;
      cuadra: number;
      codLado: string;
      loteInicial: number;
      loteFinal: number;
      codSector: number;
      codBarrio: number;
    }>
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📝 [useDirecciones] Actualizando dirección ${id}:`, datos);
      
      const direccionActualizada = await direccionService.actualizar(id, datos);
      
      console.log('✅ [useDirecciones] Dirección actualizada:', direccionActualizada);
      
      // Recargar la lista de direcciones
      await cargarDirecciones();
      
      return direccionActualizada;
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error al actualizar:', error);
      setError('Error al actualizar la dirección');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones]);

  /**
   * Elimina una dirección
   */
  const eliminarDireccion = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ [useDirecciones] Eliminando dirección ${id}`);
      
      await direccionService.eliminar(id);
      
      console.log('✅ [useDirecciones] Dirección eliminada');
      
      // Recargar la lista de direcciones
      await cargarDirecciones();
      
      // Limpiar selección si era la dirección eliminada
      if (direccionSeleccionada?.codDireccion === id) {
        limpiarSeleccion();
      }
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error al eliminar:', error);
      setError('Error al eliminar la dirección');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cargarDirecciones, direccionSeleccionada, limpiarSeleccion]);

  /**
   * Efecto para verificar conexión al montar
   */
  useEffect(() => {
    verificarConexion();
  }, [verificarConexion]);

  return {
    // Estados principales
    direcciones,
    direccionSeleccionada,
    loading,
    error,
    conectado,
    
    // Acciones principales
    cargarDirecciones,
    seleccionarDireccion,
    limpiarSeleccion,
    
    // CRUD
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion,
    
    // Búsquedas
    buscarPorNombreVia,
    buscarPorTipoVia,
    buscarConFiltros,
    
    // Utilidades
    verificarConexion,
    totalDirecciones: direcciones.length
  };
};