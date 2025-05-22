// src/pages/mantenedores/SectoresPage.tsx - VERSIÓN COMPLETA CON MEJORAS
import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../../layout';
import { SectorList, SectorForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useSectores } from '../../hooks';
import ErrorBoundary from '../../components/utils/ErrorBoundary';
import CorsErrorMessage from '../../components/utils/CorsErrorMessage';
import AuthRequiredModal from '../../components/auth/AuthRequiredModal';

/**
 * Página para administrar los sectores del sistema
 * Versión mejorada con detección de conectividad corregida y forzar modo online
 */
const SectoresPageContent: React.FC = () => {
  // Hook de sectores con todas las funcionalidades
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
    sincronizarManualmente,
    forzarModoOnline, // Nueva función para forzar modo online
    testApiConnection, // Para debugging
  } = useSectores();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [dataValidationError, setDataValidationError] = useState<string | null>(null);  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  // Verificar si tenemos datos reales (no genéricos)
  const tienesDatosReales = useMemo(() => {
    return sectores.some(sector => 
      sector.nombre && 
      !sector.nombre.match(/^Sector \d+$/) && // No es "Sector 1", "Sector 2", etc.
      sector.nombre.length > 5 &&
      !sector.nombre.includes('(datos inválidos)')
    );
  }, [sectores]);

  // Verificar la validez de los datos cargados
  useEffect(() => {
    if (sectores && sectores.length > 0) {
      try {
        const sectoresInvalidos = sectores.filter(sector => 
          !sector || typeof sector !== 'object' || !sector.nombre
        );
        
        if (sectoresInvalidos.length > 0) {
          console.warn('Se detectaron sectores con estructura inválida:', sectoresInvalidos);
          setDataValidationError(
            `Se detectaron ${sectoresInvalidos.length} sectores con datos incompletos. ` +
            'Esto puede causar problemas en la visualización.'
          );
        } else {
          setDataValidationError(null);
        }
      } catch (validationError) {
        console.error('Error al validar datos de sectores:', validationError);
        setDataValidationError('Error al validar la estructura de los datos recibidos.');
      }
    }
  }, [sectores]);

  // Cargar sectores al montar el componente
  useEffect(() => {
    const loadSectores = async () => {
      try {
        console.log('🚀 [SectoresPage] Iniciando carga de sectores...');
        await cargarSectores();
        console.log('✅ [SectoresPage] Sectores cargados:', sectores?.length || 0);
      } catch (err) {
        console.error("❌ [SectoresPage] Error al cargar sectores:", err);
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
    } else {
      setSuccessMessage("Por favor, seleccione un sector para editar");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Manejar reintento de conexión y sincronización
  const handleSyncAndRetry = async () => {
    setSuccessMessage("Intentando sincronizar datos...");
    await sincronizarManualmente();
    setSuccessMessage("Sincronización completada");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 🚀 NUEVA FUNCIÓN: Forzar modo online
  const handleForzarOnline = async () => {
    console.log('🔄 [SectoresPage] Forzando modo online desde UI...');
    setSuccessMessage("Forzando modo online...");
    
    try {
      if (forzarModoOnline) {
        await forzarModoOnline();
        setSuccessMessage("✅ Modo online activado - usando API real");
      } else {
        // Fallback si la función no está disponible
        await cargarSectores();
        setSuccessMessage("✅ Datos recargados desde API");
      }
    } catch (error) {
      console.error('❌ [SectoresPage] Error al forzar modo online:', error);
      setSuccessMessage("❌ Error al forzar modo online");
    }
    
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 🆕 NUEVA FUNCIÓN: Test manual de API
  const handleTestApi = async () => {
    setSuccessMessage("Probando conexión con API...");
    
    try {
      if (testApiConnection) {
        const isConnected = await testApiConnection();
        setSuccessMessage(isConnected 
          ? "✅ API conectada correctamente" 
          : "❌ API no responde o devuelve datos inválidos"
        );
      } else {
        setSuccessMessage("❌ Función de test no disponible");
      }
    } catch (error) {
      setSuccessMessage("❌ Error al probar API");
    }
    
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Manejar guardado con mejor manejo de errores
  const handleGuardarSector = async (data: { nombre: string }) => {
    try {
      // Validar que el nombre no esté vacío
      if (!data.nombre || data.nombre.trim() === '') {
        setSuccessMessage("❌ El nombre del sector no puede estar vacío");
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }
      
      await guardarSector(data);
      setSuccessMessage(modoEdicion 
        ? "✅ Sector actualizado correctamente" 
        : "✅ Sector creado correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("❌ [SectoresPage] Error al guardar sector:", error);
      
      // Verificar si es un error 403
      if (error.message && error.message.includes('403')) {
        // Mostrar modal de autenticación
        setAuthModalMessage('Necesitas iniciar sesión para guardar cambios en los sectores.');
        setShowAuthModal(true);
      } else {
        setSuccessMessage("❌ Error al guardar el sector. Intente nuevamente.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Manejar eliminación
  const handleEliminarSector = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este sector?')) {
      return;
    }

    try {
      await eliminarSector(id);
      setSuccessMessage("✅ Sector eliminado correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("❌ [SectoresPage] Error al eliminar sector:", error);
      setSuccessMessage("❌ Error al eliminar el sector. Intente nuevamente.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Procesar sectores para asegurar que son válidos
  const sectoresValidos = useMemo(() => {
    if (!sectores) return [];
    
    console.log('🔍 [SectoresPage] Procesando sectores para renderizado:', sectores);
    
    const procesados = sectores.map((sector, index) => {
      if (!sector || typeof sector !== 'object') {
        console.warn(`⚠️ [SectoresPage] Sector ${index} no es un objeto:`, sector);
        return null;
      }
      
      if (!sector.nombre) {
        console.warn(`⚠️ [SectoresPage] Sector ${index} no tiene nombre:`, sector);
        return null;
      }
      
      return sector;
    }).filter(Boolean);
    
    console.log('✅ [SectoresPage] Sectores válidos procesados:', procesados);
    
    return procesados;
  }, [sectores]);

  return (
    <MainLayout title="Mantenimiento de Sectores">
      <div className="space-y-4">
        {/* Navegación de migas de pan */}
        <div className="flex justify-between items-center">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex space-x-2">
            <button 
              onClick={handleTestApi}
              className="text-purple-600 hover:text-purple-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Test API
            </button>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ayuda
            </button>
          </div>
        </div>
        
        {/* Mensaje de error CORS si estamos en modo offline */}
        {isOfflineMode && error && error.includes('CORS') && (
          <CorsErrorMessage onReload={sincronizarManualmente} />
        )}
        
        {/* Mensaje de validación de datos si hay problemas con la estructura */}
        {dataValidationError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {dataValidationError}
                </p>
              </div>
            </div>
          </div>
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
            <div className="text-sm mb-2">
              <strong>Estado actual:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>Datos: {tienesDatosReales ? '✅ Reales de la API' : '⚠️ Genéricos/Mock'}</li>
                <li>Conexión: {isOfflineMode ? '❌ Offline' : '✅ Online'}</li>
                <li>Sectores cargados: {sectores.length}</li>
              </ul>
            </div>
            <p className="text-sm">
              <strong>Nota:</strong> Si tienes datos reales pero aparece como offline, usa el botón "Forzar Online".
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
          <div className={`border px-4 py-3 rounded relative ${
            successMessage.includes('❌') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`} role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        {/* 🚀 ALERTA MEJORADA DE MODO SIN CONEXIÓN */}
        {isOfflineMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative" role="alert">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <span className="font-medium">Modo sin conexión:</span>
                <span className="ml-1">
                  {tienesDatosReales 
                    ? '⚠️ Tienes datos reales pero está marcado como offline incorrectamente.' 
                    : 'Trabajando con datos locales. Los cambios se guardarán cuando se restaure la conexión.'}
                </span>
                {hasPendingChanges && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                    {pendingChangesCount} {pendingChangesCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
                  </span>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                {tienesDatosReales && (
                  <button 
                    onClick={handleForzarOnline}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm font-medium"
                  >
                    🚀 Forzar Online
                  </button>
                )}
                <button 
                  onClick={handleSyncAndRetry}
                  className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                >
                  {hasPendingChanges ? 'Sincronizar' : 'Reintentar'}
                </button>
              </div>
            </div>
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
        {error && !error.includes('CORS') && (
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
            sectores={sectoresValidos}
            onSelectSector={seleccionarSector}
            isOfflineMode={isOfflineMode}
            onEliminar={handleEliminarSector}
          />
        )}
        
        {/* Información de depuración si estamos en modo desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs font-mono overflow-auto max-h-40">
            <div className="font-semibold mb-2">🔧 Debug Info:</div>
            <div>📊 Sectores cargados: {sectores?.length || 0}</div>
            <div>✅ Sectores válidos: {sectoresValidos.length}</div>
            <div>🌐 Modo offline: {isOfflineMode ? 'Sí' : 'No'}</div>
            <div>📈 Datos reales: {tienesDatosReales ? 'Sí' : 'No'}</div>
            <div>🔄 Cambios pendientes: {pendingChangesCount}</div>
            <div>❌ Error: {error || 'Ninguno'}</div>
            <div>🎯 Primer sector: {sectores[0]?.nombre || 'N/A'}</div>
          </div>
        )}
      </div>
      
      {/* Modal de autenticación requerida */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authModalMessage}
      />
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