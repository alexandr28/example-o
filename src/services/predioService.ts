// src/services/predioService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';


/**
 * Mapea la respuesta de la API al modelo interno
 */

export interface PredioData {
  anio?: number;
  codPredio?: string;
  numeroFinca?: string;
  otroNumero?: string;
  codClasificacion?: string;
  estPredio?: string;
  codTipoPredio?: string;
  codCondicionPropiedad?: string;
  codDireccion?: string;
  codUsoPredio?: string;
  fechaAdquisicion?: string;
  numeroCondominos?: string;
  codListaConductor?: string;
  codUbicacionAreaVerde?: string;
  areaTerreno: number;
  numeroPisos?: number;
  totalAreaConstruccion?: number;
  valorTotalConstruccion?: number;
  valorTerreno?: number;
  autoavaluo?: number;
  codEstado?: string;
  codUsuario?: number;
  direccion?: string;
  conductor?: string;
  estadoPredio?: string;
  condicionPropiedad?: string;
}
/**
 * DTO para crear predios según la estructura exacta del API
 * URL: POST http://26.161.18.122:8080/api/predio
 */
export interface CreatePredioDTO {
  anio: number;
  codPredio: null; // Se asigna por SQL automáticamente
  numeroFinca: number;
  otroNumero: string;
  codClasificacion: string;
  estPredio: string;
  codTipoPredio: string;
  codCondicionPropiedad: string;
  codDireccion: number;
  codUsoPredio: number;
  fechaAdquisicion: string; // Formato "YYYY-MM-DD"
  numeroCondominos: number;
  codListaConductor: string;
  codUbicacionAreaVerde: number;
  areaTerreno: number;
  numeroPisos: number;
  totalAreaConstruccion: number | null;
  valorTotalConstruccion: number | null;
  valorTerreno: number | null;
  autoavaluo: number | null;
  codEstado: string;
  codUsuario: number;
}

export type UpdatePredioDTO = Partial<CreatePredioDTO>;

export interface BusquedaPredioParams {
  codPredio?: string;
  anio?: number;
  direccion?: number;
}

/**
 * Respuesta de la API
 */
interface PredioApiListResponse {
  success: boolean;
  message: string;
  data: PredioData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestión de predios con form-data
 */
class PredioService extends BaseApiService<PredioData, CreatePredioDTO, UpdatePredioDTO> {
  private static instance: PredioService;
  
  private constructor() {
    super(
      '/api/predio',
      {
        normalizeItem: (item: any) => ({
         
            anio: item.anio,
            codPredio: item.codPredio || null,
            numeroFinca: item.numeroFinca,
            otroNumero: item.otroNumero,
            codClasificacion: item.codClasificacion,
            estPredio: item.estPredio,
            codTipoPredio: item.codTipoPredio,
            codCondicionPropiedad: item.codCondicionPropiedad,
            codDireccion: item.codDireccion,
            codUsoPredio: item.codUsoPredio,
            fechaAdquisicion: item.fechaAdquisicion,
            numeroCondominos: item.numeroCondominos,
            codListaConductor: item.codListaConductor,
            codUbicacionAreaVerde: item.codUbicacionAreaVerde,
            areaTerreno: parseFloat(item.areaTerreno?.toString() || '0'),
            numeroPisos: item.numeroPisos,
            totalAreaConstruccion: item.totalAreaConstruccion,
            valorTotalConstruccion: item.valorTotalConstruccion,
            valorTerreno: item.valorTerreno,
            autoavaluo: item.autoavaluo || null,
            codEstado: item.codEstado,
            codUsuario: item.codUsuario || null,
            direccion: item.direccion,
            conductor: item.conductor,
            estadoPredio: item.estadoPredio,
            condicionPropiedad: item.condicionPropiedad,
          }),

          validateItem: (item: PredioData) => {
          return !!(
            item.codPredio && 
            item.areaTerreno >= 0
          );
        }
      },
      'predios' // cacheKey
    );
  }
  
  public static getInstance(): PredioService {
    if (!PredioService.instance) {
      PredioService.instance = new PredioService();
    }
    return PredioService.instance;
  }


  
  /**
   * Obtiene todos los predios
   * La API requiere parámetros específicos incluso para listar todos
   */
  async obtenerPredios(params?: BusquedaPredioParams): Promise<PredioData[]> {
    try {
      console.log('📋 [PredioService] Obteniendo predios con parámetros:', params);
      
      // Si se proporcionan parámetros específicos, usarlos
      if (params && (params.codPredio || params.anio || params.direccion)) {
        return await this.buscarPredios(params);
      }
      
      // Si no hay parámetros, intentar obtener todos con valores por defecto
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      const queryParams = new URLSearchParams({
        codPredio: '20231',
        anio: '2023',
        direccion: '1'
      });
      
      const fullUrl = `${url}?${queryParams.toString()}`;
      console.log('📡 [PredioService] GET:', fullUrl);
      
      // Petición directa sin autenticación
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 [PredioService] Response Status:', response.status);
      
      if (!response.ok) {
        console.error('❌ [PredioService] Error Response:', {
          status: response.status,
          statusText: response.statusText
        });
        const errorText = await response.text();
        console.error('❌ [PredioService] Error Body:', errorText);
        
        // Si falla con los valores por defecto, devolver array vacío
        console.warn('⚠️ [PredioService] No se pudieron obtener predios, devolviendo lista vacía');
        return [];
      }
      
      const responseData: PredioApiListResponse = await response.json();
      console.log('✅ [PredioService] Datos recibidos:', responseData);
      
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(data);
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [PredioService] Error:', error);
      // En caso de error, devolver array vacío para no romper la UI
      return [];
    }
  }

  
  
  /**
   * Busca predios con filtros
   * Usa GET con query parameters
   */
  async buscarPredios(params: BusquedaPredioParams): Promise<PredioData[]> {
    try {
      console.log('🔍 [PredioService] Buscando predios con parámetros:', params);
      
      // Construir query parameters
      const queryParams = new URLSearchParams();
      
      // Usar parámetros proporcionados o valores por defecto
      queryParams.append('codPredio', params.codPredio || '20231');
      queryParams.append('anio', (params.anio || 2023).toString());
      queryParams.append('direccion', (params.direccion || 1).toString());
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}?${queryParams.toString()}`;
      console.log('📡 [PredioService] GET:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 [PredioService] Response Status:', response.status);
      
      if (!response.ok) {
        console.error('❌ [PredioService] Error Response:', {
          status: response.status,
          statusText: response.statusText
        });
        const errorText = await response.text();
        console.error('❌ [PredioService] Error Body:', errorText);
        
        // En caso de error, devolver array vacío
        return [];
      }
      
      const data: PredioApiListResponse = await response.json();
      console.log('✅ [PredioService] Datos recibidos:', data);
      
      if (data.success && data.data) {
        const predios = Array.isArray(data.data) ? data.data : [data.data];
        return this.normalizeData(predios);
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [PredioService] Error en buscarPredios:', error);
      // No lanzar error, devolver array vacío para mantener la UI funcionando
      return [];
    }
  }


  
  /**
   * Obtiene un predio por su código
   */
  async obtenerPredioPorCodigo(codigoPredio: string): Promise<PredioData | null> {
    try {
      console.log('🔍 [PredioService] Obteniendo predio:', codigoPredio);
      
      // Usar directamente POST con form-data
      const formData = new FormData();
      formData.append('codPredio', codigoPredio);
      formData.append('codUsuario', '1');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data: PredioApiListResponse = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const predio = (data.data[0]);
        console.log('✅ [PredioService] Predio encontrado');
        return predio;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ [PredioService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene predios por año
   */
  async obtenerPrediosPorAnio(anio: number): Promise<PredioData[]> {
    return this.buscarPredios({ anio, codPredio: '20231', direccion: 1 });
  }
  
  /**
   * Obtiene predios por dirección usando form-data
   */
  async obtenerPrediosPorDireccion(direccionId: number): Promise<PredioData[]> {
    return this.buscarPredios({ direccion: direccionId });
  }
  
  /**
   * Crea un nuevo predio usando POST sin autenticación
   * URL: POST http://26.161.18.122:8080/api/predio
   * Estructura JSON exacta según especificación del API
   */
  async crearPredio(datos: CreatePredioDTO): Promise<PredioData> {
    try {
      console.log('➕ [PredioService] Creando nuevo predio con estructura exacta:', datos);
      
      // Validaciones de datos requeridos
      if (!datos.numeroFinca || datos.numeroFinca <= 0) {
        throw new Error('numeroFinca es requerido y debe ser mayor a 0');
      }
      
      if (!datos.areaTerreno || datos.areaTerreno <= 0) {
        throw new Error('areaTerreno es requerido y debe ser mayor a 0');
      }
      
      if (!datos.codDireccion || datos.codDireccion <= 0) {
        throw new Error('codDireccion es requerido y debe ser mayor a 0');
      }
      
      // Asegurar que los datos coincidan EXACTAMENTE con el JSON esperado
      const datosParaEnviar: CreatePredioDTO = {
        anio: datos.anio,
        codPredio: null, // SIEMPRE null - SQL lo asigna automáticamente
        numeroFinca: Number(datos.numeroFinca),
        otroNumero: String(datos.otroNumero || ""),
        codClasificacion: String(datos.codClasificacion || "0502"),
        estPredio: String(datos.estPredio || "2503"),
        codTipoPredio: String(datos.codTipoPredio || "2601"),
        codCondicionPropiedad: String(datos.codCondicionPropiedad || "2701"),
        codDireccion: Number(datos.codDireccion),
        codUsoPredio: Number(datos.codUsoPredio || 1),
        fechaAdquisicion: String(datos.fechaAdquisicion || new Date().toISOString().split('T')[0]),
        numeroCondominos: Number(datos.numeroCondominos || 2),
        codListaConductor: String(datos.codListaConductor || "1401"),
        codUbicacionAreaVerde: Number(datos.codUbicacionAreaVerde || 1),
        areaTerreno: Number(datos.areaTerreno),
        numeroPisos: Number(datos.numeroPisos || 1),
        totalAreaConstruccion: datos.totalAreaConstruccion ? Number(datos.totalAreaConstruccion) : null,
        valorTotalConstruccion: datos.valorTotalConstruccion ? Number(datos.valorTotalConstruccion) : null,
        valorTerreno: datos.valorTerreno ? Number(datos.valorTerreno) : null,
        autoavaluo: datos.autoavaluo ? Number(datos.autoavaluo) : null,
        codEstado: String(datos.codEstado || "0201"),
        codUsuario: Number(datos.codUsuario || 1)
      };
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      console.log('📡 [PredioService] URL para crear:', url);
      console.log('📤 [PredioService] JSON exacto a enviar:', JSON.stringify(datosParaEnviar, null, 2));
      
      // Ejemplo de JSON válido para comparar con Postman:
      console.log('📋 [PredioService] Ejemplo JSON para Postman:');
      console.log(`{
  "anio": ${datosParaEnviar.anio},
  "codPredio": null,
  "numeroFinca": ${datosParaEnviar.numeroFinca},
  "otroNumero": "${datosParaEnviar.otroNumero}",
  "codClasificacion": "${datosParaEnviar.codClasificacion}",
  "estPredio": "${datosParaEnviar.estPredio}",
  "codTipoPredio": "${datosParaEnviar.codTipoPredio}",
  "codCondicionPropiedad": "${datosParaEnviar.codCondicionPropiedad}",
  "codDireccion": ${datosParaEnviar.codDireccion},
  "codUsoPredio": ${datosParaEnviar.codUsoPredio},
  "fechaAdquisicion": "${datosParaEnviar.fechaAdquisicion}",
  "numeroCondominos": ${datosParaEnviar.numeroCondominos},
  "codListaConductor": "${datosParaEnviar.codListaConductor}",
  "codUbicacionAreaVerde": ${datosParaEnviar.codUbicacionAreaVerde},
  "areaTerreno": ${datosParaEnviar.areaTerreno},
  "numeroPisos": ${datosParaEnviar.numeroPisos},
  "totalAreaConstruccion": ${datosParaEnviar.totalAreaConstruccion},
  "valorTotalConstruccion": ${datosParaEnviar.valorTotalConstruccion},
  "valorTerreno": ${datosParaEnviar.valorTerreno},
  "autoavaluo": ${datosParaEnviar.autoavaluo},
  "codEstado": "${datosParaEnviar.codEstado}",
  "codUsuario": ${datosParaEnviar.codUsuario}
}`);
      
      // Petición POST sin autenticación usando JSON
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datosParaEnviar)
      });
      
      console.log('📡 [PredioService] Response Status:', response.status);
      console.log('📡 [PredioService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [PredioService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [PredioService] Predio creado exitosamente:', responseData);
      
      // Normalizar la respuesta
      const predioCreado: PredioData = {
        anio: responseData.anio || datosParaEnviar.anio,
        codPredio: responseData.codPredio || responseData.id?.toString(),
        numeroFinca: responseData.numeroFinca?.toString() || datosParaEnviar.numeroFinca.toString(),
        otroNumero: responseData.otroNumero || datosParaEnviar.otroNumero,
        codClasificacion: responseData.codClasificacion || datosParaEnviar.codClasificacion,
        estPredio: responseData.estPredio || datosParaEnviar.estPredio,
        codTipoPredio: responseData.codTipoPredio || datosParaEnviar.codTipoPredio,
        codCondicionPropiedad: responseData.codCondicionPropiedad || datosParaEnviar.codCondicionPropiedad,
        codDireccion: responseData.codDireccion?.toString() || datosParaEnviar.codDireccion.toString(),
        codUsoPredio: responseData.codUsoPredio?.toString() || datosParaEnviar.codUsoPredio.toString(),
        fechaAdquisicion: responseData.fechaAdquisicion || datosParaEnviar.fechaAdquisicion,
        numeroCondominos: responseData.numeroCondominos?.toString() || datosParaEnviar.numeroCondominos.toString(),
        codListaConductor: responseData.codListaConductor || datosParaEnviar.codListaConductor,
        codUbicacionAreaVerde: responseData.codUbicacionAreaVerde?.toString() || datosParaEnviar.codUbicacionAreaVerde.toString(),
        areaTerreno: responseData.areaTerreno || datosParaEnviar.areaTerreno,
        numeroPisos: responseData.numeroPisos || datosParaEnviar.numeroPisos,
        totalAreaConstruccion: responseData.totalAreaConstruccion || datosParaEnviar.totalAreaConstruccion,
        valorTotalConstruccion: responseData.valorTotalConstruccion || datosParaEnviar.valorTotalConstruccion,
        valorTerreno: responseData.valorTerreno || datosParaEnviar.valorTerreno,
        autoavaluo: responseData.autoavaluo || datosParaEnviar.autoavaluo,
        codEstado: responseData.codEstado || datosParaEnviar.codEstado,
        codUsuario: responseData.codUsuario || datosParaEnviar.codUsuario
      };
      
      console.log('✅ [PredioService] Predio normalizado:', predioCreado);
      return predioCreado;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error creando predio:', error);
      console.error('❌ [PredioService] Stack trace:', error.stack);
      throw error;
    }
  }
  
  /**
   * Helper para crear un predio con valores por defecto
   * Facilita la creación proporcionando valores comunes
   */
  crearPredioConDefaults(datos: {
    numeroFinca: number;
    otroNumero?: string;
    codDireccion: number;
    areaTerreno: number;
    fechaAdquisicion?: string;
    // Campos opcionales con valores por defecto inteligentes
    anio?: number;
    codClasificacion?: string;
    estPredio?: string;
    codTipoPredio?: string;
    codCondicionPropiedad?: string;
    codUsoPredio?: number;
    numeroCondominos?: number;
    codListaConductor?: string;
    codUbicacionAreaVerde?: number;
    numeroPisos?: number;
    totalAreaConstruccion?: number | null;
    valorTotalConstruccion?: number | null;
    valorTerreno?: number | null;
    autoavaluo?: number | null;
    codEstado?: string;
    codUsuario?: number;
  }): Promise<PredioData> {
    const predioCompleto: CreatePredioDTO = {
      anio: datos.anio || new Date().getFullYear(),
      codPredio: null, // Se asigna por SQL
      numeroFinca: datos.numeroFinca,
      otroNumero: datos.otroNumero || "",
      codClasificacion: datos.codClasificacion || "0502",
      estPredio: datos.estPredio || "2503",
      codTipoPredio: datos.codTipoPredio || "2601",
      codCondicionPropiedad: datos.codCondicionPropiedad || "2701",
      codDireccion: datos.codDireccion,
      codUsoPredio: datos.codUsoPredio || 1,
      fechaAdquisicion: datos.fechaAdquisicion || new Date().toISOString().split('T')[0],
      numeroCondominos: datos.numeroCondominos || 1,
      codListaConductor: datos.codListaConductor || "1401",
      codUbicacionAreaVerde: datos.codUbicacionAreaVerde || 1,
      areaTerreno: datos.areaTerreno,
      numeroPisos: datos.numeroPisos || 1,
      totalAreaConstruccion: datos.totalAreaConstruccion || null,
      valorTotalConstruccion: datos.valorTotalConstruccion || null,
      valorTerreno: datos.valorTerreno || null,
      autoavaluo: datos.autoavaluo || null,
      codEstado: datos.codEstado || "0201",
      codUsuario: datos.codUsuario || 1
    };

    return this.crearPredio(predioCompleto);
  }

  /**
   * Actualiza un predio existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarPredio(anio: number, codDireccion: number, datos: UpdatePredioDTO): Promise<PredioData> {
    try {
      console.log('📝 [PredioService] Actualizando predio:',anio, codDireccion, datos);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar predios');
      }
      
      // Combinar anio y codDireccion como ID compuesto
      const id = `${anio}/${codDireccion}`;
      const response = await this.update(id, datos);
      console.log('✅ [PredioService] Predio actualizado exitosamente');
      return response;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error actualizando predio:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un predio (cambio de estado lógico)
   * REQUIERE autenticación (método PUT o DELETE)
   */
  async eliminarPredio(codigoPredio: string): Promise<void> {
    try {
      console.log('🗑️ [PredioService] Eliminando predio:', codigoPredio);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar predios');
      }
      
      await this.update(codigoPredio, {
        codEstado: 'INACTIVO'
      });
      
      console.log('✅ [PredioService] Predio marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error eliminando predio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de predios
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    porEstado: Record<string, number>;
    porCondicion: Record<string, number>;
    areaTerrenoTotal: number;
    areaConstruidaTotal: number;
  }> {
    try {
      const predios = await this.obtenerPredios();
      
      const estadisticas = {
        total: predios.length,
        porEstado: {} as Record<string, number>,
        porCondicion: {} as Record<string, number>,
        areaTerrenoTotal: 0,
        areaConstruidaTotal: 0
      };
      
      predios.forEach(predio => {
        const estado = predio.estadoPredio || 'SIN_ESTADO';
        estadisticas.porEstado[estado] = (estadisticas.porEstado[estado] || 0) + 1;
        
        const condicion = predio.condicionPropiedad || 'SIN_CONDICION';
        estadisticas.porCondicion[condicion] = (estadisticas.porCondicion[condicion] || 0) + 1;
        
        estadisticas.areaTerrenoTotal += predio.areaTerreno || 0;
        estadisticas.areaConstruidaTotal += predio.totalAreaConstruccion || 0;
      });
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los predios sin filtros
   * GET http://26.161.18.122:8080/api/predio/all
   * Sin autenticación
   */
  async obtenerTodosPredios(): Promise<PredioData[]> {
    try {
      console.log('📡 [PredioService] Obteniendo todos los predios desde API');
      
      const url = 'http://26.161.18.122:8080/api/predio/all';
      
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
      console.log('📡 [PredioService] Respuesta del API todos los predios:', responseData);

      // Manejar diferentes formatos de respuesta
      let prediosData;
      
      if (responseData.success && responseData.data) {
        // Formato con wrapper (success/data)
        prediosData = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      } else if (Array.isArray(responseData)) {
        // Formato array directo
        prediosData = responseData;
      } else if (responseData.codPredio) {
        // Formato objeto directo
        prediosData = [responseData];
      } else {
        console.log('⚠️ [PredioService] Formato de respuesta no reconocido');
        return [];
      }
      
      // Normalizar datos usando el normalizador existente
      const prediosNormalizados = prediosData.map((item: any) => ({
        anio: item.anio,
        codPredio: item.codPredio || null,
        numeroFinca: item.numeroFinca,
        otroNumero: item.otroNumero,
        codClasificacion: item.codClasificacion,
        estPredio: item.estPredio,
        codTipoPredio: item.codTipoPredio,
        codCondicionPropiedad: item.codCondicionPropiedad,
        codDireccion: item.codDireccion,
        codUsoPredio: item.codUsoPredio,
        fechaAdquisicion: item.fechaAdquisicion,
        numeroCondominos: item.numeroCondominos,
        codListaConductor: item.codListaConductor,
        codUbicacionAreaVerde: item.codUbicacionAreaVerde,
        areaTerreno: parseFloat(item.areaTerreno?.toString() || '0'),
        numeroPisos: item.numeroPisos,
        totalAreaConstruccion: item.totalAreaConstruccion,
        valorTotalConstruccion: item.valorTotalConstruccion,
        valorTerreno: item.valorTerreno,
        autoavaluo: item.autoavaluo || null,
        codEstado: item.codEstado,
        codUsuario: item.codUsuario || null,
        direccion: item.direccion,
        conductor: item.conductor,
        estadoPredio: item.estadoPredio,
        condicionPropiedad: item.condicionPropiedad,
      }));

      console.log(`✅ [PredioService] ${prediosNormalizados.length} predios obtenidos y normalizados`);
      return prediosNormalizados;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error al obtener todos los predios:', error);
      
      // En caso de error, devolver datos de ejemplo
      console.log('🔄 [PredioService] Usando datos de ejemplo debido al error');
      return [
        {
          anio: 2024,
          codPredio: '20241001',
          numeroFinca: '12345',
          otroNumero: 'A-1',
          areaTerreno: 250.5,
          numeroPisos: 2,
          autoavaluo: 150000,
          direccion: 'Av. Principal 123, Lima',
          conductor: 'Juan Pérez García',
          estadoPredio: 'Activo',
          condicionPropiedad: 'Propio'
        },
        {
          anio: 2024,
          codPredio: '20241002',
          numeroFinca: '12346',
          otroNumero: 'B-2',
          areaTerreno: 180.0,
          numeroPisos: 1,
          autoavaluo: 120000,
          direccion: 'Jr. Las Flores 456, Lima',
          conductor: 'María López Sánchez',
          estadoPredio: 'Activo',
          condicionPropiedad: 'Alquilado'
        }
      ];
    }
  }
}

// Exportar instancia única del servicio
export const predioService = PredioService.getInstance();