// src/services/calleApiService.ts
import { authGet, authPost, authPut, authDelete } from '../api/authClient';
import { Calle, CalleFormData } from '../models/Calle';
import { API_ENDPOINTS } from '../config/constants';

// URL base para la API de calles
const API_URL = API_ENDPOINTS.VIA || '/api/via';

/**
 * Servicio para gestionar las peticiones a la API de Calles
 */
export const CalleApiService = {
  /**
   * Obtener todas las calles
   */
  getAll: async (): Promise<Calle[]> => {
    try {
      const response = await authGet(`${API_URL}`);
      
      // Verificar si la respuesta tiene un formato específico
      if (response.data !== undefined) {
        // Si la API devuelve los datos en un campo 'data'
        return response.data || [];
      } else if (Array.isArray(response)) {
        // Si la API devuelve directamente un array
        return response;
      } else {
        // Otro formato
        console.warn('Formato de respuesta no esperado:', response);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener calles:', error);
      throw error;
    }
  },

  /**
   * Obtener una calle por su ID
   */
  getById: async (id: number): Promise<Calle | null> => {
    try {
      const response = await authGet(`${API_URL}/${id}`);
      
      // Verificar si la respuesta tiene un formato específico
      if (response.data !== undefined) {
        return response.data || null;
      } else {
        return response || null;
      }
    } catch (error) {
      console.error(`Error al obtener calle con ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Crear una nueva calle
   */
  create: async (calleData: CalleFormData): Promise<Calle | null> => {
    try {
      const response = await authPost(`${API_URL}`, calleData);
      
      // Verificar si la respuesta tiene un formato específico
      if (response.data !== undefined) {
        return response.data || null;
      } else {
        return response || null;
      }
    } catch (error) {
      console.error('Error al crear calle:', error);
      throw error;
    }
  },

  /**
   * Actualizar una calle existente
   */
  update: async (id: number, calleData: CalleFormData): Promise<Calle | null> => {
    try {
      const response = await authPut(`${API_URL}/${id}`, calleData);
      
      // Verificar si la respuesta tiene un formato específico
      if (response.data !== undefined) {
        return response.data || null;
      } else {
        return response || null;
      }
    } catch (error) {
      console.error(`Error al actualizar calle con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una calle
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await authDelete(`${API_URL}/${id}`);
      
      // Verificamos si la respuesta tiene algún indicador de éxito
      // Algunas APIs devuelven un objeto con un campo success
      if (response && typeof response === 'object' && 'success' in response) {
        return !!response.success;
      }
      
      // Si no hay objeto de respuesta específico, asumimos que fue exitoso
      // ya que la función authDelete no lanzó una excepción
      return true;
    } catch (error) {
      console.error(`Error al eliminar calle con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar calles por nombre o tipo de vía
   */
  search: async (searchTerm: string): Promise<Calle[]> => {
    try {
      // Algunos endpoints de búsqueda usan /search, otros usan parámetros ?q=
      // Verificamos ambos métodos
      
      try {
        // Primer intento: usando parámetro de consulta
        const response = await authGet(`${API_URL}?q=${encodeURIComponent(searchTerm)}`);
        
        if (response.data !== undefined) {
          return response.data || [];
        } else if (Array.isArray(response)) {
          return response;
        }
      } catch (innerError) {
        console.warn('Error al buscar con ?q=, intentando con /search:', innerError);
      }
      
      // Segundo intento: usando endpoint de búsqueda
      const response = await authGet(`${API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data !== undefined) {
        return response.data || [];
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Formato de respuesta no esperado:', response);
        return [];
      }
    } catch (error) {
      console.error('Error al buscar calles:', error);
      throw error;
    }
  }
};

export default CalleApiService;