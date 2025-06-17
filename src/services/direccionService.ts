// src/services/direccionService.ts - VERSIÓN FINAL CORREGIDA
import { BaseApiService } from './BaseApiService';
import { Direccion, DireccionFormData } from '../models';
import { NotificationService } from '../components/utils/Notification';

/**
 * Configuración de normalización para direcciones
 */
const direccionNormalizeOptions = {
  normalizeItem: (item: any): Direccion => {
    return {
      id: item.direccionId || item.id || 0,
      sectorId: item.sectorId || item.codSector || 0,
      barrioId: item.barrioId || item.codBarrio || 0,
      calleId: item.calleId || item.codCalle || 0,
      cuadra: item.cuadra || '',
      lado: item.lado || '-',
      loteInicial: item.loteInicial || 0,
      loteFinal: item.loteFinal || 0,
      descripcion: item.descripcion || item.nombreCompleto || '',
      estado: item.estado === 1 || item.estado === true,
      // Relaciones opcionales
      sector: item.sector || undefined,
      barrio: item.barrio || undefined,
      calle: item.calle || undefined
    };
  }
};

/**
 * Interfaz para parámetros de búsqueda por tipo de vía
 */
interface BusquedaPorTipoViaParams {
  parametrosBusqueda: string;
  codUsuario?: number;
}

/**
 * Interfaz para parámetros de búsqueda por nombre de vía
 */
interface BusquedaPorNombreViaParams {
  nombreVia?: string;
  codSector?: number;
  codBarrio?: number;
}

/**
 * Servicio para manejar las operaciones de direcciones
 */
export class DireccionService extends BaseApiService<Direccion, DireccionFormData> {
  private static instance: DireccionService;
  
  constructor() {
    // Usar 4 parámetros como los otros servicios
    super(
      '', // baseURL vacío para usar proxy
      '/api/direccion', // endpoint
      direccionNormalizeOptions, // opciones de normalización
      'direcciones_cache' // clave de caché
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): DireccionService {
    if (!DireccionService.instance) {
      DireccionService.instance = new DireccionService();
    }
    return DireccionService.instance;
  }
  
  /**
   * Busca direcciones por tipo de vía
   * CORREGIDO: Usar URL relativa para el proxy
   */
  async buscarPorTipoVia(params: BusquedaPorTipoViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por tipo de vía:', params);
      
      const queryParams = new URLSearchParams({
        parametrosBusqueda: params.parametrosBusqueda,
        ...(params.codUsuario && { codUsuario: params.codUsuario.toString() })
      });
      
      // URL CORREGIDA: Usar ruta relativa
      const url = `/api/direccion/listarDireccionPorTipoVia?${queryParams}`;
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      // MANEJO ROBUSTO DE RESPUESTA
      let dataArray: any[] = [];
      
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object') {
        // Si es un objeto, buscar propiedades comunes que contengan el array
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (Array.isArray(response.items)) {
          dataArray = response.items;
        } else if (Array.isArray(response.results)) {
          dataArray = response.results;
        } else if (Array.isArray(response.direcciones)) {
          dataArray = response.direcciones;
        } else {
          // Si no encontramos un array, intentar convertir el objeto en array
          console.warn('⚠️ [DireccionService] Respuesta no es array, convirtiendo objeto:', response);
          dataArray = [response];
        }
      }
      
      const direcciones = dataArray.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [DireccionService] ${direcciones.length} direcciones encontradas por tipo de vía`);
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por tipo de vía:', error);
      throw error;
    }
  }
  
  /**
   * Busca direcciones por nombre de vía
   * CORREGIDO: Usar URL relativa para el proxy
   */
  async buscarPorNombreVia(params?: BusquedaPorNombreViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por nombre de vía:', params);
      
      // URL CORREGIDA: Usar ruta relativa
      let url = '/api/direccion/listarDireccionPorNombreVia';
      
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.nombreVia) queryParams.append('nombreVia', params.nombreVia);
        if (params.codSector) queryParams.append('codSector', params.codSector.toString());
        if (params.codBarrio) queryParams.append('codBarrio', params.codBarrio.toString());
        
        if (queryParams.toString()) {
          url += `?${queryParams}`;
        }
      }
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      // MANEJO ROBUSTO DE RESPUESTA
      let dataArray: any[] = [];
      
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object') {
        // Buscar array en propiedades comunes
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (Array.isArray(response.items)) {
          dataArray = response.items;
        } else if (Array.isArray(response.results)) {
          dataArray = response.results;
        } else if (Array.isArray(response.direcciones)) {
          dataArray = response.direcciones;
        } else {
          console.warn('⚠️ [DireccionService] Respuesta no es array, devolviendo vacío');
          dataArray = [];
        }
      }
      
      const direcciones = dataArray.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [DireccionService] ${direcciones.length} direcciones encontradas por nombre de vía`);
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por nombre de vía:', error);
      throw error;
    }
  }
  
  /**
   * Sobrescribe el método getAll para usar el endpoint por nombre de vía
   */
  async getAll(): Promise<Direccion[]> {
    try {
      // Por defecto, listar todas las direcciones usando el endpoint por nombre de vía
      return await this.buscarPorNombreVia();
    } catch (error) {
      console.error('❌ [DireccionService] Error al obtener todas las direcciones:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva dirección (requiere Bearer Token)
   */
  async create(data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📤 [DireccionService] Creando nueva dirección:', data);
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await this.makeRequest(this.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const direccion = this.normalizeOptions.normalizeItem(response, 0);
      
      NotificationService.success('Dirección creada exitosamente');
      console.log('✅ [DireccionService] Dirección creada:', direccion);
      
      return direccion;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      NotificationService.error(error.message || 'Error al crear dirección');
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección existente (requiere Bearer Token)
   */
  async update(id: number, data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📤 [DireccionService] Actualizando dirección:', id, data);
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await this.makeRequest(`${this.url}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const direccion = this.normalizeOptions.normalizeItem(response, 0);
      
      NotificationService.success('Dirección actualizada exitosamente');
      console.log('✅ [DireccionService] Dirección actualizada:', direccion);
      
      return direccion;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al actualizar dirección:', error);
      NotificationService.error(error.message || 'Error al actualizar dirección');
      throw error;
    }
  }
  
  /**
   * Elimina una dirección (requiere Bearer Token)
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log('🗑️ [DireccionService] Eliminando dirección:', id);
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      await this.makeRequest(`${this.url}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      NotificationService.success('Dirección eliminada exitosamente');
      console.log('✅ [DireccionService] Dirección eliminada');
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al eliminar dirección:', error);
      NotificationService.error(error.message || 'Error al eliminar dirección');
      throw error;
    }
  }
  
  /**
   * Busca direcciones con filtro
   */
  async search(term: string): Promise<Direccion[]> {
    try {
      // Usar búsqueda por tipo de vía con el término como parámetro
      return await this.buscarPorTipoVia({
        parametrosBusqueda: term,
        codUsuario: 1 // Usuario por defecto, ajustar según necesidad
      });
    } catch (error) {
      console.error('❌ [DireccionService] Error en búsqueda:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const direccionService = DireccionService.getInstance();