// src/services/contribuyenteService.ts
import { apiGet, apiPost, API_BASE_URL } from '../components/utils/apiRequest';

// Interfaces
export interface ContribuyenteData {
  codigoContribuyente: number;
  codigoPersona: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  numeroDocumento?: string;
  tipoDocumento?: string;
  // Campos adicionales
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: number;
  estadoCivil?: string;
  sexo?: string;
  lote?: string;
  // Datos del cónyuge
  conyuge?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
    tipoDocumento: string;
  };
  // Datos del representante legal
  representanteLegal?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
    tipoDocumento: string;
  };
  [key: string]: any;
}

export interface ContribuyenteApiResponse {
  success: boolean;
  data: ContribuyenteData | ContribuyenteData[];
  message?: string;
}

/**
 * Servicio para manejar las operaciones de contribuyentes
 */
export class ContribuyenteService {
  private static instance: ContribuyenteService;
  private readonly API_ENDPOINT = '/api/contribuyente';
  
  private constructor() {
    console.log('🔧 [ContribuyenteService] Inicializado');
    console.log('🌐 [ContribuyenteService] API Base URL:', API_BASE_URL);
    console.log('📍 [ContribuyenteService] Endpoint:', this.API_ENDPOINT);
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  /**
   * Mapea los datos de la API al formato interno
   */
  private mapearContribuyente(item: any): ContribuyenteData {
    return {
      codigoContribuyente: item.codContribuyente,
      codigoPersona: item.codPersona,
      nombre: `${item.nombres || ''} ${item.apellidopaterno || ''} ${item.apellidomaterno || ''}`.trim(),
      direccion: item.direccion,
      telefono: item.telefono,
      email: item.email || '',
      numeroDocumento: item.numerodocumento,
      tipoDocumento: item.codTipoDocumento,
      nombres: item.nombres,
      apellidoPaterno: item.apellidopaterno,
      apellidoMaterno: item.apellidomaterno,
      fechaNacimiento: item.fechanacimiento,
      estadoCivil: item.codestadocivil,
      sexo: item.codsexo,
      lote: item.lote,
      // Datos del cónyuge si existen
      conyuge: item.conyugeNombres ? {
        nombres: item.conyugeNombres,
        apellidoPaterno: item.conyugeApellidopaterno,
        apellidoMaterno: item.conyugeApellidomaterno,
        numeroDocumento: item.conyugeNumeroDocumento,
        tipoDocumento: item.conyugeTipoDocumento
      } : null,
      // Datos del representante legal si existen
      representanteLegal: item.repreNombres ? {
        nombres: item.repreNombres,
        apellidoPaterno: item.repreApellidopaterno,
        apellidoMaterno: item.repreApellidomaterno,
        numeroDocumento: item.repreNumeroDocumento,
        tipoDocumento: item.repreTipoDocumento
      } : null
    };
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    // Buscar en diferentes lugares donde podría estar el token
    const token = localStorage.getItem('auth_token') || 
                 sessionStorage.getItem('auth_token') ||
                 localStorage.getItem('token') ||
                 sessionStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ [ContribuyenteService] No se encontró token de autenticación');
    }
    
    return token;
  }
  
  /**
   * Construye los headers incluyendo el token si está disponible
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    const token = this.getAuthToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 [ContribuyenteService] Token incluido en headers');
    }
    
    return headers;
  }
  
  /**
   * Obtiene todos los contribuyentes
   */
  async obtenerTodos(): Promise<ContribuyenteData[]> {
    try {
      console.log('🔄 [ContribuyenteService] Obteniendo todos los contribuyentes');
      
      const response = await apiGet(this.API_ENDPOINT, this.getHeaders());
      
      console.log('📥 [ContribuyenteService] Respuesta recibida:', response);
      
      if (response.success && response.data) {
        const contribuyentes = Array.isArray(response.data) ? response.data : [response.data];
        
        // Mapear los datos al formato esperado
        const contribuyentesMapeados = contribuyentes.map(item => this.mapearContribuyente(item));
        
        console.log(`✅ [ContribuyenteService] ${contribuyentesMapeados.length} contribuyentes obtenidos y mapeados`);
        return contribuyentesMapeados;
      }
      
      console.warn('⚠️ [ContribuyenteService] Respuesta sin datos válidos');
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al obtener contribuyentes:', error);
      
      // Manejo específico de errores
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        throw new Error('Sin autorización para acceder a contribuyentes. Por favor, verifique sus permisos.');
      }
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
      
      throw new Error(`Error al obtener contribuyentes: ${error.message}`);
    }
  }
  
  /**
   * Obtiene un contribuyente específico por código
   */
  async obtenerPorCodigo(codigoContribuyente: number, codigoPersona: number = 0): Promise<ContribuyenteData | null> {
    try {
      console.log(`🔍 [ContribuyenteService] Buscando contribuyente: ${codigoContribuyente}`);
      
      const params = new URLSearchParams({
        codigoContribuyente: codigoContribuyente.toString(),
        codigoPersona: codigoPersona.toString()
      });
      
      const response = await apiGet(`${this.API_ENDPOINT}?${params}`, this.getHeaders());
      
      console.log('📥 [ContribuyenteService] Respuesta de búsqueda por código:', response);
      
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          const contribuyente = this.mapearContribuyente(data);
          console.log('✅ [ContribuyenteService] Contribuyente encontrado:', contribuyente.nombre);
          return contribuyente;
        }
      }
      
      console.warn('⚠️ [ContribuyenteService] Contribuyente no encontrado');
      return null;
      
    } catch (error: any) {
      console.error(`❌ [ContribuyenteService] Error al buscar contribuyente ${codigoContribuyente}:`, error);
      throw new Error(`Error al buscar contribuyente: ${error.message}`);
    }
  }
  
  /**
   * Busca contribuyentes por criterios
   */
  async buscar(criterios: Partial<ContribuyenteData>): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando con criterios:', criterios);
      
      const params = new URLSearchParams();
      
      // Mapear criterios a los nombres de parámetros de la API
      if (criterios.codigoContribuyente) {
        params.append('codigoContribuyente', criterios.codigoContribuyente.toString());
      }
      if (criterios.codigoPersona) {
        params.append('codigoPersona', criterios.codigoPersona.toString());
      }
      if (criterios.numeroDocumento) {
        params.append('numeroDocumento', criterios.numeroDocumento);
      }
      if (criterios.nombre) {
        // Para búsqueda por nombre, podríamos necesitar dividirlo
        params.append('nombres', criterios.nombre);
      }
      
      const endpoint = params.toString() ? `${this.API_ENDPOINT}?${params}` : this.API_ENDPOINT;
      const response = await apiGet(endpoint, this.getHeaders());
      
      console.log('📥 [ContribuyenteService] Respuesta de búsqueda:', response);
      
      if (response.success && response.data) {
        const contribuyentes = Array.isArray(response.data) ? response.data : [response.data];
        
        // Mapear los datos al formato esperado
        const contribuyentesMapeados = contribuyentes.map(item => this.mapearContribuyente(item));
        
        console.log(`✅ [ContribuyenteService] ${contribuyentesMapeados.length} contribuyentes encontrados`);
        return contribuyentesMapeados;
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error en búsqueda:', error);
      throw new Error(`Error al buscar contribuyentes: ${error.message}`);
    }
  }
  
  /**
   * Crea un nuevo contribuyente
   */
  async crear(datos: Partial<ContribuyenteData>): Promise<ContribuyenteData> {
    try {
      console.log('➕ [ContribuyenteService] Creando contribuyente:', datos);
      
      const response = await apiPost(this.API_ENDPOINT, datos, this.getHeaders());
      
      if (response.success && response.data) {
        console.log('✅ [ContribuyenteService] Contribuyente creado exitosamente');
        return response.data;
      }
      
      throw new Error(response.message || 'Error al crear contribuyente');
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al crear contribuyente:', error);
      throw new Error(`Error al crear contribuyente: ${error.message}`);
    }
  }
  
  /**
   * Actualiza un contribuyente existente
   */
  async actualizar(codigo: number, datos: Partial<ContribuyenteData>): Promise<ContribuyenteData> {
    try {
      console.log(`📝 [ContribuyenteService] Actualizando contribuyente ${codigo}:`, datos);
      
      const response = await apiPost(`${this.API_ENDPOINT}/${codigo}`, datos, this.getHeaders());
      
      if (response.success && response.data) {
        console.log('✅ [ContribuyenteService] Contribuyente actualizado exitosamente');
        return response.data;
      }
      
      throw new Error(response.message || 'Error al actualizar contribuyente');
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al actualizar contribuyente:', error);
      throw new Error(`Error al actualizar contribuyente: ${error.message}`);
    }
  }
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();