// src/services/index.ts - Exportaciones centralizadas de servicios

// Re-exportar directamente cada servicio
// Esto evita problemas con las rutas de importación

// Servicios base
export { default as BaseApiService } from './BaseApiService';
export type { NormalizeOptions } from './BaseApiService';

// Servicios de utilidades
export { connectivityService } from './connectivityService';
export type { ApiStatus, ConnectivityConfig } from './connectivityService';

// Servicios de entidades - IMPORTANTE: Sin extensiones .ts
export { default as barrioService } from './barrioService';
export { default as sectorService } from './sectorService'; 
export { default as calleService } from './calleApiService';
export { default as tipoViaService } from './viaService';

export { personaService } from './personaService';
export { contribuyenteService } from './contribuyenteService'; // EXPORTAR AMBOS
export {   ConstanteService } from './constanteService'; // NUEVO
export { pisoService } from './pisoService';
export { predioService } from './predioService';
export { arancelService } from './arancelService';
export { valorUnitarioService } from './valorUnitarioService';
export { uitService } from './uitService';
// export { alcabalaService } from './alcabalaService';
// export { depreciacionService } from './depreciacionService';

// Exportar tipos relacionados si existen
export type { 
  PersonaData, 
  PersonaApiResponse, 
  BusquedaPersonaParams 
} from './personaService';

export type {
  ContribuyenteData,
  CreateContribuyenteDTO,
  UpdateContribuyenteDTO,
  BusquedaContribuyenteParams
} from './contribuyenteService';

// Tipos del servicio de constantes - NUEVO
export type {
  ConstanteData,
  ConstanteResponse,
  CODIGO_CONSTANTE_PADRE
} from './constanteService';

export type {
  ArancelData,
  CreateArancelDTO,
  UpdateArancelDTO,
  UNIDADES_MEDIDA,
  CATEGORIAS_ARANCEL
} from './arancelService';

export type {
  DireccionData,
  CreateDireccionDTO,
  UpdateDireccionDTO,
  BusquedaDireccionParams
} from './direccionService';

export type {
  UITData,
  CreateUITDTO,
  UpdateUITDTO
} from './uitService';

export type {
  ValorUnitarioData,
  CreateValorUnitarioDTO,
  UpdateValorUnitarioDTO,
  CategoriaValorUnitario,
  SubcategoriaValorUnitario,
  LetraValorUnitario
} from './valorUnitarioService';

export type {
  PisoData,
  CreatePisoDTO,
  UpdatePisoDTO,
  BusquedaPisoParams
} from './pisoService';

export type {
  
  CreatePredioDTO,
  UpdatePredioDTO,
  BusquedaPredioParams
} from './predioService';

// Tipos de los mantenedores
export type {
  BarrioData,
  CreateBarrioDTO,
  UpdateBarrioDTO,
  BusquedaBarrioParams
} from './barrioService';

export type {
  SectorData,
  CreateSectorDTO,
  UpdateSectorDTO,
  BusquedaSectorParams
} from './sectorService';

export type {
  CalleData,
  CreateCalleDTO,
  UpdateCalleDTO,
  BusquedaCalleParams
} from './calleApiService';

export type {
  TipoViaData,
  CreateTipoViaDTO,
  UpdateTipoViaDTO
} from './viaService';