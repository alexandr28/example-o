// src/pages/mantenedores/CallePage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { CalleList, CalleForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks';
import ErrorBoundary from '../../components/utils/ErrorBoundary';
import CorsErrorMessage from '../../components/utils/CorsErrorMessage';

/**
 * Página para administrar las calles del sistema
 * Versión mejorada con mejor manejo de errores y estados
 */
const CallePageContent: React.FC = () => {
  // Usamos el hook personalizado para la gestión de calles
  const {
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    pendingChangesCount,
    cargarCalles,
    seleccionarCalle,
    limpiarSeleccion,
    guardarCalle,
    eliminarCalle,
    buscarCalles,
    sincronizarCambios,
    setModoEdicion,
  } = useCalles();

  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Cargar calles e iniciar debug cuando se monta el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🏁 Iniciando carga de datos en CallePage');
        await cargarCalles();
        
        // Imprimir información de debug después de cargar datos
        setTimeout(() => {
          console.log('📊 Estado después de cargar:');
          console.log('- Calles cargadas:', calles.length);
          console.log('- Primera calle:', calles[0]);
          console.log('- Modo offline:', isOfflineMode);
          console.log('- Error:', error);
          
          // Almacenar información de debug
          setDebugInfo(JSON.stringify({
            callesCount: calles.length,
            firstCalle: calles[0],
            isOfflineMode,
            error,
            timestamp: new Date().toISOString()
          }, null, 2));
        }, 1000);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
      }
    };
    
    loadData();
  }, [cargarCalles]);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Calles', active: true }
  ], []);

  // Manejo de edición
  const handleEditar = () => {
    if (calleSeleccionada) {
      setModoEdicion(true);
    } else {
      setSuccessMessage("Por favor, seleccione una calle para editar");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Botón para forzar recarga de datos
  const handleForceReload = async () => {
    setSuccessMessage("Recargando datos...");
    await cargarCalles();
    setSuccessMessage("Datos recargados");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Cargar datos de ejemplo
  const handleLoadSampleData = () => {
    // Datos de ejemplo
    const sampleData = [
      { id: 1, tipoVia: 'avenida', nombre: 'Gran Chimú' },
      { id: 2, tipoVia: 'calle', nombre: 'Los Álamos' },
      { id: 3, tipoVia: 'jiron', nombre: 'Carabobo' },
      { id: 4, tipoVia: 'avenida', nombre: 'España' },
      { id: 5, tipoVia: 'calle', nombre: 'San Martín' },
    ];
    
    // Actualizar localStorage con datos de ejemplo
    localStorage.setItem('calles_cache', JSON.stringify(sampleData));
    
    // Recargar desde la nueva caché
    cargarCalles();
    
    setSuccessMessage("Datos de ejemplo cargados correctamente");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <MainLayout title="Mantenimiento de Calles">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <div className="flex justify-between items-center">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex space-x-2">
            <button 
              onClick={handleForceReload}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar
            </button>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ayuda
            </button>
          </div>
        </div>
        
        {/* Mensaje de error si no hay calles cargadas */}
        {calles.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative flex justify-between">
            <div>
              <span className="font-medium">No hay calles para mostrar.</span>
              <span className="ml-2">Puede deberse a un problema de conexión o a que no hay datos disponibles.</span>
            </div>
            <button
              onClick={handleLoadSampleData}
              className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300"
            >
              Cargar datos de ejemplo
            </button>
          </div>
        )}
        
        {/* Mensaje de error CORS si estamos en modo offline */}
        {isOfflineMode && error && error.includes('CORS') && (
          <CorsErrorMessage onReload={cargarCalles} />
        )}
        
        {/* Panel de ayuda */}
        {showHelp && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
            <h3 className="font-medium mb-1">Acerca de este módulo</h3>
            <p className="text-sm mb-2">Este módulo te permite administrar las calles del sistema. Puedes:</p>
            <ul className="list-disc list-inside text-sm space-y-1 mb-2">
              <li>Crear nuevas calles seleccionando un tipo de vía e ingresando un nombre</li>
              <li>Editar calles existentes seleccionándolas de la lista</li>
              <li>Eliminar calles haciendo clic en el icono de eliminar</li>
              <li>Buscar calles por nombre o tipo de vía</li>
            </ul>
            <p className="text-sm">
              <strong>Nota:</strong> Este módulo se conecta a la API en http://localhost:8080/api/via.
              También funciona sin conexión guardando cambios localmente para sincronizar posteriormente.
            </p>
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 text-blue-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Información de debug */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4">
                <button
                  onClick={() => setDebugInfo(prev => prev ? null : JSON.stringify({
                    callesCount: calles.length,
                    calles: calles.slice(0, 3),
                    isOfflineMode,
                    error,
                    timestamp: new Date().toISOString()
                  }, null, 2))}
                  className="text-sm underline"
                >
                  {debugInfo ? 'Ocultar' : 'Mostrar'} información de debug
                </button>
                
                {debugInfo && (
                  <pre className="mt-2 p-2 bg-white text-blue-900 text-xs overflow-auto max-h-40 rounded">
                    {debugInfo}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        {/* Alerta de modo sin conexión */}
        {isOfflineMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative flex justify-between items-center" role="alert">
            <div>
              <span className="font-medium">Modo sin conexión:</span>
              <span className="ml-1">Trabajando con datos locales. Los cambios se guardarán cuando se restaure la conexión.</span>
              {pendingChangesCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                  {pendingChangesCount} {pendingChangesCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
                </span>
              )}
            </div>
            <button 
              onClick={cargarCalles}
              className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Reintentar conexión
            </button>
          </div>
        )}
        
        {/* Mensajes de error, si hay */}
        {error && !error.includes('CORS') && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Formulario de calles */}
        <CalleForm
          calleSeleccionada={calleSeleccionada}
          onGuardar={guardarCalle}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />
        
        {/* Lista de calles */}
        <CalleList
          calles={calles}
          onSelectCalle={seleccionarCalle}
          onSearch={buscarCalles}
          searchTerm={searchTerm}
          loading={loading}
          onDeleteCalle={eliminarCalle}
        />
      </div>
    </MainLayout>
  );
};

// Envolvemos el componente con el Error Boundary
const CallePage: React.FC = () => (
  <ErrorBoundary>
    <CallePageContent />
  </ErrorBoundary>
);

export default CallePage;