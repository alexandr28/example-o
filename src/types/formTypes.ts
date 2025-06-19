// src/types/formTypes.ts

// Enums para los tipos de datos
export enum TipoContribuyente {
  PERSONA_NATURAL = 'PERSONA_NATURAL',
  PERSONA_JURIDICA = 'PERSONA_JURIDICA'
}

export enum TipoDocumento {
  DNI = 'DNI',
  RUC = 'RUC',
  PASAPORTE = 'PASAPORTE',
  CARNET_EXTRANJERIA = 'CARNET_EXTRANJERIA'
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO'
}

export enum EstadoCivil {
  SOLTERO = 'SOLTERO',
  CASADO = 'CASADO',
  DIVORCIADO = 'DIVORCIADO',
  VIUDO = 'VIUDO',
  CONVIVIENTE = 'CONVIVIENTE'
}

// Interfaz para direcciones
export interface Direccion {
  id: number;
  descripcion: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  // Campos adicionales del API si los hay
  sectorId?: number;
  barrioId?: number;
  calleId?: number;
}

// Re-exportar tipos de los schemas
export type { ContribuyenteFormData, ConyugeRepresentanteFormData } from '../schemas/contribuyenteSchemas';