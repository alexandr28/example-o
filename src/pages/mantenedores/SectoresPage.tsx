// src/pages/mantenedores/SectoresPage.tsx
import React, { useState, useMemo } from 'react';
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
    searchTerm,
    cargarSectores,
    buscarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    forzarModoOnline,
    testApiConnection,
    sincronizarManualmente,
  } = useSectores();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Sectores', active: true }
  ], []);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, duration = 3000) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), duration);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (sectorSeleccionado) {
      setModoEdicion(true);
    } else {
      showMessage("⚠️ Por favor, seleccione un sector para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: { nombre: string }) => {
    try {
      await guardarSector(data);
      showMessage(modoEdicion 
        ? "✅ Sector actualizado correctamente" 
        : "✅ Sector creado correctamente");
    } catch (error: any) {
      showMessage(`❌ Error al guardar: ${error.message}`);
    }
  };

  // Manejo de eliminación
  const handleEliminar = async (id: number) => {
    try {
      await eliminarSector(id);
      showMessage("✅ Sector eliminado correctamente");
    } catch (error: any) {
      showMessage(`❌ Error al eliminar: ${error.message}`);
    }
  };

  // Test de API
  const handleTestApi = async () => {
    showMessage("🧪 Probando conexión con API...");
    
    try {
      const isConnected = await testApiConnection();
      showMessage(isConnected 
        ? "✅ API conectada correctamente" 
        : "❌ API no responde correctamente");
    } catch (error) {
      showMessage("❌ Error al probar API");
    }
  };

  // Forzar recarga
  const handleForceReload = async () => {
    showMessage("🔄 Forzando recarga desde API...");
    
    try {
      await forzarModoOnline();
      showMessage("✅ Datos recargados desde API");
    } catch (error: any) {
      showMessage(`❌ Error al forzar recarga: ${error.message}`);
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
        {/* Header con botones de acciones */}
        <div className="flex justify-between items-center">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="flex space-x-2">
            <button 
              onClick={handleTestApi}
              className="text-purple-600 hover:text-purple-800 flex items-center text-sm px-2 py-1 rounded border border-purple-200 hover:bg-purple-50"
              disabled={loading}
            >
              🧪 Test API
            </button>
            
            <button 
              onClick={handleForceReload}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
              disabled={loading}
            >
              🔄 Recargar
            </button>
            
            <button 
              onClick={handleClearCache}
              className="text-orange-600 hover:text-orange-800 flex items-center text-sm px-2 py-1 rounded border border-orange-200 hover:bg-orange-50"
            >
              🧹 Limpiar Cache
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className="text-gray-600 hover:text-gray-800 flex items-center text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                disabled={loading}
              >
                🔧 {showDebug ? 'Ocultar' : 'Debug'}
              </button>
            )}
          </div>
        </div>

        {/* Panel de debug */}
        {showDebug && process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-green-300 font-bold">🔧 INFORMACIÓN DE DEBUG</h3>
              <button 
                onClick={sincronizarManualmente}
                className="text-green-300 hover:text-green-200 px-2 py-1 rounded border border-green-600"
              >
                Sincronizar
              </button>
            </div>
            <pre>{JSON.stringify({
              totalSectores: sectores.length,
              sectorSeleccionado: sectorSeleccionado?.nombre || 'Ninguno',
              modoEdicion,
              isOfflineMode,
              loading,
              error,
              searchTerm,
              cache: {
                sectores: !!localStorage.getItem('sectores_cache')
              }
            }, null, 2)}</pre>
          </div>
        )}

        {/* Mensaje de éxito/error */}
        {successMessage && (
          <div className={`border px-4 py-3 rounded relative ${
            successMessage.includes('❌') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : successMessage.includes('⚠️')
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
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
                <span className="ml-1">Trabajando con datos locales.</span>
              </div>
              <button 
                onClick={handleForceReload}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                disabled={loading}
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
          onGuardar={handleGuardar}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          modoOffline={isOfflineMode}
          loading={loading}
          isEditMode={modoEdicion}
        />

        {/* Lista de sectores */}
        <SectorList
          sectores={sectores}
          onSelectSector={seleccionarSector}
          isOfflineMode={isOfflineMode}
          onEliminar={handleEliminar}
          loading={loading}
          onSearch={buscarSectores}
          searchTerm={searchTerm}
        />

        {/* Información adicional */}
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
        </div>
      </div>
    </MainLayout>
  );
};

export default SectoresPage;