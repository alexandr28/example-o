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
  private readonly API_BASE = 'http://192.168.20.160:8080/api';
  private contribuyentesCache: ContribuyenteListItem[] = [];
  
  private constructor() {}
  
  static getInstance(): ContribuyenteListService {
    if (!ContribuyenteListService.instance) {
      ContribuyenteListService.instance = new ContribuyenteListService();
    }
    return ContribuyenteListService.instance;
  }
  
  /**
   * Obtiene la lista de contribuyentes usando el endpoint de personas
   */
  async obtenerListaContribuyentes(): Promise<ContribuyenteListItem[]> {
    try {
      console.log('📋 [ContribuyenteListService] Obteniendo lista de contribuyentes...');
      
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
          direccion: persona.direccion === 'null' || !persona.direccion ? 'Sin dirección' : persona.direccion
        }));
        
        this.contribuyentesCache = listaItems;
        console.log(`✅ [ContribuyenteListService] ${listaItems.length} contribuyentes cargados`);
        return listaItems;
      }
      
      console.log('⚠️ [ContribuyenteListService] No se encontraron personas');
      return [];
      
    } catch (error) {
      console.error('❌ [ContribuyenteListService] Error:', error);
      
      // Si hay datos en cache, usarlos
      if (this.contribuyentesCache.length > 0) {
        console.log('📦 Usando datos en cache');
        return this.contribuyentesCache;
      }
      
      return [];
    }
  }
  
  /**
   * Obtiene personas por tipo usando form-data
   */
  private async obtenerPersonasPorTipo(codTipoPersona: string, busqueda: string): Promise<any[]> {
    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('codTipoPersona', codTipoPersona);
      formData.append('parametroBusqueda', busqueda);
      
      const url = `${this.API_BASE}/persona/listarPersonaPorTipoPersonaNombreRazon`;
      console.log('🌐 [ContribuyenteListService] POST:', url);
      console.log('📦 FormData:', { codTipoPersona, parametroBusqueda: busqueda });
      
      const response = await fetch(url, {
        method: 'POST', // Cambiar a POST si el API lo requiere
        body: formData
        // No incluir Content-Type header, el navegador lo establecerá automáticamente con el boundary correcto
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Error en respuesta:', response.status, response.statusText);
        // Si es GET, intentar con GET y query params
        return await this.obtenerPersonasPorTipoConGet(codTipoPersona, busqueda);
      }
      
      const data: PersonaApiResponse = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error al obtener personas:', error);
      // Si falla con POST/form-data, intentar con GET
      return await this.obtenerPersonasPorTipoConGet(codTipoPersona, busqueda);
    }
  }
  
  /**
   * Método alternativo con GET y query params
   */
  private async obtenerPersonasPorTipoConGet(codTipoPersona: string, busqueda: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        codTipoPersona,
        parametroBusqueda: busqueda
      });
      
      const url = `${this.API_BASE}/persona/listarPersonaPorTipoPersonaNombreRazon?${params}`;
      console.log('🌐 [ContribuyenteListService] GET (alternativo):', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: PersonaApiResponse = await response.json();
        if (data.success && data.data) {
          return Array.isArray(data.data) ? data.data : [data.data];
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error en método GET:', error);
      return [];
    }
  }
  
  /**
   * Busca contribuyentes con filtro
   */
  async filtrarContribuyentes(busqueda: string): Promise<ContribuyenteListItem[]> {
    try {
      if (!busqueda || busqueda.trim() === '') {
        // Si no hay búsqueda, obtener todos
        return await this.obtenerListaContribuyentes();
      }
      
      // Buscar en ambos tipos de persona
      const [personasNaturales, personasJuridicas] = await Promise.all([
        this.obtenerPersonasPorTipo('0301', busqueda),
        this.obtenerPersonasPorTipo('0302', busqueda)
      ]);
      
      const todasLasPersonas = [...personasNaturales, ...personasJuridicas];
      
      // Mapear a items de lista
      return todasLasPersonas.map((persona: any) => ({
        codigo: persona.codPersona || 0,
        contribuyente: persona.nombrePersona || this.construirNombreCompleto(persona),
        documento: persona.numerodocumento || '-',
        direccion: persona.direccion === 'null' || !persona.direccion ? 'Sin dirección' : persona.direccion
      }));
      
    } catch (error) {
      console.error('Error al filtrar:', error);
      return [];
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
}

// Exportar instancia única
export const contribuyenteListService = ContribuyenteListService.getInstance();