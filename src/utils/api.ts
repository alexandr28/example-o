// src/utils/api.ts
/**
 * Utilidades unificadas para llamadas a la API
 * Fusión de utils/api.ts y components/utils/apiRequest.ts
 */

import { API_CONFIG } from '../config/api.config';
import { ApiResponse, ApiErrorResponse } from '../types/apiTypes';

// URL base del backend - Priorizar variable de entorno
export const API_BASE_URL = import.meta.env.VITE_API_URL || API_CONFIG?.baseURL || 'http://192.168.20.160:8080';

// Verificar configuración
console.log('🔧 API Configuration:', {
  ENV_URL: import.meta.env.VITE_API_URL,
  CONFIG_URL: API_CONFIG?.baseURL,
  FINAL_URL: API_BASE_URL
});

/**
 * Tipo para opciones adicionales en las peticiones
 */
export interface ApiRequestOptionsType {
  headers?: HeadersInit;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Clase personalizada para errores de API
 */
export class ApiErrorClass extends Error {
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
 * Obtiene el token de autenticación (si existe)
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token');
};

/**
 * Construye la URL completa para una petición
 */
export const buildApiUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, devolverla tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Limpiar la URL base y el endpoint
  const baseURL = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
    
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
    
  const fullUrl = `${baseURL}${cleanEndpoint}`;
  
  console.log(`🌐 URL construida: ${fullUrl}`);
  return fullUrl;
};

/**
 * Construye los headers para las peticiones
 */
const buildHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Agregar token de autenticación si existe
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Combinar con headers personalizados
  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
};

/**
 * Maneja la respuesta de la API
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  let data: any;
  
  try {
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    console.error('Error al parsear respuesta:', error);
    data = null;
  }

  // Si la respuesta es exitosa (2xx)
  if (response.ok) {
    // Si la respuesta ya tiene el formato ApiResponse
    if (data && typeof data === 'object' && 'success' in data) {
      return data;
    }
    
    // Si no, envolver en formato ApiResponse
    return {
      success: true,
      data,
      statusCode: response.status
    };
  }

  // Si hay un error
  const errorMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;
  
  throw new ApiErrorClass(errorMessage, response.status, data);
};

/**
 * Realiza una petición con timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = API_CONFIG?.timeout || 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      // Importante para CORS
      mode: 'cors',
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new ApiErrorClass('La petición excedió el tiempo de espera', 408);
    }
    
    throw error;
  }
};

/**
 * Función genérica para realizar peticiones (compatible con el estilo antiguo)
 */
export const apiRequest = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  console.log(`📡 API Request: ${options?.method || 'GET'} ${url}`);
  
  const defaultHeaders = buildHeaders(options?.headers);
  
  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: defaultHeaders
    });
    
    console.log(`📥 API Response: ${response.status} ${response.statusText}`);
    
    return response;
  } catch (error) {
    console.error(`❌ API Error:`, error);
    throw error;
  }
};

/**
 * Función genérica mejorada para realizar peticiones tipadas
 */
const apiRequestTyped = async <T = any>(
  method: string,
  endpoint: string,
  data?: any,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  const url = buildApiUrl(endpoint);
  const headers = buildHeaders(options?.headers);
  
  const requestOptions: RequestInit = {
    method,
    headers,
    signal: options?.signal
  };

  // Agregar body para métodos que lo requieren
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestOptions.body = JSON.stringify(data);
  }

  console.log(`🌐 [API] ${method} ${url}`, data ? { data } : '');

  try {
    const response = await fetchWithTimeout(
      url,
      requestOptions,
      options?.timeout
    );
    
    const result = await handleResponse<T>(response);
    
    console.log(`✅ [API] ${method} ${url} - Status: ${response.status}`);
    
    return result;
    
  } catch (error: any) {
    console.error(`❌ [API] ${method} ${url} - Error:`, error);
    
    // Re-lanzar ApiError
    if (error instanceof ApiErrorClass) {
      throw error;
    }
    
    // Manejar errores de red
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiErrorClass(
        'Error de conexión. Verifica tu conexión a internet.',
        0
      );
    }
    
    // Otros errores
    throw new ApiErrorClass(
      error.message || 'Error desconocido',
      0
    );
  }
};

/**
 * Helper para hacer peticiones GET (compatible con apiRequest.ts original)
 * Versión simple que devuelve los datos directamente
 */
export const apiGetSimple = async (endpoint: string, headers?: HeadersInit): Promise<any> => {
  const response = await apiRequest(endpoint, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Si no es JSON, intentar texto
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Usar mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Helper para hacer peticiones POST (compatible con apiRequest.ts original)
 * Versión simple que devuelve los datos directamente
 */
export const apiPostSimple = async (endpoint: string, data: any, headers?: HeadersInit): Promise<any> => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Usar mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Realiza una petición GET (versión mejorada con tipos)
 */
export const apiGet = async <T = any>(
  endpoint: string,
  headers?: HeadersInit,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  return apiRequestTyped<T>('GET', endpoint, undefined, { ...options, headers });
};

/**
 * Realiza una petición POST (versión mejorada con tipos)
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data?: any,
  headers?: HeadersInit,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  return apiRequestTyped<T>('POST', endpoint, data, { ...options, headers });
};

/**
 * Helper para hacer peticiones PUT (compatible con apiRequest.ts original)
 * Versión simple que devuelve los datos directamente
 */
export const apiPutSimple = async (endpoint: string, data: any, headers?: HeadersInit): Promise<any> => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Usar mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Helper para hacer peticiones DELETE (compatible con apiRequest.ts original)
 * Versión simple que devuelve los datos directamente
 */
export const apiDeleteSimple = async (endpoint: string, headers?: HeadersInit): Promise<any> => {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
    headers
  });
  
  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Usar mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }
  
  // Algunos endpoints DELETE no devuelven contenido
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
};

/**
 * Helper para hacer peticiones PATCH (compatible con apiRequest.ts original)
 * Versión simple que devuelve los datos directamente
 */
export const apiPatchSimple = async (endpoint: string, data: any, headers?: HeadersInit): Promise<any> => {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Usar mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Realiza una petición PUT
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data?: any,
  headers?: HeadersInit,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  return apiRequestTyped<T>('PUT', endpoint, data, { ...options, headers });
};

/**
 * Realiza una petición PATCH
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data?: any,
  headers?: HeadersInit,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  return apiRequestTyped<T>('PATCH', endpoint, data, { ...options, headers });
};

/**
 * Realiza una petición DELETE
 */
export const apiDelete = async <T = any>(
  endpoint: string,
  headers?: HeadersInit,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  return apiRequestTyped<T>('DELETE', endpoint, undefined, { ...options, headers });
};

/**
 * Sube un archivo
 */
export const apiUpload = async <T = any>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>,
  options?: ApiRequestOptionsType
): Promise<ApiResponse<T>> => {
  const url = buildApiUrl(endpoint);
  const formData = new FormData();
  
  // Agregar archivo
  formData.append('file', file);
  
  // Agregar datos adicionales si existen
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  // Headers especiales para multipart/form-data
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`📤 [API] Upload ${url}`, { fileName: file.name, fileSize: file.size });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
        body: formData,
        signal: options?.signal
      },
      options?.timeout
    );
    
    const result = await handleResponse<T>(response);
    
    console.log(`✅ [API] Upload ${url} - Status: ${response.status}`);
    
    return result;
    
  } catch (error: any) {
    console.error(`❌ [API] Upload ${url} - Error:`, error);
    throw error;
  }
};

/**
 * Descarga un archivo
 */
export const apiDownload = async (
  endpoint: string,
  fileName?: string,
  options?: ApiRequestOptionsType
): Promise<void> => {
  const url = buildApiUrl(endpoint);
  const headers = buildHeaders(options?.headers);
  
  console.log(`📥 [API] Download ${url}`);
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers,
        signal: options?.signal
      },
      options?.timeout
    );
    
    if (!response.ok) {
      throw new ApiErrorClass(
        `Error al descargar archivo: ${response.statusText}`,
        response.status
      );
    }
    
    // Obtener el blob del archivo
    const blob = await response.blob();
    
    // Obtener el nombre del archivo del header o usar el proporcionado
    const contentDisposition = response.headers.get('content-disposition');
    let finalFileName = fileName || 'download';
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        finalFileName = fileNameMatch[1];
      }
    }
    
    // Crear un enlace temporal para descargar
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
    }, 100);
    
    console.log(`✅ [API] Download ${url} - Archivo descargado: ${finalFileName}`);
    
  } catch (error: any) {
    console.error(`❌ [API] Download ${url} - Error:`, error);
    throw error;
  }
};

/**
 * Hook para cancelar peticiones
 */
export const useApiAbort = () => {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    abort: () => controller.abort()
  };
};

/**
 * Utilidad para manejar errores de API de forma consistente
 */
export const handleApiError = (error: any): string => {
  if (error instanceof ApiErrorClass) {
    // Si hay errores de validación específicos
    if (error.errors) {
      const messages = Object.entries(error.errors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');
      return messages;
    }
    
    return error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
};

/**
 * Para mantener compatibilidad, si el código usa apiGet/apiPost esperando
 * una respuesta simple (no ApiResponse), puede usar estas funciones
 */
export const apiGetData = async (endpoint: string, headers?: HeadersInit): Promise<any> => {
  const response = await apiGet(endpoint, headers);
  return response.data;
};

export const apiPostData = async (endpoint: string, data: any, headers?: HeadersInit): Promise<any> => {
  const response = await apiPost(endpoint, data, headers);
  return response.data;
};

export const apiPutData = async (endpoint: string, data: any, headers?: HeadersInit): Promise<any> => {
  const response = await apiPut(endpoint, data, headers);
  return response.data;
};

export const apiDeleteData = async (endpoint: string, headers?: HeadersInit): Promise<any> => {
  const response = await apiDelete(endpoint, headers);
  return response.data;
};