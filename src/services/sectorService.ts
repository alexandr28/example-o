// src/services/sectorService.ts - VERSIÓN CORREGIDA CON nombreSector

import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Sector
 */
export interface SectorData {
  codSector: number;
  nombreSector: string;
  codCuadrante: number;
  nombreCuadrante: string;
  codUnidadUrbana: number;
  unidadUrbana: string;
}

export interface CreateSectorDTO {
  codUnidadUrbana: number;
  nombreSector: string;
  codCuadrante: number;
}

export interface UpdateSectorDTO {
  codSector: number;
  nombreSector: string;
  codCuadrante: number;
  codUnidadUrbana: number;
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

export interface UnidadUrbanaData {
  codUnidadUrbana: number;
  descripcionUnidadUrbana: string;
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
          codCuadrante: item.codCuadrante || 0,
          nombreCuadrante: item.nombreCuadrante || '',
          codUnidadUrbana: item.codUnidadUrbana || 0,
          unidadUrbana: item.unidadUrbana || ''
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
          codCuadrante: item.codCuadrante || 0,
          nombreCuadrante: item.nombreCuadrante || '',
          codUnidadUrbana: item.codUnidadUrbana || 0,
          unidadUrbana: item.unidadUrbana || ''
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
      const payload = {
        codUnidadUrbana: datos.codUnidadUrbana,
        nombreSector: datos.nombreSector,
        codCuadrante: datos.codCuadrante
      };

      console.log('📤 [SectorService] Enviando POST:', payload);

      const response = await fetch(`${API_CONFIG.baseURL}/api/sector`, {
        method: 'POST',
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
          codSector: data.codSector || Date.now(),
          nombreSector: data.nombreSector || datos.nombreSector,
          codCuadrante: data.codCuadrante || datos.codCuadrante,
          nombreCuadrante: data.nombreCuadrante || '',
          codUnidadUrbana: data.codUnidadUrbana || datos.codUnidadUrbana,
          unidadUrbana: data.unidadUrbana || ''
        };
      } else {
        // Si respuesta es texto/número, asumir éxito
        const responseText = await response.text();
        const possibleId = parseInt(responseText);

        return {
          codSector: !isNaN(possibleId) ? possibleId : Date.now(),
          nombreSector: datos.nombreSector,
          codCuadrante: datos.codCuadrante,
          nombreCuadrante: '',
          codUnidadUrbana: datos.codUnidadUrbana,
          unidadUrbana: ''
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
  async crearSector(datos: { codUnidadUrbana: number; nombreSector: string; codCuadrante: number }): Promise<SectorData> {
    try {
      // Validaciones
      if (!datos.nombreSector || datos.nombreSector.trim().length === 0) {
        throw new Error('El nombre del sector es requerido');
      }

      if (datos.nombreSector.trim().length < 3) {
        throw new Error('El nombre del sector debe tener al menos 3 caracteres');
      }

      if (!datos.codUnidadUrbana) {
        throw new Error('La unidad urbana es requerida');
      }

      if (!datos.codCuadrante) {
        throw new Error('El cuadrante es requerido');
      }

      const datosParaAPI: CreateSectorDTO = {
        codUnidadUrbana: datos.codUnidadUrbana,
        nombreSector: datos.nombreSector.trim(),
        codCuadrante: datos.codCuadrante
      };

      console.log('📤 [SectorService] Enviando al API:', datosParaAPI);

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
      // Preparar el payload con la estructura requerida
      const payload = {
        codSector: id,
        nombreSector: datos.nombreSector,
        codCuadrante: datos.codCuadrante,
        codUnidadUrbana: datos.codUnidadUrbana
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
          nombreSector: data.nombreSector || datos.nombreSector,
          codCuadrante: data.codCuadrante || datos.codCuadrante,
          nombreCuadrante: data.nombreCuadrante || '',
          codUnidadUrbana: data.codUnidadUrbana || datos.codUnidadUrbana,
          unidadUrbana: data.unidadUrbana || ''
        };
      } else {
        // Si respuesta es texto/número, asumir éxito
        return {
          codSector: id,
          nombreSector: datos.nombreSector,
          codCuadrante: datos.codCuadrante,
          nombreCuadrante: '',
          codUnidadUrbana: datos.codUnidadUrbana,
          unidadUrbana: ''
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
  async actualizarSector(id: number, datos: { nombreSector: string; codCuadrante: number; codUnidadUrbana: number }): Promise<SectorData> {
    try {
      console.log('📝 [SectorService] Actualizando sector:', id, datos);

      // Validaciones
      if (datos.nombreSector.trim().length === 0) {
        throw new Error('El nombre del sector no puede estar vacío');
      }

      if (datos.nombreSector.trim().length < 3) {
        throw new Error('El nombre del sector debe tener al menos 3 caracteres');
      }

      if (!datos.codUnidadUrbana) {
        throw new Error('La unidad urbana es requerida');
      }

      if (!datos.codCuadrante) {
        throw new Error('El cuadrante es requerido');
      }

      const datosParaAPI: UpdateSectorDTO = {
        codSector: id,
        nombreSector: datos.nombreSector.trim(),
        codCuadrante: datos.codCuadrante,
        codUnidadUrbana: datos.codUnidadUrbana
      };

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

  /**
   * Obtiene todas las unidades urbanas disponibles
   */
  async obtenerUnidadesUrbanas(): Promise<UnidadUrbanaData[]> {
    try {
      console.log('📋 [SectorService] Obteniendo unidades urbanas desde:', `${API_CONFIG.baseURL}/api/sector/listarTipoUnidadUrbana`);

      const response = await fetch(`${API_CONFIG.baseURL}/api/sector/listarTipoUnidadUrbana`, {
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
      console.log('📡 [SectorService] Unidades urbanas recibidas:', data);

      // Si es un array, procesarlo directamente
      if (Array.isArray(data)) {
        return data.map(item => ({
          codUnidadUrbana: item.codUnidadUrbana || 0,
          descripcionUnidadUrbana: item.descripcionUnidadUrbana || ''
        }));
      }

      throw new Error('La respuesta no es un array válido');

    } catch (error: any) {
      console.error('❌ [SectorService] Error obteniendo unidades urbanas:', error);
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