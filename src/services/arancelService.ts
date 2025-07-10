// src/services/arancelService.ts
import { NotificationService } from '../components/utils/Notification';

// Tipos basados en la respuesta de tu API
export interface ArancelData {
  codArancel?: number;
  anio: number;
  codDireccion: number;
  costo: number;
  codUsuario?: number;
  costoArancel?: number;
  pagina?: number;
  limite?: number;
  totalPaginas?: number;
  totalRegistros?: number;
}

export interface ArancelFormData {
  anio: number;
  codDireccion: number;
  codUsuario?: number;
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

/**
 * Servicio para gestión de aranceles - SIN autenticación Bearer
 */
class ArancelService {
  private static instance: ArancelService;
  private readonly API_BASE_URL = 'http://192.168.20.160:8080/api/arancel';

  private constructor() {
    console.log('🔧 [ArancelService] Inicializado');
    console.log('📡 [ArancelService] URL base:', this.API_BASE_URL);
  }

  public static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }

  /**
   * Convierte parámetros a URLSearchParams para GET requests
   */
  private createURLSearchParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams;
  }

  /**
   * Convierte parámetros a FormData para POST/PUT requests
   */
  private createFormData(params: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    return formData;
  }

  /**
   * Obtiene todos los aranceles (GET con parámetros form-data style)
   */
  async obtenerTodos(pagina: number = 1, limite: number = 100): Promise<ArancelResponse> {
    try {
      console.log('📋 [ArancelService] Obteniendo todos los aranceles...');
      
      // Crear parámetros para la consulta
      const params = this.createURLSearchParams({
        pagina: pagina,
        limite: limite,
        codUsuario: 1 // Usuario por defecto
      });

      const url = `${this.API_BASE_URL}?${params}`;
      console.log('🔗 [ArancelService] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📥 [ArancelService] Respuesta status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [ArancelService] Datos recibidos:', data);
      
      // Normalizar la respuesta
      if (data.success && data.data) {
        return {
          success: true,
          message: data.message || 'Aranceles obtenidos',
          data: Array.isArray(data.data) ? data.data : [],
          pagina: data.pagina || pagina,
          limite: data.limite || limite,
          totalPaginas: data.totalPaginas || 1,
          totalRegistros: data.totalRegistros || 0
        };
      }
      
      // Si la respuesta viene en otro formato
      return {
        success: true,
        message: 'Aranceles obtenidos',
        data: Array.isArray(data) ? data : [],
        pagina: pagina,
        limite: limite,
        totalPaginas: 1,
        totalRegistros: 0
      };
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al obtener aranceles:', error);
      NotificationService.error('Error al cargar aranceles');
      throw new Error(error.message || 'Error al obtener aranceles');
    }
  }

  /**
   * Busca aranceles por año (GET con parámetros)
   */
  async buscarPorAnio(anio: number): Promise<ArancelData[]> {
    try {
      console.log(`🔍 [ArancelService] Buscando aranceles del año ${anio}...`);
      
      const params = this.createURLSearchParams({
        anio: anio,
        codUsuario: 1
      });

      const url = `${this.API_BASE_URL}?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al buscar aranceles del año ${anio}:`, error);
      throw new Error(error.message || 'Error al buscar aranceles por año');
    }
  }

  /**
   * Busca aranceles por dirección (GET con parámetros)
   */
  async buscarPorDireccion(codDireccion: number): Promise<ArancelData[]> {
    try {
      console.log(`🔍 [ArancelService] Buscando aranceles para dirección ${codDireccion}...`);
      
      const params = this.createURLSearchParams({
        codDireccion: codDireccion,
        codUsuario: 1
      });

      const url = `${this.API_BASE_URL}?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al buscar aranceles por dirección:`, error);
      throw new Error(error.message || 'Error al buscar aranceles por dirección');
    }
  }

  /**
   * Busca aranceles con filtros específicos
   */
  async buscarConFiltros(filtros: { anio?: number; codDireccion?: number }): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Buscando aranceles con filtros:', filtros);
      
      const params = this.createURLSearchParams({
        ...filtros,
        codUsuario: 1
      });

      const url = `${this.API_BASE_URL}?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al buscar aranceles con filtros:', error);
      throw new Error(error.message || 'Error al buscar aranceles');
    }
  }

  /**
   * Obtiene un arancel por ID
   */
  async obtenerPorId(id: number): Promise<ArancelData> {
    try {
      console.log(`🔍 [ArancelService] Obteniendo arancel con ID ${id}...`);
      
      const url = `${this.API_BASE_URL}/${id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      throw new Error('Arancel no encontrado');
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al obtener arancel ${id}:`, error);
      throw new Error(error.message || 'Error al obtener arancel');
    }
  }

  /**
   * Crea un nuevo arancel (POST con FormData)
   */
  async crear(datos: ArancelFormData): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando nuevo arancel:', datos);
      
      const formData = this.createFormData({
        anio: datos.anio,
        codDireccion: datos.codDireccion,
        codUsuario: datos.codUsuario || 1
      });

      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      console.log('📥 [ArancelService] Respuesta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ [ArancelService] Arancel creado exitosamente');
        NotificationService.success('Arancel creado exitosamente');
        return data.data;
      }
      
      throw new Error(data.message || 'Error al crear arancel');
    } catch (error: any) {
      console.error('❌ [ArancelService] Error al crear arancel:', error);
      NotificationService.error(error.message || 'Error al crear arancel');
      throw new Error(error.message || 'Error al crear arancel');
    }
  }

  /**
   * Actualiza un arancel (PUT con FormData)
   */
  async actualizar(id: number, datos: Partial<ArancelFormData>): Promise<ArancelData> {
    try {
      console.log(`📝 [ArancelService] Actualizando arancel ${id}:`, datos);
      
      const formData = this.createFormData({
        ...datos,
        codUsuario: datos.codUsuario || 1
      });

      const url = `${this.API_BASE_URL}/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ [ArancelService] Arancel actualizado exitosamente');
        NotificationService.success('Arancel actualizado exitosamente');
        return data.data;
      }
      
      throw new Error(data.message || 'Error al actualizar arancel');
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al actualizar arancel ${id}:`, error);
      NotificationService.error(error.message || 'Error al actualizar arancel');
      throw new Error(error.message || 'Error al actualizar arancel');
    }
  }

  /**
   * Elimina un arancel
   */
  async eliminar(id: number): Promise<void> {
    try {
      console.log(`🗑️ [ArancelService] Eliminando arancel ${id}...`);
      
      const url = `${this.API_BASE_URL}/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ [ArancelService] Arancel eliminado exitosamente');
      NotificationService.success('Arancel eliminado exitosamente');
    } catch (error: any) {
      console.error(`❌ [ArancelService] Error al eliminar arancel ${id}:`, error);
      NotificationService.error(error.message || 'Error al eliminar arancel');
      throw new Error(error.message || 'Error al eliminar arancel');
    }
  }

  /**
   * Verifica si existe un arancel para una dirección y año específicos
   */
  async existeArancel(codDireccion: number, anio: number): Promise<boolean> {
    try {
      const aranceles = await this.buscarConFiltros({ codDireccion, anio });
      return aranceles.length > 0;
    } catch (error) {
      console.error('❌ [ArancelService] Error al verificar existencia de arancel:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const arancelService = ArancelService.getInstance();