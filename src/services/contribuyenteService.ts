// src/services/contribuyenteService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';

import { personaService } from './personaService';

/**
 * Interfaces para Contribuyente
 */
export interface ContribuyenteData {
  codigo: number;
  codigoPersona: number;
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
  nombreCompleto: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: number;
  estadoCivil?: string;
  sexo?: string;
  lote?: string;
  estado?: string;
  fechaRegistro?: string;
  codUsuario?: number;
  // Datos del cónyuge
  conyuge?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
    tipoDocumento: string;
  };
  // Datos del representante legal
  representanteLegal?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroDocumento: string;
    tipoDocumento: string;
  };
}

export interface CreateContribuyenteDTO {
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: string;
  estadoCivil?: string;
  sexo?: string;
  lote?: string;
  codUsuario?: number;
  // Datos del cónyuge
  conyugeNombres?: string;
  conyugeApellidoPaterno?: string;
  conyugeApellidoMaterno?: string;
  conyugeNumeroDocumento?: string;
  conyugeTipoDocumento?: string;
  // Datos del representante legal
  repreNombres?: string;
  repreApellidoPaterno?: string;
  repreApellidoMaterno?: string;
  repreNumeroDocumento?: string;
  repreTipoDocumento?: string;
}

export interface UpdateContribuyenteDTO extends Partial<CreateContribuyenteDTO> {
  codigo?: number;
}

export interface BusquedaContribuyenteParams {
  tipoPersona?: string;
  numeroDocumento?: string;
  nombre?: string;
  parametroBusqueda?: string;
  estado?: string;
  codUsuario?: number;
}

// Constantes
export const TIPO_PERSONA = {
  NATURAL: '0301',
  JURIDICA: '0302'
} as const;

export const TIPO_DOCUMENTO = {
  DNI: '0101',
  RUC: '0102',
  CE: '0103',
  PASAPORTE: '0104'
} as const;

/**
 * Servicio unificado para gestión de contribuyentes
 * Combina funcionalidades de contribuyenteService y contribuyenteListService
 * 
 * Autenticación:
 * - GET (listar, buscar): No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class ContribuyenteService extends BaseApiService<ContribuyenteData, CreateContribuyenteDTO, UpdateContribuyenteDTO> {
  private static instance: ContribuyenteService;
  
  private constructor() {
    super(
      '/api/contribuyente',
      {
        normalizeItem: (item: any) => ({
          codigo: item.codContribuyente || item.codigo,
          codigoPersona: item.codPersona || item.codigoPersona,
          tipoPersona: item.tipoPersona || item.codTipopersona || '',
          tipoDocumento: item.tipoDocumento || item.codTipoDocumento || '',
          numeroDocumento: item.numeroDocumento || item.numerodocumento || '',
          nombres: item.nombres || '',
          apellidoPaterno: item.apellidoPaterno || item.apellidopaterno || '',
          apellidoMaterno: item.apellidoMaterno || item.apellidomaterno || '',
          razonSocial: item.razonSocial || '',
          nombreCompleto: item.nombreCompleto || item.nombrePersona || 
            ContribuyenteService.construirNombreCompleto(item),
          direccion: item.direccion === 'null' ? '' : (item.direccion || ''),
          telefono: item.telefono || '',
          email: item.email || '',
          fechaNacimiento: item.fechaNacimiento || item.fechanacimiento,
          estadoCivil: item.estadoCivil || item.codestadocivil,
          sexo: item.sexo || item.codsexo,
          lote: item.lote || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario,
          // Mapear datos del cónyuge si existen
          conyuge: item.conyugeNombres ? {
            nombres: item.conyugeNombres,
            apellidoPaterno: item.conyugeApellidoPaterno || '',
            apellidoMaterno: item.conyugeApellidoMaterno || '',
            numeroDocumento: item.conyugeNumeroDocumento || '',
            tipoDocumento: item.conyugeTipoDocumento || ''
          } : undefined,
          // Mapear datos del representante legal si existen
          representanteLegal: item.repreNombres ? {
            nombres: item.repreNombres,
            apellidoPaterno: item.repreApellidoPaterno || '',
            apellidoMaterno: item.repreApellidoMaterno || '',
            numeroDocumento: item.repreNumeroDocumento || '',
            tipoDocumento: item.repreTipoDocumento || ''
          } : undefined
        }),
        
        validateItem: (item: ContribuyenteData) => {
          return !!(item.numeroDocumento && (item.codigo || item.codigoPersona));
        }
      },
      'contribuyente'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): ContribuyenteService {
    if (!ContribuyenteService.instance) {
      ContribuyenteService.instance = new ContribuyenteService();
    }
    return ContribuyenteService.instance;
  }
  
  /**
   * Construye el nombre completo según el tipo de persona
   */
  private static construirNombreCompleto(item: any): string {
    // Si es persona jurídica y tiene razón social
    if ((item.tipoPersona === TIPO_PERSONA.JURIDICA || item.codTipopersona === TIPO_PERSONA.JURIDICA) 
        && item.razonSocial) {
      return item.razonSocial;
    }
    
    // Para persona natural
    const partes = [
      item.apellidoPaterno || item.apellidopaterno,
      item.apellidoMaterno || item.apellidomaterno,
      item.nombres
    ].filter(Boolean);
    
    return partes.join(' ').trim() || 'Sin nombre';
  }
  
  /**
   * Lista todos los contribuyentes
   * NO requiere autenticación (método GET)
   */
  async listarContribuyentes(params?: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Listando contribuyentes:', params);
      
      // Si no hay parámetros específicos, usar el endpoint de personas
      if (!params || Object.keys(params).length === 0) {
        return await this.listarDesdePersonas();
      }
      
      // Si hay parámetros, usar el endpoint de contribuyentes
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error listando contribuyentes:', error);
      throw error;
    }
  }
  
  /**
   * Lista contribuyentes usando el endpoint de personas
   * NO requiere autenticación
   */
  private async listarDesdePersonas(parametroBusqueda: string = 'a'): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Listando desde endpoint de personas');
      
      // Usar personaService para obtener la lista
      const personas = await personaService.listarPorTipoYNombre({
        parametroBusqueda,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      // Convertir personas a formato de contribuyente
      const contribuyentes = personas.map(persona => ({
        codigo: 0, // No tenemos código de contribuyente desde personas
        codigoPersona: persona.codPersona,
        tipoPersona: persona.codTipopersona || '',
        tipoDocumento: persona.codTipoDocumento || '',
        numeroDocumento: persona.numerodocumento,
        nombres: persona.nombres || '',
        apellidoPaterno: persona.apellidopaterno || '',
        apellidoMaterno: persona.apellidomaterno || '',
        razonSocial: persona.razonSocial || '',
        nombreCompleto: persona.nombrePersona,
        direccion: persona.direccion || '',
        telefono: persona.telefono || '',
        email: persona.email || '',
        fechaNacimiento: persona.fechanacimiento,
        estadoCivil: persona.codestadocivil,
        sexo: persona.codsexo,
        lote: persona.lote,
        estado: persona.estado || 'ACTIVO',
        fechaRegistro: persona.fechaRegistro,
        codUsuario: persona.codUsuario
      }));
      
      console.log(`✅ [ContribuyenteService] ${contribuyentes.length} contribuyentes obtenidos desde personas`);
      return contribuyentes;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error listando desde personas:', error);
      throw error;
    }
  }
  
  /**
   * Busca contribuyentes por diferentes criterios
   * NO requiere autenticación (método GET)
   */
  async buscarContribuyentes(criterios: BusquedaContribuyenteParams): Promise<ContribuyenteData[]> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando contribuyentes:', criterios);
      
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando contribuyentes:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un contribuyente por número de documento
   * NO requiere autenticación (método GET)
   */
  async obtenerPorDocumento(numeroDocumento: string): Promise<ContribuyenteData | null> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando por documento:', numeroDocumento);
      
      const results = await this.search({ 
        numeroDocumento,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      return results.length > 0 ? results[0] : null;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando por documento:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un contribuyente por código de persona
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigoPersona(codPersona: number): Promise<ContribuyenteData | null> {
    try {
      console.log('🔍 [ContribuyenteService] Buscando por código de persona:', codPersona);
      
      // Primero intentar buscar en contribuyentes
      const contribuyentes = await this.getAll();
      const encontrado = contribuyentes.find(c => c.codigoPersona === codPersona);
      
      if (encontrado) {
        return encontrado;
      }
      
      // Si no se encuentra, buscar en personas y convertir
      const persona = await personaService.obtenerPorCodigo(codPersona);
      if (persona) {
        return this.convertirPersonaAContribuyente(persona);
      }
      
      return null;
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error buscando por código de persona:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo contribuyente
   * REQUIERE autenticación (método POST)
   */
  async crearContribuyente(datos: CreateContribuyenteDTO): Promise<ContribuyenteData> {
    try {
      console.log('➕ [ContribuyenteService] Creando contribuyente:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear contribuyentes');
      }
      
      const datosCompletos = {
        ...datos,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error creando contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un contribuyente existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarContribuyente(
    codigo: number, 
    datos: UpdateContribuyenteDTO
  ): Promise<ContribuyenteData> {
    try {
      console.log('📝 [ContribuyenteService] Actualizando contribuyente:', codigo, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar contribuyentes');
      }
      
      const datosCompletos = {
        ...datos,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(codigo, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error actualizando contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un contribuyente
   * REQUIERE autenticación (método DELETE)
   */
  async eliminarContribuyente(codigo: number): Promise<void> {
    try {
      console.log('🗑️ [ContribuyenteService] Eliminando contribuyente:', codigo);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar contribuyentes');
      }
      
      return await this.delete(codigo);
      
    } catch (error: any) {
      console.error('❌ [ContribuyenteService] Error eliminando contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Convierte una persona a formato de contribuyente
   */
  private convertirPersonaAContribuyente(persona: any): ContribuyenteData {
    return {
      codigo: 0,
      codigoPersona: persona.codPersona,
      tipoPersona: persona.codTipopersona || '',
      tipoDocumento: persona.codTipoDocumento || '',
      numeroDocumento: persona.numerodocumento || '',
      nombres: persona.nombres || '',
      apellidoPaterno: persona.apellidopaterno || '',
      apellidoMaterno: persona.apellidomaterno || '',
      razonSocial: persona.razonSocial || '',
      nombreCompleto: persona.nombrePersona || ContribuyenteService.construirNombreCompleto(persona),
      direccion: persona.direccion || '',
      telefono: persona.telefono || '',
      email: persona.email || '',
      fechaNacimiento: persona.fechanacimiento,
      estadoCivil: persona.codestadocivil,
      sexo: persona.codsexo,
      lote: persona.lote,
      estado: persona.estado || 'ACTIVO',
      codUsuario: persona.codUsuario
    };
  }
  
  /**
   * Valida un número de documento según el tipo
   */
  validarDocumento(tipoDocumento: string, numeroDocumento: string): {
    valido: boolean;
    mensaje?: string;
  } {
    // DNI: 8 dígitos
    if (tipoDocumento === TIPO_DOCUMENTO.DNI || tipoDocumento === 'DNI') {
      if (!/^\d{8}$/.test(numeroDocumento)) {
        return { 
          valido: false, 
          mensaje: 'El DNI debe tener exactamente 8 dígitos' 
        };
      }
    }
    
    // RUC: 11 dígitos
    if (tipoDocumento === TIPO_DOCUMENTO.RUC || tipoDocumento === 'RUC') {
      if (!/^\d{11}$/.test(numeroDocumento)) {
        return { 
          valido: false, 
          mensaje: 'El RUC debe tener exactamente 11 dígitos' 
        };
      }
    }
    
    // Carnet de extranjería: hasta 12 caracteres alfanuméricos
    if (tipoDocumento === TIPO_DOCUMENTO.CE || tipoDocumento === 'CE') {
      if (!/^[A-Z0-9]{4,12}$/.test(numeroDocumento.toUpperCase())) {
        return { 
          valido: false, 
          mensaje: 'El Carnet de Extranjería debe tener entre 4 y 12 caracteres alfanuméricos' 
        };
      }
    }
    
    return { valido: true };
  }
}

// Exportar instancia singleton
export const contribuyenteService = ContribuyenteService.getInstance();

// Exportar también la clase por si se necesita extender
export default ContribuyenteService;