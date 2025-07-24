// src/services/uitService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos de UIT como vienen del API
 */
export interface UITApiResponse {
  codUit: number | null;
  anio: number;
  valor: number | null;
  valorUit?: number;
  valQuinit?: number;
  alicuota?: number;
  rangoInicial?: number;
  rangoFinal?: number;
  impuestoParcial?: number;
  impuestoAcumulado?: number | string;
  codEpa?: number;
  estado?: string;
  fechaVigenciaDesde?: string;
  fechaVigenciaHasta?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

/**
 * Interface para los datos de UIT normalizados
 */
export interface UITData {
  id: number;
  codUit?: number | null;
  anio: number;
  valor: number;
  valQuinit?: number;
  alicuota?: number;
  rangoInicial?: number;
  rangoFinal?: number;
  impuestoParcial?: number;
  impuestoAcumulado?: number;
  codEpa?: number;
  estado?: string;
  fechaVigenciaDesde?: string;
  fechaVigenciaHasta?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  usuarioCreacion?: string;
  usuarioModificacion?: string;
}

export interface CreateUITDTO {
  anio: number;
  valor: number;
  estado?: string;
  codUsuario?: number;
}

export interface UpdateUITDTO extends Partial<CreateUITDTO> {
  fechaModificacion?: string;
}

// Datos de demostración predefinidos
const DEMO_UIT_DATA: UITData[] = [
  {
    id: 2025,
    codUit: 2025,
    anio: 2025,
    valor: 5350,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2025-01-01',
    fechaVigenciaHasta: '2025-12-31'
  },
  {
    id: 2024,
    codUit: 2024,
    anio: 2024,
    valor: 5150,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2024-01-01',
    fechaVigenciaHasta: '2024-12-31'
  },
  {
    id: 2023,
    codUit: 2023,
    anio: 2023,
    valor: 4950,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2023-01-01',
    fechaVigenciaHasta: '2023-12-31'
  },
  {
    id: 2022,
    codUit: 2022,
    anio: 2022,
    valor: 4600,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2022-01-01',
    fechaVigenciaHasta: '2022-12-31'
  },
  {
    id: 2021,
    codUit: 2021,
    anio: 2021,
    valor: 4400,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2021-01-01',
    fechaVigenciaHasta: '2021-12-31'
  },
  {
    id: 2020,
    codUit: 2020,
    anio: 2020,
    valor: 4300,
    estado: 'ACTIVO',
    fechaVigenciaDesde: '2020-01-01',
    fechaVigenciaHasta: '2020-12-31'
  }
];

const DEMO_ALICUOTAS: UITData[] = [
  {
    id: 101,
    codUit: 101,
    anio: 2025,
    valor: 0,
    alicuota: 0.2,
    rangoInicial: 0,
    rangoFinal: 5,
    impuestoParcial: 0,
    impuestoAcumulado: 0,
    estado: 'ACTIVO'
  },
  {
    id: 102,
    codUit: 102,
    anio: 2025,
    valor: 0,
    alicuota: 0.6,
    rangoInicial: 5,
    rangoFinal: 60,
    impuestoParcial: 0.01,
    impuestoAcumulado: 0.01,
    estado: 'ACTIVO'
  },
  {
    id: 103,
    codUit: 103,
    anio: 2025,
    valor: 0,
    alicuota: 1.0,
    rangoInicial: 60,
    rangoFinal: 999999,
    impuestoParcial: 0.33,
    impuestoAcumulado: 0.34,
    estado: 'ACTIVO'
  }
];

/**
 * Servicio para gestión de valores UIT
 */
class UITService extends BaseApiService<UITData, CreateUITDTO, UpdateUITDTO> {
  private static instance: UITService;
  
  private constructor() {
    super(
      '/api/uitEpa',
      {
        normalizeItem: (item: any): UITData => {
          // Manejar impuestoAcumulado que puede venir como string
          let impuestoAcumulado = 0;
          if (item.impuestoAcumulado) {
            if (typeof item.impuestoAcumulado === 'string') {
              impuestoAcumulado = parseFloat(item.impuestoAcumulado) || 0;
            } else {
              impuestoAcumulado = item.impuestoAcumulado;
            }
          }

          // IMPORTANTE: Usar valorUit si valor es null
          const valorFinal = item.valor !== null 
            ? parseFloat(item.valor.toString()) 
            : (item.valorUit ? parseFloat(item.valorUit.toString()) : 0);

          return {
            id: item.codUit || 0,
            codUit: item.codUit,
            anio: item.anio || new Date().getFullYear(),
            valor: valorFinal,
            valQuinit: item.valQuinit ? parseFloat(item.valQuinit.toString()) : 0,
            alicuota: item.alicuota ? parseFloat(item.alicuota.toString()) : 0,
            rangoInicial: item.rangoInicial ? parseFloat(item.rangoInicial.toString()) : 0,
            rangoFinal: item.rangoFinal ? parseFloat(item.rangoFinal.toString()) : 0,
            impuestoParcial: item.impuestoParcial ? parseFloat(item.impuestoParcial.toString()) : 0,
            impuestoAcumulado: impuestoAcumulado,
            codEpa: item.codEpa || 0,
            estado: item.estado || 'ACTIVO',
            fechaVigenciaDesde: item.fechaVigenciaDesde,
            fechaVigenciaHasta: item.fechaVigenciaHasta,
            fechaCreacion: item.fechaCreacion,
            fechaModificacion: item.fechaModificacion,
            usuarioCreacion: item.usuarioCreacion,
            usuarioModificacion: item.usuarioModificacion
          };
        },
        
        validateItem: (item: UITData) => {
          return !!(
            item.anio > 1990 && 
            item.anio <= 2100 && 
            item.valor >= 0
          );
        }
      },
      'uit_cache'
    );
  }
  
  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): UITService {
    if (!UITService.instance) {
      UITService.instance = new UITService();
    }
    return UITService.instance;
  }

  /**
   * Lista todos los valores UIT por año
   * Usa el API real con form-data
   */
  async listarUITs(anio?: number): Promise<UITData[]> {
    try {
      console.log('🔍 [UITService] Listando UITs para año:', anio || 'todos');
      
      // Construir URL con query parameters
      let url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      if (anio) {
        const params = new URLSearchParams();
        params.append('anio', anio.toString());
        url += `?${params.toString()}`;
      }
      
      console.log('📡 [UITService] GET:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 [UITService] Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [UITService] Error:', errorText);
        
        // Si hay error, devolver datos demo como fallback
        console.warn('⚠️ [UITService] Usando datos de respaldo');
        if (anio) {
          const uitsAnio = DEMO_UIT_DATA.filter(u => u.anio === anio);
          return uitsAnio.length > 0 ? uitsAnio : [];
        }
        return DEMO_UIT_DATA;
      }
      
      // Parsear la respuesta
      const responseData = await response.json();
      console.log('✅ [UITService] Datos recibidos:', responseData);
      
      // El API devuelve directamente un array en data
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return this.normalizeData(responseData.data);
      }
      
      // Si la respuesta es un array directamente
      if (Array.isArray(responseData)) {
        return this.normalizeData(responseData);
      }
      
      // Si no hay datos, devolver array vacío
      console.warn('⚠️ [UITService] No se encontraron datos');
      return [];
      
    } catch (error: any) {
      console.error('❌ [UITService] Error:', error);
      
      // En caso de error, devolver datos demo como fallback
      console.warn('⚠️ [UITService] Usando datos de respaldo debido a error');
      if (anio) {
        const uitsAnio = DEMO_UIT_DATA.filter(u => u.anio === anio);
        return uitsAnio.length > 0 ? uitsAnio : [];
      }
      return DEMO_UIT_DATA;
    }
  }

  /**
   * Obtiene todos los valores UIT (wrapper para compatibilidad)
   */
  async getAll(): Promise<UITData[]> {
    return this.listarUITs();
  }

  /**
   * Obtiene el valor UIT vigente
   */
  async obtenerVigente(): Promise<UITData | null> {
    try {
      const anioActual = new Date().getFullYear();
      const uits = await this.listarUITs();
      
      // Buscar UIT del año actual que NO sea una alícuota (sin rangos)
      const uitActual = uits.find(u => 
        u.anio === anioActual && 
        u.valor > 0 && 
        (!u.rangoInicial || u.rangoInicial === 0) && 
        (!u.rangoFinal || u.rangoFinal === 0)
      );
      
      if (uitActual) return uitActual;
      
      // Si no hay del año actual, buscar la más reciente sin rangos
      const uitsGenerales = uits.filter(u => 
        u.valor > 0 && 
        (!u.rangoInicial || u.rangoInicial === 0) && 
        (!u.rangoFinal || u.rangoFinal === 0)
      );
      
      const ordenados = uitsGenerales.sort((a, b) => b.anio - a.anio);
      return ordenados[0] || null;
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo UIT vigente:', error);
      return null;
    }
  }

  /**
   * Obtiene el valor UIT por año
   */
  async obtenerPorAnio(anio: number): Promise<UITData | null> {
    try {
      const uits = await this.listarUITs(anio);
      
      if (uits.length > 0) {
        // Buscar primero un UIT sin rango (valor general del año)
        const uitGeneral = uits.find(u => 
          !u.rangoInicial && !u.rangoFinal && u.valor > 0
        );
        if (uitGeneral) return uitGeneral;
        
        // Si no hay general, retornar el primero con valor > 0
        const uitConValor = uits.find(u => u.valor > 0);
        return uitConValor || null;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo UIT por año:', error);
      return null;
    }
  }

  /**
   * Obtiene las alícuotas (UITs con rangos) para un año
   */
  async obtenerAlicuotasPorAnio(anio: number): Promise<UITData[]> {
    try {
      const uits = await this.listarUITs(anio);
      
      // Filtrar solo las que tienen rangos definidos y alícuota > 0
      const alicuotas = uits.filter(u => 
        u.alicuota && u.alicuota > 0 &&
        (u.rangoInicial !== undefined || u.rangoFinal !== undefined)
      );
      
      // Ordenar por rango inicial
      return alicuotas.sort((a, b) => (a.rangoInicial || 0) - (b.rangoInicial || 0));
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo alícuotas:', error);
      // Si falla, devolver alícuotas demo
      return DEMO_ALICUOTAS.map(a => ({
        ...a,
        anio: anio,
        id: anio * 100 + (a.id % 100)
      }));
    }
  }

  /**
   * Obtiene el historial de valores UIT
   */
  async obtenerHistorial(anioInicio?: number, anioFin?: number): Promise<UITData[]> {
    try {
      console.log('🔍 [UITService] Obteniendo historial de UITs');
      
      let uits = await this.listarUITs();
      
      // Filtrar solo UITs generales (sin rangos o con valor > 0)
      uits = uits.filter(u => u.valor > 0);
      
      // Agrupar por año y tomar solo uno por año (el que no tiene rangos)
      const uitsPorAnio = new Map<number, UITData>();
      
      uits.forEach(u => {
        const existing = uitsPorAnio.get(u.anio);
        // Preferir el que no tiene rangos
        if (!existing || ((!u.rangoInicial || u.rangoInicial === 0) && (!u.rangoFinal || u.rangoFinal === 0))) {
          uitsPorAnio.set(u.anio, u);
        }
      });
      
      let resultado = Array.from(uitsPorAnio.values());
      
      // Filtrar por rango de años si se especifica
      if (anioInicio) {
        resultado = resultado.filter(u => u.anio >= anioInicio);
      }
      if (anioFin) {
        resultado = resultado.filter(u => u.anio <= anioFin);
      }
      
      // Ordenar por año descendente
      return resultado.sort((a, b) => b.anio - a.anio);
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de UITs
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const uits = await this.listarUITs();
      const uitsGenerales = uits.filter(u => 
        u.valor > 0 && 
        (!u.rangoInicial || u.rangoInicial === 0) && 
        (!u.rangoFinal || u.rangoFinal === 0)
      );
      
      if (uitsGenerales.length === 0) {
        return {
          totalRegistros: 0,
          anioMinimo: null,
          anioMaximo: null,
          variacionAnual: 0,
          aniosDisponibles: 0
        };
      }
      
      const anios = uitsGenerales.map(u => u.anio).sort((a, b) => a - b);
      const anioActual = new Date().getFullYear();
      const uitActual = uitsGenerales.find(u => u.anio === anioActual);
      const uitAnterior = uitsGenerales.find(u => u.anio === anioActual - 1);
      
      let variacionAnual = 0;
      if (uitActual && uitAnterior && uitAnterior.valor > 0) {
        variacionAnual = ((uitActual.valor - uitAnterior.valor) / uitAnterior.valor) * 100;
      }
      
      return {
        totalRegistros: uits.length,
        totalUitsGenerales: uitsGenerales.length,
        totalAlicuotas: uits.length - uitsGenerales.length,
        anioMinimo: anios[0],
        anioMaximo: anios[anios.length - 1],
        variacionAnual: variacionAnual.toFixed(2),
        aniosDisponibles: anios.length
      };
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Verifica si ya existe un valor UIT para un año
   */
  async verificarAnioExiste(anio: number, excluirId?: number): Promise<boolean> {
    try {
      const uits = await this.listarUITs(anio);
      
      // Verificar solo UITs generales (sin rangos)
      const uitsGenerales = uits.filter(u => 
        (!u.rangoInicial || u.rangoInicial === 0) && 
        (!u.rangoFinal || u.rangoFinal === 0)
      );
      
      if (excluirId) {
        return uitsGenerales.some(u => u.anio === anio && u.id !== excluirId);
      }
      
      return uitsGenerales.length > 0;
    } catch (error: any) {
      console.error('❌ [UITService] Error verificando año:', error);
      return false;
    }
  }

  /**
   * Calcula el monto en UITs dado un valor en soles
   */
  calcularMontoEnUITs(monto: number, valorUIT: number): number {
    if (valorUIT <= 0) return 0;
    return monto / valorUIT;
  }

  /**
   * Calcula el impuesto según la base imponible y las alícuotas
   */
  async calcularImpuesto(baseImponible: number, anio: number): Promise<{
    baseImponible: number;
    baseEnUITs: number;
    impuesto: number;
    alicuotaAplicada: number;
    rangoAplicado: string;
  } | null> {
    try {
      const uitAnio = await this.obtenerPorAnio(anio);
      if (!uitAnio) {
        throw new Error(`No se encontró valor UIT para el año ${anio}`);
      }
      
      const alicuotas = await this.obtenerAlicuotasPorAnio(anio);
      if (alicuotas.length === 0) {
        throw new Error(`No se encontraron alícuotas para el año ${anio}`);
      }
      
      const baseEnUITs = this.calcularMontoEnUITs(baseImponible, uitAnio.valor);
      
      // Encontrar la alícuota aplicable
      const alicuotaAplicable = alicuotas.find(a => {
        const inicio = a.rangoInicial || 0;
        const fin = a.rangoFinal || Infinity;
        return baseEnUITs >= inicio && baseEnUITs <= fin;
      });
      
      if (!alicuotaAplicable) {
        throw new Error('No se encontró una alícuota aplicable para la base imponible');
      }
      
      const impuesto = baseImponible * ((alicuotaAplicable.alicuota || 0) / 100);
      
      return {
        baseImponible,
        baseEnUITs,
        impuesto,
        alicuotaAplicada: alicuotaAplicable.alicuota || 0,
        rangoAplicado: `${alicuotaAplicable.rangoInicial || 0} - ${alicuotaAplicable.rangoFinal || '∞'} UIT`
      };
    } catch (error: any) {
      console.error('❌ [UITService] Error calculando impuesto:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo valor UIT (requiere autenticación)
   */
  async crearUIT(datos: CreateUITDTO): Promise<UITData> {
    try {
      console.log('➕ [UITService] Creando valor UIT:', datos);
      
      // Validar datos
      if (!datos.anio || datos.anio < 1990 || datos.anio > 2100) {
        throw new Error('El año debe estar entre 1990 y 2100');
      }
      
      if (!datos.valor || datos.valor <= 0) {
        throw new Error('El valor UIT debe ser mayor a 0');
      }
      
      // Verificar si ya existe para ese año
      const existe = await this.verificarAnioExiste(datos.anio);
      if (existe) {
        throw new Error(`Ya existe un valor UIT para el año ${datos.anio}`);
      }
      
      // El API requiere form-data para POST
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('valor', datos.valor.toString());
      formData.append('estado', datos.estado || 'ACTIVO');
      formData.append('codUsuario', (datos.codUsuario || 1).toString());
      
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('📡 [UITService] Respuesta de creación:', responseData);
      
      // Manejar diferentes formatos de respuesta
      let createdData: any;
      if (responseData.success && responseData.data) {
        createdData = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
      } else if (responseData.codUit !== undefined) {
        // Si la respuesta es directamente el objeto creado
        createdData = responseData;
      } else {
        throw new Error('Formato de respuesta no esperado');
      }
      
      const normalized = this.normalizeData([createdData])[0];
      NotificationService.success('Valor UIT creado exitosamente');
      
      return normalized;
    } catch (error: any) {
      console.error('❌ [UITService] Error:', error);
      NotificationService.error(error.message || 'Error al crear el valor UIT');
      throw error;
    }
  }

  /**
   * Actualiza un valor UIT (requiere autenticación)
   */
  async actualizarUIT(id: number, datos: UpdateUITDTO): Promise<UITData> {
    try {
      console.log('📝 [UITService] Actualizando UIT:', id, datos);
      
      // Validaciones
      if (datos.anio && (datos.anio < 1990 || datos.anio > 2100)) {
        throw new Error('El año debe estar entre 1990 y 2100');
      }
      
      if (datos.valor !== undefined && datos.valor <= 0) {
        throw new Error('El valor UIT debe ser mayor a 0');
      }
      
      // Verificar si el año ya existe (si se está cambiando)
      if (datos.anio) {
        const existe = await this.verificarAnioExiste(datos.anio, id);
        if (existe) {
          throw new Error(`Ya existe otro valor UIT para el año ${datos.anio}`);
        }
      }
      
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.valor !== undefined) formData.append('valor', datos.valor.toString());
      if (datos.estado) formData.append('estado', datos.estado);
      formData.append('codUsuario', '1');
      formData.append('fechaModificacion', new Date().toISOString());
      
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('📡 [UITService] Respuesta de actualización:', responseData);
      
      // Manejar diferentes formatos de respuesta
      let updatedData: any;
      if (responseData.success && responseData.data) {
        updatedData = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
      } else if (responseData.codUit !== undefined) {
        updatedData = responseData;
      } else {
        throw new Error('Formato de respuesta no esperado');
      }
      
      const normalized = this.normalizeData([updatedData])[0];
      NotificationService.success('Valor UIT actualizado exitosamente');
      
      return normalized;
    } catch (error: any) {
      console.error('❌ [UITService] Error:', error);
      NotificationService.error(error.message || 'Error al actualizar el valor UIT');
      throw error;
    }
  }

  /**
   * Elimina un valor UIT (cambio de estado lógico)
   */
  async eliminarUIT(id: number): Promise<void> {
    try {
      console.log('🗑️ [UITService] Eliminando UIT:', id);
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.actualizarUIT(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [UITService] UIT marcada como inactiva');
    } catch (error: any) {
      console.error('❌ [UITService] Error eliminando UIT:', error);
      throw error;
    }
  }

  /**
   * Calcula un monto en base a UITs
   */
  async calcularMontoUIT(
    cantidadUITs: number, 
    anio?: number
  ): Promise<{ valor: number; uitUsado: UITData }> {
    try {
      let uit: UITData | null;
      
      if (anio) {
        uit = await this.obtenerPorAnio(anio);
      } else {
        uit = await this.obtenerVigente();
      }
      
      if (!uit) {
        throw new Error('No se encontró valor UIT para el cálculo');
      }
      
      const valor = cantidadUITs * uit.valor;
      
      console.log(`💰 [UITService] ${cantidadUITs} UITs = S/. ${valor.toFixed(2)}`);
      
      return { valor, uitUsado: uit };
    } catch (error: any) {
      console.error('❌ [UITService] Error calculando monto:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const uitService = UITService.getInstance();