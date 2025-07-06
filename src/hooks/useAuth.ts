// src/hooks/useAuth.ts - Con expiración de 6 horas
import { useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { AuthCredentials, AuthUser, AuthResult } from '../models/Auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Ref para el monitor de expiración
  const expiryMonitorRef = useRef<(() => void) | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('auth_token_expiry');
    
      console.log('🔑 [useAuth] Verificando autenticación:');
      console.log('Token:', storedToken ? 'Presente' : 'No encontrado');
      console.log('Usuario:', storedUser ? 'Presente' : 'No encontrado');
      
      if (tokenExpiry) {
        const expiry = new Date(tokenExpiry);
        const now = new Date();
        const remainingHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60)) % 60;
        
        console.log(`⏰ Expira en: ${remainingHours}h ${remainingMinutes}m`);
        console.log(`📅 Fecha de expiración: ${expiry.toLocaleString()}`);
      }
      
      if (storedUser && storedToken && !authService.isTokenExpired()) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Restaurar sesión
          setUser({
            id: parsedUser.id,
            username: parsedUser.username,
            nombreCompleto: parsedUser.nombreCompleto || parsedUser.username, // Fallback a username
            roles: parsedUser.roles || ['USER'],
            token: storedToken
          });
          setAuthToken(storedToken);
          setIsAuthenticated(true);
          
          console.log('✅ [useAuth] Sesión restaurada para:', parsedUser.username);
          
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
          authService.logout();
        }
      } else if (authService.isTokenExpired()) {
        console.log('⚠️ [useAuth] Token expirado, limpiando sesión');
        authService.logout();
        setUser(null);
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    };
    
    // Verificar al inicio
    checkAuth();
    
    // Verificar cada 5 minutos
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Iniciar monitor de expiración cuando hay autenticación
  useEffect(() => {
    if (isAuthenticated && authToken) {
      console.log('🔄 [useAuth] Iniciando monitor de expiración de token');
      
      // Detener monitor anterior si existe
      if (expiryMonitorRef.current) {
        expiryMonitorRef.current();
      }
      
      // Iniciar nuevo monitor
      expiryMonitorRef.current = authService.startTokenExpiryMonitor(() => {
        // Callback cuando el token expira
        console.log('⚠️ [useAuth] Token expirado - cerrando sesión');
        setUser(null);
        setAuthToken(null);
        setIsAuthenticated(false);
        setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      });
    }
    
    return () => {
      // Limpiar monitor al desmontar
      if (expiryMonitorRef.current) {
        expiryMonitorRef.current();
        expiryMonitorRef.current = null;
      }
    };
  }, [isAuthenticated, authToken]);

  // Función de login usando el servicio
  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 [useAuth] Iniciando proceso de login...');
      
      const result = await authService.login(credentials);
      
      if (result.success && result.user && result.token) {
        // Actualizar estados
        const authUser: AuthUser = {
          id: result.user.id,
          username: result.user.username,
          nombreCompleto: result.user.nombreCompleto || result.user.username, // Usar username como fallback
          roles: result.user.roles || ['USER'],
          token: result.token
        };
        
        setUser(authUser);
        setAuthToken(result.token);
        setIsAuthenticated(true);
        setError(null);
        
        console.log('✅ [useAuth] Login exitoso');
        console.log('⏰ [useAuth] Token válido por 6 horas');
        
        return { success: true, user: authUser, token: result.token };
      } else {
        setError(result.message || 'Error al iniciar sesión');
        return { success: false, error: result.message };
      }
      
    } catch (error: any) {
      console.error('❌ [useAuth] Error en login:', error);
      const errorMessage = error.message || 'Error desconocido al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    console.log('🔒 [useAuth] Cerrando sesión...');
    
    // Detener monitor de expiración
    if (expiryMonitorRef.current) {
      expiryMonitorRef.current();
      expiryMonitorRef.current = null;
    }
    
    // Usar el servicio para logout
    authService.logout();
    
    // Limpiar estados
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('✅ [useAuth] Sesión cerrada');
  }, []);

  // Función para renovar el token
  const renewToken = useCallback(async (): Promise<boolean> => {
    if (!authToken) {
      console.log('❌ [useAuth] No hay token para renovar');
      return false;
    }
    
    console.log('🔄 [useAuth] Renovando token...');
    
    try {
      const success = await authService.refreshToken();
      
      if (success) {
        // Actualizar token en el estado
        const newToken = localStorage.getItem('auth_token');
        if (newToken) {
          setAuthToken(newToken);
          
          if (user) {
            setUser({ ...user, token: newToken });
          }
        }
        
        console.log('✅ [useAuth] Token renovado exitosamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [useAuth] Error al renovar token:', error);
      return false;
    }
  }, [authToken, user]);

  // Función para obtener el tiempo restante del token
  const getTokenRemainingTime = useCallback((): string => {
    const minutes = authService.getTokenRemainingTime();
    
    if (minutes <= 0) return 'Expirado';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins}m`;
  }, []);

  return {
    // Estados
    user,
    authToken,
    loading,
    error,
    isAuthenticated,
    
    // Acciones
    login,
    logout,
    renewToken,
    
    // Utilidades
    getTokenRemainingTime,
    isTokenExpired: authService.isTokenExpired.bind(authService),
    needsTokenRenewal: authService.needsTokenRenewal.bind(authService)
  };
};

export default useAuth;