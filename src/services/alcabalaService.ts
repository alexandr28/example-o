// src/services/alcabalaService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Alcabala
 */
export interface AlcabalaData {
  id: number;
  anio: number;
  tasa: number;
  descripcion?: string;
  baseImponible?: number;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateAlcabalaDTO {
  anio: number;
  tasa: number;
  descripcion?: string;
  baseImponible?: number;
  codUsuario?: number;
}

export interface UpdateAlcabalaDTO extends Partial<CreateAlcabalaDTO> {
  estado?: string;
}

export interface BusquedaAlcabalaParams {
  anio?: number;
  estado?: string;
  tasaMin?: number;
  tasaMax?: number;
  codUsuario?: number;
}

export interface AlcabalaApiResponse {
  codAlcabala?: number;
  anio: number;
  tasa: number;
  descripcion?: string;
  baseImponible?: number;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de Alcabala
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class AlcabalaService extends BaseApiService<AlcabalaData, CreateAlcabalaDTO, UpdateAlcabalaDTO> {
  private static instance: AlcabalaService;
  
  private constructor() {
    super(
      API_CONFIG.endpoints.alcabala,
      {
        normalizeItem: (item: any): AlcabalaData => {
          return {
            id: item.codAlcabala || item.id || 0,
            anio: item.anio || new Date().getFullYear(),
            tasa: parseFloat(item.tasa || '0'),
            descripcion: item.descripcion || '',
            baseImponible: parseFloat(item.baseImponible || '0'),
            estado: item.estado || 'ACTIVO',
            fechaRegistro: item.fechaRegistro,
            fechaModificacion: item.fechaModificacion,
            codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
          };
        },
        
        validateItem: (item: AlcabalaData) => {
          // Validar que tenga los campos requeridos
          return !!(item.anio && item.tasa >= 0);
        }
      }
    );
  }
  
  public static getInstance(): AlcabalaService {
    if (!AlcabalaService.instance) {
      AlcabalaService.instance = new AlcabalaService();
    }
    return AlcabalaService.instance;
  }
  
  /**
   * Obtiene todas las alcabalas
   * NO requiere autenticación (método GET)
   */
  async obtenerAlcabalas(): Promise<AlcabalaData[]> {
    try {
      console.log('📋 [AlcabalaService] Obteniendo todas las alcabalas');
      
      const data = await this.getAll();
      
      // Ordenar por año descendente
      const alcabalasOrdenadas = data.sort((a, b) => b.anio - a.anio);
      
      console.log(`✅ [AlcabalaService] ${alcabalasOrdenadas.length} alcabalas obtenidas`);
      return alcabalasOrdenadas;
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error obteniendo alcabalas:', error);
      
      // Si falla, devolver datos mock
      if (error.message?.includes('Network') || error.statusCode === 404) {
        console.log('🔄 [AlcabalaService] Usando datos mock');
        return this.obtenerAlcabalasMock();
      }
      
      throw error;
    }
  }
  
  /**
   * Busca alcabalas con filtros
   * NO requiere autenticación (método GET)
   */
  async buscarAlcabalas(params: BusquedaAlcabalaParams): Promise<AlcabalaData[]> {
    try {
      console.log('🔍 [AlcabalaService] Buscando alcabalas con parámetros:', params);
      
      const queryParams = new URLSearchParams();
      
      if (params.anio) {
        queryParams.append('anio', params.anio.toString());
      }
      if (params.estado) {
        queryParams.append('estado', params.estado);
      }
      if (params.tasaMin !== undefined) {
        queryParams.append('tasaMin', params.tasaMin.toString());
      }
      if (params.tasaMax !== undefined) {
        queryParams.append('tasaMax', params.tasaMax.toString());
      }
      
      const data = await this.search(queryParams);
      
      console.log(`✅ [AlcabalaService] ${data.length} alcabalas encontradas`);
      return data;
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error buscando alcabalas:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene alcabala por año
   * NO requiere autenticación (método GET)
   */
  async obtenerAlcabalaPorAnio(anio: number): Promise<AlcabalaData | null> {
    try {
      console.log('🔍 [AlcabalaService] Obteniendo alcabala del año:', anio);
      
      const alcabalas = await this.buscarAlcabalas({ anio });
      
      if (alcabalas.length > 0) {
        console.log('✅ [AlcabalaService] Alcabala encontrada:', alcabalas[0]);
        return alcabalas[0];
      }
      
      return null;
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error obteniendo alcabala por año:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva alcabala
   * REQUIERE autenticación (método POST)
   */
  async crearAlcabala(datos: CreateAlcabalaDTO): Promise<AlcabalaData> {
    try {
      console.log('➕ [AlcabalaService] Creando nueva alcabala:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear alcabalas');
      }
      
      // Verificar si ya existe alcabala para ese año
      const existente = await this.obtenerAlcabalaPorAnio(datos.anio);
      if (existente) {
        throw new Error(`Ya existe una alcabala registrada para el año ${datos.anio}`);
      }
      
      // Preparar datos con valores por defecto
      const datosCompletos: CreateAlcabalaDTO = {
        ...datos,
        descripcion: datos.descripcion || `Alcabala ${datos.anio}`,
        baseImponible: datos.baseImponible || 0,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      const nuevaAlcabala = await this.create(datosCompletos);
      
      console.log('✅ [AlcabalaService] Alcabala creada exitosamente');
      return nuevaAlcabala;
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error creando alcabala:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una alcabala existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarAlcabala(id: number, datos: UpdateAlcabalaDTO): Promise<AlcabalaData> {
    try {
      console.log('📝 [AlcabalaService] Actualizando alcabala:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar alcabalas');
      }
      
      // Si se está cambiando el año, verificar que no exista otra alcabala
      if (datos.anio) {
        const existente = await this.obtenerAlcabalaPorAnio(datos.anio);
        if (existente && existente.id !== id) {
          throw new Error(`Ya existe una alcabala registrada para el año ${datos.anio}`);
        }
      }
      
      const alcabalaActualizada = await this.update(id, datos);
      
      console.log('✅ [AlcabalaService] Alcabala actualizada exitosamente');
      return alcabalaActualizada;
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error actualizando alcabala:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una alcabala (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarAlcabala(id: number): Promise<void> {
    try {
      console.log('🗑️ [AlcabalaService] Eliminando alcabala:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar alcabalas');
      }
      
      // Cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [AlcabalaService] Alcabala marcada como inactiva');
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error eliminando alcabala:', error);
      throw error;
    }
  }
  
  /**
   * Reactiva una alcabala inactiva
   * REQUIERE autenticación (método PUT)
   */
  async reactivarAlcabala(id: number): Promise<AlcabalaData> {
    try {
      console.log('♻️ [AlcabalaService] Reactivando alcabala:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para reactivar alcabalas');
      }
      
      return await this.update(id, {
        estado: 'ACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error reactivando alcabala:', error);
      throw error;
    }
  }
  
  /**
   * Calcula el impuesto de alcabala
   * NO requiere autenticación (cálculo local)
   */
  calcularImpuesto(valorVenta: number, anio: number = new Date().getFullYear()): Promise<{
    valorVenta: number;
    tasa: number;
    impuesto: number;
    anio: number;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const alcabala = await this.obtenerAlcabalaPorAnio(anio);
        
        if (!alcabala) {
          throw new Error(`No se encontró tasa de alcabala para el año ${anio}`);
        }
        
        const impuesto = (valorVenta * alcabala.tasa) / 100;
        
        resolve({
          valorVenta,
          tasa: alcabala.tasa,
          impuesto: Math.round(impuesto * 100) / 100, // Redondear a 2 decimales
          anio
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Obtiene datos mock para desarrollo
   */
  private obtenerAlcabalasMock(): AlcabalaData[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: 1,
        anio: currentYear,
        tasa: 3.0,
        descripcion: `Alcabala ${currentYear}`,
        baseImponible: 10,
        estado: 'ACTIVO',
        fechaRegistro: new Date(currentYear, 0, 1).toISOString(),
        codUsuario: 1
      },
      {
        id: 2,
        anio: currentYear - 1,
        tasa: 3.0,
        descripcion: `Alcabala ${currentYear - 1}`,
        baseImponible: 10,
        estado: 'ACTIVO',
        fechaRegistro: new Date(currentYear - 1, 0, 1).toISOString(),
        codUsuario: 1
      },
      {
        id: 3,
        anio: currentYear - 2,
        tasa: 2.5,
        descripcion: `Alcabala ${currentYear - 2}`,
        baseImponible: 10,
        estado: 'ACTIVO',
        fechaRegistro: new Date(currentYear - 2, 0, 1).toISOString(),
        codUsuario: 1
      },
      {
        id: 4,
        anio: currentYear - 3,
        tasa: 2.5,
        descripcion: `Alcabala ${currentYear - 3}`,
        baseImponible: 10,
        estado: 'INACTIVO',
        fechaRegistro: new Date(currentYear - 3, 0, 1).toISOString(),
        codUsuario: 1
      }
    ];
  }
  
  /**
   * Obtiene estadísticas de alcabala
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(): Promise<{
    totalRegistros: number;
    tasaPromedio: number;
    tasaActual: number;
    anioMayor: number;
    anioMenor: number;
  }> {
    try {
      const alcabalas = await this.obtenerAlcabalas();
      const activas = alcabalas.filter(a => a.estado === 'ACTIVO');
      
      const estadisticas = {
        totalRegistros: alcabalas.length,
        tasaPromedio: activas.length > 0 
          ? activas.reduce((sum, a) => sum + a.tasa, 0) / activas.length 
          : 0,
        tasaActual: 0,
        anioMayor: 0,
        anioMenor: 0
      };
      
      if (alcabalas.length > 0) {
        // Obtener tasa actual
        const anioActual = new Date().getFullYear();
        const alcabalaActual = alcabalas.find(a => a.anio === anioActual);
        estadisticas.tasaActual = alcabalaActual?.tasa || 0;
        
        // Obtener rango de años
        const anios = alcabalas.map(a => a.anio);
        estadisticas.anioMayor = Math.max(...anios);
        estadisticas.anioMenor = Math.min(...anios);
      }
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [AlcabalaService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const alcabalaService = AlcabalaService.getInstance();