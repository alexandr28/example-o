// src/services/arancelService.ts
import { API_CONFIG } from '../config/api.config';

// Tipos basados en la respuesta de tu API
export interface ArancelData {
  codArancel?: number;
  anio: number;
  codDireccion: number;
  costo: number;
  codUsuario?: number;
  costoArancel?: number;
  // Datos adicionales que vienen en la respuesta
  pagina?: number;
  limite?: number;
  totalPaginas?: number;
  totalRegistros?: number;
}

export interface ArancelFormData {
  anio: number;
  codDireccion: number;
  codUsuario: number;
}

export interface ArancelResponse {
  success: boolean;
  message: string;
  data: ArancelData[];
  pagina?: number;
  limite?: number;
  totalPaginas?: number;
  totalRegistros?: number;
}

export interface ArancelCreateResponse {
  success: boolean;
  message: string;
  data: ArancelData;
}

/**
 * Servicio para gestión de aranceles - Sin autenticación para GET
 */
class ArancelService {
  private static instance: ArancelService;
  private readonly API_BASE_URL = 'http://192.168.20.160:8080/api/arancel';

  private constructor() {}

  public static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }

  /**
   * Realiza una petición GET sin autenticación
   */
  private async fetchGet(url: string): Promise<any> {
    try {
      console.log(`📡 GET: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta recibida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en petición GET:', error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST con autenticación (si es necesaria)
   */
  private async fetchPost(url: string, body: any): Promise<any> {
    try {
      console.log(`📡 POST: ${url}`, body);
      
      // Si necesitas token para POST, agrégalo aquí
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Si tienes token, agrégalo
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta POST:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en petición POST:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los aranceles (GET sin autenticación)
   */
  async obtenerTodos(pagina: number = 1, limite: number = 100): Promise<ArancelResponse> {
    try {
      const url = `${this.API_BASE_URL}?pagina=${pagina}&limite=${limite}`;
      const response = await this.fetchGet(url);
      
      // Normalizar la respuesta
      if (response.success && response.data) {
        return response;
      }
      
      // Si la respuesta viene en otro formato
      return {
        success: true,
        message: 'Aranceles obtenidos',
        data: Array.isArray(response) ? response : [],
        pagina: response.pagina || pagina,
        limite: response.limite || limite,
        totalPaginas: response.totalPaginas || 1,
        totalRegistros: response.totalRegistros || 0
      };
    } catch (error: any) {
      console.error('Error al obtener aranceles:', error);
      throw new Error(error.message || 'Error al obtener aranceles');
    }
  }

  /**
   * Busca aranceles por año (GET sin autenticación)
   */
  async buscarPorAnio(anio: number): Promise<ArancelData[]> {
    try {
      // Primero intentamos con un endpoint específico
      try {
        const url = `${this.API_BASE_URL}/anio/${anio}`;
        const response = await this.fetchGet(url);
        
        if (response.success && response.data) {
          return Array.isArray(response.data) ? response.data : [response.data];
        }
      } catch (error) {
        console.log('No existe endpoint específico para año, filtrando localmente');
      }

      // Si no existe endpoint específico, obtenemos todos y filtramos
      const todosLosAranceles = await this.obtenerTodos(1, 1000);
      return todosLosAranceles.data.filter(arancel => arancel.anio === anio);
      
    } catch (error: any) {
      console.error(`Error al buscar aranceles del año ${anio}:`, error);
      throw new Error(error.message || 'Error al buscar aranceles por año');
    }
  }

  /**
   * Obtiene un arancel por ID
   */
  async obtenerPorId(id: number): Promise<ArancelData> {
    try {
      const url = `${this.API_BASE_URL}/${id}`;
      const response = await this.fetchGet(url);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Arancel no encontrado');
    } catch (error: any) {
      console.error(`Error al obtener arancel ${id}:`, error);
      throw new Error(error.message || 'Error al obtener arancel');
    }
  }

  /**
   * Crea un nuevo arancel (POST - puede requerir autenticación)
   */
  async crear(datos: ArancelFormData): Promise<ArancelData> {
    try {
      const payload = {
        anio: datos.anio,
        codDireccion: datos.codDireccion,
        codUsuario: datos.codUsuario || 1 // Usuario por defecto si no se proporciona
      };

      const response = await this.fetchPost(this.API_BASE_URL, payload);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear arancel');
    } catch (error: any) {
      console.error('Error al crear arancel:', error);
      throw new Error(error.message || 'Error al crear arancel');
    }
  }

  /**
   * Actualiza un arancel (PUT - puede requerir autenticación)
   */
  async actualizar(id: number, datos: Partial<ArancelFormData>): Promise<ArancelData> {
    try {
      const url = `${this.API_BASE_URL}/${id}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      throw new Error(data.message || 'Error al actualizar arancel');
    } catch (error: any) {
      console.error(`Error al actualizar arancel ${id}:`, error);
      throw new Error(error.message || 'Error al actualizar arancel');
    }
  }

  /**
   * Elimina un arancel (DELETE - puede requerir autenticación)
   */
  async eliminar(id: number): Promise<void> {
    try {
      const url = `${this.API_BASE_URL}/${id}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Arancel eliminado exitosamente');
    } catch (error: any) {
      console.error(`Error al eliminar arancel ${id}:`, error);
      throw new Error(error.message || 'Error al eliminar arancel');
    }
  }
}

// Exportar instancia única
export const arancelService = ArancelService.getInstance();