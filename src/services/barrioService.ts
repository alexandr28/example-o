// src/services/barrioService.ts - CORREGIDO PARA MANEJAR SECTOR NULL
import { BaseApiService } from './BaseApiService';
import { Barrio, BarrioFormData } from '../models/Barrio';

class BarrioServiceClass extends BaseApiService<Barrio, BarrioFormData> {
  constructor() {
    super(
      {
        baseUrl: '', // ✅ PROXY LOCAL - Vite redirigirá automáticamente
        endpoint: '/api/barrio' // ✅ /api/barrio -> http://192.168.20.160:8080/api/barrio
      },
      {
        normalizeItem: (apiData: any, index: number): Barrio => {
          console.log(`🔍 [BarrioService] Normalizando item ${index}:`, apiData);
          
          // Si el dato es null/undefined, crear uno por defecto
          if (!apiData || typeof apiData !== 'object') {
            console.warn(`⚠️ [BarrioService] Dato inválido en índice ${index}:`, apiData);
            return {
              id: index + 1000,
              nombre: `Barrio ${index + 1} (datos inválidos)`,
              sectorId: 0
            };
          }
          
          // Extraer ID - usar codBarrio como ID principal
          let barrioId: number;
          if (typeof apiData.codBarrio === 'number') {
            barrioId = apiData.codBarrio;
          } else if (typeof apiData.id === 'number') {
            barrioId = apiData.id;
          } else {
            barrioId = index + 1;
          }
          
          // Extraer nombre
          let barrioNombre: string;
          if (typeof apiData.nombreBarrio === 'string' && apiData.nombreBarrio.trim()) {
            barrioNombre = apiData.nombreBarrio.trim();
          } else if (typeof apiData.nombre === 'string' && apiData.nombre.trim()) {
            barrioNombre = apiData.nombre.trim();
          } else {
            console.warn(`⚠️ [BarrioService] No se encontró nombre válido para barrio ${barrioId}`);
            barrioNombre = `Barrio ${barrioId}`;
          }
          
          // 🔥 MANEJO ESPECIAL PARA SECTOR NULL/UNDEFINED
          let sectorId: number = 1; // ✅ Valor por defecto si no hay sector
          
          if (apiData.sector && typeof apiData.sector === 'object' && apiData.sector.id) {
            sectorId = apiData.sector.id;
          } else if (typeof apiData.sectorId === 'number' && apiData.sectorId > 0) {
            sectorId = apiData.sectorId;
          } else {
            // Si sector es null, asignar a un sector por defecto
            console.warn(`⚠️ [BarrioService] Sector null para barrio ${barrioNombre}, asignando sector por defecto`);
            sectorId = 1; // O el ID del sector "Sin Sector" que deberías crear
          }
          
          const resultado: Barrio = {
            id: barrioId,
            codBarrio: apiData.codBarrio,
            nombre: barrioNombre,
            nombreBarrio: apiData.nombreBarrio,
            sectorId: sectorId,
            sector: apiData.sector, // Puede ser null, no importa
            estado: apiData.estado !== false, // ✅ Por defecto true si no está definido
            fechaCreacion: apiData.fechaCreacion,
            fechaModificacion: apiData.fechaModificacion,
            usuarioCreacion: apiData.usuarioCreacion,
            usuarioModificacion: apiData.usuarioModificacion
          };
          
          console.log(`✅ [BarrioService] Barrio ${index} normalizado:`, resultado);
          return resultado;
        },
        
        extractArray: (response: any): any[] => {
          console.log('🔍 [BarrioService] Extrayendo array de respuesta:', response);
          
          // Si la respuesta ya es un array, devolverlo
          if (Array.isArray(response)) {
            console.log(`✅ [BarrioService] Respuesta es array con ${response.length} elementos`);
            return response;
          }
          
          // Intentar extraer de propiedades comunes
          if (response && typeof response === 'object') {
            const possibleArrays = ['data', 'items', 'results', 'content', 'barrios'];
            
            for (const prop of possibleArrays) {
              if (Array.isArray(response[prop])) {
                console.log(`✅ [BarrioService] Array encontrado en propiedad '${prop}' con ${response[prop].length} elementos`);
                return response[prop];
              }
            }
          }
          
          console.warn('⚠️ [BarrioService] No se encontró array válido, devolviendo array vacío');
          return [];
        },
        
        validateItem: (barrio: Barrio): boolean => {
          // 🔥 VALIDACIÓN MÁS PERMISIVA
          const tieneNombreValido = barrio.nombre && 
            !barrio.nombre.includes('(datos inválidos)') &&
            barrio.nombre.trim().length > 0;
          
          const tieneSectorValido = barrio.sectorId > 0; // Solo verificar que sea mayor a 0
          
          const esValido = tieneNombreValido && tieneSectorValido;
          
          if (!esValido) {
            console.warn(`⚠️ [BarrioService] Barrio inválido:`, {
              nombre: barrio.nombre,
              sectorId: barrio.sectorId,
              tieneNombreValido,
              tieneSectorValido
            });
          } else {
            console.log(`✅ [BarrioService] Barrio válido: ${barrio.nombre} (Sector: ${barrio.sectorId})`);
          }
          
          return esValido;
        }
      }
    );
  }
  
  // Override del método create para mapear correctamente los campos
  async create(data: BarrioFormData): Promise<Barrio> {
    const requestData = {
      nombreBarrio: data.nombre,
      sectorId: data.sectorId
    };
    
    console.log('📤 [BarrioService] Creando barrio:', requestData);
    return super.create(requestData as any);
  }
  
  // Override del método update para mapear correctamente los campos
  async update(id: number, data: BarrioFormData): Promise<Barrio> {
    const requestData = {
      nombreBarrio: data.nombre,
      sectorId: data.sectorId
    };
    
    console.log(`📤 [BarrioService] Actualizando barrio ${id}:`, requestData);
    return super.update(id, requestData as any);
  }
}

// Exportar instancia singleton
const BarrioService = new BarrioServiceClass();
export default BarrioService;