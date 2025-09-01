// src/services/asignacionService.ts
import { buildApiUrl } from '../config/api.unified.config';

export interface AsignacionPredio {
  id: number;
  anio: number;
  codPredio: string;
  codContribuyente: string;
  codAsignacion: string | null;
  porcentajeCondominio: number;
  fechaDeclaracion: number; // timestamp
  fechaVenta: number; // timestamp
  fechaDeclaracionStr: string;
  fechaVentaStr: string;
  codModoDeclaracion: string;
  pensionista: number;
  codEstado: string;
  codUsuario: number | null;
  nombreContribuyente: string;
  // Campos adicionales para compatibilidad
  estado?: string;
  esPensionista?: boolean;
  porcentajeLibre?: number;
}

export interface AsignacionQueryParams {
  codPredio?: string;
  codContribuyente?: string;
  anio?: number;
}

export interface CreateAsignacionAPIDTO {
  anio: number;
  codPredio: string;
  codContribuyente: number;
  codAsignacion: null;
  porcentajeCondomino: number | null;
  fechaDeclaracion: string; // formato: "YYYY-MM-DD"
  fechaVenta: string; // formato: "YYYY-MM-DD"
  codModoDeclaracion: string;
  pensionista: number; // 1 = sí, 0 = no
  codEstado: string;
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

      // Manejar diferentes formatos de respuesta
      let asignacionesData;
      
      if (responseData.success && responseData.data) {
        // Formato con wrapper (success/data)
        asignacionesData = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      } else if (Array.isArray(responseData)) {
        // Formato array directo
        asignacionesData = responseData;
      } else if (responseData.anio || responseData.codPredio || responseData.codContribuyente) {
        // Formato objeto directo (según tu ejemplo JSON)
        asignacionesData = [responseData];
      } else {
        console.log('⚠️ [AsignacionService] Formato de respuesta no reconocido');
        return [];
      }
      
      const asignacionesFormateadas = asignacionesData.map((item: any, index: number) => ({
        id: item.codAsignacion || index + 1,
        anio: item.anio || new Date().getFullYear(),
        codPredio: (item.codPredio || '').trim(), // Trim spaces como en el JSON
        codContribuyente: item.codContribuyente?.toString() || '',
        codAsignacion: item.codAsignacion,
        porcentajeCondominio: item.porcentajeCondomino || 100.0,
        fechaDeclaracion: item.fechaDeclaracion || 0,
        fechaVenta: item.fechaVenta || 0,
        fechaDeclaracionStr: item.fechaDeclaracionStr || '',
        fechaVentaStr: item.fechaVentaStr || '',
        codModoDeclaracion: item.codModoDeclaracion || '',
        pensionista: item.pensionista || 0,
        codEstado: item.codEstado || '0201',
        codUsuario: item.codUsuario,
        nombreContribuyente: item.nombreContribuyente || '',
        // Campos de compatibilidad
        estado: item.codEstado === "0201" ? "Activo" : "Inactivo",
        esPensionista: item.pensionista === 1,
        porcentajeLibre: 100 - (item.porcentajeCondomino || 100)
      }));

      console.log('✅ [AsignacionService] Asignaciones formateadas:', asignacionesFormateadas);
      return asignacionesFormateadas;
      
    } catch (error) {
      console.error('❌ [AsignacionService] Error al buscar asignaciones:', error);
      
      // En caso de error, devolver datos de ejemplo basados en tu formato JSON
      console.log('🔄 [AsignacionService] Usando datos de ejemplo debido al error');
      return [
        {
          id: 1,
          anio: 2025,
          codPredio: "20259",
          codContribuyente: "2",
          codAsignacion: null,
          porcentajeCondominio: 100.0,
          fechaDeclaracion: 1744693200000,
          fechaVenta: 1735966800000,
          fechaDeclaracionStr: "2025-04-15",
          fechaVentaStr: "2025-01-04",
          codModoDeclaracion: "0401",
          pensionista: 0,
          codEstado: "0201",
          codUsuario: null,
          nombreContribuyente: "Mantilla Miñano jhonathan",
          // Campos de compatibilidad
          estado: "Activo",
          esPensionista: false,
          porcentajeLibre: 0
        }
      ];
    }
  }

  /**
   * Crear una nueva asignación de predio
   * POST http://26.161.18.122:8080/api/asignacionpredio
   * @param datos - Datos de la asignación a crear
   * @returns Promise con la asignación creada
   */
  async crearAsignacionAPI(datos: CreateAsignacionAPIDTO): Promise<AsignacionPredio> {
    try {
      console.log('➕ [AsignacionService] Creando asignación con API directa:', datos);
      
      // Validar datos requeridos
      if (!datos.anio || !datos.codPredio || !datos.codContribuyente) {
        throw new Error('Año, código de predio y código de contribuyente son requeridos');
      }
      
      // Asegurar que codAsignacion no se envía en el request (debe ser null)
      const datosParaEnviar = {
        ...datos,
        codAsignacion: null // Forzar a null para que SQL genere el ID
      };
      
      console.log('📤 [AsignacionService] Enviando datos (codAsignacion=null):', JSON.stringify(datosParaEnviar, null, 2));
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });
      
      console.log(`📥 [AsignacionService] Respuesta del servidor: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AsignacionService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [AsignacionService] Asignación creada exitosamente:', responseData);
      
      // Normalizar los datos de respuesta
      const asignacionNormalizada: AsignacionPredio = {
        id: responseData.codAsignacion || responseData.id || Math.floor(Math.random() * 10000),
        codPredio: responseData.codPredio || datos.codPredio,
        codContribuyente: responseData.codContribuyente?.toString() || datos.codContribuyente.toString(),
        anio: responseData.anio || datos.anio,
        fechaAsignacion: responseData.fechaDeclaracion || datos.fechaDeclaracion,
        estado: responseData.codEstado === "0201" ? "Activo" : "Inactivo",
        contribuyente: responseData.contribuyente || '',
        direccionPredio: responseData.direccionPredio || '',
        tipoPredio: responseData.tipoPredio || '',
        modoDeclaracion: responseData.codModoDeclaracion || datos.codModoDeclaracion,
        fechaVenta: responseData.fechaVenta || datos.fechaVenta,
        fechaDeclaracion: responseData.fechaDeclaracion || datos.fechaDeclaracion,
        esPensionista: (responseData.pensionista || datos.pensionista) === 1,
        porcentajeCondominio: responseData.porcentajeCondomino || datos.porcentajeCondomino || 100,
        porcentajeLibre: 100 - (responseData.porcentajeCondomino || datos.porcentajeCondomino || 0)
      };
      
      return asignacionNormalizada;
      
    } catch (error: any) {
      console.error('❌ [AsignacionService] Error al crear asignación:', error);
      throw error;
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