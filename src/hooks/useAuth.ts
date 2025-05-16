import { useState, useCallback, useEffect } from 'react';
import { AuthCredentials, AuthUser, AuthResult } from '../models/Auth';

/**
 * Hook personalizado para la gestión de autenticación
 * 
 * Proporciona funcionalidades para iniciar sesión, cerrar sesión y verificar el estado de autenticación
 */
export const useAuth = () => {
  // Estados
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un usuario en el almacenamiento local al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        // Si hay un error al parsear, limpiar el storage
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      // En un caso real, esta sería una petición a la API
      // await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials),
      // });
      
      // Simulación de inicio de sesión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar credenciales (hardcoded para este ejemplo)
      if (credentials.username === 'admin' && credentials.password === '123456') {
        const user: AuthUser = {
          id: '1',
          username: 'admin',
          nombreCompleto: 'Administrador del Sistema',
          roles: ['ADMIN', 'USER'],
          token: 'mock-jwt-token'
        };
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', user.token || '');
        
        // Actualizar estados
        setUser(user);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { success: true, user, token: user.token };
      } else {
        // Credenciales inválidas
        const errorMessage = 'Credenciales incorrectas. Por favor, inténtelo de nuevo.';
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
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
    
    // Resetear estados
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    // En un caso real, también podríamos hacer una petición al backend
    // para invalidar el token
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  };
};

export default useAuth;