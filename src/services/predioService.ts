// src/services/predioService.ts

import { BaseApiService } from './BaseApiService';
import { Predio, PredioFormData, FiltroPredio } from '../models/Predio';
import { API_CONFIG } from '../config/api.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Configuración de normalización para predios
 */
const predioNormalizeOptions = {
  normalizeItem: (item: any): Predio => {
    return {
      id: item.id || item.predioId || item.codPredio,
      codigoPredio: item.codPredio?.trim() || item.codigo || '',
      
      // Relación con contribuyente
      contribuyenteId: item.contribuyenteId || item.codContribuyente || 0,
      contribuyente: item.contribuyente || undefined,
      
      // Datos de adquisición
      anioAdquisicion: item.anio || item.anioAdquisicion || new Date().getFullYear(),
      fechaAdquisicion: item.fechaAdquisicion || '',
      condicionPropiedad: item.condicionPropiedad || '',
      
      // Ubicación
      direccionId: item.direccionId || item.codDireccion || 0,
      direccion: item.direccion || undefined,
      nFinca: item.numeroFinca || item.nFinca || '',
      otroNumero: item.otroNumero || '',
      
      // Características
      tipoPredio: item.tipoPredio || item.estadoPredio || item.codTipoPredio || '',
      conductor: item.conductor || item.codListaConductor || '',
      usoPredio: item.usoPredio || item.codUsoPredio || '',
      
      // Valores
      areaTerreno: parseFloat(item.areaTerreno) || 0,
      valorArancel: parseFloat(item.valorArancel) || 0,
      valorTerreno: parseFloat(item.valorTerreno) || 0,
      valorConstruccion: parseFloat(item.valorTotalConstruccion) || parseFloat(item.valorConstruccion) || 0,
      otrasInstalaciones: parseFloat(item.otrasInstalaciones) || 0,
      autoavalo: parseFloat(item.autoavaluo) || 0,
      
      // Datos adicionales
      numeroPisos: parseInt(item.numeroPisos) || 0,
      numeroCondominos: parseInt(item.numeroCondominos) || 1,
      
      // Campos adicionales del API
      estadoPredio: item.estadoPredio || '',
      totalAreaConstruccion: parseFloat(item.totalAreaConstruccion) || 0,
      
      // Imágenes
      rutaFotografiaPredio: item.rutaFotografiaPredio || undefined,
      rutaPlanoPredio: item.rutaPlanoPredio || undefined,
      
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
 * Servicio para manejar las operaciones de predios
 */
export class PredioService extends BaseApiService<Predio, PredioFormData> {
  private static instance: PredioService;
  
  constructor() {
    const baseURL = import.meta.env.DEV 
      ? (import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080')
      : '';
      
    super(
      baseURL,
      API_CONFIG.endpoints.predios, // '/api/predio'
      predioNormalizeOptions,
      'predios_cache'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PredioService {
    if (!PredioService.instance) {
      PredioService.instance = new PredioService();
    }
    return PredioService.instance;
  }
  
  /**
   * Obtiene todos los predios con filtros usando query parameters
   */
  async getAll(filtros?: { codPredio?: string; anio?: number; direccion?: number }): Promise<Predio[]> {
    try {
      let url = this.url;
      
      // Si hay filtros, agregarlos como query parameters
      if (filtros && Object.keys(filtros).length > 0) {
        const params = new URLSearchParams();
        
        if (filtros.codPredio) {
          params.append('codPredio', filtros.codPredio);
        }
        if (filtros.anio) {
          params.append('anio', filtros.anio.toString());
        }
        if (filtros.direccion) {
          params.append('direccion', filtros.direccion.toString());
        }
        
        url = `${this.url}?${params.toString()}`;
        console.log('🔍 GET Predios con filtros:', url);
      }
      
      // Hacer GET request
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // La API devuelve { success, message, data }
      if (response && response.success && response.data) {
        const predios = response.data.map((item: any) => this.normalizeOptions.normalizeItem(item));
        this.saveToCache(predios);
        console.log(`✅ ${predios.length} predios encontrados`);
        return predios;
      } else if (Array.isArray(response)) {
        // Por si la API devuelve directamente un array
        const predios = response.map((item: any) => this.normalizeOptions.normalizeItem(item));
        this.saveToCache(predios);
        return predios;
      }
      
      return [];
      
    } catch (error) {
      console.error('Error al obtener predios:', error);
      NotificationService.error('Error al obtener predios');
      
      // Intentar devolver del caché
      const cached = this.loadFromCache();
      if (cached && cached.length > 0) {
        return cached;
      }
      
      return [];
    }
  }
  
  /**
   * Busca predios usando query parameters
   * @param codPredio - Código del predio
   * @param anio - Año
   * @param direccion - ID de dirección
   */
  async buscarPredios(codPredio?: string, anio?: number, direccion?: number): Promise<Predio[]> {
    try {
      const params = new URLSearchParams();
      
      // Agregar solo los parámetros que tienen valor
      if (codPredio) {
        params.append('codPredio', codPredio);
      }
      if (anio) {
        params.append('anio', anio.toString());
      }
      if (direccion) {
        params.append('direccion', direccion.toString());
      }
      
      const url = `${this.url}?${params.toString()}`;
      
      // Log para debug
      console.log('🔍 GET Buscando predios:', url);
      
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // La API devuelve { success, message, data }
      if (response && response.success && response.data) {
        const predios = response.data.map((item: any) => this.normalizeOptions.normalizeItem(item));
        console.log(`✅ ${predios.length} predios encontrados`);
        return predios;
      } else if (Array.isArray(response)) {
        // Por si la API devuelve directamente un array
        const predios = response.map((item: any) => this.normalizeOptions.normalizeItem(item));
        return predios;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ Error al buscar predios:', error);
      
      // Manejo específico de errores
      if (error.status === 403) {
        NotificationService.error('No tiene permisos para realizar esta búsqueda');
      } else if (error.status === 400) {
        NotificationService.error('Datos de búsqueda inválidos');
      } else {
        NotificationService.error('Error al buscar predios');
      }
      
      return [];
    }
  }
  
  /**
   * Obtiene predios por contribuyente
   */
  async obtenerPorContribuyente(contribuyenteId: number): Promise<Predio[]> {
    try {
      const url = `${this.url}/contribuyente/${contribuyenteId}`;
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      if (Array.isArray(response)) {
        return response.map((item: any) => this.normalizeOptions.normalizeItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener predios del contribuyente:', error);
      return [];
    }
  }
  
  /**
   * Calcula el autoavalúo de un predio
   */
  async calcularAutoavalo(predioId: number): Promise<number> {
    try {
      const url = `${this.url}/${predioId}/calcular-autoavalo`;
      const response = await this.makeRequest(url, {
        method: 'POST'
      });
      
      return response.autoavalo || 0;
    } catch (error) {
      console.error('Error al calcular autoavalúo:', error);
      NotificationService.error('Error al calcular autoavalúo');
      return 0;
    }
  }
  
  /**
   * Genera código de predio
   */
  async generarCodigoPredio(data: {
    sectorId: number;
    manzana: string;
    lote: string;
  }): Promise<string> {
    try {
      const url = `${this.url}/generar-codigo`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      return response.codigo || '';
    } catch (error) {
      console.error('Error al generar código de predio:', error);
      NotificationService.error('Error al generar código de predio');
      return '';
    }
  }
}

// Exportar instancia singleton
export const predioService = PredioService.getInstance();