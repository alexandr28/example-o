// src/services/direccionService.ts - VERSIÓN SIN ENDPOINT BASE
import { BaseApiService } from './BaseApiService';
import { Direccion, DireccionFormData } from '../models';
import { NotificationService } from '../components/utils/Notification';

/**
 * Configuración de normalización para direcciones
 */
const direccionNormalizeOptions = {
  normalizeItem: (item: any): Direccion => {
    // Construir la descripción concatenada
    let descripcionParts = [];
    
    // Agregar sector
    if (item.nombreSector) {
      descripcionParts.push(item.nombreSector);
    }
    
    // Agregar barrio (solo si existe y no es null)
    if (item.nombreBarrio && item.nombreBarrio !== null && item.nombreBarrio !== '') {
      descripcionParts.push(item.nombreBarrio);
    }
    
    // Agregar vía con tipo
    if (item.nombreTipoVia && item.nombreVia) {
      descripcionParts.push(`${item.nombreTipoVia} ${item.nombreVia}`);
    } else if (item.nombreVia) {
      descripcionParts.push(item.nombreVia);
    }
    
    // Agregar cuadra
    if (item.cuadra) {
      descripcionParts.push(`Cuadra ${item.cuadra}`);
    }
    
    // Unir todas las partes con espacios
    const descripcionCompleta = descripcionParts.join(' ');
    
    return {
      id: item.codDireccion || item.direccionId || item.id || 0,
      sectorId: item.codSector || item.sectorId || 0,
      barrioId: item.codBarrio || item.barrioId || 0,
      calleId: item.codVia || item.calleId || 0,
      cuadra: item.cuadra || '',
      lado: item.lado || '-',
      loteInicial: item.loteInicial || 0,
      loteFinal: item.loteFinal || 0,
      descripcion: descripcionCompleta,
      estado: item.estado === 1 || item.estado === true,
      // Datos adicionales del API
      nombreSector: item.nombreSector || '',
      nombreBarrio: item.nombreBarrio || '',
      nombreVia: item.nombreVia || '',
      nombreTipoVia: item.nombreTipoVia || '',
      codDireccion: item.codDireccion,
      codBarrioVia: item.codBarrioVia,
      codSector: item.codSector,
      codBarrio: item.codBarrio,
      codVia: item.codVia,
      // Relaciones opcionales
      sector: item.sector || undefined,
      barrio: item.barrio || undefined,
      calle: item.calle || undefined
    };
  }
};

/**
 * Interfaz para parámetros de búsqueda por tipo de vía
 */
interface BusquedaPorTipoViaParams {
  parametrosBusqueda: string;
  codUsuario?: number;
}

/**
 * Interfaz para parámetros de búsqueda por nombre de vía
 */
interface BusquedaPorNombreViaParams {
  nombreVia?: string;
  codSector?: number;
  codBarrio?: number;
}

/**
 * Servicio para manejar las operaciones de direcciones
 */
export class DireccionService extends BaseApiService<Direccion, DireccionFormData> {
  private static instance: DireccionService;
  
  constructor() {
    super(
      '', // baseURL vacío para usar proxy
      '/api/direccion', // endpoint base (aunque no lo usaremos para GET)
      direccionNormalizeOptions, // opciones de normalización
      'direcciones_cache' // clave de caché
    );
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
   * Obtiene todas las direcciones
   * IMPORTANTE: NO usa el endpoint base, sino el endpoint específico de búsqueda
   */
  async getAll(): Promise<Direccion[]> {
    try {
      console.log('🔄 [DireccionService] Obteniendo todas las direcciones');
      
      // Usar directamente el endpoint de búsqueda con parámetros vacíos
      return await this.buscarPorNombreVia({
        nombreVia: '',
        codSector: 0,
        codBarrio: 0
      });
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al obtener direcciones:', error);
      
      // Si hay error, intentar devolver del caché
      const cached = this.loadFromCache();
      if (cached && cached.length > 0) {
        console.log(`📦 [DireccionService] Devolviendo ${cached.length} direcciones del caché`);
        return cached;
      }
      
      return [];
    }
  }
  
  /**
   * Busca direcciones por tipo de vía
   */
  async buscarPorTipoVia(params: BusquedaPorTipoViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por tipo de vía:', params);
      
      const queryParams = new URLSearchParams({
        parametrosBusqueda: params.parametrosBusqueda,
        ...(params.codUsuario && { codUsuario: params.codUsuario.toString() })
      });
      
      // IMPORTANTE: URL relativa para que funcione el proxy
      const url = `/api/direccion/listarDireccionPorTipoVia?${queryParams}`;
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      // Manejo de respuesta según estructura del API
      let dataArray: any[] = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response)) {
        dataArray = response;
      } else {
        console.warn('⚠️ [DireccionService] Estructura de respuesta no reconocida:', response);
        dataArray = [];
      }
      
      const direcciones = dataArray.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [DireccionService] ${direcciones.length} direcciones encontradas por tipo de vía`);
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por tipo de vía:', error);
      return [];
    }
  }
  
  /**
   * Busca direcciones por nombre de vía
   * Este es el método principal para listar direcciones
   */
  async buscarPorNombreVia(params?: BusquedaPorNombreViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por nombre de vía:', params || 'sin parámetros');
      
      // IMPORTANTE: URL relativa para que funcione el proxy
      let url = '/api/direccion/listarDireccionPorNombreVia';
      
      // Siempre agregar parámetros para evitar error 403
      const queryParams = new URLSearchParams();
      
      // Usar valores por defecto si no se proporcionan
      queryParams.append('nombreVia', params?.nombreVia || '');
      queryParams.append('codSector', (params?.codSector || 0).toString());
      queryParams.append('codBarrio', (params?.codBarrio || 0).toString());
      
      url += `?${queryParams}`;
      
      console.log(`📡 [DireccionService] URL final: ${url}`);
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      // Según la imagen del API, la respuesta tiene estructura: { success, message, data: [...] }
      let dataArray: any[] = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response)) {
        dataArray = response;
      } else {
        console.warn('⚠️ [DireccionService] Estructura de respuesta no reconocida:', response);
        dataArray = [];
      }
      
      const direcciones = dataArray.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [DireccionService] ${direcciones.length} direcciones encontradas`);
      
      // Guardar en caché si hay resultados
      if (direcciones.length > 0) {
        this.saveToCache(direcciones);
      }
      
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por nombre de vía:', error);
      
      // Si hay error, intentar devolver del caché
      const cached = this.loadFromCache();
      if (cached && cached.length > 0) {
        console.log(`📦 [DireccionService] Error en búsqueda, devolviendo ${cached.length} direcciones del caché`);
        return cached;
      }
      
      return [];
    }
  }
  
  /**
   * Crea una nueva dirección (requiere Bearer Token)
   * IMPORTANTE: Usa un endpoint específico para crear, no el base
   */
  async create(data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📤 [DireccionService] Creando nueva dirección:', data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para guardar direcciones');
        throw new Error('No se encontró token de autenticación');
      }
      
      // USAR UN ENDPOINT ESPECÍFICO PARA CREAR
      // Asumiendo que existe un endpoint como /api/direccion/crear o similar
      // Si no existe, necesitarás verificar con el backend cuál es el endpoint correcto
      const createUrl = '/api/direccion/crear';
      
      const response = await this.makeRequest(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const direccion = this.normalizeOptions.normalizeItem(response, 0);
      
      NotificationService.success('Dirección creada exitosamente');
      console.log('✅ [DireccionService] Dirección creada:', direccion);
      
      // Actualizar caché agregando la nueva dirección
      const cached = this.loadFromCache() || [];
      cached.push(direccion);
      this.saveToCache(cached);
      
      return direccion;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      
      // Si el endpoint /crear no existe, mostrar mensaje específico
      if (error.message?.includes('404')) {
        NotificationService.error('El endpoint para crear direcciones no está disponible. Contacte al administrador.');
      } else {
        NotificationService.error(error.message || 'Error al crear dirección');
      }
      
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección existente (requiere Bearer Token)
   */
  async update(id: number, data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📝 [DireccionService] Actualizando dirección:', id, data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar direcciones');
        throw new Error('No se encontró token de autenticación');
      }
      
      // Usar endpoint específico para actualizar
      const updateUrl = `/api/direccion/actualizar/${id}`;
      
      const response = await this.makeRequest(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const direccion = this.normalizeOptions.normalizeItem(response, 0);
      
      NotificationService.success('Dirección actualizada exitosamente');
      console.log('✅ [DireccionService] Dirección actualizada:', direccion);
      
      // Actualizar caché
      const cached = this.loadFromCache() || [];
      const index = cached.findIndex(d => d.id === id);
      if (index !== -1) {
        cached[index] = direccion;
        this.saveToCache(cached);
      }
      
      return direccion;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al actualizar dirección:', error);
      NotificationService.error(error.message || 'Error al actualizar dirección');
      throw error;
    }
  }
  
  /**
   * Elimina una dirección (requiere Bearer Token)
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log('🗑️ [DireccionService] Eliminando dirección:', id);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para eliminar direcciones');
        throw new Error('No se encontró token de autenticación');
      }
      
      // Usar endpoint específico para eliminar
      const deleteUrl = `/api/direccion/eliminar/${id}`;
      
      await this.makeRequest(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      NotificationService.success('Dirección eliminada exitosamente');
      console.log('✅ [DireccionService] Dirección eliminada');
      
      // Actualizar caché eliminando la dirección
      const cached = this.loadFromCache() || [];
      const filtered = cached.filter(d => d.id !== id);
      this.saveToCache(filtered);
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al eliminar dirección:', error);
      NotificationService.error(error.message || 'Error al eliminar dirección');
      throw error;
    }
  }
  
  /**
   * Busca direcciones con filtro
   */
  async search(term: string): Promise<Direccion[]> {
    try {
      // Usar búsqueda por nombre de vía
      return await this.buscarPorNombreVia({
        nombreVia: term,
        codSector: 0,
        codBarrio: 0
      });
    } catch (error) {
      console.error('❌ [DireccionService] Error en búsqueda:', error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const direccionService = DireccionService.getInstance();

// Exportar también la clase para testing
export default DireccionService;