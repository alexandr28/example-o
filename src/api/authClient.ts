/**
 * Cliente HTTP mejorado para hacer peticiones a la API con token de autenticación
 * Incluye manejo de errores de conectividad y renovación automática de token
 */

import { useAuthContext } from '../context/AuthContext';

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Verifica si el token ha expirado
 */
const isTokenExpired = (): boolean => {
  const tokenExpiry = localStorage.getItem('auth_token_expiry');
  
  if (!tokenExpiry) {
    return true;
  }
  
  return new Date(tokenExpiry) < new Date();
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

// Función auxiliar para renovar token
const attemptTokenRenewal = async (): Promise<boolean> => {
  try {
    const auth = useAuthContext();
    if (auth && auth.renewToken) {
      return await auth.renewToken();
    }
    return false;
  } catch (error) {
    console.error("Error al renovar token:", error);
    return false;
  }
};

/**
 * Realiza una petición GET autenticada
 */
export const authGet = async (url: string, retry = true) => {
  try {
    const token = getAuthToken();
    
    // Verificar si el token ha expirado
    if (token && isTokenExpired() && retry) {
      // Intentar renovar el token
      const renewed = await attemptTokenRenewal();
      
      if (renewed) {
        // Si se renovó correctamente, intentar nuevamente la petición
        return authGet(url, false);
      } else {
        // Si no se pudo renovar, redirigir al login
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expiry');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      // Si la respuesta es 401 Unauthorized, podríamos manejar el logout
      if (response.status === 401 && retry) {
        // Intentar renovar el token
        const renewed = await attemptTokenRenewal();
        
        if (renewed) {
          // Si se renovó correctamente, intentar nuevamente la petición
          return authGet(url, false);
        } else {
          // Si no se pudo renovar, redirigir al login
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          window.location.href = '/login';
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
      }
      
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
export const authPost = async (url: string, data: any, retry = true) => {
  try {
    const token = getAuthToken();
    
    // Verificar si el token ha expirado
    if (token && isTokenExpired() && retry) {
      // Intentar renovar el token
      const renewed = await attemptTokenRenewal();
      
      if (renewed) {
        // Si se renovó correctamente, intentar nuevamente la petición
        return authPost(url, data, false);
      } else {
        // Si no se pudo renovar, redirigir al login
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expiry');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      // Si la respuesta es 401 Unauthorized, podríamos manejar el logout
      if (response.status === 401 && retry) {
        // Intentar renovar el token
        const renewed = await attemptTokenRenewal();
        
        if (renewed) {
          // Si se renovó correctamente, intentar nuevamente la petición
          return authPost(url, data, false);
        } else {
          // Si no se pudo renovar, redirigir al login
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          window.location.href = '/login';
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
      }
      
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
export const authPut = async (url: string, data: any, retry = true) => {
  try {
    const token = getAuthToken();
    
    // Verificar si el token ha expirado
    if (token && isTokenExpired() && retry) {
      // Intentar renovar el token
      const renewed = await attemptTokenRenewal();
      
      if (renewed) {
        // Si se renovó correctamente, intentar nuevamente la petición
        return authPut(url, data, false);
      } else {
        // Si no se pudo renovar, redirigir al login
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expiry');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      // Si la respuesta es 401 Unauthorized, podríamos manejar el logout
      if (response.status === 401 && retry) {
        // Intentar renovar el token
        const renewed = await attemptTokenRenewal();
        
        if (renewed) {
          // Si se renovó correctamente, intentar nuevamente la petición
          return authPut(url, data, false);
        } else {
          // Si no se pudo renovar, redirigir al login
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          window.location.href = '/login';
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
      }
      
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
export const authDelete = async (url: string, retry = true) => {
  try {
    const token = getAuthToken();
    
    // Verificar si el token ha expirado
    if (token && isTokenExpired() && retry) {
      // Intentar renovar el token
      const renewed = await attemptTokenRenewal();
      
      if (renewed) {
        // Si se renovó correctamente, intentar nuevamente la petición
        return authDelete(url, false);
      } else {
        // Si no se pudo renovar, redirigir al login
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expiry');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      // Si la respuesta es 401 Unauthorized, podríamos manejar el logout
      if (response.status === 401 && retry) {
        // Intentar renovar el token
        const renewed = await attemptTokenRenewal();
        
        if (renewed) {
          // Si se renovó correctamente, intentar nuevamente la petición
          return authDelete(url, false);
        } else {
          // Si no se pudo renovar, redirigir al login
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          window.location.href = '/login';
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
      }
      
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    return handleFetchError(error, url, 'DELETE');
  }
};