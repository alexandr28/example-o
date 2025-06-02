// src/services/calleApiService.ts - CORREGIDO PARA API REAL
import { BaseApiService } from './BaseApiService';
import { Calle, CalleFormData, TIPO_VIA_OPTIONS } from '../models/Calle';

class CalleServiceClass extends BaseApiService<Calle, CalleFormData> {
  constructor() {
    super(
      {
        baseUrl: '', // ✅ PROXY LOCAL - Vite redirigirá automáticamente
        endpoint: '/api/via/listarVia' // ✅ Endpoint correcto según Postman
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
              sectorId: 1, // Sector por defecto
              barrioId: 1  // Barrio por defecto
            };
          }
          
          // 🔥 EXTRAER CAMPOS SEGÚN LA ESTRUCTURA REAL DEL API
          
          // ID de la vía
          let calleId: number;
          if (typeof apiData.codVia === 'number') {
            calleId = apiData.codVia;
          } else if (typeof apiData.id === 'number') {
            calleId = apiData.id;
          } else {
            calleId = index + 1;
          }
          
          // Tipo de vía - mapear desde codTipoVia
          let tipoVia: string = 'calle';
          if (typeof apiData.codTipoVia === 'number') {
            // Mapear códigos numéricos a tipos de vía
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
          } else if (typeof apiData.descripTipoVia === 'string' && apiData.descripTipoVia) {
            // Mapear desde descripción si existe
            const descripcion = apiData.descripTipoVia.toLowerCase();
            if (descripcion.includes('avenida') || descripcion.includes('av')) tipoVia = 'avenida';
            else if (descripcion.includes('jiron') || descripcion.includes('jr')) tipoVia = 'jiron';
            else if (descripcion.includes('pasaje')) tipoVia = 'pasaje';
            else if (descripcion.includes('malecon')) tipoVia = 'malecon';
            else if (descripcion.includes('plaza')) tipoVia = 'plaza';
            else if (descripcion.includes('parque')) tipoVia = 'parque';
          }
          
          // Nombre de la vía
          let nombreVia: string;
          if (typeof apiData.nombreVia === 'string' && apiData.nombreVia.trim()) {
            nombreVia = apiData.nombreVia.trim();
          } else if (typeof apiData.nombre === 'string' && apiData.nombre.trim()) {
            nombreVia = apiData.nombre.trim();
          } else {
            console.warn(`⚠️ [CalleService] No se encontró nombre válido para calle ${calleId}`);
            nombreVia = `Calle ${calleId}`;
          }
          
          // 🔥 SECTOR Y BARRIO - USAR VALORES POR DEFECTO SI NO EXISTEN
          let sectorId: number = 1; // Valor por defecto
          let barrioId: number = 1; // Valor por defecto
          
          // Intentar extraer sectorId y barrioId si existen en el API
          if (typeof apiData.codSector === 'number' && apiData.codSector > 0) {
            sectorId = apiData.codSector;
          } else if (typeof apiData.sectorId === 'number' && apiData.sectorId > 0) {
            sectorId = apiData.sectorId;
          }
          
          if (typeof apiData.codBarrio === 'number' && apiData.codBarrio > 0) {
            barrioId = apiData.codBarrio;
          } else if (typeof apiData.barrioId === 'number' && apiData.barrioId > 0) {
            barrioId = apiData.barrioId;
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
            estado: apiData.estado !== false, // Por defecto true
            fechaCreacion: apiData.fechaCreacion,
            fechaModificacion: apiData.fechaModificacion,
            usuarioCreacion: apiData.usuarioCreacion,
            usuarioModificacion: apiData.usuarioModificacion
          };
          
          console.log(`✅ [CalleService] Calle ${index} normalizada:`, resultado);
          return resultado;
        },
        
        extractArray: (response: any): any[] => {
          console.log('🔍 [CalleService] Extrayendo array de respuesta:', response);
          
          // 🔥 MANEJAR ESTRUCTURA ESPECÍFICA DEL API: {success, message, data}
          if (response && typeof response === 'object') {
            // Verificar si tiene la estructura esperada del API
            if (response.success === true && Array.isArray(response.data)) {
              console.log(`✅ [CalleService] Array encontrado en 'data' con ${response.data.length} elementos`);
              return response.data;
            }
            
            // Si no, buscar en otras propiedades comunes
            const possibleArrays = ['data', 'items', 'results', 'content', 'vias', 'calles'];
            for (const prop of possibleArrays) {
              if (Array.isArray(response[prop])) {
                console.log(`✅ [CalleService] Array encontrado en propiedad '${prop}' con ${response[prop].length} elementos`);
                return response[prop];
              }
            }
          }
          
          // Si la respuesta ya es un array, devolverlo
          if (Array.isArray(response)) {
            console.log(`✅ [CalleService] Respuesta es array directo con ${response.length} elementos`);
            return response;
          }
          
          console.warn('⚠️ [CalleService] No se encontró array válido en la respuesta');
          return [];
        },
        
        validateItem: (calle: Calle): boolean => {
          // 🔥 VALIDACIÓN MÁS PERMISIVA
          const tieneNombreValido = calle.nombre && 
            calle.nombre.trim().length > 0 &&
            !calle.nombre.includes('sin nombre');
          
          const tieneTipoViValido = calle.tipoVia && 
            calle.tipoVia.trim().length > 0;
          
          const tieneSectorValido = calle.sectorId > 0;
          const tieneBarrioValido = calle.barrioId > 0;
          
          const esValido = tieneNombreValido && tieneTipoViValido && tieneSectorValido && tieneBarrioValido;
          
          if (!esValido) {
            console.warn(`⚠️ [CalleService] Calle inválida:`, {
              nombre: calle.nombre,
              tipoVia: calle.tipoVia,
              sectorId: calle.sectorId,
              barrioId: calle.barrioId,
              tieneNombreValido,
              tieneTipoViValido,
              tieneSectorValido,
              tieneBarrioValido
            });
          } else {
            console.log(`✅ [CalleService] Calle válida: ${calle.tipoVia} ${calle.nombre}`);
          }
          
          return esValido;
        }
      }
    );
  }
  
  // Override del método create para mapear correctamente los campos
  async create(data: CalleFormData): Promise<Calle> {
    // Mapear el tipo de vía a código numérico si es necesario
    const tipoViaToCode: { [key: string]: number } = {
      'calle': 1,
      'avenida': 2,
      'jiron': 3,
      'pasaje': 4,
      'malecon': 5,
      'plaza': 6,
      'parque': 7
    };
    
    const requestData = {
      codTipoVia: tipoViaToCode[data.tipoVia] || 1,
      nombreVia: data.nombre,
      codSector: data.sectorId,
      codBarrio: data.barrioId
    };
    
    console.log('📤 [CalleService] Creando calle:', requestData);
    return super.create(requestData as any);
  }
  
  // Override del método update para mapear correctamente los campos
  async update(id: number, data: CalleFormData): Promise<Calle> {
    const tipoViaToCode: { [key: string]: number } = {
      'calle': 1,
      'avenida': 2,
      'jiron': 3,
      'pasaje': 4,
      'malecon': 5,
      'plaza': 6,
      'parque': 7
    };
    
    const requestData = {
      codTipoVia: tipoViaToCode[data.tipoVia] || 1,
      nombreVia: data.nombre,
      codSector: data.sectorId,
      codBarrio: data.barrioId
    };
    
    console.log(`📤 [CalleService] Actualizando calle ${id}:`, requestData);
    return super.update(id, requestData as any);
  }
  
  // Método adicional para obtener tipos de vía desde la API
  async getTiposVia(): Promise<any[]> {
    try {
      console.log('🎨 [CalleService] Obteniendo tipos de vía...');
      
      // Por ahora devolver los tipos predefinidos
      // En el futuro se podría crear un endpoint específico
      return TIPO_VIA_OPTIONS;
      
    } catch (error) {
      console.error('❌ [CalleService] Error al obtener tipos de vía:', error);
      return TIPO_VIA_OPTIONS; // Fallback a tipos predefinidos
    }
  }
}

// Exportar instancia singleton
const CalleService = new CalleServiceClass();
export default CalleService;

// Exportar también la clase para casos donde se necesite múltiples instancias
export { CalleServiceClass };