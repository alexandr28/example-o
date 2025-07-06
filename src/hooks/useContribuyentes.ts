// src/hooks/useContribuyentes.ts
import { useState, useCallback, useEffect } from 'react';
import { contribuyenteService, ContribuyenteListItem } from '../services/contribuyenteService';
import { contribuyenteListService } from '../services/contribuyenteListService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para filtros de búsqueda
 */
export interface FiltroContribuyente {
  tipoContribuyente?: string;
  busqueda?: string;
  tipoDocumento?: string;
}

/**
 * Hook para gestionar la lista de contribuyentes
 * Combina ambos servicios para máxima flexibilidad
 */
export const useContribuyentes = () => {
  const [contribuyentes, setContribuyentes] = useState<ContribuyenteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Carga todos los contribuyentes
   * Intenta primero con el endpoint de personas, luego con el de contribuyentes
   */
  const cargarContribuyentes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useContribuyentes] Cargando contribuyentes...');
      
      let data: ContribuyenteListItem[] = [];
      
      // Intentar primero con el servicio de lista (personas)
      try {
        data = await contribuyenteListService.obtenerListaContribuyentes();
        console.log(`✅ [useContribuyentes] ${data.length} contribuyentes desde personas`);
      } catch (error) {
        console.warn('⚠️ Error con servicio de personas, intentando con contribuyentes...');
        
        // Si falla, intentar con el servicio de contribuyentes
        data = await contribuyenteService.getAllAsListItems();
        console.log(`✅ [useContribuyentes] ${data.length} contribuyentes desde API contribuyente`);
      }
      
      setContribuyentes(data);
      
      // Si no hay datos reales, mostrar mensaje informativo
      if (data.length === 0) {
        NotificationService.info('No se encontraron contribuyentes registrados');
      }
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error:', error);
      setError('Error al cargar la lista de contribuyentes');
      
      // No mostrar notificación de error si es 403, ya que es esperado
      if (!error.message?.includes('403')) {
        NotificationService.error('Error al cargar la lista de contribuyentes');
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Busca contribuyentes con filtros
   */
  const buscarContribuyentes = useCallback(async (filtro?: FiltroContribuyente) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useContribuyentes] Buscando con filtros:', filtro);
      
      let resultados: ContribuyenteListItem[] = [];
      
      if (!filtro || (!filtro.busqueda && !filtro.tipoContribuyente && !filtro.tipoDocumento)) {
        // Si no hay filtros, cargar todos
        await cargarContribuyentes();
        return;
      }
      
      // Intentar con el servicio de lista primero
      try {
        resultados = await contribuyenteListService.filtrarContribuyentes(filtro);
      } catch (error) {
        console.warn('⚠️ Error al filtrar con personas, usando búsqueda local...');
        
        // Si falla, buscar localmente
        const todos = await contribuyenteService.getAllAsListItems();
        
        resultados = todos.filter(item => {
          // Filtrar por tipo de contribuyente
          if (filtro.tipoContribuyente && item.tipoPersona !== filtro.tipoContribuyente) {
            return false;
          }
          
          // Filtrar por búsqueda de texto
          if (filtro.busqueda) {
            const busquedaLower = filtro.busqueda.toLowerCase();
            const coincide = 
              item.contribuyente.toLowerCase().includes(busquedaLower) ||
              item.documento.toLowerCase().includes(busquedaLower) ||
              item.direccion.toLowerCase().includes(busquedaLower) ||
              (item.telefono && item.telefono.toLowerCase().includes(busquedaLower));
            
            if (!coincide) return false;
          }
          
          // Filtrar por tipo de documento (si tuviéramos esa información)
          // Por ahora no podemos filtrar por tipo de documento
          
          return true;
        });
      }
      
      setContribuyentes(resultados);
      
      console.log(`✅ [useContribuyentes] ${resultados.length} resultados encontrados`);
      
      if (resultados.length === 0) {
        NotificationService.info('No se encontraron contribuyentes con los criterios especificados');
      }
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al buscar:', error);
      setError('Error al buscar contribuyentes');
      NotificationService.error('Error al buscar contribuyentes');
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);
  
  /**
   * Guardar un contribuyente
   */
  const guardarContribuyente = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useContribuyentes] Guardando contribuyente:', data);
      
      await contribuyenteService.guardar(data);
      
      // Recargar lista después de guardar
      await cargarContribuyentes();
      
      return true;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al guardar:', error);
      setError(error.message || 'Error al guardar contribuyente');
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
      
      const contribuyente = await contribuyenteService.obtenerPorCodigo(codigo);
      
      return contribuyente;
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error al obtener contribuyente:', error);
      setError(error.message || 'Error al obtener contribuyente');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Efecto para cargar contribuyentes al montar
  useEffect(() => {
    // No cargar automáticamente, dejar que el componente decida
  }, []);
  
  return {
    // Estado
    contribuyentes,
    loading,
    error,
    
    // Acciones
    cargarContribuyentes,
    buscarContribuyentes,
    guardarContribuyente,
    obtenerContribuyente,
    
    // Utilidades
    totalContribuyentes: contribuyentes.length
  };
};