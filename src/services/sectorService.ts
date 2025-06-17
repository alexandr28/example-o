// src/services/sectorService.ts - VERSIÓN CORREGIDA CON CAMPOS CORRECTOS
import { BaseApiService } from './BaseApiService';
import { Sector, SectorFormData } from '../models/Sector';
import { API_CONFIG } from '../config/api.config';

class SectorService extends BaseApiService<Sector, SectorFormData, SectorFormData> {
  constructor() {
    const baseUrl = import.meta.env.DEV ? '' : API_CONFIG.baseURL;
    
    super(
      baseUrl,
      API_CONFIG.endpoints.sectores, // '/api/sector'
      {
        normalizeItem: (item: any, index: number): Sector => {
          console.log(`🔍 [SectorService] Normalizando item ${index}:`, item);
          
          if (!item || typeof item !== 'object') {
            console.warn(`⚠️ [SectorService] Item ${index} no es válido:`, item);
            throw new Error(`Sector en posición ${index} no es válido`);
          }
          
          // LA API DEVUELVE: { codSector: number, nombreSector: string }
          const id = item.codSector;
          const nombre = item.nombreSector || '';
          
          // El estado no viene en la respuesta, usar default
          const estado = item.estado !== undefined ? item.estado : 1;
          
          if (!id && id !== 0) {
            console.error(`❌ [SectorService] Sector sin ID en posición ${index}:`, item);
            throw new Error(`Sector sin codSector en posición ${index}`);
          }
          
          const normalizedSector: Sector = {
            id: Number(id),
            nombre: String(nombre).trim(),
            estado: Number(estado)
          };
          
          console.log(`✅ [SectorService] Sector normalizado:`, normalizedSector);
          return normalizedSector;
        },
        
        validateItem: (item: Sector, index: number): boolean => {
          const isValid = item && 
                         item.id !== undefined && 
                         item.id !== null && 
                         !isNaN(Number(item.id)) &&
                         item.nombre && 
                         item.nombre.trim().length > 0;
          
          if (!isValid) {
            console.warn(`⚠️ [SectorService] Sector ${index} no pasó validación:`, item);
          }
          
          return isValid;
        }
      },
      'sectores_cache'
    );
  }

  /**
   * Override para manejar la respuesta específica de la API
   */
  async getAll(): Promise<Sector[]> {
    try {
      console.log(`📡 [SectorService] GET - Obteniendo sectores desde: ${this.url}`);
      
      // Intentar cargar desde caché primero
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`💾 [SectorService] Usando ${cachedData.length} sectores del caché`);
        // Actualizar en background
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
      
      console.log(`📊 [SectorService] Respuesta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📦 [SectorService] Datos recibidos:`, data);
      
      // La API devuelve directamente un array
      if (!Array.isArray(data)) {
        console.error(`❌ [SectorService] La respuesta no es un array:`, data);
        throw new Error('La respuesta no es un array de sectores');
      }
      
      // Normalizar los datos
      const normalized = this.normalizeArray(data);
      
      // Guardar en caché
      if (normalized.length > 0) {
        this.saveToCache(normalized);
        console.log(`💾 [SectorService] ${normalized.length} sectores guardados en caché`);
      }
      
      return normalized;
      
    } catch (error: any) {
      console.error(`❌ [SectorService] Error en getAll:`, error);
      
      // Intentar usar caché como fallback
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log(`✅ [SectorService] Recuperados ${cachedData.length} sectores del caché`);
        return cachedData;
      }
      
      // Si no hay caché y hay error de red, usar datos de ejemplo
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        console.log(`📋 [SectorService] Sin conexión, usando datos de ejemplo`);
        return this.getDefaultSectors();
      }
      
      throw error;
    }
  }

  /**
   * Override create para enviar los datos en el formato que espera la API
   */
  async create(data: SectorFormData): Promise<Sector> {
    try {
      console.log(`📡 [SectorService] POST - Creando sector:`, data);
      
      // Transformar al formato que espera la API
      const apiData = {
        nombreSector: data.nombre,
        estado: data.estado || 1
      };
      
      console.log(`📤 [SectorService] Enviando a la API:`, apiData);
      
      const response = await this.makeRequest(this.url, {
        method: 'POST',
        body: JSON.stringify(apiData)
      });
      
      console.log(`📥 [SectorService] Respuesta de creación:`, response);
      
      // Manejar diferentes formatos de respuesta
      let sectorCreado: Sector;
      
      // Si la respuesta es directamente el sector creado
      if (response && typeof response === 'object') {
        // Caso 1: La respuesta tiene el formato esperado con codSector
        if (response.codSector !== undefined && response.codSector !== null) {
          sectorCreado = {
            id: Number(response.codSector),
            nombre: response.nombreSector || data.nombre,
            estado: response.estado !== undefined ? response.estado : 1
          };
        }
        // Caso 2: La respuesta tiene id en lugar de codSector
        else if (response.id !== undefined && response.id !== null) {
          sectorCreado = {
            id: Number(response.id),
            nombre: response.nombre || response.nombreSector || data.nombre,
            estado: response.estado !== undefined ? response.estado : 1
          };
        }
        // Caso 3: La respuesta es un mensaje de éxito sin el objeto
        else if (response.message || response.success) {
          console.log(`⚠️ [SectorService] La API no devolvió el sector creado, recargando lista`);
          // Limpiar caché y recargar para obtener el nuevo sector
          this.clearCache();
          // Crear un sector temporal con ID provisional
          sectorCreado = {
            id: Date.now(), // ID temporal
            nombre: data.nombre,
            estado: data.estado || 1
          };
        }
        // Caso 4: Respuesta inesperada
        else {
          console.error(`❌ [SectorService] Respuesta inesperada:`, response);
          throw new Error('La API devolvió una respuesta inesperada');
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      
      console.log(`✅ [SectorService] Sector creado:`, sectorCreado);
      return sectorCreado;
      
    } catch (error: any) {
      console.error(`❌ [SectorService] Error al crear:`, error);
      
      // Si el error es porque no puede normalizar, intentar crear un sector temporal
      if (error.message && error.message.includes('Sector sin codSector')) {
        console.log(`⚠️ [SectorService] Creando sector temporal`);
        const sectorTemporal: Sector = {
          id: Date.now(),
          nombre: data.nombre,
          estado: data.estado || 1
        };
        
        // Limpiar caché para forzar recarga
        this.clearCache();
        
        return sectorTemporal;
      }
      
      throw error;
    }
  }

  /**
   * Override update para enviar los datos en el formato correcto
   */
  async update(id: number, data: SectorFormData): Promise<Sector> {
    try {
      console.log(`📡 [SectorService] PUT - Actualizando sector ${id}:`, data);
      
      // Transformar al formato que espera la API
      const apiData = {
        codSector: id,
        nombreSector: data.nombre,
        estado: data.estado || 1
      };
      
      const response = await this.makeRequest(`${this.url}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiData)
      });
      
      const normalized = this.normalizeOptions.normalizeItem(response, 0);
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      
      console.log(`✅ [SectorService] Sector actualizado:`, normalized);
      return normalized;
      
    } catch (error) {
      console.error(`❌ [SectorService] Error al actualizar:`, error);
      throw error;
    }
  }

  /**
   * Actualiza los datos en background sin bloquear la UI
   */
  private async updateInBackground(): Promise<void> {
    try {
      console.log(`🔄 [SectorService] Actualizando datos en background...`);
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
            console.log(`✅ [SectorService] Caché actualizado en background`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ [SectorService] No se pudo actualizar en background:`, error);
    }
  }

  /**
   * Carga datos desde el caché local
   */
  private loadFromCache(): Sector[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      
      if (!parsedCache.data || !Array.isArray(parsedCache.data)) {
        return null;
      }
      
      // Verificar antigüedad (24 horas)
      const cacheAge = Date.now() - (parsedCache.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000;
      
      // Retornar los datos aunque estén viejos (se actualizarán en background)
      return parsedCache.data;
      
    } catch (error) {
      console.error(`❌ [SectorService] Error al leer caché:`, error);
      return null;
    }
  }

  /**
   * Guarda datos en el caché local
   */
  private saveToCache(data: Sector[]): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        count: data.length
      };
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      
    } catch (error) {
      console.error(`❌ [SectorService] Error al guardar caché:`, error);
    }
  }

  /**
   * Retorna sectores por defecto para desarrollo/demo
   */
  private getDefaultSectors(): Sector[] {
    return [
      { id: 1, nombre: 'CENTRO', estado: 1 },
      { id: 2, nombre: 'NORTE', estado: 1 },
      { id: 3, nombre: 'SUR', estado: 1 },
      { id: 4, nombre: 'ESTE', estado: 1 },
      { id: 5, nombre: 'OESTE', estado: 1 }
    ];
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    console.log(`🧹 [SectorService] Caché limpiado`);
  }
}

// Exportar instancia única
const sectorService = new SectorService();
export default sectorService;