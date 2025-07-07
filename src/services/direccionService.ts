// src/services/direccionService.ts
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiRequest';
import { API_CONFIG } from '../config/api.config';

// Tipos
export interface DireccionData {
  codDireccion?: number;
  codSector: number;
  nombreSector?: string;
  codBarrio: number;
  nombreBarrio?: string;
  codTipoVia: number;
  tipoVia?: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  estado?: number;
  fechaRegistro?: string;
  usuarioRegistro?: string;
}

export interface DireccionFormData {
  sector: string;
  barrio: string;
  calleMz: string;
  cuadra: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
}

export interface DireccionResponse {
  success: boolean;
  data: DireccionData | DireccionData[];
  message?: string;
  total?: number;
}

// Si ya existe ApiResponse en otro archivo, podemos importarlo o usar el local
import type { ApiResponse } from '../utils/apiRequest';

/**
 * Servicio para gestión de direcciones
 */
class DireccionService {
  private static instance: DireccionService;
  private readonly API_ENDPOINT = `${API_CONFIG.baseURL}/api/direcciones`;

  private constructor() {}

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): DireccionService {
    if (!DireccionService.instance) {
      DireccionService.instance = new DireccionService();
    }
    return DireccionService.instance;
  }

  /**
   * Obtiene los headers para las peticiones
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Mapea los datos de la API al formato esperado por el frontend
   */
  private mapearDireccion(direccion: DireccionData): any {
    return {
      id: direccion.codDireccion,
      codigo: direccion.codDireccion?.toString() || '',
      sector: direccion.nombreSector || '',
      barrio: direccion.nombreBarrio || '',
      tipoVia: direccion.tipoVia || '',
      nombreVia: direccion.nombreVia || '',
      cuadra: direccion.cuadra || 0,
      lotes: `${direccion.loteInicial} - ${direccion.loteFinal}`,
      lado: direccion.lado,
      estado: direccion.estado,
      // Datos adicionales para edición
      codSector: direccion.codSector,
      codBarrio: direccion.codBarrio,
      codTipoVia: direccion.codTipoVia,
      loteInicial: direccion.loteInicial,
      loteFinal: direccion.loteFinal
    };
  }

  /**
   * Obtiene todas las direcciones
   */
  async obtenerTodas(): Promise<any[]> {
    try {
      console.log('📡 [DireccionService] Obteniendo todas las direcciones');
      
      const response = await apiGet(this.API_ENDPOINT, this.getHeaders());
      
      if (response.success && response.data) {
        const direcciones = Array.isArray(response.data) ? response.data : [response.data];
        const direccionesMapeadas = direcciones.map(dir => this.mapearDireccion(dir));
        
        console.log(`✅ [DireccionService] ${direccionesMapeadas.length} direcciones obtenidas`);
        return direccionesMapeadas;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al obtener direcciones:', error);
      throw new Error(`Error al obtener direcciones: ${error.message}`);
    }
  }

  /**
   * Busca direcciones con filtros
   */
  async buscar(filtros: any): Promise<any[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones con filtros:', filtros);
      
      const params = new URLSearchParams();
      
      if (filtros.sector) params.append('sector', filtros.sector);
      if (filtros.barrio) params.append('barrio', filtros.barrio);
      if (filtros.nombreVia) params.append('nombreVia', filtros.nombreVia);
      if (filtros.busqueda) params.append('q', filtros.busqueda);
      
      const endpoint = params.toString() ? `${this.API_ENDPOINT}?${params}` : this.API_ENDPOINT;
      const response = await apiGet(endpoint, this.getHeaders());
      
      if (response.success && response.data) {
        const direcciones = Array.isArray(response.data) ? response.data : [response.data];
        const direccionesMapeadas = direcciones.map(dir => this.mapearDireccion(dir));
        
        console.log(`✅ [DireccionService] ${direccionesMapeadas.length} direcciones encontradas`);
        return direccionesMapeadas;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error en búsqueda:', error);
      throw new Error(`Error al buscar direcciones: ${error.message}`);
    }
  }

  /**
   * Crea una nueva dirección
   */
  async crear(datos: DireccionFormData): Promise<DireccionData> {
    try {
      console.log('➕ [DireccionService] Creando dirección:', datos);
      
      // Mapear datos del formulario al formato de la API
      const datosAPI = {
        codSector: parseInt(datos.sector), // Asumiendo que sector es el código
        codBarrio: parseInt(datos.barrio), // Asumiendo que barrio es el código
        nombreVia: datos.calleMz,
        cuadra: parseInt(datos.cuadra) || 0,
        lado: datos.lado,
        loteInicial: datos.loteInicial,
        loteFinal: datos.loteFinal,
        estado: 1,
        usuarioRegistro: 'SISTEMA' // Esto debería venir del contexto de usuario
      };
      
      const response = await apiPost(this.API_ENDPOINT, datosAPI, this.getHeaders());
      
      if (response.success && response.data) {
        console.log('✅ [DireccionService] Dirección creada exitosamente');
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear dirección');
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      throw new Error(`Error al crear dirección: ${error.message}`);
    }
  }

  /**
   * Actualiza una dirección existente
   */
  async actualizar(codigo: number, datos: DireccionFormData): Promise<DireccionData> {
    try {
      console.log(`📝 [DireccionService] Actualizando dirección ${codigo}:`, datos);
      
      const datosAPI = {
        codDireccion: codigo,
        codSector: parseInt(datos.sector),
        codBarrio: parseInt(datos.barrio),
        nombreVia: datos.calleMz,
        cuadra: parseInt(datos.cuadra) || 0,
        lado: datos.lado,
        loteInicial: datos.loteInicial,
        loteFinal: datos.loteFinal
      };
      
      const response = await apiPut(
        `${this.API_ENDPOINT}/${codigo}`, 
        datosAPI, 
        this.getHeaders()
      );
      
      if (response.success && response.data) {
        console.log('✅ [DireccionService] Dirección actualizada exitosamente');
        return response.data;
      }
      
      throw new Error(response.message || 'Error al actualizar dirección');
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al actualizar dirección:', error);
      throw new Error(`Error al actualizar dirección: ${error.message}`);
    }
  }

  /**
   * Elimina una dirección
   */
  async eliminar(codigo: number): Promise<void> {
    try {
      console.log(`🗑️ [DireccionService] Eliminando dirección ${codigo}`);
      
      const response = await apiDelete(
        `${this.API_ENDPOINT}/${codigo}`,
        this.getHeaders()
      );
      
      if (response.success) {
        console.log('✅ [DireccionService] Dirección eliminada exitosamente');
      } else {
        throw new Error(response.message || 'Error al eliminar dirección');
      }
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al eliminar dirección:', error);
      throw new Error(`Error al eliminar dirección: ${error.message}`);
    }
  }

  /**
   * Obtiene los sectores disponibles
   */
  async obtenerSectores(): Promise<any[]> {
    try {
      const response = await apiGet(
        `${API_CONFIG.baseURL}/api/sectores`,
        this.getHeaders()
      );
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al obtener sectores:', error);
      throw new Error(`Error al obtener sectores: ${error.message}`);
    }
  }

  /**
   * Obtiene los barrios de un sector
   */
  async obtenerBarriosPorSector(codSector: number): Promise<any[]> {
    try {
      const response = await apiGet(
        `${API_CONFIG.baseURL}/api/barrios?codSector=${codSector}`,
        this.getHeaders()
      );
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al obtener barrios:', error);
      throw new Error(`Error al obtener barrios: ${error.message}`);
    }
  }

  /**
   * Obtiene los tipos de vía disponibles
   */
  async obtenerTiposVia(): Promise<any[]> {
    try {
      const response = await apiGet(
        `${API_CONFIG.baseURL}/api/tipos-via`,
        this.getHeaders()
      );
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al obtener tipos de vía:', error);
      throw new Error(`Error al obtener tipos de vía: ${error.message}`);
    }
  }
}

// Exportar instancia singleton
export const direccionService = DireccionService.getInstance();