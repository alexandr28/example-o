// src/utils/calleAdapter.ts
import { CalleData } from '../services/calleApiService';
import { Calle, TIPO_VIA_OPTIONS } from '../models/Calle';
import { useCalles } from '../hooks/useCalles';

/**
 * Constantes para tipos de vía
 */
const TipoViaConstants = {
  AVENIDA: 'AVENIDA',
  CALLE: 'CALLE',
  JIRON: 'JIRON',
  PASAJE: 'PASAJE',
  MALECON: 'MALECON',
  PLAZA: 'PLAZA',
  PARQUE: 'PARQUE'
} as const;

/**
 * Adaptador para transformar entre el modelo de dominio (Calle) 
 * y el modelo de la API (CalleData)
 */
export class CalleAdapter {
  /**
   * Convierte CalleData (API) a Calle (modelo de dominio)
   */
  static fromApiToModel(apiData: CalleData): Calle {
    // Determinar el tipo de vía basado en el nombre o código
    const tipoVia = this.inferirTipoVia(apiData.nombreVia || '');
    
    return {
      id: apiData.codigo,
      codTipoVia: apiData.codigoVia,
      tipoVia: tipoVia,
      nombre: apiData.nombre,
      nombreVia: apiData.nombreVia,
      descripTipoVia: apiData.nombreVia,
      
      // Mapear a los campos del modelo antiguo
      codSector: 0, // No viene en la API, se debe obtener del barrio
      codBarrio: apiData.codigoBarrio,
      
      estado: apiData.estado,
      fechaCreacion: apiData.fechaRegistro,
      fechaModificacion: apiData.fechaModificacion,
      usuarioCreacion: apiData.codUsuario?.toString(),
      usuarioModificacion: apiData.codUsuario?.toString()
    };
  }

  /**
   * Convierte Calle (modelo de dominio) a CreateCalleDTO
   */
  static fromModelToCreateDTO(calle: Partial<Calle>): any {
    return {
      codigoBarrio: calle.codBarrio || 0,
      codigoVia: calle.codTipoVia || 2, // Default to CALLE
      nombre: calle.nombre || '',
      descripcion: ''
    };
  }

  /**
   * Infiere el tipo de vía desde el nombre de la API
   */
  private static inferirTipoVia(nombreVia: string): string {
    const nombreNormalizado = nombreVia.toLowerCase().trim();
    
    // Mapeo de nombres de API a tipos de vía del modelo
    const mapeo: Record<string, string> = {
      'avenida': TipoViaConstants.AVENIDA,
      'av.': TipoViaConstants.AVENIDA,
      'calle': TipoViaConstants.CALLE,
      'ca.': TipoViaConstants.CALLE,
      'jirón': TipoViaConstants.JIRON,
      'jiron': TipoViaConstants.JIRON,
      'jr.': TipoViaConstants.JIRON,
      'pasaje': TipoViaConstants.PASAJE,
      'pj.': TipoViaConstants.PASAJE,
      'malecón': TipoViaConstants.MALECON,
      'malecon': TipoViaConstants.MALECON,
      'ml.': TipoViaConstants.MALECON,
      'plaza': TipoViaConstants.PLAZA,
      'pz.': TipoViaConstants.PLAZA,
      'parque': TipoViaConstants.PARQUE,
      'pq.': TipoViaConstants.PARQUE
    };

    return mapeo[nombreNormalizado] || TipoViaConstants.CALLE;
  }

  /**
   * Obtiene el código de vía basado en el tipo
   */
  private static obtenerCodigoVia(tipoVia: string): number {
    // Mapeo de tipos a códigos (basado en tu API)
    const mapeo: Record<string, number> = {
      [TipoViaConstants.AVENIDA]: 1,
      [TipoViaConstants.CALLE]: 2,
      [TipoViaConstants.JIRON]: 3,
      [TipoViaConstants.PASAJE]: 4,
      [TipoViaConstants.MALECON]: 6,
      [TipoViaConstants.PLAZA]: 8,
      [TipoViaConstants.PARQUE]: 9
    };

    return mapeo[tipoVia] || 2; // Por defecto CALLE
  }
}

// Hook helper para usar con el adaptador
export const useCallesConAdapter = () => {
  const hookOriginal = useCalles(); // Importar el hook actualizado
  
  // Transformar las calles al modelo antiguo si es necesario
  const callesAdaptadas = hookOriginal.calles.map(CalleAdapter.fromApiToModel);
  
  return {
    ...hookOriginal,
    calles: callesAdaptadas,
    calleSeleccionada: hookOriginal.calleSeleccionada 
      ? CalleAdapter.fromApiToModel(hookOriginal.calleSeleccionada)
      : null
  };
};