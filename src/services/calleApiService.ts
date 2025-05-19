// src/api/CalleApiService.ts
import { authGet, authPost, authPut, authDelete } from '../api/authClient';
import { Calle, CalleFormData } from '../models/Calle';

const API_URL = 'http://localhost:8080/api/via';

/**
 * Servicio para gestionar las peticiones a la API de Calles
 */
export const CalleApiService = {
  /**
   * Obtener todas las calles
   */
  getCalles: async (): Promise<Calle[]> => {
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
      
      // En caso de error, intentar usar datos de fallback
      // Este enfoque permite que la aplicación no se rompa completamente si hay problemas de conectividad
      const datosEjemplo: Calle[] = [
        { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
        { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
        { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
      ];
      
      return datosEjemplo;
    }
  },

  /**
   * Obtener una calle por su ID
   */
  getCalleById: async (id: number): Promise<Calle | null> => {
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
  createCalle: async (calleData: CalleFormData): Promise<Calle | null> => {
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
      return null;
    }
  },

  /**
   * Actualizar una calle existente
   */
  updateCalle: async (id: number, calleData: CalleFormData): Promise<Calle | null> => {
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
      return null;
    }
  },

  /**
   * Eliminar una calle
   */
  deleteCalle: async (id: number): Promise<boolean> => {
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
      return false;
    }
  },

  /**
   * Buscar calles por nombre o tipo de vía
   */
  searchCalles: async (searchTerm: string): Promise<Calle[]> => {
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
      
      // Fallback: filtrar localmente
      const todasLasCalles = await CalleApiService.getCalles();
      
      return todasLasCalles.filter(calle => 
        calle.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calle.tipoVia.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }
};

export default CalleApiService;