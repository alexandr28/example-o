/**
 * Constantes para configuración de la aplicación
 */

// URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_PREFIX = '/api';
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_PREFIX}/auth/login`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
};

// URLs de los endpoints
export const API_ENDPOINTS = {
  // Mantenedores
  BARRIO: `${API_BASE_URL}/barrio`,
  SECTOR: `${API_BASE_URL}/sector`,
  CALLE: `${API_BASE_URL}/calle`,
  DIRECCION: `${API_BASE_URL}/direccion`,
  
  // Contribuyentes
  CONTRIBUYENTE: `${API_BASE_URL}/contribuyente`,
  
  // Predio
  PREDIO: `${API_BASE_URL}/predio`,
  
  // Autenticación
  AUTH: `${API_BASE_URL}/auth`,
  
  // Otros
  ARANCEL: `${API_BASE_URL}/arancel`,
  VALOR_UNITARIO: `${API_BASE_URL}/valor-unitario`,
  UIT: `${API_BASE_URL}/uit`,
  ALCABALA: `${API_BASE_URL}/alcabala`,
  DEPRECIACION: `${API_BASE_URL}/depreciacion`,
};

// Valores para paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};

// Tiempo de expiración del token (en milisegundos)
export const TOKEN_EXPIRY_TIME = 20 * 60 * 1000; // 20 minutos