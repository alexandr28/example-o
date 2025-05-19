import { z } from 'zod';

export enum TipoContribuyente {
  PERSONA_NATURAL = 'persona_natural',
  PERSONA_JURIDICA = 'persona_juridica'
}

export enum TipoDocumento {
  DNI = 'dni',
  RUC = 'ruc',
  PASAPORTE = 'pasaporte',
  CARNET_EXTRANJERIA = 'carnet_extranjeria'
}

export enum Sexo {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino'
}

export enum EstadoCivil {
  SOLTERO = 'soltero',
  CASADO = 'casado',
  VIUDO = 'viudo',
  DIVORCIADO = 'divorciado'
}

export interface Direccion {
  id: number;
  descripcion: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
}

export interface ContribuyenteFormData {
  tipoContribuyente: TipoContribuyente | string;
  tipoDocumento: TipoDocumento | string;
  numeroDocumento: string;
  nombreRazonSocial: string;
  telefono: string;
  sexo: Sexo | string;
  estadoCivil: EstadoCivil | string;
  fechaNacimiento: string | null;
  direccion: Direccion | null;
  nFinca: string;
  otroNumero: string;
  mostrarFormConyuge: boolean;
}

export interface ConyugeRepresentanteFormData {
  tipoDocumento: TipoDocumento | string;
  numeroDocumento: string;
  apellidosNombres: string;
  telefono: string;
  sexo: Sexo | string;
  estadoCivil: EstadoCivil | string;
  fechaNacimiento: string | null;
  direccion: Direccion | null;
  nFinca: string;
}

export interface DireccionSeleccionadaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDireccion: (direccion: Direccion) => void;
  direcciones: Direccion[];
}