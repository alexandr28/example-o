// src/services/BaseApiService.ts - VERSIÓN CORREGIDA SIN AUTH

import { buildApiUrl, API_CONFIG } from '../config/api.unified.config';
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
 * Obtener headers básicos SIN AUTENTICACIÓN
 */
const getBasicHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

/**
 * Clase base para todos los servicios de API
 * NO MANEJA AUTENTICACIÓN - Todos los métodos son públicos
 */
export default abstract class BaseApiService<T, CreateDTO = any, UpdateDTO = any> {
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
    console.log(`  - Autenticación: NO REQUERIDA`);
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
   * Obtener datos del cache
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
   * Realiza una petición HTTP SIN AUTENTICACIÓN
   * IMPORTANTE: No envía ningún header Authorization
   */
  protected async makeRequest<R = any>(
    path: string = '',
    options: RequestInit = {},
    retries: number = API_CONFIG.retries
  ): Promise<R> {
    const url = buildApiUrl(this.endpoint + path);
    const method = (options.method || 'GET').toUpperCase();
    
    // IMPORTANTE: Usar solo headers básicos, sin autenticación
    const basicHeaders = getBasicHeaders();
    
    // Si hay headers personalizados en options, filtrar Authorization
    let customHeaders = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        customHeaders = {};
        options.headers.forEach((value, key) => {
          // IMPORTANTE: Ignorar cualquier header Authorization
          if (key.toLowerCase() !== 'authorization') {
            customHeaders[key] = value;
          }
        });
      } else if (Array.isArray(options.headers)) {
        customHeaders = {};
        options.headers.forEach(([key, value]) => {
          if (key.toLowerCase() !== 'authorization') {
            customHeaders[key] = value;
          }
        });
      } else {
        // Filtrar Authorization de objeto plano
        const { Authorization, authorization, ...rest } = options.headers as any;
        customHeaders = rest;
      }
    }
    
    // Combinar headers asegurándose de NO incluir Authorization
    const finalHeaders = {
      ...basicHeaders,
      ...customHeaders
    };
    
    // Verificar que no haya Authorization
    if ('Authorization' in finalHeaders || 'authorization' in finalHeaders) {
      console.warn('⚠️ Se detectó header Authorization, eliminándolo...');
      delete finalHeaders['Authorization'];
      delete finalHeaders['authorization'];
    }
    
    const finalOptions: RequestInit = {
      ...options,
      method,
      headers: finalHeaders,
      signal: options.signal || AbortSignal.timeout(API_CONFIG.timeout)
    };
    
    // Si hay body, asegurarse de que sea string
    if (options.body && typeof options.body !== 'string') {
      finalOptions.body = JSON.stringify(options.body);
    }

    console.log(`🌐 [${this.constructor.name}] ${method} ${url}`);
    console.log(`🔓 [${this.constructor.name}] Sin autenticación`);
    console.log(`📋 Headers enviados:`, finalHeaders);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, finalOptions);
        
        console.log(`📡 [${this.constructor.name}] Respuesta: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          
          console.error(`❌ Error Response:`, errorData);
          
          throw new ApiError(
            errorData?.message || `Error ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }
        
        // Manejar respuesta vacía
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return null as any;
        }
        
        // Intentar parsear JSON
        const responseText = await response.text();
        if (!responseText) {
          return null as any;
        }
        
        try {
          return JSON.parse(responseText);
        } catch {
          // Si no es JSON, devolver el texto
          return responseText as any;
        }
        
      } catch (error: any) {
        console.error(`❌ [${this.constructor.name}] Error en intento ${attempt + 1}:`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    throw new Error('Máximo de reintentos alcanzado');
  }

  /**
   * Normalizar datos según las opciones de normalización
   */
  protected normalizeData(data: any[]): T[] {
    if (!Array.isArray(data)) {
      console.warn(`⚠️ [${this.constructor.name}] Datos no son un array:`, data);
      return [];
    }

    const normalized = data.map((item, index) => 
      this.normalizeOptions.normalizeItem(item, index)
    );

    if (this.normalizeOptions.validateItem) {
      const validItems = normalized.filter((item, index) => {
        const isValid = this.normalizeOptions.validateItem!(item, index);
        if (!isValid) {
          console.warn(`⚠️ [${this.constructor.name}] Item ${index} no válido`);
        }
        return isValid;
      });
      
      console.log(`✅ [${this.constructor.name}] ${validItems.length}/${normalized.length} items válidos`);
      return validItems;
    }

    return normalized;
  }

  // ========================================
  // MÉTODOS CRUD - SIN AUTENTICACIÓN
  // ========================================

  /**
   * Obtener todos los registros
   */
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
      const response = await this.makeRequest<any>(queryString, {
        method: 'GET'
      });
      
      const data = Array.isArray(response) ? response : response.data || [];
      const normalized = this.normalizeData(data);
      
      this.setCachedData(cacheKey, normalized);
      
      return normalized;
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error obteniendo todos:`, error);
      throw error;
    }
  }

  /**
   * Obtener por ID
   */
  public async getById(id: string | number): Promise<T | null> {
    const cacheKey = `${this.cacheKey}_${id}`;
    
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const response = await this.makeRequest<any>(`/${id}`, {
        method: 'GET'
      });
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

  /**
   * Crear nuevo registro
   */
  public async create(data: CreateDTO): Promise<T> {
    try {
      console.log('➕ [BaseApiService] Creando:', data);
      
      const response = await this.makeRequest<any>('', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      const created = response.data || response;
      const normalized = this.normalizeData([created])[0];
      
      // Limpiar cache después de crear
      this.clearCache();
      NotificationService.success('Registro creado exitosamente');
      
      return normalized;
    } catch (error: any) {
      console.error('❌ [BaseApiService] Error al crear:', error);
      NotificationService.error(error.message || 'Error al crear el registro');
      throw error;
    }
  }

  /**
   * Actualizar registro
   */
  public async update(id: string | number, data: UpdateDTO): Promise<T> {
    try {
      console.log('📝 [BaseApiService] Actualizando:', id, data);
      
      const response = await this.makeRequest<any>(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      const updated = response.data || response;
      const normalized = this.normalizeData([updated])[0];
      
      // Limpiar cache después de actualizar
      this.clearCache();
      NotificationService.success('Registro actualizado exitosamente');
      
      return normalized;
    } catch (error: any) {
      console.error('❌ [BaseApiService] Error al actualizar:', error);
      NotificationService.error(error.message || 'Error al actualizar el registro');
      throw error;
    }
  }

  /**
   * Eliminar registro
   */
  public async delete(id: string | number): Promise<void> {
    try {
      console.log('🗑️ [BaseApiService] Eliminando:', id);
      
      await this.makeRequest(`/${id}`, {
        method: 'DELETE'
      });
      
      // Limpiar cache después de eliminar
      this.clearCache();
      NotificationService.success('Registro eliminado exitosamente');
      
    } catch (error: any) {
      console.error('❌ [BaseApiService] Error al eliminar:', error);
      NotificationService.error(error.message || 'Error al eliminar el registro');
      throw error;
    }
  }

  /**
   * Buscar registros
   */
  public async search(params: Record<string, any>): Promise<T[]> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.makeRequest<any>(`?${queryString}`, {
        method: 'GET'
      });
      
      const data = Array.isArray(response) ? response : response.data || [];
      return this.normalizeData(data);
      
    } catch (error) {
      console.error(`❌ [${this.constructor.name}] Error en búsqueda:`, error);
      throw error;
    }
  }
}