// src/services/contribuyenteService.ts
import { NotificationService } from '../components/utils/Notification';
import { personaService, PersonaData } from './personaService';

/**
 * Interface para los datos del contribuyente según la API
 */
export interface ContribuyenteData {
  codPersona: number;
  codTipoContribuyente?: string | null;
  codTipopersona?: string;
  codTipoDocumento?: string;
  numerodocumento?: string;
  nombres?: string;
  apellidomaterno?: string;
  apellidopaterno?: string;
  direccion?: string;
  fechanacimiento?: number;
  codestadocivil?: string;
  codsexo?: string;
  telefono?: string;
  lote?: string | null;
  otros?: string | null;
  codestado?: string | null;
  codDireccion?: number | null;
  codContribuyente?: number;
  codConyuge?: number | null;
  codRepresentanteLegal?: number | null;
  conyugeNombres?: string;
  conyugeApellidopaterno?: string;
  conyugeApellidomaterno?: string;
  repreNombres?: string;
  repreApellidopaterno?: string;
  repreApellidomaterno?: string;
}

/**
 * Interface para la lista simplificada de contribuyentes
 */
export interface ContribuyenteListItem {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  acciones?: any;
}

/**
 * Interface para la respuesta de la API
 */
export interface ContribuyenteApiResponse {
  success: boolean;
  message: string;
  data: ContribuyenteData | ContribuyenteData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestionar contribuyentes
 */
class ContribuyenteService {
  private static instance: ContribuyenteService;
  private readonly API_BASE = 'http://192.168.20.160:8080/api/contribuyente';
  // Cache local de contribuyentes
  private contribuyentesCache: ContribuyenteData[] = [];
  
  private constructor() {}
  
  /**
   * Obtiene la instancia única del servicio
   */
  static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('🔑 [ContribuyenteService] Token presente:', !!token);
    return token;
  }
  
  /**
   * Realiza una petición GET con manejo de errores mejorado
   */
  private async get<T>(endpoint: string = ''): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.API_BASE}${endpoint}`;
    
    console.log('🌐 [ContribuyenteService] GET:', url);
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Solo agregar Authorization si hay token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 [ContribuyenteService] Enviando con Bearer token');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      console.log('📥 [ContribuyenteService] Respuesta:', response.status, response.statusText);
      
      // Manejar errores HTTP
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Sin autorización para acceder a este recurso');
        }
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error en petición:', error);
      throw error;
    }
  }
  
  /**
   * Realiza una petición POST
   */
  private async post<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.API_BASE}${endpoint}`;
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error en POST:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un contribuyente específico por código
   */
  async obtenerPorCodigo(codigoContribuyente: number, codigoPersona: number = 0): Promise<ContribuyenteData | null> {
    try {
      const params = new URLSearchParams({
        codigoContribuyente: codigoContribuyente.toString(),
        codigoPersona: codigoPersona.toString()
      });
      
      const response = await this.get<ContribuyenteApiResponse>(`?${params.toString()}`);
      
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        return data || null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al obtener contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los contribuyentes
   * NOTA: La API requiere parámetros, así que obtenemos uno por uno o usamos una lista predefinida
   */
  async getAll(): Promise<ContribuyenteData[]> {
    try {
      console.log('📡 [ContribuyenteService] Obteniendo lista de contribuyentes...');
      
      // OPCIÓN 1: Si tienes una lista de códigos conocidos
      const codigosConocidos = [1, 2, 3, 4, 5]; // Ajusta según tus datos
      const contribuyentes: ContribuyenteData[] = [];
      
      for (const codigo of codigosConocidos) {
        try {
          const contribuyente = await this.obtenerPorCodigo(codigo, 0);
          if (contribuyente) {
            contribuyentes.push(contribuyente);
          }
        } catch (error) {
          console.warn(`⚠️ No se pudo obtener contribuyente ${codigo}`);
        }
      }
      
      // Guardar en cache
      this.contribuyentesCache = contribuyentes;
      
      console.log(`✅ [ContribuyenteService] ${contribuyentes.length} contribuyentes obtenidos`);
      return contribuyentes;
      
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al obtener contribuyentes:', error);
      
      // Si falla, devolver cache o datos de prueba
      if (this.contribuyentesCache.length > 0) {
        console.log('📦 [ContribuyenteService] Usando datos en cache');
        return this.contribuyentesCache;
      }
      
      // Datos de prueba como fallback
      return this.getDatosPrueba();
    }
  }
  
  /**
   * Obtiene todos los contribuyentes como items de lista simplificados
   */
  async getAllAsListItems(): Promise<ContribuyenteListItem[]> {
    try {
      const contribuyentes = await this.getAll();
      
      // Mapear a la estructura simplificada para la lista
      return contribuyentes.map(this.toListItem);
      
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al obtener lista:', error);
      // Devolver lista vacía en caso de error
      return [];
    }
  }
  
  /**
   * Convierte un contribuyente completo a un item de lista
   */
  private toListItem(contribuyente: ContribuyenteData): ContribuyenteListItem {
    // Construir el nombre completo
    const nombreCompleto = [
      contribuyente.apellidopaterno,
      contribuyente.apellidomaterno,
      contribuyente.nombres
    ].filter(Boolean).join(' ');
    
    return {
      codigo: contribuyente.codContribuyente || 0,
      contribuyente: nombreCompleto || 'Sin nombre',
      documento: contribuyente.numerodocumento || '-',
      direccion: contribuyente.direccion || 'Sin dirección'
    };
  }
  
  /**
   * Busca contribuyentes con filtros
   */
  async buscarContribuyentes(filtros?: {
    codigoContribuyente?: number;
    codigoPersona?: number;
  }): Promise<ContribuyenteData[]> {
    try {
      if (!filtros?.codigoContribuyente) {
        // Si no hay filtros, devolver todos los que tengamos en cache
        return this.contribuyentesCache;
      }
      
      const params = new URLSearchParams();
      params.append('codigoContribuyente', filtros.codigoContribuyente.toString());
      params.append('codigoPersona', (filtros.codigoPersona || 0).toString());
      
      const response = await this.get<ContribuyenteApiResponse>(`?${params.toString()}`);
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      
      return [];
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al buscar contribuyentes:', error);
      return [];
    }
  }
  
  /**
   * Crea un nuevo contribuyente
   */
  async crear(data: any): Promise<any> {
    try {
      console.log('📤 [ContribuyenteService] Creando contribuyente:', data);
      
      const response = await this.post('', data);
      
      console.log('✅ [ContribuyenteService] Contribuyente creado');
      NotificationService.success('Contribuyente registrado correctamente');
      
      return response;
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al crear:', error);
      NotificationService.error(error.message || 'Error al crear contribuyente');
      throw error;
    }
  }
  
  /**
   * Guarda un contribuyente completo (persona + contribuyente)
   */
  async guardarContribuyente(formData: any): Promise<any> {
    try {
      console.log('🚀 [ContribuyenteService] Iniciando guardado de contribuyente:', formData);
      
      // 1. Crear o actualizar persona principal
      const personaPrincipal = await this.crearPersonaDesdeFormulario(formData);
      
      if (!personaPrincipal.codPersona) {
        throw new Error('No se pudo crear la persona principal');
      }
      
      // 2. Crear cónyuge/representante si existe
      let codConyugeRepresentante: number | null = null;
      if (formData.tieneConyugeRepresentante && formData.conyugeRepresentante?.numeroDocumento) {
        console.log('👥 [ContribuyenteService] Creando cónyuge/representante...');
        
        const esRepresentante = formData.esPersonaJuridica;
        const personaRelacionada = await this.crearPersonaRelacionada(
          formData.conyugeRepresentante,
          esRepresentante
        );
        
        codConyugeRepresentante = personaRelacionada.codPersona || null;
      }
      
      // 3. Crear el contribuyente
      const contribuyenteData = {
        codPersona: personaPrincipal.codPersona,
        codConyuge: !formData.esPersonaJuridica ? codConyugeRepresentante : null,
        codRepresentanteLegal: formData.esPersonaJuridica ? codConyugeRepresentante : null,
        codestado: "2152", // Activo
        codUsuario: 1
      };
      
      console.log('📤 [ContribuyenteService] Creando contribuyente:', contribuyenteData);
      
      const response = await this.crear(contribuyenteData);
      
      return response;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Datos de prueba para desarrollo
   */
  private getDatosPrueba(): ContribuyenteData[] {
    return [
      {
        codPersona: 2,
        codContribuyente: 2,
        codTipopersona: "0301",
        codTipoDocumento: "4101",
        numerodocumento: "18086133",
        nombres: "Silvia",
        apellidomaterno: "Torres",
        apellidopaterno: "Miñano",
        direccion: "Sector Norte Barrio Nuevo Horizonte CALLE Calle Las Orquídeas Lote 45 MZ a3",
        codConyuge: 3,
        conyugeNombres: "Alfonzo",
        conyugeApellidopaterno: "Mantilla",
        conyugeApellidomaterno: "Rodriguez"
      },
      {
        codPersona: 1,
        codContribuyente: 1,
        codTipopersona: "0301",
        codTipoDocumento: "4101",
        numerodocumento: "70300207",
        nombres: "Juan Carlos",
        apellidomaterno: "Mendez",
        apellidopaterno: "Ramos",
        direccion: "Av. España 123, Trujillo"
      }
    ];
  }
  
  /**
   * Crea una persona desde los datos del formulario principal
   */
  private async crearPersonaDesdeFormulario(formData: any): Promise<PersonaData> {
    const personaData: PersonaData = {
      codTipopersona: formData.esPersonaJuridica ? '0302' : '0301',
      codTipoDocumento: this.mapearTipoDocumento(formData.tipoDocumento),
      numerodocumento: formData.numeroDocumento,
      nombres: (formData.nombres || formData.razonSocial || '').toUpperCase(),
      apellidopaterno: formData.apellidoPaterno?.toUpperCase() || '',
      apellidomaterno: formData.apellidoMaterno?.toUpperCase() || '',
      fechanacimiento: this.formatearFecha(formData.fechaNacimiento),
      codestadocivil: this.mapearEstadoCivil(formData.estadoCivil),
      codsexo: this.mapearSexo(formData.sexo),
      telefono: formData.telefono || '',
      codDireccion: formData.direccion?.id || 1,
      lote: formData.nFinca || null,
      otros: formData.otroNumero || null,
      parametroBusqueda: null,
      codUsuario: 1
    };
    
    return await personaService.crear(personaData);
  }
  
  /**
   * Crea una persona relacionada (cónyuge o representante)
   */
  private async crearPersonaRelacionada(
    datos: any,
    esRepresentante: boolean
  ): Promise<PersonaData> {
    const personaData: PersonaData = {
      codTipopersona: '0301', // Siempre persona natural
      codTipoDocumento: this.mapearTipoDocumento(datos.tipoDocumento),
      numerodocumento: datos.numeroDocumento,
      nombres: datos.nombres.toUpperCase(),
      apellidopaterno: datos.apellidoPaterno?.toUpperCase() || '',
      apellidomaterno: datos.apellidoMaterno?.toUpperCase() || '',
      fechanacimiento: this.formatearFecha(datos.fechaNacimiento),
      codestadocivil: esRepresentante ? 1 : 2, // Soltero para representante, casado para cónyuge
      codsexo: this.mapearSexo(datos.sexo),
      telefono: datos.telefono || '',
      codDireccion: datos.direccion?.id || 1,
      lote: datos.nFinca || null,
      otros: datos.otroNumero || null,
      parametroBusqueda: null,
      codUsuario: 1
    };
    
    return await personaService.crear(personaData);
  }
  
  /**
   * Mapea el tipo de documento del formulario al código de la API
   */
  private mapearTipoDocumento(tipo?: string): number {
    const mapa: Record<string, number> = {
      'DNI': 4101,
      'RUC': 4102,
      'PASAPORTE': 4103,
      'CARNET_EXTRANJERIA': 4104
    };
    return mapa[tipo || 'DNI'] || 4101;
  }
  
  /**
   * Mapea el sexo del formulario al código de la API
   */
  private mapearSexo(sexo?: string): number {
    const mapa: Record<string, number> = {
      'Masculino': 701,
      'Femenino': 702
    };
    return mapa[sexo || 'Masculino'] || 701;
  }
  
  /**
   * Mapea el estado civil del formulario al código de la API
   */
  private mapearEstadoCivil(estadoCivil?: string): number {
    const mapa: Record<string, number> = {
      'Soltero/a': 801,
      'Casado/a': 802,
      'Divorciado/a': 803,
      'Viudo/a': 804,
      'Conviviente': 805
    };
    return mapa[estadoCivil || 'Soltero/a'] || 801;
  }
  
  /**
   * Formatea una fecha al formato esperado por la API
   */
  private formatearFecha(fecha?: Date | string): string | undefined {
    if (!fecha) return undefined;
    
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    
    if (typeof fecha === 'string') {
      // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      const partes = fecha.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
      return fecha;
    }
    
    return undefined;
  }
}

// Exportar instancia única
export const contribuyenteService = ContribuyenteService.getInstance();