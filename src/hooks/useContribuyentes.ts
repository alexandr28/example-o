// src/hooks/useContribuyentes.ts - VERSIÓN ACTUALIZADA CON API POST
import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationService } from '../components/utils/Notification';
import { 
  contribuyenteService, 
  CreateContribuyenteAPIDTO,
  ContribuyenteData,
  ContribuyenteDetalle
} from '../services/contribuyenteService';

/**
 * Interface para el item de lista de contribuyente
 */
export interface ContribuyenteListItem {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica';
}

/**
 * Interface para filtros de búsqueda
 */
export interface FiltroContribuyente {
  tipoContribuyente?: string;
  busqueda?: string;
  tipoDocumento?: string;
}

/**
 * Hook para gestionar contribuyentes
 * NO requiere autenticación para ninguna operación
 */
export const useContribuyentes = () => {
  const [contribuyentes, setContribuyentes] = useState<ContribuyenteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para controlar si ya se está cargando
  const isLoadingRef = useRef(false);
  
  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (data: any): ContribuyenteListItem => {
    // Determinar el nombre completo
    let nombreCompleto = '';

    // Prioridad: nombreCompleto > nombres (si contiene el nombre completo) > construir desde partes
    if (data.nombreCompleto) {
      nombreCompleto = data.nombreCompleto;
    } else if (data.nombres && data.nombres.includes(' ')) {
      // En API general, 'nombres' contiene el nombre completo: "Mantilla Miñano Jhonatan"
      nombreCompleto = data.nombres;
    } else if (data.razonSocial) {
      nombreCompleto = data.razonSocial;
    } else {
      // Construir nombre desde apellidos y nombres
      const partes = [
        data.apellidoPaterno || data.apellidopaterno,
        data.apellidoMaterno || data.apellidomaterno,
        data.nombres
      ].filter(Boolean);
      nombreCompleto = partes.join(' ').trim() || 'Sin nombre';
    }

    return {
      codigo: data.codigo || data.codContribuyente || data.codPersona || 0,
      contribuyente: nombreCompleto,
      documento: data.numeroDocumento || data.numerodocumento || 'Sin documento',
      direccion: data.direccion === 'null' ? 'Sin dirección' : (data.direccion || 'Sin dirección'),
      telefono: data.telefono || '',
      tipoPersona: (data.tipoPersona === '0301' || data.codTipopersona === '0301' || data.tipoContribuyente === 'NATURAL') ? 'natural' : 'juridica'
    };
  };
  
  /**
   * Carga todos los contribuyentes
   * VERSIÓN CORREGIDA sin dependencia de loading
   */
  const cargarContribuyentes = useCallback(async () => {
    // Usar ref para evitar cargas múltiples
    if (isLoadingRef.current) {
      console.log('⏭️ [useContribuyentes] Carga ya en proceso, omitiendo...');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useContribuyentes] Cargando todos los contribuyentes con API general...');
      
      // Usar el nuevo método que usa la API general
      const datos = await contribuyenteService.obtenerTodosContribuyentes();
      
      // Convertir al formato de lista y eliminar duplicados
      const listaFormateada = datos.map(convertirAListItem);
      
      // Eliminar duplicados basándose en el código
      const sinDuplicados = listaFormateada.filter((item, index, self) => 
        index === self.findIndex((t) => t.codigo === item.codigo)
      );
      
      setContribuyentes(sinDuplicados);
      console.log(`✅ [useContribuyentes] ${sinDuplicados.length} contribuyentes cargados (de ${listaFormateada.length} totales)`);
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error:', error);
      setError(error.message || 'Error al cargar contribuyentes');
      // No mostrar notificación en la carga inicial
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Sin dependencias
  
  /**
   * Busca contribuyentes con filtros
   */
  const buscarContribuyentes = useCallback(async (filtro?: FiltroContribuyente) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Buscando con filtros:', filtro);
      
      let resultados: any[] = [];
      
      // Construir parámetros de búsqueda para la nueva API general
      const params: any = {
        parametroBusqueda: filtro?.busqueda || 'a',
        codUsuario: 1
      };

      // Usar la nueva API general con parámetro de búsqueda
      resultados = await contribuyenteService.buscarContribuyentes(params);
      
      // Convertir y establecer resultados
      const listaFormateada = resultados.map(convertirAListItem);
      setContribuyentes(listaFormateada);
      
      console.log(`✅ [useContribuyentes] ${listaFormateada.length} resultados encontrados`);
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error en búsqueda:', error);
      setError(error.message || 'Error al buscar contribuyentes');
      NotificationService.error('Error al buscar contribuyentes');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Guarda un nuevo contribuyente o actualiza uno existente
   */
  const guardarContribuyente = useCallback(async (data: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useContribuyentes] Guardando contribuyente:', data);
      
      if (data.codigo || data.codContribuyente) {
        // Actualizar existente
        await contribuyenteService.actualizarContribuyente(
          data.codigo || data.codContribuyente,
          data
        );
        NotificationService.success('Contribuyente actualizado correctamente');
      } else {
        // Crear nuevo
        await contribuyenteService.crearContribuyente(data);
        NotificationService.success('Contribuyente creado correctamente');
      }
      
      // Recargar lista
      await cargarContribuyentes();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al guardar:', error);
      setError(error.message || 'Error al guardar contribuyente');
      NotificationService.error(error.message || 'Error al guardar contribuyente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);
  
  /**
   * Obtener un contribuyente por código
   */
  const obtenerContribuyente = useCallback(async (codigo: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Obteniendo contribuyente:', codigo);
      
      const contribuyente = await contribuyenteService.obtenerPorCodigoPersona(codigo);
      
      if (!contribuyente) {
        throw new Error('Contribuyente no encontrado');
      }
      
      return contribuyente;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error:', error);
      setError(error.message || 'Error al obtener contribuyente');
      NotificationService.error('Error al obtener datos del contribuyente');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Eliminar un contribuyente
   */
  const eliminarContribuyente = useCallback(async (codigo: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ [useContribuyentes] Eliminando contribuyente:', codigo);
      
      await contribuyenteService.eliminarContribuyente(codigo);
      
      NotificationService.success('Contribuyente eliminado correctamente');
      
      // Recargar lista
      await cargarContribuyentes();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al eliminar:', error);
      setError(error.message || 'Error al eliminar contribuyente');
      NotificationService.error('Error al eliminar contribuyente');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);

  /**
   * Crear contribuyente usando API directa (NUEVO)
   * NO requiere autenticación
   */
  const crearContribuyenteAPI = useCallback(async (datos: CreateContribuyenteAPIDTO): Promise<ContribuyenteData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useContribuyentes] Creando contribuyente con API directa:', datos);
      
      // Validar datos requeridos
      if (!datos.codPersona || !datos.codestado) {
        throw new Error('Código de persona y estado son requeridos');
      }
      
      const nuevoContribuyente = await contribuyenteService.crearContribuyenteAPI(datos);
      
      console.log('✅ [useContribuyentes] Contribuyente creado exitosamente:', nuevoContribuyente);
      
      NotificationService.success('Contribuyente creado correctamente');
      
      // Recargar lista para mostrar el nuevo contribuyente
      await cargarContribuyentes();
      
      return nuevoContribuyente;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al crear contribuyente:', error);
      setError(error.message || 'Error al crear contribuyente');
      NotificationService.error(error.message || 'Error al crear contribuyente');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);

  /**
   * Crear contribuyente desde persona creada (NUEVO)
   */
  const crearContribuyenteDesdePersona = useCallback(async (
    personaCreada: any, 
    datosFormulario: any
  ): Promise<ContribuyenteData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useContribuyentes] Creando contribuyente desde persona:', personaCreada);
      
      if (!personaCreada || !personaCreada.codPersona) {
        throw new Error('Persona válida es requerida para crear contribuyente');
      }
      
      // Convertir datos del formulario al formato API
      const datosAPI = contribuyenteService.convertirFormularioAContribuyenteDTO(personaCreada, datosFormulario);
      
      console.log('📋 [useContribuyentes] Datos convertidos para API:', datosAPI);
      
      return await crearContribuyenteAPI(datosAPI);
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al crear contribuyente desde persona:', error);
      setError(error.message || 'Error al crear contribuyente');
      NotificationService.error(error.message || 'Error al crear contribuyente');
      return null;
    } finally {
      setLoading(false);
    }
  }, [crearContribuyenteAPI]);

  /**
   * Verificar si ya existe un contribuyente para una persona (NUEVO)
   */
  const verificarContribuyenteExistente = useCallback(async (codPersona: number): Promise<boolean> => {
    try {
      const contribuyente = await contribuyenteService.obtenerPorCodigoPersona(codPersona);
      return !!contribuyente;
    } catch (error) {
      console.error('Error verificando contribuyente existente:', error);
      return false;
    }
  }, []);

  /**
   * Obtener detalle completo de un contribuyente usando query params
   * GET /api/contribuyente?codTipoContribuyente=43905&codPersona=0
   */
  const obtenerContribuyenteDetalle = useCallback(async (
    codTipoContribuyente: number | string, 
    codPersona: number | string = 0
  ): Promise<ContribuyenteDetalle | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Obteniendo detalle completo del contribuyente:', { codTipoContribuyente, codPersona });
      
      const detalle = await contribuyenteService.obtenerContribuyenteDetalle(codTipoContribuyente, codPersona);
      
      if (!detalle) {
        console.log('⚠️ [useContribuyentes] No se encontró el contribuyente');
        return null;
      }
      
      console.log('✅ [useContribuyentes] Detalle obtenido exitosamente:', detalle);
      return detalle;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error obteniendo detalle:', error);
      setError(error.message || 'Error al obtener detalle del contribuyente');
      NotificationService.error('Error al obtener datos del contribuyente');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar contribuyentes usando la nueva API con query params
   */
  const buscarContribuyentesConQueryParams = useCallback(async (
    codTipoContribuyente?: number | string,
    codPersona: number | string = 0
  ): Promise<ContribuyenteListItem[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Buscando con query params:', { codTipoContribuyente, codPersona });
      
      if (!codTipoContribuyente) {
        // Si no hay código específico, usar la búsqueda general
        await buscarContribuyentes();
        return contribuyentes;
      }
      
      // Obtener detalle específico del contribuyente
      let detalle = await contribuyenteService.obtenerContribuyenteDetalle(codTipoContribuyente, codPersona);
      
      console.log('📋 [useContribuyentes] Detalle recibido del servicio:', detalle);
      console.log('📋 [useContribuyentes] Tipo de detalle:', typeof detalle);
      console.log('📋 [useContribuyentes] Es array:', Array.isArray(detalle));
      
      // Si el detalle es un array, tomar el primer elemento
      if (Array.isArray(detalle) && detalle.length > 0) {
        console.log('🔄 [useContribuyentes] Convirtiendo array a objeto, tomando primer elemento');
        detalle = detalle[0];
        console.log('📋 [useContribuyentes] Detalle convertido:', detalle);
      }
      
      if (!detalle) {
        console.log('⚠️ [useContribuyentes] No se encontró detalle del contribuyente');
        setContribuyentes([]);
        return [];
      }
      
      // Validar que el detalle tenga los campos necesarios
      // Verificar diferentes posibles nombres de campos
      const codTipoContribuyenteDetalle = detalle.codContribuyente || detalle.codTipoContribuyente;
      const codPersonaDetalle = detalle.codPersona || detalle.codPersona;
      
      if (!codTipoContribuyenteDetalle && !codPersonaDetalle && !detalle.numerodocumento) {
        console.error('❌ [useContribuyentes] Detalle sin identificadores válidos:', detalle);
        console.error('❌ [useContribuyentes] Campos disponibles:', Object.keys(detalle));
        setContribuyentes([]);
        return [];
      }
      
      console.log('✅ [useContribuyentes] Códigos identificados:', { codTipoContribuyenteDetalle, codPersonaDetalle });
      
      // Construir nombres completo con validación - manejar diferentes formatos
      const nombresCompleto = [
        detalle.apellidopaterno || detalle.apellidopaterno || '',
        detalle.apellidomaterno || detalle.apellidomaterno || '', 
        detalle.nombres || detalle.nombres || ''
      ].filter(Boolean).join(' ').trim() || 'Sin nombres';
      
      // Convertir el detalle al formato de lista
      const itemLista: ContribuyenteListItem = {
        codigo: codTipoContribuyenteDetalle || codPersonaDetalle || 0,
        contribuyente: nombresCompleto,
        documento: detalle.numerodocumento || 'Sin documento',
        direccion: detalle.direccion || 'Sin dirección',
        telefono: detalle.telefono || '',
        tipoPersona: detalle.codTipopersona === '0301' ? 'natural' : 'juridica'
      };
      
      console.log('🔄 [useContribuyentes] Item convertido:', itemLista);
      
      const resultados = [itemLista];
      setContribuyentes(resultados);
      
      console.log('✅ [useContribuyentes] Contribuyente encontrado y configurado:', resultados);
      return resultados;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error en búsqueda con query params:', error);
      setError(error.message || 'Error al buscar contribuyente');
      NotificationService.error('Error al buscar contribuyente');
      setContribuyentes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [buscarContribuyentes]);
  
  // Efecto para cargar contribuyentes al montar
  useEffect(() => {
    // Solo cargar si no hay contribuyentes y no está cargando
    if (contribuyentes.length === 0 && !loading && !isLoadingRef.current) {
      cargarContribuyentes();
    }
  }, []); // Sin dependencias
  
  return {
    contribuyentes,
    loading,
    error,
    cargarContribuyentes,
    buscarContribuyentes,
    guardarContribuyente,
    obtenerContribuyente,
    eliminarContribuyente,
    // Nuevos métodos para API POST
    crearContribuyenteAPI,
    crearContribuyenteDesdePersona,
    verificarContribuyenteExistente,
    // Nuevos métodos para API GET con query params
    obtenerContribuyenteDetalle,
    buscarContribuyentesConQueryParams
  };
};