// src/config/api.unified.config.ts - VERSIÓN SIN AUTENTICACIÓN

// ========================================
// CONFIGURACIÓN INICIAL
// ========================================

// URL del backend
export const API_BASE_URL = 'http://26.161.18.122:8080';

// ========================================
// TIPOS E INTERFACES
// ========================================

type SimpleEndpoint = string;
type ComplexEndpoint = {
  base: string;
  [key: string]: string;
};

interface EndpointsConfig {
  barrio: SimpleEndpoint;
  sector: SimpleEndpoint;
  via: SimpleEndpoint;  // Reemplaza a calle
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
// CONFIGURACIÓN PRINCIPAL
// ========================================

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  retries: 3,
  
  // Headers por defecto SIN autenticación
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // IMPORTANTE: NO se requiere autenticación para ningún endpoint
  requiresAuth: false,
  
  endpoints: {
    barrio: '/api/barrio',
    sector: '/api/sector',
    via: '/api/via/listarVia',  // ← CORREGIDO: era /api/calle
    contribuyente: '/api/contribuyente',
    arancel: '/api/arancel',
    valorUnitario: '/api/valoresunitarios',
    uit: '/api/uitEpa',
    alcabala: '/api/alcabala',
    depreciacion: '/api/depreciacion',
    predio: '/api/predio',
    piso: '/api/piso',
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
// CONSTANTES ADICIONALES
// ========================================

export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: API_CONFIG.timeout,
  DEFAULT_COD_USUARIO: API_CONFIG.defaultParams.codUsuario,
  DEFAULT_SEARCH_PARAM: API_CONFIG.defaultParams.parametrosBusqueda,
  
  ERROR_MESSAGES: {
    NETWORK: 'Error de conexión. Verifique su internet.',
    UNAUTHORIZED: 'No autorizado.',
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
// FUNCIONES PRINCIPALES
// ========================================

/**
 * Construir URL completa
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
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
 * Obtener headers - NUNCA incluye autenticación
 * @param includeAuth - Se ignora, solo por compatibilidad
 */
export const getApiHeaders = (includeAuth: boolean = false): Record<string, string> => {
  // IMPORTANTE: Nunca incluir Authorization
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

/**
 * NO se usa autenticación, pero mantenemos la función por compatibilidad
 */
export const getAuthToken = (): string | null => {
  return null;
};

/**
 * Determinar si requiere auth - SIEMPRE retorna false
 */
export const requiresAuth = (method: string): boolean => {
  return false; // Ningún método requiere autenticación
};

/**
 * Obtener endpoint
 */
export function getEndpoint<K extends keyof EndpointsConfig>(
  module: K,
  subEndpoint?: string
): string {
  const endpoint = API_CONFIG.endpoints[module];
  
  if (typeof endpoint === 'string') {
    return endpoint;
  }
  
  if (typeof endpoint === 'object' && endpoint !== null) {
    const endpointObj = endpoint as any;
    
    if (subEndpoint && endpointObj[subEndpoint]) {
      return endpointObj[subEndpoint];
    }
    
    if ('base' in endpointObj) {
      return endpointObj.base;
    }
  }
  
  throw new Error(`Endpoint no encontrado: ${String(module)}`);
}

/**
 * Endpoints para health check
 */
export const getHealthCheckEndpoints = (): string[] => {
  return [
    API_CONFIG.endpoints.sector,
    API_CONFIG.endpoints.barrio,
    API_CONFIG.endpoints.contribuyente,
    API_CONFIG.endpoints.predio
  ] as string[];
};

/**
 * Mensaje de error por código
 */
export const getErrorMessage = (statusCode: number): string => {
  const messages = API_CONSTANTS.ERROR_MESSAGES;
  
  switch (statusCode) {
    case 400:
      return 'Solicitud incorrecta. Verifique los datos enviados.';
    case 401:
      return messages.UNAUTHORIZED;
    case 403:
      return messages.FORBIDDEN;
    case 404:
      return messages.NOT_FOUND;
    case 408:
      return messages.TIMEOUT;
    case 500:
    case 502:
    case 503:
      return messages.SERVER_ERROR;
    default:
      return messages.UNKNOWN;
  }
};

// ========================================
// EXPORTAR TIPOS
// ========================================

export type { 
  EndpointsConfig, 
  ComplexEndpoint
};