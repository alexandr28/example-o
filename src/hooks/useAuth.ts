// src/hooks/useAuth.ts - VERSIÓN CORREGIDA
import { useState, useCallback, useEffect } from 'react';
import { AuthCredentials, AuthUser, AuthResult } from '../models/Auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null | undefined>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
            setAuthToken(null);
            setIsAuthenticated(false);
            setError('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
            return;
          }
          
          // Token válido
          setUser({
            ...parsedUser,
            token: storedToken
          });
          setAuthToken(storedToken);
          setIsAuthenticated(true);
          console.log('✅ Sesión restaurada correctamente para:', parsedUser.username);
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          setAuthToken(null);
        }
      } else {
        console.log('❌ No hay sesión almacenada');
      }
    };
    
    checkAuth();
    const tokenCheckInterval = setInterval(checkAuth, 60000);
    return () => clearInterval(tokenCheckInterval);
  }, []);

  // Función de login CORREGIDA - MÁS ESTRICTA
  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Iniciando proceso de autenticación...');
      console.log('Usuario:', credentials.username);
      
      // 🔒 VALIDACIÓN ESTRICTA DE CREDENCIALES
      if (!credentials.username || !credentials.password) {
        setError('Usuario y contraseña son requeridos');
        setLoading(false);
        return { success: false, error: 'Credenciales incompletas' };
      }

      if (credentials.username.length < 3) {
        setError('El usuario debe tener al menos 3 caracteres');
        setLoading(false);
        return { success: false, error: 'Usuario demasiado corto' };
      }

      if (credentials.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres');
        setLoading(false);
        return { success: false, error: 'Contraseña demasiado corta' };
      }
      
      // URL de autenticación - usando ruta relativa para el proxy
      const loginUrl = '/auth/login';
      console.log('📡 Conectando con API de autenticación:', loginUrl);
      
      try {
        // ⏱️ TIMEOUT MÁS CORTO PARA DETECTAR PROBLEMAS RÁPIDO
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
        
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('📨 Respuesta del servidor:', response.status, response.statusText);
        
        // 🚨 VERIFICACIÓN ESTRICTA DE RESPUESTA
        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            console.error('❌ Error en respuesta:', errorData);
            errorMessage = errorData?.message || errorData?.error || errorMessage;
          } catch (e) {
            console.error('No se pudo parsear respuesta de error');
          }
          
          // 🚨 NO PERMITIR FALLBACK EN ERRORES DE AUTENTICACIÓN
          setError(errorMessage);
          setLoading(false);
          return { success: false, error: errorMessage };
        }
        
        // 📋 PROCESAR RESPUESTA EXITOSA
        const data = await response.json();
        console.log('🔍 Datos recibidos del servidor:', data);
        
        const token = data.token || data.access_token || data.accessToken;
        
        if (!token) {
          const error = 'El servidor no devolvió un token válido';
          setError(error);
          setLoading(false);
          return { success: false, error };
        }
        
        console.log('🎫 Token recibido correctamente');
        
        // 👤 CREAR USUARIO CON DATOS DEL SERVIDOR
        let userId = '1';
        let nombreCompleto = credentials.username;
        let roles = ['USER'];
        
        if (data.user || data.userData || data.userInfo) {
          const userData = data.user || data.userData || data.userInfo;
          userId = userData.id || userData.userId || userId;
          nombreCompleto = userData.name || userData.fullName || userData.nombreCompleto || nombreCompleto;
          roles = userData.roles || userData.permissions || roles;
        }
        
        const user: AuthUser = {
          id: userId,
          username: credentials.username,
          nombreCompleto: nombreCompleto,
          roles: roles,
          token: token
        };
        
        // ⏰ TIEMPO DE EXPIRACIÓN
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 20); // 20 minutos
        
        // 💾 GUARDAR EN LOCALSTORAGE
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
        
        // 🧹 LIMPIAR MARCAS DE LOGOUT EXPLÍCITO
        localStorage.removeItem('explicit_logout');
        localStorage.removeItem('explicit_logout_time');
        
        // 🔄 ACTUALIZAR ESTADOS
        setUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
        setError(null);
        setLoading(false);
        
        console.log('✅ Login exitoso:', user.username);
        console.log('⏰ Token expira:', expiryTime.toLocaleString());

        return { success: true, user, token };
        
      } catch (fetchError: any) {
        console.error('❌ Error de conexión con API:', fetchError);
        
        // 🚨 DETERMINAR TIPO DE ERROR
        let errorMessage = 'Error de conexión con el servidor';
        
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Tiempo de espera agotado. Verifique su conexión.';
        } else if (fetchError.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifique que esté ejecutándose.';
        } else if (fetchError.message.includes('NetworkError')) {
          errorMessage = 'Error de red. Verifique su conexión a internet.';
        }
        
        // 🚫 NO MODO FALLBACK - SOLO EN DESARROLLO Y CON CREDENCIALES ESPECÍFICAS
        if (process.env.NODE_ENV === 'development') {
          console.log('🚨 Modo desarrollo detectado');
          
          // 🔐 CREDENCIALES DE DESARROLLO ESPECÍFICAS
          const devCredentials = [
            { username: 'admin', password: 'admin' },
            { username: 'test', password: 'test' },
            { username: 'demo', password: 'demo' }
          ];
          
          const isValidDevCredential = devCredentials.some(
            cred => cred.username === credentials.username && cred.password === credentials.password
          );
          
          if (isValidDevCredential) {
            console.log('🔧 Usando credenciales de desarrollo válidas');
            
            const mockToken = `dev_token_${Date.now()}`;
            const user: AuthUser = {
              id: '1',
              username: credentials.username,
              nombreCompleto: `Usuario de Desarrollo (${credentials.username})`,
              roles: ['ADMIN', 'USER'],
              token: mockToken
            };
            
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 20);
            
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
            
            setUser(user);
            setAuthToken(mockToken);
            setIsAuthenticated(true);
            setError(null);
            setLoading(false);
            
            console.log('✅ Login de desarrollo exitoso');
            return { success: true, user, token: mockToken };
          } else {
            console.log('🚫 Credenciales de desarrollo inválidas');
            errorMessage += '\n\nEn modo desarrollo, use: admin/admin, test/test, o demo/demo';
          }
        }
        
        // 🚫 RECHAZAR LOGIN
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    } catch (err: unknown) {
      console.error('❌ Error general en login:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    console.log('🔒 Cerrando sesión para usuario:', user?.username);
    
    // Eliminar datos de autenticación
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    
    // Marcar logout explícito
    localStorage.setItem('explicit_logout', 'true');
    localStorage.setItem('explicit_logout_time', new Date().toISOString());
    
    // Resetear estados
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('✅ Sesión cerrada correctamente');
  }, [user]);

  // Función para renovar el token
  const renewToken = useCallback(async (): Promise<boolean> => {
    if (!user || !user.token) {
      console.log('❌ No hay token para renovar');
      return false;
    }
    
    console.log('🔄 Intentando renovar token para usuario:', user.username);
    
    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
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
      
      console.log('🎫 Token renovado correctamente');
      
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 20);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
      
      const updatedUser = { ...user, token: newToken };
      setUser(updatedUser);
      setAuthToken(newToken);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      return true;
    } catch (renewError: unknown) {
      console.error('❌ Error al renovar el token:', renewError);
      return false;
    }
  }, [user]);

  return {
    user,
    authToken,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    renewToken
  };
};

export default useAuth;