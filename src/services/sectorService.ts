// src/services/sectorService.ts
import { Sector, SectorFormData } from '../models/Sector';

// URL base para la API de sectores - USAR URL COMPLETA
const API_URL = 'http://localhost:8080/api/sector';

/**
 * Servicio centralizado para operaciones con sectores
 * Versión para acceso directo al backend
 */
export class SectorService {
  // Obtener todos los sectores
  static async getAll(): Promise<Sector[]> {
    try {
      console.log('Iniciando petición GET a:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Configuración para CORS
        mode: 'cors',
        credentials: 'omit' // No enviar cookies ni credenciales
      });
      
      console.log('Respuesta recibida:', response.status, response.statusText);
      
      if (!response.ok) {
        // Intentar leer el cuerpo de la respuesta para más detalles
        let errorMsg = `Error HTTP: ${response.status}`;
        try {
          const errorBody = await response.text();
          console.error('Cuerpo de la respuesta de error:', errorBody);
          errorMsg += ` - ${errorBody}`;
        } catch (e) {
          console.error('No se pudo leer el cuerpo de la respuesta de error');
        }
        
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener sectores:', error);
      throw error;
    }
  }

  // Obtener un sector por ID
  static async getById(id: number): Promise<Sector> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener sector ID ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo sector
  static async create(data: SectorFormData): Promise<Sector> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear sector:', error);
      throw error;
    }
  }

  // Actualizar un sector existente
  static async update(id: number, data: SectorFormData): Promise<Sector> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar sector ID ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un sector
  static async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error al eliminar sector ID ${id}:`, error);
      throw error;
    }
  }
}

export default SectorService;