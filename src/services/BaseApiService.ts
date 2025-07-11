// src/services/BaseApiService.ts - VERSIÓN CON AUTENTICACIÓN CONFIGURABLE
import { buildApiUrl, getApiHeaders, API_CONFIG, getAuthToken } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Tipos base para los servicios
 */
export interface NormalizeOptions<T> {
  normalizeItem: (item: any, index: number) => T;
  validateItem?: (item: T, index: number) => boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Configuración de autenticación por servicio
 */
export interface AuthConfig {
  GET?: boolean;
  POST?: boolean;
  PUT?: boolean;
  DELETE?: boolean;
  PATCH?: boolean;
}

/**
 * Clase de error personalizada para API
 */
export class ApiError extends Error {
  public statusCode: number;
  public data: any;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.errors = data?.errors;
  }
}

/**
 * Clase base abstracta para todos los servicios de API
 * Proporciona métodos CRUD estándar y manejo de errores
 * ACTUALIZADO: Permite configurar qué métodos requieren autenticación
 */
export abstract class BaseApiService<T, CreateDTO = any, UpdateDTO = any> {
  protected endpoint: string;
  protected normalizeOptions: NormalizeOptions<T>;
  protected cacheKey: string;
  protected authConfig: AuthConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutos por defecto
  
  constructor(
    endpoint: string,
    normalizeOptions: NormalizeOptions<T>,
    cacheKey: string,
    authConfig?: AuthConfig
  ) {
    this.endpoint = endpoint;
    this.normalizeOptions = normalizeOptions;
    this.cacheKey = cacheKey;
    
    // Configuración de autenticación por defecto
    // Por defecto: GET no requiere auth, POST/PUT/DELETE/PATCH sí
    this.authConfig = authConfig || {
      GET: false,
      POST: false,    // Cambiado a false para tu caso
      PUT: false,     // Cambiado a false para tu caso
      DELETE: false,  // Cambiado a false para tu caso
      PATCH: false    // Cambiado a false para tu caso
    };
    
    console.log(`🔧 [${this.constructor.name}] Inicializado:`);
    console.log(`  - Endpoint: "${this.endpoint}"`);
    console.log(`  - Cache Key: "${this.cacheKey}"`);
    console.log(`  - Auth Config:`, this.authConfig);
  }

  /**
   * Configurar duración del cache
   */
  public setCacheDuration(duration: number): void {
    this.cacheDuration = duration;
  }

  /**
   * Limpiar cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log(`🧹 [${this.constructor.name}] Cache limpiado`);
  }

  /**
   * Actualizar configuración de autenticación
   */
  public setAuthConfig(config: AuthConfig): void {
    this.authConfig = { ...this.authConfig, ...config };
    console.log(`🔐 [${this.constructor.name}] Configuración de auth actualizada:`, this.authConfig);
  }

  /**
   * Obtener datos del cache si están disponibles y no han expirado
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`📦 [${this.constructor.name}] Datos obtenidos del cache`);
      return cached.data;
    }
    return null;
  }

  /**
   * Guardar datos en cache
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Verificar si existe un token de autenticación
   */
  private hasAuthToken(): boolean {
    const token = getAuthToken();
    return !!token;
  }

  /**
   * Determinar si un método requiere autenticación
   */
  private requiresAuth(method: string): boolean {
    const methodUpper = method.toUpperCase() as keyof AuthConfig;
    return this.authConfig[methodUpper] || false;
  }

  /**
   * Realiza una petición HTTP con reintentos y manejo de errores mejorado
   */
  protected async makeRequest<R = any>(
    path: string = '',
    options: RequestInit = {},
    retries: number = API_CONFIG.retries
  ): Promise<R> {
    const url = buildApiUrl(this.endpoint + path);
    const method = (options.method || 'GET').toUpperCase();
    
    // Determinar si este método específico requiere autenticación
    const isAuthRequired = this.requiresAuth(method);
    
    // Verificar si hay token disponible cuando es requerido
    if (isAuthRequired && !this.hasAuthToken()) {
      console.warn(`⚠️ [${this.constructor.name}] No hay token de autenticación disponible para ${method} ${url}`);
      // Opcional: puedes decidir si lanzar error o continuar sin auth
      // throw new ApiError('Se requiere autenticación', 401);
    }
    
    // Obtener headers base
    const baseHeaders = getApiHeaders(isAuthRequired);
    
    // Combinar con headers personalizados si existen
    const customHeaders = options.headers || {};
    
    // Crear Headers object para la petición
    const headers = new Headers();
    
    // Agregar headers base
    Object.entries(baseHeaders).forEach(([key, value]) => {
      headers.append(key, value);
    });
    
    // Agregar headers personalizados
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        headers.set(key, value);
      });
    } else if (typeof customHeaders === 'object') {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value as string);
      });
    }
    
    const finalOptions: RequestInit = {
      ...options,
      headers,
      signal: options.signal || AbortSignal.timeout(API_CONFIG.timeout)
    };

    console.log(`🌐 [${this.constructor.name}] ${method} ${url}`);
    console.log(`🔐 [${this.constructor.name}] Autenticación: ${isAuthRequired ? 'INCLUIDA' : 'NO REQUERIDA'}`);
    
    // Verificar conectividad básica
    if (!navigator.onLine) {
      console.warn(`📵 [${this.constructor.name}] Sin conexión a internet`);
      throw new ApiError('Sin conexión a internet', 0);
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, finalOptions);
        
        // Log detallado de la respuesta
        console.log(`📡 [${this.constructor.name}] Respuesta:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        // Manejar respuestas no exitosas
        if (!response.ok) {
          // Extraer mensaje de error del body si es posible
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          let errorData: any = null;
          
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          } catch (e) {
            console.warn('No se pudo parsear el error como JSON');
          }

          // Manejar errores específicos
          if (response.status === 401) {
            console.error(`🚫 [${this.constructor.name}] No autorizado`);
            throw new ApiError('No autorizado. Por favor, inicie sesión.', 401, errorData);
          }
          
          if (response.status === 403) {
            throw new ApiError('No tiene permisos para realizar esta acción', 403, errorData);
          }
          
          if (response.status === 404) {
            throw new ApiError('Recurso no encontrado', 404, errorData);
          }
          
          if (response.status === 422) {
            throw new ApiError('Datos de entrada inválidos', 422, errorData);
          }
          
          if (response.status >= 500) {
            throw new ApiError('Error del servidor. Por favor, intente más tarde.', response.status, errorData);
          }
          
          throw new ApiError(errorMessage, response.status, errorData);
        }

        // Manejar respuesta vacía
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return {} as R;
        }

        // Parsear respuesta JSON
        const data = await response.json();
        return data as R;

      } catch (error: any) {
        console.error(`❌ [${this.constructor.name}] Error en intento ${attempt + 1}:`, error);
        
        // Si es el último intento, lanzar el error
        if (attempt === retries) {
          if (error instanceof ApiError) {
            throw error;
          }
          
          if (error.name === 'AbortError') {
            throw new ApiError('La petición excedió el tiempo límite', 0);
          }
          
          if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new ApiError('Error de conexión. Verifique su conexión a internet.', 0);
          }
          
          throw new ApiError(error.message || 'Error desconocido', 0);
        }
        
        // Esperar antes de reintentar
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`⏳ Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new ApiError('Máximo de reintentos alcanzado', 0);
  }

  /**
   * Normaliza los datos según las opciones de normalización
   */
  protected normalizeData(data: any[]): T[] {
    if (!Array.isArray(data)) {
      console.warn(`⚠️ [${this.constructor.name}] Se esperaba un array, se recibió:`, typeof data);
      return [];
    }

    const normalized = data
      .map((item, index) => {
        try {
          return this.normalizeOptions.normalizeItem(item, index);
        } catch (error) {
          console.error(`❌ [${this.constructor.name}] Error normalizando item ${index}:`, error);
          return null;
        }
      })
      .filter((item): item is T => item !== null);

    // Validar items si se proporciona validador
    if (this.normalizeOptions.validateItem) {
      const validItems = normalized.filter((item, index) => {
        const isValid = this.normalizeOptions.validateItem!(item, index);
        if (!isValid) {
          console.warn(`⚠️ [${this.constructor.name}] Item ${index} no pasó la validación`);
        }
        return isValid;
      });
      
      console.log(`✅ [${this.constructor.name}] ${validItems.length}/${normalized.length} items válidos`);
      return validItems;
    }

    return normalized;
  }

  // ... resto de los métodos permanecen igual ...

  public async getAll(params?: QueryParams, useCache: boolean = true): Promise<T[]> {
    const cacheKey = `${this.cacheKey}_all_${JSON.stringify(params || {})}`;
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      const response = await this.makeRequest<any>(queryString);
      
      const data = Array.isArray(response) ? response : response.data || [];
      const normalized = this.normalizeData(data);
      
      this.setCachedData(cacheKey, normalized);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error obteniendo todos:`, error);
      throw error;
    }
  }

  public async getById(id: string | number): Promise<T | null> {
    const cacheKey = `${this.cacheKey}_${id}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const response = await this.makeRequest<any>(`/${id}`);
      const data = response.data || response;
      const normalized = this.normalizeData([data])[0];
      
      this.setCachedData(cacheKey, normalized);
      
      return normalized || null;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      console.error(`❌ [${this.constructor.name}] Error obteniendo por ID:`, error);
      throw error;
    }
  }

  public async create(data: CreateDTO): Promise<T> {
    try {
      const response = await this.makeRequest<ApiResponse<T>>('', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const created = response.data || response;
      const normalized = this.normalizeData([created])[0];
      
      this.clearCache();
      
      // Notificar éxito
      NotificationService.success(`${this.constructor.name.replace('Service', '')} creado exitosamente`);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error creando:`, error);
      
      // Notificar error
      if (error instanceof ApiError) {
        NotificationService.error(error.message);
      }
      
      throw error;
    }
  }

  public async update(id: string | number, data: UpdateDTO): Promise<T> {
    try {
      const response = await this.makeRequest<ApiResponse<T>>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      const updated = response.data || response;
      const normalized = this.normalizeData([updated])[0];
      
      this.clearCache();
      
      NotificationService.success(`Actualizado exitosamente`);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error actualizando:`, error);
      
      if (error instanceof ApiError) {
        NotificationService.error(error.message);
      }
      
      throw error;
    }
  }

  public async delete(id: string | number): Promise<void> {
    try {
      await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      });
      
      this.clearCache();
      
      NotificationService.success(`Eliminado exitosamente`);
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error eliminando:`, error);
      
      if (error instanceof ApiError) {
        NotificationService.error(error.message);
      }
      
      throw error;
    }
  }

  // Otros métodos...
  
  public async search(params: any): Promise<T[]> {
    const cacheKey = `${this.cacheKey}_search_${JSON.stringify(params)}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const queryString = `?${new URLSearchParams(params).toString()}`;
      const response = await this.makeRequest<any>(queryString);
      
      const data = Array.isArray(response) ? response : response.data || [];
      const normalized = this.normalizeData(data);
      
      this.setCachedData(cacheKey, normalized);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      throw error;
    }
  }

  public async patch(id: string | number, data: Partial<UpdateDTO>): Promise<T> {
    try {
      const response = await this.makeRequest<ApiResponse<T>>(`/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      
      const updated = response.data || response;
      const normalized = this.normalizeData([updated])[0];
      
      this.clearCache();
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error actualizando parcialmente:`, error);
      throw error;
    }
  }

  public async deleteMany(ids: (string | number)[]): Promise<void> {
    try {
      await this.makeRequest('/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      
      this.clearCache();
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error eliminando múltiples:`, error);
      throw error;
    }
  }

  public async getPaginated(params: QueryParams): Promise<PaginatedResponse<T>> {
    try {
      const queryString = `?${new URLSearchParams(params as any).toString()}`;
      const response = await this.makeRequest<PaginatedResponse<any>>(queryString);
      
      const normalized = this.normalizeData(response.data);
      
      return {
        ...response,
        data: normalized
      };
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error obteniendo paginado:`, error);
      throw error;
    }
  }

  public async exists(id: string | number): Promise<boolean> {
    try {
      await this.makeRequest(`/${id}/exists`, {
        method: 'HEAD'
      });
      return true;
    } catch (error) {
      if ((error as ApiError).statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  public async executeAction(id: string | number, action: string, data?: any): Promise<any> {
    try {
      const response = await this.makeRequest(`/${id}/${action}`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      });
      
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error ejecutando acción ${action}:`, error);
      throw error;
    }
  }
}

export default BaseApiService;