// src/services/personaService.ts
import BaseApiService from './BaseApiService';
import { getEndpoint } from '../config/api.unified.config';
import { apiGet } from '../utils/api';

/**
 * Interfaces para Persona
 */
export interface PersonaData {
  codPersona: number;
  codTipopersona?: string | null;
  codTipoDocumento?: string | null;
  numerodocumento: string;
  nombres?: string | null;
  apellidomaterno?: string | null;
  apellidopaterno?: string | null;
  razonSocial?: string | null;
  direccion?: string | null;
  fechanacimiento?: number | null;
  codestadocivil?: string | null;
  codsexo?: string | null;
  telefono?: string | null;
  email?: string | null;
  codDireccion?: number | null;
  lote?: string | null;
  otros?: string | null;
  parametroBusqueda?: string | null;
  codUsuario?: number | null;
  nombrePersona: string;
  estado?: string;
  fechaRegistro?: string;
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
  numeroDocumento?: string;
  codUsuario?: number;
}

export interface CreatePersonaDTO {
  codTipopersona: string;
  codTipoDocumento: string;
  numerodocumento: string;
  nombres?: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  codUsuario?: number;
}

export interface UpdatePersonaDTO extends Partial<CreatePersonaDTO> {
  codPersona?: number;
}

// Constantes para tipos de persona
export const TIPO_PERSONA_CODES = {
  PERSONA_NATURAL: '0301',
  PERSONA_JURIDICA: '0302'
} as const;

/**
 * Servicio para manejar las operaciones de personas
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class PersonaService extends BaseApiService<PersonaData, CreatePersonaDTO, UpdatePersonaDTO> {
  private static instance: PersonaService;
  
  private constructor() {
    super(
      getEndpoint('persona', 'base'),
      {
        normalizeItem: (item: any) => ({
          codPersona: item.codPersona,
          codTipopersona: item.codTipopersona,
          codTipoDocumento: item.codTipoDocumento,
          numerodocumento: item.numerodocumento || '',
          nombres: item.nombres,
          apellidomaterno: item.apellidomaterno,
          apellidopaterno: item.apellidopaterno,
          razonSocial: item.razonSocial,
          direccion: item.direccion === 'null' ? null : item.direccion,
          fechanacimiento: item.fechanacimiento,
          codestadocivil: item.codestadocivil,
          codsexo: item.codsexo,
          telefono: item.telefono,
          email: item.email,
          codDireccion: item.codDireccion,
          lote: item.lote,
          otros: item.otros,
          parametroBusqueda: item.parametroBusqueda,
          codUsuario: item.codUsuario,
          nombrePersona: item.nombrePersona || this.construirNombreCompleto(item),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro
        }),
        
        validateItem: (item: PersonaData) => {
          return !!(item.codPersona && item.numerodocumento);
        }
      },
      'persona'
    );
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
   * Construye el nombre completo de una persona
   */
  private construirNombreCompleto(item: any): string {
    // Si es persona jurídica y tiene razón social
    if (item.codTipopersona === TIPO_PERSONA_CODES.PERSONA_JURIDICA && item.razonSocial) {
      return item.razonSocial;
    }
    
    // Para persona natural, construir nombre completo
    const partes = [
      item.apellidopaterno,
      item.apellidomaterno,
      item.nombres
    ].filter(Boolean);
    
    return partes.join(' ').trim() || 'Sin nombre';
  }
  
  /**
   * Lista personas por tipo y nombre/razón social
   * NO requiere autenticación (método GET)
   */
  async listarPorTipoYNombre(params: BusquedaPersonaParams): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Buscando personas con parámetros:', params);
      
      const queryParams: Record<string, string> = {};
      
      if (params.codTipoPersona) {
        queryParams.codTipoPersona = params.codTipoPersona;
      }
      if (params.parametroBusqueda) {
        queryParams.parametroBusqueda = params.parametroBusqueda;
      } else {
        queryParams.parametroBusqueda = 'a'; // Valor por defecto
      }
      if (params.codUsuario) {
        queryParams.codUsuario = params.codUsuario.toString();
      }
      
      // Usar el endpoint específico para búsqueda por tipo y nombre
      const endpoint = getEndpoint('persona', 'listarPorTipoYNombre');
      const response = await apiGet<PersonaData[]>(endpoint, { params: queryParams });
      
      if (Array.isArray(response)) {
        console.log(`✅ [PersonaService] ${response.length} personas encontradas`);
        return this.normalizeData(response);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error en búsqueda:', error);
      throw error;
    }
  }
  
  /**
   * Lista personas por tipo para contribuyente
   * NO requiere autenticación (método GET)
   */
  async listarPorContribuyente(params: BusquedaPersonaParams): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Buscando personas para contribuyente:', params);
      
      const queryParams: Record<string, string> = {};
      
      if (params.codTipoPersona) {
        queryParams.codTipoPersona = params.codTipoPersona;
      }
      if (params.parametroBusqueda) {
        queryParams.parametroBusqueda = params.parametroBusqueda;
      }
      
      // Usar el endpoint específico para contribuyentes
      const endpoint = getEndpoint('persona', 'listarPorContribuyente');
      const response = await apiGet<PersonaData[]>(endpoint, { params: queryParams });
      
      if (Array.isArray(response)) {
        return this.normalizeData(response);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error en búsqueda para contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todas las personas sin filtros
   * NO requiere autenticación (método GET)
   */
  async obtenerTodas(): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Obteniendo todas las personas');
      
      // Usar el método getAll del BaseApiService
      return await this.getAll();
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al obtener personas:', error);
      throw error;
    }
  }
  
  /**
   * Busca personas por número de documento
   * NO requiere autenticación (método GET)
   */
  async buscarPorDocumento(numeroDocumento: string): Promise<PersonaData[]> {
    try {
      console.log('🔍 [PersonaService] Buscando por documento:', numeroDocumento);
      
      return await this.search({ 
        numeroDocumento,
        parametroBusqueda: numeroDocumento 
      });
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error en búsqueda por documento:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una persona por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigo(codPersona: number): Promise<PersonaData | null> {
    try {
      console.log(`🔍 [PersonaService] Buscando persona con código: ${codPersona}`);
      
      return await this.getById(codPersona);
      
    } catch (error: any) {
      console.error(`❌ [PersonaService] Error al obtener persona ${codPersona}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva persona
   * REQUIERE autenticación (método POST)
   */
  async crearPersona(datos: CreatePersonaDTO): Promise<PersonaData> {
    try {
      console.log('➕ [PersonaService] Creando nueva persona:', datos);
      
      // Verificar token antes de crear
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear personas');
      }
      
      const datosCompletos = {
        ...datos,
        codUsuario: datos.codUsuario || 1,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al crear persona:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una persona existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarPersona(codPersona: number, datos: UpdatePersonaDTO): Promise<PersonaData> {
    try {
      console.log('📝 [PersonaService] Actualizando persona:', codPersona, datos);
      
      // Verificar token antes de actualizar
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar personas');
      }
      
      return await this.update(codPersona, datos);
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al actualizar persona:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una persona
   * REQUIERE autenticación (método DELETE)
   */
  async eliminarPersona(codPersona: number): Promise<void> {
    try {
      console.log('🗑️ [PersonaService] Eliminando persona:', codPersona);
      
      // Verificar token antes de eliminar
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar personas');
      }
      
      return await this.delete(codPersona);
      
    } catch (error: any) {
      console.error('❌ [PersonaService] Error al eliminar persona:', error);
      throw error;
    }
  }
  
  /**
   * Convierte PersonaData a formato compatible con ContribuyenteData
   */
  convertirAContribuyente(persona: PersonaData): any {
    return {
      codigoPersona: persona.codPersona,
      tipoPersona: persona.codTipopersona,
      tipoDocumento: persona.codTipoDocumento,
      numeroDocumento: persona.numerodocumento,
      nombres: persona.nombres || '',
      apellidoPaterno: persona.apellidopaterno || '',
      apellidoMaterno: persona.apellidomaterno || '',
      razonSocial: persona.razonSocial || '',
      nombreCompleto: persona.nombrePersona,
      direccion: persona.direccion || '',
      telefono: persona.telefono || '',
      email: persona.email || '',
      fechaNacimiento: persona.fechanacimiento,
      estadoCivil: persona.codestadocivil,
      sexo: persona.codsexo,
      lote: persona.lote,
      estado: persona.estado || 'ACTIVO'
    };
  }
  
  /**
   * Valida un número de documento según el tipo
   */
  validarDocumento(tipoDocumento: string, numeroDocumento: string): {
    valido: boolean;
    mensaje?: string;
  } {
    // DNI: 8 dígitos
    if (tipoDocumento === 'DNI' || tipoDocumento === '0101') {
      if (!/^\d{8}$/.test(numeroDocumento)) {
        return { 
          valido: false, 
          mensaje: 'El DNI debe tener exactamente 8 dígitos' 
        };
      }
    }
    
    // RUC: 11 dígitos
    if (tipoDocumento === 'RUC' || tipoDocumento === '0102') {
      if (!/^\d{11}$/.test(numeroDocumento)) {
        return { 
          valido: false, 
          mensaje: 'El RUC debe tener exactamente 11 dígitos' 
        };
      }
    }
    
    // Carnet de extranjería: hasta 12 caracteres alfanuméricos
    if (tipoDocumento === 'CE' || tipoDocumento === '0103') {
      if (!/^[A-Z0-9]{4,12}$/.test(numeroDocumento.toUpperCase())) {
        return { 
          valido: false, 
          mensaje: 'El Carnet de Extranjería debe tener entre 4 y 12 caracteres alfanuméricos' 
        };
      }
    }
    
    return { valido: true };
  }
}

// Exportar instancia singleton
export const personaService = PersonaService.getInstance();

// Exportar también la clase por si se necesita extender
export default PersonaService;