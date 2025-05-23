// src/services/calleApiService.ts - CORREGIDO PARA MOSTRAR NOMBRES REALES
import { Calle, CalleFormData } from '../models/Calle';

// URL base para la API
const API_URL = 'http://localhost:8080/api/via';

/**
 * Función para normalizar los datos de calle que vienen de la API
 * Basado en la respuesta que vemos en consola
 */
const normalizeCalleData = (apiData: any, index: number = 0): Calle => {
  console.log(`🔍 [CalleService] Normalizando calle ${index}:`, apiData);
  
  // Si el dato es null/undefined, crear uno por defecto
  if (!apiData || typeof apiData !== 'object') {
    console.warn(`⚠️ [CalleService] Dato inválido en índice ${index}:`, apiData);
    return {
      id: index + 1000,
      tipoVia: 'calle',
      nombre: `Calle sin nombre ${index + 1}`
    };
  }
  
  // Intentar extraer el ID de diferentes campos posibles
  let calleId: number;
  if (typeof apiData.codTipoVia === 'number') {
    calleId = apiData.codTipoVia;
  } else if (typeof apiData.id === 'number') {
    calleId = apiData.id;
  } else if (typeof apiData.codigo === 'number') {
    calleId = apiData.codigo;
  } else {
    calleId = index + 1;
  }
  
  // ⚠️ CLAVE: Extraer el tipo de vía correctamente
  let tipoVia: string = 'calle'; // valor por defecto
  if (typeof apiData.tipoVia === 'string' && apiData.tipoVia.trim()) {
    tipoVia = apiData.tipoVia.trim().toLowerCase();
  } else if (typeof apiData.tipo === 'string' && apiData.tipo.trim()) {
    tipoVia = apiData.tipo.trim().toLowerCase();
  } else if (typeof apiData.descripTipoVia === 'string' && apiData.descripTipoVia.trim()) {
    // Mapear descripciones a tipos
    const desc = apiData.descripTipoVia.trim().toLowerCase();
    if (desc.includes('avenida')) tipoVia = 'avenida';
    else if (desc.includes('jiron') || desc.includes('jirón')) tipoVia = 'jiron';
    else if (desc.includes('pasaje')) tipoVia = 'pasaje';
    else tipoVia = 'calle';
  }
  
  // ⚠️ CLAVE: Extraer el nombre correctamente - basado en la respuesta de la API
  let nombreVia: string;
  
  // Según la respuesta de la API, el campo se llama 'nombreVia'
  if (typeof apiData.nombreVia === 'string' && apiData.nombreVia.trim()) {
    nombreVia = apiData.nombreVia.trim();
    console.log(`✅ [CalleService] Nombre extraído de 'nombreVia':`, nombreVia);
  } else if (typeof apiData.nombre === 'string' && apiData.nombre.trim()) {
    nombreVia = apiData.nombre.trim();
    console.log(`✅ [CalleService] Nombre extraído de 'nombre':`, nombreVia);
  } else if (typeof apiData.name === 'string' && apiData.name.trim()) {
    nombreVia = apiData.name.trim();
    console.log(`✅ [CalleService] Nombre extraído de 'name':`, nombreVia);
  } else if (typeof apiData.descripcion === 'string' && apiData.descripcion.trim()) {
    nombreVia = apiData.descripcion.trim();
    console.log(`✅ [CalleService] Nombre extraído de 'descripcion':`, nombreVia);
  } else {
    console.warn(`⚠️ [CalleService] No se encontró nombre válido para calle ${index}:`, apiData);
    console.warn(`⚠️ [CalleService] Campos disponibles:`, Object.keys(apiData || {}));
    nombreVia = `Calle sin nombre ${calleId}`;
  }
  
  const resultado = {
    id: calleId,
    tipoVia: tipoVia,
    nombre: nombreVia
  };
  
  console.log(`✅ [CalleService] Calle ${index} normalizada:`, resultado);
  return resultado;
};

/**
 * Servicio para gestionar las peticiones a la API de Vías/Calles
 * Versión corregida con mejor normalización de datos
 */
export const CalleApiService = {
  /**
   * Obtener todas las vías/calles
   */
  getAll: async (): Promise<Calle[]> => {
    try {
      console.log('📡 [CalleService] Iniciando petición GET a:', API_URL);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 [CalleService] Respuesta recibida:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      // Obtener la respuesta como texto primero para debug
      const responseText = await response.text();
      console.log('📡 [CalleService] Respuesta texto completa:', responseText);
      
      // Intentar parsear como JSON
      let rawData;
      try {
        rawData = JSON.parse(responseText);
        console.log('📡 [CalleService] Datos parseados como JSON:', rawData);
      } catch (parseError) {
        console.error('❌ [CalleService] Error al parsear respuesta como JSON:', parseError);
        throw new Error('La respuesta no es un JSON válido');
      }
      
      // Procesar diferentes formatos de respuesta
      let callesArray: any[];
      
      if (Array.isArray(rawData)) {
        console.log('📊 [CalleService] La respuesta es un array con', rawData.length, 'elementos');
        callesArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
        console.log('📊 [CalleService] La respuesta es un objeto con propiedades:', Object.keys(rawData));
        
        // Intentar extraer el array de datos
        if (rawData.data && Array.isArray(rawData.data)) {
          console.log('📊 [CalleService] Extrayendo array desde rawData.data');
          callesArray = rawData.data;
        } else if (rawData.items && Array.isArray(rawData.items)) {
          console.log('📊 [CalleService] Extrayendo array desde rawData.items');
          callesArray = rawData.items;
        } else if (rawData.results && Array.isArray(rawData.results)) {
          console.log('📊 [CalleService] Extrayendo array desde rawData.results');
          callesArray = rawData.results;
        } else if (rawData.content && Array.isArray(rawData.content)) {
          console.log('📊 [CalleService] Extrayendo array desde rawData.content');
          callesArray = rawData.content;
        } else {
          // Si no encontramos un array, intentar convertir el objeto a un array
          console.log('📊 [CalleService] Intentando convertir objeto a array');
          const values = Object.values(rawData);
          const calleValues = values.filter(val => 
            val && typeof val === 'object' && !Array.isArray(val)
          );
          
          if (calleValues.length > 0) {
            callesArray = calleValues;
            console.log('📊 [CalleService] Array creado desde valores del objeto');
          } else {
            console.warn('⚠️ [CalleService] No se pudo extraer un array de calles');
            callesArray = [];
          }
        }
      } else {
        console.warn('⚠️ [CalleService] Formato de respuesta inesperado');
        callesArray = [];
      }
      
      console.log('📊 [CalleService] Array final a procesar:', callesArray);
      console.log('📊 [CalleService] Cantidad de elementos:', callesArray.length);
      
      // Mostrar estructura del primer elemento para debug
      if (callesArray.length > 0) {
        console.log('📊 [CalleService] Estructura del primer elemento:', callesArray[0]);
        console.log('📊 [CalleService] Campos disponibles:', Object.keys(callesArray[0] || {}));
      }
      
      // Normalizar cada elemento del array
      const callesNormalizadas = callesArray.map((item, index) => {
        return normalizeCalleData(item, index);
      });
      
      console.log('✅ [CalleService] Calles normalizadas finales:', callesNormalizadas);
      
      // Filtrar calles válidas (que tengan nombre real)
      const callesValidas = callesNormalizadas.filter(calle => {
        const esValida = calle.nombre && !calle.nombre.includes('sin nombre');
        if (!esValida) {
          console.warn(`⚠️ [CalleService] Calle inválida filtrada:`, calle);
        }
        return esValida;
      });
      
      console.log('✅ [CalleService] Calles válidas finales:', callesValidas);
      
      return callesValidas;
      
    } catch (error) {
      console.error('❌ [CalleService] Error en getAll:', error);
      throw error;
    }
  },

  /**
   * Obtener una calle por ID
   */
  getById: async (id: number): Promise<Calle> => {
    try {
      console.log(`📡 [CalleService] GET Calle ID ${id} - Iniciando petición`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [CalleService] GET Calle ID ${id} - Respuesta:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log(`📡 [CalleService] GET Calle ID ${id} - Datos:`, rawData);
      
      return normalizeCalleData(rawData, 0);
    } catch (error) {
      console.error(`❌ [CalleService] Error al obtener calle ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear una nueva calle
   */
  create: async (data: CalleFormData): Promise<Calle> => {
    try {
      console.log('📡 [CalleService] POST Calle - Iniciando creación:', data);
      
      const requestBody = JSON.stringify({
        tipoVia: data.tipoVia,
        nombreVia: data.nombre // Mapear nombre a nombreVia para la API
      });
      
      console.log('📡 [CalleService] POST Calle - Body:', requestBody);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('📡 [CalleService] POST Calle - Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error('📡 [CalleService] POST Calle - Error detallado:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        } catch (e) {
          console.error('No se pudo leer el cuerpo del error');
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('📡 [CalleService] POST Calle - Datos de respuesta:', responseData);
      
      return normalizeCalleData(responseData, 0);
    } catch (error) {
      console.error('❌ [CalleService] Error al crear calle:', error);
      throw error;
    }
  },

  /**
   * Actualizar una calle existente
   */
  update: async (id: number, data: CalleFormData): Promise<Calle> => {
    try {
      console.log(`📡 [CalleService] PUT Calle ID ${id} - Iniciando actualización:`, data);
      
      const requestBody = JSON.stringify({
        tipoVia: data.tipoVia,
        nombreVia: data.nombre
      });
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [CalleService] PUT Calle ID ${id} - Respuesta:`, response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorDetails = await response.text();
          console.error(`📡 [CalleService] PUT Calle ID ${id} - Error:`, errorDetails);
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        } catch (e) {
          console.error('No se pudo leer detalles del error');
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log(`📡 [CalleService] PUT Calle ID ${id} - Éxito:`, responseData);
      
      return normalizeCalleData(responseData, 0);
    } catch (error) {
      console.error(`❌ [CalleService] Error al actualizar calle ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una calle
   */
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`📡 [CalleService] DELETE Calle ID ${id} - Iniciando eliminación`);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [CalleService] DELETE Calle ID ${id} - Respuesta:`, response.status);
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorDetails = await response.text();
          console.error(`📡 [CalleService] DELETE Calle ID ${id} - Error:`, errorDetails);
          if (errorDetails) {
            errorMessage += ` - ${errorDetails}`;
          }
        } catch (e) {
          console.error('No se pudo leer detalles del error');
        }
        
        throw new Error(errorMessage);
      }
      
      console.log(`📡 [CalleService] DELETE Calle ID ${id} - Éxito`);
    } catch (error) {
      console.error(`❌ [CalleService] Error al eliminar calle ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar calles por término
   */
  search: async (term: string): Promise<Calle[]> => {
    try {
      console.log(`📡 [CalleService] SEARCH Calles - Término:`, term);
      
      // Para búsqueda, podemos usar el endpoint general y filtrar localmente
      // o si la API soporta búsqueda, usar un endpoint específico
      const searchUrl = `${API_URL}/search?q=${encodeURIComponent(term)}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log(`📡 [CalleService] SEARCH Calles - Respuesta:`, response.status);
      
      if (!response.ok) {
        // Si no hay endpoint de búsqueda, buscar localmente
        console.log('📡 [CalleService] Endpoint de búsqueda no disponible, usando getAll');
        const todasLasCalles = await this.getAll();
        const termLower = term.toLowerCase();
        
        return todasLasCalles.filter(calle =>
          (calle.nombre && calle.nombre.toLowerCase().includes(termLower)) ||
          (calle.tipoVia && calle.tipoVia.toLowerCase().includes(termLower))
        );
      }
      
      const rawData = await response.json();
      const callesArray = Array.isArray(rawData) ? rawData : [];
      
      return callesArray.map((item, index) => normalizeCalleData(item, index));
    } catch (error) {
      console.error(`❌ [CalleService] Error en búsqueda:`, error);
      throw error;
    }
  }
};

export default CalleApiService;