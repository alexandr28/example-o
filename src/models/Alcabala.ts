/**
 * Modelo que representa un valor de Alcabala
 */
export interface Alcabala {
  /**
   * Identificador único del registro de Alcabala
   */
  id?: number;
  
  /**
   * Año fiscal al que corresponde la tasa de Alcabala
   */
  anio: number;
  
  /**
   * Tasa de Alcabala aplicable
   */
  tasa: number;
  
  /**
   * Estado del registro de Alcabala
   */
  estado?: 'ACTIVO' | 'INACTIVO';
  
  /**
   * Fecha de creación del registro
   */
  fechaCreacion?: Date;
  
  /**
   * Fecha de última modificación del registro
   */
  fechaModificacion?: Date;
}

/**
 * Datos para el formulario de registro/edición de Alcabala
 */
export interface AlcabalaFormData {
  /**
   * Año fiscal a registrar
   */
  anio: number | null;
  
  /**
   * Tasa de Alcabala a aplicar
   */
  tasa: number;
}

/**
 * Opciones para paginación
 */
export interface PaginacionOptions {
  /**
   * Página actual
   */
  pagina: number;
  
  /**
   * Cantidad de elementos por página
   */
  porPagina: number;
  
  /**
   * Total de elementos
   */
  total: number;
}