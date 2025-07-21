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
export { default as direccionService } from './direccionService'; // AGREGADO

export { personaService } from './personaService';
export { contribuyenteService } from './contribuyenteService';
export { default as constanteService, ConstanteService } from './constanteService'; // AGREGADO
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

// Tipos del servicio de constantes
export type {
  ConstanteData,
  ConstanteResponse
} from './constanteService';

// También exportar CODIGO_CONSTANTE_PADRE
export { CODIGO_CONSTANTE_PADRE } from './constanteService';

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
  PredioData,
  CreatePredioDTO,
  UpdatePredioDTO,
  BusquedaPredioParams
} from './predioService';

export type {
  ValorUnitarioData,
  CreateValorUnitarioDTO,
  UpdateValorUnitarioDTO,
  BusquedaValorUnitarioParams
} from './valorUnitarioService';