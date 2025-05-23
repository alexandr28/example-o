// src/pages/mantenedores/SectoresPage.tsx - CON DEBUG MEJORADO

import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { SectorList, SectorForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useSectores } from '../../hooks';

const SectoresPage: React.FC = () => {
  const {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    forzarModoOnline,
    testApiConnection,
  } = useSectores();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Sectores', active: true }
  ], []);

  // Cargar datos al montar
  useEffect(() => {
    console.log('🎬 [SectoresPage] Componente montado');
    cargarSectores();
  }, [cargarSectores]);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, isError = false) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (sectorSeleccionado) {
      setModoEdicion(true);
    } else {
      showMessage("Por favor, seleccione un sector para editar");
    }
  };

  // Función de debug mejorada
  const handleDebugInfo = async () => {
    console.log('🔧 [SectoresPage] Generando información de debug...');
    
    try {
      // Probar conexión API
      const apiConnected = await testApiConnection();
      
      // Hacer petición directa para obtener respuesta cruda
      let rawApiResponse = null;
      try {
        const response = await fetch('http://localhost:8080/api/sector', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (response.ok) {
          const text = await response.text();
          try {
            rawApiResponse = JSON.parse(text);
          } catch {
            rawApiResponse = text;
          }
        } else {
          rawApiResponse = `Error ${response.status}: ${response.statusText}`;
        }
      } catch (err: any) {
        rawApiResponse = `Error de conexión: ${err.message}`;
      }
      
      const debug = {
        timestamp: new Date().toLocaleString(),
        componente: 'SectoresPage',
        estado: {
          sectoresCargados: sectores.length,
          loading,
          error,
          isOfflineMode,
          sectorSeleccionado: sectorSeleccionado?.nombre || 'Ninguno'
        },
        sectores: sectores.map(s => ({
          id: s.id,
          nombre: s.nombre,
          tipoNombre: typeof s.nombre,
          nombreValido: !!(s.nombre && s.nombre.trim())
        })),
        api: {
          conectada: apiConnected,
          url: 'http://localhost:8080/api/sector',
          respuestaCruda: rawApiResponse
        },
        navegador: {
          userAgent: navigator.userAgent,
          online: navigator.onLine,
          localStorage: {
            sectoresCache: localStorage.getItem('sectores_cache') ? 'Presente' : 'Ausente',
          }
        }
      };
      
      setDebugInfo(debug);
      console.log('🔧 [SectoresPage] Debug info:', debug);
      
    } catch (err) {
      console.error('❌ [SectoresPage] Error generando debug:', err);
      setDebugInfo({ error: 'Error generando información de debug' });
    }
  };

  // Test rápido de API
  const handleTestApi = async () => {
    showMessage("Probando conexión con API...");
    
    try {
      const isConnected = await testApiConnection();
      showMessage(isConnected 
        ? "✅ API conectada correctamente" 
        : "❌ API no responde correctamente"
      );
    } catch (error) {
      showMessage("❌ Error al probar API", true);
    }
  };

  // Forzar recarga desde API
  const handleForceReload = async () => {
    showMessage("Forzando recarga desde API...");
    
    try {
      await forzarModoOnline();
      showMessage("✅ Datos recargados desde API");
    } catch (error) {
      showMessage("❌ Error al forzar recarga", true);
    }
  };

  // Limpiar cache
  const handleClearCache = () => {
    localStorage.removeItem('sectores_cache');
    showMessage("🧹 Cache limpiado");
  };

  return (
    <MainLayout title="Mantenimiento de Sectores">
      <div className="space-y-4">
        {/* Header con botones de debug */}
        <div className="flex justify-between items-center">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex space-x-2">
            <button 
              onClick={handleTestApi}
              className="text-purple-600 hover:text-purple-800 flex items-center text-sm px-2 py-1 rounded border border-purple-200 hover:bg-purple-50"
            >
              🧪 Test API
            </button>
            
            <button 
              onClick={handleForceReload}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
            >
              🔄 Recargar
            </button>
            
            <button 
              onClick={handleClearCache}
              className="text-orange-600 hover:text-orange-800 flex items-center text-sm px-2 py-1 rounded border border-orange-200 hover:bg-orange-50"
            >
              🧹 Limpiar Cache
            </button>
            
            <button 
              onClick={() => {
                setShowDebug(!showDebug);
                if (!showDebug) handleDebugInfo();
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
            >
              🔧 {showDebug ? 'Ocultar' : 'Debug'}
            </button>
          </div>
        </div>

        {/* Panel de debug */}
        {showDebug && debugInfo && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-green-300 font-bold">🔧 INFORMACIÓN DE DEBUG</h3>
              <button 
                onClick={handleDebugInfo}
                className="text-green-300 hover:text-green-200 px-2 py-1 rounded border border-green-600"
              >
                Actualizar
              </button>
            </div>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        {/* Mensaje de éxito/error */}
        {successMessage && (
          <div className={`border px-4 py-3 rounded relative ${
            successMessage.includes('❌') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`} role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* Alerta de modo offline */}
        {isOfflineMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">⚠️ Modo sin conexión:</span>
                <span className="ml-1">Trabajando con datos locales o mock.</span>
              </div>
              <button 
                onClick={handleForceReload}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
              >
                Reconectar
              </button>
            </div>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Formulario de sectores */}
        <SectorForm
          sectorSeleccionado={sectorSeleccionado}
          onGuardar={async (data) => {
            try {
              await guardarSector(data);
              showMessage(modoEdicion 
                ? "✅ Sector actualizado correctamente" 
                : "✅ Sector creado correctamente");
            } catch (error: any) {
              showMessage("❌ Error al guardar: " + error.message, true);
            }
          }}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />

        {/* Lista de sectores */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando sectores...</span>
          </div>
        ) : (
          <SectorList
            sectores={sectores}
            onSelectSector={seleccionarSector}
            isOfflineMode={isOfflineMode}
            onEliminar={async (id) => {
              try {
                await eliminarSector(id);
                showMessage("✅ Sector eliminado correctamente");
              } catch (error: any) {
                showMessage("❌ Error al eliminar: " + error.message, true);
              }
            }}
          />
        )}

        {/* Información adicional en la parte inferior */}
        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Total sectores:</span>
              <span className="ml-2">{sectores.length}</span>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <span className="ml-2">{isOfflineMode ? '🔴 Offline' : '🟢 Online'}</span>
            </div>
            <div>
              <span className="font-medium">Seleccionado:</span>
              <span className="ml-2">{sectorSeleccionado?.nombre || 'Ninguno'}</span>
            </div>
            <div>
              <span className="font-medium">Modo:</span>
              <span className="ml-2">{modoEdicion ? 'Edición' : 'Vista'}</span>
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                🔧 Modo desarrollo activo - Usa los botones de debug para diagnosticar problemas
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SectoresPage;