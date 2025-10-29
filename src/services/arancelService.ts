// src/services/arancelService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * IMPORTANTE: Esta API acepta tanto form-data como query parameters.
 * Desde el navegador SOLO podemos usar query parameters en GET.
 * Las peticiones GET NO requieren autenticación.
 */

export interface ArancelData {
  codArancel: number | null;
  anio: number;
  codDireccion: number;
  costo: number | null;
  codUsuario: number | null;
  costoArancel: number;
  direccionCompleta: string;
  sector: string;
  barrio: string;
  calle: string;
}

export interface CreateArancelDTO {
  anio: number;
  codDireccion: number;
  costoArancel: number;
  codUsuario?: number;
}

// DTO específico para la API POST sin autenticación usando JSON
export interface CrearArancelApiDTO {
  codArancel: null; // Se asigna por SQL
  anio: number;
  codDireccion: number;
  costo: number;
  codUsuario: number;
}

// DTO específico para la API PUT sin autenticación usando JSON
export interface ActualizarArancelApiDTO {
  codArancel: number; // ID del arancel a actualizar
  anio: number;
  codDireccion: number;
  costo: number;
  codUsuario: number;
}

export type UpdateArancelDTO = Partial<CreateArancelDTO>;

export interface ArancelResponse {
  success: boolean;
  message: string;
  data: ArancelData[];
  pagina: number | null;
  limite: number | null;
  totalPaginas: number | null;
  totalRegistros: number | null;
}

class ArancelService extends BaseApiService<ArancelData, CreateArancelDTO, UpdateArancelDTO> {
  private static instance: ArancelService;
  
  private constructor() {
    super(
      '/api/arancel',
      {
        normalizeItem: (item: any) => ({
          codArancel: item.codArancel !== undefined ? item.codArancel : null,
          anio: item.anio || new Date().getFullYear(),
          codDireccion: item.codDireccion || 0,
          costo: item.costo !== undefined ? item.costo : null,
          codUsuario: item.codUsuario !== undefined ? item.codUsuario : null,
          costoArancel: parseFloat(item.costoArancel || item.costo || '0'),
          direccionCompleta: item.direccionCompleta || '',
          sector: item.sector !== undefined && item.sector !== null ? item.sector : '',
          barrio: item.barrio !== undefined && item.barrio !== null ? item.barrio : '',
          calle: item.calle !== undefined && item.calle !== null ? item.calle : ''
        }),
        
        validateItem: (item: ArancelData) => {
          return !!(
            item.anio && 
            item.codDireccion && 
            item.costoArancel >= 0
          );
        }
      },
      'arancel'
    );
  }
  
  static getInstance(): ArancelService {
    if (!ArancelService.instance) {
      ArancelService.instance = new ArancelService();
    }
    return ArancelService.instance;
  }

  /**
   * Lista aranceles usando query params - NO requiere autenticación
   * URL: GET http://26.161.18.122:8085/api/arancel?codDireccion=&anio=&parametroBusqueda=a&codUsuario=1
   * Ejemplo de respuesta JSON:
   * {
   *   "codArancel": null,
   *   "anio": 2024,
   *   "codDireccion": 1,
   *   "costo": null,
   *   "codUsuario": null,
   *   "costoArancel": 200.0,
   *   "direccionCompleta": "SECT. Central Barrio 1, Pje. Carlos Alvear, Cuadra 2, Lado P, Lotes: 1 - 20",
   *   "sector": null,
   *   "barrio": null,
   *   "calle": null
   * }
   */
  async listarArancelesGeneral(params?: {
    codDireccion?: number;
    anio?: number;
    parametroBusqueda?: string;
    codUsuario?: number;
  }): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles con params:', params);

      // Construir URL base
      const baseUrl = `${API_CONFIG.baseURL}/api/arancel`;

      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();

      // codDireccion (opcional, vacío si no se proporciona)
      if (params?.codDireccion !== undefined && params?.codDireccion > 0) {
        queryParams.set('codDireccion', params.codDireccion.toString());
      } else {
        queryParams.set('codDireccion', '');
      }

      // anio (opcional, vacío si no se proporciona)
      if (params?.anio !== undefined && params?.anio > 0) {
        queryParams.set('anio', params.anio.toString());
      } else {
        queryParams.set('anio', '');
      }

      // parametroBusqueda (opcional)
      if (params?.parametroBusqueda !== undefined) {
        queryParams.set('parametroBusqueda', params.parametroBusqueda);
      } else {
        queryParams.set('parametroBusqueda', '');
      }

      // codUsuario (requerido, por defecto 1)
      if (params?.codUsuario !== undefined) {
        queryParams.set('codUsuario', params.codUsuario.toString());
      } else {
        queryParams.set('codUsuario', '1');
      }
      
      const url = `${baseUrl}?${queryParams.toString()}`;
      
      console.log('📡 [ArancelService] GET URL construida:', url);
      console.log('📋 [ArancelService] Query params:', queryParams.toString());
      console.log('📋 [ArancelService] Ejemplo esperado: http://26.161.18.122:8085/api/arancel?codDireccion=&anio=&parametroBusqueda=a&codUsuario=1');
      
      // Realizar petición GET sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        if (response.status === 403) {
          throw new Error(`Acceso denegado (403). Verifique que el API esté configurado para permitir peticiones sin autenticación.`);
        }
        
        // En caso de error, devolver datos de fallback
        console.log('⚠️ [ArancelService] Usando datos de fallback por error API');
        return this.getDatosFallback();
      }
      
      const data = await response.json();
      console.log('✅ [ArancelService] Raw data recibida de API general:', data);
      
      // Procesar respuesta según la estructura
      let items = [];
      if (Array.isArray(data)) {
        // Si es un array directamente
        items = data;
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          // Si tiene propiedad data con array
          items = data.data;
        } else if (data.success !== undefined && data.data) {
          // Respuesta con estructura success/data
          items = Array.isArray(data.data) ? data.data : [data.data];
        } else {
          // Un solo objeto, convertir a array
          items = [data];
        }
      }
      
      console.log('✅ [ArancelService] Items para normalizar:', items);
      
      // Normalizar datos según estructura esperada de la API
      const normalized = items.map(item => ({
        codArancel: item.codArancel !== undefined ? item.codArancel : null,
        anio: item.anio || 0,
        codDireccion: item.codDireccion || 0,
        costo: item.costo !== undefined ? item.costo : null,
        codUsuario: item.codUsuario !== undefined ? item.codUsuario : null,
        costoArancel: parseFloat(item.costoArancel || item.costo || '0'),
        direccionCompleta: item.direccionCompleta || '',
        sector: item.sector !== undefined && item.sector !== null ? item.sector : '',
        barrio: item.barrio !== undefined && item.barrio !== null ? item.barrio : '',
        calle: item.calle !== undefined && item.calle !== null ? item.calle : ''
      }));
      
      console.log('✅ [ArancelService] Datos normalizados de API general:', normalized);
      return normalized;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error listando aranceles con API general:', error);
      console.error('❌ [ArancelService] Stack trace:', error.stack);
      
      // En caso de error, devolver datos de fallback
      console.log('⚠️ [ArancelService] Usando datos de fallback por error');
      return this.getDatosFallback();
    }
  }

  /**
   * Obtiene todos los aranceles usando la nueva API
   * Para obtener todos, usa parametroBusqueda vacío y sin filtro de año
   */
  async obtenerTodosAranceles(): Promise<ArancelData[]> {
    console.log('📋 [ArancelService] Obteniendo todos los aranceles (sin filtro de año)');
    return this.listarArancelesGeneral({
      parametroBusqueda: 'a',
      codDireccion: undefined,
      anio: undefined, // NO pasar año para obtener de todos los años
      codUsuario: 1
    });
  }

  /**
   * Sobrescribe el método getAll del BaseService para usar la nueva API
   */
  async getAll(): Promise<ArancelData[]> {
    return this.obtenerTodosAranceles();
  }

  /**
   * Datos de fallback para desarrollo cuando la API no está disponible
   */
  private getDatosFallback(): ArancelData[] {
    console.log('📋 [ArancelService] Generando datos de fallback');
    
    return [
      {
        codArancel: null,
        anio: 2025,
        codDireccion: 4,
        costo: null,
        codUsuario: null,
        costoArancel: 280.0,
        direccionCompleta: "AA.HH. Virgen de la puerta BARRIO barrio 178, CALLE proceres caidos, Cuadra 1, Lotes: 100 - 120",
        sector: "AA.HH. Virgen de la puerta",
        barrio: "barrio 178",
        calle: "proceres caidos"
      },
      {
        codArancel: null,
        anio: 2025,
        codDireccion: 5,
        costo: null,
        codUsuario: null,
        costoArancel: 350.0,
        direccionCompleta: "URBANIZACIÓN Los Pinos BARRIO barrio 200, CALLE las flores, Cuadra 2, Lotes: 200 - 250",
        sector: "URBANIZACIÓN Los Pinos",
        barrio: "barrio 200",
        calle: "las flores"
      },
      {
        codArancel: null,
        anio: 2025,
        codDireccion: 6,
        costo: null,
        codUsuario: null,
        costoArancel: 450.0,
        direccionCompleta: "PUEBLO JOVEN Santa Rosa BARRIO barrio 301, CALLE los jardines, Cuadra 3, Lotes: 300 - 350",
        sector: "PUEBLO JOVEN Santa Rosa",
        barrio: "barrio 301",
        calle: "los jardines"
      }
    ];
  }

  /**
   * Lista aranceles usando la nueva API con query params - NO requiere autenticación
   * URL: GET http://26.161.18.122:8085/api/arancel?codDireccion=&anio=&parametroBusqueda=a&codUsuario=1
   * Ejemplo de respuesta JSON:
   * {
   *   "codArancel": null,
   *   "anio": 2025,
   *   "codDireccion": 1,
   *   "costo": null,
   *   "codUsuario": null,
   *   "costoArancel": 300.75,
   *   "direccionCompleta": "Norte Actualizado ultimo BARRIO Barrio Primavera Modificado...",
   *   "sector": null,
   *   "barrio": null,
   *   "calle": null
   * }
   */
  async listarAranceles(params?: { 
    anio?: number; 
    codDireccion?: number; 
    codUsuario?: number;
    parametroBusqueda?: string;
  }): Promise<ArancelData[]> {
    try {
      console.log('🔍 [ArancelService] Listando aranceles con parámetros:', params);
      
      // Construir URL base para el nuevo endpoint
      const baseUrl = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      // Construir parámetros de consulta según la nueva API
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros según la nueva estructura
      queryParams.set('codDireccion', params?.codDireccion?.toString() || '');
      queryParams.set('anio', params?.anio?.toString() || '');
      queryParams.set('parametroBusqueda', params?.parametroBusqueda || 'a');
      queryParams.set('codUsuario', params?.codUsuario?.toString() || '1');
      
      const url = `${baseUrl}?${queryParams.toString()}`;
      
      console.log('📡 [ArancelService] GET URL construida:', url);
      console.log('📋 [ArancelService] Query params:', queryParams.toString());
      console.log('📋 [ArancelService] Ejemplo esperado: http://26.161.18.122:8085/api/arancel?codDireccion=&anio=&parametroBusqueda=a&codUsuario=1');
      
      // Realizar petición GET sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        if (response.status === 403) {
          throw new Error(`Acceso denegado (403). Verifique que el API esté configurado para permitir peticiones sin autenticación.`);
        }
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ [ArancelService] Raw data recibida:', data);
      
      // Procesar respuesta según la estructura
      let items = [];
      if (Array.isArray(data)) {
        // Si es un array directamente
        items = data;
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          // Si tiene propiedad data con array
          items = data.data;
        } else if (data.success !== undefined && data.data) {
          // Respuesta con estructura success/data
          items = Array.isArray(data.data) ? data.data : [data.data];
        } else {
          // Un solo objeto, convertir a array
          items = [data];
        }
      }
      
      console.log('✅ [ArancelService] Items para normalizar:', items);
      
      // Normalizar datos según estructura esperada
      const normalized = items.map(item => ({
        codArancel: item.codArancel !== undefined ? item.codArancel : null,
        anio: item.anio || 0,
        codDireccion: item.codDireccion || 0,
        costo: item.costo !== undefined ? item.costo : null,
        codUsuario: item.codUsuario !== undefined ? item.codUsuario : null,
        costoArancel: parseFloat(item.costoArancel || item.costo || '0'),
        direccionCompleta: item.direccionCompleta || '',
        sector: item.sector !== undefined && item.sector !== null ? item.sector : '',
        barrio: item.barrio !== undefined && item.barrio !== null ? item.barrio : '',
        calle: item.calle !== undefined && item.calle !== null ? item.calle : ''
      }));
      
      console.log('✅ [ArancelService] Datos normalizados:', normalized);
      return normalized;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error listando aranceles:', error);
      console.error('❌ [ArancelService] Stack trace:', error.stack);
      throw error;
    }
  }
  
  /**
   * Obtiene un arancel por año y dirección - NO requiere autenticación
   */
  async obtenerPorAnioYDireccion(anio: number, codDireccion: number): Promise<ArancelData | null> {
    try {
      console.log('🔍 [ArancelService] Obteniendo arancel:', { anio, codDireccion });
      
      const params = new URLSearchParams({
        codDireccion: codDireccion.toString(),
        anio: anio.toString(),
        codUsuario: '1'
      });
      
      const url = `${API_CONFIG.baseURL}${this.endpoint}?${params.toString()}`;
      console.log('📡 [ArancelService] GET:', url);
      
      // Petición directa sin autenticación
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // NO incluir Authorization
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        const aranceles = this.normalizeData(Array.isArray(responseData.data) ? responseData.data : [responseData.data]);
        return aranceles.find(a => a.codDireccion === codDireccion && a.anio === anio) || null;
      }
      
      return null;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo arancel - POST puede usar FormData
   */
  async crearArancel(datos: CreateArancelDTO): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando arancel:', datos);
      
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('codDireccion', datos.codDireccion.toString());
      formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', (datos.codUsuario || 1).toString());
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
        // NO incluir headers, el navegador los configura automáticamente para FormData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel creado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error('Error al crear el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al crear el arancel');
      throw error;
    }
  }
  
  /**
   * Crea un nuevo arancel usando POST sin autenticación con JSON
   * URL: POST http://26.161.18.122:8085/api/arancel
   * NO requiere autenticación
   * Estructura JSON: {"codArancel": null, "anio": 2019, "codDireccion": 1, "costo": 100.8, "codUsuario": 1}
   */
  async crearArancelSinAuth(datos: CrearArancelApiDTO): Promise<ArancelData> {
    try {
      console.log('➕ [ArancelService] Creando arancel sin autenticación:', datos);
      
      // Validar que los datos requeridos estén presentes
      if (!datos.anio || !datos.codDireccion || datos.costo === undefined || !datos.codUsuario) {
        throw new Error('Faltan datos requeridos para crear el arancel');
      }

      // IMPORTANTE: Asegurar que codArancel siempre sea null
      const datosParaEnviar = {
        codArancel: null, // FORZAR a null - SQL lo asigna automáticamente
        anio: Number(datos.anio), // Asegurar que sea número
        codDireccion: Number(datos.codDireccion), // Asegurar que sea número
        costo: Number(datos.costo), // Asegurar que sea número
        codUsuario: Number(datos.codUsuario) // Asegurar que sea número
      };

      // Ejemplo de datos válidos para comparar con Postman:
      console.log('📋 [ArancelService] Ejemplo válido para Postman:');
      console.log(`{
  "codArancel": null,
  "anio": ${datosParaEnviar.anio},
  "codDireccion": ${datosParaEnviar.codDireccion},
  "costo": ${datosParaEnviar.costo},
  "codUsuario": ${datosParaEnviar.codUsuario}
}`);
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      console.log('📡 [ArancelService] URL para crear:', url);
      console.log('📡 [ArancelService] Datos a enviar (con codArancel null):', datosParaEnviar);
      console.log('📡 [ArancelService] JSON stringificado a enviar:', JSON.stringify(datosParaEnviar, null, 2));
      
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
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [ArancelService] Arancel creado exitosamente:', responseData);
      
      // Normalizar la respuesta según la estructura esperada
      const arancelCreado: ArancelData = {
        codArancel: responseData.codArancel || responseData.id || null,
        anio: responseData.anio || datos.anio,
        codDireccion: responseData.codDireccion || datos.codDireccion,
        costo: responseData.costo || datos.costo,
        codUsuario: responseData.codUsuario || datos.codUsuario,
        costoArancel: responseData.costo || datos.costo // Mapear costo a costoArancel
      };
      
      console.log('✅ [ArancelService] Arancel normalizado:', arancelCreado);
      return arancelCreado;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error creando arancel sin auth:', error);
      console.error('❌ [ArancelService] Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Helper para crear un arancel con valores por defecto
   * Facilita la creación proporcionando valores comunes sin autenticación
   * 
   * @example
   * // Ejemplo de uso:
   * arancelService.crearArancelConDefaults({
   *   anio: 2019,
   *   codDireccion: 1,
   *   costo: 100.8,
   *   codUsuario: 1
   * });
   */
  crearArancelConDefaults(datos: {
    anio: number;
    codDireccion: number;
    costo: number;
    codUsuario?: number;
  }): Promise<ArancelData> {
    // IMPORTANTE: codArancel SIEMPRE debe ser null - SQL lo asigna automáticamente
    const arancelCompleto: CrearArancelApiDTO = {
      codArancel: null, // SIEMPRE null - asignado por SQL
      anio: datos.anio,
      codDireccion: datos.codDireccion,
      costo: datos.costo,
      codUsuario: datos.codUsuario || 1
    };

    console.log('🔨 [ArancelService] Helper - Creando con valores por defecto:', arancelCompleto);
    return this.crearArancelSinAuth(arancelCompleto);
  }

  /**
   * Actualiza un arancel - PUT requiere FormData (método original)
   * IMPORTANTE: Usar URL completa para evitar problemas con proxy
   */
  async actualizarArancel(codArancel: number, datos: UpdateArancelDTO): Promise<ArancelData> {
    try {
      console.log('📝 [ArancelService] Actualizando arancel:', codArancel, datos);
      
      // IMPORTANTE: Usar FormData, no JSON
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.codDireccion !== undefined) formData.append('codDireccion', datos.codDireccion.toString());
      if (datos.costoArancel !== undefined) formData.append('costoArancel', datos.costoArancel.toString());
      formData.append('codUsuario', '1');
      
      console.log('📡 [ArancelService] Enviando FormData para actualización');
      
      // IMPORTANTE: Usar URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`;
      console.log('🌐 [ArancelService] URL completa:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        body: formData
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: response.url
        });
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: ArancelResponse = await response.json();
      console.log('✅ [ArancelService] Respuesta:', responseData);
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Arancel actualizado exitosamente');
        const aranceles = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(aranceles)[0];
      }
      
      throw new Error(responseData.message || 'Error al actualizar el arancel');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error completo:', error);
      console.error('❌ [ArancelService] Stack:', error.stack);
      NotificationService.error(error.message || 'Error al actualizar el arancel');
      throw error;
    }
  }

  /**
   * Actualiza un arancel usando PUT sin autenticación con JSON
   * URL: PUT http://26.161.18.122:8085/api/arancel
   * NO requiere autenticación
   * Estructura JSON: {"codArancel": 4, "anio": 2025, "codDireccion": 1, "costo": 100.8, "codUsuario": 1}
   */
  async actualizarArancelSinAuth(datos: ActualizarArancelApiDTO): Promise<ArancelData> {
    try {
      console.log('📝 [ArancelService] Actualizando arancel sin autenticación:', datos);
      
      // Validar que los datos requeridos estén presentes
      if (!datos.codArancel || !datos.anio || !datos.codDireccion || datos.costo === undefined || !datos.codUsuario) {
        throw new Error('Faltan datos requeridos para actualizar el arancel');
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        codArancel: Number(datos.codArancel),
        anio: Number(datos.anio),
        codDireccion: Number(datos.codDireccion),
        costo: Number(datos.costo),
        codUsuario: Number(datos.codUsuario)
      };

      // Ejemplo de datos válidos para comparar con Postman:
      console.log('📋 [ArancelService] Ejemplo válido para Postman:');
      console.log(`{
  "codArancel": ${datosParaEnviar.codArancel},
  "anio": ${datosParaEnviar.anio},
  "codDireccion": ${datosParaEnviar.codDireccion},
  "costo": ${datosParaEnviar.costo},
  "codUsuario": ${datosParaEnviar.codUsuario}
}`);
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      console.log('📡 [ArancelService] URL para actualizar:', url);
      console.log('📡 [ArancelService] Datos a enviar:', datosParaEnviar);
      console.log('📡 [ArancelService] JSON stringificado a enviar:', JSON.stringify(datosParaEnviar, null, 2));
      
      // Petición PUT sin autenticación usando JSON
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
          // NO incluir Authorization - sin autenticación
        },
        body: JSON.stringify(datosParaEnviar)
      });
      
      console.log('📡 [ArancelService] Response Status:', response.status);
      console.log('📡 [ArancelService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ArancelService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [ArancelService] Arancel actualizado exitosamente:', responseData);
      
      // Normalizar la respuesta según la estructura esperada
      const arancelActualizado: ArancelData = {
        codArancel: responseData.codArancel || datos.codArancel,
        anio: responseData.anio || datos.anio,
        codDireccion: responseData.codDireccion || datos.codDireccion,
        costo: responseData.costo || datos.costo,
        codUsuario: responseData.codUsuario || datos.codUsuario,
        costoArancel: responseData.costo || datos.costo // Mapear costo a costoArancel
      };
      
      console.log('✅ [ArancelService] Arancel actualizado normalizado:', arancelActualizado);
      return arancelActualizado;
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error actualizando arancel sin auth:', error);
      console.error('❌ [ArancelService] Stack trace:', error.stack);
      throw error;
    }
  }
  
  /**
   * Elimina un arancel
   */
  async eliminarArancel(codArancel: number): Promise<void> {
    try {
      console.log('🗑️ [ArancelService] Eliminando arancel:', codArancel);
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${codArancel}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      NotificationService.success('Arancel eliminado exitosamente');
      
    } catch (error: any) {
      console.error('❌ [ArancelService] Error:', error);
      NotificationService.error(error.message || 'Error al eliminar el arancel');
      throw error;
    }
  }
}

// Exportar la instancia singleton
const arancelService = ArancelService.getInstance();
export default arancelService;

// También exportar la clase para tests
export { ArancelService };