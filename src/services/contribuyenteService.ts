// src/services/contribuyenteService.ts
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos del contribuyente
 */
export interface ContribuyenteData {
  codPersona?: number;
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
  // Datos del cónyuge
  codConyuge?: number | null;
  conyugeTipoDocumento?: string | null;
  conyugeNumeroDocumento?: string | null;
  conyugeNombres?: string | null;
  conyugeApellidopaterno?: string | null;
  conyugeApellidomaterno?: string | null;
  // Datos del representante legal
  codRepresentanteLegal?: number | null;
  repreTipoDocumento?: string | null;
  repreNumeroDocumento?: string | null;
  repreNombres?: string | null;
  repreApellidopaterno?: string | null;
  repreApellidomaterno?: string | null;
}

/**
 * Interface para la respuesta de la API
 */
interface ContribuyenteApiResponse {
  success: boolean;
  message: string;
  data: ContribuyenteData | ContribuyenteData[] | null;
  pagina: number | null;
  limite: number | null;
  totalPaginas: number | null;
  totalRegistros: number | null;
}

/**
 * Interface para item de lista simplificado
 */
export interface ContribuyenteListItem {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica';
}

/**
 * Servicio para gestionar contribuyentes
 */
class ContribuyenteService {
  private static instance: ContribuyenteService;
  private readonly API_BASE = '/api/contribuyente';
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
    console.log('🔐 [ContribuyenteService] Token disponible:', !!token);
    return token;
  }
  
  /**
   * Realiza una petición GET con manejo de errores mejorado
   */
  private async get<T>(endpoint: string = ''): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.API_BASE}${endpoint}`;
    
    console.log('🌐 [ContribuyenteService] GET:', url);
    console.log('🔑 [ContribuyenteService] Token disponible:', !!token);
    
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json'
      };
      
      // Solo agregar Authorization si hay token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 [ContribuyenteService] Enviando con Bearer token');
      } else {
        console.log('⚠️ [ContribuyenteService] No hay token de autenticación');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      console.log('📥 [ContribuyenteService] Respuesta:', response.status, response.statusText);
      
      // Ver headers de respuesta para debug
      response.headers.forEach((value, key) => {
        console.log(`📋 Response Header - ${key}: ${value}`);
      });
      
      // Manejar errores HTTP
      if (!response.ok) {
        if (response.status === 403) {
          console.error('❌ Error 403: Forbidden - Verifique el token de autenticación');
          // Intentar obtener más detalles del error
          try {
            const errorData = await response.json();
            console.error('Detalles del error:', errorData);
          } catch (e) {
            console.error('No se pudo obtener detalles del error');
          }
          throw new Error('Sin autorización para acceder a este recurso. Por favor, inicie sesión.');
        }
        if (response.status === 401) {
          console.error('❌ Error 401: No autorizado - Token inválido o expirado');
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
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
   * Obtiene todos los contribuyentes disponibles
   * Itera sobre un rango de códigos conocidos
   */
  async getAll(): Promise<ContribuyenteData[]> {
    try {
      console.log('📡 [ContribuyenteService] Obteniendo lista de contribuyentes...');
      
      // Si no hay token, devolver datos de prueba
      const token = this.getAuthToken();
      if (!token) {
        console.log('⚠️ No hay token, usando datos de prueba');
        return this.getDatosPrueba();
      }
      
      // Intentar obtener varios contribuyentes por código
      // Puedes ajustar el rango según tus necesidades
      const contribuyentes: ContribuyenteData[] = [];
      const maxIntentos = 10; // Buscar hasta 10 contribuyentes
      let consecutivosFallidos = 0;
      
      for (let codigo = 1; codigo <= maxIntentos; codigo++) {
        try {
          const contribuyente = await this.obtenerPorCodigo(codigo, 0);
          if (contribuyente) {
            contribuyentes.push(contribuyente);
            consecutivosFallidos = 0; // Resetear contador
          } else {
            consecutivosFallidos++;
            // Si fallan 3 consecutivos, probablemente no hay más
            if (consecutivosFallidos >= 3) break;
          }
        } catch (error) {
          console.warn(`⚠️ No se pudo obtener contribuyente ${codigo}`);
          consecutivosFallidos++;
          if (consecutivosFallidos >= 3) break;
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
      direccion: contribuyente.direccion || 'Sin dirección',
      telefono: contribuyente.telefono || '',
      tipoPersona: contribuyente.codTipopersona === '0301' ? 'natural' : 'juridica'
    };
  }
  
  /**
   * Busca contribuyentes por término de búsqueda
   */
  async buscar(termino: string): Promise<ContribuyenteListItem[]> {
    try {
      // Por ahora, obtener todos y filtrar localmente
      const todos = await this.getAllAsListItems();
      
      if (!termino || termino.trim() === '') {
        return todos;
      }
      
      const terminoLower = termino.toLowerCase();
      return todos.filter(item =>
        item.contribuyente.toLowerCase().includes(terminoLower) ||
        item.documento.toLowerCase().includes(terminoLower) ||
        item.direccion.toLowerCase().includes(terminoLower)
      );
      
    } catch (error) {
      console.error('❌ [ContribuyenteService] Error al buscar:', error);
      return [];
    }
  }
  
  /**
   * Guarda o actualiza un contribuyente
   */
  async guardar(data: ContribuyenteData): Promise<ContribuyenteData> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const url = this.API_BASE;
      const method = data.codContribuyente ? 'PUT' : 'POST';
      
      console.log(`📤 [ContribuyenteService] ${method}:`, url, data);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ContribuyenteApiResponse = await response.json();
      
      if (result.success && result.data) {
        const contribuyenteGuardado = Array.isArray(result.data) ? result.data[0] : result.data;
        
        // Limpiar cache para forzar recarga
        this.contribuyentesCache = [];
        
        NotificationService.success(
          data.codContribuyente ? 'Contribuyente actualizado' : 'Contribuyente creado'
        );
        
        return contribuyenteGuardado;
      }
      
      throw new Error(result.message || 'Error al guardar contribuyente');
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error al guardar:', error);
      NotificationService.error(error.message || 'Error al guardar contribuyente');
      throw error;
    }
  }
  
  /**
   * Datos de prueba para desarrollo
   */
  private getDatosPrueba(): ContribuyenteData[] {
    return [
      {
        codPersona: 1,
        codTipoContribuyente: null,
        codTipopersona: "0301",
        codTipoDocumento: "4101",
        numerodocumento: "70300207",
        nombres: "Juan Carlos",
        apellidomaterno: "Mendez",
        apellidopaterno: "Ramos",
        direccion: "Sector Norte Barrio Nuevo Horizonte CALLE Calle Las Orquídeas Lote 45 Mz A",
        fechanacimiento: 631170000000,
        codestadocivil: "0801",
        codsexo: "0701",
        telefono: "987654321",
        codContribuyente: 1
      },
      {
        codPersona: 2,
        codTipopersona: "0301",
        codTipoDocumento: "4101",
        numerodocumento: "12345678",
        nombres: "María",
        apellidomaterno: "López",
        apellidopaterno: "García",
        direccion: "Av. Los Pinos 123, Trujillo",
        telefono: "999888777",
        codContribuyente: 2
      },
      {
        codPersona: 3,
        codTipopersona: "0302",
        codTipoDocumento: "4102",
        numerodocumento: "20123456789",
        nombres: "Empresa ABC S.A.C.",
        direccion: "Jr. Comercio 456, Trujillo",
        telefono: "044-123456",
        codContribuyente: 3
      }
    ];
  }
}

// Exportar instancia única del servicio
export const contribuyenteService = ContribuyenteService.getInstance();