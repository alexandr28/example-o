// src/services/constanteService.ts
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interface para los datos de constante
 */
export interface ConstanteData {
  codConstante: string;
  nombreCategoria: string;
}

/**
 * Interface para la respuesta del API
 */
export interface ConstanteResponse {
  success: boolean;
  message: string;
  data: ConstanteData[];
  pagina?: number | null;
  limite?: number | null;
}

/**
 * Códigos de constantes padres
 */
export const CODIGO_CONSTANTE_PADRE = {
  TIPO_CONTRIBUYENTE: '03', // Para tipos de contribuyente (Natural, Jurídico, Exonerado)
  TIPO_DOCUMENTO: '41'      // Para tipos de documento (DNI, RUC, etc.)
} as const;

/**
 * Servicio para gestión de constantes
 * NO requiere autenticación
 */
class ConstanteService {
  private static instance: ConstanteService;
  private cache: Map<string, { data: ConstanteData[]; timestamp: number }> = new Map();
  private cacheDuration: number = 30 * 60 * 1000; // 30 minutos
  
  private constructor() {}
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ConstanteService {
    if (!ConstanteService.instance) {
      ConstanteService.instance = new ConstanteService();
    }
    return ConstanteService.instance;
  }
  
  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   */
  private getCachedData(key: string): ConstanteData[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`📦 [ConstanteService] Datos obtenidos del cache para: ${key}`);
      return cached.data;
    }
    return null;
  }
  
  /**
   * Guarda datos en cache
   */
  private setCachedData(key: string, data: ConstanteData[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  /**
   * Lista las constantes hijas según el código del padre
   * NOTA: El API usa un patrón inusual de GET con form-data
   * Intentamos primero con POST, si falla usamos GET con query params
   */
  async listarConstantesPorPadre(codConstantePadre: string): Promise<ConstanteData[]> {
    try {
      // Verificar cache primero
      const cacheKey = `constantes_${codConstantePadre}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
      
      console.log(`🔍 [ConstanteService] Buscando constantes para padre: ${codConstantePadre}`);
      
      // Crear FormData
      const formData = new FormData();
      formData.append('codConstante', codConstantePadre);
      
      // Construir URL
      const url = buildApiUrl('/api/constante/listarConstantePadre');
      
      let response: Response;
      
      try {
        // Intentar primero con POST y form-data (más compatible con el patrón del API)
        console.log('📤 [ConstanteService] Intentando con POST y form-data...');
        response = await fetch(url, {
          method: 'POST',
          body: formData
        });
      } catch (postError) {
        console.log('⚠️ [ConstanteService] POST falló, intentando con GET y query params...');
        
        // Si POST falla, intentar con GET y query params
        const params = new URLSearchParams();
        params.append('codConstante', codConstantePadre);
        
        response = await fetch(`${url}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
      }
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const responseData: ConstanteResponse = await response.json();
      console.log(`📡 [ConstanteService] Respuesta recibida:`, responseData);
      
      // Validar respuesta
      if (responseData.success && Array.isArray(responseData.data)) {
        // Guardar en cache
        this.setCachedData(cacheKey, responseData.data);
        
        console.log(`✅ [ConstanteService] ${responseData.data.length} constantes obtenidas`);
        return responseData.data;
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`❌ [ConstanteService] Error al obtener constantes:`, error);
      
      // Si todo falla, retornar valores por defecto según el código padre
      if (codConstantePadre === CODIGO_CONSTANTE_PADRE.TIPO_CONTRIBUYENTE) {
        console.log('⚠️ [ConstanteService] Usando valores por defecto para tipos de contribuyente');
        return [
          { codConstante: '0301', nombreCategoria: 'NATURAL' },
          { codConstante: '0302', nombreCategoria: 'JURIDICO' },
          { codConstante: '0303', nombreCategoria: 'EXONERADO' }
        ];
      }
      
      if (codConstantePadre === CODIGO_CONSTANTE_PADRE.TIPO_DOCUMENTO) {
        console.log('⚠️ [ConstanteService] Usando valores por defecto para tipos de documento');
        return [
          { codConstante: '4101', nombreCategoria: 'DNI' },
          { codConstante: '4102', nombreCategoria: 'PARTIDA DE NACIMIENTO' },
          { codConstante: '4103', nombreCategoria: 'SIN DNI' },
          { codConstante: '4104', nombreCategoria: 'CARNÉ EXTRANJER.' }
        ];
      }
      
      throw error;
    }
  }
  
  /**
   * Obtiene los tipos de contribuyente
   */
  async obtenerTiposContribuyente(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_CONTRIBUYENTE);
  }
  
  /**
   * Obtiene los tipos de documento
   */
  async obtenerTiposDocumento(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DOCUMENTO);
  }
  
  /**
   * Mapea el código de tipo de contribuyente a su nombre
   */
  async obtenerNombreTipoContribuyente(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposContribuyente();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo contribuyente:', error);
      return codigo;
    }
  }
  
  /**
   * Mapea el código de tipo de documento a su nombre
   */
  async obtenerNombreTipoDocumento(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposDocumento();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo documento:', error);
      return codigo;
    }
  }
}

// Exportar instancia singleton
export const constanteService = ConstanteService.getInstance();

// Exportar también la clase por si se necesita extender
export default ConstanteService;