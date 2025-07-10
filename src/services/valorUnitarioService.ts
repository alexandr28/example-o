// src/services/valorUnitarioService.ts
import { NotificationService } from '../components/utils/Notification';
import { 
  ValorUnitario, 
  CategoriaValorUnitario, 
  SubcategoriaValorUnitario, 
  LetraValorUnitario 
} from '../models';

// Tipos para la API
interface ValorUnitarioApiResponse {
  success: boolean;
  message: string;
  data: ValorUnitarioApiData[];
}

interface ValorUnitarioApiData {
  codValorUnitario: number;
  codValorUnitarioAnterior?: number;
  anio: number;
  codLeTra?: string;
  letra?: string;
  codCategoria: string;
  codSubcategoria: string;
  costo: number;
}

interface ValorUnitarioFormData {
  anio: number;
  categoria: CategoriaValorUnitario;
  subcategoria: SubcategoriaValorUnitario;
  letra: LetraValorUnitario;
  costo: number;
}

/**
 * Servicio para gestión de valores unitarios - SIN autenticación Bearer
 */
class ValorUnitarioService {
  private static instance: ValorUnitarioService;
  private readonly API_BASE_URL = 'http://192.168.20.160:8080/api/valoresunitarios';

  private constructor() {
    console.log('🔧 [ValorUnitarioService] Inicializado');
    console.log('📡 [ValorUnitarioService] URL base:', this.API_BASE_URL);
  }

  public static getInstance(): ValorUnitarioService {
    if (!ValorUnitarioService.instance) {
      ValorUnitarioService.instance = new ValorUnitarioService();
    }
    return ValorUnitarioService.instance;
  }

  /**
   * Mapea los códigos de categoría de la API a los valores del enum
   */
  private mapearCategoria(codCategoria: string): CategoriaValorUnitario {
    const mapeo: Record<string, CategoriaValorUnitario> = {
      'ESTRUCTURAS': CategoriaValorUnitario.ESTRUCTURAS,
      'ACABADOS': CategoriaValorUnitario.ACABADOS,
      'INSTALACIONES': CategoriaValorUnitario.INSTALACIONES
    };
    return mapeo[codCategoria] || CategoriaValorUnitario.ESTRUCTURAS;
  }

  /**
   * Mapea los códigos de subcategoría de la API a los valores del enum
   */
  private mapearSubcategoria(codSubcategoria: string): SubcategoriaValorUnitario {
    const mapeo: Record<string, SubcategoriaValorUnitario> = {
      'MUROS_Y_COLUMNAS': SubcategoriaValorUnitario.MUROS_Y_COLUMNAS,
      'TECHOS': SubcategoriaValorUnitario.TECHOS,
      'PISOS': SubcategoriaValorUnitario.PISOS,
      'PUERTAS_Y_VENTANAS': SubcategoriaValorUnitario.PUERTAS_Y_VENTANAS,
      'REVESTIMIENTOS': SubcategoriaValorUnitario.REVESTIMIENTOS,
      'BANOS': SubcategoriaValorUnitario.BANOS,
      'INSTALACIONES_ELECTRICAS_Y_SANITARIAS': SubcategoriaValorUnitario.INSTALACIONES_ELECTRICAS_Y_SANITARIAS
    };
    return mapeo[codSubcategoria] || SubcategoriaValorUnitario.MUROS_Y_COLUMNAS;
  }

  /**
   * Convierte los datos de la API al formato de la aplicación
   */
  private mapearDatosDesdeApi(apiData: ValorUnitarioApiData): ValorUnitario {
    return {
      id: apiData.codValorUnitario,
      año: apiData.anio,
      categoria: this.mapearCategoria(apiData.codCategoria),
      subcategoria: this.mapearSubcategoria(apiData.codSubcategoria),
      letra: (apiData.letra || 'A') as LetraValorUnitario,
      costo: apiData.costo
    };
  }

  /**
   * Obtiene todos los valores unitarios (GET con parámetros form-data style)
   */
  async obtenerTodos(): Promise<ValorUnitario[]> {
    try {
      console.log('📋 [ValorUnitarioService] Obteniendo todos los valores unitarios...');
      
      const response = await fetch(this.API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📥 [ValorUnitarioService] Respuesta status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ValorUnitarioApiResponse = await response.json();
      console.log('✅ [ValorUnitarioService] Datos recibidos:', data);
      
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(item => this.mapearDatosDesdeApi(item));
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error al obtener valores unitarios:', error);
      NotificationService.error('Error al cargar valores unitarios');
      throw new Error(error.message || 'Error al obtener valores unitarios');
    }
  }

  /**
   * Obtiene valores unitarios por año (GET con parámetros)
   */
  async obtenerPorAnio(anio: number): Promise<ValorUnitario[]> {
    try {
      console.log(`🔍 [ValorUnitarioService] Obteniendo valores unitarios del año ${anio}...`);
      
      const params = new URLSearchParams({
        anio: anio.toString()
      });

      const url = `${this.API_BASE_URL}?${params}`;
      console.log('🔗 [ValorUnitarioService] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ValorUnitarioApiResponse = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const valores = data.data
          .filter(item => item.anio === anio)
          .map(item => this.mapearDatosDesdeApi(item));
        
        console.log(`✅ [ValorUnitarioService] ${valores.length} valores encontrados para el año ${anio}`);
        return valores;
      }
      
      return [];
    } catch (error: any) {
      console.error(`❌ [ValorUnitarioService] Error al obtener valores del año ${anio}:`, error);
      throw new Error(error.message || 'Error al obtener valores unitarios por año');
    }
  }

  /**
   * Crea un nuevo valor unitario (POST con FormData)
   */
  async crear(datos: ValorUnitarioFormData): Promise<ValorUnitario> {
    try {
      console.log('➕ [ValorUnitarioService] Creando nuevo valor unitario:', datos);
      
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('categoria', datos.categoria);
      formData.append('subcategoria', datos.subcategoria);
      formData.append('letra', datos.letra);
      formData.append('costo', datos.costo.toString());

      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      console.log('📥 [ValorUnitarioService] Respuesta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ [ValorUnitarioService] Valor unitario creado exitosamente');
        NotificationService.success('Valor unitario creado exitosamente');
        
        // Si data.data es un array, tomar el primer elemento
        const nuevoValor = Array.isArray(data.data) ? data.data[0] : data.data;
        return this.mapearDatosDesdeApi(nuevoValor);
      }
      
      throw new Error(data.message || 'Error al crear valor unitario');
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error al crear valor unitario:', error);
      NotificationService.error(error.message || 'Error al crear valor unitario');
      throw new Error(error.message || 'Error al crear valor unitario');
    }
  }

  /**
   * Actualiza un valor unitario (PUT con FormData)
   */
  async actualizar(id: number, datos: Partial<ValorUnitarioFormData>): Promise<ValorUnitario> {
    try {
      console.log(`📝 [ValorUnitarioService] Actualizando valor unitario ${id}:`, datos);
      
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.categoria) formData.append('categoria', datos.categoria);
      if (datos.subcategoria) formData.append('subcategoria', datos.subcategoria);
      if (datos.letra) formData.append('letra', datos.letra);
      if (datos.costo !== undefined) formData.append('costo', datos.costo.toString());

      const url = `${this.API_BASE_URL}/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ [ValorUnitarioService] Valor unitario actualizado exitosamente');
        NotificationService.success('Valor unitario actualizado exitosamente');
        
        const valorActualizado = Array.isArray(data.data) ? data.data[0] : data.data;
        return this.mapearDatosDesdeApi(valorActualizado);
      }
      
      throw new Error(data.message || 'Error al actualizar valor unitario');
    } catch (error: any) {
      console.error(`❌ [ValorUnitarioService] Error al actualizar valor unitario ${id}:`, error);
      NotificationService.error(error.message || 'Error al actualizar valor unitario');
      throw new Error(error.message || 'Error al actualizar valor unitario');
    }
  }

  /**
   * Elimina un valor unitario
   */
  async eliminar(id: number): Promise<void> {
    try {
      console.log(`🗑️ [ValorUnitarioService] Eliminando valor unitario ${id}...`);
      
      const url = `${this.API_BASE_URL}/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ [ValorUnitarioService] Valor unitario eliminado exitosamente');
      NotificationService.success('Valor unitario eliminado exitosamente');
    } catch (error: any) {
      console.error(`❌ [ValorUnitarioService] Error al eliminar valor unitario ${id}:`, error);
      NotificationService.error(error.message || 'Error al eliminar valor unitario');
      throw new Error(error.message || 'Error al eliminar valor unitario');
    }
  }

  /**
   * Elimina todos los valores unitarios de un año específico
   */
  async eliminarPorAnio(anio: number): Promise<void> {
    try {
      console.log(`🗑️ [ValorUnitarioService] Eliminando valores unitarios del año ${anio}...`);
      
      // Primero obtener todos los valores del año
      const valoresDelAnio = await this.obtenerPorAnio(anio);
      
      // Eliminar cada uno
      for (const valor of valoresDelAnio) {
        await this.eliminar(valor.id);
      }
      
      console.log(`✅ [ValorUnitarioService] ${valoresDelAnio.length} valores eliminados del año ${anio}`);
    } catch (error: any) {
      console.error(`❌ [ValorUnitarioService] Error al eliminar valores del año ${anio}:`, error);
      throw new Error(error.message || 'Error al eliminar valores unitarios por año');
    }
  }

  /**
   * Obtiene valores agrupados por categoría para un año específico
   */
  async obtenerValoresPorCategoria(anio: number): Promise<Record<string, Record<string, number>>> {
    try {
      const valores = await this.obtenerPorAnio(anio);
      const resultado: Record<string, Record<string, number>> = {};
      
      // Inicializar estructura
      const todasSubcategorias = Object.values(SubcategoriaValorUnitario);
      const todasLetras = Object.values(LetraValorUnitario);
      
      todasSubcategorias.forEach(subcategoria => {
        resultado[subcategoria] = {};
        todasLetras.forEach(letra => {
          resultado[subcategoria][letra] = 0;
        });
      });
      
      // Poblar con datos reales
      valores.forEach(valor => {
        if (resultado[valor.subcategoria]) {
          resultado[valor.subcategoria][valor.letra] = valor.costo;
        }
      });
      
      return resultado;
    } catch (error: any) {
      console.error('❌ [ValorUnitarioService] Error al obtener valores por categoría:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const valorUnitarioService = ValorUnitarioService.getInstance();