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
  codUsuario?: number;
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
   * CORREGIDO: Usar GET con query parameters
   */
  async buscarPorNombreVia(params: BusquedaPorNombreViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por nombre de vía:', params);
      
      // Preparar los parámetros de consulta (query parameters)
      const queryParams = new URLSearchParams({
        parametrosBusqueda: params.nombreVia || 'a', // Valor por defecto 'a'
        codUsuario: (params.codUsuario || 1).toString() // Valor por defecto 1
      });
      
      // IMPORTANTE: En desarrollo usar URL completa
      const baseUrl = import.meta.env.DEV 
        ? `${import.meta.env.VITE_API_URL || 'http://192.168.20.160:8080'}`
        : '';
      const url = `${baseUrl}/api/direccion/listarDireccionPorNombreVia?${queryParams}`;
      
      console.log('📡 [DireccionService] URL de búsqueda:', url);
      
      // Usar GET sin body
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
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
      
      // Mapear los datos al formato que espera el backend
      const mappedData = {
        sectorId: data.sectorId,
        barrioId: data.barrioId,
        calleId: data.calleId,
        cuadra: data.cuadra,
        lado: data.lado,
        loteInicial: data.loteInicial,
        loteFinal: data.loteFinal,
        estado: 1
      };
      
      console.log('📋 [DireccionService] Datos mapeados para crear:', mappedData);
      
      // Usar el método create del padre con Bearer Token
      const nuevaDireccion = await super.create(mappedData);
      
      NotificationService.success('Dirección creada exitosamente');
      return nuevaDireccion;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      
      if (error.status === 401 || error.message?.includes('401')) {
        NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente');
        // Limpiar datos de autenticación
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Redirigir al login si es necesario
        window.location.href = '/login';
      } else if (error.status === 403 || error.message?.includes('403')) {
        NotificationService.error('No tiene permisos para crear direcciones');
      } else if (error.message?.includes('Duplicate')) {
        NotificationService.error('Ya existe una dirección con esos datos');
      } else {
        NotificationService.error(error.message || 'Error al crear la dirección');
      }
      
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección (requiere Bearer Token)
   */
  async update(id: number, data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📤 [DireccionService] Actualizando dirección:', { id, data });
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar direcciones');
        throw new Error('No se encontró token de autenticación');
      }
      
      const direccionActualizada = await super.update(id, data);
      
      NotificationService.success('Dirección actualizada exitosamente');
      return direccionActualizada;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al actualizar dirección:', error);
      
      if (error.status === 401) {
        NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente');
      } else if (error.status === 403) {
        NotificationService.error('No tiene permisos para actualizar direcciones');
      } else {
        NotificationService.error(error.message || 'Error al actualizar la dirección');
      }
      
      throw error;
    }
  }
  
  /**
   * Elimina una dirección (requiere Bearer Token)
   */
  async delete(id: number): Promise<void> {
    try {
      console.log('🗑️ [DireccionService] Eliminando dirección:', id);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para eliminar direcciones');
        throw new Error('No se encontró token de autenticación');
      }
      
      await super.delete(id);
      
      NotificationService.success('Dirección eliminada exitosamente');
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al eliminar dirección:', error);
      
      if (error.status === 401) {
        NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente');
      } else if (error.status === 403) {
        NotificationService.error('No tiene permisos para eliminar direcciones');
      } else {
        NotificationService.error(error.message || 'Error al eliminar la dirección');
      }
      
      throw error;
    }
  }
  
  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

// Exportar la instancia singleton
export const direccionService = DireccionService.getInstance();