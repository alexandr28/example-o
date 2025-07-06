// src/services/contribuyenteListService.ts
import { API_CONFIG, buildApiUrl, requiresAuth, getAuthHeaders, getPublicHeaders } from '../config/api.config';
import { NotificationService } from '../components/utils/Notification';

export interface ContribuyentePersona {
  codPersona: number;
  codTipopersona?: string | null;
  codTipoDocumento?: string | null;
  numerodocumento: string;
  nombres?: string | null;
  apellidomaterno?: string | null;
  apellidopaterno?: string | null;
  direccion?: string | null;
  nombrePersona: string;
  // Campos adicionales que pueden venir
  telefono?: string | null;
  email?: string | null;
  fechanacimiento?: number | null;
  codestadocivil?: string | null;
  codsexo?: string | null;
}

export interface ContribuyenteListResponse {
  success: boolean;
  message: string;
  data: ContribuyentePersona[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para listar contribuyentes desde el endpoint de personas
 * Este servicio NO requiere autenticación
 */
export class ContribuyenteListService {
  private static instance: ContribuyenteListService;
  
  private constructor() {
    console.log('🔧 [ContribuyenteListService] Inicializado');
    console.log('🌐 [ContribuyenteListService] Base URL:', API_CONFIG.baseURL);
  }
  
  static getInstance(): ContribuyenteListService {
    if (!ContribuyenteListService.instance) {
      ContribuyenteListService.instance = new ContribuyenteListService();
    }
    return ContribuyenteListService.instance;
  }
  
  /**
   * Lista todos los contribuyentes usando el endpoint de personas
   * NO requiere autenticación
   */
  async listarContribuyentes(parametroBusqueda: string = 'a'): Promise<ContribuyentePersona[]> {
    try {
      console.log('🔍 [ContribuyenteListService] Listando contribuyentes');
      
      const params = new URLSearchParams({
        parametroBusqueda,
        codUsuario: '1'
      });
      
      // Usar el endpoint de personas que no requiere auth
      const endpoint = `${API_CONFIG.endpoints.personas.listarPorTipoYNombre}?${params}`;
      const url = buildApiUrl(endpoint);
      
      console.log('📡 [ContribuyenteListService] GET:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getPublicHeaders(),
        mode: 'cors'
      });
      
      console.log('📥 [ContribuyenteListService] Response:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ContribuyenteListResponse = await response.json();
      
      if (data.success && data.data) {
        console.log(`✅ [ContribuyenteListService] ${data.data.length} contribuyentes encontrados`);
        return data.data;
      }
      
      console.warn('⚠️ [ContribuyenteListService] No se encontraron contribuyentes');
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteListService] Error:', error);
      NotificationService.error('Error al cargar contribuyentes');
      throw error;
    }
  }
  
  /**
   * Busca contribuyentes por nombre o documento
   */
  async buscarContribuyentes(termino: string): Promise<ContribuyentePersona[]> {
    if (!termino || termino.length < 2) {
      return [];
    }
    
    return this.listarContribuyentes(termino);
  }
  
  /**
   * Obtiene un contribuyente por su código de persona
   */
  async obtenerPorCodigo(codPersona: number): Promise<ContribuyentePersona | null> {
    try {
      // Primero buscar en la lista general
      const todos = await this.listarContribuyentes();
      const encontrado = todos.find(c => c.codPersona === codPersona);
      
      if (encontrado) {
        console.log('✅ [ContribuyenteListService] Contribuyente encontrado:', encontrado.nombrePersona);
        return encontrado;
      }
      
      console.warn('⚠️ [ContribuyenteListService] Contribuyente no encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ [ContribuyenteListService] Error al obtener contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Convierte un ContribuyentePersona al formato esperado por otros componentes
   */
  formatearContribuyente(persona: ContribuyentePersona): any {
    // Intentar separar el nombre completo si es necesario
    const partesNombre = persona.nombrePersona.split(' ');
    let apellidoPaterno = persona.apellidopaterno || '';
    let apellidoMaterno = persona.apellidomaterno || '';
    let nombres = persona.nombres || '';
    
    // Si no vienen los campos separados, intentar deducirlos del nombre completo
    if (!apellidoPaterno && !apellidoMaterno && !nombres && partesNombre.length >= 3) {
      apellidoPaterno = partesNombre[0];
      apellidoMaterno = partesNombre[1];
      nombres = partesNombre.slice(2).join(' ');
    }
    
    return {
      codigoPersona: persona.codPersona,
      codigoContribuyente: persona.codPersona, // Usar el mismo código
      nombre: persona.nombrePersona,
      numeroDocumento: persona.numerodocumento,
      tipoDocumento: persona.codTipoDocumento,
      direccion: persona.direccion === 'null' ? '' : (persona.direccion || ''),
      telefono: persona.telefono || '',
      email: persona.email || '',
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      fechaNacimiento: persona.fechanacimiento,
      estadoCivil: persona.codestadocivil,
      sexo: persona.codsexo
    };
  }
}

// Exportar instancia singleton
export const contribuyenteListService = ContribuyenteListService.getInstance();