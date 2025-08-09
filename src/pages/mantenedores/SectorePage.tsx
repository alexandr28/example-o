// src/pages/mantenedores/SectoresPage.tsx - VERSIÓN CORREGIDA COMPLETA
import React, { useState, useMemo, useEffect } from "react";
import { MainLayout } from "../../layout";
import { SectorList, SectorForm, Breadcrumb } from "../../components";
import { BreadcrumbItem } from "../../components/utils/Breadcrumb";
import { useSectores } from "../../hooks";

const SectoresPage: React.FC = () => {
  const {
    sectores,
    sectorSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    buscarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    setModoEdicion,
    forzarModoOnline,
  } = useSectores();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Mantenedores", path: "/mantenedores" },
      { label: "Sectores", active: true },
    ],
    []
  );

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

  // IMPORTANTE: Esta es la función que debe pasarse como 'onGuardar' al formulario
  const handleGuardar = async (data: { nombre: string }) => {
    try {
      console.log('📝 [SectoresPage] Llamando a guardarSector con:', data);
      const resultado = await guardarSector(data);
      
      if (resultado) {
        showMessage(
          modoEdicion
            ? "✅ Sector actualizado correctamente"
            : "✅ Sector creado correctamente"
        );
      }
    } catch (error: unknown) {
      console.error('❌ [SectoresPage] Error al guardar:', error);
      let errorMessage = "Error al guardar sector";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      showMessage(`❌ ${errorMessage}`, 5000);
    }
  };

  // Función para limpiar el formulario
  const handleNuevo = () => {
    console.log('🆕 [SectoresPage] Limpiando selección');
    limpiarSeleccion();
    setModoEdicion(false);
  };

  // Forzar recarga
  const handleForceReload = async () => {
    showMessage("🔄 Forzando recarga desde API...");

    try {
      await forzarModoOnline();
      showMessage("✅ Datos recargados desde API");
    } catch (error: unknown) {
      let errorMessage = "❌ Error al forzar recarga";
      if (error instanceof Error) {
        errorMessage = `❌ ${error.message}`;
      }
      showMessage(errorMessage, 5000);
    }
  };

  // Debug: Verificar que las funciones existen
  useEffect(() => {
    console.log('🔍 [SectoresPage] Props del formulario:', {
      handleGuardar: typeof handleGuardar,
      handleNuevo: typeof handleNuevo,
      handleEditar: typeof handleEditar,
      guardarSector: typeof guardarSector
    });
  }, []);

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        {/* Header con breadcrumb */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-2xl font-semibold text-gray-900 mt-2">
              Gestión de Sectores
            </h1>
          </div>
        </div>

        {/* Mensajes de estado */}
        {(error || successMessage || isOfflineMode) && (
          <div className="px-6 pt-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
                <span className="mr-2">❌</span>
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}
            {isOfflineMode && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md flex justify-between items-center">
                <span>🔌 Trabajando sin conexión. Los cambios se sincronizarán cuando se restablezca la conexión.</span>
                <button
                  onClick={handleForceReload}
                  className="text-sm underline hover:text-yellow-800"
                >
                  Forzar recarga
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Formulario */}
            <div className="lg:col-span-1">
              <SectorForm
                sectorSeleccionado={sectorSeleccionado}
                onGuardar={handleGuardar}  {/* IMPORTANTE: Usar onGuardar, NO guardarSector */}
                onNuevo={handleNuevo}
                onEditar={handleEditar}
                modoOffline={isOfflineMode}
                loading={loading}
                isEditMode={modoEdicion}
              />
            </div>

            {/* Lista de sectores */}
            <div className="lg:col-span-2">
              <SectorList
                sectores={sectores}
                onSelectSector={seleccionarSector}
                isOfflineMode={isOfflineMode}
                loading={loading}
                onSearch={buscarSectores}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SectoresPage;