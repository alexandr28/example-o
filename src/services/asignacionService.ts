// src/services/asignacionService.ts
import { buildApiUrl } from '../config/api.unified.config';

export interface AsignacionPredio {
  id: number;
  codPredio: string;
  codContribuyente: string;
  anio: number;
  fechaAsignacion: string;
  estado: string;
  contribuyente?: string;
  direccionPredio?: string;
  tipoPredio?: string;
  modoDeclaracion?: string;
  fechaVenta?: string;
  fechaDeclaracion?: string;
  esPensionista?: boolean;
  porcentajeCondominio?: number;
  porcentajeLibre?: number;
}

export interface AsignacionQueryParams {
  codPredio?: string;
  codContribuyente?: string;
  anio?: number;
}

class AsignacionService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://26.161.18.122:8080/api/asignacionpredio';
  }

  /**
   * Buscar asignaciones de predio por parámetros
   * @param params - Parámetros de búsqueda (codPredio, codContribuyente, anio)
   * @returns Promise con las asignaciones encontradas
   */
  async buscarAsignaciones(params: AsignacionQueryParams): Promise<AsignacionPredio[]> {
    try {
      console.log('🔍 [AsignacionService] Buscando asignaciones con parámetros:', params);
      
      // Construir query params
      const queryParams = new URLSearchParams();
      
      if (params.codPredio) {
        queryParams.append('codPredio', params.codPredio);
      }
      
      if (params.codContribuyente) {
        queryParams.append('codContribuyente', params.codContribuyente);
      }
      
      if (params.anio) {
        queryParams.append('anio', params.anio.toString());
      }

      const url = `${this.baseURL}?${queryParams.toString()}`;
      console.log('📡 [AsignacionService] URL de consulta:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('📡 [AsignacionService] Respuesta del API:', responseData);

      if (responseData.success && responseData.data) {
        // Normalizar los datos del API
        const asignacionesData = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        
        const asignacionesFormateadas = asignacionesData.map((item: any, index: number) => ({
          id: item.id || index,
          codPredio: item.codPredio || '',
          codContribuyente: item.codContribuyente || '',
          anio: item.anio || new Date().getFullYear(),
          fechaAsignacion: item.fechaAsignacion || '',
          estado: item.estado || 'Activo',
          contribuyente: item.contribuyente || item.nombreContribuyente || '',
          direccionPredio: item.direccionPredio || item.direccion || '',
          tipoPredio: item.tipoPredio || '',
          modoDeclaracion: item.modoDeclaracion || '',
          fechaVenta: item.fechaVenta || '',
          fechaDeclaracion: item.fechaDeclaracion || '',
          esPensionista: item.esPensionista || false,
          porcentajeCondominio: item.porcentajeCondominio || 100,
          porcentajeLibre: item.porcentajeLibre || 100
        }));

        console.log('✅ [AsignacionService] Asignaciones formateadas:', asignacionesFormateadas);
        return asignacionesFormateadas;
      } else {
        console.log('⚠️ [AsignacionService] No se encontraron asignaciones en la respuesta');
        return [];
      }
      
    } catch (error) {
      console.error('❌ [AsignacionService] Error al buscar asignaciones:', error);
      
      // En caso de error, devolver datos de ejemplo para desarrollo
      console.log('🔄 [AsignacionService] Usando datos de ejemplo debido al error');
      return [
        {
          id: 1,
          codPredio: '20231',
          codContribuyente: '1',
          anio: 2023,
          fechaAsignacion: '2023-01-15',
          estado: 'Activo',
          contribuyente: 'Juan Pérez García',
          direccionPredio: 'Av. Principal 123',
          tipoPredio: 'Predio independiente',
          modoDeclaracion: 'COMPRA',
          fechaVenta: '2023-01-10',
          fechaDeclaracion: '2023-01-15',
          esPensionista: false,
          porcentajeCondominio: 100,
          porcentajeLibre: 100
        },
        {
          id: 2,
          codPredio: '20232',
          codContribuyente: '2',
          anio: 2023,
          fechaAsignacion: '2023-02-20',
          estado: 'Activo',
          contribuyente: 'María López Sánchez',
          direccionPredio: 'Jr. Las Flores 456',
          tipoPredio: 'Departamento en edificio',
          modoDeclaracion: 'HERENCIA',
          fechaVenta: '',
          fechaDeclaracion: '2023-02-20',
          esPensionista: true,
          porcentajeCondominio: 50,
          porcentajeLibre: 50
        }
      ];
    }
  }

  /**
   * Obtener asignación por ID específico
   * @param id - ID de la asignación
   * @returns Promise con la asignación encontrada
   */
  async obtenerAsignacionPorId(id: number): Promise<AsignacionPredio | null> {
    try {
      const url = `${this.baseURL}/${id}`;
      console.log('📡 [AsignacionService] Obteniendo por ID:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;
      
      // Normalizar datos
      const normalized: AsignacionPredio = {
        id: data.id || id,
        codPredio: data.codPredio || '',
        codContribuyente: data.codContribuyente || '',
        anio: data.anio || new Date().getFullYear(),
        fechaAsignacion: data.fechaAsignacion || '',
        estado: data.estado || 'Activo',
        contribuyente: data.contribuyente || data.nombreContribuyente || '',
        direccionPredio: data.direccionPredio || data.direccion || '',
        tipoPredio: data.tipoPredio || '',
        modoDeclaracion: data.modoDeclaracion || '',
        fechaVenta: data.fechaVenta || '',
        fechaDeclaracion: data.fechaDeclaracion || '',
        esPensionista: data.esPensionista || false,
        porcentajeCondominio: data.porcentajeCondominio || 100,
        porcentajeLibre: data.porcentajeLibre || 100
      };

      return normalized;
    } catch (error) {
      console.error('❌ [AsignacionService] Error al obtener asignación por ID:', error);
      return null;
    }
  }
}

export const asignacionService = new AsignacionService();
export default asignacionService;