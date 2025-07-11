// src/services/direccionService.ts
import BaseApiService from './BaseApiService';
import { getEndpoint, API_CONFIG } from '../config/api.unified.config';
import { apiGet } from '../utils/api';

/**
 * Interfaces para Dirección
 */
export interface DireccionData {
  codigo: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  codigoVia: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  tipoVia?: string;
  numeroMunicipal?: string;
  lote?: string;
  manzana?: string;
  sublote?: string;
  referencia?: string;
  direccionCompleta: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  codigoVia: number;
  numeroMunicipal?: string;
  lote?: string;
  manzana?: string;
  sublote?: string;
  referencia?: string;
  codUsuario?: number;
}

export interface UpdateDireccionDTO extends Partial<CreateDireccionDTO> {
  estado?: string;
}

export interface BusquedaDireccionParams {
  codigoSector?: number;
  codigoBarrio?: number;
  codigoCalle?: number;
  codigoVia?: number;
  numeroMunicipal?: string;
  estado?: string;
  parametrosBusqueda?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de direcciones
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
export class DireccionService extends BaseApiService<DireccionData, CreateDireccionDTO, UpdateDireccionDTO> {
  private static instance: DireccionService;
  
  private constructor() {
    super(
      getEndpoint('direccion', 'base'),
      {
        normalizeItem: (item: any) => ({
          codigo: item.codDireccion || item.codigo || 0,
          codigoSector: item.codSector || 0,
          codigoBarrio: item.codBarrio || 0,
          codigoCalle: item.codCalle || 0,
          codigoVia: item.codVia || item.codTipoVia || 0,
          nombreSector: item.nombreSector || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreCalle: item.nombreCalle || '',
          tipoVia: item.tipoVia || item.nombreVia || '',
          numeroMunicipal: item.numeroMunicipal || item.numMunicipal || '',
          lote: item.lote || '',
          manzana: item.manzana || item.mz || '',
          sublote: item.sublote || '',
          referencia: item.referencia || '',
          direccionCompleta: item.direccionCompleta || 
            DireccionService.construirDireccionCompleta(item),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: DireccionData) => {
          // Validar que tenga los campos mínimos
          return !!(
            item.codigo && 
            item.codigoSector && 
            item.codigoBarrio && 
            item.codigoCalle
          );
        }
      },
      'direccion'
    );
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
   * Construye la dirección completa a partir de sus componentes
   */
  private static construirDireccionCompleta(item: any): string {
    const partes = [];
    
    // Sector
    if (item.nombreSector) {
      partes.push(`Sector ${item.nombreSector}`);
    }
    
    // Barrio
    if (item.nombreBarrio) {
      partes.push(`Barrio ${item.nombreBarrio}`);
    }
    
    // Tipo de vía y calle
    if (item.tipoVia || item.nombreVia) {
      partes.push(item.tipoVia || item.nombreVia);
    }
    if (item.nombreCalle) {
      partes.push(item.nombreCalle);
    }
    
    // Número municipal
    if (item.numeroMunicipal || item.numMunicipal) {
      partes.push(`N° ${item.numeroMunicipal || item.numMunicipal}`);
    }
    
    // Lote y manzana
    if (item.lote) {
      partes.push(`Lote ${item.lote}`);
    }
    if (item.manzana || item.mz) {
      partes.push(`Mz ${item.manzana || item.mz}`);
    }
    
    // Sublote
    if (item.sublote) {
      partes.push(`Sublote ${item.sublote}`);
    }
    
    return partes.join(' ').trim();
  }
  
  /**
   * Lista todas las direcciones
   * NO requiere autenticación (método GET)
   */
  async listarDirecciones(incluirInactivos: boolean = false): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Listando direcciones');
      
      const direcciones = await this.getAll();
      
      if (!incluirInactivos) {
        return direcciones.filter(d => d.estado === 'ACTIVO');
      }
      
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error listando direcciones:', error);
      throw error;
    }
  }
  
  /**
   * Lista direcciones por tipo de vía
   * NO requiere autenticación (método GET)
   */
  async listarPorTipoVia(
    codigoVia?: number, 
    parametrosBusqueda: string = 'a'
  ): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Listando direcciones por tipo de vía');
      
      const endpoint = getEndpoint('direccion', 'listarPorTipoVia');
      const params: any = {
        parametrosBusqueda,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      };
      
      if (codigoVia) {
        params.codTipoVia = codigoVia;
      }
      
      const response = await apiGet<DireccionData[]>(endpoint, { params });
      
      if (Array.isArray(response)) {
        return this.normalizeData(response);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error listando por tipo de vía:', error);
      throw error;
    }
  }
  
  /**
   * Lista direcciones por nombre de vía
   * NO requiere autenticación (método GET)
   */
  async listarPorNombreVia(nombreVia: string): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Listando direcciones por nombre de vía:', nombreVia);
      
      const endpoint = getEndpoint('direccion', 'listarPorNombreVia');
      const params = {
        nombreVia: nombreVia.trim(),
        codUsuario: API_CONFIG.defaultParams.codUsuario
      };
      
      const response = await apiGet<DireccionData[]>(endpoint, { params });
      
      if (Array.isArray(response)) {
        return this.normalizeData(response);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error listando por nombre de vía:', error);
      throw error;
    }
  }
  
  /**
   * Busca direcciones por diferentes criterios
   * NO requiere autenticación (método GET)
   */
  async buscarDirecciones(criterios: BusquedaDireccionParams): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones:', criterios);
      
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error buscando direcciones:', error);
      throw error;
    }
  }
  
  /**
   * Busca una dirección específica por componentes
   * NO requiere autenticación (método GET)
   */
  async buscarDireccionExacta(
    codigoSector: number,
    codigoBarrio: number,
    codigoCalle: number,
    numeroMunicipal?: string,
    lote?: string,
    manzana?: string
  ): Promise<DireccionData | null> {
    try {
      const criterios: BusquedaDireccionParams = {
        codigoSector,
        codigoBarrio,
        codigoCalle
      };
      
      if (numeroMunicipal) criterios.numeroMunicipal = numeroMunicipal;
      
      const direcciones = await this.buscarDirecciones(criterios);
      
      // Filtrar por coincidencia exacta
      const direccionExacta = direcciones.find(d => {
        const coincideLote = !lote || d.lote === lote;
        const coincideManzana = !manzana || d.manzana === manzana;
        return coincideLote && coincideManzana;
      });
      
      return direccionExacta || null;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error buscando dirección exacta:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una dirección por su código
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigo(codigo: number): Promise<DireccionData | null> {
    try {
      console.log('🔍 [DireccionService] Obteniendo dirección por código:', codigo);
      
      return await this.getById(codigo);
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error obteniendo dirección:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si una dirección ya existe
   * NO requiere autenticación (método GET)
   */
  async verificarDireccionExiste(
    codigoSector: number,
    codigoBarrio: number,
    codigoCalle: number,
    numeroMunicipal?: string,
    lote?: string,
    manzana?: string,
    excluirCodigo?: number
  ): Promise<boolean> {
    try {
      const direccionExistente = await this.buscarDireccionExacta(
        codigoSector,
        codigoBarrio,
        codigoCalle,
        numeroMunicipal,
        lote,
        manzana
      );
      
      if (direccionExistente && excluirCodigo) {
        return direccionExistente.codigo !== excluirCodigo;
      }
      
      return !!direccionExistente;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error verificando dirección:', error);
      return false;
    }
  }
  
  /**
   * Crea una nueva dirección
   * REQUIERE autenticación (método POST)
   */
  async crearDireccion(datos: CreateDireccionDTO): Promise<DireccionData> {
    try {
      console.log('➕ [DireccionService] Creando dirección:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear direcciones');
      }
      
      // Validar datos básicos
      if (!datos.codigoSector || !datos.codigoBarrio || !datos.codigoCalle) {
        throw new Error('Debe especificar sector, barrio y calle');
      }
      
      // Verificar si la dirección ya existe
      const existe = await this.verificarDireccionExiste(
        datos.codigoSector,
        datos.codigoBarrio,
        datos.codigoCalle,
        datos.numeroMunicipal,
        datos.lote,
        datos.manzana
      );
      
      if (existe) {
        throw new Error('Ya existe una dirección con esos datos');
      }
      
      const datosCompletos = {
        ...datos,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error creando dirección:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarDireccion(codigo: number, datos: UpdateDireccionDTO): Promise<DireccionData> {
    try {
      console.log('📝 [DireccionService] Actualizando dirección:', codigo, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar direcciones');
      }
      
      // Obtener dirección actual
      const direccionActual = await this.getById(codigo);
      if (!direccionActual) {
        throw new Error('Dirección no encontrada');
      }
      
      // Si se están cambiando los componentes principales, verificar duplicados
      if (datos.codigoSector || datos.codigoBarrio || datos.codigoCalle || 
          datos.numeroMunicipal || datos.lote || datos.manzana) {
        
        const existe = await this.verificarDireccionExiste(
          datos.codigoSector || direccionActual.codigoSector,
          datos.codigoBarrio || direccionActual.codigoBarrio,
          datos.codigoCalle || direccionActual.codigoCalle,
          datos.numeroMunicipal || direccionActual.numeroMunicipal,
          datos.lote || direccionActual.lote,
          datos.manzana || direccionActual.manzana,
          codigo
        );
        
        if (existe) {
          throw new Error('Ya existe otra dirección con esos datos');
        }
      }
      
      const datosCompletos = {
        ...datos,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(codigo, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error actualizando dirección:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una dirección (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarDireccion(codigo: number): Promise<void> {
    try {
      console.log('🗑️ [DireccionService] Eliminando dirección:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar direcciones');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(codigo, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [DireccionService] Dirección marcada como inactiva');
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error eliminando dirección:', error);
      throw error;
    }
  }
  
  /**
   * Formatea una dirección para mostrar
   */
  formatearDireccion(direccion: DireccionData): string {
    if (direccion.direccionCompleta) {
      return direccion.direccionCompleta;
    }
    
    return DireccionService.construirDireccionCompleta(direccion);
  }
  
  /**
   * Obtiene estadísticas de direcciones
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(codigoSector?: number): Promise<{
    total: number;
    activas: number;
    inactivas: number;
    porBarrio: { [key: number]: number };
    porTipoVia: { [key: number]: number };
  }> {
    try {
      let direcciones: DireccionData[];
      
      if (codigoSector) {
        direcciones = await this.buscarDirecciones({ codigoSector });
      } else {
        direcciones = await this.getAll();
      }
      
      const estadisticas = {
        total: direcciones.length,
        activas: direcciones.filter(d => d.estado === 'ACTIVO').length,
        inactivas: direcciones.filter(d => d.estado === 'INACTIVO').length,
        porBarrio: {} as { [key: number]: number },
        porTipoVia: {} as { [key: number]: number }
      };
      
      // Agrupar por barrio y tipo de vía
      direcciones.forEach(direccion => {
        // Por barrio
        estadisticas.porBarrio[direccion.codigoBarrio] = 
          (estadisticas.porBarrio[direccion.codigoBarrio] || 0) + 1;
        
        // Por tipo de vía
        estadisticas.porTipoVia[direccion.codigoVia] = 
          (estadisticas.porTipoVia[direccion.codigoVia] || 0) + 1;
      });
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const direccionService = DireccionService.getInstance();

// También exportar la clase para extensión si es necesario
export default DireccionService;