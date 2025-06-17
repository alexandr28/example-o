// src/services/barrioService.ts
import { BaseApiService } from './BaseApiService';
import { Barrio, BarrioFormData } from '../models/Barrio';
import { API_CONFIG } from '../config/api.config';

class BarrioService extends BaseApiService<Barrio, BarrioFormData, BarrioFormData> {
  constructor() {
    // En desarrollo usar URL relativa, en producción usar la completa
    const baseUrl = import.meta.env.DEV ? '' : API_CONFIG.baseURL;
    
    super(
      baseUrl,
      '/api/barrio', // Endpoint correcto
      {
        normalizeItem: (item: any, index: number): Barrio => {
          console.log(`🔍 [BarrioService] Normalizando item ${index}:`, item);
          
          if (!item || typeof item !== 'object') {
            console.warn(`⚠️ [BarrioService] Item ${index} no es válido:`, item);
            throw new Error(`Barrio en posición ${index} no es válido`);
          }
          
          // Manejar diferentes formatos posibles de la API
          // Ajusta estos campos según lo que devuelve tu API
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
          
          console.log(`✅ [BarrioService] Barrio normalizado:`, normalizedBarrio);
          return normalizedBarrio;
        },
        
        validateItem: (item: Barrio, index: number): boolean => {
          const isValid = item && 
                         item.id !== undefined && 
                         item.id !== null && 
                         !isNaN(Number(item.id)) &&
                         item.nombre && 
                         item.nombre.trim().length > 0;
          
          if (!isValid) {
            console.warn(`⚠️ [BarrioService] Barrio ${index} no pasó validación:`, item);
          }
          
          return isValid;
        }
      },
      'barrios_cache'
    );
  }

  /**
   * Override getAll para debug y manejo específico
   */
  async getAll(): Promise<Barrio[]> {
    try {
      console.log(`📡 [BarrioService] GET - Obteniendo barrios desde: ${this.url}`);
      
      // Intentar cargar desde caché primero
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`💾 [BarrioService] Usando ${cachedData.length} barrios del caché`);
        this.updateInBackground();
        return cachedData;
      }
      
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      console.log(`📊 [BarrioService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📦 [BarrioService] Datos recibidos:`, data);
      
      if (!Array.isArray(data)) {
        console.error(`❌ [BarrioService] La respuesta no es un array:`, data);
        throw new Error('La respuesta no es un array de barrios');
      }
      
      // Log del primer elemento para debugging
      if (data.length > 0) {
        console.log(`📋 [BarrioService] Estructura del primer barrio:`, Object.keys(data[0]));
      }
      
      const normalized = this.normalizeArray(data);
      
      if (normalized.length > 0) {
        this.saveToCache(normalized);
        console.log(`💾 [BarrioService] ${normalized.length} barrios guardados en caché`);
      }
      
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error en getAll:`, error);
      
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`✅ [BarrioService] Recuperados ${cachedData.length} barrios del caché`);
        return cachedData;
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        console.log(`📋 [BarrioService] Sin conexión, usando datos de ejemplo`);
        return this.getDefaultBarrios();
      }
      
      throw error;
    }
  }

  /**
   * Override create para el formato correcto
   */
  async create(data: BarrioFormData): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] POST - Creando barrio:`, data);
      
      // Verificar que tenemos token
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión.');
      }
      
      // Ajusta estos campos según lo que espera tu API
      const apiData = {
        nombreBarrio: data.nombre,
        sectorId: data.sectorId,
        estado: data.estado || 1
      };
      
      console.log(`📤 [BarrioService] Enviando a la API:`, apiData);
      console.log(`🔑 [BarrioService] Token presente:`, token ? 'Sí' : 'No');
      
      // Hacer la petición directamente sin usar makeRequest heredado
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData),
        mode: 'cors',
        credentials: 'same-origin'
      });
      
      console.log(`📊 [BarrioService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [BarrioService] Error en POST:`, errorText);
        
        if (response.status === 403) {
          throw new Error('No tiene permisos para crear barrios. Verifique su rol de usuario.');
        } else if (response.status === 401) {
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
        
        // Ajusta según la respuesta de tu API
        if (responseData.id || responseData.barrioId || responseData.codBarrio) {
          barrioCreado = {
            id: Number(responseData.id || responseData.barrioId || responseData.codBarrio),
            nombre: responseData.nombre || responseData.nombreBarrio || data.nombre,
            sectorId: responseData.sectorId || responseData.codSector || data.sectorId,
            estado: responseData.estado !== undefined ? responseData.estado : 1
          };
        } else {
          // Si no devuelve el barrio, crear uno temporal
          console.log(`⚠️ [BarrioService] La API no devolvió el barrio creado`);
          barrioCreado = {
            id: -1,
            nombre: data.nombre,
            sectorId: data.sectorId,
            estado: data.estado || 1
          };
        }
      } catch (e) {
        // Si no es JSON, asumir éxito
        console.log(`⚠️ [BarrioService] Respuesta no es JSON, asumiendo éxito`);
        barrioCreado = {
          id: -1,
          nombre: data.nombre,
          sectorId: data.sectorId,
          estado: data.estado || 1
        };
      }
      
      this.clearCache();
      console.log(`✅ [BarrioService] Barrio creado:`, barrioCreado);
      return barrioCreado;
      
    } catch (error: any) {
      console.error(`❌ [BarrioService] Error al crear:`, error);
      throw error;
    }
  }

  /**
   * Override update
   */
  async update(id: number, data: BarrioFormData): Promise<Barrio> {
    try {
      console.log(`📡 [BarrioService] PUT - Actualizando barrio ${id}:`, data);
      
      const apiData = {
        barrioId: id,
        nombreBarrio: data.nombre,
        sectorId: data.sectorId,
        estado: data.estado || 1
      };
      
      const response = await fetch(`${this.url}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      let barrioActualizado: Barrio;
      
      try {
        const responseData = JSON.parse(responseText);
        barrioActualizado = {
          id: Number(responseData.id || responseData.barrioId || id),
          nombre: responseData.nombre || responseData.nombreBarrio || data.nombre,
          sectorId: responseData.sectorId || responseData.codSector || data.sectorId,
          estado: responseData.estado !== undefined ? responseData.estado : data.estado || 1
        };
      } catch (e) {
        barrioActualizado = {
          id: id,
          nombre: data.nombre,
          sectorId: data.sectorId,
          estado: data.estado || 1
        };
      }
      
      this.clearCache();
      return barrioActualizado;
      
    } catch (error) {
      console.error(`❌ [BarrioService] Error al actualizar:`, error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async updateInBackground(): Promise<void> {
    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const normalized = this.normalizeArray(data);
          if (normalized.length > 0) {
            this.saveToCache(normalized);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ [BarrioService] No se pudo actualizar en background:`, error);
    }
  }

  private loadFromCache(): Barrio[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      return parsedCache.data || null;
    } catch (e) {
      return null;
    }
  }

  private saveToCache(data: Barrio[]): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error(`❌ [BarrioService] Error al guardar caché:`, e);
    }
  }

  private getDefaultBarrios(): Barrio[] {
    return [
      { id: 1, nombre: 'CENTRO HISTÓRICO', sectorId: 1, estado: 1 },
      { id: 2, nombre: 'BUENOS AIRES', sectorId: 1, estado: 1 },
      { id: 3, nombre: 'CHICAGO', sectorId: 2, estado: 1 },
      { id: 4, nombre: 'FLORENCIA DE MORA', sectorId: 2, estado: 1 },
      { id: 5, nombre: 'LA ESPERANZA', sectorId: 3, estado: 1 }
    ];
  }

  clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    console.log(`🧹 [BarrioService] Caché limpiado`);
  }
}

// Exportar instancia única
const barrioService = new BarrioService();
export default barrioService;