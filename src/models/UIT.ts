/**
 * Modelo que representa una Unidad Impositiva Tributaria (UIT)
 */
export interface UIT {
  /**
   * Identificador único de la UIT
   */
  id?: number;
  
  /**
   * Año fiscal al que corresponde la UIT
   */
  anio: number;
  
  /**
   * Valor de la UIT (valor numérico)
   */
  uit: number;
  
  /**
   * Tasa impositiva aplicable
   */
  tasa: number;
  
  /**
   * Rango inicial para aplicar la tasa
   */
  rangoInicial: number;
  
  /**
   * Rango final para aplicar la tasa
   */
  rangoFinal: number;
  
  /**
   * Impuesto parcial calculado
   */
  impuestoParcial: number;
  
  /**
   * Impuesto acumulado hasta este rango
   */
  impuestoAcumulado: string;
}

/**
 * Modelo que representa una alícuota (tasa impositiva para un rango)
 */
export interface Alicuota {
  /**
   * Identificador único de la alícuota
   */
  id?: number;
  
  /**
   * Descripción del rango (ej: "Hasta 15 UIT")
   */
  descripcion: string;
  
  /**
   * Valor de la tasa aplicable a este rango
   */
  tasa: number;
  
  /**
   * Valor mínimo del rango en UIT
   */
  uitMinimo?: number;
  
  /**
   * Valor máximo del rango en UIT
   */
  uitMaximo?: number;
}

/**
 * Modelo para el cálculo de impuestos basado en UIT
 */
export interface CalculoUIT {
  /**
   * Año fiscal para el cálculo
   */
  anio: number;
  
  /**
   * Monto sobre el cual se calculará el impuesto
   */
  monto: number;
  
  /**
   * Resultado del cálculo (impuesto a pagar)
   */
  resultado?: number;
}