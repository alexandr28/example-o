// src/hooks/useDirecciones.ts
import { useState, useCallback, useEffect } from 'react';
import { direccionService, Direccion } from '../services/direcionService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Hook para gestionar direcciones con datos reales del servidor
 */
export const useDirecciones = () => {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conectado, setConectado] = useState(false);
  
  /**
   * Verifica la conexión con el servidor
   */
  const verificarConexion = useCallback(async () => {
    const estaConectado = await direccionService.verificarConexion();
    setConectado(estaConectado);
    return estaConectado;
  }, []);
  
  /**
   * Carga todas las direcciones del servidor
   */
  const cargarDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useDirecciones] Cargando direcciones del servidor...');
      
      const data = await direccionService.obtenerTodas();
      
      if (data && data.length > 0) {
        console.log(`✅ [useDirecciones] ${data.length} direcciones cargadas del servidor`);
        setDirecciones(data);
        setConectado(true);
      } else {
        console.warn('⚠️ [useDirecciones] No se encontraron direcciones');
        setDirecciones([]);
        NotificationService.info('No se encontraron direcciones registradas');
      }
      
    } catch (error: any) {
      console.error('❌ [useDirecciones] Error:', error);
      
      if (error.message.includes('403') || error.message.includes('autorización')) {
        setError('Sin autorización para acceder a direcciones');
        NotificationService.warning('No tiene permisos para ver direcciones. Contacte al administrador.');
      } else if (error.message.includes('conexión')) {
        setError('Error de conexión con el servidor');
        NotificationService.error('No se pudo conectar con el servidor');
      } else {
        setError('Error al cargar direcciones');
        NotificationService.error('Error al cargar las direcciones');
      }
      
      setDirecciones([]);
      setConectado(false);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Busca direcciones por nombre de vía
   */
  const buscarPorNombreVia = useCallback(async (nombreVia: string) => {
    if (!nombreVia || nombreVia.trim().length < 2) {
      await cargarDirecciones();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 [useDirecciones] Buscando por nombre de vía: "${nombreVia}"`);
      
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
      
      console.log(`🔍 [useDirecciones] Buscando por tipo de vía: "${tipoVia}"`);
      
      const resultados = await direccionService.listarPorTipoVia(tipoVia);
      
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
    sector?: number;
    barrio?: number;
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
   * Efecto para verificar conexión al montar
   */
  useEffect(() => {
    verificarConexion();
  }, [verificarConexion]);
  
  return {
    // Estado
    direcciones,
    loading,
    error,
    conectado,
    
    // Acciones
    cargarDirecciones,
    buscarPorNombreVia,
    buscarPorTipoVia,
    buscarConFiltros,
    verificarConexion,
    
    // Utilidades
    totalDirecciones: direcciones.length
  };
};