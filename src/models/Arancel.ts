import { Direccion } from './';

// Enum para el estado del arancel
export enum EstadoArancel {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

// Interfaz para la entidad Arancel
export interface Arancel {
  id: number;
  año: number;
  direccionId: number;
  direccion?: Direccion;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  monto: number;
  estado: EstadoArancel;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

// Tipo para el formulario de Arancel
export type ArancelFormData = {
  año: number;
  direccionId: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  monto: number;
};