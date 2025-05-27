// src/services/sectorService.ts - CORREGIDO PARA MOSTRAR NOMBRES REALES
import { Sector, SectorFormData } from '../models/Sector';

// URL base para la API de sectores
const API_URL = 'http://192.168.20.160:8080/api/sector';

/**
 * Función para normalizar datos de sector de la API
 * Esta función maneja diferentes formatos de respuesta de la API
 */
const normalizeSectorData = (apiData: any, index: number = 0): Sector => {
  console.log(`🔍 [SectorService] Normalizando sector ${index}:`, apiData);
  
  // Si el dato es null/undefined, crear uno por defecto
  if (!apiData || typeof apiData !== 'object') {
    console.warn(`⚠️ [SectorService] Dato inválido en índice ${index}:`, apiData);
    return {
      id: index + 1000, // ID alto para evitar conflictos
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
  
  console.log(`✅ [SectorService] Sector ${index} normalizado:`, resultado);
  return resultado;
};

/**
 * Servicio centralizado para operaciones con sectores
 * VERSIÓN CORREGIDA CON MEJOR MANEJO DE DATOS
 */
export class SectorService {
  // Obtener todos los sectores
  static async getAll(): Promise<Sector[]> {
    try {
      console.log('📡 [SectorService] GET Sectores - Iniciando petición a:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 [SectorService] GET Sectores - Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // Obtener texto completo de la respuesta para debug
      const responseText = await response.text();
      console.log('📡 [SectorService] GET Sectores - Respuesta completa:', responseText);
      
      // Intentar parsear como JSON
      let rawData;
      try {
        rawData = JSON.parse(responseText);
        console.log('📡 [SectorService] GET Sectores - Datos parseados:', rawData);
      } catch (parseError) {
        console.error('❌ [SectorService] Error al parsear JSON:', parseError);
        console.error('❌ [SectorService] Texto que falló:', responseText);
        throw new Error('Respuesta no es JSON válido');
      }
      
      // Procesar diferentes formatos de respuesta
      let sectoresArray: any[];
      
      if (Array.isArray(rawData)) {
        console.log('📊 [SectorService] La respuesta es un array directo');
        sectoresArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
        console.log('📊 [SectorService] La respuesta es un objeto, buscando array...');
        
        // Buscar el array en diferentes propiedades comunes
        if (Array.isArray(rawData.data)) {
          console.log('📊 [SectorService] Array encontrado en rawData.data');
          sectoresArray = rawData.data;
        } else if (Array.isArray(rawData.sectores)) {
          console.log('📊 [SectorService] Array encontrado en rawData.sectores');
          sectoresArray = rawData.sectores;
        } else if (Array.isArray(rawData.items)) {
          console.log('📊 [SectorService] Array encontrado en rawData.items');
          sectoresArray = rawData.items;
        } else if (Array.isArray(rawData.results)) {
          console.log('📊 [SectorService] Array encontrado en rawData.results');
          sectoresArray = rawData.results;
        } else if (Array.isArray(rawData.content)) {
          console.log('📊 [SectorService] Array encontrado en rawData.content');
          sectoresArray = rawData.content;
        } else {
          console.warn('⚠️ [SectorService] No se encontró array en el objeto, intentando convertir...');
          
          // Último intento: convertir las propiedades del objeto en array
          const values = Object.values(rawData);
          const arrayLikeValues = values.filter(val => 
            val && typeof val === 'object' && !Array.isArray(val)
          );
          
          if (arrayLikeValues.length > 0) {
            sectoresArray = arrayLikeValues;
            console.log('📊 [SectorService] Creado array desde valores del objeto');
          } else {
            console.warn('⚠️ [SectorService] No se pudo extraer datos, devolviendo array vacío');
            sectoresArray = [];
          }
        }
      } else {
        console.warn('⚠️ [SectorService] Formato de respuesta desconocido:', typeof rawData);
        sectoresArray = [];
      }
      
      console.log('📊 [SectorService] Array final a procesar:', sectoresArray);
      console.log('📊 [SectorService] Cantidad de elementos:', sectoresArray.length);
      
      // Normalizar cada elemento del array
      const sectoresNormalizados = sectoresArray.map((item, index) => {
        return normalizeSectorData(item, index);
      });
      
      console.log('✅ [SectorService] Sectores normalizados finales:', sectoresNormalizados);
      
      // Filtrar sectores válidos (que tengan nombre real)
      const sectoresValidos = sectoresNormalizados.filter(sector => {
        const esValido = sector.nombre && !sector.nombre.includes('(datos inválidos)');
        if (!esValido) {
          console.warn(`⚠️ [SectorService] Sector inválido filtrado:`, sector);
        }
        return esValido;
      });
      
      console.log('✅ [SectorService] Sectores válidos finales:', sectoresValidos);
      
      return sectoresValidos;
      
    } catch (error) {
      console.error('❌ [SectorService] Error al obtener sectores:', error);
      throw error;
    }
  }

  // Resto de métodos sin cambios...
  static async getById(id: number): Promise<Sector> {
    try {
      console.log(`📡 [SectorService] GET Sector ID ${id} - Iniciando petición`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [SectorService] GET Sector ID ${id} - Respuesta:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log(`📡 [SectorService] GET Sector ID ${id} - Datos:`, rawData);
      
      return normalizeSectorData(rawData, 0);
    } catch (error) {
      console.error(`❌ [SectorService] Error al obtener sector ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo sector
  static async create(data: SectorFormData): Promise<Sector> {
    try {
      console.log('📡 [SectorService] POST Sector - Iniciando creación:', data);
      
      const requestBody = JSON.stringify({
        nombre: data.nombre
      });
      
      console.log('📡 [SectorService] POST Sector - Body:', requestBody);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 [SectorService] POST Sector - Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error('📡 [SectorService] POST Sector - Error detallado:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        } catch (e) {
          console.error('No se pudo leer el cuerpo del error');
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('📡 [SectorService] POST Sector - Datos de respuesta:', responseData);
      
      return normalizeSectorData(responseData, 0);
    } catch (error) {
      console.error('❌ [SectorService] Error al crear sector:', error);
      throw error;
    }
  }

  // Actualizar un sector existente
  static async update(id: number, data: SectorFormData): Promise<Sector> {
    try {
      console.log(`📡 [SectorService] PUT Sector ID ${id} - Iniciando actualización:`, data);
      
      const requestBody = JSON.stringify({
        nombre: data.nombre
      });
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [SectorService] PUT Sector ID ${id} - Respuesta:`, response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorDetails = await response.text();
          console.error(`📡 [SectorService] PUT Sector ID ${id} - Error:`, errorDetails);
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        } catch (e) {
          console.error('No se pudo leer detalles del error');
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log(`📡 [SectorService] PUT Sector ID ${id} - Éxito:`, responseData);
      
      return normalizeSectorData(responseData, 0);
    } catch (error) {
      console.error(`❌ [SectorService] Error al actualizar sector ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un sector
  static async delete(id: number): Promise<void> {
    try {
      console.log(`📡 [SectorService] DELETE Sector ID ${id} - Iniciando eliminación`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [SectorService] DELETE Sector ID ${id} - Respuesta:`, response.status);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorDetails = await response.text();
          console.error(`📡 [SectorService] DELETE Sector ID ${id} - Error:`, errorDetails);
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        } catch (e) {
          console.error('No se pudo leer detalles del error');
        }
        
        throw new Error(errorMessage);
      }
      
      console.log(`📡 [SectorService] DELETE Sector ID ${id} - Éxito`);
    } catch (error) {
      console.error(`❌ [SectorService] Error al eliminar sector ID ${id}:`, error);
      throw error;
    }
  }
}

export default SectorService;