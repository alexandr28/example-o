// src/config/api.unified.config.ts
/**
 * Configuración unificada de API
 * ÚNICO punto de verdad para todas las configuraciones
 * 
 * Reglas de autenticación:
 * - GET: No requiere autenticación
 * - POST, PUT, DELETE, PATCH: Requieren Token Bearer
 */

// Detectar si estamos en desarrollo
const isDevelopment = import.meta.env.DEV;

// URL base - usar rutas relativas en desarrollo para evitar CORS
export const API_BASE_URL = isDevelopment 
  ? '' // Vacío para usar el proxy de Vite
  : (import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080');

// Log de configuración
console.log('🔧 API Configuration:', {
  isDevelopment,
  ENV_URL: import.meta.env.VITE_API_URL,
  USING_URL: API_BASE_URL || 'Proxy (rutas relativas)',
  MODE: import.meta.env.MODE
});

/**
 * Tipos para los endpoints
 */
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

/**
 * Tipo para la configuración de endpoints
 */
interface EndpointsConfig {
  // Autenticación (sin base)
  auth: AuthEndpoint;
  
  // Endpoints simples (strings)
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
  
  // Endpoints complejos (con base y sub-endpoints)
  direccion: ComplexEndpoint;
  persona: ComplexEndpoint;
  constante: ComplexEndpoint;
}

// Configuración general
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  retries: 3,
  
  // Headers por defecto (sin autenticación)
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints organizados por módulo
  endpoints: {
    // Autenticación
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      profile: '/auth/profile'
    },
    
    // Mantenedores
    barrio: '/api/barrio',
    sector: '/api/sector',
    via: '/api/via',
    calle: '/api/calle',
    
    // Módulos con múltiples endpoints
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
    
    // Otros módulos
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
  
  // Parámetros por defecto
  defaultParams: {
    codUsuario: 1,
    parametrosBusqueda: 'a'
  },
  
  // Configuración de cache
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000, // 5 minutos
    maxSize: 100 // máximo de entradas en cache
  }
};

/**
 * Función unificada para construir URLs
 * @param endpoint - El endpoint relativo o absoluto
 * @param params - Parámetros opcionales para query string
 * @returns URL completa
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  // Si ya es URL completa, devolverla
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    console.log('🌐 URL completa detectada:', endpoint);
    return endpoint;
  }
  
  // En desarrollo, usar rutas relativas para el proxy
  if (isDevelopment) {
    let url = endpoint;
    
    // Agregar parámetros si existen
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    console.log(`🔗 URL relativa (proxy): ${url}`);
    return url;
  }
  
  // En producción, construir URL completa
  const baseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${baseURL}${cleanEndpoint}`;
  
  // Agregar parámetros si existen
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  console.log(`🔗 URL construida: ${url}`);
  return url;
};

/**
 * Función para obtener headers según el método HTTP
 * @param includeAuth - Si se debe incluir el token de autenticación
 * @returns Headers para la petición
 */
export const getApiHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    ...API_CONFIG.defaultHeaders
  };
  
  // Solo incluir autenticación si se solicita explícitamente
  if (includeAuth) {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Token de autenticación incluido en headers');
    } else {
      console.warn('⚠️ Se requiere autenticación pero no se encontró token');
    }
  }
  
  return headers;
};

/**
 * Helper mejorado para obtener endpoint anidado con tipado seguro
 * @param module - Nombre del módulo
 * @param subEndpoint - Sub-endpoint específico
 * @returns Endpoint completo
 */
export function getEndpoint<K extends keyof EndpointsConfig>(
  module: K,
  subEndpoint?: string
): string {
  const moduleEndpoint = API_CONFIG.endpoints[module];
  
  if (!moduleEndpoint) {
    console.warn(`⚠️ Módulo '${module}' no encontrado en endpoints`);
    return '';
  }
  
  // Si es un string directo, devolverlo
  if (typeof moduleEndpoint === 'string') {
    return moduleEndpoint;
  }
  
  // Para el módulo 'auth' que no tiene 'base'
  if (module === 'auth' && subEndpoint) {
    const authEndpoint = moduleEndpoint as AuthEndpoint;
    return authEndpoint[subEndpoint as keyof AuthEndpoint] || '';
  }
  
  // Para módulos con estructura ComplexEndpoint
  const complexEndpoint = moduleEndpoint as ComplexEndpoint;
  
  // Si se especifica un sub-endpoint
  if (subEndpoint) {
    return complexEndpoint[subEndpoint] || complexEndpoint.base || '';
  }
  
  // Si no se especifica sub-endpoint, devolver 'base' si existe
  return complexEndpoint.base || '';
}

/**
 * Helper para verificar si un endpoint requiere autenticación
 * Basado en el método HTTP, no en el endpoint
 * @param method - Método HTTP
 * @returns true si requiere autenticación
 */
export const requiresAuth = (method: string): boolean => {
  const authMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  return authMethods.includes(method.toUpperCase());
};

/**
 * Helper para obtener los endpoints de health check
 * Solo incluye endpoints que permiten GET sin autenticación
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

/**
 * Tipos útiles exportados
 */
export type ApiEndpoint = keyof EndpointsConfig;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
export type AuthEndpointKey = keyof AuthEndpoint;
export type { EndpointsConfig, SimpleEndpoint, ComplexEndpoint, AuthEndpoint };

/**
 * Constantes adicionales de configuración
 */
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: API_CONFIG.timeout,
  DEFAULT_COD_USUARIO: API_CONFIG.defaultParams.codUsuario,
  DEFAULT_SEARCH_PARAM: API_CONFIG.defaultParams.parametrosBusqueda,
  
  // Mensajes de error comunes
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
  
  // Códigos de estado HTTP
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

/**
 * Helper para obtener mensaje de error según código HTTP
 */
export const getErrorMessage = (statusCode: number, error?: any): string => {
  // Verificar si es error de CORS
  if (error?.message?.includes('CORS') || error?.message?.includes('Access-Control')) {
    return API_CONSTANTS.ERROR_MESSAGES.CORS;
  }
  
  switch (statusCode) {
    case API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED:
      return API_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED;
    case API_CONSTANTS.HTTP_STATUS.FORBIDDEN:
      return API_CONSTANTS.ERROR_MESSAGES.FORBIDDEN;
    case API_CONSTANTS.HTTP_STATUS.NOT_FOUND:
      return API_CONSTANTS.ERROR_MESSAGES.NOT_FOUND;
    case API_CONSTANTS.HTTP_STATUS.TIMEOUT:
      return API_CONSTANTS.ERROR_MESSAGES.TIMEOUT;
    case API_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case API_CONSTANTS.HTTP_STATUS.BAD_GATEWAY:
    case API_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE:
      return API_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR;
    case 0: // Error de red/CORS
      return API_CONSTANTS.ERROR_MESSAGES.CORS;
    default:
      return API_CONSTANTS.ERROR_MESSAGES.UNKNOWN;
  }
};

// Log de configuración inicial
console.log('✅ API Configuration inicializada:', {
  mode: import.meta.env.MODE,
  baseURL: API_BASE_URL || 'Usando proxy',
  totalEndpoints: Object.keys(API_CONFIG.endpoints).length,
  authRequired: 'Solo para POST, PUT, DELETE, PATCH',
  cacheEnabled: API_CONFIG.cache.enabled,
  timeout: `${API_CONFIG.timeout / 1000} segundos`
});