// src/services/direccionService.ts - INTERFACES CORREGIDAS
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interface para los datos de dirección
 */
export interface DireccionData {
  id: number;
  codigo?: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  codigoVia?: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  tipoVia?: string;
  numeroMunicipal?: string;
  cuadra?: string;
  lado?: string;
  lote?: string;
  loteInicial?: number;
  loteFinal?: number;
  manzana?: string;
  sublote?: string;
  referencia?: string;
  direccionCompleta?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
  // Campos adicionales del API
  codDireccion?: number;
  codBarrioVia?: number;
  codSector?: number;
  codBarrio?: number;
  codVia?: number;
  parametroBusqueda?: string;
  nombreTipoVia?: string;
  descripcion?: string;
}

export interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  codigoVia?: number;
  numeroMunicipal?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  lote?: string;
  manzana?: string;
  sublote?: string;
  referencia?: string;
  codUsuario?: number;
}

export interface UpdateDireccionDTO extends Partial<CreateDireccionDTO> {
  estado?: string;
}

export interface BusquedaDireccionParams {
  codigoSector?: number;
  codigoBarrio?: number;
  codigoCalle?: number;
  codigoVia?: number;
  nombreVia?: string;
  numeroMunicipal?: string;
  estado?: string;
  parametrosBusqueda?: string;
  codUsuario?: number;
}