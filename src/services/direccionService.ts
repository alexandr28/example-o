// src/services/direccionService.ts
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
  codUsuario?: number; // Agregado según la API
}

/**
 * Servicio para manejar las operaciones de direcciones
 */
export class DireccionService extends BaseApiService<Direccion, DireccionFormData> {
  private static instance: DireccionService;
  
  constructor() {
    // En desarrollo, usar la URL completa para evitar problemas con el proxy
    const baseURL = import.meta.env.DEV 
      ? (import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080')
      : '';
      
    super(
      baseURL, // URL base completa en desarrollo
      '/api/direccion', // endpoint base
      direccionNormalizeOptions, // opciones de normalización
      'direcciones_cache' // clave de caché
    );
    
    console.log('🔧 [DireccionService] Configurado con baseURL:', baseURL);
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
      
      // Usar directamente el endpoint de búsqueda con parámetros por defecto
      return await this.buscarPorNombreVia({
        nombreVia: 'a', // Parámetro por defecto para obtener resultados
        codUsuario: 1
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
      
      // IMPORTANTE: En desarrollo usar URL completa
      const baseUrl = import.meta.env.DEV 
        ? `${import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080'}`
        : '';
      const url = `${baseUrl}/api/direccion/listarDireccionPorTipoVia?${queryParams}`;
      console.log('📡 [DireccionService] URL de búsqueda:', url);
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      // El API devuelve un array, procesarlo
      let dataArray: any[] = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object' && response.data) {
        dataArray = response.data;
      } else {
        console.warn('⚠️ [DireccionService] Respuesta inesperada:', response);
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
      console.error('❌ [DireccionService] Error al buscar por tipo de vía:', error);
      
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
   * Busca direcciones por nombre de vía
   */
  async buscarPorNombreVia(params: BusquedaPorNombreViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por nombre de vía:', params);
      
      // Preparar los parámetros del body
      const bodyParams = {
        parametrosBusqueda: params.nombreVia || 'a', // Valor por defecto 'a' como en la imagen
        codUsuario: params.codUsuario || 1 // Valor por defecto 1 como en la imagen
      };
      
      // IMPORTANTE: En desarrollo usar URL completa
      const baseUrl = import.meta.env.DEV 
        ? `${import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080'}`
        : '';
      const url = `${baseUrl}/api/direccion/listarDireccionPorNombreVia`;
      
      console.log('📡 [DireccionService] URL de búsqueda:', url);
      console.log('📤 [DireccionService] Parámetros del body:', bodyParams);
      
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bodyParams)
      });
      
      // El API devuelve un array, procesarlo
      let dataArray: any[] = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response && typeof response === 'object' && response.data) {
        dataArray = response.data;
      } else {
        console.warn('⚠️ [DireccionService] Respuesta inesperada:', response);
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
   * IMPORTANTE: Usa el endpoint base /api/direccion con POST
   */
  async create(data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📤 [DireccionService] Creando nueva dirección:', data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para guardar direcciones');
        throw new Error('No se encontró token de autenticación');
      }
      
      // Verificar roles del usuario
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('👤 [DireccionService] Usuario:', user.username);
          console.log('🎭 [DireccionService] Roles:', user.roles);
        } catch (e) {
          console.error('Error al parsear usuario');
        }
      }
      
      // Mapear los datos al formato que espera el API
      const apiData = {
        codSector: data.sectorId,
        codBarrio: data.barrioId,
        codVia: data.calleId,
        cuadra: data.cuadra,
        lado: data.lado,
        loteInicial: data.loteInicial,
        loteFinal: data.loteFinal
      };
      
      console.log('📡 [DireccionService] Enviando al API:', apiData);
      
      // USAR EL ENDPOINT BASE CORRECTO: /api/direccion
      const response = await this.makeRequest(this.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
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
      
      if (error.message?.includes('403')) {
        NotificationService.error('No tiene permisos para crear direcciones. Contacte al administrador.');
      } else if (error.message?.includes('401')) {
        NotificationService.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente');
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
      
      // Mapear los datos al formato que espera el API
      const apiData = {
        codDireccion: id,
        codSector: data.sectorId,
        codBarrio: data.barrioId,
        codVia: data.calleId,
        cuadra: data.cuadra,
        lado: data.lado,
        loteInicial: data.loteInicial,
        loteFinal: data.loteFinal
      };
      
      // Usar el endpoint con el ID
      const updateUrl = `${this.url}/${id}`;
      
      const response = await this.makeRequest(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
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
      
      // Usar el endpoint con el ID
      const deleteUrl = `${this.url}/${id}`;
      
      await this.makeRequest(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      NotificationService.success('Dirección eliminada exitosamente');
      console.log('✅ [DireccionService] Dirección eliminada:', id);
      
      // Actualizar caché removiendo la dirección eliminada
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
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('⚠️ [DireccionService] No se encontró token de autenticación');
    } else {
      // Verificar que el token no esté vacío
      console.log('🔑 [DireccionService] Token encontrado:', token.substring(0, 20) + '...');
    }
    return token;
  }
  
  /**
   * Obtiene una dirección por ID (sin usar - solo para compatibilidad)
   */
  async getById(id: number): Promise<Direccion> {
    console.warn('⚠️ [DireccionService] getById no está implementado en el backend');
    throw new Error('Método no disponible');
  }
}

// Exportar la instancia singleton
export const direccionService = DireccionService.getInstance();