// src/services/fraccionamientoService.ts
import { API_CONFIG } from '../config/api.unified.config';
import type {
  Fraccionamiento,
  DeudaFraccionamiento,
  CuotaFraccionamiento,
  SolicitudFraccionamientoForm,
  AprobacionFraccionamientoForm,
  FraccionamientoFiltros,
  EstadisticasFraccionamiento
} from '../types/fraccionamiento.types';

/**
 * Servicio para gestión de Fraccionamientos
 * NO requiere autenticación
 */
class FraccionamientoService {
  private static instance: FraccionamientoService;
  private readonly endpoint = '/api/fraccionamiento';

  private constructor() {}

  static getInstance(): FraccionamientoService {
    if (!FraccionamientoService.instance) {
      FraccionamientoService.instance = new FraccionamientoService();
    }
    return FraccionamientoService.instance;
  }

  // Solicitudes
  async crearSolicitud(data: SolicitudFraccionamientoForm): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  async obtenerSolicitudes(filtros?: FraccionamientoFiltros): Promise<Fraccionamiento[]> {
    const params = new URLSearchParams();
    if (filtros?.codigoFraccionamiento) params.append('codigo', filtros.codigoFraccionamiento);
    if (filtros?.estado) params.append('estado', filtros.estado);

    const url = `${API_CONFIG.baseURL}${this.endpoint}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  async obtenerSolicitudPorId(id: number): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  async obtenerSolicitudPorCodigo(codigo: string): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/codigo/${codigo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  // Aprobación
  async aprobarSolicitud(id: number, data: AprobacionFraccionamientoForm): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${id}/aprobar`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  async rechazarSolicitud(id: number, motivo: string): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${id}/rechazar`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ motivoRechazo: motivo })
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  // Deudas
  async obtenerDeudasContribuyente(codigoContribuyente: string): Promise<DeudaFraccionamiento[]> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/deudas/${codigoContribuyente}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  async agregarDeuda(idFraccionamiento: number, deuda: DeudaFraccionamiento): Promise<DeudaFraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${idFraccionamiento}/deudas`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(deuda)
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  async eliminarDeuda(idFraccionamiento: number, idDeuda: number): Promise<void> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${idFraccionamiento}/deudas/${idDeuda}`;
    const response = await fetch(url, { method: 'PUT' });
    if (!response.ok) throw new Error(`Error ${response.status}`);
  }

  // Cronograma
  async generarCronograma(idFraccionamiento: number): Promise<CuotaFraccionamiento[]> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${idFraccionamiento}/cronograma/generar`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  async obtenerCronograma(idFraccionamiento: number): Promise<CuotaFraccionamiento[]> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${idFraccionamiento}/cronograma`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  async registrarPagoCuota(idFraccionamiento: number, idCuota: number, monto: number): Promise<CuotaFraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${idFraccionamiento}/cuotas/${idCuota}/pagar`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ monto })
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  // Búsqueda y filtros
  async buscarPorContribuyente(codigoContribuyente: string): Promise<Fraccionamiento[]> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/contribuyente/${codigoContribuyente}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  async buscarPorEstado(estado: string): Promise<Fraccionamiento[]> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/estado/${estado}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  }

  // Estadísticas
  async obtenerEstadisticas(): Promise<EstadisticasFraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/estadisticas`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  async obtenerEstadisticasPorPeriodo(fechaInicio: string, fechaFin: string): Promise<EstadisticasFraccionamiento> {
    const params = new URLSearchParams({ fechaInicio, fechaFin });
    const url = `${API_CONFIG.baseURL}${this.endpoint}/estadisticas/periodo?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  // Cancelación
  async cancelarFraccionamiento(id: number, motivo: string): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${id}/cancelar`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ motivo })
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  // Actualización
  async actualizarFraccionamiento(id: number, data: Partial<Fraccionamiento>): Promise<Fraccionamiento> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.data || result;
  }

  // Validación
  async validarMontoMinimo(monto: number): Promise<boolean> {
    const params = new URLSearchParams({ monto: monto.toString() });
    const url = `${API_CONFIG.baseURL}${this.endpoint}/validar/monto-minimo?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    const result = await response.json();
    return result.valido || false;
  }

  async validarDeudaContribuyente(codigoContribuyente: string): Promise<{ valido: boolean; mensaje?: string }> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/validar/deuda/${codigoContribuyente}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.json();
  }

  // Reportes
  async generarReporteSolicitudes(filtros?: FraccionamientoFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);

    const url = `${API_CONFIG.baseURL}${this.endpoint}/reportes/solicitudes?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/pdf' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.blob();
  }

  async generarReporteCronograma(idFraccionamiento: number): Promise<Blob> {
    const url = `${API_CONFIG.baseURL}${this.endpoint}/${idFraccionamiento}/reportes/cronograma`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/pdf' }
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.blob();
  }
}

export const fraccionamientoService = FraccionamientoService.getInstance();
export default fraccionamientoService;
