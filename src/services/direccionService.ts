// src/services/direccionService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

/**
 * Interfaces para Dirección
 */
export interface DireccionData extends BaseApiService <DireccionData, CreateDireccionDTO, UpdateDireccionDTO> {

 
  codigo: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  codigoVia: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  tipoVia?: string;
  numeroMunicipal?: string;
  cuadra?: string;
  lado?: string;
  lote?: string;
  loteInicial?: number;
  loteFinal?: number;
  manzana?: string;
  sublote?: string;
  referencia?: string;
  direccionCompleta?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  codigoVia?: number;
  numeroMunicipal?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
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
  nombreVia?: string;
  numeroMunicipal?: string;
  estado?: string;
  parametrosBusqueda?: string;
  codUsuario?: number;
}

/**
 * Servicio para gestión de direcciones
 */
const direccionService = {
  /**
   * Lista todas las direcciones (mock por ahora)
   */
  async getAll(): Promise<DireccionData[]> {
    console.log('🔍 [DireccionService] Listando direcciones (mock)');
    // Por ahora retornamos un array vacío hasta confirmar el endpoint
    return [];
  },

  /**
   * Busca direcciones por criterios
   */
  async search(params: any): Promise<DireccionData[]> {
    console.log('🔍 [DireccionService] Buscando direcciones:', params);
    return [];
  },

  /**
   * Obtiene una dirección por ID
   */
  async getById(id: number): Promise<DireccionData | null> {
    console.log('🔍 [DireccionService] Obteniendo dirección:', id);
    return null;
  },

  /**
   * Crea una nueva dirección
   */
  async createItem(data: CreateDireccionDTO): Promise<DireccionData> {
    console.log('➕ [DireccionService] Creando dirección:', data);
    throw new Error('Método no implementado');
  },

  /**
   * Actualiza una dirección
   */
  async updateItem(id: number, data: UpdateDireccionDTO): Promise<DireccionData> {
    console.log('📝 [DireccionService] Actualizando dirección:', id, data);
    throw new Error('Método no implementado');
  },

  /**
   * Elimina una dirección
   */
  async deleteItem(id: number): Promise<void> {
    console.log('🗑️ [DireccionService] Eliminando dirección:', id);
    throw new Error('Método no implementado');
  },

  /**
   * Lista direcciones por nombre de vía
   */
  async listarPorNombreVia(nombreVia: string): Promise<DireccionData[]> {
    console.log('🔍 [DireccionService] Listando por nombre de vía:', nombreVia);
    return [];
  },

  /**
   * Lista direcciones por tipo de vía
   */
  async listarPorTipoVia(codigoVia?: number, parametrosBusqueda: string = 'a'): Promise<DireccionData[]> {
    console.log('🔍 [DireccionService] Listando por tipo de vía:', codigoVia);
    return [];
  },

  /**
   * Busca direcciones por diferentes criterios
   */
  async buscarDirecciones(criterios: BusquedaDireccionParams): Promise<DireccionData[]> {
    console.log('🔍 [DireccionService] Buscando direcciones con criterios:', criterios);
    
    if (criterios.nombreVia) {
      return this.listarPorNombreVia(criterios.nombreVia);
    }
    
    if (criterios.codigoVia) {
      return this.listarPorTipoVia(criterios.codigoVia, criterios.parametrosBusqueda);
    }
    
    return this.search(criterios);
  }
};

// Exportar el servicio
export default direccionService;

// También exportar la "clase" para compatibilidad
export const DireccionService = {
  getInstance: () => direccionService
};