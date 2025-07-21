// src/services/direccionService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interface para los datos de dirección
 */
export interface DireccionData {
  id: number;
  codigo?: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  codUsuario?: number;
}

export interface UpdateDireccionDTO extends Partial<CreateDireccionDTO> {
  estado?: string;
}

export interface BusquedaDireccionParams {
  codigoSector?: number;
  codigoBarrio?: number;
  codigoCalle?: number;
  nombreVia?: string;
  parametrosBusqueda?: string;
  estado?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de direcciones
 * NO requiere autenticación
 */
class DireccionService extends BaseApiService<DireccionData, CreateDireccionDTO, UpdateDireccionDTO> {
  private static instance: DireccionService;
  
  private constructor() {
    super(
      '/api/direccion', // Ajustar según tu endpoint real
      {
        normalizeItem: (item: any) => ({
          id: item.codDireccion || item.id || 0,
          codigo: item.codigo || item.codDireccion,
          codigoSector: item.codigoSector || item.codSector || 0,
          codigoBarrio: item.codigoBarrio || item.codBarrio || 0,
          codigoCalle: item.codigoCalle || item.codCalle || item.codVia || 0,
          nombreSector: item.nombreSector || '',
          nombreBarrio: item.nombreBarrio || '',
          nombreCalle: item.nombreCalle || item.nombreVia || '',
          nombreVia: item.nombreVia || item.nombreCalle || '',
          nombreTipoVia: item.nombreTipoVia || item.tipoVia || 'CALLE',
          cuadra: item.cuadra?.toString() || '',
          lado: item.lado || '-',
          loteInicial: parseInt(item.loteInicial || '0'),
          loteFinal: parseInt(item.loteFinal || '0'),
          descripcion: item.descripcion || 
            `${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} ${item.cuadra ? `CUADRA ${item.cuadra}` : ''}`.trim(),
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: DireccionData) => {
          return !!item.id && 
                 !!item.codigoSector && 
                 !!item.codigoBarrio && 
                 !!item.codigoCalle;
        },
        
        transformForCreate: (dto: CreateDireccionDTO) => ({
          ...dto,
          codUsuario: dto.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        transformForUpdate: (dto: UpdateDireccionDTO) => ({
          ...dto,
          fechaModificacion: new Date().toISOString()
        })
      },
      false // requiresAuth = false (tercer parámetro)
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
   * Obtiene todas las direcciones activas
   */
  async obtenerTodos(): Promise<DireccionData[]> {
    try {
      const params = { estado: 'ACTIVO' };
      return await this.getAll(params);
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      throw error;
    }
  }
  
  /**
   * Busca direcciones con parámetros específicos
   */
  async buscar(params: BusquedaDireccionParams): Promise<DireccionData[]> {
    try {
      return await this.search(params);
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      throw error;
    }
  }
  
  /**
   * Busca direcciones por nombre de vía
   */
  async buscarPorNombreVia(nombreVia: string): Promise<DireccionData[]> {
    try {
      if (!nombreVia || nombreVia.length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }
      
      const params: BusquedaDireccionParams = {
        nombreVia: nombreVia.trim(),
        parametrosBusqueda: nombreVia.trim(),
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
    } catch (error) {
      console.error('Error al buscar por nombre de vía:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene direcciones por sector
   */
  async obtenerPorSector(codigoSector: number): Promise<DireccionData[]> {
    try {
      const params: BusquedaDireccionParams = {
        codigoSector,
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
    } catch (error) {
      console.error('Error al obtener direcciones por sector:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene direcciones por barrio
   */
  async obtenerPorBarrio(codigoBarrio: number): Promise<DireccionData[]> {
    try {
      const params: BusquedaDireccionParams = {
        codigoBarrio,
        estado: 'ACTIVO'
      };
      
      return await this.search(params);
    } catch (error) {
      console.error('Error al obtener direcciones por barrio:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva dirección
   */
  async crearDireccion(datos: CreateDireccionDTO): Promise<DireccionData> {
    try {
      // Validaciones
      if (!datos.codigoSector || !datos.codigoBarrio || !datos.codigoCalle) {
        throw new Error('Debe proporcionar sector, barrio y calle');
      }
      
      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }
      
      return await this.create(datos);
    } catch (error) {
      console.error('Error al crear dirección:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección existente
   */
  async actualizarDireccion(id: number, datos: UpdateDireccionDTO): Promise<DireccionData> {
    try {
      if (datos.loteInicial && datos.loteFinal) {
        if (datos.loteInicial > datos.loteFinal) {
          throw new Error('El lote inicial no puede ser mayor al lote final');
        }
      }
      
      return await this.update(id, datos);
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una dirección (cambio de estado lógico)
   */
  async eliminarDireccion(id: number): Promise<void> {
    try {
      await this.update(id, {
        estado: 'INACTIVO'
      });
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      throw error;
    }
  }
}

// Exportar la instancia singleton
const direccionService = DireccionService.getInstance();
export default direccionService;