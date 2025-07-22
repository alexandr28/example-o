// src/services/arancelService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * IMPORTANTE: Esta API acepta tanto form-data como query parameters.
 * Desde el navegador SOLO podemos usar query parameters en GET.
 */

export interface ArancelData {
  codArancel: number | null;
  anio: number;
  codDireccion: number;
  costo: number | null;
  codUsuario: number | null;
  costoArancel: number;
}

export interface CreateArancelDTO {
  anio: number;
  codDireccion: number;
  costoArancel: number;
  codUsuario?: number;
}

export interface UpdateArancelDTO extends Partial<CreateArancelDTO> {}

export interface ArancelResponse {
  success: boolean;
  message: string;
  data: ArancelData[];
  pagina: number | null;
  limite: number | null;
  totalPaginas: number | null;
  totalRegistros: number | null;
}

class ArancelService extends BaseApiService<ArancelData, CreateArancelDTO, UpdateArancelDTO> {
  private static instance: ArancelService;
  
  private constructor() {
    super(
      '/api/arancel',
      {
        normalizeItem: (item: any) => ({
          codArancel: item.codArancel || null,
          anio: item.anio || new Date().getFullYear(),
          codDireccion: item.codDireccion || 0,
          costo: item.costo || null,
          codUsuario: item.codUsuario || null,
          costoArancel: parseFloat(item.costoArancel || '0')
        }),
        
        validateItem: (item: ArancelData) => {
          return !!(
            item.anio && 
            item.codDireccion && 
            item.costoArancel >= 0
          );
        }
      },
      'arancel'
    );
  }
  
  static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }

  /**
   * Lista todos los aranceles
   * IMPORTANTE: Aunque Postman use form-data, desde el navegador
   * DEBEMOS usar query parameters porque no se puede enviar body en GET
   */
  async listarAranceles(anio?: number): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles para año:', anio);
      
      // Construir URL con query parameters (única opción desde el navegador)
      let url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      if (anio) {
        // Query parameters - funciona igual que form-data pero en la URL
        const params = new URLSearchParams({
          codDireccion: '1',
          anio: anio.toString(),
          codUsuario: '1'
        });
        
        url += `?${params.toString()}`;
        console.log('📡 [ArancelService] GET con query params:', url);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // NO incluir Content-Type en GET
        },
        // NO incluir body en GET (causaría error)
      });
      
      console.log('📡 [ArancelService] Status:', response.status);
      
      if (!response.ok) {
        console.error('❌ [ArancelService] Error:', response.status, response.statusText);
        
        // Si es 403, el servidor rechaza la petición
        if (response.status === 403) {
          console.error('🚫 Error 403: El servidor rechaza la petición. Posibles causas:');
          console.error('   - CORS no configurado');
          console.error('   - El servidor espera form-data pero recibe query params');
          console.error('   - Falta algún header o cookie');
        }
        
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      console.log('✅ [ArancelService] Datos recibidos:', responseData);
      
      if (responseData.success && responseData.data) {
        return this.normalizeData(Array.isArray(responseData.data) ? responseData.data : [responseData.data]);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un arancel por año y dirección
   */
  async obtenerPorAnioYDireccion(anio: number, codDireccion: number): Promise<ArancelData | null> {
    try {
      console.log('🔍 [ArancelService] Obteniendo arancel:', { anio, codDireccion });
      
      const params = new URLSearchParams({
        codDireccion: codDireccion.toString(),
        anio: anio.toString(),
        codUsuario: '1'
      });
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        const aranceles = this.normalizeData(Array.isArray(responseData.data) ? responseData.data : [responseData.data]);
        return aranceles.find(a => a.codDireccion === codDireccion && a.anio === anio) || null;
      }
      
      return null;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo arancel
   * POST sí puede usar FormData
   */
  async crearArancel(datos: CreateArancelDTO): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando arancel:', datos);
      
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('codDireccion', datos.codDireccion.toString());
      formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', (datos.codUsuario || 1).toString());
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel creado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error('Error al crear el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al crear el arancel');
      throw error;
    }
  }
  
  /**
   * Actualiza un arancel
   */
  async actualizarArancel(codArancel: number, datos: UpdateArancelDTO): Promise<ArancelData> {
    try {
      console.log('📝 [ArancelService] Actualizando arancel:', codArancel, datos);
      
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.codDireccion !== undefined) formData.append('codDireccion', datos.codDireccion.toString());
      if (datos.costoArancel !== undefined) formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', '1');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel actualizado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error('Error al actualizar el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al actualizar el arancel');
      throw error;
    }
  }
  
  /**
   * Elimina un arancel
   */
  async eliminarArancel(codArancel: number): Promise<void> {
    try {
      console.log('🗑️ [ArancelService] Eliminando arancel:', codArancel);
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      NotificationService.success('Arancel eliminado exitosamente');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al eliminar el arancel');
      throw error;
    }
  }
}

export default ArancelService.getInstance();