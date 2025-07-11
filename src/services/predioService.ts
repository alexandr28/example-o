// src/services/predioService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { pisoService } from './pisoService';
import { direccionService } from './direccionService';

/**
 * Interfaces para Predio
 */
export interface PredioData {
  id: number;
  codigoContribuyente: number;
  codigoDireccion: number;
  codigoCatastral?: string;
  numeroFicha?: string;
  tipoPropiedad?: string;
  usoPropiedad?: string;
  clasificacionPredio?: string;
  estadoPredio?: string;
  areaTerreno: number;
  areaConstruida?: number;
  valorTerreno?: number;
  valorConstruccion?: number;
  valorTotal?: number;
  porcentajePropiedad?: number;
  fechaAdquisicion?: string;
  condicionPropiedad?: string;
  observaciones?: string;
  direccionCompleta?: string;
  nombreContribuyente?: string;
  estado?: string;
  fechaRegistro?: string;
  fechaModificacion?: string;
  codUsuario?: number;
}

export interface CreatePredioDTO {
  codigoContribuyente: number;
  codigoDireccion: number;
  codigoCatastral?: string;
  numeroFicha?: string;
  tipoPropiedad?: string;
  usoPropiedad?: string;
  clasificacionPredio?: string;
  estadoPredio?: string;
  areaTerreno: number;
  porcentajePropiedad?: number;
  fechaAdquisicion?: string;
  condicionPropiedad?: string;
  observaciones?: string;
  codUsuario?: number;
}

export interface UpdatePredioDTO extends Partial<CreatePredioDTO> {
  valorTerreno?: number;
  valorConstruccion?: number;
  estado?: string;
}

export interface BusquedaPredioParams {
  codigoContribuyente?: number;
  codigoCatastral?: string;
  numeroFicha?: string;
  tipoPropiedad?: string;
  usoPropiedad?: string;
  estadoPredio?: string;
  estado?: string;
  codUsuario?: number;
}

// Tipos de propiedad
export const TIPO_PROPIEDAD = {
  CASA_HABITACION: 'CASA_HABITACION',
  DEPARTAMENTO: 'DEPARTAMENTO',
  LOCAL_COMERCIAL: 'LOCAL_COMERCIAL',
  LOCAL_INDUSTRIAL: 'LOCAL_INDUSTRIAL',
  TERRENO: 'TERRENO',
  OTROS: 'OTROS'
} as const;

// Usos de propiedad
export const USO_PROPIEDAD = {
  VIVIENDA: 'VIVIENDA',
  COMERCIO: 'COMERCIO',
  INDUSTRIA: 'INDUSTRIA',
  EDUCACION: 'EDUCACION',
  SALUD: 'SALUD',
  CULTO: 'CULTO',
  RECREACION: 'RECREACION',
  OTROS: 'OTROS'
} as const;

// Clasificación de predio
export const CLASIFICACION_PREDIO = {
  URBANO: 'URBANO',
  RUSTICO: 'RUSTICO',
  ERIAZO: 'ERIAZO'
} as const;

// Estado del predio
export const ESTADO_PREDIO = {
  REGISTRADO: 'REGISTRADO',
  EN_PROCESO: 'EN_PROCESO',
  OBSERVADO: 'OBSERVADO',
  ANULADO: 'ANULADO'
} as const;

// Condición de propiedad
export const CONDICION_PROPIEDAD = {
  PROPIETARIO_UNICO: 'PROPIETARIO_UNICO',
  SUCESION: 'SUCESION',
  COPROPIETARIO: 'COPROPIETARIO',
  POSEEDOR: 'POSEEDOR',
  LITIGIO: 'LITIGIO',
  OTROS: 'OTROS'
} as const;

/**
 * Servicio para gestión de predios
 * 
 * Autenticación:
 * - GET: No requiere token
 * - POST/PUT/DELETE: Requieren token Bearer
 */
class PredioService extends BaseApiService<PredioData, CreatePredioDTO, UpdatePredioDTO> {
  private static instance: PredioService;
  
  private constructor() {
    super(
      '/api/predio',
      {
        normalizeItem: (item: any) => ({
          id: item.codPredio || item.id || 0,
          codigoContribuyente: item.codContribuyente || 0,
          codigoDireccion: item.codDireccion || 0,
          codigoCatastral: item.codigoCatastral || '',
          numeroFicha: item.numeroFicha || '',
          tipoPropiedad: item.tipoPropiedad || TIPO_PROPIEDAD.CASA_HABITACION,
          usoPropiedad: item.usoPropiedad || USO_PROPIEDAD.VIVIENDA,
          clasificacionPredio: item.clasificacionPredio || CLASIFICACION_PREDIO.URBANO,
          estadoPredio: item.estadoPredio || ESTADO_PREDIO.REGISTRADO,
          areaTerreno: parseFloat(item.areaTerreno || '0'),
          areaConstruida: parseFloat(item.areaConstruida || '0'),
          valorTerreno: parseFloat(item.valorTerreno || '0'),
          valorConstruccion: parseFloat(item.valorConstruccion || '0'),
          valorTotal: parseFloat(item.valorTotal || '0') || 
            (parseFloat(item.valorTerreno || '0') + parseFloat(item.valorConstruccion || '0')),
          porcentajePropiedad: parseFloat(item.porcentajePropiedad || '100'),
          fechaAdquisicion: item.fechaAdquisicion,
          condicionPropiedad: item.condicionPropiedad || CONDICION_PROPIEDAD.PROPIETARIO_UNICO,
          observaciones: item.observaciones || '',
          direccionCompleta: item.direccionCompleta || '',
          nombreContribuyente: item.nombreContribuyente || '',
          estado: item.estado || 'ACTIVO',
          fechaRegistro: item.fechaRegistro,
          fechaModificacion: item.fechaModificacion,
          codUsuario: item.codUsuario || API_CONFIG.defaultParams.codUsuario
        }),
        
        validateItem: (item: PredioData) => {
          // Validar que tenga los campos requeridos
          return !!(
            item.id && 
            item.codigoContribuyente && 
            item.codigoDireccion && 
            item.areaTerreno > 0
          );
        }
      },
      'predio'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PredioService {
    if (!PredioService.instance) {
      PredioService.instance = new PredioService();
    }
    return PredioService.instance;
  }
  
  /**
   * Lista todos los predios
   * NO requiere autenticación (método GET)
   */
  async listarPredios(incluirInactivos: boolean = false): Promise<PredioData[]> {
    try {
      console.log('🔍 [PredioService] Listando predios');
      
      const predios = await this.getAll();
      
      if (!incluirInactivos) {
        return predios.filter(p => p.estado === 'ACTIVO');
      }
      
      return predios;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error listando predios:', error);
      throw error;
    }
  }
  
  /**
   * Lista predios por contribuyente
   * NO requiere autenticación (método GET)
   */
  async listarPorContribuyente(
    codigoContribuyente: number, 
    incluirInactivos: boolean = false
  ): Promise<PredioData[]> {
    try {
      console.log('🔍 [PredioService] Listando predios del contribuyente:', codigoContribuyente);
      
      const predios = await this.search({ 
        codigoContribuyente,
        codUsuario: API_CONFIG.defaultParams.codUsuario
      });
      
      if (!incluirInactivos) {
        return predios.filter(p => p.estado === 'ACTIVO');
      }
      
      return predios;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error listando predios por contribuyente:', error);
      throw error;
    }
  }
  
  /**
   * Busca predios por criterios
   * NO requiere autenticación (método GET)
   */
  async buscarPredios(criterios: BusquedaPredioParams): Promise<PredioData[]> {
    try {
      console.log('🔍 [PredioService] Buscando predios:', criterios);
      
      const params = {
        ...criterios,
        codUsuario: criterios.codUsuario || API_CONFIG.defaultParams.codUsuario
      };
      
      return await this.search(params);
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error buscando predios:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un predio por código catastral
   * NO requiere autenticación (método GET)
   */
  async obtenerPorCodigoCatastral(codigoCatastral: string): Promise<PredioData | null> {
    try {
      console.log('🔍 [PredioService] Obteniendo predio por código catastral:', codigoCatastral);
      
      const predios = await this.search({ codigoCatastral });
      return predios.length > 0 ? predios[0] : null;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo predio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un predio con sus pisos
   * NO requiere autenticación (método GET)
   */
  async obtenerPredioCompleto(id: number): Promise<{
    predio: PredioData;
    pisos: any[];
    direccion: any;
  } | null> {
    try {
      console.log('🔍 [PredioService] Obteniendo predio completo:', id);
      
      const predio = await this.getById(id);
      if (!predio) {
        return null;
      }
      
      // Obtener pisos del predio
      const pisos = await pisoService.listarPorPredio(id);
      
      // Obtener dirección completa
      const direccion = await direccionService.obtenerPorCodigo(predio.codigoDireccion);
      
      return {
        predio,
        pisos,
        direccion
      };
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo predio completo:', error);
      throw error;
    }
  }
  
  /**
   * Calcula y actualiza valores del predio
   * NO requiere autenticación para cálculo, sí para actualización
   */
  async calcularValores(id: number): Promise<{
    areaTotal: number;
    valorTerreno: number;
    valorConstruccion: number;
    valorTotal: number;
  }> {
    try {
      console.log('💰 [PredioService] Calculando valores del predio:', id);
      
      const predio = await this.getById(id);
      if (!predio) {
        throw new Error('Predio no encontrado');
      }
      
      // Obtener área construida total de los pisos
      const areaConstruidaTotal = await pisoService.calcularAreaTotalPredio(id);
      
      // Aquí deberías implementar la lógica real de cálculo
      // Por ahora usamos valores de ejemplo
      const valorPorM2Terreno = 500; // S/. por m2
      const valorPorM2Construccion = 800; // S/. por m2
      
      const valores = {
        areaTotal: areaConstruidaTotal,
        valorTerreno: predio.areaTerreno * valorPorM2Terreno,
        valorConstruccion: areaConstruidaTotal * valorPorM2Construccion,
        valorTotal: 0
      };
      
      valores.valorTotal = valores.valorTerreno + valores.valorConstruccion;
      
      console.log('💰 [PredioService] Valores calculados:', valores);
      
      return valores;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error calculando valores:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si un código catastral ya existe
   * NO requiere autenticación (método GET)
   */
  async verificarCodigoCatastralExiste(
    codigoCatastral: string, 
    excluirId?: number
  ): Promise<boolean> {
    try {
      if (!codigoCatastral) return false;
      
      const predios = await this.search({ codigoCatastral });
      
      if (excluirId) {
        return predios.some(p => p.id !== excluirId);
      }
      
      return predios.length > 0;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error verificando código catastral:', error);
      return false;
    }
  }
  
  /**
   * Crea un nuevo predio
   * REQUIERE autenticación (método POST)
   */
  async crearPredio(datos: CreatePredioDTO): Promise<PredioData> {
    try {
      console.log('➕ [PredioService] Creando predio:', datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para crear predios');
      }
      
      // Validar datos básicos
      if (!datos.codigoContribuyente || datos.codigoContribuyente <= 0) {
        throw new Error('Debe especificar un contribuyente válido');
      }
      
      if (!datos.codigoDireccion || datos.codigoDireccion <= 0) {
        throw new Error('Debe especificar una dirección válida');
      }
      
      if (!datos.areaTerreno || datos.areaTerreno <= 0) {
        throw new Error('El área del terreno debe ser mayor a 0');
      }
      
      // Verificar código catastral único
      if (datos.codigoCatastral) {
        const existe = await this.verificarCodigoCatastralExiste(datos.codigoCatastral);
        if (existe) {
          throw new Error('Ya existe un predio con ese código catastral');
        }
      }
      
      // Validar porcentaje de propiedad
      if (datos.porcentajePropiedad !== undefined && 
          (datos.porcentajePropiedad <= 0 || datos.porcentajePropiedad > 100)) {
        throw new Error('El porcentaje de propiedad debe estar entre 0 y 100');
      }
      
      const datosCompletos = {
        ...datos,
        porcentajePropiedad: datos.porcentajePropiedad || 100,
        estadoPredio: datos.estadoPredio || ESTADO_PREDIO.REGISTRADO,
        tipoPropiedad: datos.tipoPropiedad || TIPO_PROPIEDAD.CASA_HABITACION,
        usoPropiedad: datos.usoPropiedad || USO_PROPIEDAD.VIVIENDA,
        clasificacionPredio: datos.clasificacionPredio || CLASIFICACION_PREDIO.URBANO,
        condicionPropiedad: datos.condicionPropiedad || CONDICION_PROPIEDAD.PROPIETARIO_UNICO,
        codUsuario: datos.codUsuario || API_CONFIG.defaultParams.codUsuario,
        estado: 'ACTIVO',
        fechaRegistro: new Date().toISOString()
      };
      
      return await this.create(datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error creando predio:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un predio existente
   * REQUIERE autenticación (método PUT)
   */
  async actualizarPredio(id: number, datos: UpdatePredioDTO): Promise<PredioData> {
    try {
      console.log('📝 [PredioService] Actualizando predio:', id, datos);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para actualizar predios');
      }
      
      // Obtener predio actual
      const predioActual = await this.getById(id);
      if (!predioActual) {
        throw new Error('Predio no encontrado');
      }
      
      // Validaciones
      if (datos.areaTerreno !== undefined && datos.areaTerreno <= 0) {
        throw new Error('El área del terreno debe ser mayor a 0');
      }
      
      if (datos.codigoCatastral && datos.codigoCatastral !== predioActual.codigoCatastral) {
        const existe = await this.verificarCodigoCatastralExiste(datos.codigoCatastral, id);
        if (existe) {
          throw new Error('Ya existe otro predio con ese código catastral');
        }
      }
      
      if (datos.porcentajePropiedad !== undefined && 
          (datos.porcentajePropiedad <= 0 || datos.porcentajePropiedad > 100)) {
        throw new Error('El porcentaje de propiedad debe estar entre 0 y 100');
      }
      
      // Calcular valor total si se actualizan valores
      let valorTotal = predioActual.valorTotal;
      if (datos.valorTerreno !== undefined || datos.valorConstruccion !== undefined) {
        const valorTerreno = datos.valorTerreno ?? predioActual.valorTerreno;
        const valorConstruccion = datos.valorConstruccion ?? predioActual.valorConstruccion;
        valorTotal = valorTerreno + valorConstruccion;
      }
      
      const datosCompletos = {
        ...datos,
        valorTotal,
        fechaModificacion: new Date().toISOString()
      };
      
      return await this.update(id, datosCompletos);
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error actualizando predio:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza valores calculados del predio
   * REQUIERE autenticación (método PUT)
   */
  async actualizarValoresCalculados(id: number): Promise<PredioData> {
    try {
      console.log('💰 [PredioService] Actualizando valores calculados del predio:', id);
      
      // Calcular nuevos valores
      const valores = await this.calcularValores(id);
      
      // Actualizar predio con los nuevos valores
      return await this.actualizarPredio(id, {
        valorTerreno: valores.valorTerreno,
        valorConstruccion: valores.valorConstruccion
      });
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error actualizando valores:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un predio (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarPredio(id: number): Promise<void> {
    try {
      console.log('🗑️ [PredioService] Eliminando predio:', id);
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para eliminar predios');
      }
      
      // Verificar si tiene pisos activos
      const pisos = await pisoService.listarPorPredio(id);
      if (pisos.length > 0) {
        throw new Error('No se puede eliminar un predio con pisos registrados');
      }
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.update(id, {
        estado: 'INACTIVO',
        estadoPredio: ESTADO_PREDIO.ANULADO,
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [PredioService] Predio marcado como inactivo');
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error eliminando predio:', error);
      throw error;
    }
  }
  
  /**
   * Transfiere un predio a otro contribuyente
   * REQUIERE autenticación (método PUT)
   */
  async transferirPredio(
    id: number, 
    nuevoContribuyente: number, 
    fechaTransferencia?: string
  ): Promise<PredioData> {
    try {
      console.log('🔄 [PredioService] Transfiriendo predio:', 
        { id, nuevoContribuyente, fechaTransferencia });
      
      // Verificar token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Se requiere autenticación para transferir predios');
      }
      
      return await this.actualizarPredio(id, {
        codigoContribuyente: nuevoContribuyente,
        fechaAdquisicion: fechaTransferencia || new Date().toISOString(),
        observaciones: `Transferido el ${new Date().toLocaleDateString()}`
      });
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error transfiriendo predio:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de predios
   * NO requiere autenticación (método GET)
   */
  async obtenerEstadisticas(codigoContribuyente?: number): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    areaTerrenoTotal: number;
    areaConstruidaTotal: number;
    valorTerrenoTotal: number;
    valorConstruccionTotal: number;
    valorTotal: number;
    porTipoPropiedad: { [key: string]: number };
    porUsoPropiedad: { [key: string]: number };
    porEstadoPredio: { [key: string]: number };
  }> {
    try {
      let predios: PredioData[];
      
      if (codigoContribuyente) {
        predios = await this.listarPorContribuyente(codigoContribuyente, true);
      } else {
        predios = await this.getAll();
      }
      
      const estadisticas = {
        total: predios.length,
        activos: predios.filter(p => p.estado === 'ACTIVO').length,
        inactivos: predios.filter(p => p.estado === 'INACTIVO').length,
        areaTerrenoTotal: 0,
        areaConstruidaTotal: 0,
        valorTerrenoTotal: 0,
        valorConstruccionTotal: 0,
        valorTotal: 0,
        porTipoPropiedad: {} as { [key: string]: number },
        porUsoPropiedad: {} as { [key: string]: number },
        porEstadoPredio: {} as { [key: string]: number }
      };
      
      // Calcular totales y agrupar
      for (const predio of predios) {
        // Totales
        estadisticas.areaTerrenoTotal += predio.areaTerreno;
        estadisticas.areaConstruidaTotal += predio.areaConstruida || 0;
        estadisticas.valorTerrenoTotal += predio.valorTerreno || 0;
        estadisticas.valorConstruccionTotal += predio.valorConstruccion || 0;
        estadisticas.valorTotal += predio.valorTotal || 0;
        
        // Por tipo de propiedad
        const tipo = predio.tipoPropiedad || 'SIN TIPO';
        estadisticas.porTipoPropiedad[tipo] = 
          (estadisticas.porTipoPropiedad[tipo] || 0) + 1;
        
        // Por uso de propiedad
        const uso = predio.usoPropiedad || 'SIN USO';
        estadisticas.porUsoPropiedad[uso] = 
          (estadisticas.porUsoPropiedad[uso] || 0) + 1;
        
        // Por estado del predio
        const estado = predio.estadoPredio || 'SIN ESTADO';
        estadisticas.porEstadoPredio[estado] = 
          (estadisticas.porEstadoPredio[estado] || 0) + 1;
      }
      
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [PredioService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const predioService = PredioService.getInstance();

// Exportar también la clase por si se necesita extender
export default PredioService;