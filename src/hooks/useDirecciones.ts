// src/services/direccionService.ts - VERSIÓN CORREGIDA
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { API_CONFIG } from '../config/api.config';

// Tipos de la API
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

// Tipo para el frontend (lo que espera el hook)
export interface Direccion {
  id: number;
  codigo: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lotes: string;
  lado: string;
  estado: number;
  // Datos adicionales para edición
  codSector?: number;
  codBarrio?: number;
  codTipoVia?: number;
  loteInicial?: number;
  loteFinal?: number;
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

/**
 * Servicio para gestión de direcciones
 */
class DireccionServiceClass {
  private static instance: DireccionServiceClass;
  private readonly API_ENDPOINT = `${API_CONFIG.baseURL}/api/direccion`;

  private constructor() {}

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): DireccionServiceClass {
    if (!DireccionServiceClass.instance) {
      DireccionServiceClass.instance = new DireccionServiceClass();
    }
    return DireccionServiceClass.instance;
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
   * IMPORTANTE: Este método convierte DireccionData a Direccion
   */
  private mapearDireccion(direccion: DireccionData): Direccion {
    return {
      id: direccion.codDireccion || 0,
      codigo: direccion.codDireccion?.toString() || '',
      sector: direccion.nombreSector || '',
      barrio: direccion.nombreBarrio || '',
      tipoVia: direccion.tipoVia || '',
      nombreVia: direccion.nombreVia || '',
      cuadra: direccion.cuadra || 0,
      lotes: `${direccion.loteInicial} - ${direccion.loteFinal}`,
      lado: direccion.lado,
      estado: direccion.estado || 1,
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
   * @returns Promise<Direccion[]> - Array de direcciones mapeadas
   */
  async obtenerTodas(): Promise<Direccion[]> {
    try {
      console.log('📡 [DireccionService] Obteniendo todas las direcciones');
      
      const response = await apiGet(this.API_ENDPOINT, this.getHeaders());
      
      if (response.success && response.data) {
        const direcciones = Array.isArray(response.data) ? 
          response.data : [response.data];
        
        // IMPORTANTE: Mapear cada dirección al formato correcto
        const direccionesMapeadas = direcciones.map(dir => this.mapearDireccion(dir));
        
        console.log(`✅ [DireccionService] ${direccionesMapeadas.length} direcciones obtenidas`);
        return direccionesMapeadas;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al obtener direcciones:', error);
      throw new Error(error.message || 'Error al obtener direcciones');
    }
  }

  /**
   * Busca direcciones con filtros
   * @returns Promise<Direccion[]> - Array de direcciones mapeadas
   */
  async buscar(filtros: any): Promise<Direccion[]> {
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
        // IMPORTANTE: Mapear cada dirección
        const direccionesMapeadas = direcciones.map(dir => this.mapearDireccion(dir));
        
        console.log(`✅ [DireccionService] ${direccionesMapeadas.length} direcciones encontradas`);
        return direccionesMapeadas;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [DireccionService] Error en búsqueda:', error);
      throw new Error(error.message || 'Error al buscar direcciones');
    }
  }

  /**
   * Busca direcciones por nombre de vía (usando endpoint específico si existe)
   * @returns Promise<Direccion[]> - Array de direcciones mapeadas
   */
  async buscarPorNombreVia(nombreVia: string): Promise<Direccion[]> {
    try {
      if (!nombreVia || nombreVia.trim().length < 2) {
        return [];
      }

      const endpoint = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.direcciones.listarPorNombreVia}`;
      console.log(`📡 [DireccionService] Buscando por nombre de vía: ${nombreVia}`);
      
      const url = `${endpoint}?nombreVia=${encodeURIComponent(nombreVia.trim())}`;
      const response = await apiGet(url, this.getHeaders());
      
      if (response.success && response.data) {
        const direcciones = Array.isArray(response.data) ? 
          response.data : [response.data];
        return direcciones.map(dir => this.mapearDireccion(dir));
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por nombre de vía:', error);
      // Si falla el endpoint específico, usar el método buscar genérico
      return this.buscar({ nombreVia });
    }
  }

  /**
   * Obtiene una dirección por su código
   * @returns Promise<Direccion> - Dirección mapeada
   */
  async obtenerPorCodigo(codigo: number): Promise<Direccion> {
    try {
      const endpoint = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.direcciones.obtenerPorCodigo}/${codigo}`;
      console.log(`📡 [DireccionService] Obteniendo dirección con código: ${codigo}`);
      
      const response = await apiGet(endpoint, this.getHeaders());
      
      if (response.success && response.data) {
        return this.mapearDireccion(response.data);
      }
      
      throw new Error('Dirección no encontrada');
    } catch (error: any) {
      console.error(`❌ [DireccionService] Error al obtener dirección ${codigo}:`, error);
      throw new Error(error.message || 'Error al obtener dirección');
    }
  }

  /**
   * Crea una nueva dirección
   * @returns Promise<Direccion> - Dirección creada y mapeada
   */
  async crear(datos: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📡 [DireccionService] Creando nueva dirección:', datos);
      
      // Mapear datos del formulario al formato de la API
      const payload = {
        codSector: parseInt(datos.sector),
        codBarrio: parseInt(datos.barrio),
        codTipoVia: this.obtenerCodigoTipoVia(datos.calleMz),
        nombreVia: this.obtenerNombreVia(datos.calleMz),
        cuadra: parseInt(datos.cuadra),
        lado: datos.lado,
        loteInicial: datos.loteInicial,
        loteFinal: datos.loteFinal,
        estado: 1
      };
      
      const response = await apiPost(this.API_ENDPOINT, payload, this.getHeaders());
      
      if (response.success && response.data) {
        // IMPORTANTE: Mapear la respuesta
        return this.mapearDireccion(response.data);
      }
      
      throw new Error(response.message || 'Error al crear dirección');
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      throw new Error(error.message || 'Error al crear dirección');
    }
  }

  /**
   * Actualiza una dirección existente
   * @returns Promise<Direccion> - Dirección actualizada y mapeada
   */
  async actualizar(codigo: number, datos: DireccionFormData): Promise<Direccion> {
    try {
      console.log(`📡 [DireccionService] Actualizando dirección ${codigo}:`, datos);
      
      const payload = {
        codDireccion: codigo,
        codSector: parseInt(datos.sector),
        codBarrio: parseInt(datos.barrio),
        codTipoVia: this.obtenerCodigoTipoVia(datos.calleMz),
        nombreVia: this.obtenerNombreVia(datos.calleMz),
        cuadra: parseInt(datos.cuadra),
        lado: datos.lado,
        loteInicial: datos.loteInicial,
        loteFinal: datos.loteFinal,
        estado: 1
      };
      
      const endpoint = `${this.API_ENDPOINT}/${codigo}`;
      const response = await apiPut(endpoint, payload, this.getHeaders());
      
      if (response.success && response.data) {
        // IMPORTANTE: Mapear la respuesta
        return this.mapearDireccion(response.data);
      }
      
      throw new Error(response.message || 'Error al actualizar dirección');
    } catch (error: any) {
      console.error(`❌ [DireccionService] Error al actualizar dirección ${codigo}:`, error);
      throw new Error(error.message || 'Error al actualizar dirección');
    }
  }

  /**
   * Elimina una dirección
   */
  async eliminar(codigo: number): Promise<void> {
    try {
      console.log(`📡 [DireccionService] Eliminando dirección ${codigo}`);
      
      const endpoint = `${this.API_ENDPOINT}/${codigo}`;
      const response = await apiDelete(endpoint, this.getHeaders());
      
      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar dirección');
      }
    } catch (error: any) {
      console.error(`❌ [DireccionService] Error al eliminar dirección ${codigo}:`, error);
      throw new Error(error.message || 'Error al eliminar dirección');
    }
  }

  /**
   * Métodos auxiliares para parsear el campo calleMz
   */
  private obtenerCodigoTipoVia(calleMz: string): number {
    // Parsear formato "id:nombre"
    const partes = calleMz.split(':');
    return partes.length > 0 ? parseInt(partes[0]) : 1;
  }

  private obtenerNombreVia(calleMz: string): string {
    // Parsear formato "id:nombre"
    const partes = calleMz.split(':');
    return partes.length > 1 ? partes[1].trim() : calleMz;
  }
}

// Exportar instancia única
export const DireccionService = DireccionServiceClass.getInstance();
export const direccionService = DireccionService; // Alias para compatibilidad