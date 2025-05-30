// src/services/base/BaseApiService.ts
export interface ApiConfig {
  baseUrl: string;
  endpoint: string;
  headers?: Record<string, string>;
}

export interface NormalizeOptions<T, R = any> {
  normalizeItem: (data: R, index: number) => T;
  extractArray?: (response: any) => R[];
  validateItem?: (item: T) => boolean;
}

export abstract class BaseApiService<T, CreateDTO, UpdateDTO = CreateDTO> {
  protected config: ApiConfig;
  protected normalizeOptions: NormalizeOptions<T>;

  constructor(config: ApiConfig, normalizeOptions: NormalizeOptions<T>) {
    this.config = config;
    this.normalizeOptions = normalizeOptions;
  }

  protected get url() {
    return `${this.config.baseUrl}${this.config.endpoint}`;
  }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      ...this.config.headers
    };
  }

  protected async handleResponse(response: Response, method: string): Promise<any> {
    console.log(`📡 [${this.constructor.name}] ${method} - Respuesta:`, response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.error(`📡 [${this.constructor.name}] ${method} - Error detallado:`, errorText);
        
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
    
    const responseText = await response.text();
    console.log(`📡 [${this.constructor.name}] ${method} - Respuesta (preview):`, responseText.substring(0, 200));
    
    if (!responseText) {
      console.log(`📡 [${this.constructor.name}] ${method} - Respuesta vacía, devolviendo array vacío`);
      return [];
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log(`📡 [${this.constructor.name}] ${method} - JSON parseado correctamente, tipo:`, Array.isArray(data) ? 'Array' : typeof data);
      return data;
    } catch (e) {
      console.error('❌ Respuesta no es JSON válido:', responseText);
      throw new Error('La respuesta no es un JSON válido');
    }
  }

  protected normalizeArray(rawData: any): T[] {
    console.log(`🔄 [${this.constructor.name}] normalizeArray - Tipo de datos recibidos:`, typeof rawData);
    console.log(`🔄 [${this.constructor.name}] normalizeArray - Es array:`, Array.isArray(rawData));
    
    let dataArray: any[] = [];
    
    if (Array.isArray(rawData)) {
      console.log(`✅ [${this.constructor.name}] normalizeArray - Los datos ya son un array con ${rawData.length} elementos`);
      dataArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
      console.log(`🔍 [${this.constructor.name}] normalizeArray - Buscando array en objeto...`);
      
      // Intentar extraer array usando función personalizada
      if (this.normalizeOptions.extractArray) {
        dataArray = this.normalizeOptions.extractArray(rawData);
        console.log(`🔄 [${this.constructor.name}] normalizeArray - extractArray devolvió ${dataArray.length} elementos`);
      } else {
        // Intentar extraer de propiedades comunes
        const possibleProps = ['data', 'items', 'results', 'content'];
        for (const prop of possibleProps) {
          if (rawData[prop] && Array.isArray(rawData[prop])) {
            dataArray = rawData[prop];
            console.log(`✅ [${this.constructor.name}] normalizeArray - Array encontrado en propiedad '${prop}' con ${dataArray.length} elementos`);
            break;
          }
        }
        
        if (dataArray.length === 0) {
          console.warn(`⚠️ [${this.constructor.name}] normalizeArray - No se encontró array en el objeto, devolviendo array vacío`);
        }
      }
    } else {
      console.warn(`⚠️ [${this.constructor.name}] normalizeArray - Datos no válidos, devolviendo array vacío`);
    }
    
    console.log(`🔄 [${this.constructor.name}] normalizeArray - Normalizando ${dataArray.length} elementos...`);
    
    // Normalizar cada elemento
    const normalized = dataArray.map((item, index) => {
      try {
        return this.normalizeOptions.normalizeItem(item, index);
      } catch (error) {
        console.error(`❌ [${this.constructor.name}] Error al normalizar elemento ${index}:`, error);
        return null;
      }
    }).filter(item => item !== null);
    
    console.log(`✅ [${this.constructor.name}] normalizeArray - ${normalized.length} elementos normalizados exitosamente`);
    
    // Validar elementos si se proporciona función de validación
    if (this.normalizeOptions.validateItem) {
      const validatedItems = normalized.filter((item, index) => {
        try {
          const isValid = this.normalizeOptions.validateItem!(item as T);
          if (!isValid) {
            console.log(`🚫 [${this.constructor.name}] Elemento ${index} no pasó la validación`);
          }
          return isValid;
        } catch (error) {
          console.error(`❌ [${this.constructor.name}] Error al validar elemento ${index}:`, error);
          return false;
        }
      });
      
      console.log(`✅ [${this.constructor.name}] normalizeArray - ${validatedItems.length} elementos válidos de ${normalized.length} normalizados`);
      return validatedItems as T[];
    }
    
    return normalized as T[];
  }

  async getAll(): Promise<T[]> {
    try {
      console.log(`📡 [${this.constructor.name}] GET - Iniciando petición a:`, this.url);
      
      const response = await fetch(this.url, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      const rawData = await this.handleResponse(response, 'GET');
      const normalized = this.normalizeArray(rawData);
      
      console.log(`✅ [${this.constructor.name}] GET - ${normalized.length} elementos obtenidos`);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en getAll:`, error);
      throw error;
    }
  }

  async getById(id: number): Promise<T> {
    try {
      console.log(`📡 [${this.constructor.name}] GET ID ${id} - Iniciando petición`);
      
      const response = await fetch(`${this.url}/${id}`, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      const rawData = await this.handleResponse(response, `GET ID ${id}`);
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] GET ID ${id} - Éxito`);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al obtener ID ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      console.log(`📡 [${this.constructor.name}] POST - Iniciando creación:`, data);
      
      const response = await fetch(this.url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      
      const rawData = await this.handleResponse(response, 'POST');
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] POST - Éxito:`, normalized);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al crear:`, error);
      throw error;
    }
  }

  async update(id: number, data: UpdateDTO): Promise<T> {
    try {
      console.log(`📡 [${this.constructor.name}] PUT ID ${id} - Iniciando actualización:`, data);
      
      const response = await fetch(`${this.url}/${id}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit'
      });
      
      const rawData = await this.handleResponse(response, `PUT ID ${id}`);
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] PUT ID ${id} - Éxito:`, normalized);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al actualizar ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`📡 [${this.constructor.name}] DELETE ID ${id} - Iniciando eliminación`);
      
      const response = await fetch(`${this.url}/${id}`, {
        method: 'DELETE',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      await this.handleResponse(response, `DELETE ID ${id}`);
      
      console.log(`✅ [${this.constructor.name}] DELETE ID ${id} - Éxito`);
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al eliminar ID ${id}:`, error);
      throw error;
    }
  }

  async search(term: string): Promise<T[]> {
    try {
      console.log(`📡 [${this.constructor.name}] SEARCH - Término:`, term);
      
      const searchUrl = `${this.url}/search?q=${encodeURIComponent(term)}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        // Si no hay endpoint de búsqueda, buscar localmente
        console.log('📡 Endpoint de búsqueda no disponible, usando getAll');
        const allItems = await this.getAll();
        const termLower = term.toLowerCase();
        
        return allItems.filter(item =>
          JSON.stringify(item).toLowerCase().includes(termLower)
        );
      }
      
      const rawData = await this.handleResponse(response, 'SEARCH');
      return this.normalizeArray(rawData);
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      throw error;
    }
  }
}