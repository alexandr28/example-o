// src/services/barrioService.ts - VERSIÓN INDEPENDIENTE CON URL CORRECTA
import { Barrio, BarrioFormData } from '../models/Barrio';
import { NotificationService } from '../components/utils/Notification';

class BarrioServiceClass {
  // URL base - usar URL completa directamente
  private readonly API_BASE = 'http://192.168.20.160:8080/api/barrio';
  private readonly cacheKey = 'barrios_cache';

  constructor() {
    console.log('🔧 [BarrioService] Inicializado');
    console.log('📍 [BarrioService] Endpoint directo:', this.API_BASE);
    console.log('🌐 [BarrioService] Conexión directa al backend (sin proxy)');
  }

  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log(`🔑 [BarrioService] Token:`, token ? 'Presente' : 'No encontrado');
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
    
    // Extraer campos con múltiples posibles nombres
    const id = item.id || item.barrioId || item.barrio_id || item.codBarrio;
    const nombre = item.nombre || item.nombreBarrio || item.barrio_nombre || '';
    const sectorId = item.sectorId || item.sector_id || item.codSector || null;
    const estado = item.estado !== undefined ? item.estado : 1;
    
    if (!id && id !== 0) {
      console.error(`❌ [BarrioService] Barrio sin ID en posición ${index}:`, item);
      throw new Error(`Barrio sin ID en posición ${index}`);
    }
    
    const normalized: Barrio = {
      id: Number(id),
      nombre: String(nombre).trim(),
      sectorId: sectorId ? Number(sectorId) : null,
      estado: Number(estado)
    };
    
    console.log(`✅ [BarrioService] Item normalizado:`, normalized);
    return normalized;
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
    
    // Manejar diferentes formatos de respuesta
    const array = Array.isArray(data) ? data : 
                 (data.data ? data.data : 
                 (data.content ? data.content :
                 (data.result ? data.result : [])));
    
    if (!Array.isArray(array)) {
      console.warn(`⚠️ [BarrioService] No se pudo extraer array de los datos`);
      return [];
    }
    
    const normalized = array.map((item, index) => {
      try {
        return this.normalizeItem(item, index);
      } catch (error) {
        console.error(`❌ [BarrioService] Error al normalizar item ${index}:`, error);
        return null;
      }
    }).filter(item => item !== null) as Barrio[];
    
    console.log(`✅ [BarrioService] ${normalized.length} barrios normalizados`);
    return normalized;
  }

  /**
   * Guarda datos en caché
   */
  private saveToCache(data: Barrio[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
      localStorage.setItem(`${this.cacheKey}_timestamp`, new Date().toISOString());
      console.log(`💾 [BarrioService] ${data.length} barrios guardados en caché`);
    } catch (error) {
      console.error(`❌ [BarrioService] Error al guardar en caché:`, error);
    }
  }

  /**
   * Carga datos del caché
   */
  private loadFromCache(): Barrio[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const timestamp = localStorage.getItem(`${this.cacheKey}_timestamp`);
        console.log(`💾 [BarrioService] Datos cargados del caché (${timestamp})`);
        return data;
      }
    } catch (error) {
      console.error(`❌ [BarrioService] Error al cargar del caché:`, error);
    }
    return null;
  }

  /**
   * Limpia el caché
   */
  private clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(`${this.cacheKey}_timestamp`);
      console.log(`🧹 [BarrioService] Caché limpiado`);
    } catch (error) {
      console.error(`❌ [BarrioService] Error al limpiar caché:`, error);
    }
  }

  /**
   * Obtiene todos los barrios
   */
  async getAll(): Promise<Barrio[]> {
    try {
      console.log(`📡 [BarrioService] GET - Obteniendo todos los barrios`);
      console.log(`📍 [BarrioService] URL: ${this.API_BASE}`);
      
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log(`📊 [BarrioService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const normalized = this.normalizeArray(data);
      
      // Guardar en caché
      if (normalized.length > 0) {
        this.saveToCache(normalized);
      }
      
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error en getAll:`, error);
      
      // Intentar usar caché como fallback
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`✅ [BarrioService] Usando ${cachedData.length} barrios del caché`);
        NotificationService.warning('Sin conexión. Mostrando datos guardados.');
        return cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Crea un nuevo barrio
   */
  async create(data: BarrioFormData): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] POST - Creando barrio:`, data);
      console.log(`📍 [BarrioService] URL: ${this.API_BASE}`);
      
      // Verificar token
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para crear barrios');
        throw new Error('No hay token de autenticación');
      }
      
      // Preparar datos para la API
      const requestData = {
        nombreBarrio: data.nombre.trim(),
        sectorId: data.sectorId,
        estado: data.estado || 1
      };
      
      console.log(`📤 [BarrioService] Enviando:`, requestData);
      
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      console.log(`📊 [BarrioService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [BarrioService] Error:`, errorText);
        
        if (response.status === 403) {
          NotificationService.error('No tiene permisos para crear barrios');
          throw new Error('Sin permisos para crear barrios');
        } else if (response.status === 401) {
          NotificationService.error('Sesión expirada');
          throw new Error('Token inválido o expirado');
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log(`✅ [BarrioService] Barrio creado:`, responseData);
      
      const barrioCreado = this.normalizeItem(responseData, 0);
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      NotificationService.success('Barrio creado exitosamente');
      
      return barrioCreado;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al crear:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un barrio
   */
  async update(id: number, data: BarrioFormData): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] PUT - Actualizando barrio ${id}:`, data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar');
        throw new Error('No hay token de autenticación');
      }
      
      const requestData = {
        barrioId: id,
        nombreBarrio: data.nombre.trim(),
        sectorId: data.sectorId,
        estado: data.estado || 1
      };
      
      const url = `${this.API_BASE}/${id}`;
      console.log(`📍 [BarrioService] URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          NotificationService.error('Sin permisos para actualizar');
          throw new Error('Sin permisos');
        } else if (response.status === 401) {
          NotificationService.error('Sesión expirada');
          throw new Error('Token inválido');
        }
        throw new Error(`Error ${response.status}`);
      }
      
      const responseData = await response.json();
      const barrioActualizado = this.normalizeItem(responseData, 0);
      
      this.clearCache();
      NotificationService.success('Barrio actualizado');
      
      return barrioActualizado;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al actualizar:`, error);
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
        NotificationService.error('Debe iniciar sesión');
        throw new Error('No hay token');
      }
      
      const url = `${this.API_BASE}/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          NotificationService.error('Sin permisos');
          throw new Error('Sin permisos');
        }
        throw new Error(`Error ${response.status}`);
      }
      
      this.clearCache();
      NotificationService.success('Barrio eliminado');
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al eliminar:`, error);
      throw error;
    }
  }

  /**
   * Obtiene barrios por sector
   */
  async getBySector(sectorId: number): Promise<Barrio[]> {
    try {
      const allBarrios = await this.getAll();
      return allBarrios.filter(barrio => barrio.sectorId === sectorId);
    } catch (error) {
      console.error(`❌ [BarrioService] Error:`, error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const barrioService = new BarrioServiceClass();
export default barrioService;