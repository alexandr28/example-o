// src/hooks/useSectores.ts - DETECCIÓN DE DATOS REALES CORREGIDA
import { useState, useCallback, useEffect } from 'react';
import { Sector, SectorFormData } from '../models/Sector';
import SectorService from '../services/sectorService';
import { connectivityService } from '../services/connectivityService';
import { MockSectorService } from '../services/mockSectorService';

export const useSectores = () => {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // 🔧 FUNCIÓN CORREGIDA para detectar datos reales
  const esDataReal = (data: Sector[]): boolean => {
    if (!data || data.length === 0) {
      console.log('🔍 [useSectores] esDataReal: No hay datos');
      return false;
    }
    
    console.log('🔍 [useSectores] Verificando si es data real...');
    console.log('🔍 [useSectores] Datos a verificar:', data);
    
    // Lista de nombres que sabemos que son de mock/genéricos
    const nombresMock = [
      /^Sector \d+$/,                    // "Sector 1", "Sector 2", etc.
      /^Sector \d+ \(datos inválidos\)/, // "Sector 1 (datos inválidos)"
      /^SECTOR JERUSALÉN$/,              // Mock específico
      /^URB\. MANUEL ARÉVALO II$/,       // Mock específico
      /^PARQUE INDUSTRIAL$/,             // Mock específico (este podría ser real también)
      /^SECTOR CENTRAL$/,                // Mock específico (este podría ser real también)
      /^LOS JARDINES$/                   // Mock específico
    ];
    
    // Verificar cada sector
    const resultados = data.map((sector, index) => {
      const nombre = sector.nombre?.trim() || '';
      console.log(`🔍 [useSectores] Verificando sector ${index}: "${nombre}"`);
      
      if (!nombre) {
        console.log(`❌ [useSectores] Sector ${index} sin nombre`);
        return false;
      }
      
      // Verificar si el nombre coincide con algún patrón de mock
      const esMock = nombresMock.some(patron => patron.test(nombre));
      console.log(`🔍 [useSectores] Sector ${index} "${nombre}" es mock: ${esMock}`);
      
      // Si NO es mock y tiene un nombre válido, es dato real
      const esReal = !esMock && nombre.length > 3;
      console.log(`✅ [useSectores] Sector ${index} "${nombre}" es real: ${esReal}`);
      
      return esReal;
    });
    
    // Si al menos uno es real, entonces los datos son reales
    const tieneAlgunReal = resultados.some(esReal => esReal);
    
    console.log('🔍 [useSectores] Resultados de verificación:', resultados);
    console.log('🔍 [useSectores] ¿Tiene algún dato real?:', tieneAlgunReal);
    
    // CRITERIO MÁS FLEXIBLE: Si tenemos datos que NO son exactamente los del mock, son reales
    if (!tieneAlgunReal) {
      // Verificación adicional: comparar con datos mock conocidos
      const mockConocidos = [
        'SECTOR JERUSALÉN',
        'URB. MANUEL ARÉVALO II', 
        'PARQUE INDUSTRIAL',
        'SECTOR CENTRAL',
        'LOS JARDINES'
      ];
      
      // Si los nombres son diferentes a los mock conocidos, son reales
      const sonDiferentes = data.some(sector => {
        const nombre = sector.nombre?.trim() || '';
        return nombre && !mockConocidos.includes(nombre) && !nombre.match(/^Sector \d+/);
      });
      
      console.log('🔍 [useSectores] ¿Son diferentes a mock conocidos?:', sonDiferentes);
      return sonDiferentes;
    }
    
    return tieneAlgunReal;
  };

  // Cargar sectores con detección mejorada
  const cargarSectores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [useSectores] Iniciando carga de sectores...');
      
      let data: Sector[];
      let sourceName = "";
      let esApiReal = false;
      
      // SIEMPRE intentar API primero
      try {
        console.log('🔄 [useSectores] Cargando desde API...');
        data = await SectorService.getAll();
        
        console.log('📊 [useSectores] Datos recibidos de API:', data);
        
        // ⚠️ CAMBIO IMPORTANTE: SIEMPRE considerar datos de API como reales
        // Si la API responde con datos válidos, son reales por definición
        if (data && Array.isArray(data) && data.length > 0) {
          // Verificar que los datos tengan estructura válida
          const datosValidos = data.every(sector => 
            sector && 
            typeof sector === 'object' && 
            sector.nombre && 
            typeof sector.nombre === 'string' &&
            sector.nombre.trim() !== ''
          );
          
          if (datosValidos) {
            esApiReal = true;
            sourceName = "API Real";
            setIsOfflineMode(false);
            console.log('✅ [useSectores] Datos VÁLIDOS de API confirmados como reales');
          } else {
            console.warn('⚠️ [useSectores] Datos de API con estructura inválida');
            throw new Error('Datos de API con estructura inválida');
          }
        } else {
          console.warn('⚠️ [useSectores] API devolvió datos vacíos o inválidos');
          throw new Error('API devolvió datos vacíos');
        }
        
      } catch (apiError: any) {
        console.error('❌ [useSectores] Error al cargar desde API:', apiError);
        
        // Solo usar mock si hay error de conexión real
        console.log('🔄 [useSectores] Usando mock como fallback');
        data = await MockSectorService.getAll();
        sourceName = "Mock (error de API)";
        setIsOfflineMode(true);
        esApiReal = false;
      }
      
      console.log(`📊 [useSectores] Datos finales de ${sourceName}:`, data);
      
      if (!data || !Array.isArray(data)) {
        console.error('❌ [useSectores] Los datos no son un array válido:', data);
        data = [];
      }
      
      setSectores(data);
      
      // Actualizar estado de conexión
      if (esApiReal) {
        setIsOfflineMode(false);
        console.log('✅ [useSectores] Modo ONLINE confirmado');
      } else {
        setIsOfflineMode(true);
        console.log('⚠️ [useSectores] Modo OFFLINE confirmado');
      }
      
    } catch (err: any) {
      console.error('❌ [useSectores] Error general:', err);
      setError(err.message || 'Error al cargar los sectores');
      
      // Último recurso: mock
      try {
        const mockData = await MockSectorService.getAll();
        setSectores(mockData);
        setIsOfflineMode(true);
      } catch (mockError) {
        console.error('❌ [useSectores] Error con mock service:', mockError);
        setSectores([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para forzar modo online
  const forzarModoOnline = useCallback(async () => {
    console.log('🔄 [useSectores] FORZANDO modo online...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Forzar carga desde API
      console.log('🚀 [useSectores] Forzando carga desde API...');
      const data = await SectorService.getAll();
      
      console.log('📊 [useSectores] Datos forzados de API:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setSectores(data);
        setIsOfflineMode(false);
        console.log('✅ [useSectores] Modo online FORZADO exitosamente');
      } else {
        throw new Error('API no devolvió datos válidos');
      }
      
    } catch (error) {
      console.error('❌ [useSectores] Error al forzar modo online:', error);
      setError('Error al forzar modo online');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Test de conexión API
  const testApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧪 [useSectores] Probando conexión con API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:8080/api/sector', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('🧪 [useSectores] Test response:', response.status, response.statusText);
      
      if (response.ok) {
        const text = await response.text();
        console.log('🧪 [useSectores] Test content preview:', text.substring(0, 100));
        
        try {
          const json = JSON.parse(text);
          console.log('🧪 [useSectores] Test data parsed:', json);
          
          // Si es un array válido con datos, la API funciona
          const funcionaCorrectamente = Array.isArray(json) && json.length > 0;
          console.log('🧪 [useSectores] ¿API funciona correctamente?:', funcionaCorrectamente);
          
          return funcionaCorrectamente;
        } catch (e) {
          console.log('🧪 [useSectores] Test data no es JSON válido');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('🧪 [useSectores] Error en test de conexión:', error);
      return false;
    }
  }, []);

  // Ejecutar test al montar
  useEffect(() => {
    testApiConnection().then(isConnected => {
      console.log('🌐 [useSectores] Test inicial de conexión:', isConnected ? 'CONECTADO' : 'DESCONECTADO');
    });
  }, [testApiConnection]);

  const seleccionarSector = useCallback((sector: Sector) => {
    setSectorSeleccionado(sector);
    setModoEdicion(true);
  }, []);

  const limpiarSeleccion = useCallback(() => {
    setSectorSeleccionado(null);
    setModoEdicion(false);
  }, []);

  // Guardar sector
  const guardarSector = useCallback(async (data: SectorFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 [useSectores] Guardando sector:', data);
      
      let result: Sector;
      let sourceUsed = "";
      
      // SIEMPRE intentar API primero
      try {
        console.log('🔄 [useSectores] Intentando guardar en API...');
        
        if (modoEdicion && sectorSeleccionado) {
          result = await SectorService.update(sectorSeleccionado.id, data);
        } else {
          result = await SectorService.create(data);
        }
        
        sourceUsed = "API Real";
        setIsOfflineMode(false);
        console.log('✅ [useSectores] Guardado exitoso en API');
        
      } catch (apiError: any) {
        console.error('❌ [useSectores] Error al guardar en API:', apiError);
        
        // Solo usar mock en caso de error real
        if (modoEdicion && sectorSeleccionado) {
          result = await MockSectorService.update(sectorSeleccionado.id, data);
        } else {
          result = await MockSectorService.create(data);
        }
        sourceUsed = "MockService (fallback)";
        setIsOfflineMode(true);
      }
      
      console.log(`✅ [useSectores] Sector guardado con ${sourceUsed}:`, result);
      
      // Actualizar estado local
      if (modoEdicion && sectorSeleccionado) {
        setSectores(prev => prev.map(s => s.id === sectorSeleccionado.id ? result : s));
      } else {
        setSectores(prev => [...prev, result]);
      }
      
      limpiarSeleccion();
      return result;
      
    } catch (err: any) {
      console.error('❌ [useSectores] Error en guardarSector:', err);
      setError(err.message || 'Error al guardar el sector');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modoEdicion, sectorSeleccionado, limpiarSeleccion]);

  const eliminarSector = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        await SectorService.delete(id);
        setIsOfflineMode(false);
        console.log('✅ [useSectores] Eliminado con API');
      } catch (apiError) {
        console.error('❌ [useSectores] Error al eliminar en API:', apiError);
        await MockSectorService.delete(id);
        setIsOfflineMode(true);
        console.log('✅ [useSectores] Eliminado con mock');
      }
      
      setSectores(prev => prev.filter(s => s.id !== id));
      
      if (sectorSeleccionado?.id === id) {
        limpiarSeleccion();
      }
      
    } catch (err: any) {
      console.error('❌ [useSectores] Error al eliminar:', err);
      setError(err.message || 'Error al eliminar el sector');
    } finally {
      setLoading(false);
    }
  }, [sectorSeleccionado, limpiarSeleccion]);

  const sincronizarManualmente = useCallback(async () => {
    console.log('🔄 [useSectores] Sincronización manual');
    const isConnected = await testApiConnection();
    if (isConnected) {
      await cargarSectores();
    }
  }, [testApiConnection, cargarSectores]);

  return {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    hasPendingChanges: false,
    pendingChangesCount: 0,
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente,
    forzarModoOnline,
    testApiConnection,
  };
};