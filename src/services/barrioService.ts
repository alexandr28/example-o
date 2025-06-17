// src/services/barrioService.ts - VERSIÓN CON PROXY
import { Barrio, BarrioFormData } from '../models/Barrio';
import { NotificationService } from '../components/utils/Notification';

class BarrioService {
  // URL base para el servicio - Usar URL relativa para el proxy
  private readonly API_BASE = '/api/barrio';
    
  private readonly cacheKey = 'barrios_cache';

  constructor() {
    console.log('🔧 [BarrioService] Inicializado con URL relativa:', this.API_BASE);
    console.log('🔧 [BarrioService] Las peticiones serán redirigidas por el proxy de Vite');
  }

  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log(`🔑 [BarrioService] Token obtenido:`, token ? 'Presente' : 'No encontrado');
    return token;
  }

  /**
   * Normaliza un item de barrio
   */
  private normalizeItem(item: any, index: number): Barrio {
    console.log(`🔍 [BarrioService] Normalizando item ${index}:`, item);
    
    if (!item || typeof item !== 'object') {
      console.warn(`⚠️ [BarrioService] Item ${index} no es válido:`, item);
      throw new Error(`Barrio en posición ${index} no es válido`);
    }
    
    const id = item.id || item.barrioId || item.barrio_id || item.codBarrio;
    const nombre = item.nombre || item.nombreBarrio || item.barrio_nombre || '';
    const sectorId = item.sectorId || item.sector_id || item.codSector || null;
    const estado = item.estado !== undefined ? item.estado : 1;
    
    if (!id && id !== 0) {
      console.error(`❌ [BarrioService] Barrio sin ID en posición ${index}:`, item);
      throw new Error(`Barrio sin ID en posición ${index}`);
    }
    
    const normalizedBarrio: Barrio = {
      id: Number(id),
      nombre: String(nombre).trim(),
      sectorId: sectorId ? Number(sectorId) : null,
      estado: Number(estado)
    };
    
    console.log(`✅ [BarrioService] Item normalizado:`, normalizedBarrio);
    return normalizedBarrio;
  }

  /**
   * Normaliza un array de barrios
   */
  private normalizeArray(data: any): Barrio[] {
    console.log(`🔍 [BarrioService] Normalizando array:`, data);
    
    if (!data) {
      console.warn(`⚠️ [BarrioService] Datos vacíos o nulos`);
      return [];
    }
    
    const array = Array.isArray(data) ? data : 
                 (data.data ? data.data : 
                 (data.content ? data.content :
                 (data.result ? data.result :
                 (data.items ? data.items :
                 (data.barrios ? data.barrios : [data])))));
    
    if (!Array.isArray(array)) {
      console.warn(`⚠️ [BarrioService] No es un array:`, array);
      return [];
    }
    
    console.log(`📋 [BarrioService] Procesando ${array.length} elementos`);
    
    const normalized: Barrio[] = [];
    for (let i = 0; i < array.length; i++) {
      try {
        const item = this.normalizeItem(array[i], i);
        normalized.push(item);
      } catch (error) {
        console.error(`❌ [BarrioService] Error al normalizar elemento ${i}:`, error);
      }
    }
    
    console.log(`✅ [BarrioService] Normalizados ${normalized.length} barrios`);
    return normalized;
  }

  /**
   * Guarda datos en caché
   */
  private saveToCache(data: Barrio[]): void {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`❌ [BarrioService] Error al guardar en caché:`, error);
    }
  }

  /**
   * Carga datos desde caché
   */
  private loadFromCache(): Barrio[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > 24 * 60 * 60 * 1000; // 24 horas
      
      if (isExpired) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.error(`❌ [BarrioService] Error al cargar caché:`, error);
      return null;
    }
  }

  /**
   * Limpia el caché
   */
  private clearCache(): void {
    localStorage.removeItem(this.cacheKey);
  }

  /**
   * Obtiene datos por defecto
   */
  private getDefaultBarrios(): Barrio[] {
    return [
      { id: 1, nombre: 'BARRIO 1', sectorId: 1, estado: 1 },
      { id: 2, nombre: 'BARRIO 2', sectorId: 1, estado: 1 },
      { id: 3, nombre: 'BARRIO 3', sectorId: 1, estado: 1 },
      { id: 4, nombre: 'BARRIO 4', sectorId: 2, estado: 1 },
      { id: 5, nombre: 'BARRIO 5', sectorId: 2, estado: 1 },
      { id: 6, nombre: 'BARRIO 6', sectorId: 3, estado: 1 },
    ];
  }

  /**
   * Obtiene todos los barrios
   */
  async getAll(): Promise<Barrio[]> {
    try {
      console.log(`📡 [BarrioService] GET - Obteniendo todos los barrios`);
      console.log(`🌐 [BarrioService] URL: ${this.API_BASE} (será redirigida por proxy)`);
      
      // Primero intentar cargar desde caché
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`💾 [BarrioService] Usando ${cachedData.length} barrios del caché`);
        // Actualizar en background
        this.updateInBackground();
        return cachedData;
      }
      
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`📊 [BarrioService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📦 [BarrioService] Datos recibidos:`, data);
      
      const normalized = this.normalizeArray(data);
      
      if (normalized.length > 0) {
        this.saveToCache(normalized);
        console.log(`💾 [BarrioService] ${normalized.length} barrios guardados en caché`);
      }
      
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error en getAll:`, error);
      
      // Intentar usar caché como fallback
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`✅ [BarrioService] Recuperados ${cachedData.length} barrios del caché`);
        return cachedData;
      }
      
      // Si no hay caché, devolver datos por defecto
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        console.log(`📋 [BarrioService] Sin conexión, usando datos de ejemplo`);
        return this.getDefaultBarrios();
      }
      
      throw error;
    }
  }

  /**
   * Obtiene un barrio por ID
   */
  async getById(id: number): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] GET - Obteniendo barrio ${id}`);
      
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.normalizeItem(data, 0);
      
    } catch (error) {
      console.error(`❌ [BarrioService] Error al obtener barrio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo barrio
   */
  async create(data: BarrioFormData): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] POST - Creando barrio:`, data);
      console.log(`🌐 [BarrioService] URL: ${this.API_BASE}`);
      
      // Verificar token
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para crear barrios');
        throw new Error('No hay token de autenticación. Por favor, inicie sesión.');
      }
      
      // Formato esperado por la API
      const apiData = {
        nombreBarrio: data.nombre,
        sectorId: data.sectorId,
        estado: data.estado || 1
      };
      
      console.log(`📤 [BarrioService] Enviando datos:`, apiData);
      console.log(`🔑 [BarrioService] Con token: Bearer ${token.substring(0, 20)}...`);
      
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      console.log(`📊 [BarrioService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [BarrioService] Error en POST:`, errorText);
        
        if (response.status === 403) {
          NotificationService.error('No tiene permisos para crear barrios');
          throw new Error('No tiene permisos para crear barrios. Verifique su rol de usuario.');
        } else if (response.status === 401) {
          NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente');
          throw new Error('Token inválido o expirado. Por favor, inicie sesión nuevamente.');
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log(`📄 [BarrioService] Respuesta raw:`, responseText);
      
      let barrioCreado: Barrio;
      
      try {
        const responseData = JSON.parse(responseText);
        console.log(`📦 [BarrioService] Respuesta parseada:`, responseData);
        
        barrioCreado = this.normalizeItem(responseData, 0);
      } catch (e) {
        // Si no es JSON o hay error, crear barrio temporal
        console.log(`⚠️ [BarrioService] Error al parsear respuesta, creando barrio temporal`);
        barrioCreado = {
          id: Date.now(),
          nombre: data.nombre,
          sectorId: data.sectorId,
          estado: data.estado || 1
        };
      }
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      NotificationService.success('Barrio creado exitosamente');
      console.log(`✅ [BarrioService] Barrio creado:`, barrioCreado);
      
      return barrioCreado;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al crear:`, error);
      NotificationService.error(error.message || 'Error al crear el barrio');
      throw error;
    }
  }

  /**
   * Actualiza un barrio existente
   */
  async update(id: number, data: BarrioFormData): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] PUT - Actualizando barrio ${id}:`, data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar barrios');
        throw new Error('No hay token de autenticación.');
      }
      
      const apiData = {
        barrioId: id,
        nombreBarrio: data.nombre,
        sectorId: data.sectorId,
        estado: data.estado || 1
      };
      
      const url = `${this.API_BASE}/${id}`;
      console.log(`📤 [BarrioService] PUT a: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          NotificationService.error('No tiene permisos para actualizar barrios');
          throw new Error('No tiene permisos para actualizar barrios.');
        } else if (response.status === 401) {
          NotificationService.error('Sesión expirada');
          throw new Error('Token inválido o expirado.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      let barrioActualizado: Barrio;
      
      try {
        const responseData = JSON.parse(responseText);
        barrioActualizado = this.normalizeItem(responseData, 0);
      } catch (e) {
        barrioActualizado = {
          id: id,
          nombre: data.nombre,
          sectorId: data.sectorId,
          estado: data.estado || 1
        };
      }
      
      this.clearCache();
      NotificationService.success('Barrio actualizado exitosamente');
      console.log(`✅ [BarrioService] Barrio actualizado:`, barrioActualizado);
      
      return barrioActualizado;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al actualizar:`, error);
      NotificationService.error(error.message || 'Error al actualizar el barrio');
      throw error;
    }
  }

  /**
   * Elimina un barrio
   */
  async delete(id: number): Promise<void> {
    try {
      console.log(`📡 [BarrioService] DELETE - Eliminando barrio ${id}`);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para eliminar barrios');
        throw new Error('No hay token de autenticación.');
      }
      
      const url = `${this.API_BASE}/${id}`;
      console.log(`📤 [BarrioService] DELETE a: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          NotificationService.error('No tiene permisos para eliminar barrios');
          throw new Error('No tiene permisos para eliminar barrios.');
        } else if (response.status === 401) {
          NotificationService.error('Sesión expirada');
          throw new Error('Token inválido o expirado.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      this.clearCache();
      NotificationService.success('Barrio eliminado exitosamente');
      console.log(`✅ [BarrioService] Barrio ${id} eliminado`);
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al eliminar:`, error);
      NotificationService.error(error.message || 'Error al eliminar el barrio');
      throw error;
    }
  }

  /**
   * Busca barrios por término
   */
  async search(term: string): Promise<Barrio[]> {
    try {
      console.log(`📡 [BarrioService] SEARCH - Buscando:`, term);
      
      const response = await fetch(`${this.API_BASE}/search?q=${encodeURIComponent(term)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.normalizeArray(data);
      
    } catch (error) {
      console.error(`❌ [BarrioService] Error en búsqueda:`, error);
      // Si falla la búsqueda, buscar localmente
      const allBarrios = await this.getAll();
      return allBarrios.filter(barrio => 
        barrio.nombre.toLowerCase().includes(term.toLowerCase())
      );
    }
  }

  /**
   * Verifica la conectividad con el endpoint
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log(`🔍 [BarrioService] Verificando conexión con: ${this.API_BASE}`);
      
      const response = await fetch(this.API_BASE, {
        method: 'HEAD'
      });
      
      console.log(`✅ [BarrioService] Conexión exitosa`);
      return response.ok;
      
    } catch (error) {
      console.error(`❌ [BarrioService] Sin conexión:`, error);
      return false;
    }
  }

  /**
   * Actualiza los datos en background
   */
  private async updateInBackground(): Promise<void> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const normalized = this.normalizeArray(data);
        if (normalized.length > 0) {
          this.saveToCache(normalized);
          console.log(`🔄 [BarrioService] Caché actualizado en background`);
        }
      }
    } catch (error) {
      console.log(`⚠️ [BarrioService] No se pudo actualizar en background:`, error);
    }
  }

  /**
   * Carga datos desde el servidor con reintentos
   */
  private async loadFromServer(): Promise<Barrio[]> {
    const maxRetries = 3;
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(this.API_BASE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return this.normalizeArray(data);
        }
        
        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
        console.log(`⚠️ [BarrioService] Intento ${i + 1} falló:`, error);
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }
}

// Exportar una única instancia
const barrioService = new BarrioService();
export default barrioService;