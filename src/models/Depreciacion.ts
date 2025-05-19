/**
 * Enumeración para los materiales de construcción
 */
export enum Material {
  CONCRETO = 'Concreto',
  LADRILLO = 'Ladrillo',
  ADOBE = 'Adobe'
}

/**
 * Enumeración para los rangos de antigüedad
 */
export enum Antiguedad {
  HASTA_5 = 'Hasta 5 años',
  HASTA_10 = 'Hasta 10 años',
  HASTA_15 = 'Hasta 15 años',
  HASTA_20 = 'Hasta 20 años',
  HASTA_25 = 'Hasta 25 años',
  HASTA_30 = 'Hasta 30 años',
  HASTA_35 = 'Hasta 35 años',
  HASTA_40 = 'Hasta 40 años',
  HASTA_45 = 'Hasta 45 años',
  HASTA_50 = 'Hasta 50 años',
  MAS_50 = 'Más de 50 años'
}

/**
 * Enumeración para los estados de conservación
 */
export enum EstadoConservacion {
  MUY_BUENO = 'Muy bueno',
  BUENO = 'Bueno',
  REGULAR = 'Regular',
  MALO = 'Malo'
}

/**
 * Modelo que representa un valor de depreciación
 */
export interface Depreciacion {
  /**
   * Identificador único del registro de depreciación
   */
  id?: number;
  
  /**
   * Año fiscal al que corresponde la depreciación
   */
  anio: number;
  
  /**
   * Tipo de casa (puede ser utilizado como categoría genérica)
   */
  tipoCasa: string;

  /**
   * Material de construcción
   */
  material: Material;
  
  /**
   * Rango de antigüedad
   */
  antiguedad: Antiguedad;
  
  /**
   * Porcentaje de depreciación para estado muy bueno
   */
  porcMuyBueno: number;
  
  /**
   * Porcentaje de depreciación para estado bueno
   */
  porcBueno: number;
  
  /**
   * Porcentaje de depreciación para estado regular
   */
  porcRegular: number;
  
  /**
   * Porcentaje de depreciación para estado malo
   */
  porcMalo: number;
  
  /**
   * Estado del registro
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
 * Datos para el formulario de registro/edición de Depreciación
 */
export interface DepreciacionFormData {
  /**
   * Año fiscal a registrar
   */
  anio: number | null;
  
  /**
   * Tipo de casa seleccionado
   */
  tipoCasa: string | null;
  
  /**
   * Material seleccionado
   */
  material: Material;
  
  /**
   * Antigüedad seleccionada
   */
  antiguedad: Antiguedad;
  
  /**
   * Valor para estado muy bueno
   */
  porcMuyBueno: number;
  
  /**
   * Valor para estado bueno
   */
  porcBueno: number;
  
  /**
   * Valor para estado regular
   */
  porcRegular: number;
  
  /**
   * Valor para estado malo
   */
  porcMalo: number;
}

/**
 * Filtro para búsqueda de depreciaciones
 */
export interface FiltroDepreciacion {
  /**
   * Año para filtrar
   */
  anio?: number;
  
  /**
   * Tipo de casa para filtrar
   */
  tipoCasa?: string;
}

/**
 * Opciones para paginación en módulo de depreciación
 * Renombrado para evitar colisión con Alcabala
 */
export interface DepreciacionPaginacionOptions {
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