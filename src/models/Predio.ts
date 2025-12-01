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
  PROPIETARIO_UNICO = 'PROPIETARIO UNICO',
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
  PRIVADO = 'PRIVADO',
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
 * Enumeración para el estado del predio
 */
export enum EstadoPredio {
  TERMINADO = 'TERMINADO',
  EN_CONSTRUCCION = 'EN_CONSTRUCCION',
  EN_PROCESO = 'EN_PROCESO',
  REGISTRADO = 'REGISTRADO',
  OBSERVADO = 'OBSERVADO',
  ANULADO = 'ANULADO'
}

export enum ClasificacionPredio {
  CASAS_HABITACION_Y_DEPARTAMENTO_PARA_CASAS = 'CASAS HABITACION Y DEPARTAMENTO PARA CASAS',
  TIENDAS_DEPOSITOS_CENTROS_DE_RECREACION_O_ESPARCIMIENTO_CLUBS_SOCIALES_O_INSTITUCIONES
  = 'TIENDAS,DEPOSITOS,CENTROS DE RECREACION O ESPARCIMIENTO,CLUBS SOCIALES O INSTITUCIONES',
  EDIFICIOS_OFICINAS ='EDIFICIOS - OFICINAS',
  CLINICAS_HOSPITALES_CINES_INDUSTRIAS_COLEGIOS_TALLERES = 'CLINICAS,HOSPITALES,CINES,INDUSTRIAS,COLEGIOS,TALLERES',



}

/**
 * Interfaz para la respuesta de la API de Predio
 */
export interface PredioApiResponse {
  anio: number | null;
  codPredio: string;
  numeroFinca: string | null;
  otroNumero: string | null;
  codClasificacion: number | null;
  estPredio: string | null;
  codTipoPredio: number | null;
  codCondicionPropiedad: number | null;
  codDireccion: number | null;
  codUsoPredio: number | null;
  fechaAdquisicion: string | null;
  numeroCondominos: number | null;
  codListaConductor: number | null;
  codUbicacionAreaVerde: number | null;
  areaTerreno: number;
  numeroPisos: number | null;
  totalAreaConstruccion: number | null;
  valorTotalConstruccion: number | null;
  valorTerreno: number | null;
  autoavaluo: number | null;
  codEstado: number | null;
  codUsuario: number | null;
  direccion: string;
  conductor: string;
  estadoPredio: string;
  condicionPropiedad: string;
}

/**
 * Interfaz para la entidad Predio (modelo interno)
 */
export interface Predio {
  id?: number;
  codigoPredio: string;
  codPredioBase?: string;

  // Relación con contribuyente
  contribuyenteId?: number;
  contribuyente?: Contribuyente;

  // Datos de adquisición
  anio?: number | null;
  fechaAdquisicion?: Date | string | null;
  condicionPropiedad: CondicionPropiedad | string;
  
  // Ubicación
  direccionId?: number | null;
  direccion?: Direccion | string; // Puede ser objeto Direccion o string de dirección completa
  numeroFinca?: string | null;
  otroNumero?: string | null;
  
  // Características del predio
  tipoPredio?: TipoPredio | string | null;
  conductor: ConductorPredio | string;
  usoPredio?: UsoPredio | string | null;
  estadoPredio?: EstadoPredio | string;
  
  // Medidas y valores
  areaTerreno: number;
  valorTerreno?: number | null;
  valorConstruccion?: number | null;
  valorTotal?: number | null;
  totalAreaConstruccion?: number | null;
  valorTotalConstruccion?: number | null;
  autoavaluo?: number | null;
  
  // Datos adicionales
  numeroPisos?: number | null;
  numeroCondominos?: number | null;
  
  // Códigos de la API
  codPredio?: string;
  codClasificacion?: number | null;
  estPredio?: string | null;
  codTipoPredio?: number | null;
  codCondicionPropiedad?: number | null;
  codDireccion?: number | null;
  codUsoPredio?: number | null;
  codListaConductor?: number | null;
  codUbicacionAreaVerde?: number | null;
  codEstado?: number | null;
  codUsuario?: number | null;
  
  // Auditoría
  estado?: string | boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

/**
 * Tipo para el formulario de Predio
 */
export interface PredioFormData {
  // Datos básicos
  anio?: number;
  fechaAdquisicion?: Date | string | null;
  condicionPropiedad: string;

  // Ubicación
  direccionId?: number;
  direccion?: string;
  numeroFinca?: string;
  otroNumero?: string;

  // Características
  tipoPredio?: string;
  conductor: string;
  usoPredio?: string;
  estadoPredio?: string;
  clasificacionPredio?: string;

  // Valores
  areaTerreno: number;
  valorTerreno?: number;
  totalAreaConstruccion?: number;
  valorTotalConstruccion?: number;
  autoavaluo?: number;
  numeroPisos?: number;
  numeroCondominos?: number;
}

/**
 * Interfaz para filtros de búsqueda
 */
export interface FiltroPredio {
  codigoPredio?: string;
  contribuyenteId?: number;
  tipoPredio?: TipoPredio | string;
  usoPredio?: UsoPredio | string;
  estadoPredio?: EstadoPredio | string;
  condicionPropiedad?: CondicionPropiedad | string;
  direccionId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  anio?: number;
}

/**
 * Función para mapear la respuesta de la API al modelo interno
 */
export const mapPredioApiToModel = (apiData: PredioApiResponse): Predio => {
  return {
    codigoPredio: apiData.codPredio?.trim() || '',
    anio: apiData.anio,
    fechaAdquisicion: apiData.fechaAdquisicion,
    condicionPropiedad: apiData.condicionPropiedad || CondicionPropiedad.PROPIETARIO_UNICO,
    direccion: apiData.direccion,
    direccionId: apiData.codDireccion,
    numeroFinca: apiData.numeroFinca,
    otroNumero: apiData.otroNumero,
    conductor: apiData.conductor || ConductorPredio.PRIVADO,
    estadoPredio: apiData.estadoPredio || EstadoPredio.TERMINADO,
    areaTerreno: apiData.areaTerreno || 0,
    numeroPisos: apiData.numeroPisos,
    totalAreaConstruccion: apiData.totalAreaConstruccion,
    valorTotalConstruccion: apiData.valorTotalConstruccion,
    valorTerreno: apiData.valorTerreno,
    autoavaluo: apiData.autoavaluo,
    
    // Códigos originales de la API
    codPredio: apiData.codPredio,
    codClasificacion: apiData.codClasificacion,
    estPredio: apiData.estPredio,
    codTipoPredio: apiData.codTipoPredio,
    codCondicionPropiedad: apiData.codCondicionPropiedad,
    codDireccion: apiData.codDireccion,
    codUsoPredio: apiData.codUsoPredio,
    codListaConductor: apiData.codListaConductor,
    codUbicacionAreaVerde: apiData.codUbicacionAreaVerde,
    codEstado: apiData.codEstado,
    codUsuario: apiData.codUsuario,
    
    numeroCondominos: apiData.numeroCondominos,
  };
};