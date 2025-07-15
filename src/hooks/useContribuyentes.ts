// src/hooks/useContribuyentes.ts - ACTUALIZADO SIN AUTENTICACIÓN
import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '../components/utils/Notification';
import { contribuyenteService } from '../services/contribuyenteService';

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
  
  /**
   * Convierte datos de la API al formato de lista
   */
  const convertirAListItem = (data: any): ContribuyenteListItem => {
    // Determinar el nombre completo
    let nombreCompleto = '';
    
    if (data.nombreCompleto) {
      nombreCompleto = data.nombreCompleto;
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
      tipoPersona: (data.tipoPersona === '0301' || data.codTipopersona === '0301') ? 'natural' : 'juridica'
    };
  };
  
  /**
   * Carga todos los contribuyentes
   */
  const cargarContribuyentes = useCallback(async () => {
    if (loading) {
      console.log('⏭️ [useContribuyentes] Carga ya en proceso, omitiendo...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useContribuyentes] Cargando contribuyentes...');
      
      // Usar el servicio para obtener los datos
      const datos = await contribuyenteService.listarContribuyentes();
      
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
    }
  }, [loading]);
  
  /**
   * Busca contribuyentes con filtros
   */
  const buscarContribuyentes = useCallback(async (filtro?: FiltroContribuyente) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Buscando con filtros:', filtro);
      
      let resultados: any[] = [];
      
      // Si no hay filtros, cargar todos
      if (!filtro || (!filtro.busqueda && !filtro.tipoContribuyente && !filtro.tipoDocumento)) {
        resultados = await contribuyenteService.listarContribuyentes();
      } else {
        // Construir parámetros de búsqueda
        const params: any = {};
        
        if (filtro.busqueda) {
          // Si es un número de documento exacto, buscar por ese campo
          if (/^\d{8,11}$/.test(filtro.busqueda)) {
            params.numeroDocumento = filtro.busqueda;
          } else {
            params.parametroBusqueda = filtro.busqueda;
          }
        }
        
        if (filtro.tipoContribuyente) {
          params.tipoPersona = filtro.tipoContribuyente;
        }
        
        if (filtro.tipoDocumento) {
          params.tipoDocumento = filtro.tipoDocumento;
        }
        
        resultados = await contribuyenteService.buscarContribuyentes(params);
      }
      
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
  
  // Efecto para cargar contribuyentes al montar
  useEffect(() => {
    // Solo cargar si no hay contribuyentes y no está cargando
    if (contribuyentes.length === 0 && !loading) {
      cargarContribuyentes();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    contribuyentes,
    loading,
    error,
    cargarContribuyentes,
    buscarContribuyentes,
    guardarContribuyente,
    obtenerContribuyente,
    eliminarContribuyente
  };
};