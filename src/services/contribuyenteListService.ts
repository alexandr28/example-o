// src/services/contribuyenteListService.ts
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para la lista simplificada de contribuyentes
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
 * Interface para la respuesta del API de personas
 */
interface PersonaApiResponse {
  success: boolean;
  message: string;
  data: any[];
  pagina: number | null;
  limite: number | null;
  totalPaginas: number | null;
  totalRegistros: number | null;
}

/**
 * Servicio especializado para la lista de contribuyentes
 * Usa el endpoint de personas con form-data
 */
class ContribuyenteListService {
  private static instance: ContribuyenteListService;
  // NO incluir el host, solo la ruta relativa para que use el proxy
  private readonly API_BASE = '';  // Vacío porque vamos a usar rutas absolutas desde la raíz
  private contribuyentesCache: ContribuyenteListItem[] = [];
  
  private constructor() {}
  
  static getInstance(): ContribuyenteListService {
    if (!ContribuyenteListService.instance) {
      ContribuyenteListService.instance = new ContribuyenteListService();
    }
    return ContribuyenteListService.instance;
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * Obtiene la lista de contribuyentes usando el endpoint de personas
   */
  async obtenerListaContribuyentes(): Promise<ContribuyenteListItem[]> {
    try {
      console.log('📋 [ContribuyenteListService] Obteniendo lista de contribuyentes...');
      
      // Si no hay token, devolver datos de prueba
      const token = this.getAuthToken();
      if (!token) {
        console.log('⚠️ No hay token de autenticación, usando datos de prueba');
        return this.getDatosPrueba();
      }
      
      // Obtener personas naturales y jurídicas
      const [personasNaturales, personasJuridicas] = await Promise.all([
        this.obtenerPersonasPorTipo('0301', 'a'),
        this.obtenerPersonasPorTipo('0302', 'a')
      ]);
      
      // Combinar ambas listas
      const todasLasPersonas = [...personasNaturales, ...personasJuridicas];
      
      if (todasLasPersonas.length > 0) {
        // Mapear personas a items de lista
        const listaItems = todasLasPersonas.map((persona: any) => ({
          codigo: persona.codPersona || 0,
          contribuyente: persona.nombrePersona || this.construirNombreCompleto(persona),
          documento: persona.numerodocumento || '-',
          direccion: persona.direccion === 'null' || !persona.direccion ? 'Sin dirección' : persona.direccion,
          telefono: persona.telefono || '',
          tipoPersona: (persona.codTipoPersona === '0301' ? 'natural' : 'juridica') as 'natural' | 'juridica'
        }));
        
        this.contribuyentesCache = listaItems;
        console.log(`✅ [ContribuyenteListService] ${listaItems.length} contribuyentes cargados`);
        return listaItems;
      }
      
      console.log('⚠️ [ContribuyenteListService] No se encontraron personas');
      return this.getDatosPrueba();
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteListService] Error:', error);
      
      // Si es error 403, probablemente no hay autenticación
      if (error.message?.includes('403')) {
        console.log('⚠️ Error de autorización, usando datos de prueba');
        return this.getDatosPrueba();
      }
      
      // Si hay datos en cache, usarlos
      if (this.contribuyentesCache.length > 0) {
        console.log('📦 Usando datos en cache');
        return this.contribuyentesCache;
      }
      
      return this.getDatosPrueba();
    }
  }
  
  /**
   * Obtiene personas por tipo usando form-data
   */
  private async obtenerPersonasPorTipo(codTipoPersona: string, busqueda: string): Promise<any[]> {
    try {
      const token = this.getAuthToken();
      
      // Crear FormData
      const formData = new FormData();
      formData.append('codTipoPersona', codTipoPersona);
      formData.append('parametroBusqueda', busqueda);
      
      // IMPORTANTE: Usar ruta relativa, NO incluir localhost:3000
      const url = '/api/persona/listarPersonaPorTipoPersonaNombreRazon';
      console.log('🌐 [ContribuyenteListService] POST:', url);
      
      const headers: HeadersInit = {
        'Accept': 'application/json'
      };
      
      // Agregar token si existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Error 403: Sin autorización');
        }
        console.error('❌ Error en respuesta:', response.status, response.statusText);
        return [];
      }
      
      const data: PersonaApiResponse = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error al obtener personas:', error);
      return [];
    }
  }
  
  /**
   * Busca contribuyentes con filtro
   */
  async filtrarContribuyentes(filtro: any): Promise<ContribuyenteListItem[]> {
    try {
      const { busqueda, tipoContribuyente, tipoDocumento } = filtro;
      
      // Si no hay búsqueda, obtener todos
      if (!busqueda || busqueda.trim() === '') {
        const todos = await this.obtenerListaContribuyentes();
        
        // Aplicar filtros locales si existen
        return todos.filter(item => {
          if (tipoContribuyente && item.tipoPersona !== tipoContribuyente) {
            return false;
          }
          if (tipoDocumento && tipoDocumento !== 'todos') {
            // Aquí podrías filtrar por tipo de documento si tuvieras esa información
          }
          return true;
        });
      }
      
      // Si no hay token, filtrar datos de prueba
      const token = this.getAuthToken();
      if (!token) {
        const datosPrueba = this.getDatosPrueba();
        return datosPrueba.filter(item => {
          const busquedaLower = busqueda.toLowerCase();
          return item.contribuyente.toLowerCase().includes(busquedaLower) ||
                 item.documento.toLowerCase().includes(busquedaLower) ||
                 item.direccion.toLowerCase().includes(busquedaLower);
        });
      }
      
      // Buscar en ambos tipos de persona según el filtro
      let personasNaturales: any[] = [];
      let personasJuridicas: any[] = [];
      
      if (!tipoContribuyente || tipoContribuyente === 'natural') {
        personasNaturales = await this.obtenerPersonasPorTipo('0301', busqueda);
      }
      
      if (!tipoContribuyente || tipoContribuyente === 'juridica') {
        personasJuridicas = await this.obtenerPersonasPorTipo('0302', busqueda);
      }
      
      const todasLasPersonas = [...personasNaturales, ...personasJuridicas];
      
      // Mapear a items de lista
      return todasLasPersonas.map((persona: any) => ({
        codigo: persona.codPersona || 0,
        contribuyente: persona.nombrePersona || this.construirNombreCompleto(persona),
        documento: persona.numerodocumento || '-',
        direccion: persona.direccion === 'null' || !persona.direccion ? 'Sin dirección' : persona.direccion,
        telefono: persona.telefono || '',
        tipoPersona: (persona.codTipoPersona === '0301' ? 'natural' : 'juridica') as 'natural' | 'juridica'
      }));
      
    } catch (error) {
      console.error('Error al filtrar:', error);
      return this.getDatosPrueba();
    }
  }
  
  /**
   * Construye el nombre completo desde los datos de persona
   */
  private construirNombreCompleto(persona: any): string {
    // Si viene nombrePersona, usarlo directamente
    if (persona.nombrePersona) {
      return persona.nombrePersona;
    }
    
    // Si no, construir desde los campos
    const partes = [
      persona.apellidopaterno,
      persona.apellidomaterno,
      persona.nombres
    ].filter(Boolean);
    
    return partes.length > 0 ? partes.join(' ') : 'Sin nombre';
  }
  
  /**
   * Datos de prueba para desarrollo
   */
  private getDatosPrueba(): ContribuyenteListItem[] {
    return [
      {
        codigo: 1,
        contribuyente: 'Juan Pérez García',
        documento: '12345678',
        direccion: 'Av. Los Olivos 123, Trujillo',
        telefono: '999 888 777',
        tipoPersona: 'natural'
      },
      {
        codigo: 2,
        contribuyente: 'María Rodríguez López',
        documento: '87654321',
        direccion: 'Jr. Las Flores 456, Trujillo',
        telefono: '988 777 666',
        tipoPersona: 'natural'
      },
      {
        codigo: 3,
        contribuyente: 'Empresa ABC S.A.C.',
        documento: '20123456789',
        direccion: 'Av. Industrial 789, Trujillo',
        telefono: '044-123456',
        tipoPersona: 'juridica'
      },
      {
        codigo: 4,
        contribuyente: 'Comercial XYZ E.I.R.L.',
        documento: '20987654321',
        direccion: 'Jr. Comercio 321, Trujillo',
        telefono: '044-654321',
        tipoPersona: 'juridica'
      },
      {
        codigo: 5,
        contribuyente: 'Carlos Mendoza Silva',
        documento: '11223344',
        direccion: 'Calle Los Pinos 567, Trujillo',
        telefono: '977 666 555',
        tipoPersona: 'natural'
      }
    ];
  }
}

// Exportar instancia única
export const contribuyenteListService = ContribuyenteListService.getInstance();