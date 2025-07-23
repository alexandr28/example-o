// src/services/arancelService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * IMPORTANTE: Esta API acepta tanto form-data como query parameters.
 * Desde el navegador SOLO podemos usar query parameters en GET.
 * Las peticiones GET NO requieren autenticación.
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
   * Lista todos los aranceles - NO requiere autenticación
   * IMPORTANTE: Hacemos la petición directamente sin usar BaseApiService
   * para evitar que se envíen headers de autenticación
   */
  async listarAranceles(anio?: number): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles para año:', anio);
      
      // Construir URL con query parameters
      let url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      // Siempre enviar los parámetros requeridos
      const params = new URLSearchParams({
        codDireccion: '1',
        anio: anio?.toString() || '2025',
        codUsuario: '1'
      });
      
      url += `?${params.toString()}`;
      console.log('📡 [ArancelService] GET:', url);
      
      // Petición directa sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // NO incluir Authorization
          // NO incluir Content-Type en GET
        },
        // NO incluir body en GET
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response Headers:', response.headers);
      
      if (!response.ok) {
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Intentar leer el body del error
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Body:', errorText);
        
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      console.log('✅ [ArancelService] Datos recibidos:', responseData);
      
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(data);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error completo:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un arancel por año y dirección - NO requiere autenticación
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
      console.log('📡 [ArancelService] GET:', url);
      
      // Petición directa sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
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
   * Crea un nuevo arancel - POST puede usar FormData
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
        // NO incluir headers, el navegador los configura automáticamente para FormData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
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
   * Actualiza un arancel - PUT requiere FormData
   * IMPORTANTE: Usar URL completa para evitar problemas con proxy
   */
  async actualizarArancel(codArancel: number, datos: UpdateArancelDTO): Promise<ArancelData> {
    try {
      console.log('📝 [ArancelService] Actualizando arancel:', codArancel, datos);
      
      // IMPORTANTE: Usar FormData, no JSON
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.codDireccion !== undefined) formData.append('codDireccion', datos.codDireccion.toString());
      if (datos.costoArancel !== undefined) formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', '1');
      
      console.log('📡 [ArancelService] Enviando FormData para actualización');
      
      // IMPORTANTE: Usar URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`;
      console.log('🌐 [ArancelService] URL completa:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        body: formData
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: response.url
        });
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      console.log('✅ [ArancelService] Respuesta:', responseData);
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel actualizado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error(responseData.message || 'Error al actualizar el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error completo:', error);
      console.error('❌ [ArancelService] Stack:', error.stack);
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
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      NotificationService.success('Arancel eliminado exitosamente');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al eliminar el arancel');
      throw error;
    }
  }
}

// Exportar la instancia singleton
const arancelService = ArancelService.getInstance();
export default arancelService;

// También exportar la clase para tests
export { ArancelService };