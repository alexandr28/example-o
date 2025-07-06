// src/services/index.ts - Exportaciones centralizadas de servicios

// Re-exportar directamente cada servicio
// Esto evita problemas con las rutas de importación

// Servicios base
export { default as BaseApiService } from './BaseApiService';
export type { NormalizeOptions } from './BaseApiService';

// Servicios de utilidades
export { connectivityService } from './connectivityService';

// NOTA: Por ahora, importar los servicios directamente en los componentes
// hasta resolver el problema de las rutas de importación

// Los servicios están disponibles en:
// - src/services/barrioService.ts
// - src/services/sectorService.ts  
// - src/services/calleApiService.ts

// Temporalmente, en los hooks usar:
// import barrioService from '../services/barrioService';
// import sectorService from '../services/sectorService';
// import calleService from '../services/calleApiService';
export { default as barrioService } from './barrioService';
export { default as sectorService } from './sectorService'; 
export { default as calleService } from './calleApiService';
export {  personaService } from './personaService';
export {  contribuyenteService } from './contribuyenteService';
export {  contribuyenteListService } from './contribuyenteListService';
export { DireccionService} from './direccionService';
export { pisoService } from './pisoService';
export { predioService } from './predioService';
/*
export { arancelService } from './arancelService';
export { valorUnitarioService } from './valorUnitarioService';
export { uitService } from './uitService';
export { alcabalaService } from './alcabalaService';
export { depreciacionService } from './depreciacionService';
export { depreciacionService } from './depreciacionService';

*/
