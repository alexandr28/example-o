// src/services/personaService.ts
import { apiGet, apiPost, API_BASE_URL } from '../components/utils/apiRequest';

// Interfaces
export interface PersonaData {
  codPersona: number;
  codTipopersona?: string | null;
  codTipoDocumento?: string | null;
  numerodocumento: string;
  nombres?: string | null;
  apellidomaterno?: string | null;
  apellidopaterno?: string | null;
  direccion?: string | null;
  fechanacimiento?: number | null;
  codestadocivil?: string | null;
  codsexo?: string | null;
  telefono?: string | null;
  codDireccion?: number | null;
  lote?: string | null;
  otros?: string | null;
  parametroBusqueda?: string | null;
  codUsuario?: number | null;
  nombrePersona: string;
}

export interface PersonaApiResponse {
  success: boolean;
  message: string;
  data: PersonaData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

export interface BusquedaPersonaParams {
  codTipoPersona?: string;
  parametroBusqueda?: string;
}

// Constantes para tipos de persona
export const TIPO_PERSONA_CODES = {
  PERSONA_NATURAL: '0301',
  PERSONA_JURIDICA: '0302'
} as const;

/**
 * Servicio para manejar las operaciones de personas
 * Este servicio NO requiere autenticación para los métodos GET
 */
export class PersonaService {
  private static instance: PersonaService;
  private readonly API_ENDPOINT = '/api/persona';
  
  private constructor() {
    console.log('🔧 [PersonaService] Inicializado');
    console.log('🌐 [PersonaService] API Base URL:', API_BASE_URL);
    console.log('📍 [PersonaService] Endpoint:', this.API_ENDPOINT);
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PersonaService {
    if (!PersonaService.instance) {
      PersonaService.instance = new PersonaService();
    }
    return PersonaService.instance;
  }
  
  /**
   * Lista personas por tipo y nombre/razón social
   * NO requiere autenticación
   */
  async listarPorTipoYNombre(params: BusquedaPersonaParams): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Buscando personas con parámetros:', params);
      
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros si existen
      if (params.codTipoPersona) {
        queryParams.append('codTipoPersona', params.codTipoPersona);
      }
      if (params.parametroBusqueda) {
        queryParams.append('parametroBusqueda', params.parametroBusqueda);
      } else {
        // Valor por defecto para obtener resultados
        queryParams.append('parametroBusqueda', 'a');
      }
      
      const endpoint = `${this.API_ENDPOINT}/listarPersonaPorTipoPersonaNombreRazon?${queryParams}`;
      
      console.log('📡 [PersonaService] GET:', endpoint);
      
      // NO incluir headers de autenticación para este endpoint
      const response = await apiGet(endpoint);
      
      console.log('📥 [PersonaService] Respuesta:', response);
      
      if (response && Array.isArray(response)) {
        console.log(`✅ [PersonaService] ${response.length} personas encontradas`);
        return response;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error en búsqueda:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todas las personas sin filtros
   * NO requiere autenticación
   */
  async obtenerTodas(): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Obteniendo todas las personas');
      
      const endpoint = `${this.API_ENDPOINT}/obtenerPersonasBasicas`;
      
      console.log('📡 [PersonaService] GET:', endpoint);
      
      // NO incluir headers de autenticación
      const response = await apiGet(endpoint);
      
      console.log('📥 [PersonaService] Respuesta:', response);
      
      if (response && Array.isArray(response)) {
        console.log(`✅ [PersonaService] ${response.length} personas obtenidas`);
        return response;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al obtener personas:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los datos básicos de una persona por su código
   */
  async obtenerPorCodigo(codPersona: number): Promise<PersonaData | null> {
    try {
      console.log(`🔍 [PersonaService] Buscando persona con código: ${codPersona}`);
      
      // Primero obtenemos todas las personas
      const todasLasPersonas = await this.obtenerTodas();
      
      // Buscamos por código
      const persona = todasLasPersonas.find(p => p.codPersona === codPersona);
      
      if (persona) {
        console.log('✅ [PersonaService] Persona encontrada:', persona.nombrePersona);
        return persona;
      }
      
      console.warn('⚠️ [PersonaService] Persona no encontrada');
      return null;
      
    } catch (error: any) {
      console.error(`❌ [PersonaService] Error al obtener persona ${codPersona}:`, error);
      throw error;
    }
  }
  
  /**
   * Convierte PersonaData a formato compatible con ContribuyenteData
   */
  convertirAContribuyente(persona: PersonaData): any {
    // Separar el nombre completo si es necesario
    const partesNombre = persona.nombrePersona.split(' ');
    let apellidoPaterno = '';
    let apellidoMaterno = '';
    let nombres = '';
    
    if (partesNombre.length >= 3) {
      apellidoPaterno = partesNombre[0];
      apellidoMaterno = partesNombre[1];
      nombres = partesNombre.slice(2).join(' ');
    } else if (partesNombre.length === 2) {
      apellidoPaterno = partesNombre[0];
      nombres = partesNombre[1];
    } else {
      nombres = persona.nombrePersona;
    }
    
    return {
      codigoPersona: persona.codPersona,
      nombre: persona.nombrePersona,
      numeroDocumento: persona.numerodocumento,
      tipoDocumento: persona.codTipoDocumento,
      direccion: persona.direccion === 'null' ? '' : persona.direccion,
      telefono: persona.telefono || '',
      nombres: persona.nombres || nombres,
      apellidoPaterno: persona.apellidopaterno || apellidoPaterno,
      apellidoMaterno: persona.apellidomaterno || apellidoMaterno,
      fechaNacimiento: persona.fechanacimiento,
      estadoCivil: persona.codestadocivil,
      sexo: persona.codsexo,
      lote: persona.lote
    };
  }
}

// Exportar instancia singleton
export const personaService = PersonaService.getInstance();