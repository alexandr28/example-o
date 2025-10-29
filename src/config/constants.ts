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
  sector: {
    base: '/api/sector',
    listarCuadrante: '/api/sector/listarCuadrante',
    listarUnidadUrbana: '/api/sector/listarTipoUnidadUrbana',
  },
  VIA:{
    base: '/api/via',
    listarVia: `/api/via/listarVia`,
  },
  SERENAZGO:'/api/arbitrioSerenazgo',
  LIMPIEZA_PUBLICA:{
    base: '/api/arbitrioLimpiezaPublica',
    listarLimpiezaPublicaOtros: '/api/arbitrioLimpiezaPublica/listarArbitrioLimpiezaPublicaOtros',
    insertarLimpiezaPublicaOtros: '/api/arbitrioLimpiezaPublica/insertarArbitrioLimpiezaPublicaOtros',
    actualizarLimpiezaPublicaOtros: '/api/arbitrioLimpiezaPublica/actualizarArbitrioLimpiezaPublicaOtros',
  },
  PARQUES_JARDINES:'/api/arbitrioParquesjardines',

  direccion: {
      base: '/api/direccion',
      listarPorNombreVia: `api/direccion/listarDireccionPorNombreVia`,
      listarPorTipoVia: `api/direccion/listarDireccionPorTipoVia?parametrosBusqueda=a&codUsuario=1`,
    },
  CONTRIBUYENTE: {
    base: '/api/contribuyente',
    general: '/api/contribuyente/general',
  },
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
  PREDIO: {
    base: '/api/predio',
    all: '/api/predio/all',
    usos: '/api/predio/usos',
  },
  PISO: `/api/piso`,
  ASIGNACION: `/api/asignacionpredio`,
  constante: {
      base: '/api/constante',
      listarPadre: '/api/constante/listarConstantePadre',
      listarHijo: '/api/constante/listarConstanteHijo'
  },
  CUENTA_CORRIENTE: {
    base: '/api/estadoCuenta',
    listar: '/api/estadoCuenta/listar',
    listarDetalle: '/api/estadoCuenta/listarDetalle',
  },
  RESOLUCION_INTERES: '/api/resolucionInteres',
  Vencimiento: '/api/vencimiento',

  // Autenticación (referencia a AUTH_ENDPOINTS)
  AUTH: `/auth`,


};