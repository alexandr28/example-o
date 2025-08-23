// src/services/constanteService.ts
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

/**
 * Interface para los datos de constante
 */
export interface ConstanteData {
  codConstante: string;
  nombreCategoria: string;
}

/**
 * Interface para la respuesta del API
 */
export interface ConstanteResponse {
  success: boolean;
  message: string;
  data: ConstanteData[];
  pagina?: number | null;
  limite?: number | null;
}

/**
 * Códigos de constantes padres
 */
export const CODIGO_CONSTANTE_PADRE = {
  TIPO_CONTRIBUYENTE: '03', // Para tipos de contribuyente (Natural, Jurídico, Exonerado)
  TIPO_DOCUMENTO: '41',      // Para tipos de documento (DNI, RUC, etc.)
  ESTADO_CIVIL :'18', // Para estado civil (Soltero, Casado, Divorciado, Viudo, Union Libre)
  SEXOS :'20', // Para sexos (Masculino, Femenino)
  NIVEL_ANTIGUEDAD: '06', // Para nivel de antiguedad (1 a 10)
  ESTADO:'02', // Para estado (Activo, Inactivo)
  MODO_DECLARACION:'04', // Para modo de declaracion DEL PREDIO
  TIPOS_DE_CASA :'05',
  MATERIAL_ESTRUCTURAL_PREDOMINANTE:'07',
  ESCALAS:'08', // UIT
  TIPOS_UIT:'09',
  CATEGORIAS_VALORES_UNITARIOS:'10',
  LETRAS_DE_VALORES_UNITARIOS:'11',
  ESTADOS:'13',
  LISTA_CONDUCTOR:'14',
  LISTA_DE_USOS:'15',
  CATEGORIAS:'16',
  TIPO_TERRENO:'17',
  NACIONALIDAD:'19',
  TIPO_INTERES:'21',
  ESTADO_RECIBO:'22',
  MOTIVO:'23',
  MESES:'24',
  ESTADOS_DE_PREDIOS:'25',
  TIPO_DE_PREDIO:'26',
  CONDICION_DE_PROPIEDAD:'27',
  TIPO_DE_INTERES:'28',
  MODO_DECLARACION_TRANSFERENCIA:'29',
  MANZANAS:'30',
  CLASIFICACION:'32',
  INICIO:'33',
  RECONSIDERACION:'34',
  APELACION:'35',
  PERIODO:'36',
  TIPO_VIAS:'38',
  UBICCION_AREA_VERDE:'39',
  TIPO_DE_DECLARANTE:'40',
  LUGAR_DE_OCURRENCIA:'42',
  TRIBUTOS:'46',
  MOTIVOS:'51',
  CONCEPTOS_DE_CONVENIOS:'53',
  TIPO_DE_CONSTANCIA_NO_ADEUDO:'54',
  VALORES_ORDEN_DE_PAGO:'55',
  HISTORIAL_PREDIOS:'56',
  TRINESTRES:'57',
  TIPOS_DE_FORM:'58',
  CONDICION_PREDIO:'59',
  ADJUDICACION_DE_PREDIO_RUSTICO:'60',
  TIPO_DE_PREDIO_RUSTICO:'61',
  TIPO_DE_TRAMITE:'65',
  TRAMITES_TEMPORALES:'66',
  SECTOR_ECONOMICO:'67',
  CONDICION_LICENCIA:'68',
  COMPATIBILIDAD:'69',
  ANIOS:'70',
  TRIBUTOS_RD:'74',
  TIPO_ALCABALA:'76',
  TIPOS_DE_INSCRIPCION_DE_PREDIO:'77',
  TRIMESTRE:'78',
  INFORMES:'79',
  ACTOS_ADMINISTRATIVOS:'80',
  LADOS_DIRECCIONES:'81',
  MOTIVOS_DE_REGISTRO_DE_PISO:'91',
  CONCEPTO_DE_DESCUENTO_GENERAL:'92',
  CONCEPTO_DE_DESCUENTO_ESPECIAL:'93',
  ESTADOS_DE_CONSERVACION:'94',

  
} as const;

// Códigos de constantes hijos
export const CODIGO_CONSTANTE_HIJO = {
  // Hijos de CATEGORIAS_VALORES_UNITARIOS (10)
  CATEGORIAS_VALORES_UNITARIOS: {
    ESTRUCTURAS: '1001',
    ACABADOS: '1002',
    INSTALACIONES_ELECTRICAS_SANITARIAS: '1003',
  }
} as const;

/**
 * Servicio para gestión de constantes
 * NO requiere autenticación
 */
class ConstanteService {
  private static instance: ConstanteService;
  private cache: Map<string, { data: ConstanteData[]; timestamp: number }> = new Map();
  private cacheDuration: number = 30 * 60 * 1000; // 30 minutos
  
  private constructor() {}
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ConstanteService {
    if (!ConstanteService.instance) {
      ConstanteService.instance = new ConstanteService();
    }
    return ConstanteService.instance;
  }
  
  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   */
  private getCachedData(key: string): ConstanteData[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`📦 [ConstanteService] Datos obtenidos del cache para: ${key}`);
      return cached.data;
    }
    return null;
  }
  
  /**
   * Guarda datos en cache
   */
  private setCachedData(key: string, data: ConstanteData[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  /**
   * Lista las constantes hijas según el código del padre
   * USA GET con query params SIN autenticación
   */
  async listarConstantesPorPadre(codConstantePadre: string): Promise<ConstanteData[]> {
    try {
      // Verificar cache primero
      const cacheKey = `constantes_${codConstantePadre}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
      
      console.log(`🔍 [ConstanteService] Buscando constantes para padre: ${codConstantePadre}`);
      
      // Construir URL con query params
      const url = buildApiUrl('/api/constante/listarConstantePadre', {
        codConstante: codConstantePadre
      });
      
      console.log(`📤 [ConstanteService] GET request a: ${url}`);
      
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
      
      const responseData: ConstanteResponse = await response.json();
      console.log(`📡 [ConstanteService] Respuesta recibida:`, responseData);
      
      // Validar respuesta
      if (responseData.success && Array.isArray(responseData.data)) {
        // Guardar en cache
        this.setCachedData(cacheKey, responseData.data);
        
        console.log(`✅ [ConstanteService] ${responseData.data.length} constantes obtenidas`);
        return responseData.data;
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`❌ [ConstanteService] Error al obtener constantes:`, error);
      throw error;
    }
  }
  
  /**
   * Lista las constantes hijas según el código hijo específico
   * USA GET con query params SIN autenticación
   */
  async listarConstantesPorHijo(codConstanteHijo: string): Promise<ConstanteData[]> {
    try {
      // Verificar cache primero
      const cacheKey = `constantes_hijo_${codConstanteHijo}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
      
      console.log(`🔍 [ConstanteService] Buscando constantes para hijo: ${codConstanteHijo}`);
      
      // Construir URL con query params
      const url = buildApiUrl('/api/constante/listarConstanteHijo', {
        codConstante: codConstanteHijo
      });
      
      console.log(`📤 [ConstanteService] GET request a: ${url}`);
      
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
      
      const responseData: ConstanteResponse = await response.json();
      console.log(`📡 [ConstanteService] Respuesta hijo recibida:`, responseData);
      
      // Validar respuesta
      if (responseData.success && Array.isArray(responseData.data)) {
        // Guardar en cache
        this.setCachedData(cacheKey, responseData.data);
        
        console.log(`✅ [ConstanteService] ${responseData.data.length} constantes hijo obtenidas`);
        return responseData.data;
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`❌ [ConstanteService] Error al obtener constantes hijo:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene los tipos de contribuyente
   */
  async obtenerTiposContribuyente(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_CONTRIBUYENTE);
  }
  
  /**
   * Obtiene los tipos de documento
   */
  async obtenerTiposDocumento(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DOCUMENTO);
  }
  /**
   * Obtiene los tipos de estado civil
   */
  async obtenerTiposEstadoCivil(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESTADO_CIVIL);
  }
  /**
   * Obtiene los tipos de sexo
   */
  async obtenerTiposSexo(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.SEXOS);
  }
  /**
   * Obtiene los tipos de nivel de antiguedad
   */
  async obtenerTiposNivelAntiguedad(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.NIVEL_ANTIGUEDAD);
  }
  /**
   * Obtiene los tipos de estado
   */
  async obtenerTiposEstado(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESTADO);
  }
  /**
   * Obtiene los tipos de modo de declaración
   */
  async obtenerTiposModoDeclaracion(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MODO_DECLARACION);
  }
  /**
   * Obtiene los tipos de material estructural predominante
   */
  async obtenerTiposMaterialEstructuralPredominante(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MATERIAL_ESTRUCTURAL_PREDOMINANTE);
  }
  /**
   * Obtiene los tipos de escala
   */
  async obtenerTiposEscala(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESCALAS);
  }
  /**
   * Obtiene los tipos de tipo de terreno
   */
  async obtenerTiposTipoTerreno(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_TERRENO);
  }
  /**
   * Obtiene los tipos de nacionalidad
   */
  async obtenerTiposNacionalidad(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.NACIONALIDAD);
  }
  /**
   * Obtiene los tipos de tipo de interés
   */
  async obtenerTiposTipoInteres(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_INTERES);
  }
  /**
   * Obtiene los tipos de estado de recibo
   */
  async obtenerTiposEstadoRecibo(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESTADO_RECIBO);
  }
  /**
   * Obtiene los tipos de motivo
   */
  async obtenerTiposMotivo(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MOTIVO);
  }
  /**
   * Obtiene los tipos de mes
   */
  async obtenerTiposMes(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MESES);
  }
  /**
   * Obtiene los tipos de estado de predio  
   */
  async obtenerTiposEstadoPredio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESTADOS_DE_PREDIOS);
  }
  /**
   * Obtiene los tipos de tipo de predio
   */ 
  async obtenerTiposTipoPredio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_PREDIO);
  }
  /**
   * Obtiene los tipos de condición de propiedad
   */ 
  async obtenerTiposCondicionPropiedad(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CONDICION_DE_PROPIEDAD);
  }
  /**
   * Obtiene los tipos de tipo de interés
   */  
  async obtenerTiposModoDeclaracionTransferencia(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MODO_DECLARACION_TRANSFERENCIA);
  }
  /**
   * Obtiene los tipos de manzana
   */
  async obtenerTiposManzana(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MANZANAS);
  }
  /**
   * Obtiene los tipos de clasificación
   */
  async obtenerTiposClasificacion(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CLASIFICACION);
  }
  /**
   * Obtiene los tipos de inicio  
   */
  async obtenerTiposInicio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.INICIO);
  }
  /**
   * Obtiene los tipos de reconside
   */
  async obtenerTiposReconsideracion(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.RECONSIDERACION);
  }
  /**
   * Obtiene los tipos de apelación
   */
  async obtenerTiposApelacion(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.APELACION);
  }
  /**
   * Obtiene los tipos de periodo 
   */
  async obtenerTiposPeriodo(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.PERIODO);
  }
  /**
   * Obtiene los tipos de tipo de vía 
   */
  async obtenerTiposTipoVia(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_VIAS);
  }
  /**
   * Obtiene los tipos de ubicación de área verde 
   */
  async obtenerTiposUbicacionAreaVerde(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.UBICCION_AREA_VERDE);
  }
  /**
   * Obtiene los tipos de tipo de declarante  
   */
  async obtenerTiposTipoDeclarante(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_DECLARANTE);
  }
  /**
   * Obtiene los tipos de lugar de ocurrencia     
   */
  async obtenerTiposLugarOcurrencia(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.LUGAR_DE_OCURRENCIA);
  }
  /**
   * Obtiene los tipos de tributos      
   */
  async obtenerTiposTributos(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TRIBUTOS);
  }
  /**
   * Obtiene los tipos de motivos 
   */
  async obtenerTiposMotivos(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MOTIVOS);
  }
  /**
   * Obtiene los tipos de conceptos de convenios
   */ 
  async obtenerTiposConceptosConvenios(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CONCEPTOS_DE_CONVENIOS);
  }
  /**
   * Obtiene los tipos de tipo de constancia no adeudo
   */   
  async obtenerTiposTipoConstanciaNoAdeudo(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_CONSTANCIA_NO_ADEUDO);
  }
  /**
   * Obtiene los tipos de valores orden de pago
   */   
  async obtenerTiposValoresOrdenPago(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.VALORES_ORDEN_DE_PAGO);
  }
  /**
   * Obtiene los tipos de historial de predios
   */   
  async obtenerTiposHistorialPredios(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.HISTORIAL_PREDIOS);
  }
  /**
   * Obtiene los tipos de trine
   */   
  async obtenerTiposTrine(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TRINESTRES);
  }
  /**
   * Obtiene los tipos de tipo de forma
   */ 
  async obtenerTiposTipoForm(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPOS_DE_FORM);
  }
  /**
   * Obtiene los tipos de condición de predio
   */     
  async obtenerTiposCondicionPredio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CONDICION_PREDIO);
  }
  /**
   * Obtiene los tipos de adjudicación de predio rústico
   */         
  async obtenerTiposAdjudicacionPredioRustico(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ADJUDICACION_DE_PREDIO_RUSTICO);
  }
  /**
   * Obtiene los tipos de tipo de predio rústico
   */     
  async obtenerTiposTipoPredioRustico(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_PREDIO_RUSTICO);
  }
  /**
   * Obtiene los tipos de tipo de tramite
   */             
  async obtenerTiposTipoTramite(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_TRAMITE);
  }
  /**
   * Obtiene los tipos de tramites temporales
   */       
  async obtenerTiposTramitesTemporales(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TRAMITES_TEMPORALES);
  }
  /**
   * Obtiene los tipos de sector económico
   */     
  async obtenerTiposSectorEconomico(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.SECTOR_ECONOMICO);
  }
  /**
   * Obtiene los tipos de condición de licencia
   */     
  async obtenerTiposCondicionLicencia(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CONDICION_LICENCIA);
  }
  /**
   * Obtiene los tipos de compatibilidad
   */             
  async obtenerTiposCompatibilidad(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.COMPATIBILIDAD);
  }
  /**
   * Obtiene los tipos de anio
   */
  async obtenerTiposAnio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ANIOS);
  }
  /**
   * Obtiene los tipos de tributos RD
   */   
  async obtenerTiposTributosRD(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TRIBUTOS_RD);
  }
  /**
   * Obtiene los tipos de tipo de alcabala
   */   
  async obtenerTiposTipoAlcabala(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_ALCABALA);
  }
  /**
   * Obtiene los tipos de tipos de inscripción de predio
   */     
  async obtenerTiposTiposInscripcionPredio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPOS_DE_INSCRIPCION_DE_PREDIO);
  }
  /**
   * Obtiene los tipos de trimestre
   */       
  async obtenerTiposTrimestre(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TRIMESTRE);
  }
  /**
   * Obtiene los tipos de informes
   */         
  async obtenerTiposInformes(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.INFORMES);
  }
  /**
   * Obtiene los tipos de actos administrativos
   */         
  async obtenerTiposActosAdministrativos(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ACTOS_ADMINISTRATIVOS);
  }
  /**
   * Obtiene los tipos de lados de dirección
   */             
  async obtenerTiposLadosDirecciones(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.LADOS_DIRECCIONES);
  }
  /**
   * Obtiene los tipos de motivos de registro de piso
   */               
  async obtenerTiposMotivosRegistroPiso(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.MOTIVOS_DE_REGISTRO_DE_PISO);
  }
  /**
   * Obtiene los tipos de concepto de descuento general
   */                 
  async obtenerTiposConceptoDescuentoGeneral(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CONCEPTO_DE_DESCUENTO_GENERAL);
  }
  /**
   * Obtiene los tipos de concepto de descuento especial
   */                     
  async obtenerTiposConceptoDescuentoEspecial(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CONCEPTO_DE_DESCUENTO_ESPECIAL);
  }
  /**
   * Obtiene los tipos de estados de conservación
   */                     
  async obtenerTiposEstadosConservacion(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESTADOS_DE_CONSERVACION);
  }
  /**
   * Obtiene los tipos de UIT
   */
  async obtenerTiposUit(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPOS_UIT);
  }
  /**
   * Obtiene los tipos de tipo de Categoria de valores unitarios
   */   
  async obtenerTiposCategoriasValoresUnitarios(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CATEGORIAS_VALORES_UNITARIOS);
  }
  /**
   * Obtiene los tipos de letra de valores unitarios
   */   
  async obtenerTiposLetrasValoresUnitarios(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.LETRAS_DE_VALORES_UNITARIOS);
  }
  
  /**
   * Obtiene las categorías PADRE de valores unitarios (1001, 1002, 1003)
   * Estas son realmente las opciones que van en el selector padre
   */
  async obtenerCategoriasValoresUnitariosHijos(): Promise<ConstanteData[]> {
    console.log('🔍 [ConstanteService] obtenerCategoriasValoresUnitariosHijos() - RETORNANDO PADRES REALES');
    
    // Según el ejemplo de Postman, estas son las opciones PADRE reales:
    const categoriasReal = [
      { codConstante: '1001', nombreCategoria: 'Estructuras' },
      { codConstante: '1002', nombreCategoria: 'Acabados' }, 
      { codConstante: '1003', nombreCategoria: 'Instalaciones Eléctricas y Sanitarias' }
    ];
    
    console.log('✅ [ConstanteService] Retornando categorías padre reales:', categoriasReal);
    return categoriasReal;
  }

  /**
   * Obtiene los hijos REALES de cada categoría padre según Postman
   * codigoPadre: '1001' → hijos 100101, 100102
   * codigoPadre: '1002' → hijos 100201, 100202, 100203, 100204
   * codigoPadre: '1003' → hijo 100301
   */
  async obtenerHijosRealesPorPadre(codigoPadre: string): Promise<ConstanteData[]> {
    console.log(`🔍 [ConstanteService] obtenerHijosRealesPorPadre(${codigoPadre})`);
    
    try {
      // Llamar al endpoint listarConstanteHijo con el código del padre
      const hijos = await this.listarConstantesPorHijo(codigoPadre);
      
      if (hijos && hijos.length > 0) {
        console.log(`✅ [ConstanteService] ${hijos.length} hijos obtenidos del API para padre ${codigoPadre}:`, hijos);
        return hijos;
      }
      
      // Si el API no devuelve datos, usar fallbacks basados en el ejemplo de Postman
      console.log(`⚠️ [ConstanteService] API sin datos para padre ${codigoPadre}, usando fallback`);
      
      switch (codigoPadre) {
        case '1001': // Estructuras
          return [
            { codConstante: '100101', nombreCategoria: 'MUROS Y COLUMNAS' },
            { codConstante: '100102', nombreCategoria: 'TECHOS' }
          ];
        case '1002': // Acabados
          return [
            { codConstante: '100201', nombreCategoria: 'PISOS' },
            { codConstante: '100202', nombreCategoria: 'PUERTAS Y VENTANAS' },
            { codConstante: '100203', nombreCategoria: 'REVESTIMIENTOS' },
            { codConstante: '100204', nombreCategoria: 'BAÑOS' }
          ];
        case '1003': // Instalaciones
          return [
            { codConstante: '100301', nombreCategoria: 'INSTALACIONES ELECTRICAS Y SANITARIAS' }
          ];
        default:
          console.log(`⚠️ [ConstanteService] Código padre desconocido: ${codigoPadre}`);
          return [];
      }
    } catch (error) {
      console.error(`❌ [ConstanteService] Error al obtener hijos para padre ${codigoPadre}:`, error);
      return [];
    }
  }
  
  /**
   * MÉTODO DE DEBUG: Verifica qué devuelve cada endpoint
   */
  async debugEndpoints(): Promise<void> {
    console.log('🔍 === DEBUG DE ENDPOINTS DE CONSTANTES ===');
    
    try {
      // Test 1: listarConstantePadre con código 10
      console.log('\n📡 Test 1: listarConstantePadre?codConstante=10');
      const padres10 = await this.listarConstantesPorPadre('10');
      console.log('Resultado:', padres10);
      
      // Test 2: listarConstanteHijo con código 1001
      console.log('\n📡 Test 2: listarConstanteHijo?codConstante=1001');
      const hijo1001 = await this.listarConstantesPorHijo('1001');
      console.log('Resultado:', hijo1001);
      
      // Test 3: listarConstanteHijo con código 1002
      console.log('\n📡 Test 3: listarConstanteHijo?codConstante=1002');
      const hijo1002 = await this.listarConstantesPorHijo('1002');
      console.log('Resultado:', hijo1002);
      
      // Test 4: listarConstanteHijo con código 1003
      console.log('\n📡 Test 4: listarConstanteHijo?codConstante=1003');
      const hijo1003 = await this.listarConstantesPorHijo('1003');
      console.log('Resultado:', hijo1003);
      
      console.log('\n✅ === FIN DEBUG ===');
    } catch (error) {
      console.error('❌ Error en debug:', error);
    }
  }
  
  /**
   * Obtiene específicamente MUROS Y COLUMNAS (1001)
   */
  async obtenerValoresUnitariosMurosColumnas(): Promise<ConstanteData | null> {
    try {
      const categorias = await this.obtenerCategoriasValoresUnitariosHijos();
      return categorias.find(c => 
        c.codConstante === CODIGO_CONSTANTE_HIJO.CATEGORIAS_VALORES_UNITARIOS.ESTRUCTURAS
      ) || null;
    } catch (error) {
      console.error('Error al obtener MUROS Y COLUMNAS:', error);
      return null;
    }
  }
  
  /**
   * Obtiene específicamente TECHOS (1002)
   */
  async obtenerValoresUnitariosTechos(): Promise<ConstanteData | null> {
    try {
      const categorias = await this.obtenerCategoriasValoresUnitariosHijos();
      return categorias.find(c => 
        c.codConstante === CODIGO_CONSTANTE_HIJO.CATEGORIAS_VALORES_UNITARIOS.ACABADOS
      ) || null;
    } catch (error) {
      console.error('Error al obtener TECHOS:', error);
      return null;
    }
  }
  
  /**
   * Obtiene específicamente PISOS (1003)
   */
  async obtenerValoresUnitariosPisos(): Promise<ConstanteData | null> {
    try {
      const categorias = await this.obtenerCategoriasValoresUnitariosHijos();
      return categorias.find(c => 
        c.codConstante === CODIGO_CONSTANTE_HIJO.CATEGORIAS_VALORES_UNITARIOS.INSTALACIONES_ELECTRICAS_SANITARIAS
      ) || null;
    } catch (error) {
      console.error('Error al obtener PISOS:', error);
      return null;
    }
  }
  /**
   * Obtiene los tipos de lista de conductores
   */   
  async obtenerTiposListaConductor(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.LISTA_CONDUCTOR);
  }
  /**
   * Obtiene los tipos de lista de usos
   */   
  async obtenerTiposListaUsos(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.LISTA_DE_USOS);
  }
  /**
   * Obtiene los tipos de categorias 
   */   
  async obtenerTiposCategorias(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.CATEGORIAS);
  }
  /**
   * Obtiene los tipos de tipo de form
   */   
  async obtenerTiposTiposForm(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPOS_DE_FORM);
  }
  /**
   * Obtiene los tipo de predio rustico
   */   
  async obtenerTiposPredioRustico(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_PREDIO_RUSTICO);
  }
  /**
   * Obtiene los tipos de tipo de tramite
   */   
  async obtenerTiposAnios(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ANIOS);
  }
  /**
   * Obtiene los tipos de tributo rd
   */   
  async obtenerTiposTributoRd(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TRIBUTOS_RD);
  }

  
  

  /**
   * Mapea el código de tipo de contribuyente a su nombre
   */
  async obtenerNombreTipoContribuyente(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposContribuyente();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo contribuyente:', error);
      return codigo;
    }
  }
  
  /**
   * Mapea el código de tipo de documento a su nombre
   */
  async obtenerNombreTipoDocumento(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposDocumento();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo documento:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de estado civil a su nombre
   */
  async obtenerNombreTipoEstadoCivil(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEstadoCivil();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo estado civil:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de sexo a su nombre
   */
  async obtenerNombreTipoSexo(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposSexo();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo sexo:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de nivel de antiguedad a su nombre
   */
  async obtenerNombreTipoNivelAntiguedad(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposNivelAntiguedad();
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo nivel de antiguedad:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de estado a su nombre
   */
  async obtenerNombreTipoEstado(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEstado();
      const tipo = tipos.find(t => t.codConstante === codigo);  
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo estado:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de modo de declaración a su nombre
   */
  async obtenerNombreTipoModoDeclaracion(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposModoDeclaracion();
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo modo de declaración:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de material estructural predominante a su nombre
   */
  async obtenerNombreTipoMaterialEstructuralPredominante(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposMaterialEstructuralPredominante();
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo material estructural predominante:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de escala a su nombre
   */
  async obtenerNombreTipoEscala(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEscala();
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo escala:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de tipo de interés a su nombre
   */
  async obtenerNombreTipoTipoInteres(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoInteres();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de interés:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de estado de recibo a su nombre
   */
  async obtenerNombreTipoEstadoRecibo(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEstadoRecibo();
      const tipo = tipos.find(t => t.codConstante === codigo);  
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo estado de recibo:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de motivo a su nombre
   */
  async obtenerNombreTipoMotivo(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposMotivo();
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo motivo:', error);
      return codigo;
    }
  } 
  /**
   * Mapea el código de tipo de mes a su nombre
   */
  async obtenerNombreTipoMes(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposMes();
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo mes:', error);
      return codigo;
    }
  }
  

  /**
   * Mapea el código de tipo de estado de predio a su nombre
   */
  async obtenerNombreTipoEstadoPredio(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEstadoPredio();  
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo estado de predio:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de tipo de predio a su nombre
   */
  async obtenerNombreTipoTipoPredio(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoPredio();
      const tipo = tipos.find(t => t.codConstante === codigo);  
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de predio:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de condición de propiedad a su nombre
   */
  async obtenerNombreTipoCondicionPropiedad(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCondicionPropiedad();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo condición de propiedad:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de modo de declaración de transferencia a su nombre
   */
  async obtenerNombreTipoModoDeclaracionTransferencia(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposModoDeclaracionTransferencia();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo modo de declaración de transferencia:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de manzana a su nombre
   */
  async obtenerNombreTipoManzana(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposManzana();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo manzana:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de clasificación a su nombre
   */
  async obtenerNombreTipoClasificacion(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposClasificacion();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo clasificación:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de inicio a su nombre
   */
  async obtenerNombreTipoInicio(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposInicio();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo inicio:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de reconside a su nombre 
   */
  async obtenerNombreTipoReconsideracion(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposReconsideracion();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo reconside:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de apelación a su nombre   
   */
  async obtenerNombreTipoApelacion(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposApelacion();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo apelación:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de periodo a su nombre
   */
  async obtenerNombreTipoPeriodo(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposPeriodo();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo periodo:', error);
      return codigo;
    }
  }  
  /**
   * Mapea el código de tipo de tipo de vía a su nombre
   */
  async obtenerNombreTipoTipoVia(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoVia();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de vía:', error);
      return codigo;
    }
  }   
  /**
   * Mapea el código de tipo de ubicación de área verde a su nombre
   */
  async obtenerNombreTipoUbicacionAreaVerde(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposUbicacionAreaVerde();      
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo ubicación de área verde:', error);
      return codigo;
    } 
  }
  /**
   * Mapea el código de tipo de tipo de declarante a su nombre
   */
  async obtenerNombreTipoTipoDeclarante(codigo: string): Promise<string> {
    try { 
      const tipos = await this.obtenerTiposTipoDeclarante();      
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de declarante:', error);
      return codigo;    
    }
  }
  /**
   * Mapea el código de tipo de lugar de ocurrencia a su nombre
   */
  async obtenerNombreTipoLugarOcurrencia(codigo: string): Promise<string> { 
    try {
      const tipos = await this.obtenerTiposLugarOcurrencia();      
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo lugar de ocurrencia:', error); 
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de tributos a su nombre
   */ 
  async obtenerNombreTipoTributos(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTributos();      
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {   
      console.error('Error al obtener nombre de tipo tributos:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de motivos a su nombre       
   */
  async obtenerNombreTipoMotivos(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposMotivos();      
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;   
    } catch (error) {
      console.error('Error al obtener nombre de tipo motivos:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de concepto de descuento general a su nombre
   */
  async obtenerNombreTipoConceptoDescuentoGeneral(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposConceptoDescuentoGeneral();      
      const tipo = tipos.find(t => t.codConstante === codigo);  
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo concepto de descuento general:', error);
      return codigo;
    }
  } 
  /**
   * Mapea el código de tipo de concepto de descuento especial a su nombre
   */
  async obtenerNombreTipoConceptoDescuentoEspecial(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposConceptoDescuentoEspecial();       
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo concepto de descuento especial:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de estado de conservación a su nombre  
   */
  async obtenerNombreTipoEstadoConservacion(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEstadosConservacion();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo estado de conservación:', error);
      return codigo;
    }
  }

  
  /**
   * Mapea el código de tipo de UIT a su nombre
   */
  async obtenerNombreTipoUit(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposUit();
      const tipo = tipos.find(t => t.codConstante === codigo);  
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo UIT:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de categoría de valores unitarios a su nombre
   */
  async obtenerNombreTipoCategoriaValoresUnitarios(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCategoriasValoresUnitarios();
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo categoría de valores unitarios:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de letra de valores unitarios a su nombre
   */
  async obtenerNombreTipoLetraValoresUnitarios(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposLetrasValoresUnitarios();    
      const tipo = tipos.find(t => t.codConstante === codigo);
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo letra de valores unitarios:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de lista de conductor a su nombre
   */
  async obtenerNombreTipoListaConductor(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposListaConductor();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo lista de conductor:', error);
      return codigo;
    }
  }   
  /**
   * Mapea el código de tipo de anio a su nombre
   */
  async obtenerNombreTipoAnio(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposAnios();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo anio:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de tributo rd a su nombre
   */
  async obtenerNombreTipoTributoRd(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTributoRd();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tributo rd:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de tipo de alcabala a su nombre
   */
  async obtenerNombreTipoTipoAlcabala(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoAlcabala();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de alcabala:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de lado de dirección a su nombre
   */
  async obtenerNombreTipoLadoDireccion(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposLadosDirecciones();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo lado de dirección:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo de motivo de registro de piso a su nombre
   */
  async obtenerNombreTipoMotivoRegistroPiso(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposMotivosRegistroPiso();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo motivo de registro de piso:', error);
      return codigo;
    }
  }
  /**
   * Obtiene los tipos de inscripcion de predio
   */
  async obtenerTiposTipoInscripcionPredio(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPOS_DE_INSCRIPCION_DE_PREDIO);
  }
  /**
   * Mapea el código de tipo de inscripcion de predio a su nombre
   */
  async obtenerNombreTipoInscripcionPredio(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoInscripcionPredio();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo inscripcion de predio:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de trimestre a su nombre
   */
  async obtenerNombreTipoTrimestre(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTrimestre();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo trimestre:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de informe a su nombre
   */
  async obtenerNombreTipoInforme(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposInformes();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo informe:', error);
      return codigo;
    }
  }
  /**
   * Mapea el código de tipo Tipos de form a su nombre
   */
  async obtenerNombreTipoTiposForm(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoForm();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo trimestre:', error);
      return codigo;
    }
  }
  /**
   * Obtiene los tipos de estados
   */
  async obtenerTiposEstados(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.ESTADOS);
  }
  /**
   * Mapea el código de tipo de estados a su nombre
   */
  async obtenerNombreTipoEstados(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposEstados();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo estados:', error);
      return codigo;
    }
  }
  /**
   * Obtiene los tipos de lista de uso
   */
  async obtenerTiposListaUso(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.LISTA_DE_USOS);
  }
  /**
   * Mapea el código de tipo de lista de uso a su nombre
   */
  async obtenerNombreTipoListaUso(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposListaUso();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo lista de uso:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de categoría a su nombre
   */
  async obtenerNombreTipoCategorias(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCategorias();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo categorias:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de tipo de terreno a su nombre
   */
  async obtenerNombreTipoTipoTerreno(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoTerreno();    
      const tipo = tipos.find(t => t.codConstante === codigo);    
      return tipo?.nombreCategoria || codigo;
    } catch (error) {   
      console.error('Error al obtener nombre de tipo tipo de terreno:', error);
      return codigo;
    }
  }
  /**
   * Obtiene los tipos de tipo de interes
   */
  async obtenerTiposTipoDeInteres(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_INTERES);
  }
  /**
   * Mapea el código de tipo de tipo de interes a su nombre
   */
  async obtenerNombreTipoTipoDeInteres(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoDeInteres();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de interes:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de conceptos de convenios a su nombre
   */
  async obtenerNombreTipoConceptosConvenios(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposConceptosConvenios();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo; 
    } catch (error) {
      console.error('Error al obtener nombre de tipo conceptos de convenios:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de tipo de constancia de no adeudo a su nombre
   */
  async obtenerNombreTipoTipoConstanciaNoAdeudo(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTipoConstanciaNoAdeudo();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tipo de constancia de no adeudo:', error);
      return codigo;
    }
  }

    /**
   * Mapea el código de tipo de valores de orden de pago a su nombre
   */
  async obtenerNombreTipoValoresOrdenPago(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposValoresOrdenPago();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo valores de orden de pago:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de historial de predios a su nombre
   */
  async obtenerNombreTipoHistorialPredios(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposHistorialPredios();    
      const tipo = tipos.find(t => t.codConstante === codigo);          
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo historial de predios:', error);
      return codigo;
    }
  } 


  /**
   * Mapea el código de tipo de nacionalidad a su nombre
   */
  async obtenerNombreTipoNacionalidad(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposNacionalidad();        
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo nacionalidad:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de condicion del predio a su nombre
   */
  async obtenerNombreTipoCondicionPredio(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCondicionPredio();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) { 
      console.error('Error al obtener nombre de tipo condicion del predio:', error);
      return codigo;
    }
  }

    /**
   * Mapea el código de tipo de adjudicacion de predio rustico a su nombre
   */
  async obtenerNombreTipoAdjudicacionPredioRustico(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposAdjudicacionPredioRustico();    
      const tipo = tipos.find(t => t.codConstante === codigo);      
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo adjudicacion de predio rustico:', error);
      return codigo;
    }
  }
  /**
   * Obtiene los tipos de casa
   */
  async obtenerTiposCasa(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPOS_DE_CASA);
  }
  /**
   * Mapea el código de tipo de casa a su nombre
   */
  async obtenerNombreTipoCasa(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCasa();    
      const tipo = tipos.find(t => t.codConstante === codigo);        
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo casa:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de predio rustico a su nombre
   */
  async obtenerNombreTipoPredioRustico(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposPredioRustico();    
      const tipo = tipos.find(t => t.codConstante === codigo);        
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo predio rustico:', error);
      return codigo;
    }
  }
  /**
   * Obtiene los tipos de tramite
   */
  async obtenerTiposTramite(): Promise<ConstanteData[]> {
    return this.listarConstantesPorPadre(CODIGO_CONSTANTE_PADRE.TIPO_DE_TRAMITE);
  }
  /**
   * Mapea el código de tipo de tramite a su nombre
   */
  async obtenerNombreTipoTramite(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTramite();    
      const tipo = tipos.find(t => t.codConstante === codigo);          
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tramite:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de tramites temporales a su nombre
   */
  async obtenerNombreTipoTramitesTemporales(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposTramitesTemporales();    
      const tipo = tipos.find(t => t.codConstante === codigo);          
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo tramites temporales:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de compatibilidad a su nombre
   */
  async obtenerNombreTipoCompatibilidad(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCompatibilidad();    
      const tipo = tipos.find(t => t.codConstante === codigo);            
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo compatibilidad:', error);
      return codigo;
    }
  }
 
  /**
   * Mapea el código de tipo de actos administrativos a su nombre
   */
  async obtenerNombreTipoActosAdministrativos(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposActosAdministrativos();    
      const tipo = tipos.find(t => t.codConstante === codigo);              
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo actos administrativos:', error);
      return codigo;
    }
  }

  /**
   * Mapea el código de tipo de sector economico a su nombre
   */
    async obtenerNombreTipoSectorEconomico(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposSectorEconomico();    
      const tipo = tipos.find(t => t.codConstante === codigo);              
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo sector economico:', error);
      return codigo;
    }
  }

 
  /**
   * Mapea el código de tipo de condicion de licencia a su nombre
   */
  async obtenerNombreTipoCondicionLicencia(codigo: string): Promise<string> {
    try {
      const tipos = await this.obtenerTiposCondicionLicencia();    
      const tipo = tipos.find(t => t.codConstante === codigo);              
      return tipo?.nombreCategoria || codigo;
    } catch (error) {
      console.error('Error al obtener nombre de tipo condicion de licencia:', error);
      return codigo;
    }
  }

   
}

// Crear y exportar la instancia
const constanteService = ConstanteService.getInstance();

// Exportación por defecto
export default constanteService;

// Exportaciones nombradas
export { ConstanteService };