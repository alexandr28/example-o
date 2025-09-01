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

export interface ContribuyenteDetalle {
  codPersona: number;
  codTipoContribuyente: string | null;
  codTipopersona: string;
  codTipoDocumento: string;
  numerodocumento: string;
  nombres: string;
  apellidomaterno: string;
  apellidopaterno: string;
  direccion: string;
  fechanacimiento: number;
  codestadocivil: string;
  codsexo: string;
  telefono: string;
  lote: string | null;
  otros: string | null;
  codestado: string | null;
  codDireccion: string | null;
  codContribuyente: number;
  // Datos del cónyuge
  codConyuge: number | null;
  conyugeTipoDocumento: string | null;
  conyugeNumeroDocumento: string | null;
  conyugeNombres: string | null;
  conyugeApellidopaterno: string | null;
  conyugeApellidomaterno: string | null;
  conyugeEstadocivil: string | null;
  conyugeSexo: string | null;
  conyugeTelefono: string | null;
  conyugeFechanacimiento: number | null;
  conyugeFechanacimientoStr: string | null;
  conyugeDireccion: string | null;
  conyugeCoddireccion: string | null;
  conyugeLote: string | null;
  conyugeOtros: string | null;
  // Datos del representante legal
  codRepresentanteLegal: number | null;
  repreTipoDocumento: string | null;
  repreNumeroDocumento: string | null;
  repreNombres: string | null;
  repreApellidopaterno: string | null;
  repreApellidomaterno: string | null;
  repreEstadocivil: string | null;
  repreSexo: string | null;
  repreTelefono: string | null;
  repreFechanacimiento: number | null;
  repreFechanacimientoStr: string | null;
  repreDireccion: string | null;
  repreCoddireccion: string | null;
  repreLote: string | null;
  repreOtros: string | null;
  // Fecha formateada
  fechaNacimientoStr: string;
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
   * Busca contribuyentes usando la nueva API general
   * GET http://26.161.18.122:8080/api/contribuyente/general?parametroBusqueda=&codUsuario=1
   * NO requiere autenticación
   */
  async buscarContribuyentes(criterios: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando contribuyentes con API general:', criterios);
      
      const url = buildApiUrl('/api/contribuyente/general');
      
      // Construir query params
      const queryParams = new URLSearchParams();
      queryParams.append('parametroBusqueda', criterios.parametroBusqueda || '');
      queryParams.append('codUsuario', String(criterios.codUsuario || 1));
      
      const getUrl = `${url}?${queryParams.toString()}`;
      console.log('📡 [ContribuyenteService] GET URL general:', getUrl);
      
      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📥 [ContribuyenteService] Respuesta API general: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ContribuyenteService] Error del servidor:', errorText);
        
        // Si hay error, devolver datos de fallback para desarrollo
        console.log('⚠️ [ContribuyenteService] Usando datos de fallback');
        return this.getDatosFallback();
      }
      
      const responseData = await response.json();
      console.log('✅ [ContribuyenteService] Datos obtenidos de API general:', responseData);
      console.log('🔍 [ContribuyenteService] Tipo de respuesta:', typeof responseData);
      console.log('🔍 [ContribuyenteService] Keys de la respuesta:', Object.keys(responseData));
      
      // Procesar respuesta - puede ser un array directo o wrapped en data
      let items = [];
      
      if (Array.isArray(responseData)) {
        console.log('📦 [ContribuyenteService] Respuesta es array directo');
        items = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        console.log('📦 [ContribuyenteService] Respuesta wrapped en data');
        items = responseData.data;
      } else if (responseData.success && responseData.data) {
        console.log('📦 [ContribuyenteService] Respuesta con success wrapper');
        items = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      } else {
        console.log('📦 [ContribuyenteService] Respuesta de formato no reconocido, tratando como array');
        items = [responseData];
      }
      
      console.log(`📋 [ContribuyenteService] Procesando ${items.length} items`);
      
      // Normalizar datos usando el método interno
      const contribuyentesNormalizados = this.normalizeData(items);
      
      console.log(`✅ [ContribuyenteService] ${contribuyentesNormalizados.length} contribuyentes procesados`);
      return contribuyentesNormalizados;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error en API general:', error);
      
      // En caso de error, devolver datos de fallback
      console.log('⚠️ [ContribuyenteService] Usando datos de fallback por error');
      return this.getDatosFallback();
    }
  }

  /**
   * Obtiene todos los contribuyentes usando la nueva API general
   * Para obtener todos, usa parametroBusqueda vacío
   */
  async obtenerTodosContribuyentes(): Promise<ContribuyenteData[]> {
    console.log('📋 [ContribuyenteService] Obteniendo todos los contribuyentes con API general');
    return this.buscarContribuyentes({ parametroBusqueda: '', codUsuario: 1 });
  }

  /**
   * Datos de fallback para desarrollo cuando la API no está disponible
   */
  private getDatosFallback(): ContribuyenteData[] {
    console.log('📋 [ContribuyenteService] Generando datos de fallback');
    
    return [
      {
        codigo: 1,
        codigoPersona: 101,
        tipoPersona: '0301',
        tipoDocumento: '0101',
        numeroDocumento: '12345678',
        nombres: 'Juan Carlos',
        apellidoPaterno: 'García',
        apellidoMaterno: 'López',
        nombreCompleto: 'García López Juan Carlos',
        direccion: 'Av. Principal 123',
        telefono: '987654321',
        email: 'juan.garcia@email.com',
        fechaNacimiento: 19800115,
        estadoCivil: '1201',
        sexo: '1101',
        lote: 'A-01',
        estado: 'ACTIVO',
        fechaRegistro: '2024-01-15',
        codUsuario: 1
      },
      {
        codigo: 2,
        codigoPersona: 102,
        tipoPersona: '0301',
        tipoDocumento: '0101',
        numeroDocumento: '87654321',
        nombres: 'María Elena',
        apellidoPaterno: 'Rodríguez',
        apellidoMaterno: 'Silva',
        nombreCompleto: 'Rodríguez Silva María Elena',
        direccion: 'Jr. Los Olivos 456',
        telefono: '123456789',
        email: 'maria.rodriguez@email.com',
        fechaNacimiento: 19850320,
        estadoCivil: '1201',
        sexo: '1102',
        lote: 'B-02',
        estado: 'ACTIVO',
        fechaRegistro: '2024-02-10',
        codUsuario: 1
      },
      {
        codigo: 3,
        codigoPersona: 103,
        tipoPersona: '0302',
        tipoDocumento: '0103',
        numeroDocumento: '20123456789',
        razonSocial: 'Empresa Comercial SAC',
        nombreCompleto: 'Empresa Comercial SAC',
        direccion: 'Av. Comercial 789',
        telefono: '555123456',
        email: 'contacto@empresacomercial.com',
        lote: 'C-03',
        estado: 'ACTIVO',
        fechaRegistro: '2024-03-05',
        codUsuario: 1
      }
    ];
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
   * Obtiene un contribuyente detallado usando query params
   * GET /api/contribuyente?codigoContribuyente=43905&codigoPersona=0
   * NO requiere autenticación
   */
  async obtenerContribuyenteDetalle(codigoContribuyente: number | string, codigoPersona: number | string = 0): Promise<ContribuyenteDetalle | null> {
    try {
      console.log('🔍 [ContribuyenteService] Obteniendo detalle del contribuyente:', { codigoContribuyente, codigoPersona });
      
      const url = buildApiUrl(this.endpoint);
      
      // Construir query params
      const queryParams = new URLSearchParams();
      queryParams.append('codigoContribuyente', String(codigoContribuyente));
      queryParams.append('codigoPersona', String(codigoPersona));
      
      const getUrl = `${url}?${queryParams.toString()}`;
      console.log('📡 [ContribuyenteService] GET URL:', getUrl);
      
      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📥 [ContribuyenteService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ContribuyenteService] Error del servidor:', errorText);
        
        if (response.status === 404) {
          console.log('⚠️ [ContribuyenteService] Contribuyente no encontrado');
          return null;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [ContribuyenteService] Detalle obtenido:', responseData);
      console.log('🔍 [ContribuyenteService] Tipo de respuesta:', typeof responseData);
      console.log('🔍 [ContribuyenteService] Keys de la respuesta:', Object.keys(responseData));
      
      // El API puede devolver un objeto directo o wrapped en una estructura
      if (responseData.data) {
        console.log('📦 [ContribuyenteService] Usando responseData.data');
        return responseData.data;
      } else if (responseData.codPersona || responseData.codContribuyente) {
        console.log('📦 [ContribuyenteService] Usando responseData directo');
        return responseData;
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        console.log('📦 [ContribuyenteService] Usando primer elemento del array');
        return responseData[0];
      } else {
        console.warn('⚠️ [ContribuyenteService] Formato de respuesta inesperado:', responseData);
        return null;
      }
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error obteniendo detalle del contribuyente:', error);
      throw error;
    }
  }

  /**
   * Normaliza los datos del detalle del contribuyente al formato interno
   */
  private normalizarDetalleContribuyente(detalle: ContribuyenteDetalle): ContribuyenteData {
    return {
      codigo: detalle.codContribuyente,
      codigoPersona: detalle.codPersona,
      tipoPersona: detalle.codTipopersona,
      tipoDocumento: detalle.codTipoDocumento,
      numeroDocumento: detalle.numerodocumento,
      nombres: detalle.nombres,
      apellidoPaterno: detalle.apellidopaterno,
      apellidoMaterno: detalle.apellidomaterno,
      razonSocial: '', // No presente en el detalle
      nombreCompleto: `${detalle.apellidopaterno} ${detalle.apellidomaterno} ${detalle.nombres}`.trim(),
      direccion: detalle.direccion,
      telefono: detalle.telefono,
      email: '', // No presente en el detalle
      fechaNacimiento: detalle.fechanacimiento,
      estadoCivil: detalle.codestadocivil,
      sexo: detalle.codsexo,
      lote: detalle.lote || '',
      estado: detalle.codestado || 'ACTIVO',
      fechaRegistro: detalle.fechaNacimientoStr,
      codUsuario: 1, // No presente en el detalle
      // Mapear datos del cónyuge si existen
      conyuge: detalle.conyugeNombres ? {
        nombres: detalle.conyugeNombres,
        apellidoPaterno: detalle.conyugeApellidopaterno || '',
        apellidoMaterno: detalle.conyugeApellidomaterno || '',
        numeroDocumento: detalle.conyugeNumeroDocumento || '',
        tipoDocumento: detalle.conyugeTipoDocumento || ''
      } : undefined,
      // Mapear datos del representante legal si existen
      representanteLegal: detalle.repreNombres ? {
        nombres: detalle.repreNombres,
        apellidoPaterno: detalle.repreApellidopaterno || '',
        apellidoMaterno: detalle.repreApellidomaterno || '',
        numeroDocumento: detalle.repreNumeroDocumento || '',
        tipoDocumento: detalle.repreTipoDocumento || ''
      } : undefined
    };
  }
  
  /**
   * Crea un nuevo contribuyente usando el API directo
   * NO requiere autenticación (método POST)
   * URL: http://26.161.18.122:8080/api/contribuyente
   */
  async crearContribuyenteAPI(datos: CreateContribuyenteAPIDTO): Promise<ContribuyenteData> {
    try {
      console.log('➕ [ContribuyenteService] Creando contribuyente con API directa:', datos);
      
      const API_URL = '/api/contribuyente'; // Usar proxy local
      
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