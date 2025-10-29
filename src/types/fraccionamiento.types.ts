// src/types/fraccionamiento.types.ts

export interface Fraccionamiento {
  id?: number;
  codigoFraccionamiento?: string;
  codigoContribuyente: string;
  nombreContribuyente?: string;
  fechaSolicitud: Date | string;
  fechaAprobacion?: Date | string;
  montoTotal: number;
  montoCuotaInicial: number;
  numeroCuotas: number;
  montoCuota: number;
  tasaInteres: number;
  estado: EstadoFraccionamiento;
  observaciones?: string;
  aprobadoPor?: string;
  motivoRechazo?: string;
  deudas?: DeudaFraccionamiento[];
  cronograma?: CuotaFraccionamiento[];
}

export interface DeudaFraccionamiento {
  id?: number;
  idFraccionamiento?: number;
  codigoDeuda: string;
  concepto: string;
  periodo: string;
  montoOriginal: number;
  montoInteres: number;
  montoTotal: number;
  seleccionada?: boolean;
}

export interface CuotaFraccionamiento {
  id?: number;
  idFraccionamiento?: number;
  numeroCuota: number;
  fechaVencimiento: Date | string;
  montoCapital: number;
  montoInteres: number;
  montoTotal: number;
  estado: EstadoCuota;
  fechaPago?: Date | string;
  montoPagado?: number;
  observaciones?: string;
}

export type EstadoFraccionamiento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'VIGENTE' | 'CANCELADO' | 'VENCIDO';

export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'PARCIAL';

export interface SolicitudFraccionamientoForm {
  codigoContribuyente: string;
  nombreContribuyente: string;
  deudas: DeudaFraccionamiento[];
  montoTotal: number;
  montoCuotaInicial: number;
  numeroCuotas: number;
  tasaInteres: number;
  observaciones?: string;
}

export interface AprobacionFraccionamientoForm {
  id: number;
  aprobado: boolean;
  observaciones?: string;
  motivoRechazo?: string;
  tasaInteres?: number;
  numeroCuotas?: number;
}

export interface FraccionamientoFiltros {
  codigoFraccionamiento?: string;
  codigoContribuyente?: string;
  nombreContribuyente?: string;
  estado?: EstadoFraccionamiento;
  fechaDesde?: Date | string;
  fechaHasta?: Date | string;
}

export interface EstadisticasFraccionamiento {
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesAprobadas: number;
  solicitudesRechazadas: number;
  fraccionamientosVigentes: number;
  fraccionamientosCancelados: number;
  montoTotalFraccionado: number;
  montoRecaudado: number;
  montoPendiente: number;
}
