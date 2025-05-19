import { Barrio, BarrioFormData } from '../models';
import { API_ENDPOINTS } from '../config/constants';

/**
 * Servicio para la gestión de barrios
 * 
 * Proporciona métodos para realizar operaciones CRUD contra la API de barrios
 */
export class BarrioService {
  private baseUrl: string;
  
  constructor(baseUrl = API_ENDPOINTS.BARRIO) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtener todos los barrios
   */
  async getAll(): Promise<Barrio[]> {
    try {
      const response = await fetch(this.baseUrl);
      
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
   * Obtener un barrio por su ID
   */
  async getById(id: number): Promise<Barrio> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener barrio con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo barrio
   */
  async create(barrio: BarrioFormData): Promise<Barrio> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(barrio),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
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
  async update(id: number, barrio: BarrioFormData): Promise<Barrio> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(barrio),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar barrio con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un barrio
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error al eliminar barrio con ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Buscar barrios por nombre o sector
   */
  async search(term: string): Promise<Barrio[]> {
    try {
      const params = new URLSearchParams({ search: term });
      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
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

// Exportar una instancia por defecto
export const barrioService = new BarrioService();