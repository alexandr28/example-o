// src/services/BaseApiService.ts
import { buildApiUrl, getApiHeaders, API_CONFIG } from '../config/api.unified.config';
import { connectivityService } from './connectivityService';
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
 */
export abstract class BaseApiService<T, CreateDTO = any, UpdateDTO = any> {
  protected endpoint: string;
  protected normalizeOptions: NormalizeOptions<T>;
  protected cacheKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutos por defecto
  
  constructor(
    endpoint: string,
    normalizeOptions: NormalizeOptions<T>,
    cacheKey: string
  ) {
    this.endpoint = endpoint;
    this.normalizeOptions = normalizeOptions;
    this.cacheKey = cacheKey;
    
    console.log(`🔧 [${this.constructor.name}] Inicializado:`);
    console.log(`  - Endpoint: "${this.endpoint}"`);
    console.log(`  - Cache Key: "${this.cacheKey}"`);
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
   * Realiza una petición HTTP con reintentos y manejo de errores mejorado
   */
  protected async makeRequest<R = any>(
    path: string = '',
    options: RequestInit = {},
    retries: number = API_CONFIG.retries
  ): Promise<R> {
    const url = buildApiUrl(this.endpoint + path);
    
    // Determinar si se requiere autenticación basado en el método HTTP
    // GET no requiere auth, POST/PUT/DELETE/PATCH sí
    const method = (options.method || 'GET').toUpperCase();
    const isAuthRequired = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    
    const finalOptions: RequestInit = {
      ...options,
      headers: {
        ...getApiHeaders(isAuthRequired),
        ...options.headers
      },
      signal: options.signal || AbortSignal.timeout(API_CONFIG.timeout)
    };

    console.log(`🌐 [${this.constructor.name}] ${method} ${url}`);
    console.log(`🔐 [${this.constructor.name}] Autenticación: ${isAuthRequired ? 'Requerida' : 'No requerida'}`);

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Verificar conectividad antes de hacer la petición
        if (!connectivityService.getStatus()) {
          throw new ApiError('Sin conexión a Internet', 0);
        }

        const response = await fetch(url, finalOptions);
        
        // Log de respuesta
        console.log(`📡 [${this.constructor.name}] Respuesta:`, {
          status: response.status,
          statusText: response.statusText
        });

        // Manejar respuestas no exitosas
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw new ApiError(
            errorData.message || `Error HTTP ${response.status}`,
            response.status,
            errorData
          );
        }

        // Parsear respuesta exitosa
        const data = await this.parseResponse(response);
        
        // Notificar éxito para operaciones de escritura
        if (['POST', 'PUT', 'DELETE'].includes(options.method || '')) {
          NotificationService.success(this.getSuccessMessage(options.method || 'POST'));
        }

        return data;
        
      } catch (error) {
        lastError = error as Error;
        
        // Si es el último intento o un error no recuperable, lanzar
        if (attempt === retries || !this.isRetryableError(error)) {
          throw this.handleError(error);
        }
        
        // Esperar antes de reintentar (backoff exponencial)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`🔄 [${this.constructor.name}] Reintentando en ${delay}ms... (${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw this.handleError(lastError!);
  }

  /**
   * Determina si un error es recuperable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof ApiError) {
      // No reintentar errores de cliente (4xx) excepto 429 (Too Many Requests)
      return error.statusCode === 429 || error.statusCode >= 500;
    }
    // Reintentar errores de red
    return error.name === 'NetworkError' || error.name === 'TimeoutError';
  }

  /**
   * Parsea la respuesta según el tipo de contenido
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('text/')) {
      return response.text();
    } else if (response.status === 204) {
      return null; // No content
    }
    
    return response.blob();
  }

  /**
   * Parsea una respuesta de error
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return { message: await response.text() };
    } catch {
      return { message: response.statusText };
    }
  }

  /**
   * Maneja errores y los convierte en un formato consistente
   */
  private handleError(error: any): Error {
    console.error(`❌ [${this.constructor.name}] Error:`, error);

    if (error instanceof ApiError) {
      // Mostrar notificación de error
      NotificationService.error(error.message);
      return error;
    }

    if (error.name === 'AbortError') {
      const message = 'La petición fue cancelada o excedió el tiempo límite';
      NotificationService.error(message);
      return new ApiError(message, 0);
    }

    const message = error.message || 'Error desconocido';
    NotificationService.error(message);
    return new ApiError(message, 0);
  }

  /**
   * Obtiene mensaje de éxito según la operación
   */
  private getSuccessMessage(method: string): string {
    const entity = this.cacheKey.replace('_', ' ');
    switch (method) {
      case 'POST':
        return `${entity} creado exitosamente`;
      case 'PUT':
        return `${entity} actualizado exitosamente`;
      case 'DELETE':
        return `${entity} eliminado exitosamente`;
      default:
        return 'Operación exitosa';
    }
  }

  /**
   * Normaliza y valida una lista de items
   */
  protected normalizeData(data: any[]): T[] {
    if (!Array.isArray(data)) {
      console.warn(`⚠️ [${this.constructor.name}] Data no es un array, convirtiendo...`);
      data = [data];
    }

    const normalized = data
      .map((item, index) => {
        try {
          const normalizedItem = this.normalizeOptions.normalizeItem(item, index);
          
          // Validar si se proporciona función de validación
          if (this.normalizeOptions.validateItem) {
            if (!this.normalizeOptions.validateItem(normalizedItem, index)) {
              console.warn(`⚠️ [${this.constructor.name}] Item ${index} no pasó la validación`);
              return null;
            }
          }
          
          return normalizedItem;
        } catch (error) {
          console.error(`❌ [${this.constructor.name}] Error normalizando item ${index}:`, error);
          return null;
        }
      })
      .filter((item): item is T => item !== null);

    console.log(`✅ [${this.constructor.name}] ${normalized.length} items normalizados de ${data.length}`);
    return normalized;
  }

  // ==================== MÉTODOS CRUD ====================

  /**
   * Obtiene todos los registros
   */
  public async getAll(params?: QueryParams, useCache: boolean = true): Promise<T[]> {
    const cacheKey = `${this.cacheKey}_all_${JSON.stringify(params || {})}`;
    
    // Intentar obtener del cache
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      const response = await this.makeRequest<ApiResponse<T[]>>(queryString);
      
      const data = Array.isArray(response) ? response : response.data || [];
      const normalized = this.normalizeData(data);
      
      // Guardar en cache
      this.setCachedData(cacheKey, normalized);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error obteniendo todos:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un registro por ID
   */
  public async getById(id: string | number, useCache: boolean = true): Promise<T | null> {
    const cacheKey = `${this.cacheKey}_${id}`;
    
    // Intentar obtener del cache
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.makeRequest<ApiResponse<T>>(`/${id}`);
      const data = response.data || response;
      
      if (!data) return null;
      
      const normalized = this.normalizeData([data])[0] || null;
      
      // Guardar en cache
      if (normalized) {
        this.setCachedData(cacheKey, normalized);
      }
      
      return normalized;
    } catch (error) {
      if ((error as ApiError).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Busca registros según criterios
   */
  public async search(criteria: any, useCache: boolean = true): Promise<T[]> {
    const cacheKey = `${this.cacheKey}_search_${JSON.stringify(criteria)}`;
    
    // Intentar obtener del cache
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const queryString = `?${new URLSearchParams(criteria).toString()}`;
      const response = await this.makeRequest<ApiResponse<T[]>>(queryString);
      
      const data = Array.isArray(response) ? response : response.data || [];
      const normalized = this.normalizeData(data);
      
      // Guardar en cache
      this.setCachedData(cacheKey, normalized);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo registro
   */
  public async create(data: CreateDTO): Promise<T> {
    try {
      const response = await this.makeRequest<ApiResponse<T>>('', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const created = response.data || response;
      const normalized = this.normalizeData([created])[0];
      
      // Limpiar cache relacionado
      this.clearCache();
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error creando:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un registro existente
   */
  public async update(id: string | number, data: UpdateDTO): Promise<T> {
    try {
      const response = await this.makeRequest<ApiResponse<T>>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      const updated = response.data || response;
      const normalized = this.normalizeData([updated])[0];
      
      // Limpiar cache relacionado
      this.clearCache();
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error actualizando:`, error);
      throw error;
    }
  }

  /**
   * Actualización parcial
   */
  public async patch(id: string | number, data: Partial<UpdateDTO>): Promise<T> {
    try {
      const response = await this.makeRequest<ApiResponse<T>>(`/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      
      const updated = response.data || response;
      const normalized = this.normalizeData([updated])[0];
      
      // Limpiar cache relacionado
      this.clearCache();
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error actualizando parcialmente:`, error);
      throw error;
    }
  }

  /**
   * Elimina un registro
   */
  public async delete(id: string | number): Promise<void> {
    try {
      await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      });
      
      // Limpiar cache relacionado
      this.clearCache();
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error eliminando:`, error);
      throw error;
    }
  }

  /**
   * Elimina múltiples registros
   */
  public async deleteMany(ids: (string | number)[]): Promise<void> {
    try {
      await this.makeRequest('/batch-delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      
      // Limpiar cache relacionado
      this.clearCache();
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error eliminando múltiples:`, error);
      throw error;
    }
  }

  /**
   * Obtiene registros paginados
   */
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

  /**
   * Verifica si un registro existe
   */
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

  /**
   * Ejecuta una acción personalizada en un registro
   */
  public async executeAction(id: string | number, action: string, data?: any): Promise<any> {
    try {
      const response = await this.makeRequest(`/${id}/${action}`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
      });
      
      // Limpiar cache ya que una acción puede modificar datos
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error ejecutando acción ${action}:`, error);
      throw error;
    }
  }
}

export default BaseApiService;