// src/services/sectorService.ts - VERSIÓN CORREGIDA CON nombreSector

import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Sector
 */
export interface SectorData {
  codSector: number;
  nombreSector: string;
  cuadrante?: number | null;
  nombreCuadrante?: string | null;
}

export interface CreateSectorDTO {
  nombreSector: string;
  cuadrante?: number | null;
}

export interface UpdateSectorDTO {
  nombreSector?: string;
  cuadrante?: number | null;
}

export interface BusquedaSectorParams {
  nombreSector?: string;
  cuadrante?: number;
}

export interface CuadranteData {
  codCuadrante: number;
  descripcion?: string | null;
  abreviatura: string;
  referenciaBarrio?: string | null;
}

/**
 * Servicio para gestión de sectores
 * IMPORTANTE: El API espera "nombreSector" no "nombre"
 */
class SectorService extends BaseApiService<SectorData, CreateSectorDTO, UpdateSectorDTO> {
  private static instance: SectorService;
  
  private constructor() {
    super(
      '/api/sector',
      {
        normalizeItem: (item: any) => ({
          codSector: item.codSector || 0,
          nombreSector: item.nombreSector || '',
          cuadrante: item.cuadrante || null,
          nombreCuadrante: item.nombreCuadrante || (item.cuadrante ? `Cuadrante ${item.cuadrante}` : null)
        }),
        
        validateItem: (item: SectorData) => {
          return !!item.codSector && !!item.nombreSector && item.nombreSector.trim().length > 0;
        }
      },
      'sector_cache'
    );
  }
  
  static getInstance(): SectorService {
    if (!SectorService.instance) {
      SectorService.instance = new SectorService();
    }
    return SectorService.instance;
  }
  
  /**
   * Sobrescribir getAll para usar el endpoint sin autenticación
   */
  async getAll(): Promise<SectorData[]> {
    try {
      console.log('📋 [SectorService] Obteniendo todos los sectores desde:', `${API_CONFIG.baseURL}/api/sector`);
      
      const response = await fetch(`${API_CONFIG.baseURL}/api/sector`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO Authorization header
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📡 [SectorService] Datos recibidos:', data);
      
      // Si es un array, procesarlo directamente con normalización local
      if (Array.isArray(data)) {
        return data.map(item => ({
          codSector: item.codSector || 0,
          nombreSector: item.nombreSector || '',
          cuadrante: typeof item.cuadrante === 'number' ? item.cuadrante : null,
          nombreCuadrante: item.nombreCuadrante || (item.cuadrante ? `Cuadrante ${item.cuadrante}` : null)
        }));
      }
      
      throw new Error('La respuesta no es un array válido');
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo sectores:', error);
      throw error;
    }
  }
  
  /**
   * Método POST directo al API
   */
  async create(datos: CreateSectorDTO): Promise<SectorData> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/sector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datos)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Manejar diferentes tipos de respuesta
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          codSector: data.codSector || Date.now(),
          nombreSector: datos.nombreSector,
          cuadrante: datos.cuadrante
        };
      } else {
        // Si respuesta es texto/número, asumir éxito
        const responseText = await response.text();
        const possibleId = parseInt(responseText);
        
        return {
          codSector: !isNaN(possibleId) ? possibleId : Date.now(),
          nombreSector: datos.nombreSector,
          cuadrante: datos.cuadrante
        };
      }
    } catch (error: any) {
      console.error('❌ [SectorService] Error en POST:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo sector
   */
  async crearSector(datos: { nombreSector: string; cuadrante?: number }): Promise<SectorData> {
    try {
      // Validaciones
      if (!datos.nombreSector || datos.nombreSector.trim().length === 0) {
        throw new Error('El nombre del sector es requerido');
      }
      
      if (datos.nombreSector.trim().length < 3) {
        throw new Error('El nombre del sector debe tener al menos 3 caracteres');
      }
      
      const datosParaAPI: CreateSectorDTO = {
        nombreSector: datos.nombreSector.trim(),
        cuadrante: datos.cuadrante || null
      };
      
      console.log('📤 Enviando al API:', datosParaAPI);
      
      const resultado = await this.create(datosParaAPI);
      
      return resultado;
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error creando sector:', error);
      throw error;
    }
  }
  
  /**
   * Método PUT directo al API
   */
  async update(id: number, datos: UpdateSectorDTO): Promise<SectorData> {
    try {
      // Preparar el payload con la estructura completa requerida
      const payload = {
        codSector: id,
        nombreSector: datos.nombreSector || '',
        cuadrante: datos.cuadrante || null,
        nombreCuadrante: datos.cuadrante ? `Cuadrante ${datos.cuadrante}` : null
      };

      console.log('📤 [SectorService] Enviando PUT:', payload);

      const response = await fetch(`${API_CONFIG.baseURL}/api/sector`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Manejar diferentes tipos de respuesta
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          codSector: data.codSector || id,
          nombreSector: data.nombreSector || datos.nombreSector || '',
          cuadrante: data.cuadrante || datos.cuadrante || null
        };
      } else {
        // Si respuesta es texto/número, asumir éxito
        return {
          codSector: id,
          nombreSector: datos.nombreSector || '',
          cuadrante: datos.cuadrante || null
        };
      }
    } catch (error: any) {
      console.error('❌ [SectorService] Error en PUT:', error);
      throw error;
    }
  }

  /**
   * Actualiza un sector existente
   */
  async actualizarSector(id: number, datos: { nombreSector?: string; cuadrante?: number }): Promise<SectorData> {
    try {
      console.log('📝 [SectorService] Actualizando sector:', id, datos);
      
      // Validaciones
      if (datos.nombreSector !== undefined) {
        if (datos.nombreSector.trim().length === 0) {
          throw new Error('El nombre del sector no puede estar vacío');
        }
        
        if (datos.nombreSector.trim().length < 3) {
          throw new Error('El nombre del sector debe tener al menos 3 caracteres');
        }
      }
      
      const datosParaAPI: UpdateSectorDTO = {};
      
      if (datos.nombreSector !== undefined) {
        datosParaAPI.nombreSector = datos.nombreSector.trim();
      }
      if (datos.cuadrante !== undefined) {
        datosParaAPI.cuadrante = datos.cuadrante || null;
      }
      
      return await this.update(id, datosParaAPI);
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error actualizando sector:', error);
      throw error;
    }
  }
  
  /**
   * Busca sectores por nombre
   */
  async buscarPorNombre(nombreSector: string): Promise<SectorData[]> {
    try {
      const allSectors = await this.getAll();
      
      return allSectors.filter(sector => 
        sector.nombreSector.toLowerCase().includes(nombreSector.toLowerCase())
      );
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error buscando sectores:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los sectores
   */
  async obtenerTodos(): Promise<SectorData[]> {
    try {
      console.log('📋 [SectorService] Obteniendo todos los sectores');
      
      return await this.getAll();
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo sectores:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los cuadrantes disponibles
   */
  async obtenerCuadrantes(): Promise<CuadranteData[]> {
    try {
      console.log('📋 [SectorService] Obteniendo cuadrantes desde:', `${API_CONFIG.baseURL}/api/sector/listarCuadrante`);
      
      const response = await fetch(`${API_CONFIG.baseURL}/api/sector/listarCuadrante`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📡 [SectorService] Cuadrantes recibidos:', data);
      
      // Si es un array, procesarlo directamente
      if (Array.isArray(data)) {
        return data.map(item => ({
          codCuadrante: item.codCuadrante || 0,
          descripcion: item.descripcion || null,
          abreviatura: item.abreviatura || '',
          referenciaBarrio: item.referenciaBarrio || null
        }));
      }
      
      throw new Error('La respuesta no es un array válido');
      
    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo cuadrantes:', error);
      throw error;
    }
  }
}

// IMPORTANTE: Necesitamos importar buildApiUrl
import { buildApiUrl } from '../config/api.unified.config';

// Exportar instancia singleton
const sectorService = SectorService.getInstance();
export default sectorService;

export { SectorService };