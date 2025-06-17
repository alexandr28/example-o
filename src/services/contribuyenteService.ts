// src/services/contribuyenteService.ts
import { BaseApiService } from './BaseApiService';
import { NotificationService } from '../components/utils/Notification';

// Interfaces para Contribuyente
export interface Contribuyente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreRazonSocial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: boolean;
  fechaRegistro?: string;
  tipoContribuyente?: string;
}

export interface ContribuyenteFormData {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreRazonSocial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipoContribuyente?: string;
}

export interface FiltroContribuyente {
  tipo: 'dni' | 'ruc' | 'nombre' | 'todos';
  termino: string;
}

/**
 * Configuración de normalización para contribuyentes
 */
const contribuyenteNormalizeOptions = {
  normalizeItem: (item: any): Contribuyente => {
    return {
      id: item.id || item.contribuyenteId || 0,
      tipoDocumento: item.tipoDocumento || '',
      numeroDocumento: item.numeroDocumento || '',
      nombreRazonSocial: item.nombreRazonSocial || item.nombre || '',
      direccion: item.direccion || '',
      telefono: item.telefono || '',
      email: item.email || '',
      estado: item.estado === 1 || item.estado === true,
      fechaRegistro: item.fechaRegistro || '',
      tipoContribuyente: item.tipoContribuyente || 'NATURAL'
    };
  }
};

/**
 * Servicio para manejar las operaciones de contribuyentes
 */
export class ContribuyenteService extends BaseApiService<Contribuyente, ContribuyenteFormData> {
  private static instance: ContribuyenteService;
  
  constructor() {
    // Usar 4 parámetros como los otros servicios
    super(
      '', // baseURL vacío para usar proxy
      '/api/contribuyente', // endpoint
      contribuyenteNormalizeOptions, // opciones de normalización
      'contribuyentes_cache' // clave de caché
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  /**
   * Busca contribuyentes con filtros
   */
  async buscarConFiltro(filtro: FiltroContribuyente): Promise<Contribuyente[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando con filtro:', filtro);
      
      let url = '/api/contribuyente';
      const queryParams = new URLSearchParams();
      
      // Construir parámetros según el tipo de búsqueda
      switch (filtro.tipo) {
        case 'dni':
          queryParams.append('tipoDoc', 'DNI');
          queryParams.append('numeroDoc', filtro.termino);
          break;
        case 'ruc':
          queryParams.append('tipoDoc', 'RUC');
          queryParams.append('numeroDoc', filtro.termino);
          break;
        case 'nombre':
          queryParams.append('nombre', filtro.termino);
          break;
        case 'todos':
          // Sin filtros específicos
          break;
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams}`;
      }
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      // Manejar diferentes formatos de respuesta
      let dataArray: any[] = [];
      
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (Array.isArray(response.content)) {
          dataArray = response.content;
        } else if (Array.isArray(response.contribuyentes)) {
          dataArray = response.contribuyentes;
        } else {
          console.warn('⚠️ [ContribuyenteService] Respuesta no es array:', response);
          dataArray = [];
        }
      }
      
      const contribuyentes = dataArray.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [ContribuyenteService] ${contribuyentes.length} contribuyentes encontrados`);
      return contribuyentes;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al buscar contribuyentes:', error);
      throw error;
    }
  }
  
  /**
   * Busca contribuyente por número de documento
   */
  async buscarPorDocumento(tipoDoc: string, numeroDoc: string): Promise<Contribuyente | null> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando por documento:', { tipoDoc, numeroDoc });
      
      const url = `/api/contribuyente/documento/${tipoDoc}/${numeroDoc}`;
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      if (!response) {
        return null;
      }
      
      const contribuyente = this.normalizeOptions.normalizeItem(response, 0);
      console.log('✅ [ContribuyenteService] Contribuyente encontrado:', contribuyente);
      
      return contribuyente;
      
    } catch (error: any) {
      if (error.message.includes('404')) {
        console.log('ℹ️ [ContribuyenteService] Contribuyente no encontrado');
        return null;
      }
      console.error('❌ [ContribuyenteService] Error al buscar por documento:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo contribuyente (requiere Bearer Token)
   */
  async create(data: ContribuyenteFormData): Promise<Contribuyente> {
    try {
      console.log('📤 [ContribuyenteService] Creando nuevo contribuyente:', data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para crear contribuyentes');
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
      
      const contribuyente = this.normalizeOptions.normalizeItem(response, 0);
      
      NotificationService.success('Contribuyente creado exitosamente');
      console.log('✅ [ContribuyenteService] Contribuyente creado:', contribuyente);
      
      this.clearCache();
      return contribuyente;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al crear contribuyente:', error);
      
      if (error.message.includes('ya existe')) {
        NotificationService.error('El contribuyente ya existe con ese número de documento');
      } else {
        NotificationService.error(error.message || 'Error al crear contribuyente');
      }
      
      throw error;
    }
  }
  
  /**
   * Actualiza un contribuyente existente (requiere Bearer Token)
   */
  async update(id: number, data: ContribuyenteFormData): Promise<Contribuyente> {
    try {
      console.log('📤 [ContribuyenteService] Actualizando contribuyente:', id, data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar contribuyentes');
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
      
      const contribuyente = this.normalizeOptions.normalizeItem(response, 0);
      
      NotificationService.success('Contribuyente actualizado exitosamente');
      console.log('✅ [ContribuyenteService] Contribuyente actualizado:', contribuyente);
      
      this.clearCache();
      return contribuyente;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al actualizar contribuyente:', error);
      NotificationService.error(error.message || 'Error al actualizar contribuyente');
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de contribuyentes
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      console.log('📊 [ContribuyenteService] Obteniendo estadísticas');
      
      const response = await this.makeRequest('/api/contribuyente/estadisticas', {
        method: 'GET'
      });
      
      console.log('✅ [ContribuyenteService] Estadísticas obtenidas:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();

// Exportar también la clase para testing
export default ContribuyenteService;