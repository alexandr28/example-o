// src/utils/apiRequest.ts
/**
 * Helper para hacer peticiones a la API
 * Maneja automáticamente las URLs según el entorno
 */

// URL base del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080';

/**
 * Construye la URL completa para una petición
 * En desarrollo, usa la URL completa para evitar problemas con el proxy
 */
export const buildApiUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, devolverla tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // En desarrollo, usar la URL completa del backend
  if (import.meta.env.DEV) {
    // Asegurar que el endpoint empiece con /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
  }
  
  // En producción, usar rutas relativas
  return endpoint;
};

/**
 * Wrapper para fetch que maneja las URLs automáticamente
 */
export const apiRequest = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  console.log(`📡 API Request: ${options?.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      }
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
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
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
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }
  
  return response.json();
};

// Exportar la URL base para uso directo si es necesario
export { API_BASE_URL };