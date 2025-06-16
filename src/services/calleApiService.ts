// src/services/calleApiService.ts - CORREGIDO PARA MANEJAR NULL VALORES
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
          
          // ✅ VALIDACIÓN MÁS ROBUSTA PARA VALORES NULL
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
          
          // 🔥 EXTRAER CAMPOS CON VERIFICACIÓN DE NULL/UNDEFINED
          
          // ID de la vía
          let calleId: number;
          if (typeof apiData.codVia === 'number' && apiData.codVia > 0) {
            calleId = apiData.codVia;
          } else if (typeof apiData.id === 'number' && apiData.id > 0) {
            calleId = apiData.id;
          } else {
            calleId = index + 1;
          }
          
          // Tipo de vía - mapear desde codTipoVia con verificación de null
          let tipoVia: string = 'calle';
          if (apiData.codTipoVia !== null && apiData.codTipoVia !== undefined && typeof apiData.codTipoVia === 'number') {
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
          } else if (apiData.descripTipoVia && typeof apiData.descripTipoVia === 'string' && apiData.descripTipoVia.trim() !== '') {
            // Mapear desde descripción si existe
            const descripcion = apiData.descripTipoVia.toLowerCase();
            if (descripcion.includes('avenida') || descripcion.includes('av')) tipoVia = 'avenida';
            else if (descripcion.includes('jiron') || descripcion.includes('jr')) tipoVia = 'jiron';
            else if (descripcion.includes('pasaje')) tipoVia = 'pasaje';
            else if (descripcion.includes('malecon')) tipoVia = 'malecon';
            else if (descripcion.includes('plaza')) tipoVia = 'plaza';
            else if (descripcion.includes('parque')) tipoVia = 'parque';
          }
          
          // Nombre de la vía con verificación de null
          let nombreVia: string;
          if (apiData.nombreVia && typeof apiData.nombreVia === 'string' && apiData.nombreVia.trim() !== '') {
            nombreVia = apiData.nombreVia.trim();
          } else if (apiData.nombre && typeof apiData.nombre === 'string' && apiData.nombre.trim() !== '') {
            nombreVia = apiData.nombre.trim();
          } else {
            console.warn(`⚠️ [CalleService] No se encontró nombre válido para calle ${calleId}`);
            nombreVia = `Calle ${calleId}`;
          }
          
          // 🔥 SECTOR Y BARRIO - MANEJAR NULL/UNDEFINED
          let sectorId: number = 1; // Valor por defecto
          let barrioId: number = 1; // Valor por defecto
          
          // Intentar extraer sectorId - con verificación de null
          if (apiData.codSector !== null && apiData.codSector !== undefined && typeof apiData.codSector === 'number' && apiData.codSector > 0) {
            sectorId = apiData.codSector;
          } else if (apiData.sectorId !== null && apiData.sectorId !== undefined && typeof apiData.sectorId === 'number' && apiData.sectorId > 0) {
            sectorId = apiData.sectorId;
          } else if (apiData.sector && typeof apiData.sector === 'object' && apiData.sector !== null && typeof apiData.sector.id === 'number' && apiData.sector.id > 0) {
            sectorId = apiData.sector.id;
          }
          
          // Intentar extraer barrioId - con verificación de null
          if (apiData.codBarrio !== null && apiData.codBarrio !== undefined && typeof apiData.codBarrio === 'number' && apiData.codBarrio > 0) {
            barrioId = apiData.codBarrio;
          } else if (apiData.barrioId !== null && apiData.barrioId !== undefined && typeof apiData.barrioId === 'number' && apiData.barrioId > 0) {
            barrioId = apiData.barrioId;
          } else if (apiData.barrio && typeof apiData.barrio === 'object' && apiData.barrio !== null && typeof apiData.barrio.id === 'number' && apiData.barrio.id > 0) {
            barrioId = apiData.barrio.id;
          }
          
          // ✅ CONSTRUIR RESULTADO CON VALORES SEGUROS
          const resultado: Calle = {
            id: calleId,
            codTipoVia: (apiData.codTipoVia !== null && apiData.codTipoVia !== undefined) ? apiData.codTipoVia : undefined,
            tipoVia: tipoVia,
            nombre: nombreVia,
            nombreVia: (apiData.nombreVia && typeof apiData.nombreVia === 'string') ? apiData.nombreVia : undefined,
            descripTipoVia: (apiData.descripTipoVia && typeof apiData.descripTipoVia === 'string') ? apiData.descripTipoVia : undefined,
            sectorId: sectorId,
            barrioId: barrioId,
            estado: apiData.estado !== false, // Por defecto true, solo false si explícitamente es false
            fechaCreacion: apiData.fechaCreacion || undefined,
            fechaModificacion: apiData.fechaModificacion || undefined,
            usuarioCreacion: (apiData.usuarioCreacion && typeof apiData.usuarioCreacion === 'string') ? apiData.usuarioCreacion : undefined,
            usuarioModificacion: (apiData.usuarioModificacion && typeof apiData.usuarioModificacion === 'string') ? apiData.usuarioModificacion : undefined
          };
          
          console.log(`✅ [CalleService] Calle ${index} normalizada:`, resultado);
          return resultado;
        },
        
        extractArray: (response: any): any[] => {
          console.log('🔍 [CalleService] Extrayendo array de respuesta:', response);
          
          // 🔥 MANEJAR ESTRUCTURA ESPECÍFICA DEL API: {success, message, data}
          if (response && typeof response === 'object' && response !== null) {
            // Verificar si tiene la estructura esperada del API
            if (response.success === true && Array.isArray(response.data)) {
              console.log(`✅ [CalleService] Array encontrado en 'data' con ${response.data.length} elementos`);
              return response.data.filter(item => item !== null && item !== undefined); // ✅ Filtrar nulls
            }
            
            // Si no, buscar en otras propiedades comunes
            const possibleArrays = ['data', 'items', 'results', 'content', 'vias', 'calles'];
            for (const prop of possibleArrays) {
              if (Array.isArray(response[prop])) {
                console.log(`✅ [CalleService] Array encontrado en propiedad '${prop}' con ${response[prop].length} elementos`);
                return response[prop].filter(item => item !== null && item !== undefined); // ✅ Filtrar nulls
              }
            }
          }
          
          // Si la respuesta ya es un array, devolverlo (filtrado)
          if (Array.isArray(response)) {
            console.log(`✅ [CalleService] Respuesta es array directo con ${response.length} elementos`);
            return response.filter(item => item !== null && item !== undefined); // ✅ Filtrar nulls
          }
          
          console.warn('⚠️ [CalleService] No se encontró array válido en la respuesta');
          return [];
        },
        
        validateItem: (calle: Calle): boolean => {
          // 🔥 VALIDACIÓN MÁS PERMISIVA PERO SEGURA
          try {
            const tieneNombreValido = calle && 
              calle.nombre && 
              typeof calle.nombre === 'string' &&
              calle.nombre.trim().length > 0 &&
              !calle.nombre.includes('sin nombre');
            
            const tieneTipoViValido = calle && 
              calle.tipoVia && 
              typeof calle.tipoVia === 'string' &&
              calle.tipoVia.trim().length > 0;
            
            const tieneSectorValido = calle && 
              typeof calle.sectorId === 'number' && 
              calle.sectorId > 0;
            
            const tieneBarrioValido = calle && 
              typeof calle.barrioId === 'number' && 
              calle.barrioId > 0;
            
            const esValido = tieneNombreValido && tieneTipoViValido && tieneSectorValido && tieneBarrioValido;
            
            if (!esValido) {
              console.warn(`⚠️ [CalleService] Calle inválida:`, {
                nombre: calle?.nombre || 'null/undefined',
                tipoVia: calle?.tipoVia || 'null/undefined',
                sectorId: calle?.sectorId || 'null/undefined',
                barrioId: calle?.barrioId || 'null/undefined',
                tieneNombreValido,
                tieneTipoViValido,
                tieneSectorValido,
                tieneBarrioValido
              });
            } else {
              console.log(`✅ [CalleService] Calle válida: ${calle.tipoVia} ${calle.nombre}`);
            }
            
            return esValido;
          } catch (error) {
            console.error('❌ [CalleService] Error al validar calle:', error, calle);
            return false;
          }
        }
      }
    );
  }
  
  // Override del método create para mapear correctamente los campos
  async create(data: CalleFormData): Promise<Calle> {
    try {
      // ✅ VALIDACIÓN PREVIA ANTES DE ENVIAR
      if (!data || typeof data !== 'object') {
        throw new Error('Datos de calle inválidos');
      }
      
      if (!data.sectorId || data.sectorId <= 0) {
        throw new Error('Debe proporcionar un sectorId válido');
      }
      
      if (!data.barrioId || data.barrioId <= 0) {
        throw new Error('Debe proporcionar un barrioId válido');
      }
      
      if (!data.tipoVia || typeof data.tipoVia !== 'string' || data.tipoVia.trim() === '') {
        throw new Error('Debe proporcionar un tipo de vía válido');
      }
      
      if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
        throw new Error('Debe proporcionar un nombre válido');
      }
      
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
        nombreVia: data.nombre.trim(),
        codSector: data.sectorId,
        codBarrio: data.barrioId
      };
      
      console.log('📤 [CalleService] Creando calle:', requestData);
      return super.create(requestData as any);
    } catch (error) {
      console.error('❌ [CalleService] Error en create:', error);
      throw error;
    }
  }
  
  // Override del método update para mapear correctamente los campos
  async update(id: number, data: CalleFormData): Promise<Calle> {
    try {
      // ✅ VALIDACIÓN PREVIA ANTES DE ENVIAR
      if (!id || id <= 0) {
        throw new Error('ID de calle inválido');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Datos de calle inválidos');
      }
      
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
        nombreVia: data.nombre.trim(),
        codSector: data.sectorId,
        codBarrio: data.barrioId
      };
      
      console.log(`📤 [CalleService] Actualizando calle ${id}:`, requestData);
      return super.update(id, requestData as any);
    } catch (error) {
      console.error(`❌ [CalleService] Error en update ${id}:`, error);
      throw error;
    }
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
  
  // ✅ MÉTODO ADICIONAL PARA LIMPIAR DATOS ANTES DE PROCESAR
  private cleanApiData(data: any): any {
    if (!data || typeof data !== 'object') {
      return null;
    }
    
    // Crear copia limpia del objeto
    const cleaned: any = {};
    
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        // Solo asignar si no es null/undefined
        if (value !== null && value !== undefined) {
          cleaned[key] = value;
        }
      }
    }
    
    return cleaned;
  }
}

// Exportar instancia singleton
const CalleService = new CalleServiceClass();
export default CalleService;

// Exportar también la clase para casos donde se necesite múltiples instancias
export { CalleServiceClass };