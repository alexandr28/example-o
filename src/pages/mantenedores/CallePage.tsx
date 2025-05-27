// src/pages/mantenedores/CallePage.tsx - ACTUALIZADO CON TIPOVIA INTEGRADO

import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { CalleList, CalleForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks';

const CallePage: React.FC = () => {
  const {
    // Estados existentes
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    
    // NUEVOS estados para TipoVia
    tiposVia,
    loadingTiposVia,
    
    // Funciones existentes
    cargarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    buscarCalles,
    forzarModoOnline,
    testApiConnection,
    setModoEdicion,
    
    // NUEVA función para TipoVia
    cargarTiposVia,
  } = useCalles();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Calles', active: true }
  ], []);

  // Cargar datos al montar
  useEffect(() => {
    console.log('🎬 [CallePage] Componente montado');
    // Los datos ya se cargan automáticamente en el hook
  }, []);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, isError = false) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (calleSeleccionada) {
      setModoEdicion(true);
    } else {
      showMessage("Por favor, seleccione una calle para editar");
    }
  };

  // Función de debug mejorada para incluir tipos de vía
  const handleDebugInfo = async () => {
    console.log('🔧 [CallePage] Generando información de debug para calles...');
    
    try {
      // Probar conexión API
      const apiConnected = await testApiConnection();
      
      // Hacer petición directa para obtener respuesta cruda
      let rawApiResponse = null;
      try {
        const response = await fetch('http://localhost:8080/api/via', {
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
            rawApiResponse = text.substring(0, 500) + '...';
          }
        } else {
          rawApiResponse = `Error ${response.status}: ${response.statusText}`;
        }
      } catch (err: any) {
        rawApiResponse = `Error de conexión: ${err.message}`;
      }
      
      // Analizar estructura de datos
      const analisisCalles = calles.map((calle, index) => ({
        indice: index,
        id: calle.id,
        tipoVia: calle.tipoVia,
        nombre: calle.nombre,
        tipoNombre: typeof calle.nombre,
        nombreValido: !!(calle.nombre && calle.nombre.trim()),
        longitudNombre: calle.nombre ? calle.nombre.length : 0,
        esMock: calle.nombre ? calle.nombre.includes('sin nombre') : false,
        // NUEVOS campos para debug de tipo de vía
        tipoViaValido: calle.tipoVia && typeof calle.tipoVia === 'string',
        tipoViaEnEnum: tiposVia.some(t => t.value === calle.tipoVia),
        camposApi: {
          codTipoVia: calle.codTipoVia,
          nombreVia: calle.nombreVia,
          descripTipoVia: calle.descripTipoVia
        }
      }));

      // Analizar tipos de vía
      const tiposViaUnicos = [...new Set(calles.map(c => c.tipoVia))];
      const tiposViaStats = tiposViaUnicos.map(tipo => ({
        tipo,
        cantidad: calles.filter(c => c.tipoVia === tipo).length,
        enEnum: tiposVia.some(t => t.value === tipo),
        descripcion: tiposVia.find(t => t.value === tipo)?.descripcion || 'No definida'
      }));
      
      const debug = {
        timestamp: new Date().toLocaleString(),
        componente: 'CallePage',
        estado: {
          callesCargadas: calles.length,
          tiposViaCargados: tiposVia.length,
          loading,
          loadingTiposVia,
          error,
          isOfflineMode,
          calleSeleccionada: calleSeleccionada?.nombre || 'Ninguna',
          searchTerm
        },
        analisisCalles: analisisCalles.slice(0, 5), // Solo las primeras 5 para no saturar
        tiposViaAnalisis: {
          disponibles: tiposVia.map(t => ({
            value: t.value,
            label: t.label,
            descripcion: t.descripcion
          })),
          usados: tiposViaStats,
          huerfanos: tiposViaUnicos.filter(tipo => !tiposVia.some(t => t.value === tipo))
        },
        primeraCalleCompleta: calles[0] || null,
        api: {
          conectada: apiConnected,
          url: 'http://localhost:8080/api/via',
          respuestaCruda: Array.isArray(rawApiResponse) ? 
            `Array con ${rawApiResponse.length} elementos` : 
            rawApiResponse,
          totalElementosAPI: Array.isArray(rawApiResponse) ? rawApiResponse.length : 'N/A'
        },
        cache: {
          calles: localStorage.getItem('calles_cache') ? 'Presente' : 'Ausente',
          tiposVia: localStorage.getItem('tipos_via_cache') ? 'Presente' : 'Ausente'
        },
        navegador: {
          userAgent: navigator.userAgent.substring(0, 100) + '...',
          online: navigator.onLine
        }
      };
      
      setDebugInfo(debug);
      console.log('🔧 [CallePage] Debug info completo:', debug);
      
    } catch (err) {
      console.error('❌ [CallePage] Error generando debug:', err);
      setDebugInfo({ error: 'Error generando información de debug: ' + (err as Error).message });
    }
  };

  // Test directo de normalización
  const handleTestNormalization = async () => {
    showMessage("Probando normalización de datos...");
    
    try {
      const response = await fetch('http://localhost:8080/api/via', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('🧪 [CallePage] Datos crudos de API:', rawData);
        
        if (Array.isArray(rawData) && rawData.length > 0) {
          const firstItem = rawData[0];
          console.log('🧪 [CallePage] Primer elemento:', firstItem);
          console.log('🧪 [CallePage] Campos disponibles:', Object.keys(firstItem));
          console.log('🧪 [CallePage] nombreVia:', firstItem.nombreVia);
          console.log('🧪 [CallePage] tipoVia:', firstItem.tipoVia);
          console.log('🧪 [CallePage] descripTipoVia:', firstItem.descripTipoVia);
          
          showMessage(`✅ Test completado. Primer elemento: ${firstItem.nombreVia || firstItem.nombre || 'Sin nombre'}`);
        } else {
          showMessage(`❌ API no devolvió array válido`, true);
        }
      } else {
        showMessage(`❌ Error ${response.status}: ${response.statusText}`, true);
      }
    } catch (error: any) {
      showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
  };

  // NUEVO: Test específico para tipos de vía
  const handleTestTiposVia = async () => {
    showMessage("Probando carga de tipos de vía...");
    
    try {
      await cargarTiposVia();
      
      const tiposUnicos = [...new Set(calles.map(c => c.tipoVia))];
      const mensaje = `✅ Tipos de vía recargados. Disponibles: ${tiposVia.length}, Únicos en calles: ${tiposUnicos.length}`;
      
      showMessage(mensaje);
      console.log('🧪 [CallePage] Tipos de vía disponibles:', tiposVia);
      console.log('🧪 [CallePage] Tipos únicos en calles:', tiposUnicos);
    } catch (error: any) {
      showMessage(`❌ Error al cargar tipos de vía: ${error.message}`, true);
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
    } catch (error: any) {
      showMessage("❌ Error al forzar recarga: " + error.message, true);
    }
  };

  // Limpiar cache
  const handleClearCache = () => {
    localStorage.removeItem('calles_cache');
    localStorage.removeItem('tipos_via_cache');
    showMessage("🧹 Cache limpiado (calles y tipos de vía)");
  };

  return (
    <MainLayout title="Mantenimiento de Calles">
      <div className="space-y-4">
        {/* Header con botones de debug MEJORADOS */}
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
              onClick={handleTestNormalization}
              className="text-green-600 hover:text-green-800 flex items-center text-sm px-2 py-1 rounded border border-green-200 hover:bg-green-50"
              disabled={loading}
            >
              🔬 Test Norm.
            </button>
            
            {/* NUEVO botón para test de tipos de vía */}
            <button 
              onClick={handleTestTiposVia}
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50"
              disabled={loading || loadingTiposVia}
            >
              🎨 Tipos Vía
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
              🧹 Cache
            </button>
            
            <button 
              onClick={() => {
                setShowDebug(!showDebug);
                if (!showDebug) handleDebugInfo();
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
              disabled={loading}
            >
              🔧 {showDebug ? 'Ocultar' : 'Debug'}
            </button>
          </div>
        </div>

        {/* Panel de debug MEJORADO */}
        {showDebug && debugInfo && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-green-300 font-bold">🔧 DEBUG - CALLES & TIPOS DE VÍA</h3>
              <button 
                onClick={handleDebugInfo}
                className="text-green-300 hover:text-green-200 px-2 py-1 rounded border border-green-600"
                disabled={loading}
              >
                Actualizar
              </button>
            </div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
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
                disabled={loading}
              >
                Reconectar
              </button>
            </div>
          </div>
        )}

        {/* NUEVA alerta para tipos de vía */}
        {tiposVia.length < 3 && !loadingTiposVia && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">⚠️ Pocos tipos de vía:</span>
                <span className="ml-1">Solo {tiposVia.length} tipos disponibles. Esto puede limitar las opciones.</span>
              </div>
              <button 
                onClick={handleTestTiposVia}
                className="px-3 py-1 bg-amber-200 text-amber-800 rounded hover:bg-amber-300"
                disabled={loadingTiposVia}
              >
                Recargar tipos
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

        {/* Formulario de calles CON INTEGRACIÓN DE TIPOS DE VÍA */}
        <CalleForm
          calleSeleccionada={calleSeleccionada}
          tiposVia={tiposVia}
          loadingTiposVia={loadingTiposVia}
          onCargarTiposVia={cargarTiposVia}
          onGuardar={async (data) => {
            try {
              await guardarCalle(data);
              showMessage(modoEdicion 
                ? "✅ Calle actualizada correctamente" 
                : "✅ Calle creada correctamente");
            } catch (error: any) {
              showMessage("❌ Error al guardar: " + error.message, true);
            }
          }}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />

        {/* Lista de calles */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando calles...</span>
          </div>
        ) : (
          <>
            <CalleList
              calles={calles}
              onSelectCalle={seleccionarCalle}
              onSearch={buscarCalles}
              searchTerm={searchTerm}
              loading={loading}
              onDeleteCalle={eliminarCalle}
            />
            
            {/* Información adicional con tipos de vía */}
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="font-medium">Total calles:</span>
                  <span className="ml-2">{calles.length}</span>
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
                  <span className="font-medium">Seleccionada:</span>
                  <span className="ml-2">{calleSeleccionada?.nombre || 'Ninguna'}</span>
                </div>
                <div>
                  <span className="font-medium">Búsqueda:</span>
                  <span className="ml-2">{searchTerm || 'Sin filtro'}</span>
                </div>
              </div>
              
              {/* Info adicional de tipos de vía */}
              {tiposVia.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    🎨 Tipos disponibles: {tiposVia.map(t => t.label).join(', ')}
                  </div>
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && calles.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    🔧 Primera calle: {calles[0]?.nombre} ({calles[0]?.tipoVia})
                    {loadingTiposVia && <span className="ml-2 text-blue-600">⏳ Cargando tipos...</span>}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CallePage;