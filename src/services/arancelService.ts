// src/services/arancelService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Arancel
 */
export interface ArancelData {
  id: number;
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  costoUnitario: number;
  categoria?: string;
  subcategoria?: string;
  estado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateArancelDTO {
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  costoUnitario: number;
  categoria?: string;
  subcategoria?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  codUsuario?: number;
}

export interface UpdateArancelDTO extends Partial<CreateArancelDTO> {
  estado?: string;
}

export interface BusquedaArancelParams {
  codigo?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  estado?: string;
  vigente?: boolean;
  codUsuario?: number;
}

// Unidades de medida comunes
export const UNIDADES_MEDIDA = {
  METRO_CUADRADO: 'M2',
  METRO_LINEAL: 'ML',
  UNIDAD: 'UND',
  GLOBAL: 'GLB',
  METRO_CUBICO: 'M3',
  KILOGRAMO: 'KG',
  LITRO: 'LT',
  HORA: 'HR'
} as const;

// Categorías de aranceles
export const CATEGORIAS_ARANCEL = {
  CONSTRUCCION: 'CONSTRUCCION',
  INSTALACIONES: 'INSTALACIONES',
  ACABADOS: 'ACABADOS',
  SERVICIOS: 'SERVICIOS',
  OTROS: 'OTROS'
} as const;

/**
 * Servicio para gestión de aranceles
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class ArancelService extends BaseApiService<ArancelData, CreateArancelDTO, UpdateArancelDTO> {
  private static instance: ArancelService;
  
  private constructor() {
    super(
      '/api/arancel',
      {
        normalizeItem: (item: any) => ({
          id: item.idArancel || item.id || 0,
          codigo: item.codigo || item.codigoArancel || '',
          descripcion: item.descripcion || '',
          unidadMedida: item.unidadMedida || UNIDADES_MEDIDA.UNIDAD,
          costoUnitario: parseFloat(item.costoUnitario || '0'),
          categoria: item.categoria || CATEGORIAS_ARANCEL.OTROS,
          subcategoria: item.subcategoria || '',
          estado: item.estado || 'ACTIVO',
          vigenciaDesde: item.vigenciaDesde || new Date().toISOString(),
          vigenciaHasta: item.vigenciaHasta,
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: ArancelData) => {
          // Validar que tenga los campos requeridos
          return !!(
            item.id && 
            item.codigo && 
            item.descripcion && 
            item.unidadMedida && 
            item.costoUnitario >= 0
          );
        }
      },
      'arancel'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }
  
  /**
   * Lista todos los aranceles
   * NO requiere autenticación (método GET)
   */
  async listarAranceles(incluirInactivos: boolean = false): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles');
      
      const aranceles = await this.getAll();
      
      // Filtrar por estado si es necesario
      if (!incluirInactivos) {
        return aranceles.filter(a => a.estado === 'ACTIVO');
      }
      
      return aranceles;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error listando aranceles:', error);
      throw error;
    }
  }
  
  /**
   * Lista aranceles vigentes a una fecha específica
   * NO requiere autenticación (método GET)
   */
  async listarVigentes(fecha: Date = new Date()): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles vigentes a:', fecha);
      
      const aranceles = await this.listarAranceles();
      const fechaStr = fecha.toISOString();
      
      return aranceles.filter(arancel => {
        const vigenciaDesde = new Date(arancel.vigenciaDesde || '').getTime();
        const vigenciaHasta = arancel.vigenciaHasta ? 
          new Date(arancel.vigenciaHasta).getTime() : 
          Infinity;
        const fechaActual = fecha.getTime();
        
        return fechaActual >= vigenciaDesde && fechaActual <= vigenciaHasta;
      });
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error listando aranceles vigentes:', error);
      throw error;
    }
  }
  
  /**
   * Busca aranceles por diferentes criterios
   * NO requiere autenticación (método GET)
   */
  async buscarAranceles(criterios: BusquedaArancelParams): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Buscando aranceles:', criterios);
      
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      let aranceles = await this.search(params);
      
      // Filtrar por vigencia si se especifica
      if (criterios.vigente !== undefined) {
        const ahora = new Date();
        aranceles = aranceles.filter(arancel => {
          const esVigente = this.esVigente(arancel, ahora);
          return criterios.vigente ? esVigente : !esVigente;
        });
      }
      
      return aranceles;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error buscando aranceles:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un arancel por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigo(codigo: string): Promise<ArancelData | null> {
    try {
      console.log('🔍 [ArancelService] Obteniendo arancel por código:', codigo);
      
      const aranceles = await this.search({ codigo });
      return aranceles.length > 0 ? aranceles[0] : null;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error obteniendo arancel:', error);
      throw error;
    }
  }
  
  /**
   * Lista aranceles por categoría
   * NO requiere autenticación (método GET)
   */
  async listarPorCategoria(
    categoria: string, 
    subcategoria?: string
  ): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles por categoría:', categoria, subcategoria);
      
      const params: BusquedaArancelParams = { categoria };
      if (subcategoria) {
        params.subcategoria = subcategoria;
      }
      
      return await this.buscarAranceles(params);
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error listando por categoría:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un arancel es vigente a una fecha
   */
  private esVigente(arancel: ArancelData, fecha: Date = new Date()): boolean {
    const vigenciaDesde = new Date(arancel.vigenciaDesde || '').getTime();
    const vigenciaHasta = arancel.vigenciaHasta ? 
      new Date(arancel.vigenciaHasta).getTime() : 
      Infinity;
    const fechaActual = fecha.getTime();
    
    return fechaActual >= vigenciaDesde && fechaActual <= vigenciaHasta;
  }
  
  /**
   * Verifica si un código de arancel ya existe
   * NO requiere autenticación (método GET)
   */
  async verificarCodigoExiste(codigo: string, excluirId?: number): Promise<boolean> {
    try {
      const aranceles = await this.search({ codigo });
      
      if (excluirId) {
        return aranceles.some(a => 
          a.codigo.toLowerCase() === codigo.toLowerCase() && 
          a.id !== excluirId
        );
      }
      
      return aranceles.some(a => a.codigo.toLowerCase() === codigo.toLowerCase());
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error verificando código:', error);
      return false;
    }
  }
  
  /**
   * Crea un nuevo arancel
   * REQUIERE autenticación (método POST)
   */
  async crearArancel(datos: CreateArancelDTO): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando arancel:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear aranceles');
      }
      
      // Validar datos
      if (!datos.codigo || datos.codigo.trim().length < 2) {
        throw new Error('El código del arancel debe tener al menos 2 caracteres');
      }
      
      if (!datos.descripcion || datos.descripcion.trim().length < 5) {
        throw new Error('La descripción debe tener al menos 5 caracteres');
      }
      
      if (datos.costoUnitario < 0) {
        throw new Error('El costo unitario no puede ser negativo');
      }
      
      // Verificar si el código ya existe
      const existe = await this.verificarCodigoExiste(datos.codigo);
      if (existe) {
        throw new Error('Ya existe un arancel con ese código');
      }
      
      const datosCompletos = {
        ...datos,
        codigo: datos.codigo.trim().toUpperCase(),
        descripcion: datos.descripcion.trim(),
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        vigenciaDesde: datos.vigenciaDesde || new Date().toISOString(),
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error creando arancel:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un arancel existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarArancel(id: number, datos: UpdateArancelDTO): Promise<ArancelData> {
    try {
      console.log('📝 [ArancelService] Actualizando arancel:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar aranceles');
      }
      
      // Validaciones
      if (datos.codigo) {
        if (datos.codigo.trim().length < 2) {
          throw new Error('El código del arancel debe tener al menos 2 caracteres');
        }
        
        // Verificar si el nuevo código ya existe
        const existe = await this.verificarCodigoExiste(datos.codigo, id);
        if (existe) {
          throw new Error('Ya existe otro arancel con ese código');
        }
      }
      
      if (datos.descripcion && datos.descripcion.trim().length < 5) {
        throw new Error('La descripción debe tener al menos 5 caracteres');
      }
      
      if (datos.costoUnitario !== undefined && datos.costoUnitario < 0) {
        throw new Error('El costo unitario no puede ser negativo');
      }
      
      const datosCompletos = {
        ...datos,
        codigo: datos.codigo ? datos.codigo.trim().toUpperCase() : undefined,
        descripcion: datos.descripcion ? datos.descripcion.trim() : undefined,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(id, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error actualizando arancel:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un arancel (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarArancel(id: number): Promise<void> {
    try {
      console.log('🗑️ [ArancelService] Eliminando arancel:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar aranceles');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        vigenciaHasta: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [ArancelService] Arancel marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error eliminando arancel:', error);
      throw error;
    }
  }
  
  /**
   * Reactiva un arancel inactivo
   * REQUIERE autenticación (método PUT)
   */
  async reactivarArancel(id: number): Promise<ArancelData> {
    try {
      console.log('♻️ [ArancelService] Reactivando arancel:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para reactivar aranceles');
      }
      
      return await this.update(id, {
        estado: 'ACTIVO',
        vigenciaDesde: new Date().toISOString(),
        vigenciaHasta: undefined,
        fechaModificacion: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error reactivando arancel:', error);
      throw error;
    }
  }
  
  /**
   * Duplica un arancel existente con nuevo código
   * REQUIERE autenticación (método POST)
   */
  async duplicarArancel(id: number, nuevoCodigo: string): Promise<ArancelData> {
    try {
      console.log('📋 [ArancelService] Duplicando arancel:', id, 'con código:', nuevoCodigo);
      
      // Obtener arancel original
      const original = await this.getById(id);
      if (!original) {
        throw new Error('Arancel original no encontrado');
      }
      
      // Crear copia con nuevo código
      const nuevoArancel: CreateArancelDTO = {
        codigo: nuevoCodigo,
        descripcion: `${original.descripcion} (COPIA)`,
        unidadMedida: original.unidadMedida,
        costoUnitario: original.costoUnitario,
        categoria: original.categoria,
        subcategoria: original.subcategoria,
        vigenciaDesde: new Date().toISOString()
      };
      
      return await this.crearArancel(nuevoArancel);
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error duplicando arancel:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de aranceles
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    vigentes: number;
    porCategoria: { [key: string]: number };
    costoPromedio: number;
  }> {
    try {
      const aranceles = await this.getAll();
      const ahora = new Date();
      
      const estadisticas = {
        total: aranceles.length,
        activos: aranceles.filter(a => a.estado === 'ACTIVO').length,
        inactivos: aranceles.filter(a => a.estado === 'INACTIVO').length,
        vigentes: aranceles.filter(a => this.esVigente(a, ahora)).length,
        porCategoria: {} as { [key: string]: number },
        costoPromedio: 0
      };
      
      // Agrupar por categoría
      aranceles.forEach(arancel => {
        const categoria = arancel.categoria || 'SIN CATEGORIA';
        estadisticas.porCategoria[categoria] = 
          (estadisticas.porCategoria[categoria] || 0) + 1;
      });
      
      // Calcular costo promedio
      if (aranceles.length > 0) {
        const sumaCostos = aranceles.reduce((sum, a) => sum + a.costoUnitario, 0);
        estadisticas.costoPromedio = sumaCostos / aranceles.length;
      }
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const arancelService = ArancelService.getInstance();

// Exportar también la clase por si se necesita extender
export default ArancelService;