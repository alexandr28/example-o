import React, { useState, useMemo } from "react";
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

  // Manejo de guardado
  const handleGuardar = async (data: { nombre: string }) => {
    try {
      await guardarSector(data);
      // showMessage(
      //   modoEdicion
      //     ? "✅ Sector actualizado correctamente"
      //     : "✅ Sector creado correctamente"
      // );
    } catch (error: unknown) {
      let errorMessage = "Error al guardar sector";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      showMessage(errorMessage, 3000); // Cambiado "error" por 3000
    }
  };

  // Forzar recarga
  const handleForceReload = async () => {
    showMessage("🔄 Forzando recarga desde API...");

    try {
      await forzarModoOnline();
      showMessage("✅ Datos recargados desde API");
    } catch (error: unknown) {
      let errorMessage = "❌ Error al forzar recarga";
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        errorMessage += `: ${(error as { message: string }).message}`;
      }
      showMessage(errorMessage);
    }
  };


  return (
    <MainLayout title="Mantenimiento de Sectores">
      {/* Contenedor principal con padding fijo de 10px */}
      <div style={{ padding: 20, boxSizing: 'border-box' }}>
        {/* Toast flotante en la parte inferior derecha */}
        {successMessage && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 9999,
              minWidth: 280,
              maxWidth: 400,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              pointerEvents: "auto",
            }}
            className={`border px-4 py-3 rounded ${
              successMessage.includes("❌")
                ? "bg-red-50 border-red-200 text-red-800"
                : successMessage.includes("⚠️")
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        <div className="space-y-0">
          {/* Header con botones de acciones */}
          <div className="flex justify-between items-center">
            <Breadcrumb items={breadcrumbItems} />
          </div>

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

          {/* Layout en dos columnas: formulario a la izquierda, tabla a la derecha */}
          <div className="flex flex-col md:flex-row gap-5">
            <div className="w-full md:w-1/3">
              <SectorForm
                sectorSeleccionado={sectorSeleccionado}
                onGuardar={handleGuardar}
                onNuevo={limpiarSeleccion}
                onEditar={handleEditar}
                modoOffline={isOfflineMode}
                loading={loading}
                isEditMode={modoEdicion}
              />
            </div>
            <div className="w-full md:w-2/3">
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