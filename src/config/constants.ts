// src/config/constants.ts
// URL base de la API - mantenemos por compatibilidad con código existente
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://26.161.18.122:8085';
export const API_PREFIX = '';

// Definir explícitamente AUTH_ENDPOINTS
export const AUTH_ENDPOINTS = {
  LOGIN: `/auth/login`,
  LOGOUT: `/auth/logout`,
  REFRESH: `/auth/refresh`,
  REGISTER: `/auth/register`,
};

// Roles de usuario disponibles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CAJERO: 'CAJERO',
  GERENTE: 'GERENTE',
  SUPERVISOR: 'SUPERVISOR',
  USER: 'USER'
} as const;

// Tipo para roles
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Estados de usuario
export const USER_ESTADOS = {
  ACTIVO: '4567',
  INACTIVO: '4568',
  SUSPENDIDO: '4569'
} as const;

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
  ASIGNACION_CAJA:{
    base: '/api/asignacionCaja',
    listar: '/api/asignacionCaja/listar',
    insertar: '/api/asignacionCaja/insertar',
    actualizar: '/api/asignacionCaja/actualizar',
    eliminar: '/api/asignacionCaja/eliminar', 
  },
  CAJA:{
    base: '/api/caja',
    listar: '/api/caja/listar',
    insertar: '/api/caja/insertar',
    actualizar: '/api/caja/actualizar',
    eliminar: '/api/caja/eliminar',
  },
  TURNO:'/api/turno',
  APERTURA_CAJA:{
    base: '/api/aperturaCaja',
    aperturar: '/api/aperturaCaja/aperturar',
    cierre: '/api/aperturaCaja/cierre',
  },
  USUARIO:{
    base: '/api/usuario',
    listar: '/api/usuario/listar',
    insertar: '/api/usuario/insertar',
    actualizar: '/api/usuario/actualizar',
    cambiarClave: '/api/usuario/cambiarClave',
    darBaja: '/api/usuario/darBaja',
    activar: '/api/usuario/activar',
  },

  // Autenticación (referencia a AUTH_ENDPOINTS)
  AUTH: `/auth`,


};