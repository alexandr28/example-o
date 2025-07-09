// src/services/arancelService.ts
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { API_CONFIG } from '../config/api.config';

// Tipos
export interface ArancelData {
  id?: number;
  anio: number;
  direccionId: number;
  monto: number;
  estado?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
  // Datos de la dirección (cuando se incluyen)
  direccion?: {
    id: number;
    codigo: string;
    sector: string;
    barrio: string;
    tipoVia: string;
    nombreVia: string;
    cuadra: number;
    lado: string;
    loteInicial: number;
    loteFinal: number;
  };
}

export interface ArancelFormData {
  anio: number;
  direccionId: number;
  monto: number;
}

/**
 * Servicio para gestión de aranceles
 */
class ArancelService {
  private static instance: ArancelService;
  private readonly API_ENDPOINT = `${API_CONFIG.baseURL}/api/arancel`;

  private constructor() {}

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }

  /**
   * Obtiene todos los aranceles
   */
  async obtenerTodos(): Promise<ArancelData[]> {
    try {
      console.log('📡 [ArancelService] Obteniendo todos los aranceles');
      
      const response = await apiGet(this.API_ENDPOINT);
      
      if (response.success && response.data) {
        const aranceles = Array.isArray(response.data) ? 
          response.data : [response.data];
        
        console.log(`✅ [ArancelService] ${aranceles.length} aranceles obtenidos`);
        return aranceles;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al obtener aranceles:', error);
      throw new Error(error.message || 'Error al obtener aranceles');
    }
  }

  /**
   * Busca aranceles por año
   */
  async buscarPorAnio(anio: number): Promise<ArancelData[]> {
    try {
      console.log(`📡 [ArancelService] Buscando aranceles del año ${anio}`);
      
      const response = await apiGet(`${this.API_ENDPOINT}/por-anio/${anio}`);
      
      if (response.success && response.data) {
        const aranceles = Array.isArray(response.data) ? 
          response.data : [response.data];
        
        console.log(`✅ [ArancelService] ${aranceles.length} aranceles encontrados`);
        return aranceles;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al buscar aranceles:', error);
      throw new Error(error.message || 'Error al buscar aranceles');
    }
  }

  /**
   * Busca aranceles por dirección
   */
  async buscarPorDireccion(direccionId: number): Promise<ArancelData[]> {
    try {
      console.log(`📡 [ArancelService] Buscando aranceles de dirección ${direccionId}`);
      
      const response = await apiGet(`${this.API_ENDPOINT}/por-direccion/${direccionId}`);
      
      if (response.success && response.data) {
        const aranceles = Array.isArray(response.data) ? 
          response.data : [response.data];
        return aranceles;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al buscar por dirección:', error);
      throw new Error(error.message || 'Error al buscar aranceles');
    }
  }

  /**
   * Obtiene un arancel por ID
   */
  async obtenerPorId(id: number): Promise<ArancelData> {
    try {
      console.log(`📡 [ArancelService] Obteniendo arancel ${id}`);
      
      const response = await apiGet(`${this.API_ENDPOINT}/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Arancel no encontrado');
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al obtener arancel ${id}:`, error);
      throw new Error(error.message || 'Error al obtener arancel');
    }
  }

  /**
   * Crea un nuevo arancel
   */
  async crear(datos: ArancelFormData): Promise<ArancelData> {
    try {
      console.log('📡 [ArancelService] Creando arancel:', datos);
      
      // Validaciones
      if (!datos.anio || datos.anio < 2000 || datos.anio > 2100) {
        throw new Error('Año inválido');
      }
      
      if (!datos.direccionId || datos.direccionId <= 0) {
        throw new Error('Debe seleccionar una dirección');
      }
      
      if (datos.monto < 0) {
        throw new Error('El monto no puede ser negativo');
      }
      
      const payload = {
        anio: datos.anio,
        direccionId: datos.direccionId,
        monto: datos.monto,
        estado: true
      };
      
      const response = await apiPost(this.API_ENDPOINT, payload);
      
      if (response.success && response.data) {
        console.log('✅ [ArancelService] Arancel creado exitosamente');
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear arancel');
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al crear arancel:', error);
      throw new Error(error.message || 'Error al crear arancel');
    }
  }

  /**
   * Actualiza un arancel
   */
  async actualizar(id: number, datos: Partial<ArancelFormData>): Promise<ArancelData> {
    try {
      console.log(`📡 [ArancelService] Actualizando arancel ${id}:`, datos);
      
      // Validaciones
      if (datos.anio && (datos.anio < 2000 || datos.anio > 2100)) {
        throw new Error('Año inválido');
      }
      
      if (datos.monto !== undefined && datos.monto < 0) {
        throw new Error('El monto no puede ser negativo');
      }
      
      const response = await apiPut(`${this.API_ENDPOINT}/${id}`, datos);
      
      if (response.success && response.data) {
        console.log('✅ [ArancelService] Arancel actualizado exitosamente');
        return response.data;
      }
      
      throw new Error(response.message || 'Error al actualizar arancel');
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al actualizar arancel ${id}:`, error);
      throw new Error(error.message || 'Error al actualizar arancel');
    }
  }

  /**
   * Elimina un arancel
   */
  async eliminar(id: number): Promise<void> {
    try {
      console.log(`📡 [ArancelService] Eliminando arancel ${id}`);
      
      const response = await apiDelete(`${this.API_ENDPOINT}/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar arancel');
      }
      
      console.log('✅ [ArancelService] Arancel eliminado exitosamente');
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al eliminar arancel ${id}:`, error);
      throw new Error(error.message || 'Error al eliminar arancel');
    }
  }

  /**
   * Verifica si existe un arancel para una dirección y año
   */
  async verificarExistencia(anio: number, direccionId: number): Promise<boolean> {
    try {
      const response = await apiGet(
        `${this.API_ENDPOINT}/verificar?anio=${anio}&direccionId=${direccionId}`
      );
      
      return response.data?.existe || false;
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al verificar existencia:', error);
      return false;
    }
  }
}

// Exportar instancia única
export const arancelService = ArancelService.getInstance();