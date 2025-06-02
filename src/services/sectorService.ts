// src/services/sectorService.ts - USAR PROXY DE VITE
import { BaseApiService } from './BaseApiService';
import { Sector, SectorFormData } from '../models/Sector';

class SectorServiceClass extends BaseApiService<Sector, SectorFormData> {
  constructor() {
    super(
      {
        baseUrl: '', // ✅ PROXY LOCAL - Vite redirigirá automáticamente
        endpoint: '/api/sector' // ✅ /api/sector -> http://192.168.20.160:8080/sector
      },
      {
        normalizeItem: (apiData: any, index: number): Sector => {
          console.log(`🔍 [SectorService] Normalizando item ${index}:`, apiData);
          
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
          
          const resultado = {
            id: sectorId,
            nombre: sectorNombre
          };
          
          console.log(`✅ [SectorService] Sector normalizado:`, resultado);
          return resultado;
        },
        
        extractArray: (response: any): any[] => {
          console.log('🔍 [SectorService] Extrayendo array de respuesta:', response);
          
          // Si la respuesta ya es un array, devolverlo
          if (Array.isArray(response)) {
            return response;
          }
          
          // Intentar extraer de propiedades comunes
          if (response && typeof response === 'object') {
            // Buscar en propiedades comunes
            const possibleArrays = ['data', 'items', 'results', 'content', 'sectores'];
            
            for (const prop of possibleArrays) {
              if (Array.isArray(response[prop])) {
                console.log(`✅ [SectorService] Array encontrado en propiedad '${prop}'`);
                return response[prop];
              }
            }
            
            // Si no encontramos un array, devolver array vacío
            console.warn('⚠️ [SectorService] No se encontró array en la respuesta');
            return [];
          }
          
          return [];
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