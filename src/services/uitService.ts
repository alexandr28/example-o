// src/services/uitService.ts
import { NotificationService } from '../components/utils/Notification';
import { UIT, Alicuota } from '../models/UIT';

// Tipos para la API
interface UitApiResponse {
  success: boolean;
  message: string;
  data: UitApiData[];
  pagina?: number | null;
  limite?: number | null;
  totalPaginas?: number | null;
  totalRegistros?: number | null;
}

interface UitApiData {
  codUit: number | null;
  anio: number;
  valor: number | null;
  valorUit: number;
  alicuota: number;
  rangoInicial: number;
  rangoFinal: number;
  impuestoParcial: number;
  impuestoAcumulado: number;
  codEpa: number;
}

interface AlicuotaApiData {
  codAlicuota?: number;
  descripcion: string;
  tasa: number;
  uitMinimo?: number;
  uitMaximo?: number;
}

/**
 * Servicio para gestión de UIT/EPA - SIN autenticación Bearer para GET
 */
class UitService {
  private static instance: UitService;
  private readonly API_BASE_URL = 'http://192.168.20.160:8080/api/uitEpa';
  private readonly API_ALICUOTA_URL = 'http://192.168.20.160:8080/api/alicuota';

  private constructor() {
    console.log('🔧 [UitService] Inicializado');
    console.log('📡 [UitService] URL base:', this.API_BASE_URL);
  }

  public static getInstance(): UitService {
    if (!UitService.instance) {
      UitService.instance = new UitService();
    }
    return UitService.instance;
  }

  /**
   * Convierte los datos de la API al formato de la aplicación
   */
  private mapearDatosDesdeApi(apiData: UitApiData): UIT {
    return {
      id: apiData.codEpa, // Usar codEpa como ID ya que codUit viene null
      anio: apiData.anio,
      uit: apiData.valorUit,
      tasa: apiData.alicuota,
      rangoInicial: apiData.rangoInicial,
      rangoFinal: apiData.rangoFinal,
      impuestoParcial: apiData.impuestoParcial,
      impuestoAcumulado: apiData.impuestoAcumulado.toString() // Convertir a string según el modelo
    };
  }

  /**
   * Obtiene todos los UITs (GET sin autenticación)
   */
  async obtenerTodos(): Promise<UIT[]> {
    try {
      console.log('📋 [UitService] Obteniendo todos los UITs...');
      
      const response = await fetch(this.API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📥 [UitService] Respuesta status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UitApiResponse = await response.json();
      console.log('✅ [UitService] Datos recibidos:', data);
      
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(item => this.mapearDatosDesdeApi(item));
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ [UitService] Error al obtener UITs:', error);
      NotificationService.error('Error al cargar UITs');
      throw new Error(error.message || 'Error al obtener UITs');
    }
  }

  /**
   * Obtiene UITs por año (GET con parámetros)
   */
  async obtenerPorAnio(anio: number): Promise<UIT[]> {
    try {
      console.log(`🔍 [UitService] Obteniendo UITs del año ${anio}...`);
      
      const params = new URLSearchParams({
        anio: anio.toString()
      });

      const url = `${this.API_BASE_URL}?${params}`;
      console.log('🔗 [UitService] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UitApiResponse = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const uits = data.data
          .filter(item => item.anio === anio)
          .map(item => this.mapearDatosDesdeApi(item));
        
        console.log(`✅ [UitService] ${uits.length} UITs encontrados para el año ${anio}`);
        return uits;
      }
      
      return [];
    } catch (error: any) {
      console.error(`❌ [UitService] Error al obtener UITs del año ${anio}:`, error);
      throw new Error(error.message || 'Error al obtener UITs por año');
    }
  }

  /**
   * Calcula el impuesto basado en UIT
   */
  async calcularImpuesto(anio: number, monto: number): Promise<number> {
    try {
      console.log(`💰 [UitService] Calculando impuesto para año ${anio}, monto: ${monto}`);
      
      // Obtener los UITs del año
      const uits = await this.obtenerPorAnio(anio);
      
      if (uits.length === 0) {
        throw new Error(`No se encontraron UITs para el año ${anio}`);
      }

      let impuestoTotal = 0;
      let montoRestante = monto;

      // Ordenar UITs por rango inicial
      const uitsSorted = [...uits].sort((a, b) => a.rangoInicial - b.rangoInicial);

      // Calcular impuesto por cada tramo
      for (const uit of uitsSorted) {
        if (montoRestante <= 0) break;

        let montoEnTramo = 0;
        
        if (uit.rangoFinal === 0) {
          // Último tramo sin límite
          montoEnTramo = montoRestante;
        } else {
          // Calcular monto en este tramo
          const inicioTramo = uit.rangoInicial;
          const finTramo = uit.rangoFinal;
          
          if (monto > inicioTramo) {
            const montoMaximoEnTramo = finTramo - inicioTramo;
            montoEnTramo = Math.min(montoRestante, montoMaximoEnTramo);
          }
        }

        // Calcular impuesto para este tramo
        const impuestoTramo = montoEnTramo * uit.tasa;
        impuestoTotal += impuestoTramo;
        montoRestante -= montoEnTramo;

        console.log(`📊 Tramo: ${uit.rangoInicial}-${uit.rangoFinal || '∞'}, Tasa: ${uit.tasa * 100}%, Impuesto: ${impuestoTramo}`);
      }

      console.log(`✅ [UitService] Impuesto total calculado: ${impuestoTotal}`);
      return impuestoTotal;
      
    } catch (error: any) {
      console.error('❌ [UitService] Error al calcular impuesto:', error);
      throw new Error(error.message || 'Error al calcular impuesto');
    }
  }

  /**
   * Obtiene las alícuotas (tasas) disponibles
   */
  async obtenerAlicuotas(): Promise<Alicuota[]> {
    try {
      console.log('📋 [UitService] Obteniendo alícuotas...');
      
      // Por ahora, retornamos alícuotas estáticas basadas en los datos
      // Si hay un endpoint específico para alícuotas, se puede usar aquí
      const alicuotas: Alicuota[] = [
        {
          id: 1,
          descripcion: 'Hasta 15 UIT',
          tasa: 0.2,
          uitMinimo: 0,
          uitMaximo: 15
        },
        {
          id: 2,
          descripcion: 'Más de 15 UIT hasta 60 UIT',
          tasa: 0.6,
          uitMinimo: 15,
          uitMaximo: 60
        },
        {
          id: 3,
          descripcion: 'Más de 60 UIT',
          tasa: 1.0,
          uitMinimo: 60,
          uitMaximo: undefined
        }
      ];

      return alicuotas;
    } catch (error: any) {
      console.error('❌ [UitService] Error al obtener alícuotas:', error);
      throw new Error(error.message || 'Error al obtener alícuotas');
    }
  }

  /**
   * Crea un nuevo UIT (POST con FormData)
   */
  async crear(datos: {
    anio: number;
    valorUit: number;
    alicuota: number;
    rangoInicial: number;
    rangoFinal: number;
  }): Promise<UIT> {
    try {
      console.log('➕ [UitService] Creando nuevo UIT:', datos);
      
      const formData = new FormData();
      formData.append('anio', datos.anio.toString());
      formData.append('valorUit', datos.valorUit.toString());
      formData.append('alicuota', datos.alicuota.toString());
      formData.append('rangoInicial', datos.rangoInicial.toString());
      formData.append('rangoFinal', datos.rangoFinal.toString());

      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        body: formData
      });
      
      console.log('📥 [UitService] Respuesta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ [UitService] UIT creado exitosamente');
        NotificationService.success('UIT creado exitosamente');
        
        const nuevoUit = Array.isArray(data.data) ? data.data[0] : data.data;
        return this.mapearDatosDesdeApi(nuevoUit);
      }
      
      throw new Error(data.message || 'Error al crear UIT');
    } catch (error: any) {
      console.error('❌ [UitService] Error al crear UIT:', error);
      NotificationService.error(error.message || 'Error al crear UIT');
      throw new Error(error.message || 'Error al crear UIT');
    }
  }

  /**
   * Actualiza un UIT (PUT con FormData)
   */
  async actualizar(id: number, datos: Partial<{
    anio: number;
    valorUit: number;
    alicuota: number;
    rangoInicial: number;
    rangoFinal: number;
  }>): Promise<UIT> {
    try {
      console.log(`📝 [UitService] Actualizando UIT ${id}:`, datos);
      
      const formData = new FormData();
      if (datos.anio !== undefined) formData.append('anio', datos.anio.toString());
      if (datos.valorUit !== undefined) formData.append('valorUit', datos.valorUit.toString());
      if (datos.alicuota !== undefined) formData.append('alicuota', datos.alicuota.toString());
      if (datos.rangoInicial !== undefined) formData.append('rangoInicial', datos.rangoInicial.toString());
      if (datos.rangoFinal !== undefined) formData.append('rangoFinal', datos.rangoFinal.toString());

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
        console.log('✅ [UitService] UIT actualizado exitosamente');
        NotificationService.success('UIT actualizado exitosamente');
        
        const uitActualizado = Array.isArray(data.data) ? data.data[0] : data.data;
        return this.mapearDatosDesdeApi(uitActualizado);
      }
      
      throw new Error(data.message || 'Error al actualizar UIT');
    } catch (error: any) {
      console.error(`❌ [UitService] Error al actualizar UIT ${id}:`, error);
      NotificationService.error(error.message || 'Error al actualizar UIT');
      throw new Error(error.message || 'Error al actualizar UIT');
    }
  }

  /**
   * Elimina un UIT
   */
  async eliminar(id: number): Promise<void> {
    try {
      console.log(`🗑️ [UitService] Eliminando UIT ${id}...`);
      
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

      console.log('✅ [UitService] UIT eliminado exitosamente');
      NotificationService.success('UIT eliminado exitosamente');
    } catch (error: any) {
      console.error(`❌ [UitService] Error al eliminar UIT ${id}:`, error);
      NotificationService.error(error.message || 'Error al eliminar UIT');
      throw new Error(error.message || 'Error al eliminar UIT');
    }
  }

  /**
   * Obtiene los años disponibles con UITs
   */
  async obtenerAniosDisponibles(): Promise<number[]> {
    try {
      const uits = await this.obtenerTodos();
      const aniosUnicos = [...new Set(uits.map(uit => uit.anio))].sort((a, b) => b - a);
      console.log(`✅ [UitService] Años disponibles: ${aniosUnicos.join(', ')}`);
      return aniosUnicos;
    } catch (error: any) {
      console.error('❌ [UitService] Error al obtener años disponibles:', error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const uitService = UitService.getInstance();