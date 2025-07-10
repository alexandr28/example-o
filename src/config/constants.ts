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
  DIRECCION: [`api/direccion/listarDireccionPorTipoVia?parametrosBusqueda=a&codUsuario=1`, `api/direccion/listarDireccionPorNombreVia`],
  CONTRIBUYENTE: `/api/contribuyente`,
  PERSONA:[`/api/persona/listarPersonaPorTipoPersonaNombreRazon`,`/api/persona/listarPersonaPorTipoPersonaNombreRazonContribuyente`,`api/persona/listarPersonaPorTipoPersonaNombreVia`],
   ARANCEL: `/api/arancel`,
  VALOR_UNITARIO: `/api/valoresunitarios`,
  UIT: `/api/uitEpa`,
  ALCABALA: `/api/alcabala`,
  DEPRECIACION: `/api/depreciacion`,
  PREDIO: `/api/predio`,
  PISO: `/api/piso`,
  CONSTANTE: [`/api/constante/listarConstantePadre`,`/api/constante/listarConstanteHijo`],

  // Autenticación (referencia a AUTH_ENDPOINTS)
  AUTH: `/auth`,


};