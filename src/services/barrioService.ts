// src/services/barrioService.ts - versión con normalización de datos

import { Barrio, BarrioFormData } from '../models/Barrio';

const API_URL = 'http://192.168.20.160:8080/api/barrio';

/**
 * Función para normalizar los datos de barrio que vienen de la API
 */
const normalizeBarrioData = (apiBarrio: any): Barrio => {
  return {
    id: apiBarrio.codBarrio || apiBarrio.id,
    codBarrio: apiBarrio.codBarrio,
    nombre: apiBarrio.nombreBarrio || apiBarrio.nombre, // Normalizar el nombre
    nombreBarrio: apiBarrio.nombreBarrio,
    sectorId: apiBarrio.sectorId || apiBarrio.sector?.id || 0,
    sector: apiBarrio.sector,
    estado: apiBarrio.estado,
    fechaCreacion: apiBarrio.fechaCreacion ? new Date(apiBarrio.fechaCreacion) : undefined,
    fechaModificacion: apiBarrio.fechaModificacion ? new Date(apiBarrio.fechaModificacion) : undefined,
    usuarioCreacion: apiBarrio.usuarioCreacion,
    usuarioModificacion: apiBarrio.usuarioModificacion
  };
};

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
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log('🔍 Datos crudos de la API:', rawData);
      
      // Normalizar los datos
      const normalizedData = Array.isArray(rawData) 
        ? rawData.map(normalizeBarrioData)
        : [];
      
      console.log('✅ Datos normalizados:', normalizedData);
      
      return normalizedData;
    } catch (error) {
      console.error('Error al obtener barrios:', error);
      throw error;
    }
  }

  // ... resto de métodos también normalizando datos
  
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
      
      const rawData = await response.json();
      return normalizeBarrioData(rawData);
    } catch (error) {
      console.error(`Error al obtener barrio ID ${id}:`, error);
      throw error;
    }
  }

  static async create(data: BarrioFormData): Promise<Barrio> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombreBarrio: data.nombre, // Mapear nombre a nombreBarrio para la API
          sectorId: data.sectorId
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const rawData = await response.json();
      return normalizeBarrioData(rawData);
    } catch (error) {
      console.error('Error al crear barrio:', error);
      throw error;
    }
  }

  static async update(id: number, data: BarrioFormData): Promise<Barrio> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombreBarrio: data.nombre, // Mapear nombre a nombreBarrio para la API
          sectorId: data.sectorId
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const rawData = await response.json();
      return normalizeBarrioData(rawData);
    } catch (error) {
      console.error(`Error al actualizar barrio ID ${id}:`, error);
      throw error;
    }
  }

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
      
      const rawData = await response.json();
      return Array.isArray(rawData) ? rawData.map(normalizeBarrioData) : [];
    } catch (error) {
      console.error(`Error al buscar barrios con término "${term}":`, error);
      throw error;
    }
  }
}

export default BarrioService;