// src/config/constants.ts
// URL base de la API - mantenemos por compatibilidad con código existente
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://26.161.18.122:8085';
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
  VIA:{
    base: '/api/via',
    listarVia: `/api/via/listarVia`,
  },
 

  direccion: {
      base: '/api/direccion',
      listarPorNombreVia: `api/direccion/listarDireccionPorNombreVia`,
      listarPorTipoVia: `api/direccion/listarDireccionPorTipoVia?parametrosBusqueda=a&codUsuario=1`,
    },
  CONTRIBUYENTE: `/api/contribuyente`,
  persona: {
      base: '/api/persona',
      listarPorTipoYNombre: '/api/persona/listarPersonaPorTipoPersonaNombreRazon',
      listarPorContribuyente: '/api/persona/listarPersonaPorTipoPersonaNombreRazonContribuyente',
      listarPorTipoVia: '/api/persona/listarPersonaPorTipoPersonaNombreVia'
    },
  ARANCEL: `/api/arancel`,
  VALOR_UNITARIO: `/api/valoresunitarios`,
  UIT: `/api/uitEpa`,
  ALCABALA: `/api/alcabala`,
  DEPRECIACION: `/api/depreciacion`,
  PREDIO: `/api/predio`,
  PISO: `/api/piso`,
  ASIGNACION: `/api/asignacionpredio`,
  constante: {
      base: '/api/constante',
      listarPadre: '/api/constante/listarConstantePadre',
      listarHijo: '/api/constante/listarConstanteHijo'
  },

  // Autenticación (referencia a AUTH_ENDPOINTS)
  AUTH: `/auth`,


};