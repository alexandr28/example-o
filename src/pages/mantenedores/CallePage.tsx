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
  alpha,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Route as RouteIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks/useCalles';
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
    obtenerNombreSector,
    obtenerNombreBarrio,
    obtenerCodigoSector,
    actualizarSector,
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
    // Si volvemos al tab del formulario sin una calle seleccionada, limpiar
    if (newValue === 0 && !calleSeleccionada) {
      limpiarSeleccion();
    }
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

  // Manejo de edición desde la lista
  const handleEditarDesdeList = (calle: any) => {
    console.log('📝 [CallePage] Editando desde lista:', calle);
    
    // Enriquecer la calle con datos del sector si no los tiene
    const calleEnriquecida = {
      ...calle,
      codSector: calle.codSector || obtenerCodigoSector(calle.codBarrio)
    };
    
    console.log('📝 [CallePage] Calle enriquecida con sector:', calleEnriquecida);
    
    seleccionarCalle(calleEnriquecida);
    setModoEdicion(true);
    setTabValue(0); // Cambiar al tab de formulario al editar
  };

  // Manejo de guardado
  const handleGuardar = async (data: any) => {
    try {
      console.log('💾 [CallesPage] Iniciando guardado:', data);
      
      // Normalizar los datos recibidos (pueden venir en diferentes formatos)
      const codSector = data.codSector || data.sectorId;
      const codBarrio = data.codBarrio || data.barrioId;
      const tipoVia = data.codTipoVia || data.tipoVia;
      const nombreCalle = data.nombreCalle || data.nombreVia || data.nombre;
      
      // Validaciones
      if (!codSector || codSector <= 0) {
        throw new Error('Debe seleccionar un sector válido');
      }
      
      if (!codBarrio || codBarrio <= 0) {
        throw new Error('Debe seleccionar un barrio válido');
      }
      
      if (!tipoVia || Number(tipoVia) <= 0) {
        throw new Error('Debe seleccionar un tipo de vía');
      }
      
      if (!nombreCalle || nombreCalle.trim().length < 3) {
        throw new Error('El nombre de la calle debe tener al menos 3 caracteres');
      }
      
      // Convertir al formato esperado por guardarCalle (CreateCalleDTO)
      const calleData = {
        codTipoVia: Number(tipoVia),
        nombreVia: nombreCalle.trim(),
        codSector: Number(codSector),
        codBarrio: Number(codBarrio)
      };
      
      await guardarCalle(calleData);
      showMessage(modoEdicion 
        ? "✅ Calle actualizada correctamente" 
        : "✅ Calle creada correctamente");
      
      limpiarSeleccion(); // Limpiar el formulario después de guardar
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

  // Manejo del botón Nuevo (limpiar selección)
  const handleNuevo = () => {
    console.log('📝 [CallePage] Ejecutando handleNuevo');
    limpiarSeleccion();
    setModoEdicion(false);
    setTabValue(0); // Ir al tab de formulario
    showMessage("📝 Nuevo formulario listo");
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
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
              <RouteIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                Gestión de Calles
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Administra las calles y vías del sistema tributario municipal
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
        <Box sx={{ 
          maxWidth: { xs: '100%', sm: '100%', md: '90%', lg: '100%' }, 
          mx: 'auto' 
        }}>
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
         
              <CalleFormMUI
                onSubmit={handleGuardar}
                onNew={limpiarSeleccion}
                onDelete={calleSeleccionada ? () => handleEliminar(calleSeleccionada.codVia) : undefined}
                onUpdateSector={actualizarSector}
                initialData={calleSeleccionada ? {
                  tipoVia: Number(calleSeleccionada.codTipoVia) || 0,
                  codSector: calleSeleccionada.codSector || 0, // Usar codSector de la calle
                  codBarrio: calleSeleccionada.codBarrio || 0,
                  nombreCalle: calleSeleccionada.nombreVia || ''
                } : undefined}
                isSubmitting={loading}
              />
          
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
           
              <CalleListMUI
                calles={calles}
                onSelectCalle={handleEditarDesdeList}
                loading={loading}
                onSearch={buscarCalles}
                searchTerm={searchTerm}
                obtenerNombreSector={obtenerNombreSector}
                obtenerNombreBarrio={obtenerNombreBarrio}
                onNuevaCalle={handleNuevo}
              />
         
          </TabPanel>
          </Paper>
        </Box>

      </Box>
    </MainLayout>
  );
};

export default CallePage;