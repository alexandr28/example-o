// src/utils/formatters.ts
/**
 * Formatea un número como moneda en soles peruanos
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  /**
   * Formatea una fecha
   */
  export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  };
  
  /**
   * Formatea un número con separadores de miles
   */
  export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-PE').format(value);
  };