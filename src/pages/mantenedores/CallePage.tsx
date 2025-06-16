// src/pages/mantenedores/CallesPage.tsx - CON ERROR BOUNDARY
import React, { useState, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { CalleList, CalleForm, Breadcrumb } from '../../components';
import FormErrorBoundary from '../../components/utils/FormErrorBoundary';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks/useCalles';

const CallesPage: React.FC = () => {
  const {
    // Estados principales
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Estados adicionales
    sectores,
    barrios,
    barriosFiltrados,
    tiposVia,
    loadingSectores,
    loadingBarrios,
    loadingTiposVia,
    
    // Funciones principales
    cargarCalles,
    buscarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    setModoEdicion,
    sincronizarManualmente,
    
    // Funciones adicionales
    cargarSectores,
    cargarBarrios,
    cargarTiposVia,
    filtrarBarriosPorSector,
    forzarModoOnline,
    testApiConnection,
    obtenerNombreSector,
    obtenerNombreBarrio,
    
    // Debug
    debugInfo
  } = useCalles();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Calles', active: true }
  ], []);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, duration = 3000) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), duration);
  };

  // 🔥 MANEJAR ERRORES DE FORMULARIO
  const handleFormError = (error: Error) => {
    console.error('❌ [CallesPage] Error en formulario:', error);
    showMessage(`❌ Error en formulario: ${error.message}`);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (calleSeleccionada) {
      setModoEdicion(true);
    } else {
      showMessage("⚠️ Por favor, seleccione una calle para editar");
    }
  };

  // 🔥 MANEJO DE GUARDADO CON MEJOR VALIDACIÓN
  const handleGuardar = async (data: { sectorId: number; barrioId: number; tipoVia: string; nombre: string }) => {
    try {
      console.log('💾 [CallesPage] Iniciando guardado:', data);
      
      // Validaciones adicionales
      if (!data.sectorId || data.sectorId <= 0) {
        throw new Error('Debe seleccionar un sector válido');
      }
      
      if (!data.barrioId || data.barrioId <= 0) {
        throw new Error('Debe seleccionar un barrio válido');
      }
      
      if (!data.tipoVia || data.tipoVia.trim() === '') {
        throw new Error('Debe seleccionar un tipo de vía');
      }
      
      if (!data.nombre || data.nombre.trim().length < 2) {
        throw new Error('El nombre de la calle debe tener al menos 2 caracteres');
      }
      
      await guardarCalle(data);
      showMessage(modoEdicion 
        ? "✅ Calle actualizada correctamente" 
        : "✅ Calle creada correctamente");
      
      // Recargar datos
      await cargarCalles();
    } catch (error: any) {
      console.error('❌ [CallesPage] Error al guardar:', error);
      showMessage(`❌ Error al guardar: ${error.message}`);
    }
  };

  // Manejo de eliminación
  const handleEliminar = async (id: number) => {
    try {
      await eliminarCalle(id);
      showMessage("✅ Calle eliminada correctamente");
      
      // Recargar datos
      await cargarCalles();
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
    localStorage.removeItem('calles_cache');
    localStorage.removeItem('sectores_cache');
    localStorage.removeItem('barrios_cache');
    localStorage.removeItem('tipos_via_cache');
    showMessage("🧹 Cache limpiado completamente");
  };

  // Recargar datos específicos
  const handleReloadSectores = async () => {
    showMessage("🔄 Recargando sectores...");
    try {
      await cargarSectores();
      showMessage("✅ Sectores recargados");
    } catch (error: any) {
      showMessage(`❌ Error al recargar sectores: ${error.message}`);
    }
  };

  const handleReloadBarrios = async () => {
    showMessage("🔄 Recargando barrios...");
    try {
      await cargarBarrios();
      showMessage("✅ Barrios recargados");
    } catch (error: any) {
      showMessage(`❌ Error al recargar barrios: ${error.message}`);
    }
  };

  const handleReloadTiposVia = async () => {
    showMessage("🔄 Recargando tipos de vía...");
    try {
      await cargarTiposVia();
      showMessage("✅ Tipos de vía recargados");
    } catch (error: any) {
      showMessage(`❌ Error al recargar tipos de vía: ${error.message}`);
    }
  };

  return (
    <MainLayout title="Mantenimiento de Calles">
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
              🏢 Sectores
            </button>
            
            <button 
              onClick={handleReloadBarrios}
              className="text-cyan-600 hover:text-cyan-800 flex items-center text-sm px-2 py-1 rounded border border-cyan-200 hover:bg-cyan-50"
              disabled={loadingBarrios}
            >
              🏘️ Barrios
            </button>
            
            <button 
              onClick={handleReloadTiposVia}
              className="text-green-600 hover:text-green-800 flex items-center text-sm px-2 py-1 rounded border border-green-200 hover:bg-green-50"
              disabled={loadingTiposVia}
            >
              🎨 Tipos
            </button>
            
            <button 
              onClick={handleForceReload}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
              disabled={loading}
            >
              🔄 Recargar Todo
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
              <h3 className="text-green-300 font-bold">🔧 INFORMACIÓN DE DEBUG - CALLES</h3>
              <div className="space-x-2">
                <button 
                  onClick={sincronizarManualmente}
                  className="text-green-300 hover:text-green-200 px-2 py-1 rounded border border-green-600 text-xs"
                >
                  Sincronizar
                </button>
              </div>
            </div>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            <div className="mt-2 grid grid-cols-2 gap-2 text-green-300">
              <div>🏘️ Barrios filtrados: {barriosFiltrados.length}</div>
              <div>🎨 Tipos de vía: {tiposVia.length}</div>
              <div>📊 Última sync: {lastSyncTime?.toLocaleTimeString() || 'Nunca'}</div>
              <div>🔌 Modo: {isOfflineMode ? 'Offline' : 'Online'}</div>
            </div>
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

        {/* Alertas de datos faltantes */}
        {sectores.length === 0 && !loadingSectores && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">⚠️ Sin sectores disponibles:</span>
                <span className="ml-1">Debe cargar sectores primero.</span>
              </div>
              <button 
                onClick={handleReloadSectores}
                className="px-3 py-1 bg-amber-200 text-amber-800 rounded hover:bg-amber-300"
              >
                Cargar sectores
              </button>
            </div>
          </div>
        )}

        {barrios.length === 0 && !loadingBarrios && sectores.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">⚠️ Sin barrios disponibles:</span>
                <span className="ml-1">Debe cargar barrios para continuar.</span>
              </div>
              <button 
                onClick={handleReloadBarrios}
                className="px-3 py-1 bg-amber-200 text-amber-800 rounded hover:bg-amber-300"
              >
                Cargar barrios
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

        {/* 🔥 FORMULARIO DE CALLES CON ERROR BOUNDARY */}
        <FormErrorBoundary 
          formName="Calles" 
          onError={handleFormError}
        >
          <CalleForm
            calleSeleccionada={calleSeleccionada}
            sectores={sectores}
            barrios={barrios}
            barriosFiltrados={barriosFiltrados}
            tiposVia={tiposVia}
            onGuardar={handleGuardar}
            onNuevo={limpiarSeleccion}
            onEditar={handleEditar}
            onSectorChange={filtrarBarriosPorSector}
            loading={loading}
            loadingSectores={loadingSectores}
            loadingBarrios={loadingBarrios}
            loadingTiposVia={loadingTiposVia}
            isEditMode={modoEdicion}
            isOfflineMode={isOfflineMode}
          />
        </FormErrorBoundary>

        {/* 🔥 LISTA DE CALLES CON ERROR BOUNDARY */}
        <FormErrorBoundary 
          formName="Lista de Calles"
          onError={handleFormError}
        >
          <CalleList
            calles={calles}
            onSelectCalle={seleccionarCalle}
            isOfflineMode={isOfflineMode}
            onEliminar={handleEliminar}
            loading={loading}
            onSearch={buscarCalles}
            searchTerm={searchTerm}
            obtenerNombreSector={obtenerNombreSector}
            obtenerNombreBarrio={obtenerNombreBarrio}
          />
        </FormErrorBoundary>

        {/* Información adicional */}
        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <span className="font-medium">Total calles:</span>
              <span className="ml-2">{calles.length}</span>
            </div>
            <div>
              <span className="font-medium">Sectores:</span>
              <span className="ml-2">{sectores.length}</span>
            </div>
            <div>
              <span className="font-medium">Barrios:</span>
              <span className="ml-2">{barrios.length}</span>
            </div>
            <div>
              <span className="font-medium">Tipos vía:</span>
              <span className="ml-2">{tiposVia.length}</span>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <span className="ml-2">{isOfflineMode ? '🔴 Offline' : '🟢 Online'}</span>
            </div>
            <div>
              <span className="font-medium">Modo:</span>
              <span className="ml-2">{modoEdicion ? 'Edición' : 'Vista'}</span>
            </div>
          </div>
          
          {/* Información adicional de contexto */}
          {calleSeleccionada && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="font-medium">Calle seleccionada:</span> {' '}
                {tiposVia.find(t => t.value === calleSeleccionada.tipoVia)?.descripcion || calleSeleccionada.tipoVia} {calleSeleccionada.nombre}
                {' | '}
                <span className="font-medium">Ubicación:</span> {' '}
                {obtenerNombreSector(calleSeleccionada.sectorId)} - {obtenerNombreBarrio(calleSeleccionada.barrioId)}
                {calleSeleccionada.estado !== undefined && (
                  <>
                    {' | '}
                    <span className="font-medium">Estado:</span> {' '}
                    <span className={calleSeleccionada.estado ? 'text-green-600' : 'text-red-600'}>
                      {calleSeleccionada.estado ? 'Activo' : 'Inactivo'}
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
                  <span className="font-medium">Resultados:</span> {calles.length}
                </span>
                <button
                  onClick={() => buscarCalles('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Limpiar búsqueda
                </button>
              </div>
            </div>
          )}
          
          {/* Estadísticas de tipos de vía */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Distribución por tipo:</span> {' '}
              {(() => {
                const tipoCount = calles.reduce((acc, calle) => {
                  acc[calle.tipoVia] = (acc[calle.tipoVia] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                return Object.entries(tipoCount)
                  .map(([tipo, count]) => `${tipo}: ${count}`)
                  .join(' | ');
              })() || 'Sin datos'}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CallesPage;