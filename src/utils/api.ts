// src/utils/api.ts
/**
 * Utilidades unificadas para llamadas a la API
 * Maneja autenticación basada en método HTTP:
 * - GET: Sin autenticación
 * - POST/PUT/DELETE/PATCH: Con Token Bearer
 */

import { 
  buildApiUrl, 
  getApiHeaders, 
  API_CONFIG, 
  API_CONSTANTS,
  getErrorMessage,
  requiresAuth 
} from '../config/api.unified.config';

/**
 * Tipos para las respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Opciones adicionales para las peticiones
 */
export interface ApiRequestOptions {
  headers?: HeadersInit;
  timeout?: number;
  signal?: AbortSignal;
  params?: Record<string, any>;
  // Permite forzar o evitar autenticación independientemente del método
  forceAuth?: boolean;
  skipAuth?: boolean;
}

/**
 * Clase personalizada para errores de API
 */
export class ApiError extends Error {
  public statusCode: number;
  public data: any;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.errors = data?.errors;
  }
}

/**
 * Manejador de errores centralizado
 */
const handleApiError = (error: any): never => {
  console.error('❌ API Error:', error);
  
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error.name === 'AbortError') {
    throw new ApiError('La petición fue cancelada', 0);
  }
  
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    throw new ApiError('Error de conexión. Verifique su internet.', 0);
  }
  
  throw new ApiError(error.message || 'Error desconocido', 0);
};

/**
 * Función principal para realizar peticiones HTTP
 * Determina automáticamente si necesita autenticación basado en el método
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  options: ApiRequestOptions = {}
): Promise<T> => {
  // Construir URL con parámetros
  const url = buildApiUrl(endpoint, options.params);
  
  // Determinar si se requiere autenticación
  let needsAuth = requiresAuth(method);
  
  // Permitir override de autenticación
  if (options.forceAuth === true) needsAuth = true;
  if (options.skipAuth === true) needsAuth = false;
  
  // Obtener headers con o sin autenticación
  const headers = {
    ...getApiHeaders(needsAuth),
    ...options.headers
  };
  
  // Configurar la petición
  const config: RequestInit = {
    method,
    headers,
    signal: options.signal || AbortSignal.timeout(options.timeout || API_CONFIG.timeout)
  };
  
  // Agregar body si existe
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.body = JSON.stringify(data);
  }
  
  // Log de la petición
  console.log(`🌐 API Request: ${method} ${url}`);
  console.log(`🔐 Autenticación: ${needsAuth ? 'Incluida' : 'No incluida'}`);
  if (data) console.log('📦 Datos:', data);
  
  try {
    const response = await fetch(url, config);
    
    // Log de la respuesta
    console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    
    // Manejar respuestas no exitosas
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: getErrorMessage(response.status)
      }));
      
      throw new ApiError(
        errorData.message || getErrorMessage(response.status),
        response.status,
        errorData
      );
    }
    
    // Manejar respuesta vacía (204 No Content)
    if (response.status === 204) {
      return null as any;
    }
    
    // Parsear respuesta JSON
    const responseData = await response.json();
    
    // Si la respuesta tiene estructura de ApiResponse
    if ('success' in responseData && 'data' in responseData) {
      if (!responseData.success) {
        throw new ApiError(
          responseData.message || 'Error en la operación',
          response.status,
          responseData
        );
      }
      return responseData.data;
    }
    
    // Devolver datos directamente
    return responseData;
    
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Métodos específicos para cada verbo HTTP
 * GET no incluye autenticación por defecto
 * POST, PUT, DELETE incluyen autenticación por defecto
 */

/**
 * Realiza una petición GET (sin autenticación por defecto)
 */
export const apiGet = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return apiRequest<T>(endpoint, 'GET', null, options);
};

/**
 * Realiza una petición POST (con autenticación por defecto)
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return apiRequest<T>(endpoint, 'POST', data, options);
};

/**
 * Realiza una petición PUT (con autenticación por defecto)
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return apiRequest<T>(endpoint, 'PUT', data, options);
};

/**
 * Realiza una petición PATCH (con autenticación por defecto)
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data: any,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return apiRequest<T>(endpoint, 'PATCH', data, options);
};

/**
 * Realiza una petición DELETE (con autenticación por defecto)
 */
export const apiDelete = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  return apiRequest<T>(endpoint, 'DELETE', null, options);
};

/**
 * Utilidad para subir archivos (con autenticación por defecto)
 */
export const apiUpload = async <T = any>(
  endpoint: string,
  formData: FormData,
  options: ApiRequestOptions = {}
): Promise<T> => {
  // Para uploads, no establecer Content-Type (el browser lo hace automáticamente)
  const uploadOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': undefined as any // Remover Content-Type para FormData
    }
  };
  
  return apiRequest<T>(endpoint, 'POST', formData, uploadOptions);
};

/**
 * Utilidad para descargar archivos (sin autenticación por defecto)
 */
export const apiDownload = async (
  endpoint: string,
  filename: string,
  options: ApiRequestOptions = {}
): Promise<void> => {
  const url = buildApiUrl(endpoint, options.params);
  const needsAuth = options.forceAuth === true; // Solo con forceAuth para downloads
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(needsAuth),
    signal: options.signal
  });
  
  if (!response.ok) {
    throw new ApiError(
      `Error al descargar archivo: ${response.statusText}`,
      response.status
    );
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Verificar si el backend está disponible
 * Usa un endpoint GET que no requiere autenticación
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('/api/sector'), {
      method: 'HEAD',
      headers: getApiHeaders(false) // Sin autenticación
    });
    
    return response.ok || response.status === 401 || response.status === 403;
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return false;
  }
};

/**
 * Verificar si hay un token de autenticación válido
 */
export const hasAuthToken = (): boolean => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  return !!token;
};

/**
 * Limpiar el token de autenticación
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('authToken');
  console.log('🔓 Token de autenticación eliminado');
};

/**
 * Establecer el token de autenticación
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
  console.log('🔐 Token de autenticación guardado');
};

/**
 * Interceptor para manejar tokens expirados
 */
export const setupAuthInterceptor = (onAuthError: () => void): void => {
  // Guardar referencia a la función fetch original
  const originalFetch = window.fetch;
  
  // Sobrescribir fetch
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Si recibimos 401, el token puede estar expirado
    if (response.status === 401) {
      const url = args[0] as string;
      // No disparar en la ruta de login
      if (!url.includes('/auth/login')) {
        console.warn('⚠️ Token expirado o inválido');
        onAuthError();
      }
    }
    
    return response;
  };
};

// Re-exportar tipos y constantes útiles
export { API_CONFIG, API_CONSTANTS, buildApiUrl, getApiHeaders };