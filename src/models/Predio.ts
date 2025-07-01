// src/models/Predio.ts

import { Direccion } from './Direcciones';
import { Contribuyente } from './Contribuyente';

/**
 * Enumeración para los tipos de predio
 */
export enum TipoPredio {
  PREDIO_INDEPENDIENTE = 'PREDIO_INDEPENDIENTE',
  DEPARTAMENTO_EDIFICIO = 'DEPARTAMENTO_EDIFICIO',
  PREDIO_QUINTA = 'PREDIO_QUINTA',
  CUARTO_CASA_VECINDAD = 'CUARTO_CASA_VECINDAD',
  OTROS = 'OTROS'
}

/**
 * Enumeración para la condición de propiedad
 */
export enum CondicionPropiedad {
  PROPIETARIO = 'PROPIETARIO',
  POSEEDOR = 'POSEEDOR',
  ARRENDATARIO = 'ARRENDATARIO',
  USUFRUCTUARIO = 'USUFRUCTUARIO',
  OTRO = 'OTRO'
}

/**
 * Enumeración para el conductor del predio
 */
export enum ConductorPredio {
  PROPIETARIO = 'PROPIETARIO',
  INQUILINO = 'INQUILINO',
  FAMILIAR = 'FAMILIAR',
  OTRO = 'OTRO'
}

/**
 * Enumeración para el uso del predio
 */
export enum UsoPredio {
  VIVIENDA = 'VIVIENDA',
  COMERCIAL = 'COMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  SERVICIOS = 'SERVICIOS',
  MIXTO = 'MIXTO',
  BALDIO = 'BALDIO',
  OTROS = 'OTROS'
}

/**
 * Interfaz para la entidad Predio
 */
export interface Predio {
  id?: number;
  codigoPredio: string;
  
  // Relación con contribuyente
  contribuyenteId: number;
  contribuyente?: Contribuyente;
  
  // Datos de adquisición
  anioAdquisicion: number;
  fechaAdquisicion: Date | string;
  condicionPropiedad: CondicionPropiedad | string;
  
  // Ubicación
  direccionId: number;
  direccion?: Direccion | string; // Puede ser objeto Direccion o string de dirección completa
  nFinca?: string;
  numeroFinca?: string; // Alias del API
  otroNumero?: string;
  
  // Características del predio
  tipoPredio: TipoPredio | string;
  conductor: ConductorPredio | string;
  usoPredio: UsoPredio | string;
  estadoPredio?: string; // Nuevo campo del API
  
  // Medidas y valores
  areaTerreno: number;
  valorArancel: number;
  valorTerreno: number;
  valorConstruccion: number;
  otrasInstalaciones: number;
  autoavalo: number;
  totalAreaConstruccion?: number; // Nuevo campo del API
  
  // Datos adicionales
  numeroPisos?: number;
  numeroCondominos?: number;
  
  // Imágenes
  rutaFotografiaPredio?: string;
  rutaPlanoPredio?: string;
  
  // Auditoría
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  
  // Campos adicionales del API
  anio?: number;
  codClasificacion?: number;
  estPredio?: string;
  codTipoPredio?: number;
  codCondicionPropiedad?: number;
  codDireccion?: number;
  codUsoPredio?: number;
  codListaConductor?: number;
  codUbicacionAreaVerde?: number;
  valorTotalConstruccion?: number;
  codEstado?: number;
  codUsuario?: number;
}

/**
 * Tipo para el formulario de Predio
 */
export interface PredioFormData {
  // Datos básicos
  anioAdquisicion: number;
  fechaAdquisicion: Date | string;
  condicionPropiedad: CondicionPropiedad;
  
  // Ubicación
  direccionId: number;
  nFinca?: string;
  otroNumero?: string;
  
  // Características
  tipoPredio: TipoPredio;
  conductor: ConductorPredio;
  usoPredio: UsoPredio;
  
  // Valores
  areaTerreno: number;
  valorArancel: number;
  numeroPisos?: number;
  numeroCondominos?: number;
  
  // Imágenes
  rutaFotografiaPredio?: string;
  rutaPlanoPredio?: string;
}

/**
 * Interfaz para filtros de búsqueda
 */
export interface FiltroPredio {
  codigoPredio?: string;
  contribuyenteId?: number;
  tipoPredio?: TipoPredio;
  usoPredio?: UsoPredio;
  direccionId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
}