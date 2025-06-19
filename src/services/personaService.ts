// src/services/personaService.ts
import { BaseApiService } from './BaseApiService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos de Persona según la API real
 */
export interface PersonaData {
  codPersona?: number | null;
  codTipopersona: string;  // "0301" para natural, "0302" para jurídica
  codTipoDocumento: number; // 1 para DNI, 4 para RUC, etc.
  numerodocumento: string;
  nombres: string;
  apellidomaterno?: string;
  apellidopaterno?: string;
  fechanacimiento?: string; // formato "1988-01-01"
  codestadocivil?: number;
  codsexo?: number;
  telefono?: string;
  codDireccion?: number;
  lote?: string | null;
  otros?: string | null;
  parametroBusqueda?: string | null;
  codUsuario?: number;
  nombrePersona?: string; // Campo adicional que devuelve la API en listados
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
 * Parámetros para buscar personas
 */
export interface BuscarPersonaParams {
  codTipoPersona: string; // "0301" o "0302"
  parametroBusqueda: string;
}

/**
 * Servicio para gestionar personas
 */
class PersonaService extends BaseApiService {
  private static instance: PersonaService;
  
  private constructor() {
    super('/api/persona');
  }
  
  /**
   * Obtiene la instancia única del servicio
   */
  static getInstance(): PersonaService {
    if (!PersonaService.instance) {
      PersonaService.instance = new PersonaService();
    }
    return PersonaService.instance;
  }
  
  /**
   * Sobrescribe el método para incluir Bearer token en las peticiones
   */
  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return super.request<T>(url, {
      ...options,
      headers
    });
  }
  
  /**
   * Crea una nueva persona
   */
  async crear(data: PersonaData): Promise<PersonaData> {
    try {
      console.log('📤 [PersonaService] Creando persona:', data);
      
      const response = await this.post<PersonaApiResponse>('', data);
      
      if (response.success && response.data) {
        const personaCreada = response.data as PersonaData;
        console.log('✅ [PersonaService] Persona creada:', personaCreada);
        NotificationService.success(response.message || 'Persona registrada correctamente');
        return personaCreada;
      } else {
        throw new Error(response.message || 'Error al crear persona');
      }
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al crear persona:', error);
      NotificationService.error(error.message || 'Error al registrar persona');
      throw error;
    }
  }
  
  /**
   * Busca personas por tipo y nombre/razón social
   */
  async buscarPorTipoYNombre(params: BuscarPersonaParams): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Buscando personas:', params);
      
      const queryParams = new URLSearchParams({
        codTipoPersona: params.codTipoPersona,
        parametroBusqueda: params.parametroBusqueda
      });
      
      const response = await this.get<PersonaApiResponse>(
        `/listarPersonaPorTipoPersonaNombreRazon?${queryParams.toString()}`
      );
      
      if (response.success && response.data) {
        const personas = Array.isArray(response.data) ? response.data : [response.data];
        console.log(`✅ [PersonaService] ${personas.length} personas encontradas`);
        return personas;
      }
      
      return [];
    } catch (error) {
      console.error('❌ [PersonaService] Error al buscar personas:', error);
      return [];
    }
  }
  
  /**
   * Busca una persona por número de documento
   */
  async buscarPorDocumento(numeroDocumento: string): Promise<PersonaData | null> {
    try {
      // Buscar en ambos tipos de persona
      const [naturales, juridicas] = await Promise.all([
        this.buscarPorTipoYNombre({ 
          codTipoPersona: TIPO_PERSONA_CODES.NATURAL, 
          parametroBusqueda: numeroDocumento 
        }),
        this.buscarPorTipoYNombre({ 
          codTipoPersona: TIPO_PERSONA_CODES.JURIDICA, 
          parametroBusqueda: numeroDocumento 
        })
      ]);
      
      const todasLasPersonas = [...naturales, ...juridicas];
      const personaEncontrada = todasLasPersonas.find(p => p.numerodocumento === numeroDocumento);
      
      return personaEncontrada || null;
    } catch (error) {
      console.error('❌ [PersonaService] Error al buscar persona por documento:', error);
      return null;
    }
  }
  
  /**
   * Actualiza una persona existente
   */
  async actualizar(codPersona: number, data: PersonaData): Promise<PersonaData> {
    try {
      console.log('📤 [PersonaService] Actualizando persona:', codPersona, data);
      
      const response = await this.put<PersonaApiResponse>(`/${codPersona}`, data);
      
      if (response.success && response.data) {
        const personaActualizada = response.data as PersonaData;
        console.log('✅ [PersonaService] Persona actualizada:', personaActualizada);
        NotificationService.success(response.message || 'Persona actualizada correctamente');
        return personaActualizada;
      } else {
        throw new Error(response.message || 'Error al actualizar persona');
      }
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al actualizar persona:', error);
      NotificationService.error(error.message || 'Error al actualizar persona');
      throw error;
    }
  }
  
  /**
   * Obtiene todas las personas
   */
  async listarTodas(): Promise<PersonaData[]> {
    try {
      const response = await this.get<PersonaApiResponse>('');
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      
      return [];
    } catch (error) {
      console.error('❌ [PersonaService] Error al listar personas:', error);
      return [];
    }
  }
}

// Exportar instancia única
export const personaService = PersonaService.getInstance();

// Mapeos de códigos para la UI
export const TIPO_PERSONA_CODES = {
  NATURAL: '0301',
  JURIDICA: '0302'
} as const;

export const TIPO_DOCUMENTO_CODES = {
  DNI: 1,
  RUC: 4,
  PASAPORTE: 2,
  CARNET_EXTRANJERIA: 3
} as const;

export const SEXO_CODES = {
  MASCULINO: 1,
  FEMENINO: 2
} as const;

export const ESTADO_CIVIL_CODES = {
  SOLTERO: 1,
  CASADO: 2,
  DIVORCIADO: 3,
  VIUDO: 4,
  CONVIVIENTE: 5
} as const;