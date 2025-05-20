// src/config/constants.ts
// URL base de la API - mantenemos por compatibilidad con código existente
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_PREFIX = '';

// Actualizar endpoints de autenticación para usar rutas relativas 
// (aprovechando el proxy configurado en vite.config.ts)
export const AUTH_ENDPOINTS = {
  LOGIN: `/auth/login`,
  LOGOUT: `/auth/logout`,
  REFRESH: `/auth/refresh`,
};

// Resto del archivo sin cambios
export const API_ENDPOINTS = {
  // Mantenedores
  BARRIO: `${API_BASE_URL}${API_PREFIX}/barrio`,
  SECTOR: `${API_BASE_URL}${API_PREFIX}/sector`,
  CALLE: `${API_BASE_URL}${API_PREFIX}/calle`,
  DIRECCION: `${API_BASE_URL}${API_PREFIX}/direccion`,
  // Contribuyentes
  CONTRIBUYENTE: `${API_BASE_URL}/api/contribuyente`,
  
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