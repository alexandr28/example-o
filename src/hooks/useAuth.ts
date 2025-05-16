import { useState, useCallback, useEffect } from 'react';
import { AuthCredentials, AuthUser, AuthResult } from '../models/Auth';

/**
 * Hook personalizado para la gestión de autenticación
 * 
 * Proporciona funcionalidades para iniciar sesión, cerrar sesión y verificar el estado de autenticación
 * Maneja errores de conectividad y expiración de token
 */
export const useAuth = () => {
  // Estados
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un usuario en el almacenamiento local al cargar
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('auth_token_expiry');
    
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verificar si el token ha expirado
          if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
            // Token expirado, limpiar almacenamiento
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token_expiry');
            setUser(null);
            setIsAuthenticated(false);
            setError('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
            return;
          }
          
          // Token válido
          setUser({
            ...parsedUser,
            token: storedToken
          });
          setIsAuthenticated(true);
        } catch (err) {
          // Si hay un error al parsear, limpiar el storage
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
        }
      }
    };
    
    // Verificar autenticación al cargar
    checkAuth();
    
    // Configurar un intervalo para verificar periódicamente la expiración del token
    const tokenCheckInterval = setInterval(checkAuth, 60000); // Verificar cada minuto
    
    // Limpiar el intervalo al desmontar
    return () => clearInterval(tokenCheckInterval);
  }, []);

  // Función para iniciar sesión con modo offline para pruebas
  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar conectar con el servidor
      try {
        // Realizar petición a la API real
        const response = await fetch('http://localhost:8080/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || 'Error al iniciar sesión. Por favor, inténtelo de nuevo.';
          throw new Error(errorMessage);
        }
        
        // Obtener el token de la respuesta
        const data = await response.json();
        const token = data.token;
        
        if (!token) {
          throw new Error('No se recibió un token válido del servidor');
        }
        
        // Crear objeto de usuario con el token
        const user: AuthUser = {
          id: '1', // Este valor podría venir del token decodificado
          username: credentials.username,
          nombreCompleto: credentials.username, // Este valor podría venir del token decodificado
          roles: ['USER'], // Estos valores podrían venir del token decodificado
          token: token
        };
        
        // Calcular tiempo de expiración (20 minutos desde ahora)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 20);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
        
        // Actualizar estados
        setUser(user);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { success: true, user, token };
        
      } catch (apiError: any) {
        console.error('Error al conectar con la API:', apiError);
        
        // Verificar si es un error de conectividad (fetch failed)
        if (apiError.message.includes('fetch') || apiError.message.includes('network') || !window.navigator.onLine) {
          console.log('Funcionando en modo fallback de autenticación');
          
          // MODO FALLBACK: Autenticación simulada para pruebas
          if (credentials.username && credentials.password) {
            // Crear un token simulado
            const mockToken = `mock_token_${Math.random().toString(36).substr(2, 9)}`;
            
            // Crear objeto de usuario con el token
            const user: AuthUser = {
              id: '1',
              username: credentials.username,
              nombreCompleto: `Usuario ${credentials.username}`,
              roles: ['USER'],
              token: mockToken
            };
            
            // Calcular tiempo de expiración (20 minutos desde ahora)
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 20);
            
            // Guardar en localStorage para persistencia
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
            
            // Actualizar estados
            setUser(user);
            setIsAuthenticated(true);
            setLoading(false);
            
            console.log('Autenticación simulada exitosa');
            return { success: true, user, token: mockToken };
          } else {
            throw new Error('Credenciales inválidas');
          }
        } else {
          // Si no es un error de conectividad, reenviar el error
          throw apiError;
        }
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    // Eliminar datos de autenticación del almacenamiento local
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    
    // Resetear estados
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    // En un caso real, también podríamos hacer una petición al backend
    // para invalidar el token en el servidor
    try {
      fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      }).catch(e => console.log('Error al cerrar sesión en el servidor:', e));
    } catch (e) {
      console.log('Error al cerrar sesión en el servidor:', e);
    }
  }, [user]);

  // Función para renovar el token
  const renewToken = useCallback(async (): Promise<boolean> => {
    if (!user || !user.token) {
      return false;
    }
    
    try {
      // Intentar renovar el token con el servidor
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudo renovar el token');
      }
      
      const data = await response.json();
      const newToken = data.token;
      
      if (!newToken) {
        throw new Error('No se recibió un token válido del servidor');
      }
      
      // Calcular nuevo tiempo de expiración
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 20);
      
      // Actualizar token y tiempo de expiración
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
      
      // Actualizar usuario con nuevo token
      const updatedUser = { ...user, token: newToken };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      return true;
    } catch (err) {
      console.error('Error al renovar el token:', err);
      return false;
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    renewToken
  };
};

export default useAuth;