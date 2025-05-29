// src/services/barrioService.ts - REFACTORIZADO
import { BaseApiService } from './BaseApiService';
import { Barrio, BarrioFormData } from '../models/Barrio';

class BarrioServiceClass extends BaseApiService<Barrio, BarrioFormData> {
  constructor() {
    super(
      {
        baseUrl: 'http://192.168.20.160:8080',
        endpoint: '/api/barrio'
      },
      {
        normalizeItem: (apiData: any, index: number): Barrio => {
          // Si el dato es null/undefined, crear uno por defecto
          if (!apiData || typeof apiData !== 'object') {
            console.warn(`⚠️ [BarrioService] Dato inválido en índice ${index}:`, apiData);
            return {
              id: index + 1000,
              nombre: `Barrio ${index + 1} (datos inválidos)`,
              sectorId: 0
            };
          }
          
          // Intentar extraer el ID de diferentes campos posibles
          let barrioId: number;
          if (typeof apiData.codBarrio === 'number') {
            barrioId = apiData.codBarrio;
          } else if (typeof apiData.id === 'number') {
            barrioId = apiData.id;
          } else if (typeof apiData.codigo === 'number') {
            barrioId = apiData.codigo;
          } else {
            barrioId = index + 1;
          }
          
          // Intentar extraer el nombre de diferentes campos posibles
          let barrioNombre: string;
          if (typeof apiData.nombre === 'string' && apiData.nombre.trim()) {
            barrioNombre = apiData.nombre.trim();
          } else if (typeof apiData.nombreBarrio === 'string' && apiData.nombreBarrio.trim()) {
            barrioNombre = apiData.nombreBarrio.trim();
          } else if (typeof apiData.name === 'string' && apiData.name.trim()) {
            barrioNombre = apiData.name.trim();
          } else if (typeof apiData.descripcion === 'string' && apiData.descripcion.trim()) {
            barrioNombre = apiData.descripcion.trim();
          } else {
            console.warn(`⚠️ [BarrioService] No se encontró nombre válido para barrio ${index}:`, apiData);
            barrioNombre = `Barrio ${barrioId} (sin nombre)`;
          }
          
          // Extraer el sectorId
          let sectorId: number = 0;
          if (typeof apiData.sectorId === 'number') {
            sectorId = apiData.sectorId;
          } else if (apiData.sector && typeof apiData.sector.id === 'number') {
            sectorId = apiData.sector.id;
          } else if (typeof apiData.codSector === 'number') {
            sectorId = apiData.codSector;
          }
          
          const resultado: Barrio = {
            id: barrioId,
            codBarrio: apiData.codBarrio,
            nombre: barrioNombre,
            nombreBarrio: apiData.nombreBarrio,
            sectorId: sectorId,
            sector: apiData.sector,
            estado: apiData.estado,
            fechaCreacion: apiData.fechaCreacion,
            fechaModificacion: apiData.fechaModificacion,
            usuarioCreacion: apiData.usuarioCreacion,
            usuarioModificacion: apiData.usuarioModificacion
          };
          
          console.log(`✅ [BarrioService] Barrio ${index} normalizado:`, resultado);
          return resultado;
        },
        
        validateItem: (barrio: Barrio): boolean => {
          // Validar que el barrio tenga datos reales
          const esValido = barrio.nombre && 
            !barrio.nombre.includes('(datos inválidos)') &&
            !barrio.nombre.includes('(sin nombre)') &&
            !barrio.nombre.match(/^Barrio \d+$/) &&
            barrio.nombre.trim().length > 0 &&
            barrio.sectorId > 0;
          
          if (!esValido) {
            console.warn(`⚠️ [BarrioService] Barrio inválido filtrado:`, barrio);
          }
          
          return !!esValido;
        }
      }
    );
  }
  
  // Override del método create para mapear correctamente los campos
  async create(data: BarrioFormData): Promise<Barrio> {
    const requestData = {
      nombreBarrio: data.nombre, // Mapear nombre a nombreBarrio para la API
      sectorId: data.sectorId
    };
    
    return super.create(requestData as any);
  }
  
  // Override del método update para mapear correctamente los campos
  async update(id: number, data: BarrioFormData): Promise<Barrio> {
    const requestData = {
      nombreBarrio: data.nombre, // Mapear nombre a nombreBarrio para la API
      sectorId: data.sectorId
    };
    
    return super.update(id, requestData as any);
  }
}

// Exportar instancia singleton
const BarrioService = new BarrioServiceClass();
export default BarrioService;

// Exportar también la clase para casos donde se necesite múltiples instancias
export { BarrioServiceClass };