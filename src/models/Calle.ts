// src/models/Calle.ts

/**
 * Modelo principal de Calle/Via (basado en API response)
 */
export interface Calle {
  codVia: number; // ID principal
  codTipoVia: number | string; // Código del tipo de vía
  codBarrio: number; // Código del barrio
  nombreVia: string; // Nombre de la vía
  descTipoVia: string; // Descripción del tipo de vía (ej: "CALLE")
  nombreBarrio: string; // Nombre del barrio
  nombreSector?: string; // Nombre del sector
  
  // Campos adicionales para compatibilidad
  id?: number;
  codigo?: number;
  nombre?: string;
  codigoVia?: number | string;
  codigoBarrio?: number;
  tipo?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
  
  // Campos que faltan referenciados en CalleList.tsx
  nombreTipoVia?: string; // Nombre del tipo de vía
  nombreCalle?: string; // Nombre de la calle
  codSector?: number; // Código del sector
}

/**
 * Datos del formulario de Calle
 */
export interface CalleFormData {
  tipoVia: number;
  codSector: number;
  codBarrio?: number | null;
  nombreCalle: string;
}

/**
 * Funciones helper
 */
export const isCalleActiva = (calle: Calle): boolean => {
  return calle.estado === 'ACTIVO';
};

export const getCalleDisplayName = (calle: Calle): string => {
  const tipoVia = calle.nombreTipoVia || calle.descTipoVia || 'Via';
  const nombre = calle.nombreCalle || calle.nombreVia || '';
  return `${tipoVia} ${nombre}`.trim();
};

/**
 * Tipos de vía disponibles
 */
export interface TipoVia {
  codigo: number;
  nombre: string;
  abreviatura: string;
}

export const TIPO_VIA_OPTIONS: TipoVia[] = [
  { codigo: 3801, nombre: 'Avenida', abreviatura: 'AV' },
  { codigo: 3802, nombre: 'Calle', abreviatura: 'CA' },
  { codigo: 3803, nombre: 'Jirón', abreviatura: 'JR' },
  { codigo: 3804, nombre: 'Pasaje', abreviatura: 'PJ' },
  { codigo: 3805, nombre: 'Carretera', abreviatura: 'CR' }
];

/**
 * Valores por defecto para una nueva calle
 */
export const defaultCalleFormData: CalleFormData = {
  tipoVia: 0,
  codSector: 0,
  codBarrio: 0,
  nombreCalle: ''
};