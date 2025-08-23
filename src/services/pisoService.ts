// src/services/pisoService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Piso
 */
export interface PisoData {
  id: number;
  codigoPredio: number;
  numeroPiso: number;
  areaConstruida: number;
  clasificacion?: string;
  materialEstructural?: string;
  estadoConservacion?: string;
  estadoConstruccion?: string;
  categoriaValorUnitario?: string;
  añoConstruccion?: number;
  mesTermino?: number;
  unidadesUso?: number;
  porcentajeAreaComun?: number;
  observaciones?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreatePisoDTO {
  codigoPredio: number;
  numeroPiso: number;
  areaConstruida: number;
  clasificacion?: string;
  materialEstructural?: string;
  estadoConservacion?: string;
  estadoConstruccion?: string;
  categoriaValorUnitario?: string;
  añoConstruccion?: number;
  mesTermino?: number;
  unidadesUso?: number;
  porcentajeAreaComun?: number;
  observaciones?: string;
  codUsuario?: number;
}

/**
 * DTO para crear pisos según la estructura exacta del API
 * URL: POST http://26.161.18.122:8080/api/piso
 */
export interface CreatePisoApiDTO {
  anio: number;
  codPredio: string;
  numeroPiso: number;
  fechaConstruccion: string; // Formato "YYYY-MM-DD"
  codLetraMurosColumnas: string;
  murosColumnas: string;
  codLetraTechos: string;
  techos: string;
  codLetraPisos: string;
  pisos: string;
  codLetraPuertasVentanas: string;
  puertasVentanas: string;
  codLetraRevestimiento: string;
  revestimiento: string;
  codLetraBanios: string;
  banios: string;
  codLetraInstalacionesElectricas: string;
  instalacionesElectricas: string;
  codEstadoConservacion: string;
  codMaterialEstructural: string;
  areaConstruida: number;
}

export interface UpdatePisoDTO extends Partial<CreatePisoDTO> {
  estado?: string;
}

export interface BusquedaPisoParams {
  codigoPredio?: number;
  numeroPiso?: number;
  clasificacion?: string;
  estadoConservacion?: string;
  estadoConstruccion?: string;
  estado?: string;
  codUsuario?: number;
}

export interface ConsultaPisoParams {
  codPiso: number;
  anio: number;
  codPredio: string;
  numeroPiso: number;
}

// Clasificaciones de piso
export const CLASIFICACION_PISO = {
  PRIMER_PISO: 'PRIMER_PISO',
  PISOS_SUPERIORES: 'PISOS_SUPERIORES',
  SOTANO: 'SOTANO',
  MEZANINE: 'MEZANINE',
  AZOTEA: 'AZOTEA'
} as const;

// Estados de conservación
export const ESTADO_CONSERVACION = {
  MUY_BUENO: 'MUY_BUENO',
  BUENO: 'BUENO',
  REGULAR: 'REGULAR',
  MALO: 'MALO',
  MUY_MALO: 'MUY_MALO'
} as const;

// Estados de construcción
export const ESTADO_CONSTRUCCION = {
  TERMINADO: 'TERMINADO',
  EN_CONSTRUCCION: 'EN_CONSTRUCCION',
  INCONCLUSO: 'INCONCLUSO',
  RUINAS: 'RUINAS'
} as const;

// Materiales estructurales
export const MATERIAL_ESTRUCTURAL = {
  CONCRETO: 'CONCRETO',
  LADRILLO: 'LADRILLO',
  ADOBE: 'ADOBE',
  MADERA: 'MADERA',
  QUINCHA: 'QUINCHA',
  PREFABRICADO: 'PREFABRICADO',
  OTROS: 'OTROS'
} as const;

/**
 * Servicio para gestión de pisos
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class PisoService extends BaseApiService<PisoData, CreatePisoDTO, UpdatePisoDTO> {
  private static instance: PisoService;
  
  private constructor() {
    super(
      '/api/piso',
      {
        normalizeItem: (item: any) => ({
          id: item.codPiso || item.id || 0,
          codigoPredio: item.codPredio || 0,
          numeroPiso: item.numeroPiso || item.numPiso || 0,
          areaConstruida: parseFloat(item.areaConstruida || '0'),
          clasificacion: item.clasificacion || CLASIFICACION_PISO.PRIMER_PISO,
          materialEstructural: item.materialEstructural || MATERIAL_ESTRUCTURAL.CONCRETO,
          estadoConservacion: item.estadoConservacion || ESTADO_CONSERVACION.REGULAR,
          estadoConstruccion: item.estadoConstruccion || ESTADO_CONSTRUCCION.TERMINADO,
          categoriaValorUnitario: item.categoriaValorUnitario || '',
          añoConstruccion: item.añoConstruccion || item.anioConstruccion || new Date().getFullYear(),
          mesTermino: item.mesTermino || 12,
          unidadesUso: item.unidadesUso || 1,
          porcentajeAreaComun: parseFloat(item.porcentajeAreaComun || '0'),
          observaciones: item.observaciones || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: PisoData) => {
          // Validar que tenga los campos requeridos
          return !!(
            item.id && 
            item.codigoPredio && 
            item.numeroPiso >= 0 && 
            item.areaConstruida > 0
          );
        }
      },
      'piso'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PisoService {
    if (!PisoService.instance) {
      PisoService.instance = new PisoService();
    }
    return PisoService.instance;
  }
  
  /**
   * Consulta pisos usando el API específico con GET y query params
   * URL: GET http://26.161.18.122:8080/api/piso?codPiso=1&anio=2023&codPredio=20231&numeroPiso=1
   * NO requiere autenticación
   */
  async consultarPisos(params: {
    codPiso?: number;
    anio?: number;
    codPredio?: string;
    numeroPiso?: number;
  }): Promise<PisoData[]> {
    try {
      console.log('🔍 [PisoService] Consultando pisos con parámetros:', params);
      
      // Construir URL con query params
      const queryParams: Record<string, string> = {};
      if (params.codPiso) queryParams.codPiso = params.codPiso.toString();
      if (params.anio) queryParams.anio = params.anio.toString();
      if (params.codPredio) queryParams.codPredio = params.codPredio;
      if (params.numeroPiso) queryParams.numeroPiso = params.numeroPiso.toString();
      
      const url = buildApiUrl('/api/piso', queryParams);
      console.log('📡 [PisoService] GET request:', url);
      
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
      console.log('📡 [PisoService] Respuesta del API:', responseData);
      
      if (responseData.success && responseData.data) {
        // Normalizar los datos del API
        const pisosData = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        
        const pisosFormateados = pisosData.map((item: any, index: number) => {
          console.log(`🔍 [PisoService] Procesando item ${index + 1}:`, item);
          
          const pisoFormateado = {
            id: item.codPiso || item.id || index + 1,
            item: index + 1,
            descripcion: item.descripcion || `Piso ${item.numeroPiso || index + 1}`,
            valorUnitario: parseFloat(item.valorUnitario?.toString() || '0'),
            incremento: parseFloat(item.incremento?.toString() || '0'),
            porcentajeDepreciacion: parseFloat(item.porcentajeDepreciacion?.toString() || '0'),
            valorUnicoDepreciado: parseFloat(item.valorUnicoDepreciado?.toString() || '0'),
            valorAreaConstruida: parseFloat(item.valorAreaConstruida?.toString() || '0'),
            // Campos adicionales de la interface original
            codigoPredio: parseInt(item.codPredio?.toString() || '0'),
            numeroPiso: parseInt(item.numeroPiso?.toString() || '1'),
            areaConstruida: parseFloat(item.areaConstruida?.toString() || '0'),
            clasificacion: item.clasificacion,
            materialEstructural: item.materialEstructural,
            estadoConservacion: item.estadoConservacion,
            estadoConstruccion: item.estadoConstruccion,
            categoriaValorUnitario: item.categoriaValorUnitario,
            añoConstruccion: parseInt(item.anioConstruccion?.toString() || item.añoConstruccion?.toString() || new Date().getFullYear().toString()),
            mesTermino: parseInt(item.mesTermino?.toString() || '12'),
            unidadesUso: parseInt(item.unidadesUso?.toString() || '1'),
            porcentajeAreaComun: parseFloat(item.porcentajeAreaComun?.toString() || '0'),
            observaciones: item.observaciones || '',
            estado: item.estado || 'ACTIVO',
            fechaRegistro: item.fechaRegistro,
            fechaModificacion: item.fechaModificacion,
            codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
          };
          
          console.log(`✅ [PisoService] Item ${index + 1} formateado:`, pisoFormateado);
          return pisoFormateado;
        });
        
        console.log('✅ [PisoService] Pisos formateados:', pisosFormateados);
        return pisosFormateados;
      } else {
        console.log('⚠️ [PisoService] No se encontraron pisos en la respuesta');
        return [];
      }
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error consultando pisos:', error);
      
      // En caso de error, devolver array vacío para no romper la UI
      console.log('🔄 [PisoService] Retornando array vacío debido al error');
      return [];
    }
  }

  /**
   * Lista todos los pisos
   * NO requiere autenticación (método GET)
   */
  async listarPisos(incluirInactivos: boolean = false): Promise<PisoData[]> {
    try {
      console.log('🔍 [PisoService] Listando pisos');
      
      const pisos = await this.getAll();
      
      if (!incluirInactivos) {
        return pisos.filter(p => p.estado === 'ACTIVO');
      }
      
      return pisos;
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error listando pisos:', error);
      throw error;
    }
  }
  
  /**
   * Lista pisos por predio
   * NO requiere autenticación (método GET)
   */
  async listarPorPredio(codigoPredio: number, incluirInactivos: boolean = false): Promise<PisoData[]> {
    try {
      console.log('🔍 [PisoService] Listando pisos del predio:', codigoPredio);
      
      const pisos = await this.search({ 
        codigoPredio,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      if (!incluirInactivos) {
        return pisos
          .filter(p => p.estado === 'ACTIVO')
          .sort((a, b) => a.numeroPiso - b.numeroPiso);
      }
      
      return pisos.sort((a, b) => a.numeroPiso - b.numeroPiso);
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error listando pisos por predio:', error);
      throw error;
    }
  }
  
  /**
   * Busca pisos por criterios
   * NO requiere autenticación (método GET)
   */
  async buscarPisos(criterios: BusquedaPisoParams): Promise<PisoData[]> {
    try {
      console.log('🔍 [PisoService] Buscando pisos:', criterios);
      
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error buscando pisos:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un piso por su ID
   * NO requiere autenticación (método GET)
   */
  async obtenerPorId(id: number): Promise<PisoData | null> {
    try {
      console.log('🔍 [PisoService] Obteniendo piso por ID:', id);
      
      return await this.getById(id);
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error obteniendo piso:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un piso específico de un predio
   * NO requiere autenticación (método GET)
   */
  async obtenerPisoPredio(codigoPredio: number, numeroPiso: number): Promise<PisoData | null> {
    try {
      console.log('🔍 [PisoService] Obteniendo piso específico:', { codigoPredio, numeroPiso });
      
      const pisos = await this.buscarPisos({ codigoPredio, numeroPiso });
      return pisos.length > 0 ? pisos[0] : null;
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error obteniendo piso específico:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un número de piso ya existe en un predio
   * NO requiere autenticación (método GET)
   */
  async verificarNumeroPisoExiste(
    codigoPredio: number, 
    numeroPiso: number, 
    excluirId?: number
  ): Promise<boolean> {
    try {
      const pisos = await this.buscarPisos({ codigoPredio, numeroPiso });
      
      if (excluirId) {
        return pisos.some(p => p.id !== excluirId);
      }
      
      return pisos.length > 0;
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error verificando número de piso:', error);
      return false;
    }
  }
  
  /**
   * Calcula el área total construida de un predio
   * NO requiere autenticación (método GET)
   */
  async calcularAreaTotalPredio(codigoPredio: number): Promise<number> {
    try {
      const pisos = await this.listarPorPredio(codigoPredio);
      return pisos.reduce((total, piso) => total + piso.areaConstruida, 0);
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error calculando área total:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo piso usando POST sin autenticación
   * URL: POST http://26.161.18.122:8080/api/piso
   * Estructura JSON exacta según especificación del API
   */
  async crearPisoSinAuth(datos: CreatePisoApiDTO): Promise<PisoData> {
    try {
      console.log('➕ [PisoService] Creando piso sin autenticación:', datos);
      
      // Validaciones de datos requeridos
      if (!datos.codPredio || !datos.codPredio.trim()) {
        throw new Error('codPredio es requerido');
      }
      
      if (!datos.numeroPiso || datos.numeroPiso <= 0) {
        throw new Error('numeroPiso es requerido y debe ser mayor a 0');
      }
      
      if (!datos.areaConstruida || datos.areaConstruida <= 0) {
        throw new Error('areaConstruida es requerido y debe ser mayor a 0');
      }
      
      // Asegurar que los datos coincidan EXACTAMENTE con el JSON esperado
      const datosParaEnviar: CreatePisoApiDTO = {
        anio: Number(datos.anio),
        codPredio: String(datos.codPredio),
        numeroPiso: Number(datos.numeroPiso),
        fechaConstruccion: String(datos.fechaConstruccion || "1990-01-01"),
        codLetraMurosColumnas: String(datos.codLetraMurosColumnas || "1101"),
        murosColumnas: String(datos.murosColumnas || "100101"),
        codLetraTechos: String(datos.codLetraTechos || "1101"),
        techos: String(datos.techos || "100102"),
        codLetraPisos: String(datos.codLetraPisos || "1101"),
        pisos: String(datos.pisos || "100201"),
        codLetraPuertasVentanas: String(datos.codLetraPuertasVentanas || "1101"),
        puertasVentanas: String(datos.puertasVentanas || "100202"),
        codLetraRevestimiento: String(datos.codLetraRevestimiento || "1101"),
        revestimiento: String(datos.revestimiento || "100203"),
        codLetraBanios: String(datos.codLetraBanios || "1101"),
        banios: String(datos.banios || "100204"),
        codLetraInstalacionesElectricas: String(datos.codLetraInstalacionesElectricas || "1101"),
        instalacionesElectricas: String(datos.instalacionesElectricas || "100301"),
        codEstadoConservacion: String(datos.codEstadoConservacion || "9402"),
        codMaterialEstructural: String(datos.codMaterialEstructural || "0703"),
        areaConstruida: Number(datos.areaConstruida)
      };
      
      // Construir URL completa
      const url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      console.log('📡 [PisoService] URL para crear:', url);
      console.log('📤 [PisoService] JSON exacto a enviar:', JSON.stringify(datosParaEnviar, null, 2));
      
      // Ejemplo de JSON válido para comparar con Postman:
      console.log('📋 [PisoService] Ejemplo JSON para Postman:');
      console.log(`{
  "anio": ${datosParaEnviar.anio},
  "codPredio": "${datosParaEnviar.codPredio}",
  "numeroPiso": ${datosParaEnviar.numeroPiso},
  "fechaConstruccion": "${datosParaEnviar.fechaConstruccion}",
  "codLetraMurosColumnas": "${datosParaEnviar.codLetraMurosColumnas}",
  "murosColumnas": "${datosParaEnviar.murosColumnas}",
  "codLetraTechos": "${datosParaEnviar.codLetraTechos}",
  "techos": "${datosParaEnviar.techos}",
  "codLetraPisos": "${datosParaEnviar.codLetraPisos}",
  "pisos": "${datosParaEnviar.pisos}",
  "codLetraPuertasVentanas": "${datosParaEnviar.codLetraPuertasVentanas}",
  "puertasVentanas": "${datosParaEnviar.puertasVentanas}",
  "codLetraRevestimiento": "${datosParaEnviar.codLetraRevestimiento}",
  "revestimiento": "${datosParaEnviar.revestimiento}",
  "codLetraBanios": "${datosParaEnviar.codLetraBanios}",
  "banios": "${datosParaEnviar.banios}",
  "codLetraInstalacionesElectricas": "${datosParaEnviar.codLetraInstalacionesElectricas}",
  "instalacionesElectricas": "${datosParaEnviar.instalacionesElectricas}",
  "codEstadoConservacion": "${datosParaEnviar.codEstadoConservacion}",
  "codMaterialEstructural": "${datosParaEnviar.codMaterialEstructural}",
  "areaConstruida": ${datosParaEnviar.areaConstruida}
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
      
      console.log('📡 [PisoService] Response Status:', response.status);
      console.log('📡 [PisoService] Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [PisoService] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          requestURL: url
        });
        
        throw new Error(`Error HTTP ${response.status}: ${response.statusText || errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [PisoService] Piso creado exitosamente:', responseData);
      
      // Normalizar la respuesta
      const pisoCreado: PisoData = {
        id: responseData.codPiso || responseData.id || 0,
        codigoPredio: parseInt(datosParaEnviar.codPredio),
        numeroPiso: datosParaEnviar.numeroPiso,
        areaConstruida: datosParaEnviar.areaConstruida,
        clasificacion: responseData.clasificacion || 'PRIMER_PISO',
        materialEstructural: responseData.codMaterialEstructural || datosParaEnviar.codMaterialEstructural,
        estadoConservacion: responseData.codEstadoConservacion || datosParaEnviar.codEstadoConservacion,
        estadoConstruccion: responseData.estadoConstruccion || 'TERMINADO',
        categoriaValorUnitario: responseData.categoriaValorUnitario || '',
        añoConstruccion: responseData.anioConstruccion || parseInt(datosParaEnviar.fechaConstruccion.split('-')[0]),
        mesTermino: responseData.mesTermino || 12,
        unidadesUso: responseData.unidadesUso || 1,
        porcentajeAreaComun: responseData.porcentajeAreaComun || 0,
        observaciones: responseData.observaciones || '',
        estado: responseData.estado || 'ACTIVO',
        fechaRegistro: responseData.fechaRegistro || new Date().toISOString(),
        fechaModificacion: responseData.fechaModificacion,
        codUsuario: responseData.codUsuario || 1
      };
      
      console.log('✅ [PisoService] Piso normalizado:', pisoCreado);
      return pisoCreado;
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error creando piso sin auth:', error);
      console.error('❌ [PisoService] Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Crea un nuevo piso
   * REQUIERE autenticación (método POST)
   */
  async crearPiso(datos: CreatePisoDTO): Promise<PisoData> {
    try {
      console.log('➕ [PisoService] Creando piso:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear pisos');
      }
      
      // Validar datos
      if (!datos.codigoPredio || datos.codigoPredio <= 0) {
        throw new Error('Debe especificar un predio válido');
      }
      
      if (datos.numeroPiso < 0) {
        throw new Error('El número de piso no puede ser negativo');
      }
      
      if (!datos.areaConstruida || datos.areaConstruida <= 0) {
        throw new Error('El área construida debe ser mayor a 0');
      }
      
      // Verificar si el número de piso ya existe
      const existe = await this.verificarNumeroPisoExiste(
        datos.codigoPredio, 
        datos.numeroPiso
      );
      
      if (existe) {
        throw new Error(`Ya existe el piso ${datos.numeroPiso} en este predio`);
      }
      
      // Validar año de construcción
      const añoActual = new Date().getFullYear();
      if (datos.añoConstruccion && datos.añoConstruccion > añoActual) {
        throw new Error('El año de construcción no puede ser futuro');
      }
      
      // Validar porcentaje de área común
      if (datos.porcentajeAreaComun !== undefined && 
          (datos.porcentajeAreaComun < 0 || datos.porcentajeAreaComun > 100)) {
        throw new Error('El porcentaje de área común debe estar entre 0 y 100');
      }
      
      const datosCompletos = {
        ...datos,
        añoConstruccion: datos.añoConstruccion || añoActual,
        mesTermino: datos.mesTermino || 12,
        unidadesUso: datos.unidadesUso || 1,
        porcentajeAreaComun: datos.porcentajeAreaComun || 0,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error creando piso:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un piso existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarPiso(id: number, datos: UpdatePisoDTO): Promise<PisoData> {
    try {
      console.log('📝 [PisoService] Actualizando piso:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar pisos');
      }
      
      // Obtener piso actual
      const pisoActual = await this.getById(id);
      if (!pisoActual) {
        throw new Error('Piso no encontrado');
      }
      
      // Validaciones
      if (datos.numeroPiso !== undefined) {
        if (datos.numeroPiso < 0) {
          throw new Error('El número de piso no puede ser negativo');
        }
        
        // Verificar si el nuevo número ya existe
        const existe = await this.verificarNumeroPisoExiste(
          datos.codigoPredio || pisoActual.codigoPredio,
          datos.numeroPiso,
          id
        );
        
        if (existe) {
          throw new Error(`Ya existe otro piso ${datos.numeroPiso} en este predio`);
        }
      }
      
      if (datos.areaConstruida !== undefined && datos.areaConstruida <= 0) {
        throw new Error('El área construida debe ser mayor a 0');
      }
      
      if (datos.añoConstruccion !== undefined && 
          datos.añoConstruccion > new Date().getFullYear()) {
        throw new Error('El año de construcción no puede ser futuro');
      }
      
      if (datos.porcentajeAreaComun !== undefined && 
          (datos.porcentajeAreaComun < 0 || datos.porcentajeAreaComun > 100)) {
        throw new Error('El porcentaje de área común debe estar entre 0 y 100');
      }
      
      const datosCompletos = {
        ...datos,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(id, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error actualizando piso:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un piso (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarPiso(id: number): Promise<void> {
    try {
      console.log('🗑️ [PisoService] Eliminando piso:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar pisos');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [PisoService] Piso marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error eliminando piso:', error);
      throw error;
    }
  }
  
  /**
   * Copia pisos de un predio a otro
   * REQUIERE autenticación (método POST)
   */
  async copiarPisos(codigoPredioOrigen: number, codigoPredioDestino: number): Promise<number> {
    try {
      console.log('📋 [PisoService] Copiando pisos entre predios:', 
        { origen: codigoPredioOrigen, destino: codigoPredioDestino });
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para copiar pisos');
      }
      
      // Verificar que no existan pisos en el destino
      const pisosDestino = await this.listarPorPredio(codigoPredioDestino);
      if (pisosDestino.length > 0) {
        throw new Error('El predio destino ya tiene pisos registrados');
      }
      
      // Obtener pisos del predio origen
      const pisosOrigen = await this.listarPorPredio(codigoPredioOrigen);
      if (pisosOrigen.length === 0) {
        throw new Error('El predio origen no tiene pisos para copiar');
      }
      
      let copiados = 0;
      
      // Copiar cada piso
      for (const piso of pisosOrigen) {
        const nuevoPiso: CreatePisoDTO = {
          codigoPredio: codigoPredioDestino,
          numeroPiso: piso.numeroPiso,
          areaConstruida: piso.areaConstruida,
          clasificacion: piso.clasificacion,
          materialEstructural: piso.materialEstructural,
          estadoConservacion: piso.estadoConservacion,
          estadoConstruccion: piso.estadoConstruccion,
          categoriaValorUnitario: piso.categoriaValorUnitario,
          añoConstruccion: piso.añoConstruccion,
          mesTermino: piso.mesTermino,
          unidadesUso: piso.unidadesUso,
          porcentajeAreaComun: piso.porcentajeAreaComun,
          observaciones: piso.observaciones
        };
        
        await this.crearPiso(nuevoPiso);
        copiados++;
      }
      
      console.log(`✅ [PisoService] ${copiados} pisos copiados exitosamente`);
      return copiados;
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error copiando pisos:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de pisos
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(codigoPredio?: number): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    areaTotalConstruida: number;
    promedioAreaPorPiso: number;
    porClasificacion: { [key: string]: number };
    porEstadoConservacion: { [key: string]: number };
    porEstadoConstruccion: { [key: string]: number };
  }> {
    try {
      let pisos: PisoData[];
      
      if (codigoPredio) {
        pisos = await this.listarPorPredio(codigoPredio, true);
      } else {
        pisos = await this.getAll();
      }
      
      const estadisticas = {
        total: pisos.length,
        activos: pisos.filter(p => p.estado === 'ACTIVO').length,
        inactivos: pisos.filter(p => p.estado === 'INACTIVO').length,
        areaTotalConstruida: 0,
        promedioAreaPorPiso: 0,
        porClasificacion: {} as { [key: string]: number },
        porEstadoConservacion: {} as { [key: string]: number },
        porEstadoConstruccion: {} as { [key: string]: number }
      };
      
      // Calcular áreas
      estadisticas.areaTotalConstruida = pisos.reduce((sum, p) => sum + p.areaConstruida, 0);
      if (pisos.length > 0) {
        estadisticas.promedioAreaPorPiso = estadisticas.areaTotalConstruida / pisos.length;
      }
      
      // Agrupar por características
      pisos.forEach(piso => {
        // Por clasificación
        const clasificacion = piso.clasificacion || 'SIN CLASIFICAR';
        estadisticas.porClasificacion[clasificacion] = 
          (estadisticas.porClasificacion[clasificacion] || 0) + 1;
        
        // Por estado de conservación
        const conservacion = piso.estadoConservacion || 'SIN ESTADO';
        estadisticas.porEstadoConservacion[conservacion] = 
          (estadisticas.porEstadoConservacion[conservacion] || 0) + 1;
        
        // Por estado de construcción
        const construccion = piso.estadoConstruccion || 'SIN ESTADO';
        estadisticas.porEstadoConstruccion[construccion] = 
          (estadisticas.porEstadoConstruccion[construccion] || 0) + 1;
      });
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [PisoService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const pisoService = PisoService.getInstance();

// Exportar también la clase por si se necesita extender
export default PisoService;