/**
   * Verifica la conectividad con el servidor
   */

  // src/services/direccionService.ts
  import { NotificationService } from '../components/utils/Notification';

  // Interfaces basadas en la respuesta real de la API
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
  
  export interface DireccionApiResponse {
    success: boolean;
    message: string;
    data: Direccion[];
  }
  
  export interface DireccionBusquedaParams {
    parametrosBusqueda?: string;
    codUsuario?: number;
  }
  
  /**
   * Servicio para manejar las operaciones de direcciones
   * NO requiere autenticación para métodos GET
   * SÍ requiere autenticación (Token Bearer) para métodos POST
   */
  export class DireccionService {
    private static instance: DireccionService;
    private readonly API_BASE = 'http://192.168.20.160:8080';
    private readonly API_ENDPOINT = '/api/direccion';
    
    private constructor() {
      console.log('🔧 [DireccionService] Inicializado');
      console.log('🌐 [DireccionService] API Base:', this.API_BASE);
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
     * Obtiene el token de autenticación del localStorage
     */
    private getAuthToken(): string | null {
      const token = localStorage.getItem('auth_token');
      console.log(`🔑 [DireccionService] Token:`, token ? 'Presente' : 'No encontrado');
      return token;
    }
    
    /**
     * Construye la URL completa para una petición
     */
    private buildUrl(path: string): string {
      return `${this.API_BASE}${this.API_ENDPOINT}${path}`;
    }
    
    /**
     * Realiza una petición GET sin autenticación
     */
    private async fetchJson<T = any>(url: string): Promise<T> {
      console.log(`📡 [DireccionService] GET: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        console.log(`📥 [DireccionService] Response: ${response.status} ${response.statusText}`);
        
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
     * Realiza una petición POST con autenticación
     */
    private async postJson<T = any>(url: string, data: any): Promise<T> {
      const token = this.getAuthToken();
      
      if (!token) {
        NotificationService.error('Debe iniciar sesión para realizar esta acción');
        throw new Error('No hay token de autenticación');
      }
      
      console.log(`📡 [DireccionService] POST: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors',
          body: JSON.stringify(data)
        });
        
        console.log(`📥 [DireccionService] Response: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
          NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente');
          throw new Error('No autorizado');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP ${response.status}`);
        }
        
        const responseData = await response.json();
        return responseData;
        
      } catch (error) {
        console.error(`❌ [DireccionService] Error:`, error);
        throw error;
      }
    }
    
    /**
     * Formatea una dirección completa para mostrar
     */
    private formatearDireccion(dir: Direccion): Direccion {
      const descripcion = `${dir.nombreSector} - ${dir.nombreBarrio} - ${dir.nombreTipoVia} ${dir.nombreVia} - Cuadra ${dir.cuadra}`;
      
      return {
        ...dir,
        descripcion
      };
    }
    
    /**
     * Formatea una dirección completa para mostrar
     */
    private formatearDireccion(dir: Direccion): Direccion {
      const descripcion = `${dir.nombreSector} - ${dir.nombreBarrio} - ${dir.nombreTipoVia} ${dir.nombreVia} - Cuadra ${dir.cuadra}`;
      
      return {
        ...dir,
        descripcion
      };
    }
    
    /**
     * Lista direcciones por nombre de vía
     * GET /api/direccion/listarDireccionPorNombreVia
     */
    async listarPorNombreVia(params: DireccionBusquedaParams = {}): Promise<Direccion[]> {
      try {
        console.log('🔍 [DireccionService] Listando direcciones por nombre de vía:', params);
        
        // Parámetros por defecto
        const queryParams = new URLSearchParams({
          parametrosBusqueda: params.parametrosBusqueda || 'a',
          codUsuario: (params.codUsuario || 1).toString()
        });
        
        const url = this.buildUrl(`/listarDireccionPorNombreVia?${queryParams}`);
        const response = await this.fetchJson<DireccionApiResponse>(url);
        
        if (response.success && response.data) {
          console.log(`✅ [DireccionService] ${response.data.length} direcciones encontradas`);
          const direccionesFormateadas = response.data.map(dir => this.formatearDireccion(dir));
          return direccionesFormateadas;
        }
        
        console.warn('⚠️ [DireccionService] No se encontraron direcciones');
        return [];
        
      } catch (error: any) {
        console.error('❌ [DireccionService] Error al listar por nombre de vía:', error);
        NotificationService.error('Error al cargar direcciones');
        return [];
      }
    }
    
    /**
     * Lista direcciones por tipo de vía
     * GET /api/direccion/listarDireccionPorTipoVia
     */
    async listarPorTipoVia(params: DireccionBusquedaParams = {}): Promise<Direccion[]> {
      try {
        console.log('🔍 [DireccionService] Listando direcciones por tipo de vía:', params);
        
        // Parámetros por defecto
        const queryParams = new URLSearchParams({
          parametrosBusqueda: params.parametrosBusqueda || 'a',
          codUsuario: (params.codUsuario || 1).toString()
        });
        
        const url = this.buildUrl(`/listarDireccionPorTipoVia?${queryParams}`);
        const response = await this.fetchJson<DireccionApiResponse>(url);
        
        if (response.success && response.data) {
          console.log(`✅ [DireccionService] ${response.data.length} direcciones encontradas`);
          const direccionesFormateadas = response.data.map(dir => this.formatearDireccion(dir));
          return direccionesFormateadas;
        }
        
        console.warn('⚠️ [DireccionService] No se encontraron direcciones');
        return [];
        
      } catch (error: any) {
        console.error('❌ [DireccionService] Error al listar por tipo de vía:', error);
        NotificationService.error('Error al cargar direcciones');
        return [];
      }
    }
    
    /**
     * Obtiene todas las direcciones (usa listarPorNombreVia con parámetros por defecto)
     */
    async obtenerTodas(): Promise<Direccion[]> {
      console.log('🔄 [DireccionService] Obteniendo todas las direcciones...');
      return this.listarPorNombreVia();
    }
    
    /**
     * Busca direcciones por nombre de vía específico
     */
    async buscarPorNombreVia(nombreVia: string): Promise<Direccion[]> {
      if (!nombreVia || nombreVia.trim().length < 1) {
        return this.obtenerTodas();
      }
      
      return this.listarPorNombreVia({
        parametrosBusqueda: nombreVia,
        codUsuario: 1
      });
    }
    
    /**
     * Busca direcciones por tipo de vía específico
     */
    async buscarPorTipoVia(tipoVia: string): Promise<Direccion[]> {
      if (!tipoVia || tipoVia.trim().length < 1) {
        return this.obtenerTodas();
      }
      
      return this.listarPorTipoVia({
        parametrosBusqueda: tipoVia,
        codUsuario: 1
      });
    }
    
    /**
     * Busca direcciones con filtros combinados
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
          return await this.buscarPorTipoVia(filtros.tipo);
        }
        
        // Si hay nombre, usar búsqueda por nombre
        if (filtros.nombre) {
          return await this.buscarPorNombreVia(filtros.nombre);
        }
        
        // Si no hay filtros específicos, obtener todas
        return await this.obtenerTodas();
        
      } catch (error) {
        console.error('❌ [DireccionService] Error en búsqueda con filtros:', error);
        return [];
      }
    }
    
    /**
     * Crea una nueva dirección
     * POST /api/direccion
     * Requiere autenticación Bearer Token
     */
    async crear(direccion: {
      codBarrioVia: number;
      cuadra: number;
      codLado?: string;
      loteInicial: number;
      loteFinal: number;
      codUsuario: number;
      codSector: number;
      codBarrio: number;
      parametroBusqueda?: string;
    }): Promise<Direccion> {
      try {
        console.log('➕ [DireccionService] Creando nueva dirección:', direccion);
        
        // Validaciones básicas
        if (!direccion.codBarrioVia || !direccion.cuadra || !direccion.codSector || !direccion.codBarrio) {
          throw new Error('Faltan campos requeridos para crear la dirección');
        }
        
        const url = this.buildUrl('');
        const response = await this.postJson<any>(url, direccion);
        
        if (response.success && response.data) {
          console.log('✅ [DireccionService] Dirección creada exitosamente');
          NotificationService.success('Dirección creada exitosamente');
          
          // Si la respuesta es un array, tomar el primer elemento
          const nuevaDireccion = Array.isArray(response.data) ? response.data[0] : response.data;
          return this.formatearDireccion(nuevaDireccion);
        } else {
          throw new Error(response.message || 'Error al crear la dirección');
        }
        
      } catch (error: any) {
        console.error('❌ [DireccionService] Error al crear dirección:', error);
        NotificationService.error(`Error al crear dirección: ${error.message}`);
        throw error;
      }
    }
    
    /**
     * Actualiza una dirección existente
     * PUT /api/direccion/{id}
     * Requiere autenticación Bearer Token
     */
    async actualizar(id: number, direccion: {
      codBarrioVia?: number;
      cuadra?: number;
      codLado?: string;
      loteInicial?: number;
      loteFinal?: number;
      codUsuario?: number;
      codSector?: number;
      codBarrio?: number;
    }): Promise<Direccion> {
      try {
        console.log(`📝 [DireccionService] Actualizando dirección ${id}:`, direccion);
        
        const token = this.getAuthToken();
        if (!token) {
          NotificationService.error('Debe iniciar sesión para realizar esta acción');
          throw new Error('No hay token de autenticación');
        }
        
        const url = this.buildUrl(`/${id}`);
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors',
          body: JSON.stringify(direccion)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP ${response.status}`);
        }
        
        const responseData = await response.json();
        
        if (responseData.success && responseData.data) {
          console.log('✅ [DireccionService] Dirección actualizada exitosamente');
          NotificationService.success('Dirección actualizada exitosamente');
          
          const direccionActualizada = Array.isArray(responseData.data) 
            ? responseData.data[0] 
            : responseData.data;
            
          return this.formatearDireccion(direccionActualizada);
        } else {
          throw new Error(responseData.message || 'Error al actualizar la dirección');
        }
        
      } catch (error: any) {
        console.error('❌ [DireccionService] Error al actualizar dirección:', error);
        NotificationService.error(`Error al actualizar dirección: ${error.message}`);
        throw error;
      }
    }
    
    /**
     * Elimina una dirección
     * DELETE /api/direccion/{id}
     * Requiere autenticación Bearer Token
     */
    async eliminar(id: number): Promise<void> {
      try {
        console.log(`🗑️ [DireccionService] Eliminando dirección ${id}`);
        
        const token = this.getAuthToken();
        if (!token) {
          NotificationService.error('Debe iniciar sesión para realizar esta acción');
          throw new Error('No hay token de autenticación');
        }
        
        const url = this.buildUrl(`/${id}`);
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error HTTP ${response.status}`);
        }
        
        console.log('✅ [DireccionService] Dirección eliminada exitosamente');
        NotificationService.success('Dirección eliminada exitosamente');
        
      } catch (error: any) {
        console.error('❌ [DireccionService] Error al eliminar dirección:', error);
        NotificationService.error(`Error al eliminar dirección: ${error.message}`);
        throw error;
      }
    }
  }
  
  // Exportar instancia singleton
  export const direccionService = DireccionService.getInstance();