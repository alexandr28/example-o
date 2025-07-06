// src/utils/apiRequest.ts
/**
 * Helper para hacer peticiones a la API
 * Maneja automáticamente las URLs según el entorno
 */

// URL base del backend - SIEMPRE usar la IP correcta
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080';

// Verificar que la URL esté bien configurada
console.log('🔧 API_BASE_URL configurada como:', API_BASE_URL);

/**
 * Construye la URL completa para una petición
 */
export const buildApiUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, devolverla tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construir URL completa
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
  
  console.log(`🌐 URL construida: ${fullUrl}`);
  return fullUrl;
};

/**
 * Wrapper para fetch que maneja las URLs automáticamente
 */
export const apiRequest = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  console.log(`📡 API Request: ${options?.method || 'GET'} ${url}`);
  
  // Headers por defecto
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers
      },
      // Importante para CORS
      mode: 'cors',
      credentials: 'include'
    });
    
    console.log(`📥 API Response: ${response.status} ${response.statusText}`);
    
    return response;
  } catch (error) {
    console.error(`❌ API Error:`, error);
    throw error;
  }
};

/**
 * Helper para hacer peticiones GET
 */
export const apiGet = async (endpoint: string, headers?: HeadersInit): Promise<any> => {
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
 * Helper para hacer peticiones POST
 */
export const apiPost = async (endpoint: string, data: any, headers?: HeadersInit): Promise<any> => {
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

// Exportar la URL base para uso directo si es necesario
export { API_BASE_URL };