// src/services/pisoService.ts

import { BaseApiService } from './BaseApiService';
import { Piso, PisoFormData } from '../models/Piso';
import { API_CONFIG } from '../config/api.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Configuración de normalización para pisos
 */
const pisoNormalizeOptions = {
  normalizeItem: (item: any): Piso => {
    return {
      id: item.id || item.pisoId || item.codPiso,
      
      // Relación con predio
      predioId: item.predioId || item.codPredio || 0,
      predio: item.predio || undefined,
      
      // Datos del piso
      descripcion: item.descripcion || '',
      fechaConstruccion: item.fechaConstruccion || '',
      antiguedad: item.antiguedad || '',
      estadoConservacion: item.estadoConservacion || '',
      areaConstruida: parseFloat(item.areaConstruida) || 0,
      
      // Material
      materialPredominante: item.materialPredominante || '',
      
      // Forma de registro
      formaRegistro: item.formaRegistro || 'INDIVIDUAL',
      
      // Categorías
      categoriasMurosColumnas: item.categoriasMurosColumnas || undefined,
      categoriaTecho: item.categoriaTecho || undefined,
      categoriaPisos: item.categoriaPisos || undefined,
      categoriaRevestimiento: item.categoriaRevestimiento || undefined,
      categoriaPuertasVentanas: item.categoriaPuertasVentanas || undefined,
      categoriaInstalacionesElectricasSanitarias: item.categoriaInstalacionesElectricasSanitarias || undefined,
      
      // Otras instalaciones
      otrasInstalaciones: parseFloat(item.otrasInstalaciones) || 0,
      
      // Valores calculados
      valorConstruccion: parseFloat(item.valorConstruccion) || 0,
      valorDepreciado: parseFloat(item.valorDepreciado) || 0,
      
      // Auditoría
      estado: item.estado !== undefined ? item.estado : true,
      fechaCreacion: item.fechaCreacion || undefined,
      fechaModificacion: item.fechaModificacion || undefined,
      usuarioCreacion: item.usuarioCreacion || undefined,
      usuarioModificacion: item.usuarioModificacion || undefined
    };
  }
};

/**
 * Servicio para manejar las operaciones de pisos
 */
export class PisoService extends BaseApiService<Piso, PisoFormData> {
  private static instance: PisoService;
  
  constructor() {
    const baseURL = import.meta.env.DEV 
      ? (import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080')
      : '';
      
    super(
      baseURL,
      '/api/piso', // endpoint base
      pisoNormalizeOptions,
      'pisos_cache'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PisoService {
    if (!PisoService.instance) {
      PisoService.instance = new PisoService();
    }
    return PisoService.instance;
  }
  
  /**
   * Obtiene todos los pisos de un predio
   */
  async obtenerPorPredio(predioId: number): Promise<Piso[]> {
    try {
      const url = `${this.url}/predio/${predioId}`;
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      if (Array.isArray(response)) {
        return response.map((item: any) => this.normalizeOptions.normalizeItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener pisos del predio:', error);
      return [];
    }
  }
  
  /**
   * Calcula el valor de construcción basado en las categorías seleccionadas
   */
  async calcularValorConstruccion(pisoData: {
    predioId: number;
    areaConstruida: number;
    categorias: Record<string, string>;
    año: number;
  }): Promise<number> {
    try {
      const url = `${this.url}/calcular-valor`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(pisoData)
      });
      
      return response.valorConstruccion || 0;
    } catch (error) {
      console.error('Error al calcular valor de construcción:', error);
      NotificationService.error('Error al calcular valor de construcción');
      return 0;
    }
  }
  
  /**
   * Calcula la depreciación del piso
   */
  async calcularDepreciacion(pisoId: number): Promise<{
    valorOriginal: number;
    porcentajeDepreciacion: number;
    valorDepreciado: number;
  }> {
    try {
      const url = `${this.url}/${pisoId}/calcular-depreciacion`;
      const response = await this.makeRequest(url, {
        method: 'POST'
      });
      
      return {
        valorOriginal: response.valorOriginal || 0,
        porcentajeDepreciacion: response.porcentajeDepreciacion || 0,
        valorDepreciado: response.valorDepreciado || 0
      };
    } catch (error) {
      console.error('Error al calcular depreciación:', error);
      NotificationService.error('Error al calcular depreciación');
      return {
        valorOriginal: 0,
        porcentajeDepreciacion: 0,
        valorDepreciado: 0
      };
    }
  }
  
  /**
   * Busca pisos por predio y año
   */
  async buscarPorPredioYAnio(predioId: number, anio: number): Promise<Piso[]> {
    try {
      const url = `${this.url}/buscar`;
      const queryParams = new URLSearchParams({
        predioId: predioId.toString(),
        anio: anio.toString()
      });
      
      const response = await this.makeRequest(`${url}?${queryParams}`, {
        method: 'GET'
      });
      
      if (Array.isArray(response)) {
        return response.map((item: any) => this.normalizeOptions.normalizeItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('Error al buscar pisos:', error);
      NotificationService.error('Error al buscar pisos');
      return [];
    }
  }
  
  /**
   * Obtiene el resumen de valores de pisos de un predio
   */
  async obtenerResumenPorPredio(predioId: number, anio: number): Promise<{
    totalAreaConstruida: number;
    totalValorConstruccion: number;
    totalValorDepreciado: number;
    cantidadPisos: number;
  }> {
    try {
      const url = `${this.url}/predio/${predioId}/resumen`;
      const queryParams = new URLSearchParams({
        anio: anio.toString()
      });
      
      const response = await this.makeRequest(`${url}?${queryParams}`, {
        method: 'GET'
      });
      
      return {
        totalAreaConstruida: response.totalAreaConstruida || 0,
        totalValorConstruccion: response.totalValorConstruccion || 0,
        totalValorDepreciado: response.totalValorDepreciado || 0,
        cantidadPisos: response.cantidadPisos || 0
      };
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      return {
        totalAreaConstruida: 0,
        totalValorConstruccion: 0,
        totalValorDepreciado: 0,
        cantidadPisos: 0
      };
    }
  }
}

// Exportar instancia singleton
export const pisoService = PisoService.getInstance();