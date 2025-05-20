// src/config/constants.ts
// URL base de la API - mantenemos por compatibilidad con código existente
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_PREFIX = '';

// Definir explícitamente AUTH_ENDPOINTS
export const AUTH_ENDPOINTS = {
  LOGIN: `/auth/login`,
  LOGOUT: `/auth/logout`,
  REFRESH: `/auth/refresh`,
};

// Actualizar endpoints para no requerir autenticación
export const API_ENDPOINTS = {
  // Mantenedores (sin autenticación)
  BARRIO: `/api/barrio`,
  SECTOR: `/api/sector`,
  VIA: `/api/via`,
  CALLE: `/api/calle`,
  DIRECCION: `/api/direccion`,
  
  // Contribuyentes (con autenticación)
  CONTRIBUYENTE: `${API_BASE_URL}/api/contribuyente`,
  
  // Predio (con autenticación)
  PREDIO: `${API_BASE_URL}/predio`,
  
  // Autenticación (referencia a AUTH_ENDPOINTS)
  AUTH: `/auth`,
  
  // Otros (con autenticación)
  ARANCEL: `${API_BASE_URL}/arancel`,
  VALOR_UNITARIO: `${API_BASE_URL}/valor-unitario`,
  UIT: `${API_BASE_URL}/uit`,
  ALCABALA: `${API_BASE_URL}/alcabala`,
  DEPRECIACION: `${API_BASE_URL}/depreciacion`,
};