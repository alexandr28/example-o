// src/services/cuentaCorrienteService.ts
import BaseApiService from './BaseApiService';
import { buildApiUrl } from '../config/api.unified.config';

/**
 * Interfaces para Estado de Cuenta
 */
export interface EstadoCuentaAnual {
  codContribuyente: number | null;
  anio: number;
  tributo: string | null;
  grupoTributo: string;
  totalCargos: number;
  totalPagado: number;
  saldoNeto: number;
  cargo1: number | null;
  abono1: number | null;
  cargo2: number | null;
  abono2: number | null;
  cargo3: number | null;
  abono3: number | null;
  cargo4: number | null;
  abono4: number | null;
  cargo5: number | null;
  abono5: number | null;
  cargo6: number | null;
  abono6: number | null;
  cargo7: number | null;
  abono7: number | null;
  cargo8: number | null;
  abono8: number | null;
  cargo9: number | null;
  abono9: number | null;
  cargo10: number | null;
  abono10: number | null;
  cargo11: number | null;
  abono11: number | null;
  cargo12: number | null;
  abono12: number | null;
  venc_ene: string | null;
  venc_feb: string | null;
  venc_mar: string | null;
  venc_abr: string | null;
  venc_may: string | null;
  venc_jun: string | null;
  venc_jul: string | null;
  venc_ago: string | null;
  venc_sep: string | null;
  venc_oct: string | null;
  venc_nov: string | null;
  venc_dic: string | null;
}

export interface EstadoCuentaDetalle {
  codContribuyente: number | null;
  anio: number;
  tributo: string;
  grupoTributo: string;
  totalCargos: number;
  totalPagado: number;
  saldoNeto: number;
  cargo1: number;
  abono1: number;
  cargo2: number;
  abono2: number;
  cargo3: number;
  abono3: number;
  cargo4: number;
  abono4: number;
  cargo5: number;
  abono5: number;
  cargo6: number;
  abono6: number;
  cargo7: number;
  abono7: number;
  cargo8: number;
  abono8: number;
  cargo9: number;
  abono9: number;
  cargo10: number;
  abono10: number;
  cargo11: number;
  abono11: number;
  cargo12: number;
  abono12: number;
  venc_ene: string | null;
  venc_feb: string | null;
  venc_mar: string | null;
  venc_abr: string | null;
  venc_may: string | null;
  venc_jun: string | null;
  venc_jul: string | null;
  venc_ago: string | null;
  venc_sep: string | null;
  venc_oct: string | null;
  venc_nov: string | null;
  venc_dic: string | null;
}

/**
 * Servicio para gestión de Cuenta Corriente y Estado de Cuenta
 *
 * IMPORTANTE: Este servicio NO requiere autenticación Bearer Token
 * Todos los métodos funcionan sin token
 */
class CuentaCorrienteService extends BaseApiService<EstadoCuentaAnual, any, any> {
  private static instance: CuentaCorrienteService;

  public static getInstance(): CuentaCorrienteService {
    if (!CuentaCorrienteService.instance) {
      CuentaCorrienteService.instance = new CuentaCorrienteService();
    }
    return CuentaCorrienteService.instance;
  }

  private constructor() {
    super(
      '/api/estadoCuenta',
      {
        normalizeItem: (item: any) => ({
          codContribuyente: item.codContribuyente,
          anio: item.anio || 0,
          tributo: item.tributo || null,
          grupoTributo: item.grupoTributo || '',
          totalCargos: item.totalCargos || 0,
          totalPagado: item.totalPagado || 0,
          saldoNeto: item.saldoNeto || 0,
          cargo1: item.cargo1,
          abono1: item.abono1,
          cargo2: item.cargo2,
          abono2: item.abono2,
          cargo3: item.cargo3,
          abono3: item.abono3,
          cargo4: item.cargo4,
          abono4: item.abono4,
          cargo5: item.cargo5,
          abono5: item.abono5,
          cargo6: item.cargo6,
          abono6: item.abono6,
          cargo7: item.cargo7,
          abono7: item.abono7,
          cargo8: item.cargo8,
          abono8: item.abono8,
          cargo9: item.cargo9,
          abono9: item.abono9,
          cargo10: item.cargo10,
          abono10: item.abono10,
          cargo11: item.cargo11,
          abono11: item.abono11,
          cargo12: item.cargo12,
          abono12: item.abono12,
          venc_ene: item.venc_ene || null,
          venc_feb: item.venc_feb || null,
          venc_mar: item.venc_mar || null,
          venc_abr: item.venc_abr || null,
          venc_may: item.venc_may || null,
          venc_jun: item.venc_jun || null,
          venc_jul: item.venc_jul || null,
          venc_ago: item.venc_ago || null,
          venc_sep: item.venc_sep || null,
          venc_oct: item.venc_oct || null,
          venc_nov: item.venc_nov || null,
          venc_dic: item.venc_dic || null,
        }),

        validateItem: (item: EstadoCuentaAnual) => {
          return !!(item.anio && item.grupoTributo);
        }
      },
      'estadoCuenta'
    );
  }

  /**
   * Lista el estado de cuenta de un contribuyente
   * GET /api/estadoCuenta/listar?codContribuyente=10
   * NO requiere autenticación
   */
  async listarEstadoCuenta(codContribuyente: number | string): Promise<EstadoCuentaAnual[]> {
    try {
      console.log('🔄 [CuentaCorrienteService] Listando estado de cuenta para contribuyente:', codContribuyente);

      const url = buildApiUrl(`${this.endpoint}/listar`);

      // Construir query params
      const queryParams = new URLSearchParams();
      queryParams.append('codContribuyente', String(codContribuyente));

      const getUrl = `${url}?${queryParams.toString()}`;
      console.log('📡 [CuentaCorrienteService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`📥 [CuentaCorrienteService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CuentaCorrienteService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(' [CuentaCorrienteService] Datos obtenidos:', responseData);

      // Procesar respuesta - puede ser un array directo o wrapped
      let items = [];

      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (responseData.data) {
        items = [responseData.data];
      } else {
        items = [responseData];
      }

      console.log(`📋 [CuentaCorrienteService] Procesando ${items.length} registros`);

      // Normalizar datos
      const estadoCuentaNormalizado = this.normalizeData(items);

      console.log(` [CuentaCorrienteService] ${estadoCuentaNormalizado.length} registros procesados`);
      return estadoCuentaNormalizado;

    } catch (error: any) {
      console.error('❌ [CuentaCorrienteService] Error listando estado de cuenta:', error);
      throw error;
    }
  }

  /**
   * Lista el detalle del estado de cuenta de un contribuyente por año
   * GET /api/estadoCuenta/listarDetalle?codContribuyente=10&anio=2024
   * NO requiere autenticación
   */
  async listarDetalleEstadoCuenta(
    codContribuyente: number | string,
    anio: number
  ): Promise<EstadoCuentaDetalle[]> {
    try {
      console.log('🔄 [CuentaCorrienteService] Listando detalle para:', { codContribuyente, anio });

      const url = buildApiUrl(`${this.endpoint}/listarDetalle`);

      // Construir query params
      const queryParams = new URLSearchParams();
      queryParams.append('codContribuyente', String(codContribuyente));
      queryParams.append('anio', String(anio));

      const getUrl = `${url}?${queryParams.toString()}`;
      console.log('📡 [CuentaCorrienteService] GET URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`📥 [CuentaCorrienteService] Respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CuentaCorrienteService] Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(' [CuentaCorrienteService] Detalle obtenido:', responseData);

      // Procesar respuesta - puede ser un array directo o wrapped
      let items = [];

      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (responseData.data) {
        items = [responseData.data];
      } else {
        items = [responseData];
      }

      console.log(`📋 [CuentaCorrienteService] Procesando ${items.length} detalles`);

      // Normalizar datos usando la misma función (la estructura es similar)
      const detallesNormalizados = items.map((item: any) => ({
        codContribuyente: item.codContribuyente,
        anio: item.anio || 0,
        tributo: item.tributo || '',
        grupoTributo: item.grupoTributo || '',
        totalCargos: item.totalCargos || 0,
        totalPagado: item.totalPagado || 0,
        saldoNeto: item.saldoNeto || 0,
        cargo1: item.cargo1 || 0,
        abono1: item.abono1 || 0,
        cargo2: item.cargo2 || 0,
        abono2: item.abono2 || 0,
        cargo3: item.cargo3 || 0,
        abono3: item.abono3 || 0,
        cargo4: item.cargo4 || 0,
        abono4: item.abono4 || 0,
        cargo5: item.cargo5 || 0,
        abono5: item.abono5 || 0,
        cargo6: item.cargo6 || 0,
        abono6: item.abono6 || 0,
        cargo7: item.cargo7 || 0,
        abono7: item.abono7 || 0,
        cargo8: item.cargo8 || 0,
        abono8: item.abono8 || 0,
        cargo9: item.cargo9 || 0,
        abono9: item.abono9 || 0,
        cargo10: item.cargo10 || 0,
        abono10: item.abono10 || 0,
        cargo11: item.cargo11 || 0,
        abono11: item.abono11 || 0,
        cargo12: item.cargo12 || 0,
        abono12: item.abono12 || 0,
        venc_ene: item.venc_ene || null,
        venc_feb: item.venc_feb || null,
        venc_mar: item.venc_mar || null,
        venc_abr: item.venc_abr || null,
        venc_may: item.venc_may || null,
        venc_jun: item.venc_jun || null,
        venc_jul: item.venc_jul || null,
        venc_ago: item.venc_ago || null,
        venc_sep: item.venc_sep || null,
        venc_oct: item.venc_oct || null,
        venc_nov: item.venc_nov || null,
        venc_dic: item.venc_dic || null,
      }));

      console.log(` [CuentaCorrienteService] ${detallesNormalizados.length} detalles procesados`);
      return detallesNormalizados;

    } catch (error: any) {
      console.error('❌ [CuentaCorrienteService] Error listando detalle:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const cuentaCorrienteService = CuentaCorrienteService.getInstance();
