// src/services/BaseApiService.ts - VERSIÓN CORREGIDA
import { connectivityService } from './connectivityService';
import { NotificationService } from '../components/utils/Notification';

// Tipos base para los servicios
export interface NormalizeOptions<T> {
  normalizeItem: (item: any, index: number) => T;
  validateItem?: (item: T, index: number) => boolean;
}

// Clase base para todos los servicios de API
export abstract class BaseApiService<T, CreateDTO = any, UpdateDTO = any> {
  protected baseURL: string;
  protected endpoint: string;
  protected normalizeOptions: NormalizeOptions<T>;
  protected cacheKey: string;
  
  // URL completa del servicio - CORREGIDA
  protected get url(): string {
    // En desarrollo, asegurar que no se pierda el /api
    if (import.meta.env.DEV && this.baseURL === '') {
      return this.endpoint; // Solo devolver el endpoint que ya incluye /api
    }
    return `${this.baseURL}${this.endpoint}`;
  }
  
  constructor(
    baseURL: string,
    endpoint: string,
    normalizeOptions: NormalizeOptions<T>,
    cacheKey: string
  ) {
    this.baseURL = baseURL;
    this.endpoint = endpoint;
    this.normalizeOptions = normalizeOptions;
    this.cacheKey = cacheKey;
    
    console.log(`🔧 [${this.constructor.name}] Inicializado:`);
    console.log(`  - BaseURL: "${this.baseURL}"`);
    console.log(`  - Endpoint: "${this.endpoint}"`);
    console.log(`  - URL completa: "${this.url}"`);
  }

  /**
   * Construye una URL completa con path adicional
   */
  protected buildUrl(path?: string | number): string {
    const baseUrl = this.url;
    if (!path) return baseUrl;
    
    // Asegurar que siempre haya un / entre la URL base y el path
    const separator = baseUrl.endsWith('/') ? '' : '/';
    return `${baseUrl}${separator}${path}`;
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  protected getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log(`🔑 [${this.constructor.name}] Token obtenido:`, token ? 'Presente' : 'No encontrado');
    return token;
  }

  /**
   * Realiza una petición HTTP con reintentos y manejo de errores mejorado
   */
  protected async makeRequest(url: string, options: RequestInit, retries = 3): Promise<any> {
    console.log(`📡 [${this.constructor.name}] ${options.method || 'GET'} - ${url}`);
    
    // Solo añadir token de autenticación para POST, PUT, DELETE
    const requiresAuth = ['POST', 'PUT', 'DELETE'].includes(options.method || 'GET');
    
    if (requiresAuth) {
      console.log(`🔐 [${this.constructor.name}] Método ${options.method} requiere autenticación`);
      const token = this.getAuthToken();
      
      if (!token) {
        console.error(`❌ [${this.constructor.name}] NO HAY TOKEN para ${options.method}`);
        throw new Error('No hay token de autenticación');
      }
      
      // Construir headers con token
      options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };
      
      console.log(`🔑 [${this.constructor.name}] Token añadido: Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log(`🔓 [${this.constructor.name}] Método ${options.method} no requiere autenticación`);
      // Solo agregar Content-Type para GET
      options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };
    }

    // Log detallado de la petición
    console.log(`📋 [${this.constructor.name}] Petición completa:`, {
      url,
      method: options.method,
      headers: options.headers,
      body: options.body
    });
    
    // Verificar conectividad antes de hacer la petición
    const isOnline = connectivityService.getStatus();
    if (!isOnline) {
      console.warn(`⚠️ [${this.constructor.name}] Sin conexión a Internet`);
      NotificationService.warning('Sin conexión a Internet. Trabajando en modo offline.');
      throw new Error('Sin conexión a Internet');
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 [${this.constructor.name}] Intento ${attempt} de ${retries}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📊 [${this.constructor.name}] Respuesta: ${response.status} ${response.statusText}`);
        
        // Manejar errores de autenticación
        if (response.status === 401) {
          console.error(`🚫 [${this.constructor.name}] Error 401: No autorizado`);
          NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          
          // Limpiar datos de autenticación y redirigir al login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token_expiry');
          
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          
          throw new Error('No autorizado. Sesión expirada.');
        }
        
        if (response.status === 403) {
          console.error(`🚫 [${this.constructor.name}] Error 403: Prohibido`);
          NotificationService.error('No tiene permisos para realizar esta acción.');
          throw new Error('No tiene permisos para realizar esta acción.');
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [${this.constructor.name}] Error HTTP ${response.status}:`, errorText);
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`✅ [${this.constructor.name}] Respuesta JSON recibida`);
          return data;
        } else {
          const text = await response.text();
          console.log(`✅ [${this.constructor.name}] Respuesta de texto recibida`);
          return text;
        }
        
      } catch (error: any) {
        console.error(`❌ [${this.constructor.name}] Error en intento ${attempt}:`, error);
        
        if (error.name === 'AbortError') {
          console.error(`⏱️ [${this.constructor.name}] Timeout en la petición`);
          NotificationService.error('La petición tardó demasiado tiempo. Intente nuevamente.');
        }
        
        // Si es el último intento o es un error de autenticación, lanzar el error
        if (attempt === retries || error.message.includes('No autorizado') || error.message.includes('No tiene permisos')) {
          throw error;
        }
        
        // Esperar antes de reintentar (backoff exponencial)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ [${this.constructor.name}] Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error(`No se pudo completar la petición después de ${retries} intentos`);
  }

  /**
   * Normaliza y valida un array de elementos
   */
  protected normalizeArray(data: any): T[] {
    if (!Array.isArray(data)) {
      console.warn(`⚠️ [${this.constructor.name}] Los datos no son un array, intentando extraer array`);
      
      // Intentar extraer array de la respuesta
      if (data && typeof data === 'object') {
        const possibleArrayKeys = ['data', 'items', 'results', 'records'];
        for (const key of possibleArrayKeys) {
          if (Array.isArray(data[key])) {
            console.log(`✅ [${this.constructor.name}] Array encontrado en data.${key}`);
            data = data[key];
            break;
          }
        }
      }
      
      // Si aún no es un array, devolver array vacío
      if (!Array.isArray(data)) {
        console.error(`❌ [${this.constructor.name}] No se pudo extraer un array de los datos`);
        return [];
      }
    }
    
    console.log(`📊 [${this.constructor.name}] normalizeArray - ${data.length} elementos recibidos`);
    
    // Normalizar cada elemento
    const normalized = data.map((item, index) => {
      try {
        return this.normalizeOptions.normalizeItem(item, index);
      } catch (error) {
        console.error(`❌ [${this.constructor.name}] Error al normalizar elemento ${index}:`, error);
        return null;
      }
    }).filter(item => item !== null);
    
    console.log(`✅ [${this.constructor.name}] normalizeArray - ${normalized.length} elementos normalizados`);
    
    // Validar si se proporcionó una función de validación
    if (this.normalizeOptions.validateItem) {
      const validatedItems = normalized.filter((item, index) => {
        try {
          const isValid = this.normalizeOptions.validateItem!(item as T, index);
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

  // Métodos de caché
  protected saveToCache(data: T[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
      localStorage.setItem(`${this.cacheKey}_timestamp`, new Date().toISOString());
      console.log(`💾 [${this.constructor.name}] Datos guardados en caché`);
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al guardar en caché:`, error);
    }
  }

  protected loadFromCache(): T[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const timestamp = localStorage.getItem(`${this.cacheKey}_timestamp`);
        console.log(`💾 [${this.constructor.name}] Datos cargados del caché (${timestamp})`);
        return data;
      }
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al cargar del caché:`, error);
    }
    return null;
  }

  protected clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(`${this.cacheKey}_timestamp`);
      console.log(`🧹 [${this.constructor.name}] Caché limpiado`);
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al limpiar caché:`, error);
    }
  }

  // Métodos CRUD
  async getAll(): Promise<T[]> {
    try {
      console.log(`📡 [${this.constructor.name}] GET - Iniciando petición a:`, this.url);
      
      const rawData = await this.makeRequest(this.url, {
        method: 'GET'
      });
      
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
      const url = this.buildUrl(id);
      console.log(`📡 [${this.constructor.name}] GET ID ${id} - Iniciando petición a: ${url}`);
      
      const rawData = await this.makeRequest(url, {
        method: 'GET'
      });
      
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
      console.log(`📍 [${this.constructor.name}] URL: ${this.url}`);
      
      // Verificar token antes de crear
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para guardar datos');
        throw new Error('No hay token de autenticación');
      }
      
      const rawData = await this.makeRequest(this.url, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] POST - Éxito:`, normalized);
      NotificationService.success('Registro creado exitosamente');
      this.clearCache(); // Limpiar caché después de crear
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error al crear:`, error);
      
      // Mostrar mensaje de error más específico
      if (error.message.includes('No autorizado')) {
        NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else if (error.message.includes('No tiene permisos')) {
        NotificationService.error('No tiene permisos para crear registros.');
      } else if (error.message.includes('Sin conexión')) {
        NotificationService.error('Sin conexión a Internet.');
      } else {
        NotificationService.error(`Error al crear: ${error.message}`);
      }
      
      throw error;
    }
  }

  async update(id: number, data: UpdateDTO): Promise<T> {
    try {
      const url = this.buildUrl(id);
      console.log(`📡 [${this.constructor.name}] PUT ID ${id} - Iniciando actualización:`, data);
      console.log(`📍 [${this.constructor.name}] URL: ${url}`);
      
      // Verificar token antes de actualizar
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar datos');
        throw new Error('No hay token de autenticación');
      }
      
      const rawData = await this.makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] PUT ID ${id} - Éxito:`, normalized);
      NotificationService.success('Registro actualizado exitosamente');
      this.clearCache(); // Limpiar caché después de actualizar
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error al actualizar ID ${id}:`, error);
      
      // Mostrar mensaje de error más específico
      if (error.message.includes('No autorizado')) {
        NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else if (error.message.includes('No tiene permisos')) {
        NotificationService.error('No tiene permisos para actualizar registros.');
      } else if (error.message.includes('Sin conexión')) {
        NotificationService.error('Sin conexión a Internet.');
      } else {
        NotificationService.error(`Error al actualizar: ${error.message}`);
      }
      
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const url = this.buildUrl(id);
      console.log(`📡 [${this.constructor.name}] DELETE ID ${id} - Iniciando eliminación`);
      console.log(`📍 [${this.constructor.name}] URL: ${url}`);
      
      // Verificar token antes de eliminar
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para eliminar datos');
        throw new Error('No hay token de autenticación');
      }
      
      await this.makeRequest(url, {
        method: 'DELETE'
      });
      
      console.log(`✅ [${this.constructor.name}] DELETE ID ${id} - Éxito`);
      NotificationService.success('Registro eliminado exitosamente');
      this.clearCache(); // Limpiar caché después de eliminar
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error al eliminar ID ${id}:`, error);
      
      // Mostrar mensaje de error más específico
      if (error.message.includes('No autorizado')) {
        NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else if (error.message.includes('No tiene permisos')) {
        NotificationService.error('No tiene permisos para eliminar registros.');
      } else if (error.message.includes('Sin conexión')) {
        NotificationService.error('Sin conexión a Internet.');
      } else {
        NotificationService.error(`Error al eliminar: ${error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Busca elementos por término
   */
  async search(term: string): Promise<T[]> {
    try {
      console.log(`📡 [${this.constructor.name}] SEARCH - Buscando:`, term);
      
      const rawData = await this.makeRequest(`${this.url}/search?q=${encodeURIComponent(term)}`, {
        method: 'GET'
      });
      
      const normalized = this.normalizeArray(rawData);
      
      console.log(`✅ [${this.constructor.name}] SEARCH - ${normalized.length} resultados encontrados`);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      throw error;
    }
  }

  /**
   * Verifica la conectividad con el endpoint
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log(`🔍 [${this.constructor.name}] Verificando conexión con:`, this.url);
      
      await this.makeRequest(this.url, {
        method: 'HEAD'
      }, 1); // Solo 1 intento para verificación rápida
      
      console.log(`✅ [${this.constructor.name}] Conexión exitosa`);
      return true;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Sin conexión:`, error);
      return false;
    }
  }
}

export default BaseApiService;