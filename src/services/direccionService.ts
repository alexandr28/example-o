// src/services/direccionService.ts
import { BaseApiService } from './BaseApiService';
import { Direccion, DireccionFormData } from '../models';
import { NotificationService } from '../components/utils/Notification';

/**
 * Configuración de normalización para direcciones
 */
const direccionNormalizeOptions = {
  normalizeItem: (item: any): Direccion => {
    return {
      id: item.direccionId || item.id || 0,
      sectorId: item.sectorId || item.codSector || 0,
      barrioId: item.barrioId || item.codBarrio || 0,
      calleId: item.calleId || item.codCalle || 0,
      cuadra: item.cuadra || '',
      lado: item.lado || '-',
      loteInicial: item.loteInicial || 0,
      loteFinal: item.loteFinal || 0,
      descripcion: item.descripcion || item.nombreCompleto || '',
      estado: item.estado === 1 || item.estado === true,
      // Relaciones opcionales
      sector: item.sector || undefined,
      barrio: item.barrio || undefined,
      calle: item.calle || undefined
    };
  }
};

/**
 * Interfaz para parámetros de búsqueda por tipo de vía
 */
interface BusquedaPorTipoViaParams {
  parametrosBusqueda: string;
  codUsuario?: number;
}

/**
 * Interfaz para parámetros de búsqueda por nombre de vía
 */
interface BusquedaPorNombreViaParams {
  nombreVia?: string;
  codSector?: number;
  codBarrio?: number;
}

/**
 * Servicio para manejar las operaciones de direcciones
 */
export class DireccionService extends BaseApiService<Direccion, DireccionFormData> {
  private static instance: DireccionService;
  
  constructor() {
    super('direccion', direccionNormalizeOptions);
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
   * Busca direcciones por tipo de vía
   */
  async buscarPorTipoVia(params: BusquedaPorTipoViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por tipo de vía:', params);
      
      const queryParams = new URLSearchParams({
        parametrosBusqueda: params.parametrosBusqueda,
        ...(params.codUsuario && { codUsuario: params.codUsuario.toString() })
      });
      
      const url = `${this.API_BASE}/listarDireccionPorTipoVia?${queryParams}`;
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      if (!Array.isArray(response)) {
        console.warn('⚠️ [DireccionService] La respuesta no es un array:', response);
        return [];
      }
      
      const direcciones = response.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [DireccionService] ${direcciones.length} direcciones encontradas por tipo de vía`);
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por tipo de vía:', error);
      throw error;
    }
  }
  
  /**
   * Busca direcciones por nombre de vía
   */
  async buscarPorNombreVia(params?: BusquedaPorNombreViaParams): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones por nombre de vía:', params);
      
      let url = `${this.API_BASE}/listarDireccionPorNombreVia`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.nombreVia) queryParams.append('nombreVia', params.nombreVia);
        if (params.codSector) queryParams.append('codSector', params.codSector.toString());
        if (params.codBarrio) queryParams.append('codBarrio', params.codBarrio.toString());
        
        if (queryParams.toString()) {
          url += `?${queryParams}`;
        }
      }
      
      const response = await this.makeRequest(url, {
        method: 'GET'
      });
      
      if (!Array.isArray(response)) {
        console.warn('⚠️ [DireccionService] La respuesta no es un array:', response);
        return [];
      }
      
      const direcciones = response.map((item: any, index: number) => 
        this.normalizeOptions.normalizeItem(item, index)
      );
      
      console.log(`✅ [DireccionService] ${direcciones.length} direcciones encontradas por nombre de vía`);
      return direcciones;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al buscar por nombre de vía:', error);
      throw error;
    }
  }
  
  /**
   * Sobrescribe el método getAll para usar el endpoint por nombre de vía
   */
  async getAll(): Promise<Direccion[]> {
    try {
      // Por defecto, listar todas las direcciones usando el endpoint por nombre de vía
      return await this.buscarPorNombreVia();
    } catch (error) {
      console.error('❌ [DireccionService] Error al obtener todas las direcciones:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva dirección (requiere Bearer Token)
   */
  async create(data: DireccionFormData): Promise<Direccion> {
    try {
      console.log('📤 [DireccionService] Creando nueva dirección:', data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para crear direcciones');
        throw new Error('No hay token de autenticación');
      }
      
      // Mapear los datos al formato esperado por la API
      const requestData = {
        sectorId: data.sectorId,
        barrioId: data.barrioId,
        calleId: data.calleId,
        cuadra: data.cuadra,
        lado: data.lado,
        loteInicial: data.loteInicial,
        loteFinal: data.loteFinal,
        estado: 1 // Por defecto activo
      };
      
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
      
      if (!response.ok) {
        if (response.status === 401) {
          NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          throw new Error('No autorizado');
        }
        if (response.status === 403) {
          NotificationService.error('No tiene permisos para crear direcciones');
          throw new Error('Sin permisos');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [DireccionService] Dirección creada:', responseData);
      
      const direccionCreada = this.normalizeOptions.normalizeItem(responseData, 0);
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      NotificationService.success('Dirección creada exitosamente');
      
      return direccionCreada;
      
    } catch (error: any) {
      console.error('❌ [DireccionService] Error al crear dirección:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una dirección existente (requiere Bearer Token)
   */
  async update(id: number, data: DireccionFormData): Promise<Direccion> {
    try {
      console.log(`📤 [DireccionService] Actualizando dirección ${id}:`, data);
      
      const token = this.getAuthToken();
      if (!token) {
        NotificationService.error('Debe iniciar sesión para actualizar direcciones');
        throw new Error('No hay token de autenticación');
      }
      
      // Mapear los datos al formato esperado por la API
      const requestData = {
        direccionId: id,
        sectorId: data.sectorId,
        barrioId: data.barrioId,
        calleId: data.calleId,
        cuadra: data.cuadra,
        lado: data.lado,
        loteInicial: data.loteInicial,
        loteFinal: data.loteFinal,
        estado: 1
      };
      
      const url = `${this.API_BASE}/${id}`;
      
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
        if (response.status === 401) {
          NotificationService.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          throw new Error('No autorizado');
        }
        if (response.status === 403) {
          NotificationService.error('No tiene permisos para actualizar direcciones');
          throw new Error('Sin permisos');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log(`✅ [DireccionService] Dirección ${id} actualizada:`, responseData);
      
      const direccionActualizada = this.normalizeOptions.normalizeItem(responseData, 0);
      
      // Limpiar caché para forzar recarga
      this.clearCache();
      NotificationService.success('Dirección actualizada exitosamente');
      
      return direccionActualizada;
      
    } catch (error: any) {
      console.error(`❌ [DireccionService] Error al actualizar dirección ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca direcciones por término de búsqueda
   */
  async search(term: string): Promise<Direccion[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones con término:', term);
      
      // Usar el método de búsqueda por tipo de vía para búsquedas generales
      return await this.buscarPorTipoVia({
        parametrosBusqueda: term,
        codUsuario: 1 // Valor por defecto, ajustar según necesidad
      });
      
    } catch (error) {
      console.error('❌ [DireccionService] Error en búsqueda:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el texto descriptivo completo de una dirección
   */
  static getDescripcionCompleta(direccion: Direccion): string {
    if (!direccion) return '';
    
    const partes: string[] = [];
    
    // Agregar información de la calle si existe
    if (direccion.calle) {
      partes.push(`${direccion.calle.tipoVia || ''} ${direccion.calle.nombre || ''}`);
    }
    
    // Agregar cuadra
    if (direccion.cuadra) {
      partes.push(`Cdra. ${direccion.cuadra}`);
    }
    
    // Agregar lado
    if (direccion.lado && direccion.lado !== '-') {
      const ladoTexto = {
        'I': 'Izquierdo',
        'D': 'Derecho',
        'P': 'Par',
        'IM': 'Impar'
      }[direccion.lado] || direccion.lado;
      partes.push(`Lado ${ladoTexto}`);
    }
    
    // Agregar lotes
    if (direccion.loteInicial && direccion.loteFinal) {
      if (direccion.loteInicial === direccion.loteFinal) {
        partes.push(`Lote ${direccion.loteInicial}`);
      } else {
        partes.push(`Lotes ${direccion.loteInicial}-${direccion.loteFinal}`);
      }
    }
    
    // Agregar barrio y sector si existen
    if (direccion.barrio) {
      partes.push(`${direccion.barrio.nombre}`);
    }
    
    if (direccion.sector) {
      partes.push(`${direccion.sector.nombre}`);
    }
    
    return partes.join(', ');
  }
}

// Exportar instancia singleton
export const direccionService = DireccionService.getInstance();