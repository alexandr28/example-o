import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { SectorList, SectorForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useSectores } from '../../hooks';
import ErrorBoundary from '../../components/utils/ErrorBoundary';
import CorsErrorMessage from '../../components/utils/CorsErrorMessage';

/**
 * Página para administrar los sectores del sistema
 * 
 * Permite añadir, editar, eliminar y buscar sectores
 */
const SectoresPageContent: React.FC = () => {
  // Usamos el hook personalizado para la gestión de sectores
  const {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    hasPendingChanges,
    pendingChangesCount,
    cargarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    sincronizarManualmente
  } = useSectores();

  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Cargar sectores al montar el componente
  useEffect(() => {
    const loadSectores = async () => {
      try {
        await cargarSectores();
      } catch (err) {
        console.error("Error al cargar sectores:", err);
      }
    };
    
    loadSectores();
  }, [cargarSectores]);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Sectores', active: true }
  ], []);

  // Manejo de edición
  const handleEditar = () => {
    if (sectorSeleccionado) {
      setModoEdicion(true);
    }
  };

  // Manejar reintento de conexión y sincronización
  const handleSyncAndRetry = () => {
    sincronizarManualmente();
  };

  // Manejar guardado
   // Manejar guardado
  const handleGuardarSector = async (data: { nombre: string }) => {
    try {
      await guardarSector(data);
      setSuccessMessage(modoEdicion 
        ? "Sector actualizado correctamente" 
        : "Sector creado correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error al guardar sector:", error);
    }
  };
  return (
    <MainLayout title="Mantenimiento de Sectores">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <div className="flex justify-between items-center"></div>
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
          {/* Mensaje de error CORS si estamos en modo offline */}
        {isOfflineMode && error && error.includes('fetch') && (
          <CorsErrorMessage onReload={sincronizarManualmente} />
        )}
         {/* Panel de ayuda */}
        {showHelp && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
            <h3 className="font-medium mb-1">Acerca de este módulo</h3>
            <p className="text-sm mb-2">Este módulo te permite administrar los sectores del sistema. Puedes:</p>
            <ul className="list-disc list-inside text-sm space-y-1 mb-2">
              <li>Crear nuevos sectores ingresando un nombre y haciendo clic en "Guardar"</li>
              <li>Editar sectores existentes seleccionándolos de la lista</li>
              <li>Eliminar sectores haciendo clic en el icono de eliminar</li>
            </ul>
            <p className="text-sm">
              <strong>Nota:</strong> Este módulo funciona correctamente incluso sin conexión a internet.
              Los cambios se guardarán localmente y se sincronizarán cuando la conexión esté disponible.
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
              {hasPendingChanges && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                  {pendingChangesCount} {pendingChangesCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
                </span>
              )}
            </div>
            <button 
              onClick={handleSyncAndRetry}
              className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {hasPendingChanges ? 'Sincronizar y reintentar' : 'Reintentar conexión'}
            </button>
          </div>
        )}
        
        {/* Alerta de cambios pendientes (cuando hay conexión pero hay cambios pendientes) */}
        {!isOfflineMode && hasPendingChanges && (
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Formulario de sectores */}
        <SectorForm
          sectorSeleccionado={sectorSeleccionado}
          onGuardar={handleGuardarSector}
          onNuevo={limpiarSeleccion}
          onEditar={handleEditar}
          loading={loading}
        />
        
        {/* Lista de sectores con indicador de carga */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <SectorList
            sectores={sectores}
            onSelectSector={seleccionarSector}
            isOfflineMode={isOfflineMode}
            onEliminar={eliminarSector}
          />
        )}
      </div>
    </MainLayout>
  );
};

// Envolvemos el componente con el Error Boundary
const SectoresPage: React.FC = () => (
  <ErrorBoundary>
    <SectoresPageContent />
  </ErrorBoundary>
);

export default SectoresPage;