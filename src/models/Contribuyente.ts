/**
 * Modelo que representa a un contribuyente en el sistema
 */
export interface Contribuyente {
  /**
   * Código único del contribuyente
   */
  codigo: string;
  
  /**
   * Nombre completo o razón social del contribuyente
   */
  nombre: string;
  
  /**
   * Número de documento de identidad o RUC
   */
  documento: string;
  
  /**
   * Dirección fiscal del contribuyente
   */
  direccion: string;
  
  /**
   * Tipo de contribuyente (natural o jurídica)
   */
  tipo?: 'natural' | 'juridica';
  
  /**
   * Estado del contribuyente
   */
  estado?: 'activo' | 'inactivo';
}

/**
 * Filtro para búsqueda de contribuyentes
 */
export interface FiltroContribuyente {
  /**
   * Tipo de contribuyente (natural o jurídica)
   */
  tipoContribuyente?: string;
  
  /**
   * Término de búsqueda para nombre, documento o dirección
   */
  busqueda?: string;
}

/**
 * Resultado paginado de búsqueda de contribuyentes
 */
export interface ResultadoContribuyentes {
  /**
   * Lista de contribuyentes en la página actual
   */
  contribuyentes: Contribuyente[];
  
  /**
   * Número total de contribuyentes que cumplen con el filtro
   */
  total: number;
  
  /**
   * Página actual
   */
  pagina: number;
  
  /**
   * Número de elementos por página
   */
  porPagina: number;
}