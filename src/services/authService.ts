// src/services/authService.ts
import { NotificationService } from '../components/utils/Notification';

// Configuración de autenticación
const AUTH_CONFIG = {
  TOKEN_EXPIRY_HOURS: 6, // 6 horas de duracion del token
  TOKEN_RENEWAL_THRESHOLD_MINUTES: 30, // Renovar cuando falten 30 minutos
  API_BASE_URL: 'http://26.161.18.122:8085',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register'
  }
};

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  nombrePersona: string;
  documento: string;
  codEstado: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    nombreCompleto?: string;
    roles?: string[];
  };
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    nombrePersona: string;
    documento: string;
    role: string;
  };
  message?: string;
}

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {
    console.log('🔧 [AuthService] Inicializado');
    console.log(`⏰ [AuthService] Tokens expirarán en ${AUTH_CONFIG.TOKEN_EXPIRY_HOURS} horas`);
  }
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Calcula la fecha de expiración del token (6 horas desde ahora)
   */
  private calculateTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + AUTH_CONFIG.TOKEN_EXPIRY_HOURS);
    return expiry;
  }
  
  /**
   * Guarda el token con su fecha de expiración
   */
  private saveTokenData(token: string, user: any): void {
    const expiryTime = this.calculateTokenExpiry();
    
    // Guardar en localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_token_expiry', expiryTime.toISOString());
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    console.log(`✅ [AuthService] Token guardado. Expira: ${expiryTime.toLocaleString()}`);
    console.log(`⏱️ [AuthService] Duración: ${AUTH_CONFIG.TOKEN_EXPIRY_HOURS} horas`);
  }
  
  /**
   * Verifica si el token está próximo a expirar o ya expiró
   */
  isTokenExpired(): boolean {
    const expiryStr = localStorage.getItem('auth_token_expiry');
    if (!expiryStr) return true;
    
    const expiry = new Date(expiryStr);
    const now = new Date();
    
    return expiry <= now;
  }
  
  /**
   * Verifica si el token necesita renovación (30 minutos antes de expirar)
   */
  needsTokenRenewal(): boolean {
    const expiryStr = localStorage.getItem('auth_token_expiry');
    if (!expiryStr) return true;
    
    const expiry = new Date(expiryStr);
    const now = new Date();
    const threshold = new Date(now.getTime() + (AUTH_CONFIG.TOKEN_RENEWAL_THRESHOLD_MINUTES * 60 * 1000));
    
    return expiry <= threshold;
  }
  
  /**
   * Obtiene el tiempo restante del token en minutos
   */
  getTokenRemainingTime(): number {
    const expiryStr = localStorage.getItem('auth_token_expiry');
    if (!expiryStr) return 0;
    
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(diffMs / 60000)); // Convertir a minutos
  }
  
  /**
   * Registra un nuevo usuario
   * POST /auth/register
   * NO requiere autenticacion
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      console.log('[AuthService] Registrando nuevo usuario:', data.username);

      // Validar datos requeridos
      if (!data.username || !data.nombrePersona || !data.documento || !data.codEstado || !data.password || !data.role) {
        throw new Error('Todos los campos son requeridos');
      }

      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log(`[AuthService] Respuesta del registro: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AuthService] Error del servidor:', errorText);

        if (response.status === 409) {
          throw new Error('El usuario ya existe');
        }
        if (response.status === 400) {
          throw new Error('Datos invalidos. Verifique la informacion.');
        }

        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[AuthService] Usuario registrado exitosamente:', responseData);

      // Extraer datos del usuario
      const userData = responseData.data || responseData.user || responseData;

      NotificationService.success(`Usuario ${data.username} registrado correctamente`);

      return {
        success: true,
        user: {
          id: userData.id || userData.codUsuario || '0',
          username: userData.username || data.username,
          nombrePersona: userData.nombrePersona || data.nombrePersona,
          documento: userData.documento || data.documento,
          role: userData.role || data.role
        },
        message: responseData.message || 'Usuario registrado exitosamente'
      };

    } catch (error: any) {
      console.error('[AuthService] Error en registro:', error);
      NotificationService.error(error.message || 'Error al registrar usuario');

      return {
        success: false,
        message: error.message || 'Error al registrar usuario'
      };
    }
  }

  /**
   * Realiza el login y guarda el token con expiracion de 6 horas
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 [AuthService] Iniciando sesión para:', credentials.username);
      
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Usuario o contraseña incorrectos');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extraer token de diferentes posibles ubicaciones
      const token = data.token || data.access_token || data.accessToken;
      
      if (!token) {
        throw new Error('No se recibió token del servidor');
      }
      
      // Crear objeto de usuario
      const user = {
        id: data.userId || data.user?.id || '1',
        username: credentials.username,
        nombreCompleto: data.nombreCompleto || data.user?.nombreCompleto || credentials.username,
        roles: data.roles || data.user?.roles || ['USER']
      };
      
      // Guardar token con expiración de 6 horas
      this.saveTokenData(token, user);
      
      // Limpiar marcas de logout
      localStorage.removeItem('explicit_logout');
      localStorage.removeItem('explicit_logout_time');
      
      NotificationService.success(`Bienvenido ${user.nombreCompleto}. Su sesión durará ${AUTH_CONFIG.TOKEN_EXPIRY_HOURS} horas.`);
      
      return {
        success: true,
        token,
        user
      };
      
    } catch (error: any) {
      console.error('❌ [AuthService] Error en login:', error);
      NotificationService.error(error.message || 'Error al iniciar sesión');
      
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
  }
  
  /**
   * Renueva el token antes de que expire
   * DESHABILITADO: Las APIs no requieren autenticación y causa errores CORS
   */
  async refreshToken(): Promise<boolean> {
    // DESHABILITADO: Causa errores CORS y las APIs no requieren autenticación
    console.log('⚠️ [AuthService] Renovación de token deshabilitada - las APIs no requieren autenticación');
    return false;
    
    /* Código original comentado para evitar CORS
    try {
      const currentToken = localStorage.getItem('auth_token');
      if (!currentToken) {
        console.log('❌ [AuthService] No hay token para renovar');
        return false;
      }
      
      console.log('🔄 [AuthService] Renovando token...');
      const remainingTime = this.getTokenRemainingTime();
      console.log(`⏰ [AuthService] Tiempo restante: ${remainingTime} minutos`);
      
      const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudo renovar el token');
      }
      
      const data = await response.json();
      const newToken = data.token || data.access_token || data.accessToken;
      
      if (!newToken) {
        throw new Error('No se recibió nuevo token');
      }
      
      // Obtener usuario actual
      const userStr = localStorage.getItem('auth_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Guardar nuevo token con nueva expiración de 6 horas
      this.saveTokenData(newToken, user);
      
      console.log('✅ [AuthService] Token renovado exitosamente');
      NotificationService.info('Sesión renovada automáticamente');
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [AuthService] Error al renovar token:', error);
      return false;
    }
    */
  }
  
  /**
   * Cierra la sesión
   */
  logout(): void {
    console.log('🔒 [AuthService] Cerrando sesión...');
    
    // Limpiar datos de autenticación
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    localStorage.removeItem('auth_user');
    
    // Marcar logout explícito
    localStorage.setItem('explicit_logout', 'true');
    localStorage.setItem('explicit_logout_time', new Date().toISOString());
    
    console.log('✅ [AuthService] Sesión cerrada');
    NotificationService.info('Sesión cerrada correctamente');
  }
  
  /**
   * Inicia el monitor de expiración del token
   */
  startTokenExpiryMonitor(onTokenExpired?: () => void): () => void {
    console.log('👁️ [AuthService] Iniciando monitor de expiración de token');
    
    // Verificar cada minuto
    const interval = setInterval(() => {
      const remainingTime = this.getTokenRemainingTime();
      
      // Log cada 30 minutos
      if (remainingTime % 30 === 0 && remainingTime > 0) {
        console.log(`⏰ [AuthService] Token expira en ${remainingTime} minutos`);
      }
      
      // Notificar cuando queden 30 minutos
      if (remainingTime === 30) {
        NotificationService.warning('Su sesión expirará en 30 minutos');
      }
      
      // Notificar cuando queden 5 minutos
      if (remainingTime === 5) {
        NotificationService.warning('Su sesión expirará en 5 minutos. Por favor, guarde su trabajo.');
      }
      
      // Si el token expiró
      if (this.isTokenExpired()) {
        console.log('⚠️ [AuthService] Token expirado');
        NotificationService.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        
        if (onTokenExpired) {
          onTokenExpired();
        }
        
        clearInterval(interval);
      }
      
      // Si necesita renovación (30 minutos antes de expirar)
      if (this.needsTokenRenewal() && !this.isTokenExpired()) {
        console.log('🔄 [AuthService] Token próximo a expirar, intentando renovar...');
        this.refreshToken();
      }
      
    }, 60000); // Verificar cada minuto
    
    // Retornar función para detener el monitor
    return () => {
      console.log('🛑 [AuthService] Deteniendo monitor de expiración');
      clearInterval(interval);
    };
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();