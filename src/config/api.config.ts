// src/config/api.config.ts
/**
 * Configuración centralizada de la API
 * Mantiene todos los endpoints y configuraciones en un solo lugar
 */

// URL base del backend - SIEMPRE usar la IP correcta
const API_BASE_URL = 'http://192.168.20.160:8080'; // FORZAR IP CORRECTA

// Verificar que no estamos usando localhost:3000
if (API_BASE_URL.includes('localhost:3000')) {
  console.error('❌ ERROR: API_BASE_URL está usando localhost:3000 - CORREGIR INMEDIATAMENTE');
}

// Log para debug
console.log('🔧 API Configuration:');
console.log('- ENV VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- USANDO API_BASE_URL:', API_BASE_URL);

// Configuración de endpoints
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  
  // Endpoints de la API
  endpoints: {
    // Autenticación
    auth: {
      login: '/auth/login',
      logout: '/auth/logout', 
      refresh: '/auth/refresh',
      profile: '/auth/profile'
    },
    
    // Mantenedores (GET sin auth, POST/PUT/DELETE con auth)
    sectores: '/api/sector',
    barrios: '/api/barrio',
    vias: '/api/via',
    
    // Direcciones - Endpoints específicos sin autenticación
    direcciones: {
      base: '/api/direccion',
      listarPorNombreVia: '/api/direccion/listarDireccionPorNombreVia',
      listarPorTipoVia: '/api/direccion/listarDireccionPorTipoVia?parametrosBusqueda=a&codUsuario=1',
      crear: '/api/direccion',
      actualizar: '/api/direccion',
      eliminar: '/api/direccion'
    },
    
    // Personas - Endpoint sin autenticación para búsquedas
    personas: {
      base: '/api/persona',
      listarPorTipoPersonaRazonSocial: `/api/persona/listarPersonaPorTipoPersonaNombreRazon`,
      listarPorTipoPersonaContribuyente: '/api/persona/listarPersonaPorTipoPersonaNombreRazonContribuyente',
      ListarPErsonaTipoVia:`api/persona/listarPersonaPorTipoPersonaNombreVia`,
      crear: '/api/persona',
      actualizar: '/api/persona',
      eliminar: '/api/persona'
    },
    
    // Contribuyentes   Endpoints específicos sin autenticación
    contribuyentes:{
      base: '/api/contribuyente',
      listarContribuyente: '/api/contribuyente',
      actualizar: '/api/contribuyente',
      eliminar: '/api/contribuyente'
    } ,
    
    // Módulos principales -  Endpoints específicos sin autenticación
    predios: '/api/predio',
    pisos: '/api/piso',
    
    // Otros endpoints-  Endpoints específicos sin autenticación
    aranceles: '/api/arancel',
    valoresUnitarios: '/api/valoresunitarios',
    uit: '/api/uitEpa',
    alcabala: '/api/alcabala',
    depreciacion: '/api/depreciacion',
    
    // Reportes
    reportes: '/api/reportes',
    
    // Caja
    caja: '/api/caja',
    pagos: '/api/pagos'
  },
  
  // Configuración de headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Configuración de timeouts
  timeout: 30000, // 30 segundos
  
  // Configuración de reintentos
  retries: 3,
  retryDelay: 1000, // 1 segundo base
  
  // Endpoints que NO requieren autenticación para GET
  publicEndpoints: [
    '/api/sector',
    '/api/barrio', 
    '/api/via',
    `api/direccion/listarDireccionPorNombreVia`,
    `api/direccion/listarDireccionPorTipoVia?parametrosBusqueda=a&codUsuario=1`,
    '/api/persona/listarPersonaPorTipoPersonaNombreRazon',
  ],
  
  // Endpoints para verificación de conectividad
  healthCheckEndpoints: [
    '/api/direccion/listarDireccionPorNombreVia',
    '/api/persona/listarPersonaPorTipoPersonaNombreRazon',
    '/api/sector',
    '/api/barrio',
    '/api/via',
    '/api/contribuyente'
  ],
  
  // Métodos que siempre requieren autenticación
  authRequiredMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos para datos dinámicos
    staticTtl: 24 * 60 * 60 * 1000, // 24 horas para datos estáticos
    keys: {
      sectores: 'sectores_cache',
      barrios: 'barrios_cache',
      vias: 'vias_cache',
      direcciones: 'direcciones_cache',
      personas: 'personas_cache',
      contribuyentes: 'contribuyentes_cache'
    }
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  // Si ya es una URL completa, devolverla tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Construir URL completa
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Función helper para verificar si un endpoint requiere autenticación
export const requiresAuth = (endpoint: string, method: string = 'GET'): boolean => {
  // Los métodos POST, PUT, DELETE siempre requieren auth
  if (API_CONFIG.authRequiredMethods.includes(method.toUpperCase())) {
    return true;
  }
  
  // Para GET, verificar si está en la lista de endpoints públicos
  const isPublic = API_CONFIG.publicEndpoints.some(publicEndpoint => 
    endpoint.includes(publicEndpoint)
  );
  
  return !isPublic;
};

// Función helper para obtener headers con autenticación
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token') || 
                sessionStorage.getItem('auth_token') ||
                localStorage.getItem('token') ||
                sessionStorage.getItem('token');
                
  const headers: HeadersInit = {
    ...API_CONFIG.defaultHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper para obtener headers sin autenticación
export const getPublicHeaders = (): HeadersInit => {
  return {
    ...API_CONFIG.defaultHeaders
  };
};

// Función helper para manejar errores de API
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return 'Datos inválidos. Por favor, revise la información.';
      case 401:
        return 'No autorizado. Por favor, inicie sesión.';
      case 403:
        return 'No tiene permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 500:
        return 'Error del servidor. Intente más tarde.';
      default:
        return error.response.data?.message || 'Error al procesar la solicitud.';
    }
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Verifique su internet.';
  } else {
    // Error general
    return error.message || 'Error desconocido.';
  }
};

// Helper para obtener endpoint completo de direcciones
export const getDireccionEndpoint = (tipo: 'listarPorNombreVia' | 'listarPorTipoVia' | 'base' = 'base'): string => {
  if (tipo === 'base') {
    return API_CONFIG.endpoints.direcciones.base;
  }
  return API_CONFIG.endpoints.direcciones[tipo];
};

// Helper para obtener endpoint completo de personas
export const getPersonaEndpoint = (tipo: 'listarPorTipoYNombre' | 'base' = 'base'): string => {
  if (tipo === 'base') {
    return API_CONFIG.endpoints.personas.base;
  }
  return API_CONFIG.endpoints.personas[tipo];
};

// Helper para verificar si el backend está disponible
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Intentar con un endpoint público que no requiere auth
    const response = await fetch(buildApiUrl('/api/sector'), {
      method: 'HEAD',
      headers: getPublicHeaders()
    });
    
    return response.ok || response.status === 401 || response.status === 403;
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return false;
  }
};

// Exportar tipos útiles
export type ApiEndpoint = keyof typeof API_CONFIG.endpoints;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type DireccionEndpointType = keyof typeof API_CONFIG.endpoints.direcciones;
export type PersonaEndpointType = keyof typeof API_CONFIG.endpoints.personas;

// Constantes de configuración adicionales
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: API_CONFIG.timeout,
  DEFAULT_COD_USUARIO: 1,
  DEFAULT_SEARCH_PARAM: 'a'
};

// Log de configuración
console.log('✅ API Configuration cargada:', {
  baseURL: API_CONFIG.baseURL,
  totalEndpoints: Object.keys(API_CONFIG.endpoints).length,
  publicEndpoints: API_CONFIG.publicEndpoints.length,
  cacheEnabled: API_CONFIG.cache.enabled
});