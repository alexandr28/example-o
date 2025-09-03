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
  Typography,
  Alert,
  AlertTitle,
  Button,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Business as BusinessIcon,
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Error as ErrorIcon
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

  // Manejo de edición - versión mejorada que recibe el sector como parámetro
  const handleEditar = (sector?: any) => {
    // Si se pasa un sector como parámetro (desde la lista), usarlo directamente
    if (sector) {
      seleccionarSector(sector);
      setModoEdicion(true);
      setTabValue(0); // Cambiar al tab de formulario al editar
    } 
    // Si no se pasa parámetro, verificar si hay uno seleccionado (para otras funciones)
    else if (sectorSeleccionado) {
      setModoEdicion(true);
      setTabValue(0); // Cambiar al tab de formulario al editar
    } 
    // Solo mostrar el mensaje si no hay sector seleccionado Y no se pasó uno como parámetro
    else {
      showMessage("⚠️ Por favor, seleccione un sector para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: { nombre: string; cuadrante?: number; descripcion?: string }) => {
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
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Toast flotante en la parte inferior derecha */}
        {successMessage && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 9999,
              minWidth: 200,
              maxWidth: 350,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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

        {/* Header mejorado con Material UI */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2
          }}
        >
          <Breadcrumb items={breadcrumbItems} />
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 3 },
            mt: 2
          }}>
            {/* Icono principal */}
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <BusinessIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Box>
            
            {/* Título y descripción */}
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.dark,
                  mb: 0.5
                }}
              >
                Gestión de Sectores
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Administra los sectores geográficos del sistema tributario
              </Typography>
            </Box>
            
            {/* Estadísticas */}
            <Stack 
              direction="row" 
              spacing={2}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
             
            
            </Stack>
          </Box>
        </Paper>

        {/* Alertas con Material UI */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          {isOfflineMode && (
            <Alert 
              severity="warning" 
              icon={<WifiOffIcon />}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleForceReload}
                  disabled={loading}
                  sx={{ fontWeight: 600 }}
                >
                  Reconectar
                </Button>
              }
              sx={{ 
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  fontSize: 24
                }
              }}
            >
              <AlertTitle sx={{ fontWeight: 600 }}>Modo sin conexión</AlertTitle>
              Trabajando con datos almacenados localmente. Los cambios se sincronizarán cuando se restablezca la conexión.
            </Alert>
          )}

      
        </Stack>

        {/* Contenedor principal con tabs */}
        <Box sx={{ 
          maxWidth: { xs: '100%', sm: '100%', md: '90%', lg: '900px' }, 
          mx: 'auto' 
        }}>
          <Paper 
            elevation={0}
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
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                  px: { xs: 1, sm: 2, md: 3 },
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
          
              <SectorForm
                sectorSeleccionado={sectorSeleccionado}
                onGuardar={handleGuardar}
                onNuevo={limpiarSeleccion}
                onEditar={handleEditar}
                modoOffline={isOfflineMode}
                loading={loading}
                isEditMode={modoEdicion}
              />
        
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
            
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
         
          </TabPanel>
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default SectoresPage;