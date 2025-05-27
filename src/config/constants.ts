// src/config/constants.ts
// URL base de la API - mantenemos por compatibilidad con código existente
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080';
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
  CONTRIBUYENTE: `/api/contribuyente`,
  
  // Predio (con autenticación)
  PREDIO: `/api/predio`,
  
  // Autenticación (referencia a AUTH_ENDPOINTS)
  AUTH: `/auth`,
  
  // Otros (con autenticación)
  ARANCEL: `/api/arancel`,
  VALOR_UNITARIO: `/api/valor-unitario`,
  UIT: `/api/uit`,
  ALCABALA: `/api/alcabala`,
  DEPRECIACION: `/api/depreciacion`,
};