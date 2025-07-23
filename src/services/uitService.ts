// src/services/uitService.ts
import BaseApiService from './BaseApiService';
import { API_CONFIG } from '../config/api.unified.config';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para los datos de UIT
 */
export interface UITData {
  codUit?: number | null;
  id: number;
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

export interface UITResponse {
  success: boolean;
  message: string;
  data: UITData | UITData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

/**
 * Servicio para gestión de valores UIT
 * Usa form-data en métodos GET
 */
class UITService extends BaseApiService<UITData, CreateUITDTO, UpdateUITDTO> {
  private static instance: UITService;
  
  private constructor() {
    super(
      '/api/uitEpa',
      {
        normalizeItem: (item: any) => ({
          id: item.codUit || item.id || 0,
          codUit: item.codUit || null,
          anio: item.anio || new Date().getFullYear(),
          valor: parseFloat(item.valor || '0'),
          valQuinit: parseFloat(item.valQuinit || '0'),
          alicuota: parseFloat(item.alicuota || '0'),
          rangoInicial: parseFloat(item.rangoInicial || '0'),
          rangoFinal: parseFloat(item.rangoFinal || '0'),
          impuestoParcial: parseFloat(item.impuestoParcial || '0'),
          impuestoAcumulado: parseFloat(item.impuestoAcumulado || '0'),
          codEpa: item.codEpa || 0,
          estado: item.estado || 'ACTIVO',
          fechaVigenciaDesde: item.fechaVigenciaDesde,
          fechaVigenciaHasta: item.fechaVigenciaHasta,
          fechaCreacion: item.fechaCreacion,
          fechaModificacion: item.fechaModificacion,
          usuarioCreacion: item.usuarioCreacion,
          usuarioModificacion: item.usuarioModificacion
        }),
        
        validateItem: (item: UITData) => {
          return !!(
            item.id && 
            item.anio > 1990 && 
            item.anio <= 2100 && 
            item.valor > 0
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
   * Usa form-data como query parameters
   */
  async listarUITs(anio?: number): Promise<UITData[]> {
    try {
      console.log('🔍 [UITService] Listando UITs para año:', anio || 'todos');
      
      // Construir URL con query parameters
      let url = `${API_CONFIG.baseURL}${this.endpoint}`;
      
      if (anio) {
        const params = new URLSearchParams({
          anio: anio.toString()
        });
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
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: UITResponse = await response.json();
      console.log('✅ [UITService] Datos recibidos:', responseData);
      
      if (responseData.success && responseData.data) {
        const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        return this.normalizeData(data);
      }
      
      return [];
      
    } catch (error: any) {
      console.error('❌ [UITService] Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene el valor UIT vigente
   */
  async obtenerVigente(): Promise<UITData | null> {
    try {
      const anioActual = new Date().getFullYear();
      const uits = await this.listarUITs(anioActual);
      
      if (uits.length > 0) {
        // Retornar el primer UIT del año actual
        return uits[0];
      }
      
      // Si no hay UIT para el año actual, buscar el más reciente
      const todouits = await this.listarUITs();
      if (todouits.length > 0) {
        // Ordenar por año descendente
        const ordenados = todouits.sort((a, b) => b.anio - a.anio);
        return ordenados[0];
      }
      
      return null;
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
      return uits.length > 0 ? uits[0] : null;
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo UIT por año:', error);
      return null;
    }
  }

  /**
   * Obtiene el historial de valores UIT
   */
  async obtenerHistorial(anioInicio?: number, anioFin?: number): Promise<UITData[]> {
    try {
      console.log('🔍 [UITService] Obteniendo historial de UITs');
      
      let uits = await this.listarUITs();
      
      // Filtrar por rango de años si se especifica
      if (anioInicio) {
        uits = uits.filter(u => u.anio >= anioInicio);
      }
      if (anioFin) {
        uits = uits.filter(u => u.anio <= anioFin);
      }
      
      // Ordenar por año descendente
      return uits.sort((a, b) => b.anio - a.anio);
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Verifica si ya existe un valor UIT para un año
   */
  async verificarAnioExiste(anio: number, excluirId?: number): Promise<boolean> {
    try {
      const uits = await this.listarUITs(anio);
      
      if (excluirId) {
        return uits.some(u => u.anio === anio && u.id !== excluirId);
      }
      
      return uits.length > 0;
      
    } catch (error: any) {
      console.error('❌ [UITService] Error verificando año:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo valor UIT
   * REQUIERE autenticación (método POST)
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
      
      // Crear usando el método base con JSON
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('valor', datos.valor.toString());
      formData.append('estado', datos.estado || 'ACTIVO');
      formData.append('codUsuario', (datos.codUsuario || 1).toString());
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: UITResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Valor UIT creado exitosamente');
        const data = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
        return this.normalizeData([data])[0];
      }
      
      throw new Error('Error al crear el valor UIT');
      
    } catch (error: any) {
      console.error('❌ [UITService] Error:', error);
      NotificationService.error(error.message || 'Error al crear el valor UIT');
      throw error;
    }
  }

  /**
   * Actualiza un valor UIT
   * REQUIERE autenticación (método PUT)
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
      
      const response = await fetch(`${API_CONFIG.baseURL}${this.endpoint}/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const responseData: UITResponse = await response.json();
      
      if (responseData.success && responseData.data) {
        NotificationService.success('Valor UIT actualizado exitosamente');
        const data = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
        return this.normalizeData([data])[0];
      }
      
      throw new Error('Error al actualizar el valor UIT');
      
    } catch (error: any) {
      console.error('❌ [UITService] Error:', error);
      NotificationService.error(error.message || 'Error al actualizar el valor UIT');
      throw error;
    }
  }

  /**
   * Elimina un valor UIT (cambio de estado lógico)
   * REQUIERE autenticación (método PUT)
   */
  async eliminarUIT(id: number): Promise<void> {
    try {
      console.log('🗑️ [UITService] Eliminando UIT:', id);
      
      // En lugar de eliminar físicamente, cambiar estado a INACTIVO
      await this.actualizarUIT(id, {
        estado: 'INACTIVO',
        fechaModificacion: new Date().toISOString()
      });
      
      console.log('✅ [UITService] UIT marcado como inactivo');
      
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

  /**
   * Obtiene estadísticas de valores UIT
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    uitActual: UITData | null;
    promedioUltimos5Anios: number;
    incrementoAnual: number;
  }> {
    try {
      const uits = await this.listarUITs();
      const uitActual = await this.obtenerVigente();
      const anioActual = new Date().getFullYear();
      
      // UITs de los últimos 5 años
      const ultimos5Anios = uits
        .filter(u => u.anio >= anioActual - 5 && u.anio < anioActual)
        .sort((a, b) => b.anio - a.anio);
      
      // Calcular promedio
      const promedioUltimos5Anios = ultimos5Anios.length > 0
        ? ultimos5Anios.reduce((sum, u) => sum + u.valor, 0) / ultimos5Anios.length
        : 0;
      
      // Calcular incremento anual
      let incrementoAnual = 0;
      if (uitActual && ultimos5Anios.length > 0) {
        const uitAnterior = ultimos5Anios[0];
        incrementoAnual = ((uitActual.valor - uitAnterior.valor) / uitAnterior.valor) * 100;
      }
      
      return {
        total: uits.length,
        activos: uits.filter(u => u.estado === 'ACTIVO').length,
        inactivos: uits.filter(u => u.estado === 'INACTIVO').length,
        uitActual,
        promedioUltimos5Anios,
        incrementoAnual
      };
      
    } catch (error: any) {
      console.error('❌ [UITService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const uitService = UITService.getInstance();

// También exportar la clase para tests
export { UITService };