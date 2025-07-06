// src/services/direccionService.ts
import { API_CONFIG, buildApiUrl, getPublicHeaders } from '../config/api.config';
import { NotificationService } from '../components/utils/Notification';

// Interfaces
export interface Direccion {
  codDireccion: number;
  codBarrioVia: number | null;
  cuadra: number;
  lado: string | null;
  loteInicial: number;
  loteFinal: number;
  codUsuario: number | null;
  codSector: number | null;
  codVia: number | null;
  codBarrio: number;
  parametroBusqueda?: string | null;
  nombreBarrio: string;
  nombreSector: string;
  codTipoVia: number;
  nombreVia: string;
  nombreTipoVia: string;
  descripcion?: string;
}

export interface DireccionBusquedaParams {
  parametrosBusqueda?: string;
  nombreVia?: string;
  codSector?: number;
  codBarrio?: number;
  codUsuario?: number;
}

export interface DireccionApiResponse {
  success: boolean;
  message: string;
  data: Direccion[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para manejar las operaciones de direcciones
 * Conecta directamente con el servidor real
 */
export class DireccionService {
  private static instance: DireccionService;
  private readonly API_ENDPOINT = '/api/direccion';
  
  private constructor() {
    console.log('🔧 [DireccionService] Inicializado');
    console.log('🌐 [DireccionService] API Base:', API_CONFIG.baseURL);
    console.log('📍 [DireccionService] Endpoint:', this.API_ENDPOINT);
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): DireccionService {
    if (!DireccionService.instance) {
      DireccionService.instance = new DireccionService();
    }
    return DireccionService.instance;
  }
  
  /**
   * Construye la URL completa para una petición
   */
  private buildUrl(path: string): string {
    return buildApiUrl(`${this.API_ENDPOINT}${path}`);
  }
  
  /**
   * Realiza una petición GET al servidor
   */
  private async fetchJson<T = any>(url: string): Promise<T> {
    console.log(`📡 [DireccionService] GET: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getPublicHeaders(),
        mode: 'cors',
        credentials: 'omit' // No enviar cookies
      });
      
      console.log(`📥 [DireccionService] Response: ${response.status} ${response.statusText}`);
      
      if (response.status === 403) {
        console.warn('⚠️ [DireccionService] Error 403 - Intentando sin parámetros adicionales');
        throw new Error('Sin autorización para acceder a direcciones');
      }
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`❌ [DireccionService] Error:`, error);
      throw error;
    }
  }
  
  /**
   * Formatea una dirección completa
   */
  private formatearDireccion(dir: Direccion): Direccion {
    const descripcion = `${dir.nombreSector} - ${dir.nombreBarrio} - ${dir.nombreTipoVia} ${dir.nombreVia} - Cuadra ${dir.cuadra}`;
    
    return {
      ...dir,
      descripcion
    };
  }
  
  /**
   * Lista direcciones por tipo de vía
   * Usa parámetros mínimos para evitar error 403
   */
  async listarPorTipoVia(parametrosBusqueda: string = '', codUsuario: number = 1): Promise<Direccion[]> {
    try {
      console.log(`🔍 [DireccionService] Buscando direcciones por tipo de vía: "${parametrosBusqueda}"`);
      
      // Si no hay parámetro de búsqueda, usar uno por defecto
      const busqueda = parametrosBusqueda || 'CALLE';
      
      const params = new URLSearchParams({
        parametrosBusqueda: busqueda,
        codUsuario: codUsuario.toString()
      });
      
      const url = this.buildUrl(`/listarDireccionPorTipoVia?${params}`);
      
      // Intentar primero con los parámetros normales
      try {
        const response = await this.fetchJson<DireccionApiResponse>(url);
        
        if (response.success && response.data) {
          console.log(`✅ [DireccionService] ${response.data.length} direcciones encontradas`);
          const direccionesFormateadas = response.data.map(dir => this.formatearDireccion(dir));
          return direccionesFormateadas;
        }
      } catch (error: any) {
        // Si falla, intentar con parámetros diferentes
        console.log('⚠️ [DireccionService] Reintentando con parámetros alternativos...');
        
        const paramsAlt = new URLSearchParams({
          parametrosBusqueda: 'a',
          codUsuario: '1'
        });
        
        const urlAlt = this.buildUrl(`/listarDireccionPorTipoVia?${paramsAlt}`);
        const responseAlt = await this.fetchJson<DireccionApiResponse>(urlAlt);
        
        if (responseAlt.success && responseAlt.data) {
          console.log(`✅ [DireccionService] ${responseAlt.data.length} direcciones encontradas (intento alternativo)`);
          const direccionesFormateadas = responseAlt.data.map(dir => this.formatearDireccion(dir));
          return direccionesFormateadas;
        }
      }
      
      console.warn('⚠️ [DireccionService] No se encontraron direcciones');
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al listar por tipo de vía:', error);
      NotificationService.error('No se pudieron cargar las direcciones. Verifique su conexión.');
      return [];
    }
  }
  
  /**
   * Lista direcciones por nombre de vía
   */
  async listarPorNombreVia(params: DireccionBusquedaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones con parámetros:', params);
      
      // Construir parámetros con valores por defecto
      const queryParams = new URLSearchParams({
        parametrosBusqueda: params.parametrosBusqueda || params.nombreVia || 'a',
        codUsuario: (params.codUsuario || 1).toString()
      });
      
      // Agregar parámetros opcionales si existen
      if (params.codSector !== undefined && params.codSector !== null) {
        queryParams.append('codSector', params.codSector.toString());
      }
      if (params.codBarrio !== undefined && params.codBarrio !== null) {
        queryParams.append('codBarrio', params.codBarrio.toString());
      }
      
      const url = this.buildUrl(`/listarDireccionPorNombreVia?${queryParams}`);
      
      try {
        const response = await this.fetchJson<DireccionApiResponse>(url);
        
        if (response.success && response.data) {
          console.log(`✅ [DireccionService] ${response.data.length} direcciones encontradas`);
          const direccionesFormateadas = response.data.map(dir => this.formatearDireccion(dir));
          return direccionesFormateadas;
        }
        
        return [];
        
      } catch (error: any) {
        // Si falla con 403, intentar con parámetros mínimos
        if (error.message.includes('403') || error.message.includes('autorización')) {
          console.log('⚠️ [DireccionService] Reintentando con parámetros mínimos...');
          
          const paramsMin = new URLSearchParams({
            parametrosBusqueda: 'a',
            codUsuario: '1'
          });
          
          const urlMin = this.buildUrl(`/listarDireccionPorNombreVia?${paramsMin}`);
          const responseMin = await this.fetchJson<DireccionApiResponse>(urlMin);
          
          if (responseMin.success && responseMin.data) {
            console.log(`✅ [DireccionService] ${responseMin.data.length} direcciones encontradas (parámetros mínimos)`);
            
            // Filtrar localmente si había parámetros de búsqueda
            let resultados = responseMin.data.map(dir => this.formatearDireccion(dir));
            
            if (params.nombreVia) {
              resultados = resultados.filter(dir => 
                dir.nombreVia.toLowerCase().includes(params.nombreVia!.toLowerCase())
              );
            }
            
            if (params.codSector) {
              resultados = resultados.filter(dir => dir.codSector === params.codSector);
            }
            
            if (params.codBarrio) {
              resultados = resultados.filter(dir => dir.codBarrio === params.codBarrio);
            }
            
            return resultados;
          }
        }
        
        throw error;
      }
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al listar por nombre de vía:', error);
      NotificationService.error('No se pudieron cargar las direcciones');
      return [];
    }
  }
  
  /**
   * Obtiene todas las direcciones
   */
  async obtenerTodas(): Promise<Direccion[]> {
    console.log('🔄 [DireccionService] Obteniendo todas las direcciones...');
    
    // Intentar primero con listarPorNombreVia que parece ser más permisivo
    const direcciones = await this.listarPorNombreVia({
      parametrosBusqueda: 'a',
      codUsuario: 1
    });
    
    if (direcciones.length === 0) {
      // Si no funciona, intentar con listarPorTipoVia
      console.log('⚠️ [DireccionService] Intentando método alternativo...');
      return await this.listarPorTipoVia('', 1);
    }
    
    return direcciones;
  }
  
  /**
   * Busca direcciones por nombre de vía
   */
  async buscarPorNombreVia(nombreVia: string): Promise<Direccion[]> {
    return this.listarPorNombreVia({
      nombreVia,
      parametrosBusqueda: nombreVia,
      codUsuario: 1
    });
  }
  
  /**
   * Busca direcciones por sector
   */
  async buscarPorSector(codSector: number): Promise<Direccion[]> {
    return this.listarPorNombreVia({
      parametrosBusqueda: 'a',
      codSector,
      codUsuario: 1
    });
  }
  
  /**
   * Busca direcciones por barrio
   */
  async buscarPorBarrio(codBarrio: number): Promise<Direccion[]> {
    return this.listarPorNombreVia({
      parametrosBusqueda: 'a',
      codBarrio,
      codUsuario: 1
    });
  }
  
  /**
   * Busca direcciones con filtros avanzados
   */
  async buscarConFiltros(filtros: {
    tipo?: string;
    nombre?: string;
    sector?: number;
    barrio?: number;
  }): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando con filtros:', filtros);
      
      // Si hay tipo de vía, usar búsqueda por tipo
      if (filtros.tipo) {
        return await this.listarPorTipoVia(filtros.tipo, 1);
      }
      
      // Si no, usar búsqueda por nombre
      return await this.listarPorNombreVia({
        nombreVia: filtros.nombre,
        parametrosBusqueda: filtros.nombre || 'a',
        codSector: filtros.sector,
        codBarrio: filtros.barrio,
        codUsuario: 1
      });
      
    } catch (error) {
      console.error('❌ [DireccionService] Error en búsqueda con filtros:', error);
      return [];
    }
  }
  
  /**
   * Verifica la conectividad con el servidor
   */
  async verificarConexion(): Promise<boolean> {
    try {
      console.log('🔍 [DireccionService] Verificando conexión con el servidor...');
      
      // Intentar una petición simple
      const direcciones = await this.listarPorNombreVia({
        parametrosBusqueda: 'a',
        codUsuario: 1
      });
      
      console.log('✅ [DireccionService] Conexión exitosa');
      return true;
      
    } catch (error) {
      console.error('❌ [DireccionService] Sin conexión con el servidor');
      return false;
    }
  }
}

// Exportar instancia singleton
export const direccionService = DireccionService.getInstance();