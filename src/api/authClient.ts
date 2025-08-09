/**
 * Cliente HTTP mejorado para hacer peticiones a la API con token de autenticación
 * Incluye manejo de errores de conectividad, renovación automática de token
 * y sistema de cola para peticiones fallidas por token expirado
 */

import { useAuthContext } from '../context/AuthContext';
import { apiGet, apiPost, API_BASE_URL } from '../utils/api';

// Variables para control de renovación de token
let isRefreshing = false;
let failedQueue: { resolve: (value: string | null) => void; reject: (reason?: any) => void }[] = [];

/**
 * Procesa la cola de peticiones pendientes después de renovar el token
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Redirige al usuario a la página de login
 */
export const redirectToLogin = () => {
  // Limpiar datos de autenticación
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_token_expiry');
  
  // Redirigir a la página de login
  window.location.href = '/login';
};

/**
 * Obtiene el token de autenticación del localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Verifica si el token ha expirado
 */
export const isTokenExpired = (): boolean => {
  const tokenExpiry = localStorage.getItem('auth_token_expiry');
  
  if (!tokenExpiry) {
    return true;
  }
  
  return new Date(tokenExpiry) < new Date();
};

/**
 * Intenta renovar el token de autenticación
 */
export const attemptTokenRenewal = async (): Promise<string | null> => {
  // Si ya hay un proceso de renovación en curso, esperar a que termine
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
  
  // Marcar que estamos renovando el token
  isRefreshing = true;
  
  try {
    const auth = useAuthContext();
    if (auth && auth.renewToken) {
      const success = await auth.renewToken();
      
      if (success) {
        // Obtener el nuevo token
        const newToken = localStorage.getItem('auth_token');
        
        // Resolver todas las peticiones en cola
        processQueue(null, newToken);
        
        isRefreshing = false;
        return newToken;
      } else {
        // Si no se pudo renovar, notificar a las peticiones en cola
        processQueue(new Error('No se pudo renovar el token'));
        
        // Redirigir al login
        redirectToLogin();
        
        isRefreshing = false;
        return null;
      }
    }
    
    isRefreshing = false;
    return null;
  } catch (error) {
    console.error("Error al renovar token:", error);
    
    // Notificar a las peticiones en cola
    processQueue(error);
    
    isRefreshing = false;
    return null;
  }
};

/**
 * Manejador de errores para peticiones fallidas
 */
const handleFetchError = (error: any, url: string, method: string) => {
  console.error(`Error ${method} ${url}:`, error);
  
  // Verificar si es un error de red
  if (!window.navigator.onLine || error.message.includes('fetch') || error.message.includes('network') || error.name === 'TypeError') {
    console.log('Error de red detectado, trabajando en modo offline');
    
    // Lanzar un error específico para que sea manejado por el hook
    error.isOfflineError = true;
    throw error;
  }
  
  // Si no podemos manejar el error, lo reenviamos
  throw error;
};

/**
 * Manejador para errores 401 (Unauthorized)
 */
const handle401Error = async (url: string, options: RequestInit): Promise<Response> => {
  // Intentar renovar el token
  const newToken = await attemptTokenRenewal();
  
  if (newToken) {
    // Actualizar el token en las cabeceras
    const updatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      }
    };
    
    // Reintentar la petición con el nuevo token
    return fetch(url, updatedOptions);
  } else {
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }
};

/**
 * Realiza una petición HTTP con el token de autenticación
 */
export const authenticatedFetch = async (url: string, options: RequestInit): Promise<Response> => {
  // Obtener el token actual
  const token = getAuthToken();
  
  // Log para depuración
  console.log(`Realizando petición autenticada a ${url}`);
  console.log(`Token disponible: ${token ? 'Sí' : 'No'}`);
  
  // Si no hay token y la URL requiere autenticación, intentar renovar
  if (!token && !url.includes('/auth/login')) {
    console.log('No hay token disponible, redirigiendo a login');
    redirectToLogin();
    throw new Error('No hay token de autenticación disponible');
  }
  
  // Verificar si el token ha expirado y renovarlo si es necesario
  if (token && isTokenExpired() && !isRefreshing && !url.includes('/auth/refresh')) {
    try {
      console.log('Token expirado, intentando renovar');
      const newToken = await attemptTokenRenewal();
      
      if (!newToken) {
        console.log('No se pudo renovar el token, redirigiendo a login');
        redirectToLogin();
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
      
      console.log('Token renovado exitosamente');
    } catch (error) {
      console.error('Error al renovar token:', error);
      redirectToLogin();
      throw error;
    }
  }
// Obtener el token actualizado
  const currentToken = getAuthToken();
  
  // Preparar las opciones con el token de autenticación
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': currentToken ? `Bearer ${currentToken}` : ''
    }
  };
  
  console.log('Cabeceras de la petición:', JSON.stringify(authOptions.headers, null, 2));
  
  // Realizar la petición
  try {
    const response = await fetch(url, authOptions);
    
    // Log detallado de la respuesta
    console.log(`Respuesta de ${url}: ${response.status} ${response.statusText}`);
    
    // Manejar errores de autenticación
    if (response.status === 401 || response.status === 403) {
      console.log(`Error de autenticación: ${response.status}`);
      
      // Solo intentar renovar para 401, el 403 generalmente significa permisos insuficientes
      if (response.status === 401) {
        return handle401Error(url, authOptions);
      } else {
        console.error('Error 403: Permiso denegado');
      }
    }
    
    return response;
  } catch (error) {
    console.error(`Error en la petición a ${url}:`, error);
    throw error;
  }
};
/**
 * Realiza una petición GET autenticada
 */
export const authGet = async (url: string): Promise<any> => {
  try {
    console.log(`Realizando petición GET a: ${url}`);
    
    const response = await authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    return handleFetchError(error, url, 'GET');
  }
};

/**
 * Realiza una petición POST autenticada
 */
export const authPost = async (url: string, data: any): Promise<any> => {
  try {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    return handleFetchError(error, url, 'POST');
  }
};

/**
 * Realiza una petición PUT autenticada
 */
export const authPut = async (url: string, data: any): Promise<any> => {
  try {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    return handleFetchError(error, url, 'PUT');
  }
};

/**
 * Realiza una petición DELETE autenticada
 */
export const authDelete = async (url: string): Promise<any> => {
  try {
    const response = await authenticatedFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    return handleFetchError(error, url, 'DELETE');
  }
};

/**
 * Realiza una petición PATCH autenticada
 */
export const authPatch = async (url: string, data: any): Promise<any> => {
  try {
    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    return handleFetchError(error, url, 'PATCH');
  }
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token && !isTokenExpired();
};

/**
 * Verifica el estado de la sesión y renueva el token si es necesario
 */
export const checkSession = async (): Promise<boolean> => {
  if (!getAuthToken()) {
    return false;
  }
  
  if (isTokenExpired()) {
    return !!await attemptTokenRenewal();
  }
  
  return true;
};