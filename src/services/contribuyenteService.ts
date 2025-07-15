// src/services/contribuyenteService.ts - ACTUALIZADO CON SOPORTE FORM-DATA
import BaseApiService from './BaseApiService';
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';
import { personaService } from './personaService';

/**
 * Interfaces para Contribuyente
 */
export interface ContribuyenteData {
  codigo: number;
  codigoPersona: number;
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
  nombreCompleto: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: number;
  estadoCivil?: string;
  sexo?: string;
  lote?: string;
  estado?: string;
  fechaRegistro?: string;
  codUsuario?: number;
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
}

export interface CreateContribuyenteDTO {
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: string;
  estadoCivil?: string;
  sexo?: string;
  lote?: string;
  codUsuario?: number;
  // Datos del cónyuge
  conyugeNombres?: string;
  conyugeApellidoPaterno?: string;
  conyugeApellidoMaterno?: string;
  conyugeNumeroDocumento?: string;
  conyugeTipoDocumento?: string;
  // Datos del representante legal
  repreNombres?: string;
  repreApellidoPaterno?: string;
  repreApellidoMaterno?: string;
  repreNumeroDocumento?: string;
  repreTipoDocumento?: string;
}

export interface UpdateContribuyenteDTO extends Partial<CreateContribuyenteDTO> {
  codigo?: number;
}

export interface BusquedaContribuyenteParams {
  tipoPersona?: string;
  numeroDocumento?: string;
  nombre?: string;
  parametroBusqueda?: string;
  estado?: string;
  codUsuario?: number;
  // Parámetros específicos para form-data
  codigoContribuyente?: string | number;
  codigoPersona?: string | number;
}

/**
 * Servicio unificado para gestión de contribuyentes
 * 
 * IMPORTANTE: Este servicio NO requiere autenticación Bearer Token
 * Todos los métodos (GET, POST, PUT, DELETE) funcionan sin token
 */
class ContribuyenteService extends BaseApiService<ContribuyenteData, CreateContribuyenteDTO, UpdateContribuyenteDTO> {
  private static instance: ContribuyenteService;
  
  public static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  private constructor() {
    super(
      '/api/contribuyente',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codContribuyente || item.codigo,
          codigoPersona: item.codPersona || item.codigoPersona,
          tipoPersona: item.tipoPersona || item.codTipopersona || '',
          tipoDocumento: item.tipoDocumento || item.codTipoDocumento || '',
          numeroDocumento: item.numeroDocumento || item.numerodocumento || '',
          nombres: item.nombres || '',
          apellidoPaterno: item.apellidoPaterno || item.apellidopaterno || '',
          apellidoMaterno: item.apellidoMaterno || item.apellidomaterno || '',
          razonSocial: item.razonSocial || '',
          nombreCompleto: item.nombreCompleto || item.nombrePersona || 
            ContribuyenteService.construirNombreCompleto(item),
          direccion: item.direccion === 'null' ? '' : (item.direccion || ''),
          telefono: item.telefono || '',
          email: item.email || '',
          fechaNacimiento: item.fechaNacimiento || item.fechanacimiento,
          estadoCivil: item.estadoCivil || item.codestadocivil,
          sexo: item.sexo || item.codsexo,
          lote: item.lote || '',
          estado: item.estado || item.codestado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario,
          // Mapear datos del cónyuge si existen
          conyuge: item.conyugeNombres ? {
            nombres: item.conyugeNombres,
            apellidoPaterno: item.conyugeApellidopaterno || '',
            apellidoMaterno: item.conyugeApellidomaterno || '',
            numeroDocumento: item.conyugeNumeroDocumento || '',
            tipoDocumento: item.conyugeTipoDocumento || ''
          } : undefined,
          // Mapear datos del representante legal si existen
          representanteLegal: item.repreNombres ? {
            nombres: item.repreNombres,
            apellidoPaterno: item.repreApellidopaterno || '',
            apellidoMaterno: item.repreApellidomaterno || '',
            numeroDocumento: item.repreNumeroDocumento || '',
            tipoDocumento: item.repreTipoDocumento || ''
          } : undefined
        }),
        
        validateItem: (item: ContribuyenteData) => {
          return !!(item.numeroDocumento && (item.codigo || item.codigoPersona));
        }
      },
      'contribuyente'
    );
  }
  
  /**
   * Sobrescribe el método search del BaseApiService para usar la estrategia correcta
   */
  async search(params: Record<string, any>): Promise<ContribuyenteData[]> {
    // Usar el método que maneja form-data
    return await this.buscarConFormData(params as BusquedaContribuyenteParams);
  }
  
  /**
   * Construye el nombre completo según el tipo de persona
   */
  private static construirNombreCompleto(item: any): string {
    // Si es persona jurídica (0302) y tiene razón social
    if ((item.tipoPersona === '0302' || item.codTipopersona === '0302') 
        && item.razonSocial) {
      return item.razonSocial;
    }
    
    // Para persona natural
    const partes = [
      item.apellidoPaterno || item.apellidopaterno,
      item.apellidoMaterno || item.apellidomaterno,
      item.nombres
    ].filter(Boolean);
    
    return partes.join(' ').trim() || 'Sin nombre';
  }

  /**
   * Método especial para manejar las peticiones del API que espera form-data
   * Como los navegadores no permiten GET con body, usamos varias estrategias
   */
  async buscarConFormData(params: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando contribuyentes:', params);
      
      // Construir URL base
      const url = buildApiUrl(this.endpoint);
      
      // Estrategia 1: Intentar con query parameters (más estándar)
      const queryParams = new URLSearchParams();
      
      if (params.codigoContribuyente !== undefined) {
        queryParams.append('codigoContribuyente', String(params.codigoContribuyente));
      }
      if (params.codigoPersona !== undefined) {
        queryParams.append('codigoPersona', String(params.codigoPersona));
      }
      
      console.log('📡 Intentando con query params:', queryParams.toString());
      
      try {
        const response = await fetch(`${url}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Respuesta exitosa con query params:', responseData);
          
          if (responseData.success && responseData.data) {
            const items = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
            return this.normalizeData(items);
          }
        }
      } catch (error) {
        console.log('⚠️ Query params falló, intentando siguiente estrategia...');
      }
      
      // Estrategia 2: Si el servidor realmente necesita form-data, intentar con POST
      const formData = new FormData();
      if (params.codigoContribuyente !== undefined) {
        formData.append('codigoContribuyente', String(params.codigoContribuyente));
      }
      if (params.codigoPersona !== undefined) {
        formData.append('codigoPersona', String(params.codigoPersona));
      }
      
      console.log('📡 Intentando con POST y form-data...');
      
      const postResponse = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (postResponse.ok) {
        const responseData = await postResponse.json();
        console.log('✅ Respuesta exitosa con POST:', responseData);
        
        if (responseData.success && responseData.data) {
          const items = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
          return this.normalizeData(items);
        }
      }
      
      // Si ambas estrategias fallan, retornar array vacío
      console.warn('⚠️ Todas las estrategias fallaron');
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error en búsqueda:', error);
      return [];
    }
  }

  /**
   * Lista todos los contribuyentes
   * Primero intenta con el endpoint de personas que es el que realmente funciona
   */
  async listarContribuyentes(params?: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Listando contribuyentes:', params);
      
      // Si hay parámetros de búsqueda, usar el endpoint de personas
      if (params?.busqueda || params?.tipoContribuyente || params?.parametroBusqueda) {
        return await this.buscarPersonasPorTipoYNombre({
          codTipoPersona: params.tipoContribuyente || '0301',
          parametroBusqueda: params.busqueda || params.parametroBusqueda || 'a'
        });
      }
      
      // Si no hay parámetros, buscar todos con 'a'
      return await this.buscarPersonasPorTipoYNombre({
        codTipoPersona: '0301',
        parametroBusqueda: 'a'
      });
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error listando contribuyentes:', error);
      throw error;
    }
  }

  /**
   * Busca personas usando el endpoint que realmente funciona
   * GET /api/persona/listarPersonaPorTipoPersonaNombreRazon
   */
  private async buscarPersonasPorTipoYNombre(params: {
    codTipoPersona: string;
    parametroBusqueda: string;
  }): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando personas:', params);
      
      // Construir URL base
      const url = buildApiUrl('/api/persona/listarPersonaPorTipoPersonaNombreRazon');
      
      // Crear FormData
      const formData = new FormData();
      formData.append('codTipoPersona', params.codTipoPersona);
      formData.append('parametroBusqueda', params.parametroBusqueda);
      
      // Como es GET con form-data, intentar con query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('codTipoPersona', params.codTipoPersona);
      queryParams.append('parametroBusqueda', params.parametroBusqueda);
      
      console.log('📡 Intentando con query params:', queryParams.toString());
      
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('📡 Respuesta recibida:', responseData);
      
      // Manejar la estructura de respuesta
      if (responseData.success && responseData.data) {
        const items = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        
        // Convertir formato de persona a contribuyente
        return items.map(persona => this.convertirPersonaAContribuyente(persona));
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error en búsqueda de personas:', error);
      return [];
    }
  }
  
  /**
   * Busca contribuyentes por diferentes criterios
   * NO requiere autenticación (método GET)
   */
  async buscarContribuyentes(criterios: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando contribuyentes:', criterios);
      
      // Si tiene parámetros específicos que requieren form-data
      if (criterios.codigoContribuyente || criterios.codigoPersona) {
        return await this.buscarConFormData(criterios);
      }
      
      // Para otros criterios, usar búsqueda estándar
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando contribuyentes:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un contribuyente por número de documento
   * NO requiere autenticación (método GET)
   */
  async obtenerPorDocumento(numeroDocumento: string): Promise<ContribuyenteData | null> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando por documento:', numeroDocumento);
      
      const results = await this.search({ 
        numeroDocumento,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      return results.length > 0 ? results[0] : null;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando por documento:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un contribuyente por código de persona
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigoPersona(codPersona: number): Promise<ContribuyenteData | null> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando por código de persona:', codPersona);
      
      // Usar form-data para buscar por código de persona
      const results = await this.buscarConFormData({ codigoPersona: codPersona });
      
      return results.length > 0 ? results[0] : null;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando por código de persona:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo contribuyente
   * NO requiere autenticación
   */
  async crearContribuyente(datos: CreateContribuyenteDTO): Promise<ContribuyenteData> {
    try {
      console.log('➕ [ContribuyenteService] Creando contribuyente:', datos);
      
      return await this.create(datos);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error creando contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un contribuyente existente
   * NO requiere autenticación
   */
  async actualizarContribuyente(id: number, datos: UpdateContribuyenteDTO): Promise<ContribuyenteData> {
    try {
      console.log('📝 [ContribuyenteService] Actualizando contribuyente:', id, datos);
      
      return await this.update(id, datos);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error actualizando contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un contribuyente
   * NO requiere autenticación
   */
  async eliminarContribuyente(id: number): Promise<void> {
    try {
      console.log('🗑️ [ContribuyenteService] Eliminando contribuyente:', id);
      
      await this.delete(id);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error eliminando contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Convierte un objeto persona a formato contribuyente
   */
  private convertirPersonaAContribuyente(persona: any): ContribuyenteData {
    return this.normalizeOptions.normalizeItem(persona, 0);
  }
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();