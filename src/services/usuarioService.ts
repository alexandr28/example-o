// src/services/usuarioService.ts
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Usuario
 */
export interface UsuarioData {
  codUsuario: number;
  nombrePersona: string;
  documento: string;
  username: string;
  password: string | null;
  codRol: number | null;
  parametroBusqueda: string | null;
  rol: string;
  estado: string;
  usuario: string | null;
}

export interface CreateUsuarioDTO {
  username: string;
  nombrePersona: string;
  documento: string;
  codEstado: string;
  password: string;
  codRol: number;
}

export interface UpdateUsuarioDTO {
  codUsuario: number;
  username: string;
  nombrePersona: string;
  documento: string;
  codEstado: string;
  codRol: number;
}

export interface CambiarClaveDTO {
  codUsuario: number;
  password: string;
}

export interface DarBajaDTO {
  codUsuario: number;
}

export interface ActivarDTO {
  codUsuario: number;
}

export interface ListarUsuariosParams {
  parametroBusqueda?: string;
}

/**
 * Servicio para gestion de usuarios
 *
 * IMPORTANTE: Este servicio NO requiere autenticacion
 * Todos los metodos funcionan sin token
 */
class UsuarioService {
  private static instance: UsuarioService;
  private endpoint = '/api/usuario';

  public static getInstance(): UsuarioService {
    if (!UsuarioService.instance) {
      UsuarioService.instance = new UsuarioService();
    }
    return UsuarioService.instance;
  }

  private constructor() {
    console.log('[UsuarioService] Inicializado');
    console.log(`  - Endpoint: "${this.endpoint}"`);
    console.log('  - Autenticacion: NO REQUERIDA');
  }

  /**
   * Normalizar datos de usuario
   */
  private normalizeUsuario(item: any): UsuarioData {
    return {
      codUsuario: item.codUsuario || 0,
      nombrePersona: item.nombrePersona || '',
      documento: item.documento || '',
      username: item.username || '',
      password: item.password || null,
      codRol: item.codRol || null,
      parametroBusqueda: item.parametroBusqueda || null,
      rol: item.rol || '',
      estado: item.estado || '',
      usuario: item.usuario || null,
    };
  }

  /**
   * Lista usuarios con filtro opcional
   * GET /api/usuario/listar?parametroBusqueda=
   * NO requiere autenticacion
   */
  async listar(params?: ListarUsuariosParams): Promise<UsuarioData[]> {
    try {
      console.log('[UsuarioService] Listando usuarios con parametros:', params);

      const url = buildApiUrl(this.endpoint + '/listar');

      // Construir query params
      const queryParams = new URLSearchParams();
      if (params?.parametroBusqueda !== undefined) {
        queryParams.append('parametroBusqueda', params.parametroBusqueda);
      }

      const getUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      console.log('[UsuarioService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`[UsuarioService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsuarioService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[UsuarioService] Datos obtenidos:', responseData);

      // Procesar respuesta - puede ser un array directo o wrapped
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (responseData.data) {
        items = [responseData.data];
      } else {
        items = [responseData];
      }

      return items.map((item: any) => this.normalizeUsuario(item));

    } catch (error: any) {
      console.error('[UsuarioService] Error listando usuarios:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * POST /api/usuario/insertar
   * Body: {username, nombrePersona, documento, codEstado, password, codRol}
   * NO requiere autenticacion
   */
  async insertar(datos: CreateUsuarioDTO): Promise<UsuarioData> {
    try {
      console.log('[UsuarioService] Insertando usuario:', datos);

      const url = buildApiUrl(this.endpoint + '/insertar');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[UsuarioService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsuarioService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[UsuarioService] Usuario creado:', responseData);

      // Extraer datos del wrapper si existe
      const created = responseData.data || responseData;
      return this.normalizeUsuario(created);

    } catch (error: any) {
      console.error('[UsuarioService] Error al insertar usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * PUT /api/usuario/actualizar
   * Body: {codUsuario, username, nombrePersona, documento, codEstado, codRol}
   * NO requiere autenticacion
   */
  async actualizar(datos: UpdateUsuarioDTO): Promise<UsuarioData> {
    try {
      console.log('[UsuarioService] Actualizando usuario:', datos);

      const url = buildApiUrl(this.endpoint + '/actualizar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[UsuarioService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsuarioService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[UsuarioService] Usuario actualizado:', responseData);

      // Extraer datos del wrapper si existe
      const updated = responseData.data || responseData;
      return this.normalizeUsuario(updated);

    } catch (error: any) {
      console.error('[UsuarioService] Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Cambia la contrasena de un usuario
   * PUT /api/usuario/cambiarClave
   * Body: {codUsuario, password}
   * NO requiere autenticacion
   */
  async cambiarClave(datos: CambiarClaveDTO): Promise<void> {
    try {
      console.log('[UsuarioService] Cambiando clave de usuario:', datos.codUsuario);

      const url = buildApiUrl(this.endpoint + '/cambiarClave');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[UsuarioService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsuarioService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[UsuarioService] Clave cambiada exitosamente');

    } catch (error: any) {
      console.error('[UsuarioService] Error al cambiar clave:', error);
      throw error;
    }
  }

  /**
   * Da de baja un usuario
   * PUT /api/usuario/darBaja
   * Body: {codUsuario}
   * NO requiere autenticacion
   */
  async darBaja(datos: DarBajaDTO): Promise<void> {
    try {
      console.log('[UsuarioService] Dando de baja usuario:', datos.codUsuario);

      const url = buildApiUrl(this.endpoint + '/darBaja');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[UsuarioService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsuarioService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[UsuarioService] Usuario dado de baja exitosamente');

    } catch (error: any) {
      console.error('[UsuarioService] Error al dar de baja usuario:', error);
      throw error;
    }
  }

  /**
   * Activa un usuario
   * PUT /api/usuario/activar
   * Body: {codUsuario}
   * NO requiere autenticacion
   */
  async activar(datos: ActivarDTO): Promise<void> {
    try {
      console.log('[UsuarioService] Activando usuario:', datos.codUsuario);

      const url = buildApiUrl(this.endpoint + '/activar');

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`[UsuarioService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsuarioService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('[UsuarioService] Usuario activado exitosamente');

    } catch (error: any) {
      console.error('[UsuarioService] Error al activar usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios (alias para listar sin parametros)
   */
  async obtenerTodos(): Promise<UsuarioData[]> {
    console.log('[UsuarioService] Obteniendo todos los usuarios');
    return this.listar({ parametroBusqueda: '' });
  }

  /**
   * Busca usuarios por parametro
   */
  async buscar(parametroBusqueda: string): Promise<UsuarioData[]> {
    console.log('[UsuarioService] Buscando con parametro:', parametroBusqueda);
    return this.listar({ parametroBusqueda });
  }
}

// Exportar instancia singleton
export const usuarioService = UsuarioService.getInstance();
