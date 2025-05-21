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
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('Respuesta recibida:', response.status, response.statusText);
    
    if (!response.ok) {
      // Manejar error...
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // Obtener el cuerpo de la respuesta y mostrarlo completo
    const responseText = await response.text();
    console.log('Respuesta completa:', responseText);
    
    // Convertir el texto a JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      throw new Error('La respuesta no es un JSON válido');
    }
    
    console.log('Datos procesados como JSON:', data);
    
    // Verificar la estructura exacta de la respuesta
    if (Array.isArray(data)) {
      console.log('La respuesta es un array');
      // Revisar la estructura exacta del primer elemento (si existe)
      if (data.length > 0) {
        console.log('Estructura del primer elemento:', JSON.stringify(data[0], null, 2));
      }
      
      // Verificar cada elemento del array
      const sectores = data.map((item, index) => {
        // Verificar que el item sea un objeto
        if (typeof item !== 'object' || item === null) {
          console.log(`Item ${index} no es un objeto:`, item);
          return { id: index + 1, nombre: `Sector ${index + 1}` };
        }
        
        // Buscar dónde está el nombre, podría estar en diferentes propiedades
        let nombre = null;
        
        // Verificar propiedades comunes donde podría estar el nombre
        if (item.nombre) nombre = item.nombre;
        else if (item.name) nombre = item.name;
        else if (item.descripcion) nombre = item.descripcion;
        else if (item.description) nombre = item.description;
        else if (item.text) nombre = item.text;
        else if (item.value) nombre = item.value;
        
        // Si no se encontró ninguna propiedad que pueda ser el nombre, 
        // imprimir todas las propiedades del objeto para análisis
        if (!nombre) {
          console.log(`No se encontró nombre para el item ${index}, propiedades disponibles:`, 
            Object.keys(item));
          
          // Si hay alguna propiedad de tipo string, usarla como nombre
          const stringProps = Object.entries(item)
            .filter(([_, value]) => typeof value === 'string')
            .map(([key, value]) => ({ key, value }));
            
          if (stringProps.length > 0) {
            console.log('Propiedades string disponibles:', stringProps);
            // Usar la primera propiedad string como nombre
            nombre = stringProps[0].value;
          } else {
            nombre = `Sector ${index + 1}`;
          }
        }
        
        // Verificar si tiene ID
        let id = null;
        if (item.id !== undefined) id = item.id;
        else if (item.codigo !== undefined) id = item.codigo;
        else if (item.code !== undefined) id = item.code;
        else id = index + 1;
        
        return {
          id: id,
          nombre: nombre
        };
      });
      
      return sectores;
    } else if (data && typeof data === 'object') {
      console.log('La respuesta es un objeto. Propiedades:', Object.keys(data));
      
      // Intentar encontrar un array en las propiedades del objeto
      let sectoresArray = null;
      
      // Buscar en propiedades comunes
      if (Array.isArray(data.data)) sectoresArray = data.data;
      else if (Array.isArray(data.sectores)) sectoresArray = data.sectores;
      else if (Array.isArray(data.items)) sectoresArray = data.items;
      else if (Array.isArray(data.results)) sectoresArray = data.results;
      else if (Array.isArray(data.resultado)) sectoresArray = data.resultado;
      
      if (sectoresArray) {
        console.log('Se encontró un array en la propiedad:', 
          Object.keys(data).find(key => Array.isArray(data[key])));
        
        // Procesar el array encontrado (usando la misma lógica de arriba)
        return sectoresArray.map((item, index) => {
          // (mismo código de procesamiento que arriba)
          // ...
        });
      } else {
        // Si no hay un array, tratar de convertir las propiedades a un array
        const sectores = Object.entries(data).map(([key, value], index) => {
          if (typeof value === 'object' && value !== null) {
            // Si el valor es un objeto, intentar extraer nombre e id
            let nombre = null;
            if (value.nombre) nombre = value.nombre;
            else if (value.name) nombre = value.name;
            else nombre = key; // Usar la clave como nombre
            
            let id = null;
            if (value.id !== undefined) id = value.id;
            else id = index + 1;
            
            return { id, nombre };
          } else if (typeof value === 'string') {
            // Si el valor es una string, usarla como nombre
            return { id: index + 1, nombre: value };
          } else {
            // Caso por defecto
            return { id: index + 1, nombre: `Sector ${index + 1}` };
          }
        });
        
        return sectores;
      }
    } else {
      console.error('Estructura de datos desconocida:', data);
      return [];
    }
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
    // Obtener token de autenticación si existe
    const token = localStorage.getItem('auth_token');
    
    console.log(`Actualizando sector ID ${id} con datos:`, data);
    console.log('Token disponible:', token ? 'Sí' : 'No');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Añadir token de autorización si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
      mode: 'cors',
      credentials: 'include' // Cambiar a 'include' para enviar cookies si es necesario
    });
    
    console.log('Respuesta de actualización:', response.status, response.statusText);
    
    if (!response.ok) {
      // Intentar obtener más detalles sobre el error
      let errorMsg = `Error HTTP: ${response.status}`;
      try {
        const errorDetails = await response.text();
        console.error('Detalles del error:', errorDetails);
        errorMsg += ` - ${errorDetails}`;
      } catch (e) {
        console.error('No se pudo leer el cuerpo de la respuesta');
      }
      
      throw new Error(errorMsg);
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