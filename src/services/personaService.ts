// src/services/personaService.ts
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos de una persona según la API
 */
export interface PersonaData {
  codPersona?: number;
  codTipopersona: string; // "0301" para natural, "0302" para jurídica
  codTipoDocumento: string; // "1", "2", "4", etc.
  numerodocumento: string;
  nombres: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  fechanacimiento?: string; // formato "1988-01-01"
  codestadocivil?: number;
  codsexo?: number;
  telefono?: string;
  codDireccion?: number;
  lote?: string | null;
  otros?: string | null;
  parametroBusqueda?: string | null;
  codUsuario?: number;
}

/**
 * Interface para la respuesta de la API
 */
export interface PersonaApiResponse {
  success: boolean;
  message: string;
  data: PersonaData | PersonaData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestionar personas en la API
 */
class PersonaService {
  private static instance: PersonaService;
  private readonly API_BASE = 'http://192.168.20.160:8080/api/persona';
  
  private constructor() {}
  
  static getInstance(): PersonaService {
    if (!PersonaService.instance) {
      PersonaService.instance = new PersonaService();
    }
    return PersonaService.instance;
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    return token;
  }
  
  /**
   * Crea una nueva persona
   */
  async crear(data: PersonaData): Promise<PersonaData> {
    try {
      console.log('📤 [PersonaService] Creando persona:', data);
      console.log('📍 [PersonaService] URL:', this.API_BASE);
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      console.log('🔑 [PersonaService] Token:', token.substring(0, 20) + '...');
      
      // Asegurar que los datos tengan los valores requeridos
      const requestData = {
        ...data,
        codPersona: null, // Asegurar que sea null para nueva persona
        parametroBusqueda: null,
        codUsuario: 1 // Valor por defecto si no viene
      };
      
      console.log('📋 [PersonaService] Datos a enviar:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      console.log('📥 [PersonaService] Respuesta:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 [PersonaService] Respuesta raw:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [PersonaService] Error al parsear respuesta:', parseError);
        throw new Error(`Respuesta inválida del servidor: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(result?.message || `Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      // La API podría devolver directamente el objeto persona sin wrapper
      if (result.codPersona) {
        console.log('✅ [PersonaService] Persona creada (respuesta directa):', result);
        return result;
      } else if (result.success && result.data) {
        console.log('✅ [PersonaService] Persona creada (con wrapper):', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Error al crear persona: respuesta inválida');
      }
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al crear persona:', error);
      throw error;
    }
  }
  
  /**
   * Busca personas por tipo y parámetro
   */
  async buscarPorTipoYNombre(codTipoPersona: string, parametro: string): Promise<PersonaData[]> {
    try {
      const token = this.getAuthToken();
      const params = new URLSearchParams({
        codTipoPersona,
        parametroBusqueda: parametro
      });
      
      const response = await fetch(
        `${this.API_BASE}/listarPersonaPorTipoPersonaNombreRazon?${params}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [result.data];
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [PersonaService] Error al buscar personas:', error);
      return [];
    }
  }
}

export const personaService = PersonaService.getInstance();