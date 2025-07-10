// src/services/BaseApiService.ts
import { connectivityService } from './connectivityService';
import { NotificationService } from '../components/utils/Notification';
import { apiGet, apiPost, API_BASE_URL } from '../utils/api';

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
  
  // URL completa del servicio
  protected get url(): string {
    // SIEMPRE construir la URL completa con la IP del backend
    const base = this.baseURL || import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080';
    return `${base}${this.endpoint}`;
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
    // IMPORTANTE: Asegurar que la URL sea completa
    const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080'}${url}`;
    
    console.log(`📡 [${this.constructor.name}] ${options.method || 'GET'} - ${fullUrl}`);
    
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
    
    // Verificar conectividad
    const isOnline = connectivityService.getStatus();
    if (!isOnline) {
      console.warn(`⚠️ [${this.constructor.name}] Sin conexión a Internet`);
      const cached = this.loadFromCache();
      if (cached) {
        console.log(`📦 [${this.constructor.name}] Devolviendo datos del caché`);
        return cached;
      }
      throw new Error('Sin conexión a Internet y sin datos en caché');
    }
    
    let lastError: any;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 [${this.constructor.name}] Intento ${attempt}/${retries}`);
        
        const response = await fetch(fullUrl, {
          ...options,
          Headers,
          mode: 'cors',
          credentials: 'include'
        });
        
        console.log(`📥 [${this.constructor.name}] Respuesta: ${response.status} ${response.statusText}`);
        
        // Manejar errores HTTP
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [${this.constructor.name}] Error HTTP ${response.status}:`, errorText);
          
          if (response.status === 401) {
            throw new Error('No autorizado. Token inválido o expirado.');
          }
          if (response.status === 403) {
            throw new Error('Sin permisos para acceder a este recurso.');
          }
          if (response.status === 404) {
            throw new Error('Recurso no encontrado.');
          }
          if (response.status >= 500) {
            throw new Error(`Error del servidor: ${response.status}`);
          }
          
          throw new Error(`Error HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        // Parsear respuesta
        const data = await response.json();
        console.log(`✅ [${this.constructor.name}] Respuesta exitosa`);
        return data;
        
      } catch (error: any) {
        lastError = error;
        console.error(`❌ [${this.constructor.name}] Error en intento ${attempt}:`, error);
        
        if (attempt < retries) {
          const delay = attempt * 1000; // Espera incremental
          console.log(`⏳ [${this.constructor.name}] Esperando ${delay}ms antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.error(`❌ [${this.constructor.name}] Todos los intentos fallaron`);
    throw lastError;
  }

  /**
   * Normaliza un array de elementos
   */
  protected normalizeArray(data: any): T[] {
    if (!Array.isArray(data)) {
      console.warn(`⚠️ [${this.constructor.name}] Se esperaba un array, se recibió:`, typeof data);
      return [];
    }
    
    console.log(`🔄 [${this.constructor.name}] Normalizando ${data.length} elementos`);
    
    const normalized = data.map((item, index) => {
      try {
        return this.normalizeOptions.normalizeItem(item, index);
      } catch (error) {
        console.error(`❌ [${this.constructor.name}] Error al normalizar elemento ${index}:`, error);
        return null;
      }
    }).filter(item => item !== null);
    
    // Validar si se proporcionó función de validación
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
      
      console.log(`✅ [${this.constructor.name}] ${validatedItems.length} elementos válidos de ${normalized.length}`);
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

  // Métodos CRUD básicos
  async getAll(): Promise<T[]> {
    try {
      console.log(`📡 [${this.constructor.name}] GET ALL - Iniciando`);
      
      const rawData = await this.makeRequest(this.url, {
        method: 'GET'
      });
      
      const normalized = this.normalizeArray(rawData);
      
      if (normalized.length > 0) {
        this.saveToCache(normalized);
      }
      
      console.log(`✅ [${this.constructor.name}] GET ALL - ${normalized.length} elementos`);
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error en getAll:`, error);
      
      // Intentar devolver del caché si hay error
      const cached = this.loadFromCache();
      if (cached && cached.length > 0) {
        console.log(`📦 [${this.constructor.name}] Devolviendo ${cached.length} elementos del caché`);
        NotificationService.warning('Usando datos del caché (sin conexión)');
        return cached;
      }
      
      throw error;
    }
  }

  async getById(id: number): Promise<T> {
    try {
      const url = this.buildUrl(id);
      console.log(`📡 [${this.constructor.name}] GET BY ID ${id}`);
      
      const rawData = await this.makeRequest(url, {
        method: 'GET'
      });
      
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] GET BY ID ${id} - Éxito`);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error al obtener ID ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      console.log(`📡 [${this.constructor.name}] CREATE`, data);
      
      const rawData = await this.makeRequest(this.url, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] CREATE - Éxito`);
      NotificationService.success('Registro creado exitosamente');
      this.clearCache();
      
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error al crear:`, error);
      NotificationService.error(`Error al crear: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, data: UpdateDTO): Promise<T> {
    try {
      const url = this.buildUrl(id);
      console.log(`📡 [${this.constructor.name}] UPDATE ${id}`, data);
      
      const rawData = await this.makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      const normalized = this.normalizeOptions.normalizeItem(rawData, 0);
      
      console.log(`✅ [${this.constructor.name}] UPDATE ${id} - Éxito`);
      NotificationService.success('Registro actualizado exitosamente');
      this.clearCache();
      
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error al actualizar ${id}:`, error);
      NotificationService.error(`Error al actualizar: ${error.message}`);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const url = this.buildUrl(id);
      console.log(`📡 [${this.constructor.name}] DELETE ${id}`);
      
      await this.makeRequest(url, {
        method: 'DELETE'
      });
      
      console.log(`✅ [${this.constructor.name}] DELETE ${id} - Éxito`);
      NotificationService.success('Registro eliminado exitosamente');
      this.clearCache();
      
    } catch (error: any) {
      console.error(`❌ [${this.constructor.name}] Error al eliminar ${id}:`, error);
      NotificationService.error(`Error al eliminar: ${error.message}`);
      throw error;
    }
  }
}

export default BaseApiService;