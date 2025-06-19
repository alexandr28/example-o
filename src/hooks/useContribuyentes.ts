// src/hooks/useContribuyentes.ts
import { useState, useCallback, useEffect } from 'react';
import { contribuyenteListService, ContribuyenteListItem } from '../services/contribuyenteListService';
import { NotificationService } from '../components/utils/Notification';

/**
 * Interface para filtros de búsqueda
 */
export interface FiltroContribuyente {
  tipoContribuyente?: string;
  busqueda?: string;
}

/**
 * Hook para gestionar la lista de contribuyentes
 * Usa el servicio especializado para manejar la lista
 */
export const useContribuyentes = () => {
  const [contribuyentes, setContribuyentes] = useState<ContribuyenteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Carga todos los contribuyentes
   */
  const cargarContribuyentes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useContribuyentes] Cargando contribuyentes...');
      
      const data = await contribuyenteListService.obtenerListaContribuyentes();
      
      console.log(`✅ [useContribuyentes] ${data.length} contribuyentes cargados`);
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
      
      console.log('🔍 [useContribuyentes] Buscando con filtro:', filtro);
      
      if (!filtro?.busqueda || filtro.busqueda.trim() === '') {
        // Si no hay búsqueda, cargar todos
        await cargarContribuyentes();
        return;
      }
      
      // Filtrar la lista
      const resultados = await contribuyenteListService.filtrarContribuyentes(filtro.busqueda);
      
      console.log(`✅ [useContribuyentes] ${resultados.length} resultados encontrados`);
      setContribuyentes(resultados);
      
      if (resultados.length === 0) {
        NotificationService.info('No se encontraron resultados para la búsqueda');
      }
      
    } catch (error: any) {
      console.error('❌ [useContribuyentes] Error en búsqueda:', error);
      setError('Error al buscar contribuyentes');
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);
  
  /**
   * Carga inicial
   */
  useEffect(() => {
    cargarContribuyentes();
  }, [cargarContribuyentes]);
  
  return {
    contribuyentes,
    loading,
    error,
    cargarContribuyentes,
    buscarContribuyentes
  };
};