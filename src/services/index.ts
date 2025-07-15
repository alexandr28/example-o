// src/services/direccionService.ts
import { API_CONFIG, buildApiUrl } from '../config/api.unified.config';

export interface DireccionData {
  codDireccion: number;
  codBarrioVia?: string | null;
  cuadra?: number;
  lado?: string | null;
  loteInicial?: number;
  loteFinal?: number;
  codUsuario?: number | null;
  codSector?: string | null;
  codVia?: string | null;
  codBarrio?: number;
  parametroBusqueda?: string | null;
  nombreBarrio?: string;
  nombreSector?: string;
  codTipoVia?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
}

interface BusquedaDireccionParams {
  parametrosBusqueda?: string;
  codUsuario?: number;
}

class DireccionService {
  private static instance: DireccionService;
  private endpoint = '/api/direccion';

  public static getInstance(): DireccionService {
    if (!DireccionService.instance) {
      DireccionService.instance = new DireccionService();
    }
    return DireccionService.instance;
  }

  /**
   * Lista direcciones por nombre de vía usando form-data
   * NO requiere autenticación
   */
  async listarDireccionPorNombreVia(parametrosBusqueda: string = ''): Promise<DireccionData[]> {
    try {
      console.log('🔍 [DireccionService] Buscando direcciones:', parametrosBusqueda);
      
      const url = buildApiUrl(`${this.endpoint}/listarDireccionPorNombreVia`);
      
      // Primero intentar con query parameters (más estándar)
      const queryParams = new URLSearchParams();
      queryParams.append('parametrosBusqueda', parametrosBusqueda);
      queryParams.append('codUsuario', '1');
      
      try {
        const response = await fetch(`${url}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Respuesta exitosa:', responseData);
          
          if (responseData.data && Array.isArray(responseData.data)) {
            return this.normalizarDirecciones(responseData.data);
          }
        }
      } catch (error) {
        console.log('⚠️ GET con query params falló, intentando con form-data...');
      }
      
      // Si falla, intentar con FormData (aunque no es estándar para GET)
      const formData = new FormData();
      formData.append('parametrosBusqueda', parametrosBusqueda);
      formData.append('codUsuario', '1');
      
      const response = await fetch(url, {
        method: 'POST', // Algunos servidores aceptan POST para búsquedas
        body: formData
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Respuesta exitosa con POST:', responseData);
        
        if (responseData.data && Array.isArray(responseData.data)) {
          return this.normalizarDirecciones(responseData.data);
        }
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ [DireccionService] Error:', error);
      return [];
    }
  }

  /**
   * Buscar direcciones por diferentes criterios
   */
  async buscarDirecciones(filtros: {
    nombreVia?: string;
    sector?: string;
    barrio?: string;
  }): Promise<DireccionData[]> {
    // Por ahora usar el mismo endpoint con el parámetro de búsqueda
    const parametrosBusqueda = filtros.nombreVia || '';
    const direcciones = await this.listarDireccionPorNombreVia(parametrosBusqueda);
    
    // Filtrar localmente por sector y barrio si es necesario
    let resultado = direcciones;
    
    if (filtros.sector) {
      resultado = resultado.filter(d => 
        d.nombreSector?.toLowerCase().includes(filtros.sector!.toLowerCase())
      );
    }
    
    if (filtros.barrio) {
      resultado = resultado.filter(d => 
        d.nombreBarrio?.toLowerCase().includes(filtros.barrio!.toLowerCase())
      );
    }
    
    return resultado;
  }

  /**
   * Normaliza las direcciones al formato esperado por el componente
   */
  private normalizarDirecciones(data: any[]): DireccionData[] {
    return data.map(item => ({
      codDireccion: item.codDireccion || 0,
      codBarrioVia: item.codBarrioVia,
      cuadra: item.cuadra || 0,
      lado: item.lado || '',
      loteInicial: item.loteInicial || 0,
      loteFinal: item.loteFinal || 0,
      codUsuario: item.codUsuario,
      codSector: item.codSector,
      codVia: item.codVia,
      codBarrio: item.codBarrio,
      parametroBusqueda: item.parametroBusqueda,
      nombreBarrio: item.nombreBarrio || '',
      nombreSector: item.nombreSector || '',
      codTipoVia: item.codTipoVia || '',
      nombreVia: item.nombreVia || '',
      nombreTipoVia: item.nombreTipoVia || 'CALLE'
    }));
  }
}

export const direccionService = DireccionService.getInstance();