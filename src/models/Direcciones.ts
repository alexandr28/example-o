// src/models/Direcciones.ts - ACTUALIZADO
import { Sector } from './Sector';
import { Barrio } from './Barrio';
import { Calle } from './Calle';

// Enum para los lados de una dirección
export enum LadoDireccion {
  NINGUNO = '-',
  IZQUIERDO = 'I',
  DERECHO = 'D',
  PAR = 'P',
  IMPAR = 'IM'
}

// Interfaz para la entidad Dirección
export interface Direccion {
  id: number;
  sectorId: number;
  sector?: Sector;
  barrioId: number;
  barrio?: Barrio;
  calleId: number;
  calle?: Calle;
  cuadra: string;
  lado: LadoDireccion;
  loteInicial: number;
  loteFinal: number;
  descripcion?: string;
  estado?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  
  // Campos adicionales del API
  nombreSector?: string;
  nombreBarrio?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  parametroBusqueda?: string;
  codDireccion?: number;
  codBarrioVia?: number;
  codSector?: number;
  codBarrio?: number;
  codVia?: number;
  codUsuario?: number;
}

// Tipo para el formulario de Dirección
export type DireccionFormData = {
  sectorId: number;
  barrioId: number;
  calleId: number;
  cuadra: string;
  lado: LadoDireccion | string;
  loteInicial: number;
  loteFinal: number;
};