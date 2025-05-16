/**
 * Modelo para las credenciales de autenticación
 */
export interface AuthCredentials {
  /**
   * Nombre de usuario
   */
  username: string;
  
  /**
   * Contraseña del usuario
   */
  password: string;
}

/**
 * Modelo para representar el usuario autenticado
 */
export interface AuthUser {
  /**
   * Identificador único del usuario
   */
  id: string;
  
  /**
   * Nombre de usuario
   */
  username: string;
  
  /**
   * Nombre completo del usuario
   */
  nombreCompleto: string;
  
  /**
   * Roles asignados al usuario
   */
  roles: string[];
  
  /**
   * Token de acceso para autenticación
   */
  token?: string;
}

/**
 * Estado de autenticación de la aplicación
 */
export interface AuthState {
  /**
   * Usuario autenticado actualmente
   */
  user: AuthUser | null;
  
  /**
   * Indica si el proceso de inicio de sesión está en curso
   */
  loading: boolean;
  
  /**
   * Mensaje de error en caso de fallo en la autenticación
   */
  error: string | null;
  
  /**
   * Indica si el usuario está autenticado
   */
  isAuthenticated: boolean;
}

/**
 * Resultado de un intento de autenticación
 */
export interface AuthResult {
  /**
   * Indica si la autenticación fue exitosa
   */
  success: boolean;
  
  /**
   * Usuario autenticado (en caso de éxito)
   */
  user?: AuthUser;
  
  /**
   * Mensaje de error (en caso de fallo)
   */
  error?: string;
  
  /**
   * Token de acceso (en caso de éxito)
   */
  token?: string;
}