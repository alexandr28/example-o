// src/services/contribuyenteService.ts
import { BaseApiService } from './BaseApiService';
import { NotificationService } from '../components/utils/Notification';

// Interfaces actualizadas según la estructura de la API
export interface Contribuyente {
  // IDs principales
  codPersona: number;
  codContribuyente: number;
  
  // Datos personales
  codTipoContribuyente: string | null;
  codTipopersona: string;
  codTipoDocumento: string;
  numerodocumento: string;
  nombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  direccion: string;
  fechanacimiento: number; // timestamp
  codestadocivil: string;
  codsexo: string;
  telefono: string;
  lote: string | null;
  otros: string | null;
  codestado: string | null;
  codDireccion: number | null;
  
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
  conyugeDireccion: string | null;
  conyugeCoddireccion: number | null;
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
  repreDireccion: string | null;
  repreCoddireccion: number | null;
  repreLote: string | null;
  repreOtros: string | null;
}

// Interfaz simplificada para mostrar en listas
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

// Datos para crear/actualizar contribuyente
export interface ContribuyenteFormData {
  // Datos principales
  codTipoContribuyente?: string;
  codTipopersona: string;
  codTipoDocumento: string;
  numerodocumento: string;
  nombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  direccion?: string;
  fechanacimiento?: Date | string;
  codestadocivil?: string;
  codsexo?: string;
  telefono?: string;
  codDireccion?: number;
  
  // Datos del cónyuge (opcional)
  conyuge?: {
    tipoDocumento?: string;
    numeroDocumento?: string;
    nombres?: string;
    apellidopaterno?: string;
    apellidomaterno?: string;
    telefono?: string;
    direccion?: string;
    codDireccion?: number;
  };
  
  // Datos del representante (opcional)
  representante?: {
    tipoDocumento?: string;
    numeroDocumento?: string;
    nombres?: string;
    apellidopaterno?: string;
    apellidomaterno?: string;
    telefono?: string;
    direccion?: string;
    codDireccion?: number;
  };
}

// Mapeo de códigos a descripciones
const TIPO_DOCUMENTO_MAP: { [key: string]: string } = {
  '4101': 'DNI',
  '4102': 'RUC',
  '4103': 'PASAPORTE',
  '4104': 'CARNET EXT.'
};

const TIPO_PERSONA_MAP: { [key: string]: string } = {
  '0301': 'NATURAL',
  '0302': 'JURIDICA'
};

const ESTADO_CIVIL_MAP: { [key: string]: string } = {
  '0801': 'SOLTERO(A)',
  '0802': 'CASADO(A)',
  '0803': 'DIVORCIADO(A)',
  '0804': 'VIUDO(A)',
  '0805': 'CONVIVIENTE'
};

const SEXO_MAP: { [key: string]: string } = {
  '0701': 'MASCULINO',
  '0702': 'FEMENINO'
};

/**
 * Configuración de normalización para contribuyentes
 */
const contribuyenteNormalizeOptions = {
  normalizeItem: (item: any): Contribuyente => {
    // Retornar el objeto tal como viene de la API
    return {
      codPersona: item.codPersona || 0,
      codContribuyente: item.codContribuyente || 0,
      codTipoContribuyente: item.codTipoContribuyente,
      codTipopersona: item.codTipopersona || '',
      codTipoDocumento: item.codTipoDocumento || '',
      numerodocumento: item.numerodocumento || '',
      nombres: item.nombres || '',
      apellidopaterno: item.apellidopaterno || '',
      apellidomaterno: item.apellidomaterno || '',
      direccion: item.direccion || '',
      fechanacimiento: item.fechanacimiento || 0,
      codestadocivil: item.codestadocivil || '',
      codsexo: item.codsexo || '',
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
  
  constructor() {
    // En desarrollo, usar la URL completa
    const baseURL = import.meta.env.DEV 
      ? (import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080')
      : '';
      
    super(
      baseURL,
      '/api/contribuyente',
      contribuyenteNormalizeOptions,
      'contribuyentes_cache'
    );
  }

  public static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  /**
   * Override del método getAll para manejar la estructura de respuesta de la API
   */
  async getAll(): Promise<Contribuyente[]> {
    try {
      console.log('📡 [ContribuyenteService] GET - Obteniendo todos los contribuyentes');
      
      // Primero intentar sin autenticación
      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Si falla, intentar con el método del padre que incluye autenticación
        console.log('⚠️ [ContribuyenteService] Intentando con autenticación...');
        return await super.getAll();
      }
      
      const result = await response.json();
      
      // La API devuelve { success, message, data: [...] }
      if (result.success && Array.isArray(result.data)) {
        const normalized = result.data.map((item: any, index: number) => 
          this.normalizeOptions.normalizeItem(item, index)
        );
        
        console.log(`✅ [ContribuyenteService] ${normalized.length} contribuyentes obtenidos`);
        
        // Guardar en caché si hay resultados
        if (normalized.length > 0) {
          this.saveToCache(normalized);
        }
        
        return normalized;
      }
      
      console.warn('⚠️ [ContribuyenteService] Respuesta inesperada:', result);
      return [];
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al obtener contribuyentes:', error);
      
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
   * Convierte un contribuyente completo a un item de lista simplificado
   */
  private toListItem(contribuyente: Contribuyente): ContribuyenteListItem {
    const nombreCompleto = `${contribuyente.apellidopaterno} ${contribuyente.apellidomaterno} ${contribuyente.nombres}`.trim();
    
    return {
      id: contribuyente.codContribuyente,
      codigo: `CONT-${String(contribuyente.codContribuyente).padStart(6, '0')}`,
      tipoDocumento: TIPO_DOCUMENTO_MAP[contribuyente.codTipoDocumento] || contribuyente.codTipoDocumento,
      numeroDocumento: contribuyente.numerodocumento,
      nombreCompleto: nombreCompleto,
      direccion: contribuyente.direccion || 'Sin dirección',
      telefono: contribuyente.telefono || '-',
      estado: contribuyente.codestado || 'ACTIVO',
      tieneConyugue: !!contribuyente.codConyuge,
      tieneRepresentante: !!contribuyente.codRepresentanteLegal
    };
  }
  
  /**
   * Obtiene todos los contribuyentes como items de lista
   */
  async getAllAsListItems(): Promise<ContribuyenteListItem[]> {
    try {
      console.log('📡 [ContribuyenteService] Obteniendo lista de contribuyentes...');
      
      // Hacer la petición directamente sin autenticación para GET
      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 [ContribuyenteService] Respuesta recibida:', result);
      
      // La API devuelve { success, message, data: [...] }
      if (result.success && Array.isArray(result.data)) {
        const contribuyentes = result.data.map((item: any) => this.normalizeOptions.normalizeItem(item));
        return contribuyentes.map(c => this.toListItem(c));
      }
      
      return [];
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al obtener contribuyentes:', error);
      
      // Si es error 403, es probable que requiera autenticación
      if (error instanceof Error && error.message.includes('403')) {
        console.warn('⚠️ [ContribuyenteService] El endpoint requiere autenticación');
        // Intentar con el método padre que incluye autenticación
        try {
          const contribuyentes = await super.getAll();
          return contribuyentes.map(c => this.toListItem(c));
        } catch (authError) {
          console.error('❌ [ContribuyenteService] Error con autenticación:', authError);
          NotificationService.error('No tiene permisos para ver contribuyentes');
          return [];
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Busca contribuyente por número de documento
   */
  async buscarPorDocumento(numeroDoc: string): Promise<Contribuyente | null> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando por documento:', numeroDoc);
      
      const todos = await this.getAll();
      const encontrado = todos.find(c => c.numerodocumento === numeroDoc);
      
      if (encontrado) {
        console.log('✅ [ContribuyenteService] Contribuyente encontrado');
        return encontrado;
      }
      
      console.log('ℹ️ [ContribuyenteService] Contribuyente no encontrado');
      return null;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al buscar por documento:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo contribuyente
   */
  async create(data: ContribuyenteFormData): Promise<Contribuyente> {
    try {
      console.log('📤 [ContribuyenteService] Creando contribuyente:', data);
      
      // Preparar datos para la API
      const apiData: any = {
        codTipopersona: data.codTipopersona,
        codTipoDocumento: data.codTipoDocumento,
        numerodocumento: data.numerodocumento,
        nombres: data.nombres,
        apellidopaterno: data.apellidopaterno,
        apellidomaterno: data.apellidomaterno,
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        codestadocivil: data.codestadocivil,
        codsexo: data.codsexo,
        codDireccion: data.codDireccion
      };
      
      // Convertir fecha si existe
      if (data.fechanacimiento) {
        const fecha = new Date(data.fechanacimiento);
        apiData.fechanacimiento = fecha.getTime();
      }
      
      // Agregar datos del cónyuge si existen
      if (data.conyuge && data.conyuge.numeroDocumento) {
        apiData.conyugeTipoDocumento = data.conyuge.tipoDocumento;
        apiData.conyugeNumeroDocumento = data.conyuge.numeroDocumento;
        apiData.conyugeNombres = data.conyuge.nombres;
        apiData.conyugeApellidopaterno = data.conyuge.apellidopaterno;
        apiData.conyugeApellidomaterno = data.conyuge.apellidomaterno;
        apiData.conyugeTelefono = data.conyuge.telefono;
        apiData.conyugeDireccion = data.conyuge.direccion;
        apiData.conyugeCoddireccion = data.conyuge.codDireccion;
      }
      
      // Agregar datos del representante si existen
      if (data.representante && data.representante.numeroDocumento) {
        apiData.repreTipoDocumento = data.representante.tipoDocumento;
        apiData.repreNumeroDocumento = data.representante.numeroDocumento;
        apiData.repreNombres = data.representante.nombres;
        apiData.repreApellidopaterno = data.representante.apellidopaterno;
        apiData.repreApellidomaterno = data.representante.apellidomaterno;
        apiData.repreTelefono = data.representante.telefono;
        apiData.repreDireccion = data.representante.direccion;
        apiData.repreCoddireccion = data.representante.codDireccion;
      }
      
      return await super.create(apiData);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al crear:', error);
      
      if (error.message?.includes('ya existe')) {
        NotificationService.error('Ya existe un contribuyente con ese número de documento');
      } else {
        NotificationService.error(error.message || 'Error al crear contribuyente');
      }
      
      throw error;
    }
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
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();

// Exportar mapeos para uso en componentes
export { TIPO_DOCUMENTO_MAP, TIPO_PERSONA_MAP, ESTADO_CIVIL_MAP, SEXO_MAP };