// src/services/barrioService.ts
import { Barrio, BarrioFormData } from '../models/Barrio';

// URL base para la API de barrios - USAR URL COMPLETA desde constants.ts
const API_URL = 'http://localhost:8080/api/barrio';

/**
 * Servicio para la gestión de barrios
 * Versión para acceso directo al backend sin autenticación
 */
export class BarrioService {
  /**
   * Obtener todos los barrios
   */
  static async getAll(): Promise<Barrio[]> {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit' // Importante: omitir credenciales para evitar problemas CORS
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener barrios:', error);
      throw error;
    }
  }

  /**
   * Obtener un barrio por ID
   */
  static async getById(id: number): Promise<Barrio> {
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
      console.error(`Error al obtener barrio ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo barrio
   */
  static async create(data: BarrioFormData): Promise<Barrio> {
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
      console.error('Error al crear barrio:', error);
      throw error;
    }
  }

  /**
   * Actualizar un barrio existente
   */
  static async update(id: number, data: BarrioFormData): Promise<Barrio> {
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
      console.error(`Error al actualizar barrio ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un barrio
   */
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
      console.error(`Error al eliminar barrio ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar barrios
   */
  static async search(term: string): Promise<Barrio[]> {
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(term)}`, {
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
      console.error(`Error al buscar barrios con término "${term}":`, error);
      throw error;
    }
  }
}

export default BarrioService;