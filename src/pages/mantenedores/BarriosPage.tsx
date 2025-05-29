// src/pages/mantenedores/BarriosPage.tsx - REFACTORIZADO
import React, { useState, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { BarrioList, BarrioForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useBarrios } from '../../hooks/useBarrios';

const BarriosPage: React.FC = () => {
  const {
    // Estados principales
    barrios,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Estados adicionales
    sectores,
    loadingSectores,
    
    // Funciones
    cargarBarrios,
    buscarBarrios,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    setModoEdicion,
    sincronizarManualmente,
    cargarSectores,
    forzarModoOnline,
    testApiConnection,
    obtenerNombreSector,
    
    // Debug
    debugInfo
  } = useBarrios();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Barrios', active: true }
  ], []);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, duration = 3000) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), duration);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (barrioSeleccionado) {
      setModoEdicion(true);
    } else {
      showMessage("⚠️ Por favor, seleccione un barrio para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: { nombre: string, sectorId: number }) => {
    try {
      await guardarBarrio(data);
      showMessage(modoEdicion 
        ? "✅ Barrio actualizado correctamente" 
        : "✅ Barrio creado correctamente");
      
      // Recargar datos
      await cargarBarrios();
    } catch (error: any) {
      showMessage(`❌ Error al guardar: ${error.message}`);
    }
  };

  // Manejo de eliminación
  const handleEliminar = async (id: number) => {
    try {
      await eliminarBarrio(id);
      showMessage("✅ Barrio eliminado correctamente");
      
      // Recargar datos
      await cargarBarrios();
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
    localStorage.removeItem('barrios_cache');
    localStorage.removeItem('sectores_cache');
    showMessage("🧹 Cache limpiado (barrios y sectores)");
  };

  // Recargar sectores
  const handleReloadSectores = async () => {
    showMessage("🔄 Recargando sectores...");
    
    try {
      await cargarSectores();
      showMessage("✅ Sectores recargados");
    } catch (error: any) {
      showMessage(`❌ Error al recargar sectores: ${error.message}`);
    }
  };

  return (
    <MainLayout title="Mantenimiento de Barrios">
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
              onClick={handleReloadSectores}
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50"
              disabled={loadingSectores}
            >
              🎯 Sectores
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
            
            <button 
              onClick={sincronizarManualmente}
              className="text-green-600 hover:text-green-800 flex items-center text-sm px-2 py-1 rounded border border-green-200 hover:bg-green-50"
              disabled={loading}
            >
              🔁 Sincronizar
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
              <h3 className="text-green-300 font-bold">🔧 INFORMACIÓN DE DEBUG - BARRIOS</h3>
              <div className="space-x-2">
                <button 
                  onClick={handleTestApi}
                  className="text-green-300 hover:text-green-200 px-2 py-1 rounded border border-green-600 text-xs"
                >
                  Test API
                </button>
                <button 
                  onClick={sincronizarManualmente}
                  className="text-green-300 hover:text-green-200 px-2 py-1 rounded border border-green-600 text-xs"
                >
                  Sincronizar
                </button>
              </div>
            </div>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            {lastSyncTime && (
              <div className="mt-2 text-green-300">
                Última sincronización: {lastSyncTime.toLocaleString()}
              </div>
            )}
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

        {/* Alerta de pocos sectores */}
        {sectores.length === 0 && !loadingSectores && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">⚠️ Sin sectores disponibles:</span>
                <span className="ml-1">No se pueden crear barrios sin sectores.</span>
              </div>
              <button 
                onClick={handleReloadSectores}
                className="px-3 py-1 bg-amber-200 text-amber-800 rounded hover:bg-amber-300"
                disabled={loadingSectores}
              >
                Cargar sectores
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

        {/* Formulario de barrios */}
        <BarrioForm
          barrioSeleccionado={barrioSeleccionado}
          sectores={sectores}
          onGuardar={handleGuardar}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
          loadingSectores={loadingSectores}
          isEditMode={modoEdicion}
          isOfflineMode={isOfflineMode}
        />

        {/* Lista de barrios */}
        <BarrioList
          barrios={barrios}
          onSelectBarrio={seleccionarBarrio}
          isOfflineMode={isOfflineMode}
          onEliminar={handleEliminar}
          loading={loading}
          onSearch={buscarBarrios}
          searchTerm={searchTerm}
          obtenerNombreSector={obtenerNombreSector}
        />

        {/* Información adicional */}
        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span className="font-medium">Total barrios:</span>
              <span className="ml-2">{barrios.length}</span>
            </div>
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
              <span className="ml-2">{barrioSeleccionado?.nombre || 'Ninguno'}</span>
            </div>
            <div>
              <span className="font-medium">Modo:</span>
              <span className="ml-2">{modoEdicion ? 'Edición' : 'Vista'}</span>
            </div>
          </div>
          
          {/* Información adicional de contexto */}
          {barrioSeleccionado && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="font-medium">Barrio seleccionado:</span> {barrioSeleccionado.nombre}
                {' | '}
                <span className="font-medium">Sector:</span> {obtenerNombreSector(barrioSeleccionado.sectorId)}
                {barrioSeleccionado.estado !== undefined && (
                  <>
                    {' | '}
                    <span className="font-medium">Estado:</span> {' '}
                    <span className={barrioSeleccionado.estado ? 'text-green-600' : 'text-red-600'}>
                      {barrioSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Indicador de búsqueda activa */}
          {searchTerm && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex justify-between items-center">
                <span>
                  <span className="font-medium">Búsqueda activa:</span> "{searchTerm}"
                  {' - '}
                  <span className="font-medium">Resultados:</span> {barrios.length}
                </span>
                <button
                  onClick={() => buscarBarrios('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BarriosPage;