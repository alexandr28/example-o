// src/hooks/useContribuyentes.ts
import { useState, useCallback, useEffect } from 'react';
import { contribuyenteService, ContribuyenteListItem, ContribuyenteFormData } from '../services/contribuyenteService';
import { NotificationService } from '../components/utils/Notification';
import { FiltroContribuyente } from '../models';

interface UseContribuyentesReturn {
  // Estados
  contribuyentes: ContribuyenteListItem[];
  contribuyenteSeleccionado: ContribuyenteListItem | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  
  // Métodos
  cargarContribuyentes: () => Promise<void>;
  buscarContribuyentes: (filtro: FiltroContribuyente | string) => Promise<void>;
  seleccionarContribuyente: (contribuyente: ContribuyenteListItem) => void;
  crearContribuyente: (data: ContribuyenteFormData) => Promise<void>;
  actualizarContribuyente: (id: number, data: ContribuyenteFormData) => Promise<void>;
  setSearchTerm: (term: string) => void;
}

export const useContribuyentes = (): UseContribuyentesReturn => {
  const [contribuyentes, setContribuyentes] = useState<ContribuyenteListItem[]>([]);
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<ContribuyenteListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  /**
   * Cargar todos los contribuyentes
   */
  const cargarContribuyentes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [useContribuyentes] Cargando contribuyentes...');
      
      const data = await contribuyenteService.getAllAsListItems();
      setContribuyentes(data);
      
      console.log(`✅ [useContribuyentes] ${data.length} contribuyentes cargados`);
    } catch (err: any) {
      console.error('❌ [useContribuyentes] Error al cargar contribuyentes:', err);
      setError(err.message || 'Error al cargar contribuyentes');
      
      // No mostrar notificación de error si es 403, es esperado
      if (!err.message?.includes('403')) {
        NotificationService.error('Error al cargar contribuyentes');
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Buscar contribuyentes por término o filtro
   */
  const buscarContribuyentes = useCallback(async (filtro: FiltroContribuyente | string) => {
    try {
      setLoading(true);
      setError(null);
      
      let termino = '';
      
      // Si es un string, es búsqueda directa
      if (typeof filtro === 'string') {
        termino = filtro;
      } 
      // Si es un objeto FiltroContribuyente, extraer el término de búsqueda
      else if (filtro && typeof filtro === 'object') {
        termino = filtro.busqueda || '';
      }
      
      console.log('🔍 [useContribuyentes] Buscando con término:', termino);
      
      // Si no hay término, cargar todos
      if (!termino.trim()) {
        await cargarContribuyentes();
        return;
      }
      
      // Buscar usando el servicio
      const params = {
        nombres: termino,
        numeroDocumento: termino
      };
      
      // Intentar buscar por nombre
      let resultados = await contribuyenteService.buscarContribuyentes({ nombres: termino });
      
      // Si no hay resultados, intentar por documento
      if (resultados.length === 0) {
        resultados = await contribuyenteService.buscarContribuyentes({ numeroDocumento: termino });
      }
      
      // Convertir a items de lista
      const listItems = resultados.map(c => {
        const service = contribuyenteService as any;
        return service.toListItem(c);
      });
      
      setContribuyentes(listItems);
      console.log(`✅ [useContribuyentes] ${listItems.length} resultados encontrados`);
      
      if (listItems.length === 0) {
        NotificationService.info('No se encontraron contribuyentes con ese criterio');
      }
      
    } catch (err: any) {
      console.error('❌ [useContribuyentes] Error en búsqueda:', err);
      setError(err.message || 'Error al buscar contribuyentes');
      
      // Intentar búsqueda local si falla la remota
      try {
        const todos = await contribuyenteService.getAllAsListItems();
        
        const termino = typeof filtro === 'string' ? filtro : filtro.busqueda || '';
        
        const filtrados = todos.filter(c => 
          c.nombreCompleto.toLowerCase().includes(termino.toLowerCase()) ||
          c.numeroDocumento.includes(termino) ||
          c.codigo.includes(termino)
        );
        
        setContribuyentes(filtrados);
        console.log(`✅ [useContribuyentes] ${filtrados.length} resultados locales encontrados`);
      } catch (localErr) {
        console.error('❌ [useContribuyentes] Error en búsqueda local:', localErr);
      }
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);
  
  /**
   * Seleccionar un contribuyente
   */
  const seleccionarContribuyente = useCallback((contribuyente: ContribuyenteListItem) => {
    console.log('📌 [useContribuyentes] Contribuyente seleccionado:', contribuyente);
    setContribuyenteSeleccionado(contribuyente);
  }, []);
  
  /**
   * Crear nuevo contribuyente
   */
  const crearContribuyente = useCallback(async (data: ContribuyenteFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useContribuyentes] Creando contribuyente...');
      await contribuyenteService.create(data);
      
      NotificationService.success('Contribuyente creado exitosamente');
      await cargarContribuyentes();
      
    } catch (err: any) {
      console.error('❌ [useContribuyentes] Error al crear:', err);
      setError(err.message || 'Error al crear contribuyente');
      throw err; // Re-lanzar para que el formulario pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);
  
  /**
   * Actualizar contribuyente existente
   */
  const actualizarContribuyente = useCallback(async (id: number, data: ContribuyenteFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 [useContribuyentes] Actualizando contribuyente:', id);
      await contribuyenteService.update(id, data);
      
      NotificationService.success('Contribuyente actualizado exitosamente');
      await cargarContribuyentes();
      
    } catch (err: any) {
      console.error('❌ [useContribuyentes] Error al actualizar:', err);
      setError(err.message || 'Error al actualizar contribuyente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarContribuyentes]);
  
  // Cargar contribuyentes al iniciar
  useEffect(() => {
    cargarContribuyentes();
  }, [cargarContribuyentes]);
  
  // Buscar cuando cambia el término
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        buscarContribuyentes(searchTerm);
      }
    }, 500); // Debounce de 500ms
    
    return () => clearTimeout(timer);
  }, [searchTerm, buscarContribuyentes]);
  
  return {
    contribuyentes,
    contribuyenteSeleccionado,
    loading,
    error,
    searchTerm,
    cargarContribuyentes,
    buscarContribuyentes,
    seleccionarContribuyente,
    crearContribuyente,
    actualizarContribuyente,
    setSearchTerm
  };
};