// src/services/barrioService.ts
import { Barrio, BarrioFormData } from '../models/Barrio';

// URL base para la API de barrios - USAR URL COMPLETA
const API_URL = 'http://localhost:8080/api/barrio';

/**
 * Servicio para la gestión de barrios
 * Versión para acceso directo al backend
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
        credentials: 'omit'
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

  // ... resto de métodos con la misma modificación
};

export default BarrioService;