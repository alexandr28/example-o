// src/models/Calle.ts

/**
 * Modelo principal de Calle
 */
export interface Calle {
  id: number;
  tipoVia: number;
  nombreTipoVia?: string;
  codSector: number;
  nombreSector?: string;
  codBarrio: number;
  nombreBarrio?: string;
  nombreCalle: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

/**
 * Datos del formulario de Calle
 */
export interface CalleFormData {
  tipoVia: number;
  codSector: number;
  codBarrio: number;
  nombreCalle: string;
}

/**
 * Funciones helper
 */
export const isCalleActiva = (calle: Calle): boolean => {
  return calle.estado === 'ACTIVO';
};

export const getCalleDisplayName = (calle: Calle): string => {
  const tipoVia = calle.nombreTipoVia || 'Via';
  return `${tipoVia} ${calle.nombreCalle}`;
};

/**
 * Valores por defecto para una nueva calle
 */
export const defaultCalleFormData: CalleFormData = {
  tipoVia: 0,
  codSector: 0,
  codBarrio: 0,
  nombreCalle: ''
};