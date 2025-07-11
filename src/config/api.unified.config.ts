// src/config/api.unified.config.ts - ESTRUCTURA CORREGIDA

// ========================================
// IMPORTACIONES Y CONFIGURACIÓN INICIAL
// ========================================

// Detectar si estamos en desarrollo
const isDevelopment = import.meta.env.DEV;

// URL base - usar rutas relativas en desarrollo para evitar CORS
export const API_BASE_URL = isDevelopment 
  ? '' // Vacío para usar el proxy de Vite
  : (import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080');

// ========================================
// TIPOS E INTERFACES (deben ir antes de usarlos)
// ========================================

type SimpleEndpoint = string;
type ComplexEndpoint = {
  base: string;
  [key: string]: string;
};
type AuthEndpoint = {
  login: string;
  logout: string;
  refresh: string;
  profile: string;
};

interface EndpointsConfig {
  auth: AuthEndpoint;
  barrio: SimpleEndpoint;
  sector: SimpleEndpoint;
  via: SimpleEndpoint;
  calle: SimpleEndpoint;
  contribuyente: SimpleEndpoint;
  arancel: SimpleEndpoint;
  valorUnitario: SimpleEndpoint;
  uit: SimpleEndpoint;
  alcabala: SimpleEndpoint;
  depreciacion: SimpleEndpoint;
  predio: SimpleEndpoint;
  piso: SimpleEndpoint;
  direccion: ComplexEndpoint;
  persona: ComplexEndpoint;
  constante: ComplexEndpoint;
}

// ========================================
// CONFIGURACIÓN PRINCIPAL (exportada)
// ========================================

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  retries: 3,
  
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      profile: '/auth/profile'
    },
    barrio: '/api/barrio',
    sector: '/api/sector',
    via: '/api/via',
    calle: '/api/calle',
    direccion: {
      base: '/api/direccion',
      listarPorNombreVia: '/api/direccion/listarDireccionPorNombreVia',
      listarPorTipoVia: '/api/direccion/listarDireccionPorTipoVia'
    },
    persona: {
      base: '/api/persona',
      listarPorTipoYNombre: '/api/persona/listarPersonaPorTipoPersonaNombreRazon',
      listarPorContribuyente: '/api/persona/listarPersonaPorTipoPersonaNombreRazonContribuyente',
      listarPorTipoVia: '/api/persona/listarPersonaPorTipoPersonaNombreVia'
    },
    contribuyente: '/api/contribuyente',
    arancel: '/api/arancel',
    valorUnitario: '/api/valoresunitarios',
    uit: '/api/uitEpa',
    alcabala: '/api/alcabala',
    depreciacion: '/api/depreciacion',
    predio: '/api/predio',
    piso: '/api/piso',
    constante: {
      base: '/api/constante',
      listarPadre: '/api/constante/listarConstantePadre',
      listarHijo: '/api/constante/listarConstanteHijo'
    }
  } as EndpointsConfig,
  
  defaultParams: {
    codUsuario: 1,
    parametrosBusqueda: 'a'
  },
  
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000,
    maxSize: 100
  }
};

// ========================================
// CONSTANTES ADICIONALES (exportadas)
// ========================================

export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: API_CONFIG.timeout,
  DEFAULT_COD_USUARIO: API_CONFIG.defaultParams.codUsuario,
  DEFAULT_SEARCH_PARAM: API_CONFIG.defaultParams.parametrosBusqueda,
  
  ERROR_MESSAGES: {
    NETWORK: 'Error de conexión. Verifique su internet.',
    UNAUTHORIZED: 'No autorizado. Por favor, inicie sesión.',
    FORBIDDEN: 'No tiene permisos para realizar esta acción.',
    NOT_FOUND: 'Recurso no encontrado.',
    SERVER_ERROR: 'Error del servidor. Intente más tarde.',
    TIMEOUT: 'La petición excedió el tiempo límite.',
    UNKNOWN: 'Error desconocido.',
    CORS: 'Error de CORS. Verifique la configuración del servidor.'
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
  }
};

// ========================================
// FUNCIONES PRINCIPALES (exportadas directamente)
// ========================================

/**
 * Función unificada para construir URLs
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  if (isDevelopment) {
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    return url;
  }
  
  const baseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${baseURL}${cleanEndpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  return url;
};

/**
 * Función para obtener headers
 */
export const getApiHeaders = (includeAuth: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Token Bearer incluido en headers');
    } else {
      console.warn('⚠️ Se requiere autenticación pero no se encontró token');
    }
  }
  
  return headers;
};

/**
 * Helper para obtener endpoint
 */
export function getEndpoint<K extends keyof EndpointsConfig>(
  module: K,
  subEndpoint?: string
): string {
  const moduleEndpoint = API_CONFIG.endpoints[module];
  
  if (!moduleEndpoint) {
    return '';
  }
  
  if (typeof moduleEndpoint === 'string') {
    return moduleEndpoint;
  }
  
  if (module === 'auth' && subEndpoint) {
    const authEndpoint = moduleEndpoint as AuthEndpoint;
    return authEndpoint[subEndpoint as keyof AuthEndpoint] || '';
  }
  
  const complexEndpoint = moduleEndpoint as ComplexEndpoint;
  if (subEndpoint) {
    return complexEndpoint[subEndpoint] || complexEndpoint.base || '';
  }
  
  return complexEndpoint.base || '';
}

/**
 * Helpers de autenticación
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token') || 
         localStorage.getItem('authToken') ||
         sessionStorage.getItem('auth_token') ||
         sessionStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
  sessionStorage.setItem('auth_token', token);
  console.log('🔐 Token de autenticación guardado');
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('authToken');
  console.log('🔓 Token de autenticación eliminado');
};

export const requiresAuth = (method: string): boolean => {
  return true; // Todos los métodos requieren autenticación
};

/**
 * Helper para obtener mensaje de error
 */
export const getErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 401:
      return API_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return API_CONSTANTS.ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return API_CONSTANTS.ERROR_MESSAGES.NOT_FOUND;
    case 408:
      return API_CONSTANTS.ERROR_MESSAGES.TIMEOUT;
    case 500:
    case 502:
    case 503:
      return API_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR;
    default:
      return API_CONSTANTS.ERROR_MESSAGES.UNKNOWN;
  }
};

/**
 * Helper para obtener endpoints de health check
 */
export const getHealthCheckEndpoints = (): string[] => {
  return [
    API_CONFIG.endpoints.sector,
    API_CONFIG.endpoints.barrio,
    API_CONFIG.endpoints.via,
    API_CONFIG.endpoints.calle,
    API_CONFIG.endpoints.contribuyente,
    API_CONFIG.endpoints.arancel,
    API_CONFIG.endpoints.valorUnitario,
    API_CONFIG.endpoints.uit,
    API_CONFIG.endpoints.alcabala,
    API_CONFIG.endpoints.depreciacion,
    API_CONFIG.endpoints.predio,
    API_CONFIG.endpoints.piso
  ];
};

// ========================================
// EXPORTACIÓN DE TIPOS
// ========================================

export type ApiEndpoint = keyof EndpointsConfig;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
export type AuthEndpointKey = keyof AuthEndpoint;
export type { EndpointsConfig, SimpleEndpoint, ComplexEndpoint, AuthEndpoint };