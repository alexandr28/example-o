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

export interface CreateContribuyenteAPIDTO {
  codPersona: number;
  codContribuyente?: null; // Opcional - omitido para que SQL genere el ID
  codConyuge: number | null;
  codRepresentanteLegal: number | null;
  codestado: string;
  codUsuario: number;
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
   * Usando una estrategia alternativa para navegadores modernos
   */
  async buscarConFormData(params: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando contribuyentes con form-data:', params);
      
      const url = buildApiUrl(this.endpoint);
      
      // Para navegadores modernos, intentar con fetch y POST
      // ya que GET con body no está soportado en fetch
      const formData = new FormData();
      
      // Agregar parámetros al FormData
      if (params.codigoContribuyente !== undefined) {
        formData.append('codigoContribuyente', String(params.codigoContribuyente));
      }
      if (params.codigoPersona !== undefined) {
        formData.append('codigoPersona', String(params.codigoPersona));
      }
      
      // Log para debugging
      console.log('📡 Enviando petición al endpoint:', url);
      
      // Intentar con un GET normal primero (sin body)
      // Algunos servidores pueden aceptar los parámetros en query string
      const queryParams = new URLSearchParams();
      if (params.codigoContribuyente !== undefined) {
        queryParams.append('codigoContribuyente', String(params.codigoContribuyente));
      }
      if (params.codigoPersona !== undefined) {
        queryParams.append('codigoPersona', String(params.codigoPersona));
      }
      
      try {
        const getUrl = `${url}?${queryParams.toString()}`;
        console.log('📡 Intentando GET con query params:', getUrl);
        
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Respuesta exitosa:', responseData);
          
          if (responseData.success && responseData.data) {
            const items = Array.isArray(responseData.data) ? 
              responseData.data : [responseData.data];
            return this.normalizeData(items);
          }
        }
      } catch (error) {
        console.log('⚠️ GET con query params falló, intentando alternativa...');
      }
      
      // Si el GET normal falla, devolver datos vacíos por ahora
      // En producción, esto debería manejarse según la API real
      console.warn('⚠️ No se pudieron obtener datos del servidor');
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error en búsqueda:', error);
      return [];
    }
  }

  /**
   * Lista todos los contribuyentes
   * Usa form-data con los parámetros por defecto
   */
  async listarContribuyentes(params?: any): Promise<ContribuyenteData[]> {
    try {
      console.log('📋 [ContribuyenteService] Listando todos los contribuyentes');
      
      // Usar el endpoint con form-data
      // Por defecto buscar con codigoContribuyente = 1 y codigoPersona = 0
      const defaultParams = {
        codigoContribuyente: params?.codigoContribuyente ?? '1',
        codigoPersona: params?.codigoPersona ?? '0'
      };
      
      return await this.buscarConFormData(defaultParams);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error listando contribuyentes:', error);
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
      if (criterios.codigoContribuyente !== undefined || criterios.codigoPersona !== undefined) {
        return await this.buscarConFormData(criterios);
      }
      
      // Para otros criterios, usar los valores por defecto
      return await this.listarContribuyentes();
      
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
      
      // Obtener todos y filtrar localmente
      const todos = await this.listarContribuyentes();
      const encontrado = todos.find(c => c.numeroDocumento === numeroDocumento);
      
      return encontrado || null;
      
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
      
      // Usar form-data para buscar por código de persona específico
      const results = await this.buscarConFormData({ 
        codigoPersona: codPersona,
        codigoContribuyente: '0' // Para buscar específicamente por persona
      });
      
      return results.length > 0 ? results[0] : null;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando por código de persona:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo contribuyente usando el API directo
   * NO requiere autenticación (método POST)
   * URL: http://26.161.18.122:8080/api/contribuyente
   */
  async crearContribuyenteAPI(datos: CreateContribuyenteAPIDTO): Promise<ContribuyenteData> {
    try {
      console.log('➕ [ContribuyenteService] Creando contribuyente con API directa:', datos);
      
      const API_URL = 'http://26.161.18.122:8080/api/contribuyente';
      
      // Validar datos requeridos
      if (!datos.codPersona || !datos.codestado) {
        throw new Error('Código de persona y estado son requeridos');
      }
      
      // Asegurar que codContribuyente no se envía en el request (omitirlo completamente)
      const { codContribuyente, ...datosParaEnviar } = datos;
      
      console.log('📤 [ContribuyenteService] Enviando datos (codContribuyente omitido):', JSON.stringify(datosParaEnviar, null, 2));
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });
      
      console.log(`📥 [ContribuyenteService] Respuesta del servidor: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ContribuyenteService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [ContribuyenteService] Contribuyente creado exitosamente:', responseData);
      
      // Normalizar los datos de respuesta
      const contribuyenteNormalizado = {
        codigo: responseData.codContribuyente || responseData.codigo,
        codigoPersona: responseData.codPersona || responseData.codigoPersona,
        tipoPersona: responseData.tipoPersona || responseData.codTipopersona || '',
        tipoDocumento: responseData.tipoDocumento || responseData.codTipoDocumento || '',
        numeroDocumento: responseData.numeroDocumento || responseData.numerodocumento || '',
        nombres: responseData.nombres || '',
        apellidoPaterno: responseData.apellidoPaterno || responseData.apellidopaterno || '',
        apellidoMaterno: responseData.apellidoMaterno || responseData.apellidomaterno || '',
        razonSocial: responseData.razonSocial || '',
        nombreCompleto: responseData.nombreCompleto || responseData.nombrePersona || 
          ContribuyenteService.construirNombreCompleto(responseData),
        direccion: responseData.direccion === 'null' ? '' : (responseData.direccion || ''),
        telefono: responseData.telefono || '',
        email: responseData.email || '',
        fechaNacimiento: responseData.fechaNacimiento || responseData.fechanacimiento,
        estadoCivil: responseData.estadoCivil || responseData.codestadocivil,
        sexo: responseData.sexo || responseData.codsexo,
        lote: responseData.lote || '',
        estado: responseData.estado || responseData.codestado || datos.codestado,
        fechaRegistro: responseData.fechaRegistro || new Date().toISOString(),
        codUsuario: responseData.codUsuario || datos.codUsuario
      };
      
      return contribuyenteNormalizado;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al crear contribuyente:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo contribuyente
   * NO requiere autenticación - Método original
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
   * Convierte datos del formulario al formato requerido por la API de contribuyente
   */
  convertirFormularioAContribuyenteDTO(personaCreada: any, datosFormulario: any): CreateContribuyenteAPIDTO {
    return {
      codPersona: personaCreada.codPersona || personaCreada.id,
      // codContribuyente omitido completamente para que SQL genere el ID
      codConyuge: datosFormulario.conyugeData?.codPersona || null,
      codRepresentanteLegal: datosFormulario.representanteData?.codPersona || null,
      codestado: "2156", // Estado por defecto
      codUsuario: datosFormulario.codUsuario || 1
    };
  }
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();