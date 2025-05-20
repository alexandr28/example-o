// src/services/calleApiService.ts
import { Calle, CalleFormData } from '../models/Calle';

// URL base para la API de vías - USAR URL COMPLETA
const API_URL = 'http://localhost:8080/api/via';

/**
 * Servicio para gestionar las peticiones a la API de Vías
 * Versión para acceso directo al backend
 */
export const CalleApiService = {
  /**
   * Obtener todas las vías
   */
  getAll: async (): Promise<Calle[]> => {
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
      
      // Verificar si la respuesta tiene un formato específico
      const data = await response.json();
      if (data.data !== undefined) {
        // Si la API devuelve los datos en un campo 'data'
        return data.data || [];
      } else if (Array.isArray(data)) {
        // Si la API devuelve directamente un array
        return data;
      } else {
        // Otro formato
        console.warn('Formato de respuesta no esperado:', data);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener vías:', error);
      throw error;
    }
  },

  // ... resto de métodos con la misma modificación
};

export default CalleApiService;