// src/services/calleApiService.ts - CORREGIDO
import { BaseApiService } from './BaseApiService';
import { Calle, CalleFormData, TIPO_VIA_OPTIONS } from '../models/Calle';

class CalleServiceClass extends BaseApiService<Calle, CalleFormData> {
  constructor() {
    // Llamar al constructor de BaseApiService con los parámetros correctos
    super(
      '', // baseURL vacío para usar proxy de Vite
      '/api/via', // endpoint base para CRUD
      {
        // Función para normalizar cada item de la API
        normalizeItem: (apiData: any, index: number): Calle => {
          console.log(`🔍 [CalleService] Normalizando calle ${index}:`, apiData);
          
          // Validación robusta para valores null
          if (!apiData || typeof apiData !== 'object') {
            console.warn(`⚠️ [CalleService] Dato inválido en índice ${index}:`, apiData);
            return {
              id: index + 1000,
              tipoVia: 'calle',
              nombre: `Calle sin nombre ${index + 1}`,
              sectorId: 1,
              barrioId: 1
            };
          }
          
          // Extraer ID con verificación de null
          let calleId: number;
          if (typeof apiData.codVia === 'number' && apiData.codVia > 0) {
            calleId = apiData.codVia;
          } else if (typeof apiData.id === 'number' && apiData.id > 0) {
            calleId = apiData.id;
          } else {
            calleId = index + 1;
          }
          
          // Mapear tipo de vía desde código numérico
          let tipoVia: string = 'calle';
          if (apiData.codTipoVia !== null && apiData.codTipoVia !== undefined) {
            const tipoViaMap: { [key: number]: string } = {
              1: 'calle',
              2: 'avenida',
              3: 'jiron',
              4: 'pasaje',
              5: 'malecon',
              6: 'plaza',
              7: 'parque'
            };
            tipoVia = tipoViaMap[apiData.codTipoVia] || 'calle';
          }
          
          // Extraer nombre con validación
          let nombreVia: string = 'Sin nombre';
          if (apiData.nombreVia && typeof apiData.nombreVia === 'string') {
            nombreVia = apiData.nombreVia.trim();
          } else if (apiData.nombre && typeof apiData.nombre === 'string') {
            nombreVia = apiData.nombre.trim();
          }
          
          // Extraer IDs de sector y barrio
          const sectorId = (typeof apiData.codSector === 'number' && apiData.codSector > 0) 
            ? apiData.codSector 
            : 1;
            
          const barrioId = (typeof apiData.codBarrio === 'number' && apiData.codBarrio > 0) 
            ? apiData.codBarrio 
            : 1;
          
          // Construir objeto normalizado
          const normalized: Calle = {
            id: calleId,
            tipoVia: tipoVia,
            nombre: nombreVia,
            sectorId: sectorId,
            barrioId: barrioId
          };
          
          console.log(`✅ [CalleService] Calle normalizada:`, normalized);
          return normalized;
        },
        
        // Función opcional para validar items
        validateItem: (item: Calle): boolean => {
          return item.id > 0 && 
                 item.nombre.length > 0 && 
                 item.sectorId > 0 && 
                 item.barrioId > 0;
        }
      },
      'calles_cache' // cacheKey
    );
  }
  
  // Override del método getAll para usar el endpoint correcto de listado
  async getAll(): Promise<Calle[]> {
    try {
      console.log('📡 [CalleService] GET - Obteniendo lista de calles');
      
      // Para listar, usar el endpoint específico
      const response = await this.makeRequest('/api/via/listarVia', {
        method: 'GET'
      });
      
      const normalized = this.normalizeArray(response);
      console.log(`✅ [CalleService] ${normalized.length} calles obtenidas`);
      
      return normalized;
      
    } catch (error) {
      console.error('❌ [CalleService] Error al obtener calles:', error);
      throw error;
    }
  }
  
  // Override del método create para usar el endpoint correcto y mapear los campos
  async create(data: CalleFormData): Promise<Calle> {
    try {
      // Validación previa
      if (!data || typeof data !== 'object') {
        throw new Error('Datos de calle inválidos');
      }
      
      if (!data.sectorId || data.sectorId <= 0) {
        throw new Error('Debe seleccionar un sector');
      }
      
      if (!data.barrioId || data.barrioId <= 0) {
        throw new Error('Debe seleccionar un barrio');
      }
      
      if (!data.tipoVia || data.tipoVia.trim() === '') {
        throw new Error('Debe seleccionar un tipo de vía');
      }
      
      if (!data.nombre || data.nombre.trim() === '') {
        throw new Error('Debe ingresar el nombre de la vía');
      }
      
      // Mapear tipo de vía a código numérico
      const tipoViaToCode: { [key: string]: number } = {
        'calle': 1,
        'avenida': 2,
        'jiron': 3,
        'pasaje': 4,
        'malecon': 5,
        'plaza': 6,
        'parque': 7
      };
      
      // Preparar datos para la API
      const requestData = {
        codTipoVia: tipoViaToCode[data.tipoVia] || 1,
        nombreVia: data.nombre.trim(),
        codSector: data.sectorId,
        codBarrio: data.barrioId
      };
      
      console.log('📤 [CalleService] Creando calle con endpoint insertarVias:', requestData);
      
      // Usar el endpoint específico para insertar
      const response = await this.makeRequest('/api/via/insertarVias', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      // Normalizar la respuesta
      const normalized = this.normalizeOptions.normalizeItem(response, 0);
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      
      console.log('✅ [CalleService] Calle creada:', normalized);
      return normalized;
      
    } catch (error) {
      console.error('❌ [CalleService] Error en create:', error);
      throw error;
    }
  }
  
  // Override del método update para mapear correctamente los campos
  async update(id: number, data: CalleFormData): Promise<Calle> {
    try {
      // Validaciones
      if (!id || id <= 0) {
        throw new Error('ID de calle inválido');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Datos de calle inválidos');
      }
      
      // Mapear tipo de vía a código numérico
      const tipoViaToCode: { [key: string]: number } = {
        'calle': 1,
        'avenida': 2,
        'jiron': 3,
        'pasaje': 4,
        'malecon': 5,
        'plaza': 6,
        'parque': 7
      };
      
      // Preparar datos para la API
      const requestData = {
        codTipoVia: tipoViaToCode[data.tipoVia] || 1,
        nombreVia: data.nombre.trim(),
        codSector: data.sectorId,
        codBarrio: data.barrioId
      };
      
      console.log(`📤 [CalleService] Actualizando calle ${id}:`, requestData);
      
      // Llamar al método update de la clase base
      return super.update(id, requestData as any);
      
    } catch (error) {
      console.error(`❌ [CalleService] Error en update ${id}:`, error);
      throw error;
    }
  }
  
  // Método adicional para obtener tipos de vía
  async getTiposVia(): Promise<any[]> {
    try {
      console.log('🎨 [CalleService] Obteniendo tipos de vía...');
      return TIPO_VIA_OPTIONS;
    } catch (error) {
      console.error('❌ [CalleService] Error al obtener tipos de vía:', error);
      return TIPO_VIA_OPTIONS;
    }
  }
  
  // Método para obtener calles por sector
  async getBySector(sectorId: number): Promise<Calle[]> {
    try {
      console.log(`📡 [CalleService] Obteniendo calles del sector ${sectorId}`);
      
      // Primero obtener todas las calles
      const allCalles = await this.getAll();
      
      // Filtrar por sector
      const callesSector = allCalles.filter(calle => calle.sectorId === sectorId);
      
      console.log(`✅ [CalleService] ${callesSector.length} calles encontradas para sector ${sectorId}`);
      return callesSector;
      
    } catch (error) {
      console.error(`❌ [CalleService] Error al obtener calles del sector ${sectorId}:`, error);
      throw error;
    }
  }
  
  // Método para obtener calles por barrio
  async getByBarrio(barrioId: number): Promise<Calle[]> {
    try {
      console.log(`📡 [CalleService] Obteniendo calles del barrio ${barrioId}`);
      
      // Primero obtener todas las calles
      const allCalles = await this.getAll();
      
      // Filtrar por barrio
      const callesBarrio = allCalles.filter(calle => calle.barrioId === barrioId);
      
      console.log(`✅ [CalleService] ${callesBarrio.length} calles encontradas para barrio ${barrioId}`);
      return callesBarrio;
      
    } catch (error) {
      console.error(`❌ [CalleService] Error al obtener calles del barrio ${barrioId}:`, error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const CalleService = new CalleServiceClass();
export default CalleService;

// Exportar también la clase para casos donde se necesite múltiples instancias
export { CalleServiceClass };