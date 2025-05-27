// src/services/sectorService.ts
import { BaseApiService } from './BaseApiService';
import { Sector, SectorFormData } from '../models/Sector';

class SectorServiceClass extends BaseApiService<Sector, SectorFormData> {
  constructor() {
    super(
      {
        baseUrl: 'http://192.168.20.160:8080',
        endpoint: '/api/sector'
      },
      {
        normalizeItem: (apiData: any, index: number): Sector => {
          // Si el dato es null/undefined, crear uno por defecto
          if (!apiData || typeof apiData !== 'object') {
            console.warn(`⚠️ [SectorService] Dato inválido en índice ${index}:`, apiData);
            return {
              id: index + 1000,
              nombre: `Sector ${index + 1} (datos inválidos)`
            };
          }
          
          // Intentar extraer el ID de diferentes campos posibles
          let sectorId: number;
          if (typeof apiData.id === 'number') {
            sectorId = apiData.id;
          } else if (typeof apiData.codigo === 'number') {
            sectorId = apiData.codigo;
          } else if (typeof apiData.codSector === 'number') {
            sectorId = apiData.codSector;
          } else {
            sectorId = index + 1;
          }
          
          // Intentar extraer el nombre de diferentes campos posibles
          let sectorNombre: string;
          if (typeof apiData.nombre === 'string' && apiData.nombre.trim()) {
            sectorNombre = apiData.nombre.trim();
          } else if (typeof apiData.nombreSector === 'string' && apiData.nombreSector.trim()) {
            sectorNombre = apiData.nombreSector.trim();
          } else if (typeof apiData.name === 'string' && apiData.name.trim()) {
            sectorNombre = apiData.name.trim();
          } else if (typeof apiData.descripcion === 'string' && apiData.descripcion.trim()) {
            sectorNombre = apiData.descripcion.trim();
          } else {
            console.warn(`⚠️ [SectorService] No se encontró nombre válido para sector ${index}:`, apiData);
            sectorNombre = `Sector ${sectorId} (sin nombre)`;
          }
          
          return {
            id: sectorId,
            nombre: sectorNombre
          };
        },
        
        validateItem: (sector: Sector): boolean => {
          // Validar que el sector tenga datos reales
          const esValido = sector.nombre && 
            !sector.nombre.includes('(datos inválidos)') &&
            !sector.nombre.includes('(sin nombre)') &&
            !sector.nombre.match(/^Sector \d+$/) &&
            sector.nombre.trim().length > 0;
          
          if (!esValido) {
            console.warn(`⚠️ [SectorService] Sector inválido filtrado:`, sector);
          }
          
          return !!esValido;
        }
      }
    );
  }
}

// Exportar instancia singleton
const SectorService = new SectorServiceClass();
export default SectorService;

// Exportar también la clase para casos donde se necesite múltiples instancias
export { SectorServiceClass };