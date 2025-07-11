// src/services/uitService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para UIT (Unidad Impositiva Tributaria)
 */
export interface UITData {
  id: number;
  año: number;
  valor: number;
  resolucion?: string;
  fechaPublicacion?: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  observaciones?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateUITDTO {
  año: number;
  valor: number;
  resolucion?: string;
  fechaPublicacion?: string;
  fechaVigenciaDesde?: string;
  observaciones?: string;
  codUsuario?: number;
}

export interface UpdateUITDTO extends Partial<CreateUITDTO> {
  fechaVigenciaHasta?: string;
  estado?: string;
}

export interface BusquedaUITParams {
  año?: number;
  vigente?: boolean;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de valores UIT
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class UITService extends BaseApiService<UITData, CreateUITDTO, UpdateUITDTO> {
  private static instance: UITService;
  
  private constructor() {
    super(
      '/api/uitEpa',
      {
        normalizeItem: (item: any) => ({
          id: item.codUitEpa || item.id || 0,
          año: item.anio || item.año || new Date().getFullYear(),
          valor: parseFloat(item.valor || '0'),
          resolucion: item.resolucion || '',
          fechaPublicacion: item.fechaPublicacion,
          fechaVigenciaDesde: item.fechaVigenciaDesde || 
            `${item.anio || new Date().getFullYear()}-01-01`,
          fechaVigenciaHasta: item.fechaVigenciaHasta,
          observaciones: item.observaciones || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: UITData) => {
          // Validar que tenga los campos requeridos
          return !!(
            item.id && 
            item.año > 1990 && 
            item.año <= 2100 && 
            item.valor > 0
          );
        }
      },
      'uit'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): UITService {
    if (!UITService.instance) {
      UITService.instance = new UITService();
    }
    return UITService.instance;
  }
  
  /**
   * Lista todos los valores UIT
   * NO requiere autenticación (método GET)
   */
  async listarUITs(incluirInactivos: boolean = false): Promise<UITData[]> {
    try {
      console.log('🔍 [UITService] Listando valores UIT');
      
      const uits = await this.getAll();
      
      // Filtrar por estado si es necesario
      if (!incluirInactivos) {
        return uits.filter(u => u.estado === 'ACTIVO');
      }
      
      // Ordenar por año descendente
      return uits.sort((a, b) => b.año - a.año);
      
    } catch (error: any) {
      console.error('❌ [UITService] Error listando UITs:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el valor UIT para un año específico
   * NO requiere autenticación (método GET)
   */
  async obtenerPorAño(año: number): Promise<UITData | null> {
    try {
      console.log('🔍 [UITService] Obteniendo UIT del año:', año);
      
      const uits = await this.search({ año });
      
      // Buscar el más reciente para ese año
      const uitDelAño = uits
        .filter(u => u.año === año)
        .sort((a, b) => {
          // Ordenar por fecha de vigencia descendente
          const fechaA = new Date(a.fechaVigenciaDesde).getTime();
          const fechaB = new Date(b.fechaVigenciaDesde).getTime();
          return fechaB - fechaA;
        })[0];
      
      return uitDelAño || null;
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo UIT por año:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el valor UIT vigente a una fecha específica
   * NO requiere autenticación (método GET)
   */
  async obtenerVigente(fecha: Date = new Date()): Promise<UITData | null> {
    try {
      console.log('🔍 [UITService] Obteniendo UIT vigente a:', fecha);
      
      const uits = await this.listarUITs();
      const fechaTime = fecha.getTime();
      
      // Buscar UIT vigente a la fecha
      const uitVigente = uits.find(uit => {
        const vigenciaDesde = new Date(uit.fechaVigenciaDesde).getTime();
        const vigenciaHasta = uit.fechaVigenciaHasta ? 
          new Date(uit.fechaVigenciaHasta).getTime() : 
          Infinity;
        
        return fechaTime >= vigenciaDesde && fechaTime < vigenciaHasta;
      });
      
      if (!uitVigente) {
        // Si no hay vigente, buscar por año
        return await this.obtenerPorAño(fecha.getFullYear());
      }
      
      return uitVigente;
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo UIT vigente:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el historial de valores UIT
   * NO requiere autenticación (método GET)
   */
  async obtenerHistorial(
    añoInicio?: number, 
    añoFin?: number
  ): Promise<UITData[]> {
    try {
      console.log('🔍 [UITService] Obteniendo historial de UITs');
      
      let uits = await this.listarUITs();
      
      // Filtrar por rango de años si se especifica
      if (añoInicio) {
        uits = uits.filter(u => u.año >= añoInicio);
      }
      if (añoFin) {
        uits = uits.filter(u => u.año <= añoFin);
      }
      
      // Ordenar por año descendente
      return uits.sort((a, b) => b.año - a.año);
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo historial:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si ya existe un valor UIT para un año
   * NO requiere autenticación (método GET)
   */
  async verificarAñoExiste(año: number, excluirId?: number): Promise<boolean> {
    try {
      const uits = await this.search({ año });
      
      if (excluirId) {
        return uits.some(u => u.año === año && u.id !== excluirId);
      }
      
      return uits.some(u => u.año === año);
      
    } catch (error: any) {
      console.error('❌ [UITService] Error verificando año:', error);
      return false;
    }
  }
  
  /**
   * Crea un nuevo valor UIT
   * REQUIERE autenticación (método POST)
   */
  async crearUIT(datos: CreateUITDTO): Promise<UITData> {
    try {
      console.log('➕ [UITService] Creando valor UIT:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear valores UIT');
      }
      
      // Validar datos
      if (!datos.año || datos.año < 1990 || datos.año > 2100) {
        throw new Error('El año debe estar entre 1990 y 2100');
      }
      
      if (!datos.valor || datos.valor <= 0) {
        throw new Error('El valor UIT debe ser mayor a 0');
      }
      
      // Verificar si ya existe para ese año
      const existe = await this.verificarAñoExiste(datos.año);
      if (existe) {
        throw new Error(`Ya existe un valor UIT para el año ${datos.año}`);
      }
      
      // Cerrar vigencia del anterior si existe
      const anteriorAño = datos.año - 1;
      const uitAnterior = await this.obtenerPorAño(anteriorAño);
      if (uitAnterior && !uitAnterior.fechaVigenciaHasta) {
        await this.update(uitAnterior.id, {
          fechaVigenciaHasta: `${anteriorAño}-12-31`,
          fechaModificacion: new Date().toISOString()
        });
      }
      
      const datosCompletos = {
        ...datos,
        fechaVigenciaDesde: datos.fechaVigenciaDesde || `${datos.año}-01-01`,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [UITService] Error creando UIT:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un valor UIT existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarUIT(id: number, datos: UpdateUITDTO): Promise<UITData> {
    try {
      console.log('📝 [UITService] Actualizando UIT:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar valores UIT');
      }
      
      // Obtener UIT actual
      const uitActual = await this.getById(id);
      if (!uitActual) {
        throw new Error('Valor UIT no encontrado');
      }
      
      // Validaciones
      if (datos.año) {
        if (datos.año < 1990 || datos.año > 2100) {
          throw new Error('El año debe estar entre 1990 y 2100');
        }
        
        // Verificar si el nuevo año ya existe
        const existe = await this.verificarAñoExiste(datos.año, id);
        if (existe) {
          throw new Error(`Ya existe otro valor UIT para el año ${datos.año}`);
        }
      }
      
      if (datos.valor !== undefined && datos.valor <= 0) {
        throw new Error('El valor UIT debe ser mayor a 0');
      }
      
      const datosCompletos = {
        ...datos,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(id, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [UITService] Error actualizando UIT:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un valor UIT (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarUIT(id: number): Promise<void> {
    try {
      console.log('🗑️ [UITService] Eliminando UIT:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar valores UIT');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        fechaVigenciaHasta: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [UITService] UIT marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [UITService] Error eliminando UIT:', error);
      throw error;
    }
  }
  
  /**
   * Calcula un monto en base a UITs
   * NO requiere autenticación (cálculo local)
   */
  async calcularMontoUIT(
    cantidadUITs: number, 
    año?: number
  ): Promise<{ valor: number; uitUsado: UITData }> {
    try {
      let uit: UITData | null;
      
      if (año) {
        uit = await this.obtenerPorAño(año);
      } else {
        uit = await this.obtenerVigente();
      }
      
      if (!uit) {
        throw new Error('No se encontró valor UIT para el cálculo');
      }
      
      const valor = cantidadUITs * uit.valor;
      
      console.log(`💰 [UITService] ${cantidadUITs} UITs = S/. ${valor.toFixed(2)}`);
      
      return { valor, uitUsado: uit };
      
    } catch (error: any) {
      console.error('❌ [UITService] Error calculando monto:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de valores UIT
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    uitActual: UITData | null;
    promedioUltimos5Años: number;
    incrementoAnual: number;
  }> {
    try {
      const uits = await this.getAll();
      const uitActual = await this.obtenerVigente();
      const añoActual = new Date().getFullYear();
      
      // UITs de los últimos 5 años
      const ultimos5Años = uits
        .filter(u => u.año >= añoActual - 5 && u.año < añoActual)
        .sort((a, b) => b.año - a.año);
      
      // Calcular promedio
      const promedioUltimos5Años = ultimos5Años.length > 0
        ? ultimos5Años.reduce((sum, u) => sum + u.valor, 0) / ultimos5Años.length
        : 0;
      
      // Calcular incremento anual promedio
      let incrementoAnual = 0;
      if (ultimos5Años.length > 1) {
        const incrementos = [];
        for (let i = 0; i < ultimos5Años.length - 1; i++) {
          const actual = ultimos5Años[i];
          const anterior = ultimos5Años[i + 1];
          const incremento = ((actual.valor - anterior.valor) / anterior.valor) * 100;
          incrementos.push(incremento);
        }
        incrementoAnual = incrementos.reduce((sum, inc) => sum + inc, 0) / incrementos.length;
      }
      
      return {
        total: uits.length,
        activos: uits.filter(u => u.estado === 'ACTIVO').length,
        inactivos: uits.filter(u => u.estado === 'INACTIVO').length,
        uitActual,
        promedioUltimos5Años,
        incrementoAnual
      };
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const uitService = UITService.getInstance();

// Exportar también la clase por si se necesita extender
export default UITService;