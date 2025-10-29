// src/services/index.ts
export { default as constanteService } from './constanteService';
export type {
  ConstanteData,
  ConstanteResponse,
  GrupoUsoData,
  UbicacionAreaVerdeData,
  UsoPredioData
} from './constanteService';
export { ConstanteService, CODIGO_CONSTANTE_PADRE, CODIGO_CONSTANTE_HIJO } from './constanteService';

export { default as asignacionService } from './asignacionService';
export type { AsignacionPredio, AsignacionQueryParams } from './asignacionService';

export { cuentaCorrienteService } from './cuentaCorrienteService';
export type { EstadoCuentaAnual, EstadoCuentaDetalle } from './cuentaCorrienteService';

export { default as vencimientoService } from './vencimientoService';
export type { VencimientoData, CreateVencimientoDTO } from './vencimientoService';

export { default as resolucionInteresService } from './resolucionInteresService';
export type {
  ResolucionInteresData,
  CreateResolucionInteresDTO,
  UpdateResolucionInteresDTO,
  DeleteResolucionInteresDTO
} from './resolucionInteresService';

export { default as fraccionamientoService } from './fraccionamientoService';