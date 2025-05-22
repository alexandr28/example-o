// src/services/calleApiService.ts
import { Calle, CalleFormData } from '../models/Calle';

// URL base para la API
const API_URL = 'http://localhost:8080/api/via';

/**
 * Servicio para gestionar las peticiones a la API de Vías/Calles
 * Versión mejorada con mejor manejo de errores y logging
 */
export const CalleApiService = {
  /**
   * Obtener todas las vías/calles
   */
  getAll: async (): Promise<Calle[]> => {
    try {
      console.log('📡 Iniciando petición GET a:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 Respuesta recibida:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      // Para debug, obtener la respuesta como texto primero
      const responseText = await response.text();
      console.log('📡 Respuesta texto completa:', responseText);
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📡 Datos parseados como JSON:', data);
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta como JSON:', parseError);
        throw new Error('La respuesta no es un JSON válido');
      }
      
      // Verificar la estructura de la respuesta
      if (Array.isArray(data)) {
        console.log('📡 La respuesta es un array con', data.length, 'elementos');
        // La API devuelve directamente un array de calles
        return data;
      } else if (data && typeof data === 'object') {
        console.log('📡 La respuesta es un objeto con propiedades:', Object.keys(data));
        
        // Intentar extraer el array de datos
        if (data.data && Array.isArray(data.data)) {
          console.log('📡 Extrayendo array desde data.data');
          return data.data;
        } else if (data.items && Array.isArray(data.items)) {
          console.log('📡 Extrayendo array desde data.items');
          return data.items;
        } else if (data.results && Array.isArray(data.results)) {
          console.log('📡 Extrayendo array desde data.results');
          return data.results;
        } else {
          // Si no encontramos un array, intentar convertir el objeto a un array
          console.log('📡 Intentando convertir objeto a array');
          const calles = Object.values(data).filter(val => 
            typeof val === 'object' && val !== null && 'nombre' in val
          );
          
          if (calles.length > 0) {
            return calles as Calle[];
          }
          
          // Si no hay manera de extraer un array, devolver array vacío
          console.warn('⚠️ No se pudo extraer un array de calles de la respuesta');
          return [];
        }
      } else {
        console.warn('⚠️ Formato de respuesta inesperado');
        return [];
      }
    } catch (error) {
      console.error('❌ Error en getAll:', error);
      throw error;
    }
  },

  // Resto de métodos del servicio
  // ...
};

export default CalleApiService;