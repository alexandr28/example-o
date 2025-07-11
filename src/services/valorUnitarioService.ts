// src/services/valorUnitarioService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Valor Unitario
 */
export interface ValorUnitarioData {
  id: number;
  año: number;
  categoria: string;
  subcategoria: string;
  letra: string;
  costo: number;
  descripcionCategoria?: string;
  descripcionSubcategoria?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateValorUnitarioDTO {
  año: number;
  categoria: string;
  subcategoria: string;
  letra: string;
  costo: number;
  codUsuario?: number;
}

export interface UpdateValorUnitarioDTO extends Partial<CreateValorUnitarioDTO> {
  estado?: string;
}

export interface BusquedaValorUnitarioParams {
  año?: number;
  categoria?: string;
  subcategoria?: string;
  letra?: string;
  estado?: string;
  codUsuario?: number;
}

// Enums para categorías
export enum CategoriaValorUnitario {
  ESTRUCTURAS = 'ESTRUCTURAS',
  ACABADOS = 'ACABADOS',
  INSTALACIONES = 'INSTALACIONES'
}

// Enums para subcategorías
export enum SubcategoriaValorUnitario {
  MUROS_Y_COLUMNAS = 'MUROS_Y_COLUMNAS',
  TECHOS = 'TECHOS',
  PISOS = 'PISOS',
  PUERTAS_Y_VENTANAS = 'PUERTAS_Y_VENTANAS',
  REVESTIMIENTOS = 'REVESTIMIENTOS',
  BANOS = 'BANOS',
  INSTALACIONES_ELECTRICAS_Y_SANITARIAS = 'INSTALACIONES_ELECTRICAS_Y_SANITARIAS'
}

// Enums para letras
export enum LetraValorUnitario {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I'
}

// Mapeo de subcategorías por categoría
export const SUBCATEGORIAS_POR_CATEGORIA = {
  [CategoriaValorUnitario.ESTRUCTURAS]: [
    SubcategoriaValorUnitario.MUROS_Y_COLUMNAS,
    SubcategoriaValorUnitario.TECHOS,
    SubcategoriaValorUnitario.PISOS
  ],
  [CategoriaValorUnitario.ACABADOS]: [
    SubcategoriaValorUnitario.PUERTAS_Y_VENTANAS,
    SubcategoriaValorUnitario.REVESTIMIENTOS,
    SubcategoriaValorUnitario.BANOS
  ],
  [CategoriaValorUnitario.INSTALACIONES]: [
    SubcategoriaValorUnitario.INSTALACIONES_ELECTRICAS_Y_SANITARIAS
  ]
};

/**
 * Servicio para gestión de valores unitarios
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class ValorUnitarioService extends BaseApiService<ValorUnitarioData, CreateValorUnitarioDTO, UpdateValorUnitarioDTO> {
  private static instance: ValorUnitarioService;
  
  private constructor() {
    super(
      '/api/valoresunitarios',
      {
        normalizeItem: (item: any) => ({
          id: item.codValorUnitario || item.id || 0,
          año: item.anio || item.año || new Date().getFullYear(),
          categoria: item.codCategoria || item.categoria || '',
          subcategoria: item.codSubcategoria || item.subcategoria || '',
          letra: item.letra || item.codLetra || 'A',
          costo: parseFloat(item.costo || '0'),
          descripcionCategoria: item.descripcionCategoria || 
            ValorUnitarioService.obtenerDescripcionCategoria(item.codCategoria || item.categoria),
          descripcionSubcategoria: item.descripcionSubcategoria || 
            ValorUnitarioService.obtenerDescripcionSubcategoria(item.codSubcategoria || item.subcategoria),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: ValorUnitarioData) => {
          // Validar que tenga los campos requeridos
          return !!(
            item.id && 
            item.año > 1990 && 
            item.año <= 2100 && 
            item.categoria && 
            item.subcategoria && 
            item.letra && 
            item.costo >= 0
          );
        }
      },
      'valor_unitario'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ValorUnitarioService {
    if (!ValorUnitarioService.instance) {
      ValorUnitarioService.instance = new ValorUnitarioService();
    }
    return ValorUnitarioService.instance;
  }
  
  /**
   * Obtiene la descripción de una categoría
   */
  private static obtenerDescripcionCategoria(categoria: string): string {
    const descripciones: Record<string, string> = {
      'ESTRUCTURAS': 'Estructuras',
      'ACABADOS': 'Acabados',
      'INSTALACIONES': 'Instalaciones'
    };
    return descripciones[categoria] || categoria;
  }
  
  /**
   * Obtiene la descripción de una subcategoría
   */
  private static obtenerDescripcionSubcategoria(subcategoria: string): string {
    const descripciones: Record<string, string> = {
      'MUROS_Y_COLUMNAS': 'Muros y Columnas',
      'TECHOS': 'Techos',
      'PISOS': 'Pisos',
      'PUERTAS_Y_VENTANAS': 'Puertas y Ventanas',
      'REVESTIMIENTOS': 'Revestimientos',
      'BANOS': 'Baños',
      'INSTALACIONES_ELECTRICAS_Y_SANITARIAS': 'Instalaciones Eléctricas y Sanitarias'
    };
    return descripciones[subcategoria] || subcategoria;
  }
  
  /**
   * Lista todos los valores unitarios
   * NO requiere autenticación (método GET)
   */
  async listarValoresUnitarios(incluirInactivos: boolean = false): Promise<ValorUnitarioData[]> {
    try {
      console.log('🔍 [ValorUnitarioService] Listando valores unitarios');
      
      const valores = await this.getAll();
      
      if (!incluirInactivos) {
        return valores.filter(v => v.estado === 'ACTIVO');
      }
      
      return valores;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error listando valores unitarios:', error);
      throw error;
    }
  }
  
  /**
   * Lista valores unitarios por año
   * NO requiere autenticación (método GET)
   */
  async listarPorAño(año: number): Promise<ValorUnitarioData[]> {
    try {
      console.log('🔍 [ValorUnitarioService] Listando valores unitarios del año:', año);
      
      return await this.search({ año });
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error listando por año:', error);
      throw error;
    }
  }
  
  /**
   * Busca valores unitarios por criterios
   * NO requiere autenticación (método GET)
   */
  async buscarValoresUnitarios(criterios: BusquedaValorUnitarioParams): Promise<ValorUnitarioData[]> {
    try {
      console.log('🔍 [ValorUnitarioService] Buscando valores unitarios:', criterios);
      
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error buscando valores unitarios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un valor unitario específico
   * NO requiere autenticación (método GET)
   */
  async obtenerValorUnitario(
    año: number,
    categoria: string,
    subcategoria: string,
    letra: string
  ): Promise<ValorUnitarioData | null> {
    try {
      console.log('🔍 [ValorUnitarioService] Obteniendo valor unitario específico');
      
      const valores = await this.buscarValoresUnitarios({
        año,
        categoria,
        subcategoria,
        letra
      });
      
      return valores.length > 0 ? valores[0] : null;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error obteniendo valor unitario:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene valores agrupados por categoría para un año
   * NO requiere autenticación (método GET)
   */
  async obtenerValoresPorCategoria(año: number): Promise<Record<string, Record<string, Record<string, number>>>> {
    try {
      console.log('🔍 [ValorUnitarioService] Obteniendo valores por categoría del año:', año);
      
      const valores = await this.listarPorAño(año);
      const resultado: Record<string, Record<string, Record<string, number>>> = {};
      
      // Inicializar estructura
      Object.values(CategoriaValorUnitario).forEach(categoria => {
        resultado[categoria] = {};
        const subcategorias = SUBCATEGORIAS_POR_CATEGORIA[categoria] || [];
        
        subcategorias.forEach(subcategoria => {
          resultado[categoria][subcategoria] = {};
          Object.values(LetraValorUnitario).forEach(letra => {
            resultado[categoria][subcategoria][letra] = 0;
          });
        });
      });
      
      // Poblar con datos reales
      valores.forEach(valor => {
        if (resultado[valor.categoria] && 
            resultado[valor.categoria][valor.subcategoria]) {
          resultado[valor.categoria][valor.subcategoria][valor.letra] = valor.costo;
        }
      });
      
      return resultado;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error obteniendo valores por categoría:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si ya existe un valor unitario
   * NO requiere autenticación (método GET)
   */
  async verificarExiste(
    año: number,
    categoria: string,
    subcategoria: string,
    letra: string,
    excluirId?: number
  ): Promise<boolean> {
    try {
      const valores = await this.buscarValoresUnitarios({
        año,
        categoria,
        subcategoria,
        letra
      });
      
      if (excluirId) {
        return valores.some(v => v.id !== excluirId);
      }
      
      return valores.length > 0;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error verificando existencia:', error);
      return false;
    }
  }
  
  /**
   * Crea un nuevo valor unitario
   * REQUIERE autenticación (método POST)
   */
  async crearValorUnitario(datos: CreateValorUnitarioDTO): Promise<ValorUnitarioData> {
    try {
      console.log('➕ [ValorUnitarioService] Creando valor unitario:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear valores unitarios');
      }
      
      // Validar datos
      if (!datos.año || datos.año < 1990 || datos.año > 2100) {
        throw new Error('El año debe estar entre 1990 y 2100');
      }
      
      if (datos.costo < 0) {
        throw new Error('El costo no puede ser negativo');
      }
      
      // Verificar si ya existe
      const existe = await this.verificarExiste(
        datos.año,
        datos.categoria,
        datos.subcategoria,
        datos.letra
      );
      
      if (existe) {
        throw new Error('Ya existe un valor unitario con esas características');
      }
      
      const datosCompletos = {
        ...datos,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error creando valor unitario:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un valor unitario existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarValorUnitario(id: number, datos: UpdateValorUnitarioDTO): Promise<ValorUnitarioData> {
    try {
      console.log('📝 [ValorUnitarioService] Actualizando valor unitario:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar valores unitarios');
      }
      
      // Obtener valor actual
      const valorActual = await this.getById(id);
      if (!valorActual) {
        throw new Error('Valor unitario no encontrado');
      }
      
      // Validaciones
      if (datos.año !== undefined && (datos.año < 1990 || datos.año > 2100)) {
        throw new Error('El año debe estar entre 1990 y 2100');
      }
      
      if (datos.costo !== undefined && datos.costo < 0) {
        throw new Error('El costo no puede ser negativo');
      }
      
      // Si se están cambiando las características, verificar duplicados
      if (datos.año || datos.categoria || datos.subcategoria || datos.letra) {
        const existe = await this.verificarExiste(
          datos.año || valorActual.año,
          datos.categoria || valorActual.categoria,
          datos.subcategoria || valorActual.subcategoria,
          datos.letra || valorActual.letra,
          id
        );
        
        if (existe) {
          throw new Error('Ya existe otro valor unitario con esas características');
        }
      }
      
      const datosCompletos = {
        ...datos,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(id, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error actualizando valor unitario:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un valor unitario (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarValorUnitario(id: number): Promise<void> {
    try {
      console.log('🗑️ [ValorUnitarioService] Eliminando valor unitario:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar valores unitarios');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [ValorUnitarioService] Valor unitario marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error eliminando valor unitario:', error);
      throw error;
    }
  }
  
  /**
   * Elimina todos los valores unitarios de un año
   * REQUIERE autenticación (método PUT)
   */
  async eliminarPorAño(año: number): Promise<number> {
    try {
      console.log('🗑️ [ValorUnitarioService] Eliminando valores unitarios del año:', año);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar valores unitarios');
      }
      
      const valores = await this.listarPorAño(año);
      let eliminados = 0;
      
      for (const valor of valores) {
        if (valor.estado === 'ACTIVO') {
          await this.eliminarValorUnitario(valor.id);
          eliminados++;
        }
      }
      
      console.log(`✅ [ValorUnitarioService] ${eliminados} valores eliminados del año ${año}`);
      return eliminados;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error eliminando por año:', error);
      throw error;
    }
  }
  
  /**
   * Copia valores unitarios de un año a otro
   * REQUIERE autenticación (método POST)
   */
  async copiarValoresDeAño(añoOrigen: number, añoDestino: number): Promise<number> {
    try {
      console.log(`📋 [ValorUnitarioService] Copiando valores del año ${añoOrigen} al ${añoDestino}`);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para copiar valores unitarios');
      }
      
      // Verificar que no existan valores en el año destino
      const valoresDestino = await this.listarPorAño(añoDestino);
      if (valoresDestino.length > 0) {
        throw new Error(`Ya existen valores unitarios para el año ${añoDestino}`);
      }
      
      // Obtener valores del año origen
      const valoresOrigen = await this.listarPorAño(añoOrigen);
      if (valoresOrigen.length === 0) {
        throw new Error(`No hay valores unitarios en el año ${añoOrigen} para copiar`);
      }
      
      let copiados = 0;
      
      // Copiar cada valor
      for (const valor of valoresOrigen) {
        await this.crearValorUnitario({
          año: añoDestino,
          categoria: valor.categoria,
          subcategoria: valor.subcategoria,
          letra: valor.letra,
          costo: valor.costo
        });
        copiados++;
      }
      
      console.log(`✅ [ValorUnitarioService] ${copiados} valores copiados exitosamente`);
      return copiados;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error copiando valores:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de valores unitarios
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(año?: number): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porCategoria: { [key: string]: number };
    porSubcategoria: { [key: string]: number };
    costoPromedio: number;
    añosDisponibles: number[];
  }> {
    try {
      let valores: ValorUnitarioData[];
      
      if (año) {
        valores = await this.listarPorAño(año);
      } else {
        valores = await this.getAll();
      }
      
      const estadisticas = {
        total: valores.length,
        activos: valores.filter(v => v.estado === 'ACTIVO').length,
        inactivos: valores.filter(v => v.estado === 'INACTIVO').length,
        porCategoria: {} as { [key: string]: number },
        porSubcategoria: {} as { [key: string]: number },
        costoPromedio: 0,
        añosDisponibles: [] as number[]
      };
      
      // Agrupar por categoría y subcategoría
      valores.forEach(valor => {
        // Por categoría
        estadisticas.porCategoria[valor.categoria] = 
          (estadisticas.porCategoria[valor.categoria] || 0) + 1;
        
        // Por subcategoría
        estadisticas.porSubcategoria[valor.subcategoria] = 
          (estadisticas.porSubcategoria[valor.subcategoria] || 0) + 1;
      });
      
      // Calcular costo promedio
      if (valores.length > 0) {
        const sumaCostos = valores.reduce((sum, v) => sum + v.costo, 0);
        estadisticas.costoPromedio = sumaCostos / valores.length;
      }
      
      // Obtener años disponibles
      const añosSet = new Set(valores.map(v => v.año));
      estadisticas.añosDisponibles = Array.from(añosSet).sort((a, b) => b - a);
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const valorUnitarioService = ValorUnitarioService.getInstance();

// Exportar también la clase por si se necesita extender
export default ValorUnitarioService;