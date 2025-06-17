// src/config/api.config.ts - VERSIÓN CON IP CORRECTA
/**
 * Configuración centralizada de la API
 * TEMPORAL: IP hardcodeada mientras se corrige el .env
 */

// IMPORTANTE: Forzar la URL correcta
const API_BASE_URL = 'http://192.168.20.160:8080'; // IP CORRECTA

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
    barrios: '/api/barrio',    // Corregido: era /api/barrio
    vias: '/api/via',
    calles: '/api/calle',
    direcciones: '/api/direccion',
    
    // Módulos principales (requieren auth)
    contribuyentes: '/api/contribuyente',
    predios: '/api/predio',
    
    // Otros endpoints (requieren auth)
    aranceles: '/api/arancel',
    valoresUnitarios: '/api/valor-unitario',
    uit: '/api/uit',
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
    '/api/calle',
    '/api/direccion'
  ],
  
  // Métodos que requieren autenticación
  authRequiredMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    keys: {
      sectores: 'sectores_cache',
      barrios: 'barrios_cache',
      calles: 'calles_cache',
      vias: 'tipos_via_cache',
      direcciones: 'direcciones_cache'
    }
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
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
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    ...API_CONFIG.defaultHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
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

// Exportar tipos útiles
export type ApiEndpoint = keyof typeof API_CONFIG.endpoints;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Log de configuración
console.log('✅ API Configuration cargada:', {
  baseURL: API_CONFIG.baseURL,
  endpoints: Object.keys(API_CONFIG.endpoints).length,
  publicEndpoints: API_CONFIG.publicEndpoints.length,
  cacheEnabled: API_CONFIG.cache.enabled
});