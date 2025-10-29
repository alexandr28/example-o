// src/models/Fraccionamiento.ts

export class Fraccionamiento {
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
  estado: string;
  observaciones?: string;
  aprobadoPor?: string;
  motivoRechazo?: string;

  constructor(data: Partial<Fraccionamiento> = {}) {
    this.id = data.id;
    this.codigoFraccionamiento = data.codigoFraccionamiento;
    this.codigoContribuyente = data.codigoContribuyente || '';
    this.nombreContribuyente = data.nombreContribuyente;
    this.fechaSolicitud = data.fechaSolicitud || new Date();
    this.fechaAprobacion = data.fechaAprobacion;
    this.montoTotal = data.montoTotal || 0;
    this.montoCuotaInicial = data.montoCuotaInicial || 0;
    this.numeroCuotas = data.numeroCuotas || 0;
    this.montoCuota = data.montoCuota || 0;
    this.tasaInteres = data.tasaInteres || 0;
    this.estado = data.estado || 'PENDIENTE';
    this.observaciones = data.observaciones;
    this.aprobadoPor = data.aprobadoPor;
    this.motivoRechazo = data.motivoRechazo;
  }

  calcularMontoCuota(): number {
    if (this.numeroCuotas === 0) return 0;
    const montoFinanciar = this.montoTotal - this.montoCuotaInicial;
    const tasaMensual = this.tasaInteres / 100 / 12;

    if (tasaMensual === 0) {
      return montoFinanciar / this.numeroCuotas;
    }

    // Fórmula de cuota francesa (amortización)
    const cuota = montoFinanciar * (tasaMensual * Math.pow(1 + tasaMensual, this.numeroCuotas)) /
                  (Math.pow(1 + tasaMensual, this.numeroCuotas) - 1);

    return Math.round(cuota * 100) / 100;
  }

  validar(): string[] {
    const errores: string[] = [];

    if (!this.codigoContribuyente) {
      errores.push('El código del contribuyente es requerido');
    }

    if (this.montoTotal <= 0) {
      errores.push('El monto total debe ser mayor a cero');
    }

    if (this.montoCuotaInicial < 0) {
      errores.push('La cuota inicial no puede ser negativa');
    }

    if (this.montoCuotaInicial >= this.montoTotal) {
      errores.push('La cuota inicial debe ser menor al monto total');
    }

    if (this.numeroCuotas <= 0) {
      errores.push('El número de cuotas debe ser mayor a cero');
    }

    if (this.numeroCuotas > 36) {
      errores.push('El número de cuotas no puede exceder 36 meses');
    }

    if (this.tasaInteres < 0) {
      errores.push('La tasa de interés no puede ser negativa');
    }

    return errores;
  }

  static fromJSON(json: any): Fraccionamiento {
    return new Fraccionamiento({
      id: json.id,
      codigoFraccionamiento: json.codigoFraccionamiento || json.codigo_fraccionamiento,
      codigoContribuyente: json.codigoContribuyente || json.codigo_contribuyente,
      nombreContribuyente: json.nombreContribuyente || json.nombre_contribuyente,
      fechaSolicitud: json.fechaSolicitud || json.fecha_solicitud,
      fechaAprobacion: json.fechaAprobacion || json.fecha_aprobacion,
      montoTotal: json.montoTotal || json.monto_total || 0,
      montoCuotaInicial: json.montoCuotaInicial || json.monto_cuota_inicial || 0,
      numeroCuotas: json.numeroCuotas || json.numero_cuotas || 0,
      montoCuota: json.montoCuota || json.monto_cuota || 0,
      tasaInteres: json.tasaInteres || json.tasa_interes || 0,
      estado: json.estado || 'PENDIENTE',
      observaciones: json.observaciones,
      aprobadoPor: json.aprobadoPor || json.aprobado_por,
      motivoRechazo: json.motivoRechazo || json.motivo_rechazo
    });
  }

  toJSON(): any {
    return {
      id: this.id,
      codigo_fraccionamiento: this.codigoFraccionamiento,
      codigo_contribuyente: this.codigoContribuyente,
      nombre_contribuyente: this.nombreContribuyente,
      fecha_solicitud: this.fechaSolicitud,
      fecha_aprobacion: this.fechaAprobacion,
      monto_total: this.montoTotal,
      monto_cuota_inicial: this.montoCuotaInicial,
      numero_cuotas: this.numeroCuotas,
      monto_cuota: this.montoCuota,
      tasa_interes: this.tasaInteres,
      estado: this.estado,
      observaciones: this.observaciones,
      aprobado_por: this.aprobadoPor,
      motivo_rechazo: this.motivoRechazo
    };
  }
}

export default Fraccionamiento;
