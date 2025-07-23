// src/hooks/useDirecciones.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { SectorData } from '../services/sectorService';
import { BarrioData } from '../services/barrioService';
import { CalleData } from '../services/calleApiService';
import sectorService from '../services/sectorService';
import barrioService from '../services/barrioService';
import calleService from '../services/calleApiService';
import { NotificationService } from '../components/utils/Notification';

// Interfaces
interface DireccionData {
  id: number;
  codigo?: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  estado?: string;
}

interface CreateDireccionDTO {
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
}

interface UpdateDireccionDTO extends Partial<CreateDireccionDTO> {
  estado?: string;
}

interface BusquedaDireccionParams {
  codigoSector?: number;
  codigoBarrio?: number;
  nombreVia?: string;
  parametrosBusqueda?: string;
}

/**
 * Hook personalizado para gestión de direcciones
 */
export const useDirecciones = () => {
  // Estados principales
  const [direcciones, setDirecciones] = useState<DireccionData[]>([]);
  const [sectores, setSectores] = useState<SectorData[]>([]);
  const [barrios, setBarrios] = useState<BarrioData[]>([]);
  const [calles, setCalles] = useState<CalleData[]>([]);
  
  // Estados de filtrado
  const [barriosFiltrados, setBarriosFiltrados] = useState<BarrioData[]>([]);
  const [callesFiltradas, setCallesFiltradas] = useState<CalleData[]>([]);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingSectores, setLoadingSectores] = useState(false);
  const [loadingBarrios, setLoadingBarrios] = useState(false);
  const [loadingCalles, setLoadingCalles] = useState(false);
  
  // Estados de error
  const [error, setError] = useState<string | null>(null);
  
  // Estados de selección
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<DireccionData | null>(null);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<number | null>(null);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<number | null>(null);
  
  // Ref para evitar cargas duplicadas
  const cargaInicialRef = useRef(false);

  // Cargar sectores
  const cargarSectores = useCallback(async () => {
    try {
      setLoadingSectores(true);
      const data = await sectorService.obtenerTodos();
      console.log('✅ Sectores cargados:', data.length);
      setSectores(data);
    } catch (error: any) {
      console.error('❌ Error al cargar sectores:', error);
      NotificationService.error('Error al cargar sectores');
    } finally {
      setLoadingSectores(false);
    }
  }, []);

  // Cargar barrios
  const cargarBarrios = useCallback(async () => {
    try {
      setLoadingBarrios(true);
      const data = await barrioService.obtenerTodos();
      console.log('✅ Barrios cargados:', data.length);
      setBarrios(data);
    } catch (error: any) {
      console.error('❌ Error al cargar barrios:', error);
      NotificationService.error('Error al cargar barrios');
    } finally {
      setLoadingBarrios(false);
    }
  }, []);

  // Cargar calles
  const cargarCalles = useCallback(async () => {
    try {
      setLoadingCalles(true);
      const data = await calleService.getAll();
      console.log('✅ Calles cargadas:', data.length);
      
      // Debug: Ver estructura de las calles
      if (data.length > 0) {
        console.log('📊 Estructura de calle ejemplo:', data[0]);
        console.log('📊 Campos de calle:', Object.keys(data[0]));
      }
      
      setCalles(data);
    } catch (error: any) {
      console.error('❌ Error al cargar calles:', error);
      NotificationService.error('Error al cargar calles');
    } finally {
      setLoadingCalles(false);
    }
  }, []);

  // Cargar direcciones - Usar el servicio real
  const cargarDirecciones = useCallback(async (parametros?: BusquedaDireccionParams) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando direcciones con parámetros:', parametros);
      
      // Intentar cargar desde el servicio real
      try {
        // Importar el servicio si no está importado
        const direccionService = (await import('../services/direccionService')).default;
        const direccionesApi = await direccionService.obtenerTodos();
        
        if (direccionesApi && direccionesApi.length > 0) {
          console.log('✅ Direcciones cargadas desde API:', direccionesApi.length);
          setDirecciones(direccionesApi);
          return;
        }
      } catch (apiError) {
        console.error('❌ Error cargando desde API:', apiError);
      }
      
      // Si falla o no hay datos, usar direcciones de ejemplo
      console.log('⚠️ Usando direcciones de ejemplo');
      const direccionesEjemplo: DireccionData[] = [
        {
          id: 1,
          codigo: 1,
          codigoSector: 1,
          codigoBarrio: 1,
          codigoCalle: 1,
          nombreSector: 'Centro',
          nombreBarrio: 'Los Jardines',
          nombreCalle: 'Av. Principal',
          nombreVia: 'Principal',
          nombreTipoVia: 'AVENIDA',
          cuadra: '12',
          lado: 'Derecho',
          loteInicial: 1,
          loteFinal: 50,
          descripcion: 'AVENIDA Principal CUADRA 12',
          estado: 'ACTIVO'
        }
      ];
      
      setDirecciones(direccionesEjemplo);
    } catch (error: any) {
      console.error('❌ Error al cargar direcciones:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear dirección - Mejorado para incluir nombres
  const crearDireccion = useCallback(async (datos: CreateDireccionDTO): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('➕ Creando dirección:', datos);
      
      // Obtener nombres de las entidades relacionadas
      const sector = sectores.find(s => s.codigo === datos.codigoSector);
      const barrio = barrios.find(b => b.codigo === datos.codigoBarrio);
      const calle = calles.find(c => c.codigo === datos.codigoCalle);
      
      // Simular creación con datos completos
      const nuevaDireccion: DireccionData = {
        id: Date.now(),
        codigo: Date.now(),
        ...datos,
        nombreSector: sector?.nombre || '',
        nombreBarrio: barrio?.nombre || '',
        nombreCalle: calle?.nombre || '',
        nombreVia: calle?.nombreVia || calle?.nombre || '',
        nombreTipoVia: calle?.tipo || 'CALLE',
        descripcion: `${calle?.tipo || 'CALLE'} ${calle?.nombre || ''} ${datos.cuadra ? `CUADRA ${datos.cuadra}` : ''}`.trim(),
        estado: 'ACTIVO'
      };
      
      setDirecciones(prev => [...prev, nuevaDireccion]);
      
      NotificationService.success('Dirección creada correctamente');
      return true;
      
    } catch (error: any) {
      NotificationService.error(error.message || 'Error al crear dirección');
      return false;
    } finally {
      setLoading(false);
    }
  }, [sectores, barrios, calles]);

  // Actualizar dirección - Placeholder
  const actualizarDireccion = useCallback(async (id: number, datos: UpdateDireccionDTO): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('📝 Actualizando dirección:', id, datos);
      
      setDirecciones(prev => prev.map(dir => 
        dir.id === id ? { ...dir, ...datos } : dir)
      );
      
      NotificationService.success('Dirección actualizada correctamente');
      return true;
      
    } catch (error: any) {
      NotificationService.error(error.message || 'Error al actualizar dirección');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar dirección - Placeholder
  const eliminarDireccion = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      
      // TODO: Implementar cuando el servicio esté disponible
      console.log('🗑️ Eliminando dirección:', id);
      
      setDirecciones(prev => prev.filter(dir => dir.id !== id));
      
      NotificationService.success('Dirección eliminada correctamente');
      return true;
      
    } catch (error: any) {
      NotificationService.error(error.message || 'Error al eliminar dirección');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar cambio de sector
  const handleSectorChange = useCallback((sectorId: number) => {
    console.log('🔄 Cambio de sector:', sectorId);
    setSectorSeleccionado(sectorId);
    setBarrioSeleccionado(null);
    
    // Filtrar barrios por sector
    const barriosFiltrados = barrios.filter(barrio => {
      // Verificar qué campo usar para el sector
      const sectorDelBarrio = barrio.codSector || (barrio as any).codigoSector;
      return sectorDelBarrio === sectorId;
    });
    
    console.log(`📊 Barrios filtrados para sector ${sectorId}:`, barriosFiltrados.length);
    setBarriosFiltrados(barriosFiltrados);
    setCallesFiltradas([]);
  }, [barrios]);

  // Manejar cambio de barrio
  const handleBarrioChange = useCallback((barrioId: number) => {
    console.log('🔄 Cambio de barrio:', barrioId);
    setBarrioSeleccionado(barrioId);
    
    // Debug: Ver todas las calles y sus campos
    console.log('📊 Total de calles disponibles:', calles.length);
    
    // Filtrar calles por barrio
    const callesFiltradas = calles.filter(calle => {
      // Verificar todos los posibles campos del barrio
      const barrioDelaCalle = 
        calle.codigoBarrio || 
        (calle as any).codBarrio || 
        (calle as any).barrio ||
        (calle as any).barrioId;
      
      // Debug: mostrar el mapeo
      if (calles.indexOf(calle) < 5) { // Solo las primeras 5 para no saturar
        console.log(`Calle ${calle.nombre}: barrio campo = ${barrioDelaCalle}`);
      }
      
      return barrioDelaCalle === barrioId;
    });
    
    console.log(`📊 Calles filtradas para barrio ${barrioId}:`, callesFiltradas.length);
    
    if (callesFiltradas.length === 0 && calles.length > 0) {
      console.warn('⚠️ No se encontraron calles para el barrio. Verificar mapeo de campos.');
      console.log('Ejemplo de calle:', calles[0]);
    }
    
    setCallesFiltradas(callesFiltradas);
  }, [calles]);

  // Buscar direcciones
  const buscarDirecciones = useCallback(async (criterios: BusquedaDireccionParams) => {
    await cargarDirecciones(criterios);
  }, [cargarDirecciones]);

  // Cargar datos iniciales
  useEffect(() => {
    if (!cargaInicialRef.current) {
      cargaInicialRef.current = true;
      
      // Cargar todos los datos necesarios
      Promise.all([
        cargarSectores(),
        cargarBarrios(),
        cargarCalles(),
        cargarDirecciones()
      ]).catch(error => {
        console.error('Error en carga inicial:', error);
      });
    }
  }, [cargarSectores, cargarBarrios, cargarCalles, cargarDirecciones]);

  return {
    // Datos
    direcciones,
    sectores,
    barrios,
    calles,
    barriosFiltrados,
    callesFiltradas,
    direccionSeleccionada,
    
    // Estados
    loading,
    loadingSectores,
    loadingBarrios,
    loadingCalles,
    error,
    
    // Funciones
    cargarDirecciones,
    cargarSectores,
    cargarBarrios,
    cargarCalles,
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion,
    buscarDirecciones,
    setDireccionSeleccionada,
    handleSectorChange,
    handleBarrioChange
  };
};