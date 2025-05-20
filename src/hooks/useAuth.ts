// src/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { AuthCredentials, AuthUser, AuthResult } from '../models/Auth';
import { AUTH_ENDPOINTS } from '../config/constants';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null | undefined>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Añadimos el estado para el token en memoria
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Verificar si hay un usuario en el almacenamiento local al cargar
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('auth_token_expiry');
    
      console.log('🔑 Verificando autenticación al iniciar:');
      console.log('Token almacenado:', storedToken ? 'Presente' : 'No encontrado');
      console.log('Usuario almacenado:', storedUser ? 'Presente' : 'No encontrado');
      console.log('Expiración:', tokenExpiry ? new Date(tokenExpiry).toLocaleString() : 'No definida');
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verificar si el token ha expirado
          if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
            console.log('⚠️ Token expirado, sesión finalizada');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token_expiry');
            setUser(null);
            setAuthToken(null); // Limpiar el token en memoria
            setIsAuthenticated(false);
            setError('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
            return;
          }
          
          // Token válido
          setUser({
            ...parsedUser,
            token: storedToken
          });
          setAuthToken(storedToken); // Guardar el token en memoria
          setIsAuthenticated(true);
          console.log('✅ Sesión restaurada correctamente para:', parsedUser.username);
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          setAuthToken(null); // Limpiar el token en memoria
        }
      } else {
        console.log('❌ No hay sesión almacenada');
      }
    };
    
    checkAuth();
    const tokenCheckInterval = setInterval(checkAuth, 60000);
    return () => clearInterval(tokenCheckInterval);
  }, []);

  // Función modificada para iniciar sesión
  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      // Guardar y mostrar credenciales en consola
      console.log('🔐 CREDENCIALES DE LOGIN:');
      console.log('Usuario:', credentials.username);
      console.log('Contraseña:', '********');
      
      // Dirección del API de autenticación - usando ruta relativa para el proxy
      const loginUrl = '/auth/login';
      console.log('📡 Intentando conectar con:', loginUrl, '(a través del proxy)');
      
      try {
        // Realizar petición a la API usando fetch SIN credentials: 'include'
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        });
        
        console.log('📨 Respuesta del servidor:', response.status, response.statusText);
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.error('Error en respuesta:', errorData);
            errorMessage = errorData?.message || errorMessage;
          } catch (e) {
            console.error('No se pudo parsear respuesta de error');
          }
          throw new Error(errorMessage);
        }
        
        // Obtener el token de la respuesta
        const data = await response.json();
        console.log('🔍 Datos recibidos del servidor:', JSON.stringify(data, null, 2));
        
        const token = data.token || data.access_token || data.accessToken;
        
        if (!token) {
          throw new Error('No se recibió un token válido del servidor');
        }
        
        console.log('🎫 Token recibido:', token.substring(0, 10) + '...');
        
        // Extraer información del usuario
        let userId = '1';
        let nombreCompleto = credentials.username;
        let roles = ['USER'];
        
        // Si el servidor devuelve información del usuario, usarla
        if (data.user || data.userData || data.userInfo) {
          const userData = data.user || data.userData || data.userInfo;
          userId = userData.id || userData.userId || userId;
          nombreCompleto = userData.name || userData.fullName || userData.nombreCompleto || nombreCompleto;
          roles = userData.roles || userData.permissions || roles;
        }
        
        // Crear objeto de usuario con el token
        const user: AuthUser = {
          id: userId,
          username: credentials.username,
          nombreCompleto: nombreCompleto,
          roles: roles,
          token: token
        };
        
        // Calcular tiempo de expiración (20 minutos desde ahora)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 20);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
        
        // Guardar credenciales
        localStorage.setItem('saved_username', credentials.username);
        localStorage.setItem('saved_password', credentials.password);
        
        // Actualizar estados
        setUser(user);
        setAuthToken(token); // Guardar token en memoria
        setIsAuthenticated(true);
        setLoading(false);
        console.log('✅ Login exitoso, usuario:', user.username);
        console.log('⏰ Token expira en:', expiryTime.toLocaleString());

        return { success: true, user, token };
      } catch (apiError: any) {
        console.error('❌ Error al conectar con la API:', apiError);
        
        // Modo fallback para desarrollo/pruebas
        console.log('🔄 Activando modo fallback de autenticación');
        console.log('⚠️ Motivo: No se pudo conectar con la API en', loginUrl);
        
        if (credentials.username && credentials.password) {
          // Guardar credenciales incluso en modo fallback
          localStorage.setItem('saved_username', credentials.username);
          localStorage.setItem('saved_password', credentials.password);
          
          // Crear un token simulado
          const mockToken = `mock_token_${Math.random().toString(36).substr(2, 9)}`;
          
          // Crear objeto de usuario simulado
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
          setAuthToken(mockToken); // Guardar token simulado en memoria
          setIsAuthenticated(true);
          setLoading(false);
          
          console.log('✅ Autenticación simulada exitosa');
          console.log('👤 Usuario:', user);
          console.log('🎫 Token simulado:', mockToken);
          
          return { success: true, user, token: mockToken };
        } else {
          throw new Error('Credenciales inválidas');
        }
      }
    } catch (err: unknown) {
      console.error('❌ Error en el proceso de login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    console.log('🔒 Cerrando sesión para usuario:', user?.username);
    
    // Eliminar datos de autenticación del almacenamiento local
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');

    // Añadir marca de logout explícito (con un tiempo de expiración)
  localStorage.setItem('explicit_logout', 'true');
  localStorage.setItem('explicit_logout_time', new Date().toISOString());
    
    // Resetear estados
    setUser(null);
    setAuthToken(null); // Limpiar token en memoria
    setIsAuthenticated(false);
    setError(null);
    
    console.log('✅ Sesión cerrada correctamente');
    
    // Intentar notificar al servidor, pero sin bloquear el flujo
    try {
      const token = user?.token;
      if (token) {
        fetch(AUTH_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(() => {
          console.log('📡 Servidor notificado del cierre de sesión');
        }).catch(() => {
          console.log('⚠️ No se pudo notificar al servidor sobre el cierre de sesión');
        });
      }
    } catch (error) {
      console.log('⚠️ Error al intentar notificar al servidor:', error);
    }
  }, [user]);

  // Función para renovar el token
  const renewToken = useCallback(async (): Promise<boolean> => {
    if (!user || !user.token) {
      console.log('❌ No hay token para renovar');
      return false;
    }
    
    console.log('🔄 Intentando renovar token para usuario:', user.username);
    
    try {
      // Intentar renovar el token con el servidor
      const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudo renovar el token');
      }
      
      const data = await response.json();
      const newToken = data.token || data.access_token || data.accessToken;
      
      if (!newToken) {
        throw new Error('No se recibió un token válido del servidor');
      }
      
      console.log('🎫 Nuevo token recibido:', newToken.substring(0, 10) + '...');
      
      // Calcular nuevo tiempo de expiración
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 20);
      
      // Actualizar token y tiempo de expiración
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
      
      // Actualizar usuario con nuevo token
      const updatedUser = { ...user, token: newToken };
      setUser(updatedUser);
      setAuthToken(newToken); // Actualizar token en memoria
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      console.log('✅ Token renovado correctamente');
      console.log('⏰ Nuevo token expira en:', expiryTime.toLocaleString());
      
      return true;
    } catch (renewError: unknown) {
      console.error('❌ Error al renovar el token:', renewError);
      return false;
    }
  }, [user]);

  return {
    user,
    authToken, // Exponer el token en memoria
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    renewToken
  };
};

export default useAuth;