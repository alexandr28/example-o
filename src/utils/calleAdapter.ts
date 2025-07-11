// src/utils/calleAdapter.ts
import { CalleData } from '../services/calleApiService';
import { Calle, TipoVia, TIPO_VIA_OPTIONS } from '../models/Calle';
import { useCalles } from '../hooks/useCalles';

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
      sectorId: 0, // No viene en la API, se debe obtener del barrio
      barrioId: apiData.codigoBarrio,
      
      estado: apiData.estado === 'ACTIVO',
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
    // Encontrar el código de vía basado en el tipo
    const tipoViaOption = TIPO_VIA_OPTIONS.find(opt => opt.value === calle.tipoVia);
    
    return {
      codigoBarrio: calle.barrioId || 0,
      codigoVia: calle.codTipoVia || this.obtenerCodigoVia(calle.tipoVia || ''),
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
      'avenida': TipoVia.AVENIDA,
      'av.': TipoVia.AVENIDA,
      'calle': TipoVia.CALLE,
      'ca.': TipoVia.CALLE,
      'jirón': TipoVia.JIRON,
      'jiron': TipoVia.JIRON,
      'jr.': TipoVia.JIRON,
      'pasaje': TipoVia.PASAJE,
      'pj.': TipoVia.PASAJE,
      'malecón': TipoVia.MALECON,
      'malecon': TipoVia.MALECON,
      'ml.': TipoVia.MALECON,
      'plaza': TipoVia.PLAZA,
      'pz.': TipoVia.PLAZA,
      'parque': TipoVia.PARQUE,
      'pq.': TipoVia.PARQUE
    };

    return mapeo[nombreNormalizado] || TipoVia.CALLE;
  }

  /**
   * Obtiene el código de vía basado en el tipo
   */
  private static obtenerCodigoVia(tipoVia: string): number {
    // Mapeo de tipos a códigos (basado en tu API)
    const mapeo: Record<string, number> = {
      [TipoVia.AVENIDA]: 1,
      [TipoVia.CALLE]: 2,
      [TipoVia.JIRON]: 3,
      [TipoVia.PASAJE]: 4,
      [TipoVia.MALECON]: 6,
      [TipoVia.PLAZA]: 8,
      [TipoVia.PARQUE]: 9
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