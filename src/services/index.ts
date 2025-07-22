// src/services/index.ts - Exportaciones centralizadas de servicios

// Re-exportar directamente cada servicio
// Esto evita problemas con las rutas de importación

// Servicios base
export { default as BaseApiService } from './BaseApiService';
export type { NormalizeOptions, ApiError, ApiResponse, PaginatedResponse, QueryParams } from './BaseApiService';

// Servicios de utilidades
export { connectivityService } from './connectivityService';
export type { ApiStatus, ConnectivityConfig } from './connectivityService';

// Servicios de entidades - IMPORTANTE: Sin extensiones .ts
export { default as barrioService } from './barrioService';
export { default as sectorService } from './sectorService'; 
export { default as calleService } from './calleApiService';
export { default as tipoViaService } from './viaService';
export { default as direccionService } from './direccionService';

export { personaService } from './personaService';
export { contribuyenteService } from './contribuyenteService';
export { default as constanteService, ConstanteService } from './constanteService';
export { pisoService } from './pisoService';
export { predioService } from './predioService';
export { default as arancelService } from './arancelService'; // ACTUALIZADO - exportación por defecto
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

// Tipos del servicio de constantes
export type {
  ConstanteData,
  ConstanteResponse
} from './constanteService';

// También exportar CODIGO_CONSTANTE_PADRE
export { CODIGO_CONSTANTE_PADRE } from './constanteService';

// Tipos del servicio de arancel - ACTUALIZADO
export type {
  ArancelData,
  CreateArancelDTO,
  UpdateArancelDTO,
  ArancelResponse
} from './arancelService';

export type {
  DireccionData,
  CreateDireccionDTO,
  UpdateDireccionDTO,
  BusquedaDireccionParams
} from './direccionService';

// Tipos del servicio de predio - Usa Predio del modelo, no PredioData
export type {
  CreatePredioDTO,
  UpdatePredioDTO,
  BusquedaPredioParams
} from './predioService';

// Importar Predio del modelo
export type { Predio as PredioData } from '../models/Predio';

export type {
  PisoData,
  CreatePisoDTO,
  UpdatePisoDTO,
  BusquedaPisoParams
} from './pisoService';

export type {
  ValorUnitarioData,
  CreateValorUnitarioDTO,
  UpdateValorUnitarioDTO,
  BusquedaValorUnitarioParams
} from './valorUnitarioService';

export type {
  UITData,
  CreateUITDTO,
  UpdateUITDTO
} from './uitService';

// Exportar tipos de barrio y sector
export type {
  BarrioData,
  CreateBarrioDTO,
  UpdateBarrioDTO
} from './barrioService';

export type {
  SectorData,
  CreateSectorDTO,
  UpdateSectorDTO
} from './sectorService';