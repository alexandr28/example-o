// src/services/contribuyenteService.ts
import { BaseApiService } from './BaseApiService';
import {  ContribuyenteFormData } from '../schemas/contribuyenteSchemas';
import {Contribuyente} from '../models'
import { NotificationService } from '../components/utils/Notification';


/**
 * Interfaz para item de lista de contribuyente
 */
export interface ContribuyenteListItem {
  id: number;
  codigo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  direccion: string;
  telefono: string;
  estado: string;
  tieneConyugue: boolean;
  tieneRepresentante: boolean;
}

/**
 * Interfaz para parámetros de búsqueda
 */
interface BusquedaContribuyenteParams {
  codigoContribuyente?: number;
  codigoPersona?: number;
  numeroDocumento?: string;
  nombres?: string;
  codUsuario?: number;
}

// Mapeos de códigos a etiquetas
const TIPO_DOCUMENTO_MAP: Record<string, string> = {
  '4101': 'DNI',
  '4102': 'RUC',
  '4103': 'PASAPORTE',
  '4104': 'CARNET EXTRANJERIA',
  '4105': 'OTROS'
};

const TIPO_PERSONA_MAP: Record<string, string> = {
  '0301': 'NATURAL',
  '0302': 'JURIDICA'
};

const ESTADO_CIVIL_MAP: Record<string, string> = {
  '0801': 'SOLTERO(A)',
  '0802': 'CASADO(A)',
  '0803': 'VIUDO(A)',
  '0804': 'DIVORCIADO(A)',
  '0805': 'CONVIVIENTE'
};

const SEXO_MAP: Record<string, string> = {
  '0701': 'MASCULINO',
  '0702': 'FEMENINO'
};

/**
 * Configuración de normalización para contribuyentes
 */
const contribuyenteNormalizeOptions = {
  normalizeItem: (item: any): Contribuyente => {
    return {
      // Datos principales
      codContribuyente: item.codContribuyente || item.id,
      codPersona: item.codPersona,
      codTipoContribuyente: item.codTipoContribuyente,
      codTipopersona: item.codTipopersona,
      codTipoDocumento: item.codTipoDocumento,
      numerodocumento: item.numerodocumento,
      nombres: item.nombres,
      apellidopaterno: item.apellidopaterno,
      apellidomaterno: item.apellidomaterno,
      direccion: item.direccion,
      fechanacimiento: item.fechanacimiento,
      codestadocivil: item.codestadocivil,
      codsexo: item.codsexo,
      telefono: item.telefono || '',
      lote: item.lote,
      otros: item.otros,
      codestado: item.codestado,
      codDireccion: item.codDireccion,
      
      // Cónyuge
      codConyuge: item.codConyuge,
      conyugeTipoDocumento: item.conyugeTipoDocumento,
      conyugeNumeroDocumento: item.conyugeNumeroDocumento,
      conyugeNombres: item.conyugeNombres,
      conyugeApellidopaterno: item.conyugeApellidopaterno,
      conyugeApellidomaterno: item.conyugeApellidomaterno,
      conyugeEstadocivil: item.conyugeEstadocivil,
      conyugeSexo: item.conyugeSexo,
      conyugeTelefono: item.conyugeTelefono,
      conyugeFechanacimiento: item.conyugeFechanacimiento,
      conyugeDireccion: item.conyugeDireccion,
      conyugeCoddireccion: item.conyugeCoddireccion,
      conyugeLote: item.conyugeLote,
      conyugeOtros: item.conyugeOtros,
      
      // Representante
      codRepresentanteLegal: item.codRepresentanteLegal,
      repreTipoDocumento: item.repreTipoDocumento,
      repreNumeroDocumento: item.repreNumeroDocumento,
      repreNombres: item.repreNombres,
      repreApellidopaterno: item.repreApellidopaterno,
      repreApellidomaterno: item.repreApellidomaterno,
      repreEstadocivil: item.repreEstadocivil,
      repreSexo: item.repreSexo,
      repreTelefono: item.repreTelefono,
      repreFechanacimiento: item.repreFechanacimiento,
      repreDireccion: item.repreDireccion,
      repreCoddireccion: item.repreCoddireccion,
      repreLote: item.repreLote,
      repreOtros: item.repreOtros
    };
  }
};

/**
 * Servicio para manejar las operaciones de contribuyentes
 */
export class ContribuyenteService extends BaseApiService<Contribuyente, ContribuyenteFormData> {
  private static instance: ContribuyenteService;
  private cacheKey: string = 'contribuyentes_cache';
  
  constructor() {
    // SIEMPRE usar la URL completa del backend
    const baseURL = 'http://192.168.20.160:8080';
      
    super(
      baseURL,
      '/api/contribuyente',
      contribuyenteNormalizeOptions,
      'contribuyentes_cache'
    );
    
    console.log('🔧 [ContribuyenteService] Inicializado con baseURL:', baseURL);
  }

  public static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  /**
   * Busca contribuyentes con parámetros
   * Usa GET con query parameters como muestra Postman
   */
  async buscarContribuyentes(params: BusquedaContribuyenteParams = {}): Promise<Contribuyente[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando contribuyentes:', params);
      
      // Construir query parameters - SIEMPRE incluir valores por defecto
      const queryParams = new URLSearchParams();
      
      // Siempre enviar estos parámetros como muestra Postman
      queryParams.append('codigoContribuyente', (params.codigoContribuyente || 2).toString());
      queryParams.append('codigoPersona', (params.codigoPersona || 0).toString());
      
      if (params.numeroDocumento) {
        queryParams.append('numeroDocumento', params.numeroDocumento);
      }
      if (params.nombres) {
        queryParams.append('nombres', params.nombres);
      }
      
      // TEMPORAL: Usar siempre la URL completa hasta que se arregle el proxy
      const url = `${this.baseURL}${this.endpoint}?${queryParams.toString()}`;
        
      console.log('📡 [ContribuyenteService] URL de búsqueda:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 [ContribuyenteService] Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 [ContribuyenteService] Datos recibidos:', result);
      
      return this.processResponse(result);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al buscar contribuyentes:', error);
      
      // Intentar devolver del caché
      const cached = this.loadFromCache();
      if (cached && cached.length > 0) {
        console.log(`📦 [ContribuyenteService] Devolviendo ${cached.length} contribuyentes del caché`);
        return cached;
      }
      
      return [];
    }
  }
  
  /**
   * Procesa la respuesta de la API
   */
  private processResponse(result: any): Contribuyente[] {
    // La API devuelve { success, message, data: [...] }
    if (result.success && Array.isArray(result.data)) {
      const normalized = result.data.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [ContribuyenteService] ${normalized.length} contribuyentes encontrados`);
      
      // Guardar en caché si hay resultados
      if (normalized.length > 0) {
        this.saveToCache(normalized);
      }
      
      return normalized;
    }
    
    console.warn('⚠️ [ContribuyenteService] Respuesta inesperada:', result);
    return [];
  }
  
  /**
   * Override del método getAll para usar buscarContribuyentes
   */
  async getAll(): Promise<Contribuyente[]> {
    return this.buscarContribuyentes();
  }
  
  /**
   * Busca contribuyente por código
   */
  async buscarPorCodigo(codigo: number): Promise<Contribuyente | null> {
    try {
      const contribuyentes = await this.buscarContribuyentes({ 
        codigoContribuyente: codigo 
      });
      
      return contribuyentes.length > 0 ? contribuyentes[0] : null;
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al buscar por código:', error);
      return null;
    }
  }
  
  /**
   * Busca contribuyente por número de documento
   */
  async buscarPorDocumento(numeroDoc: string): Promise<Contribuyente | null> {
    try {
      const contribuyentes = await this.buscarContribuyentes({ 
        numeroDocumento: numeroDoc 
      });
      
      return contribuyentes.length > 0 ? contribuyentes[0] : null;
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al buscar por documento:', error);
      return null;
    }
  }
  
  /**
   * Obtiene todos los contribuyentes como items de lista
   */
  async getAllAsListItems(): Promise<ContribuyenteListItem[]> {
    try {
      console.log('📡 [ContribuyenteService] Obteniendo lista de contribuyentes...');
      
      // Llamar directamente a buscarContribuyentes sin parámetros
      const contribuyentes = await this.buscarContribuyentes();
      
      // Convertir a items de lista
      const listItems = contribuyentes.map(c => this.toListItem(c));
      
      console.log(`✅ [ContribuyenteService] ${listItems.length} items de lista generados`);
      return listItems;
      
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al obtener lista:', error);
      
      // Intentar cargar del caché si hay error
      const cached = this.loadFromCache();
      if (cached && cached.length > 0) {
        console.log(`📦 [ContribuyenteService] Usando caché con ${cached.length} items`);
        return cached.map(c => this.toListItem(c));
      }
      
      return [];
    }
  }
  
  /**
   * Convierte un contribuyente completo a un item de lista simplificado
   * Cambiado a public para permitir acceso desde el hook
   */
  public toListItem(contribuyente: Contribuyente): ContribuyenteListItem {
    const nombreCompleto = `${contribuyente.apellidopaterno || ''} ${contribuyente.apellidomaterno || ''} ${contribuyente.nombres || ''}`.trim();
    
    return {
      id: contribuyente.codContribuyente,
      codigo: `CONT-${String(contribuyente.codContribuyente).padStart(6, '0')}`,
      tipoDocumento: TIPO_DOCUMENTO_MAP[contribuyente.codTipoDocumento] || contribuyente.codTipoDocumento || '',
      numeroDocumento: contribuyente.numerodocumento || '',
      nombreCompleto: nombreCompleto || 'Sin nombre',
      direccion: contribuyente.direccion || 'Sin dirección',
      telefono: contribuyente.telefono || '-',
      estado: contribuyente.codestado || 'ACTIVO',
      tieneConyugue: !!contribuyente.codConyuge,
      tieneRepresentante: !!contribuyente.codRepresentanteLegal
    };
  }
  
  /**
   * Crea un nuevo contribuyente
   * Este método requiere autenticación (POST con Bearer Token)
   */
  async create(data: any): Promise<Contribuyente> {
    try {
      console.log('📤 [ContribuyenteService] Creando contribuyente - datos recibidos:', JSON.stringify(data, null, 2));
      
      // Verificar autenticación
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para crear contribuyentes');
        throw new Error('No se encontró token de autenticación');
      }
      
      // VALIDACIÓN CRÍTICA: Verificar que codTipopersona no sea null
      if (!data.codTipopersona) {
        console.error('❌ ERROR CRÍTICO: codTipopersona es null o undefined');
        console.error('Datos recibidos:', data);
        throw new Error('El tipo de persona es obligatorio');
      }
      
      // Preparar datos para la API asegurando que NUNCA haya valores null en campos obligatorios
      const apiData: any = {
        // Campo más importante - DEBE tener valor
        codTipopersona: data.codTipopersona || '0301',
        
        // Otros campos obligatorios
        codTipoDocumento: data.codTipoDocumento || '4101',
        numerodocumento: data.numerodocumento || '',
        nombres: data.nombres || 'SIN NOMBRE',
        apellidopaterno: data.apellidopaterno !== undefined ? data.apellidopaterno : '',
        apellidomaterno: data.apellidomaterno !== undefined ? data.apellidomaterno : '',
        direccion: data.direccion || 'SIN DIRECCION',
        
        // Campos opcionales - solo incluir si tienen valor
        telefono: data.telefono || '',
        lote: data.lote || '',
        otros: data.otros || ''
      };
      
      // Solo agregar estos campos si tienen valor válido
      if (data.codestadocivil) apiData.codestadocivil = data.codestadocivil;
      if (data.codsexo) apiData.codsexo = data.codsexo;
      if (data.codDireccion && data.codDireccion > 0) apiData.codDireccion = data.codDireccion;
      
      // Convertir fecha a timestamp si existe
      if (data.fechanacimiento) {
        if (data.fechanacimiento instanceof Date) {
          apiData.fechanacimiento = data.fechanacimiento.getTime();
        } else if (typeof data.fechanacimiento === 'string') {
          const fecha = new Date(data.fechanacimiento);
          if (!isNaN(fecha.getTime())) {
            apiData.fechanacimiento = fecha.getTime();
          }
        } else if (typeof data.fechanacimiento === 'number') {
          apiData.fechanacimiento = data.fechanacimiento;
        }
      }
      
      // Procesar datos del cónyuge si existen
      if (data.conyuge && typeof data.conyuge === 'object') {
        // Los datos ya vienen estructurados desde el hook
        if (data.conyuge.numeroDocumento) {
          apiData.conyugeTipoDocumento = data.conyuge.tipoDocumento || '4101';
          apiData.conyugeNumeroDocumento = data.conyuge.numeroDocumento;
          apiData.conyugeNombres = data.conyuge.nombres || '';
          apiData.conyugeApellidopaterno = data.conyuge.apellidopaterno || '';
          apiData.conyugeApellidomaterno = data.conyuge.apellidomaterno || '';
          apiData.conyugeTelefono = data.conyuge.telefono || '';
          apiData.conyugeDireccion = data.conyuge.direccion || '';
          
          if (data.conyuge.codDireccion && data.conyuge.codDireccion > 0) {
            apiData.conyugeCoddireccion = data.conyuge.codDireccion;
          }
          
          if (data.conyuge.fechanacimiento) {
            const fechaConyuge = new Date(data.conyuge.fechanacimiento);
            if (!isNaN(fechaConyuge.getTime())) {
              apiData.conyugeFechanacimiento = fechaConyuge.getTime();
            }
          }
        }
      }
      
      // Procesar datos del representante si existen
      if (data.representante && typeof data.representante === 'object') {
        // Los datos ya vienen estructurados desde el hook
        if (data.representante.numeroDocumento) {
          apiData.repreTipoDocumento = data.representante.tipoDocumento || '4101';
          apiData.repreNumeroDocumento = data.representante.numeroDocumento;
          apiData.repreNombres = data.representante.nombres || '';
          apiData.repreApellidopaterno = data.representante.apellidopaterno || '';
          apiData.repreApellidomaterno = data.representante.apellidomaterno || '';
          apiData.repreTelefono = data.representante.telefono || '';
          apiData.repreDireccion = data.representante.direccion || '';
          
          if (data.representante.codDireccion && data.representante.codDireccion > 0) {
            apiData.repreCoddireccion = data.representante.codDireccion;
          }
          
          if (data.representante.fechanacimiento) {
            const fechaRepre = new Date(data.representante.fechanacimiento);
            if (!isNaN(fechaRepre.getTime())) {
              apiData.repreFechanacimiento = fechaRepre.getTime();
            }
          }
        }
      }
      
      // VALIDACIÓN FINAL CRÍTICA
      if (!apiData.codTipopersona) {
        console.error('❌ ERROR CRÍTICO: apiData.codTipopersona es null después del procesamiento');
        console.error('apiData:', apiData);
        throw new Error('Error crítico: No se pudo determinar el tipo de persona');
      }
      
      // URL completa para el POST
      const url = `${this.baseURL}${this.endpoint}`;
      
      console.log('📡 [ContribuyenteService] POST URL:', url);
      console.log('📋 [ContribuyenteService] Datos finales a enviar:', JSON.stringify(apiData, null, 2));
      console.log('🔍 [ContribuyenteService] Verificación final - codTipopersona:', apiData.codTipopersona);
      
      // Hacer la petición POST con Bearer Token
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      console.log('📥 [ContribuyenteService] Respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ContribuyenteService] Error response:', errorText);
        
        // Intentar parsear el mensaje de error
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        if (response.status === 401) {
          NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente');
          // Limpiar token inválido
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          // Redirigir al login
          window.location.href = '/login';
          throw new Error('Sesión expirada');
        } else if (response.status === 400) {
          throw new Error(errorMessage);
        } else if (response.status === 409) {
          throw new Error('Ya existe un contribuyente con ese número de documento');
        } else if (response.status === 500) {
          // Error del servidor - probablemente campo NULL
          if (errorMessage.includes('NULL') || errorMessage.includes('515')) {
            console.error('❌ Error de campo NULL detectado');
            console.error('Datos enviados que causaron el error:', apiData);
            throw new Error('Error: Faltan campos obligatorios. Verifique que todos los campos requeridos estén completos.');
          }
          throw new Error(errorMessage);
        } else {
          throw new Error(errorMessage);
        }
      }
      
      const result = await response.json();
      console.log('✅ [ContribuyenteService] Respuesta exitosa:', result);
      
      // Procesar la respuesta
      if (result.success && result.data) {
        const nuevoContribuyente = this.normalizeOptions.normalizeItem(result.data, 0);
        
        // Limpiar caché para forzar recarga
        this.clearCache();
        
        NotificationService.success('Contribuyente creado exitosamente');
        return nuevoContribuyente;
      } else if (result.data) {
        // A veces la API devuelve los datos directamente sin success
        const nuevoContribuyente = this.normalizeOptions.normalizeItem(result.data || result, 0);
        this.clearCache();
        NotificationService.success('Contribuyente creado exitosamente');
        return nuevoContribuyente;
      } else {
        throw new Error(result.message || 'Error al crear contribuyente');
      }
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al crear:', error);
      console.error('Stack trace:', error.stack);
      NotificationService.error(error.message || 'Error al crear contribuyente');
      throw error;
    }
  }
  
  /**
   * Actualiza un contribuyente (requiere autenticación)
   */
  async update(id: number, data: ContribuyenteFormData): Promise<Contribuyente> {
    const token = this.getAuthToken();
    if (!token) {
      NotificationService.error('Debe iniciar sesión para actualizar contribuyentes');
      throw new Error('No se encontró token de autenticación');
    }
    
    return super.update(id, data);
  }
  
  /**
   * Elimina un contribuyente (requiere autenticación)
   */
  async delete(id: number): Promise<void> {
    const token = this.getAuthToken();
    if (!token) {
      NotificationService.error('Debe iniciar sesión para eliminar contribuyentes');
      throw new Error('No se encontró token de autenticación');
    }
    
    return super.delete(id);
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * Obtiene las opciones para los selects
   */
  static getOptions() {
    return {
      tiposDocumento: Object.entries(TIPO_DOCUMENTO_MAP).map(([value, label]) => ({ value, label })),
      tiposPersona: Object.entries(TIPO_PERSONA_MAP).map(([value, label]) => ({ value, label })),
      estadosCiviles: Object.entries(ESTADO_CIVIL_MAP).map(([value, label]) => ({ value, label })),
      sexos: Object.entries(SEXO_MAP).map(([value, label]) => ({ value, label }))
    };
  }
  
  /**
   * Limpia el caché de contribuyentes
   */
  private clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('🧹 [ContribuyenteService] Caché limpiado');
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();

// Exportar mapeos para uso en componentes
export { TIPO_DOCUMENTO_MAP, TIPO_PERSONA_MAP, ESTADO_CIVIL_MAP, SEXO_MAP };