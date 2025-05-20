import React, { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { CalleList, CalleForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks';
import ErrorBoundary from '../../components/utils/ErrorBoundary';
import CorsErrorMessage from '../../components/utils/CorsErrorMessage';

/**
 * Página para administrar las calles del sistema
 * 
 * Permite añadir, editar, eliminar y buscar calles
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

  // Cargar calles al montar el componente
  useEffect(() => {
    cargarCalles();
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

  // Manejar reintento de conexión y sincronización
  const handleSyncAndRetry = async () => {
    const result = await sincronizarCambios();
    setSuccessMessage(result.message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Manejar guardado
  const handleGuardarCalle = async (data: { tipoVia: string, nombre: string }) => {
    try {
      await guardarCalle(data);
      setSuccessMessage(modoEdicion 
        ? "Calle actualizada correctamente" 
        : "Calle creada correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error al guardar calle:", error);
    }
  };

  // Manejar búsqueda
  const handleBuscar = (term: string) => {
    buscarCalles(term);
  };

  return (
    <MainLayout title="Mantenimiento de Calles">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <div className="flex justify-between items-center">
          <Breadcrumb items={breadcrumbItems} />
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
              onClick={handleSyncAndRetry}
              className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {pendingChangesCount > 0 ? 'Sincronizar cambios' : 'Reintentar conexión'}
            </button>
          </div>
        )}
        
        {/* Alerta de cambios pendientes (cuando hay conexión pero hay cambios pendientes) */}
        {!isOfflineMode && pendingChangesCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative flex justify-between items-center" role="alert">
            <div>
              <span className="font-medium">Cambios pendientes:</span>
              <span className="ml-1">Hay {pendingChangesCount} {pendingChangesCount === 1 ? 'cambio pendiente' : 'cambios pendientes'} por sincronizar.</span>
            </div>
            <button 
              onClick={handleSyncAndRetry}
              className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Sincronizar ahora
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
          onGuardar={handleGuardarCalle}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />
        
        {/* Lista de calles */}
        <CalleList
          calles={calles}
          onSelectCalle={seleccionarCalle}
          onSearch={handleBuscar}
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