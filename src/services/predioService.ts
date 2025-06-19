// src/services/predioService.ts
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos del predio según la API
 */
export interface PredioData {
  codPredio?: number;
  codPersona: number; // Código del contribuyente/persona
  anioAdquisicion: string;
  fechaAdquisicion: string; // formato "YYYY-MM-DD"
  condicionPropiedad: string;
  codDireccion: number;
  nFinca?: string;
  otroNumero?: string;
  arancel: number;
  tipoPredio: string;
  conductor: string;
  usoPredio: string;
  areaTerreno: number;
  numeroPisos: number;
  numeroCondominos: number;
  rutaFotografiaPredio?: string;
  rutaPlanoPredio?: string;
  estado?: boolean;
  codUsuario?: number;
}

/**
 * Interface para la respuesta de la API
 */
export interface PredioApiResponse {
  success: boolean;
  message: string;
  data: PredioData | PredioData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestionar predios
 */
class PredioService {
  private static instance: PredioService;
  private readonly API_BASE = 'http://192.168.20.160:8080/api/predio';
  
  private constructor() {}
  
  /**
   * Obtiene la instancia única del servicio
   */
  static getInstance(): PredioService {
    if (!PredioService.instance) {
      PredioService.instance = new PredioService();
    }
    return PredioService.instance;
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * Crea un nuevo predio
   */
  async crear(data: PredioData): Promise<PredioData> {
    try {
      console.log('📤 [PredioService] Creando predio:', data);
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [PredioService] Error al parsear respuesta:', parseError);
        throw new Error(`Respuesta inválida del servidor`);
      }
      
      if (!response.ok) {
        throw new Error(result?.message || `Error HTTP ${response.status}`);
      }
      
      if (result.success && result.data) {
        console.log('✅ [PredioService] Predio creado:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Error al crear predio');
      }
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error al crear predio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un predio por ID
   */
  async obtenerPorId(id: number): Promise<PredioData | null> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ [PredioService] Error al obtener predio:', error);
      return null;
    }
  }
  
  /**
   * Busca predios por contribuyente
   */
  async buscarPorContribuyente(codPersona: number): Promise<PredioData[]> {
    try {
      const token = this.getAuthToken();
      const params = new URLSearchParams({ codPersona: codPersona.toString() });
      
      const response = await fetch(`${this.API_BASE}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [result.data];
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [PredioService] Error al buscar predios:', error);
      return [];
    }
  }
  
  /**
   * Actualiza un predio existente
   */
  async actualizar(id: number, data: PredioData): Promise<PredioData> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ [PredioService] Predio actualizado:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Error al actualizar predio');
      }
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error al actualizar predio:', error);
      throw error;
    }
  }
}

export const predioService = PredioService.getInstance();