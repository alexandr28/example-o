// src/services/sectorService.ts - CORREGIDO SIN AUTENTICACIÓN
import { Sector, SectorFormData } from '../models/Sector';

// URL base para la API de sectores
const API_URL = 'http://localhost:8080/api/sector';

/**
 * Servicio centralizado para operaciones con sectores
 * VERSIÓN SIN AUTENTICACIÓN - Todos los métodos funcionan sin token
 */
export class SectorService {
  // Obtener todos los sectores
  static async getAll(): Promise<Sector[]> {
    try {
      console.log('📡 GET Sectores - Iniciando petición a:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // NO incluir Authorization header
        },
        mode: 'cors',
        credentials: 'omit' // Importante: no enviar cookies
      });
      
      console.log('📡 GET Sectores - Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📡 GET Sectores - Respuesta texto:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        throw new Error('Respuesta no es JSON válido');
      }
      
      console.log('📡 GET Sectores - Datos procesados:', data);
      
      if (Array.isArray(data)) {
        return data.map((item, index) => {
          if (!item || typeof item !== 'object') {
            return { id: index + 1, nombre: `Sector ${index + 1}` };
          }
          
          return {
            id: item.id || item.codigo || index + 1,
            nombre: item.nombre || item.name || item.descripcion || `Sector ${index + 1}`
          };
        });
      } else if (data && typeof data === 'object') {
        // Si es un objeto, buscar array dentro
        const sectoresArray = data.data || data.sectores || data.items || data.results;
        if (Array.isArray(sectoresArray)) {
          return sectoresArray.map((item, index) => ({
            id: item.id || item.codigo || index + 1,
            nombre: item.nombre || item.name || `Sector ${index + 1}`
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error al obtener sectores:', error);
      throw error;
    }
  }

  // Obtener un sector por ID
  static async getById(id: number): Promise<Sector> {
    try {
      console.log(`📡 GET Sector ID ${id} - Iniciando petición`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // NO incluir Authorization header
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 GET Sector ID ${id} - Respuesta:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        id: data.id || data.codigo || id,
        nombre: data.nombre || data.name || data.descripcion || `Sector ${id}`
      };
    } catch (error) {
      console.error(`❌ Error al obtener sector ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo sector - SIN AUTENTICACIÓN
  static async create(data: SectorFormData): Promise<Sector> {
    try {
      console.log('📡 POST Sector - Iniciando creación:', data);
      console.log('📡 POST Sector - URL:', API_URL);
      
      // 🚨 IMPORTANTE: Headers sin Authorization
      const headers = {
        'Content-Type': 'application/json',
        // NO incluir Authorization: Bearer token aquí
      };
      
      console.log('📡 POST Sector - Headers:', headers);
      
      const requestBody = JSON.stringify({
        nombre: data.nombre // Mapear correctamente según tu API
      });
      
      console.log('📡 POST Sector - Body:', requestBody);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: headers,
        body: requestBody,
        mode: 'cors',
        credentials: 'omit' // No enviar cookies ni credenciales
      });
      
      console.log('📡 POST Sector - Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        // Obtener más detalles del error
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error('📡 POST Sector - Error detallado:', errorText);
          
          // Intentar parsear como JSON
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            // Si no es JSON, usar el texto tal como está
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
      console.log('📡 POST Sector - Datos de respuesta:', responseData);
      
      return {
        id: responseData.id || responseData.codigo || Math.random(),
        nombre: responseData.nombre || responseData.name || data.nombre
      };
    } catch (error) {
      console.error('❌ Error al crear sector:', error);
      throw error;
    }
  }

  // Actualizar un sector existente - SIN AUTENTICACIÓN
  static async update(id: number, data: SectorFormData): Promise<Sector> {
    try {
      console.log(`📡 PUT Sector ID ${id} - Iniciando actualización:`, data);
      
      // 🚨 IMPORTANTE: Headers sin Authorization
      const headers = {
        'Content-Type': 'application/json',
        // NO incluir Authorization: Bearer token aquí
      };
      
      console.log(`📡 PUT Sector ID ${id} - Headers:`, headers);
      
      const requestBody = JSON.stringify({
        nombre: data.nombre
      });
      
      console.log(`📡 PUT Sector ID ${id} - Body:`, requestBody);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: headers,
        body: requestBody,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 PUT Sector ID ${id} - Respuesta:`, response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorDetails = await response.text();
          console.error(`📡 PUT Sector ID ${id} - Error:`, errorDetails);
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        } catch (e) {
          console.error('No se pudo leer detalles del error');
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log(`📡 PUT Sector ID ${id} - Éxito:`, responseData);
      
      return {
        id: responseData.id || responseData.codigo || id,
        nombre: responseData.nombre || responseData.name || data.nombre
      };
    } catch (error) {
      console.error(`❌ Error al actualizar sector ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un sector - SIN AUTENTICACIÓN
  static async delete(id: number): Promise<void> {
    try {
      console.log(`📡 DELETE Sector ID ${id} - Iniciando eliminación`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // NO incluir Authorization header
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 DELETE Sector ID ${id} - Respuesta:`, response.status);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorDetails = await response.text();
          console.error(`📡 DELETE Sector ID ${id} - Error:`, errorDetails);
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        } catch (e) {
          console.error('No se pudo leer detalles del error');
        }
        
        throw new Error(errorMessage);
      }
      
      console.log(`📡 DELETE Sector ID ${id} - Éxito`);
    } catch (error) {
      console.error(`❌ Error al eliminar sector ID ${id}:`, error);
      throw error;
    }
  }
}

export default SectorService;