import { Barrio, Sector } from '../models';

/**
 * Tipo para metadatos de paginación
 */
export interface PaginationMeta {
  /**
   * Número total de elementos
   */
  total?: number;
  
  /**
   * Página actual
   */
  currentPage?: number;
  
  /**
   * Cantidad de elementos por página
   */
  perPage?: number;
  
  /**
   * Total de páginas
   */
  totalPages?: number;
}

/**
 * Interfaz genérica para respuestas de la API
 */
export interface ApiResponse<T> {
  /**
   * Indica si la operación fue exitosa
   */
  success: boolean;
  
  /**
   * Datos devueltos por la API
   */
  data: T;
  
  /**
   * Mensaje descriptivo (éxito o error)
   */
  message?: string;
  
  /**
   * Código de estado HTTP
   */
  statusCode?: number;
  
  /**
   * Metadatos adicionales (paginación, etc.)
   */
  meta?: PaginationMeta;
}

/**
 * Tipo para respuesta de un barrio
 */
export type BarrioResponse = ApiResponse<Barrio>;

/**
 * Tipo para respuesta de lista de barrios
 */
export type BarriosListResponse = ApiResponse<Barrio[]>;

/**
 * Tipo para respuesta de un sector
 */
export type SectorResponse = ApiResponse<Sector>;

/**
 * Tipo para respuesta de lista de sectores
 */
export type SectoresListResponse = ApiResponse<Sector[]>;

/**
 * Tipo para detalles de error
 */
export interface ErrorDetails {
  /**
   * Tipo de error
   */
  type?: string;
  
  /**
   * Detalles específicos del error
   * Usamos Record<string, unknown> en lugar de any
   */
  details?: Record<string, unknown>;
}

/**
 * Respuesta de error de la API
 */
export interface ApiErrorResponse {
  /**
   * Indica que la operación ha fallado
   */
  success: false;
  
  /**
   * Mensaje de error
   */
  message: string;
  
  /**
   * Código de estado HTTP
   */
  statusCode: number;
  
  /**
   * Información detallada del error
   */
  error?: ErrorDetails;
}