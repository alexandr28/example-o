import React, { useState, useMemo } from "react";
import { MainLayout } from "../../layout";
import { SectorList, SectorForm, Breadcrumb } from "../../components";
import { BreadcrumbItem } from "../../components/utils/Breadcrumb";
import { useSectores } from "../../hooks";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material';

// Interface para TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sector-tabpanel-${index}`}
      aria-labelledby={`sector-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const SectoresPage: React.FC = () => {
  const theme = useTheme();
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
  const [tabValue, setTabValue] = useState(0);

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

  // Manejar cambio de tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (sectorSeleccionado) {
      setModoEdicion(true);
      setTabValue(0); // Cambiar al tab de formulario al editar
    } else {
      showMessage("⚠️ Por favor, seleccione un sector para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: { nombre: string }) => {
    try {
      await guardarSector(data);
      showMessage(
        modoEdicion
          ? "✅ Sector actualizado correctamente"
          : "✅ Sector creado correctamente"
      );
      setTabValue(1); // Cambiar al tab de lista después de guardar
    } catch (error: unknown) {
      let errorMessage = "Error al guardar sector";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      showMessage(errorMessage, 3000);
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
      <Box sx={{ p: 3 }}>
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

        {/* Header con breadcrumb */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumb items={breadcrumbItems} />
          <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
            Gestión de Sectores
          </Typography>
        </Box>

        {/* Alerta de modo offline */}
        {isOfflineMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative mb-4">
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Contenedor principal con tabs */}
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header con tabs */}
          <Box sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="sector tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  '&.Mui-selected': {
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab 
                icon={<AddIcon />} 
                iconPosition="start"
                label={modoEdicion ? 'Editar Sector' : 'Nuevo Sector'}
                id="sector-tab-0"
                aria-controls="sector-tabpanel-0"
              />
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start"
                label="Lista de Sectores" 
                id="sector-tab-1"
                aria-controls="sector-tabpanel-1"
              />
            </Tabs>
          </Box>

          {/* Panel de Formulario */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <SectorForm
                sectorSeleccionado={sectorSeleccionado}
                onGuardar={handleGuardar}
                onNuevo={limpiarSeleccion}
                onEditar={handleEditar}
                modoOffline={isOfflineMode}
                loading={loading}
                isEditMode={modoEdicion}
              />
            </Box>
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <SectorList
                sectores={sectores}
                onSelectSector={seleccionarSector}
                onEdit={handleEditar}
                isOfflineMode={isOfflineMode}
                loading={loading}
                onSearch={buscarSectores}
                searchTerm={searchTerm}
                selectedSector={sectorSeleccionado}
              />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default SectoresPage;