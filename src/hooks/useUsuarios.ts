// src/hooks/useUsuarios.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import {
  usuarioService,
  UsuarioData,
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
  CambiarClaveDTO,
  ListarUsuariosParams
} from '../services/usuarioService';

/**
 * Hook para gestionar usuarios
 * NO requiere autenticacion para ninguna operacion
 */
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para controlar si ya se esta cargando
  const isLoadingRef = useRef(false);

  /**
   * Carga todos los usuarios con filtro opcional
   */
  const cargarUsuarios = useCallback(async (params?: ListarUsuariosParams) => {
    // Usar ref para evitar cargas multiples
    if (isLoadingRef.current) {
      console.log('[useUsuarios] Carga ya en proceso, omitiendo...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Cargando usuarios...');

      const datos = await usuarioService.listar(params);

      setUsuarios(datos);
      console.log(`[useUsuarios] ${datos.length} usuarios cargados`);

    } catch (error: any) {
      console.error('[useUsuarios] Error:', error);
      setError(error.message || 'Error al cargar usuarios');
      NotificationService.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * Busca usuarios con parametro
   */
  const buscarUsuarios = useCallback(async (parametroBusqueda: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Buscando usuarios con parametro:', parametroBusqueda);

      const resultados = await usuarioService.buscar(parametroBusqueda);

      setUsuarios(resultados);
      console.log(`[useUsuarios] ${resultados.length} resultados encontrados`);

    } catch (error: any) {
      console.error('[useUsuarios] Error en busqueda:', error);
      setError(error.message || 'Error al buscar usuarios');
      NotificationService.error('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo usuario
   */
  const crearUsuario = useCallback(async (datos: CreateUsuarioDTO): Promise<UsuarioData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Creando usuario:', datos);

      const nuevoUsuario = await usuarioService.insertar(datos);

      NotificationService.success('Usuario creado correctamente');

      // Recargar lista
      await cargarUsuarios();

      return nuevoUsuario;

    } catch (error: any) {
      console.error('[useUsuarios] Error al crear:', error);
      setError(error.message || 'Error al crear usuario');
      NotificationService.error(error.message || 'Error al crear usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarUsuarios]);

  /**
   * Actualiza un usuario existente
   */
  const actualizarUsuario = useCallback(async (datos: UpdateUsuarioDTO): Promise<UsuarioData | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Actualizando usuario:', datos);

      const usuarioActualizado = await usuarioService.actualizar(datos);

      NotificationService.success('Usuario actualizado correctamente');

      // Recargar lista
      await cargarUsuarios();

      return usuarioActualizado;

    } catch (error: any) {
      console.error('[useUsuarios] Error al actualizar:', error);
      setError(error.message || 'Error al actualizar usuario');
      NotificationService.error(error.message || 'Error al actualizar usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarUsuarios]);

  /**
   * Cambia la clave de un usuario
   */
  const cambiarClave = useCallback(async (datos: CambiarClaveDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Cambiando clave de usuario:', datos.codUsuario);

      await usuarioService.cambiarClave(datos);

      NotificationService.success('Clave cambiada correctamente');

      return true;

    } catch (error: any) {
      console.error('[useUsuarios] Error al cambiar clave:', error);
      setError(error.message || 'Error al cambiar clave');
      NotificationService.error(error.message || 'Error al cambiar clave');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Da de baja un usuario
   */
  const darBajaUsuario = useCallback(async (codUsuario: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Dando de baja usuario:', codUsuario);

      await usuarioService.darBaja({ codUsuario });

      NotificationService.success('Usuario dado de baja correctamente');

      // Recargar lista
      await cargarUsuarios();

      return true;

    } catch (error: any) {
      console.error('[useUsuarios] Error al dar de baja:', error);
      setError(error.message || 'Error al dar de baja usuario');
      NotificationService.error(error.message || 'Error al dar de baja usuario');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarUsuarios]);

  /**
   * Activa un usuario
   */
  const activarUsuario = useCallback(async (codUsuario: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUsuarios] Activando usuario:', codUsuario);

      await usuarioService.activar({ codUsuario });

      NotificationService.success('Usuario activado correctamente');

      // Recargar lista
      await cargarUsuarios();

      return true;

    } catch (error: any) {
      console.error('[useUsuarios] Error al activar:', error);
      setError(error.message || 'Error al activar usuario');
      NotificationService.error(error.message || 'Error al activar usuario');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarUsuarios]);

  /**
   * Obtiene un usuario especifico por codigo
   */
  const obtenerUsuario = useCallback((codUsuario: number): UsuarioData | null => {
    const usuario = usuarios.find(u => u.codUsuario === codUsuario);
    return usuario || null;
  }, [usuarios]);

  /**
   * Filtra usuarios por estado
   */
  const filtrarPorEstado = useCallback((estado: string): UsuarioData[] => {
    return usuarios.filter(u => u.estado === estado);
  }, [usuarios]);

  /**
   * Obtiene solo usuarios activos
   */
  const obtenerUsuariosActivos = useCallback((): UsuarioData[] => {
    return filtrarPorEstado('ACTIVO');
  }, [filtrarPorEstado]);

  /**
   * Obtiene solo usuarios inactivos
   */
  const obtenerUsuariosInactivos = useCallback((): UsuarioData[] => {
    return usuarios.filter(u => u.estado !== 'ACTIVO');
  }, [usuarios]);

  // Efecto para cargar usuarios al montar
  useEffect(() => {
    // Solo cargar si no hay usuarios y no esta cargando
    if (usuarios.length === 0 && !loading && !isLoadingRef.current) {
      cargarUsuarios({ parametroBusqueda: '' });
    }
  }, []); // Sin dependencias

  return {
    // Estado
    usuarios,
    loading,
    error,

    // Metodos de carga y busqueda
    cargarUsuarios,
    buscarUsuarios,

    // Metodos CRUD
    crearUsuario,
    actualizarUsuario,
    cambiarClave,
    darBajaUsuario,
    activarUsuario,

    // Utilidades
    obtenerUsuario,
    filtrarPorEstado,
    obtenerUsuariosActivos,
    obtenerUsuariosInactivos,
  };
};
