// src/services/calleService.ts - REFACTORIZADO
import { BaseApiService } from './BaseApiService';
import { Calle, CalleFormData, normalizeTipoViaFromApi } from '../models/Calle';

class CalleServiceClass extends BaseApiService<Calle, CalleFormData> {
  constructor() {
    super(
      {
        baseUrl: 'http://192.168.20.160:8080',
        endpoint: '/api/via'
      },
      {
        normalizeItem: (apiData: any, index: number): Calle => {
          console.log(`🔍 [CalleService] Normalizando calle ${index}:`, apiData);
          
          // Si el dato es null/undefined, crear uno por defecto
          if (!apiData || typeof apiData !== 'object') {
            console.warn(`⚠️ [CalleService] Dato inválido en índice ${index}:`, apiData);
            return {
              id: index + 1000,
              tipoVia: 'calle',
              nombre: `Calle sin nombre ${index + 1}`,
              sectorId: 0,
              barrioId: 0
            };
          }
          
          // Extraer ID
          let calleId: number;
          if (typeof apiData.codTipoVia === 'number') {
            calleId = apiData.codTipoVia;
          } else if (typeof apiData.id === 'number') {
            calleId = apiData.id;
          } else if (typeof apiData.codigo === 'number') {
            calleId = apiData.codigo;
          } else {
            calleId = index + 1;
          }
          
          // Extraer tipo de vía
          let tipoVia: string = 'calle';
          if (typeof apiData.tipoVia === 'string' && apiData.tipoVia.trim()) {
            tipoVia = normalizeTipoViaFromApi(apiData.tipoVia);
          } else if (typeof apiData.tipo === 'string' && apiData.tipo.trim()) {
            tipoVia = normalizeTipoViaFromApi(apiData.tipo);
          } else if (typeof apiData.descripTipoVia === 'string' && apiData.descripTipoVia.trim()) {
            tipoVia = normalizeTipoViaFromApi(apiData.descripTipoVia);
          }
          
          // Extraer nombre
          let nombreVia: string;
          if (typeof apiData.nombreVia === 'string' && apiData.nombreVia.trim()) {
            nombreVia = apiData.nombreVia.trim();
          } else if (typeof apiData.nombre === 'string' && apiData.nombre.trim()) {
            nombreVia = apiData.nombre.trim();
          } else if (typeof apiData.name === 'string' && apiData.name.trim()) {
            nombreVia = apiData.name.trim();
          } else {
            console.warn(`⚠️ [CalleService] No se encontró nombre válido para calle ${index}`);
            nombreVia = `Calle sin nombre ${calleId}`;
          }
          
          // Extraer sector y barrio
          let sectorId: number = 0;
          let barrioId: number = 0;
          
          if (typeof apiData.sectorId === 'number') {
            sectorId = apiData.sectorId;
          } else if (apiData.sector && typeof apiData.sector.id === 'number') {
            sectorId = apiData.sector.id;
          }
          
          if (typeof apiData.barrioId === 'number') {
            barrioId = apiData.barrioId;
          } else if (apiData.barrio && typeof apiData.barrio.id === 'number') {
            barrioId = apiData.barrio.id;
          }
          
          const resultado: Calle = {
            id: calleId,
            codTipoVia: apiData.codTipoVia,
            tipoVia: tipoVia,
            nombre: nombreVia,
            nombreVia: apiData.nombreVia,
            descripTipoVia: apiData.descripTipoVia,
            sectorId: sectorId,
            barrioId: barrioId,
            sector: apiData.sector,
            barrio: apiData.barrio,
            estado: apiData.estado,
            fechaCreacion: apiData.fechaCreacion,
            fechaModificacion: apiData.fechaModificacion,
            usuarioCreacion: apiData.usuarioCreacion,
            usuarioModificacion: apiData.usuarioModificacion
          };
          
          console.log(`✅ [CalleService] Calle ${index} normalizada:`, resultado);
          return resultado;
        },
        
        validateItem: (calle: Calle): boolean => {
          const esValido = calle.nombre && 
            !calle.nombre.includes('sin nombre') &&
            calle.nombre.trim().length > 0 &&
            isValidTipoVia(calle.tipoVia);
          
          if (!esValido) {
            console.warn(`⚠️ [CalleService] Calle inválida filtrada:`, calle);
          }
          
          return esValido;
        }
      }
    );
  }
  
  // Override del método create para mapear correctamente los campos
  async create(data: CalleFormData): Promise<Calle> {
    const requestData = {
      sectorId: data.sectorId,
      barrioId: data.barrioId,
      tipoVia: data.tipoVia,
      nombreVia: data.nombre // Mapear nombre a nombreVia para la API
    };
    
    return super.create(requestData as any);
  }
  
  // Override del método update para mapear correctamente los campos
  async update(id: number, data: CalleFormData): Promise<Calle> {
    const requestData = {
      sectorId: data.sectorId,
      barrioId: data.barrioId,
      tipoVia: data.tipoVia,
      nombreVia: data.nombre // Mapear nombre a nombreVia para la API
    };
    
    return super.update(id, requestData as any);
  }
  
  // Método adicional para obtener tipos de vía desde la API
  async getTiposVia(): Promise<any[]> {
    try {
      console.log('🎨 [CalleService] Obteniendo tipos de vía...');
      
      // Simulamos que la API devuelve los tipos de vía
      // En un caso real, esto vendría de un endpoint específico
      return TIPO_VIA_OPTIONS;
      
    } catch (error) {
      console.error('❌ [CalleService] Error al obtener tipos de vía:', error);
      throw error;
    }
  }
}

// Helpers
function isValidTipoVia(tipoVia: string): boolean {
  const validTypes = ['avenida', 'calle', 'jiron', 'pasaje', 'malecon', 'plaza', 'parque'];
  return validTypes.includes(tipoVia.toLowerCase());
}

import { TIPO_VIA_OPTIONS } from '../models/Calle';

// Exportar instancia singleton
const CalleService = new CalleServiceClass();
export default CalleService;

// Exportar también la clase para casos donde se necesite múltiples instancias
export { CalleServiceClass };