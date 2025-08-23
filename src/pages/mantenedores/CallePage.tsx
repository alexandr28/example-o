// src/pages/mantenedores/CallesPage.tsx - Versión con Material-UI y Tabs
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Alert,
  AlertTitle,
  Typography,
  LinearProgress,
  Collapse,
  Button,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Clear as ClearIcon,
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks/useCalles';
import { CalleFormData } from '../../models/Calle';
import { CreateCalleDTO } from '../../services/calleApiService';
import CalleFormMUI from '../../components/calles/CalleForm';
import CalleListMUI from '../../components/calles/CalleList';

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
      id={`calle-tabpanel-${index}`}
      aria-labelledby={`calle-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const CallePage: React.FC = () => {
  const theme = useTheme();
  const {
    // Estados principales
    calles,
    calleSeleccionada,
    modoEdicion,
    loading,
    error,
    searchTerm,
    
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
    
    // Funciones adicionales
    cargarSectores,
    cargarBarrios,
    cargarTiposVia,
    filtrarBarriosPorSector,
    obtenerNombreSector,
    obtenerNombreBarrio,
  } = useCalles();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

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

  // Manejar cambio de tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (calleSeleccionada) {
      setModoEdicion(true);
      setTabValue(0); // Cambiar al tab de formulario al editar
    } else {
      showMessage("⚠️ Por favor, seleccione una calle para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: CalleFormData) => {
    try {
      console.log('💾 [CallesPage] Iniciando guardado:', data);
      
      // Validaciones
      if (!data.codSector || data.codSector <= 0) {
        throw new Error('Debe seleccionar un sector válido');
      }
      
      if (!data.codBarrio || data.codBarrio <= 0) {
        throw new Error('Debe seleccionar un barrio válido');
      }
      
      if (!data.tipoVia || data.tipoVia <= 0) {
        throw new Error('Debe seleccionar un tipo de vía');
      }
      
      if (!data.nombreCalle || data.nombreCalle.trim().length < 2) {
        throw new Error('El nombre de la calle debe tener al menos 2 caracteres');
      }
      
      // Convertir CalleFormData al formato esperado por guardarCalle (CreateCalleDTO)
      const calleData = {
        codTipoVia: data.tipoVia,
        nombreVia: data.nombreCalle.trim(),
        codSector: data.codSector,
        codBarrio: data.codBarrio
      };
      
      await guardarCalle(calleData);
      showMessage(modoEdicion 
        ? "✅ Calle actualizada correctamente" 
        : "✅ Calle creada correctamente");
      
      setTabValue(1); // Cambiar al tab de lista después de guardar
      await cargarCalles();
    } catch (error: any) {
      console.error('❌ [CallesPage] Error al guardar:', error);
      showMessage(`❌ Error al guardar: ${error.message}`);
    }
  };

  // Manejo de eliminación
  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta calle?')) {
      return;
    }
    
    try {
      await eliminarCalle(id);
      showMessage("✅ Calle eliminada correctamente");
      await cargarCalles();
    } catch (error: any) {
      showMessage(`❌ Error al eliminar: ${error.message}`);
    }
  };

  // Recargar barrios
  const handleReloadBarrios = async () => {
    showMessage("🔄 Recargando barrios...");
    
    try {
      await cargarBarrios();
      showMessage("✅ Barrios recargados");
    } catch (error: any) {
      showMessage(`❌ Error al recargar barrios: ${error.message}`);
    }
  };

  // Recargar sectores
  const handleReloadSectores = async () => {
    showMessage("🔄 Recargando sectores...");
    
    try {
      await cargarSectores();
      showMessage("✅ Sectores recargados");
    } catch (error: any) {
      showMessage(`❌ Error al recargar sectores: ${error.message}`);
    }
  };

  // Determinar tipo de alerta según el contenido del mensaje
  const getAlertSeverity = (message: string) => {
    if (message.includes('✅')) return 'success';
    if (message.includes('❌')) return 'error';
    if (message.includes('⚠️')) return 'warning';
    return 'info';
  };

  return (
    <MainLayout title="Mantenimiento de Calles">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Progress bar */}
        {(loading || loadingSectores || loadingBarrios || loadingTiposVia) && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Mensajes de alerta */}
        <Collapse in={!!successMessage}>
          <Alert 
            severity={getAlertSeverity(successMessage || '')} 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        </Collapse>

        {/* Alerta de sectores */}
        {sectores.length === 0 && !loadingSectores && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleReloadSectores}
                disabled={loadingSectores}
              >
                Cargar sectores
              </Button>
            }
          >
            <AlertTitle>Sin sectores disponibles</AlertTitle>
            No se pueden crear calles sin sectores.
          </Alert>
        )}

        {/* Alerta de barrios */}
        {barrios.length === 0 && !loadingBarrios && sectores.length > 0 && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleReloadBarrios}
                disabled={loadingBarrios}
              >
                Cargar barrios
              </Button>
            }
          >
            <AlertTitle>Sin barrios disponibles</AlertTitle>
            Debe cargar barrios para continuar.
          </Alert>
        )}

        {/* Error general */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
              aria-label="calle tabs"
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
                label={modoEdicion ? 'Editar Calle' : 'Nueva Calle'}
                id="calle-tab-0"
                aria-controls="calle-tabpanel-0"
              />
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start"
                label="Lista de Calles" 
                id="calle-tab-1"
                aria-controls="calle-tabpanel-1"
              />
            </Tabs>
          </Box>

          {/* Panel de Formulario */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <CalleFormMUI
                onSubmit={handleGuardar}
                onCancel={limpiarSeleccion}
                onNew={limpiarSeleccion}
                onEdit={handleEditar}
                initialData={calleSeleccionada ? {
                  tipoVia: Number(calleSeleccionada.codTipoVia) || 0,
                  codSector: 0, // El sector no viene en CalleData, se manejará por separado
                  codBarrio: calleSeleccionada.codBarrio || 0,
                  nombreCalle: calleSeleccionada.nombreVia || ''
                } : undefined}
                isSubmitting={loading}
              />
            </Box>
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <CalleListMUI
                calles={calles}
                onSelectCalle={seleccionarCalle}
                onEliminar={handleEliminar}
                loading={loading}
                onSearch={buscarCalles}
                searchTerm={searchTerm}
                obtenerNombreSector={obtenerNombreSector}
                obtenerNombreBarrio={obtenerNombreBarrio}
              />
            </Box>
          </TabPanel>
        </Paper>

      </Box>
    </MainLayout>
  );
};

export default CallePage;