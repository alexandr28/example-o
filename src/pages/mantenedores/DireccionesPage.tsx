// src/pages/mantenedores/DireccionesPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  LinearProgress,
  Collapse,
  Button,
  Stack,
  Paper,
  Chip,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
  List as ListIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb, NotificationContainer } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDirecciones } from '../../hooks/useDirecciones';
import DireccionFormMUI from '../../components/direcciones/DireccionForm';
import DireccionListMUI from '../../components/direcciones/DireccionList';
import { NotificationService } from '../../components/utils/Notification';

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
      id={`direccion-tabpanel-${index}`}
      aria-labelledby={`direccion-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const DireccionesPage: React.FC = () => {
  const theme = useTheme();
  const {
    // Estados principales
    direcciones,
    direccionSeleccionada,
    loading,
    error,
    
    // Dependencias
    sectores,
    barrios,
    calles,
    barriosFiltrados,
    callesFiltradas,
    loadingSectores,
    loadingBarrios,
    loadingCalles,
    
    // Funciones principales
    cargarDirecciones,
    setDireccionSeleccionada,
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion,
    buscarPorNombreVia,
    
    // Handlers
    handleSectorChange,
    handleBarrioChange,
    
    // Funciones de carga
    cargarSectores,
    cargarBarrios,
    cargarCalles
  } = useDirecciones();

  // Estados locales
  const [modoEdicion, setModoEdicion] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Direcciones', active: true }
  ], []);

  // Función para mostrar mensaje temporal
  const showMessage = useCallback((message: string, type: 'success' | 'error' = 'success', duration = 3000) => {
    if (type === 'success') {
      setSuccessMessage(message);
      NotificationService.success(message);
    } else {
      NotificationService.error(message);
    }
    setTimeout(() => setSuccessMessage(null), duration);
  }, []);

  // Manejar cambio de tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejo de edición
  const handleEditar = useCallback(() => {
    if (direccionSeleccionada) {
      setModoEdicion(true);
      setTabValue(0); // Cambiar al tab de formulario al editar
      showMessage('Modo edición activado', 'success');
    }
  }, [direccionSeleccionada, showMessage]);

  // Manejo de nuevo
  const handleNuevo = useCallback(() => {
    setDireccionSeleccionada(null);
    setModoEdicion(false);
    setSuccessMessage(null);
  }, [setDireccionSeleccionada]);

  // Manejo de guardado
  const handleGuardar = useCallback(async (data: any) => {
    try {
      if (modoEdicion && direccionSeleccionada) {
        await actualizarDireccion(direccionSeleccionada.id, data);
        showMessage('✅ Dirección actualizada exitosamente', 'success');
      } else {
        await crearDireccion(data);
        showMessage('✅ Dirección creada exitosamente', 'success');
      }
      
      setModoEdicion(false);
      setTabValue(1); // Cambiar al tab de lista después de guardar
      await cargarDirecciones();
    } catch (error: any) {
      console.error('❌ [DireccionesPage] Error al guardar:', error);
      showMessage(
        `❌ Error al guardar: ${error.message || 'Error desconocido'}`,
        'error'
      );
    }
  }, [modoEdicion, direccionSeleccionada, actualizarDireccion, crearDireccion, cargarDirecciones, showMessage]);

  // Manejo de eliminación
  const handleEliminar = useCallback(async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta dirección?')) {
      try {
        await eliminarDireccion(id);
        showMessage('✅ Dirección eliminada exitosamente', 'success');
        await cargarDirecciones();
      } catch (error: any) {
        console.error('❌ [DireccionesPage] Error al eliminar:', error);
        showMessage(
          `❌ Error al eliminar: ${error.message || 'Error desconocido'}`,
          'error'
        );
      }
    }
  }, [eliminarDireccion, cargarDirecciones, showMessage]);

  // Manejo de búsqueda con query params para la nueva API
  const handleBuscar = useCallback(async (searchValue: string) => {
    try {
      if (searchValue.trim()) {
        console.log('🔍 Buscando direcciones con API listarDireccionPorNombreVia:', searchValue);
        
        // Usar la nueva función de búsqueda por nombre de vía
        await buscarPorNombreVia(searchValue.trim());
        
        console.log('✅ Búsqueda completada');
        showMessage(`🔍 Búsqueda completada: "${searchValue}"`, 'success');
      } else {
        // Si no hay término de búsqueda, cargar todas las direcciones
        await cargarDirecciones();
        showMessage('📋 Mostrando todas las direcciones', 'success');
      }
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      showMessage('Error al realizar la búsqueda', 'error');
    }
  }, [buscarPorNombreVia, cargarDirecciones, showMessage]);

  // Wrapper síncrono para la búsqueda del componente
  const handleBuscarSync = useCallback((searchTerm: string) => {
    // Ejecutar búsqueda de forma asíncrona sin bloquear
    handleBuscar(searchTerm).catch(console.error);
  }, [handleBuscar]);

  // Recargar datos
  const handleRecargar = useCallback(async () => {
    setSuccessMessage(null);
    await Promise.all([
      cargarDirecciones(),
      cargarSectores(),
      cargarBarrios(),
      cargarCalles()
    ]);
    showMessage('✅ Datos recargados', 'success', 2000);
  }, [cargarDirecciones, cargarSectores, cargarBarrios, cargarCalles, showMessage]);

  // Función para manejar la selección desde la lista
  const handleSeleccionarDireccion = useCallback((direccion: any) => {
    console.log('🎯 [DireccionesPage] Dirección seleccionada desde lista:', direccion);
    console.log('🎯 [DireccionesPage] Estableciendo modo edición a true');
    setDireccionSeleccionada(direccion);
    setModoEdicion(true);
    setTabValue(0); // Cambiar al tab de formulario al seleccionar
  }, [setDireccionSeleccionada]);

  return (
    <MainLayout title="Gestión de Direcciones">
      <Box sx={{ p: 3 }}>
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
              <LocationIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                Gestión de Direcciones
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Administra las direcciones del sistema tributario municipal
              </Typography>
            </Box>
            
            {/* Estadísticas */}
            <Stack 
              direction="row" 
              spacing={2}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Chip
                label={`Total: ${direcciones.length}`}
                color="primary"
                variant="filled"
                size="medium"
                sx={{ fontWeight: 600 }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRecargar}
                disabled={loading}
                size="small"
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                Recargar
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Progress bar */}
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Mensaje de éxito */}
        <Collapse in={!!successMessage}>
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        </Collapse>

        {/* Mensaje de error */}
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => {}}
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Collapse>

        {/* Contenedor principal con tabs */}
        <Box sx={{ 
          maxWidth: { xs: '100%', sm: '100%', md: '90%', lg: '1200px' }, 
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
              aria-label="direccion tabs"
              variant="standard"
              sx={{
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'flex-start',
                  gap: 0
                },
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
                label={modoEdicion ? 'Editar Dirección' : 'Nueva Dirección'}
                id="direccion-tab-0"
                aria-controls="direccion-tabpanel-0"
                sx={{
                  minWidth: { xs: 'auto', sm: 'auto' },
                  padding: { xs: '12px 8px', sm: '12px 10px' },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  '& .MuiTab-iconWrapper': {
                    marginRight: { xs: 0.3, sm: 0.4 }
                  }
                }}
              />
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start"
                label="Lista de Direcciones" 
                id="direccion-tab-1"
                aria-controls="direccion-tabpanel-1"
                sx={{
                  minWidth: { xs: 'auto', sm: 'auto' },
                  padding: { xs: '12px 8px', sm: '12px 10px' },
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  '& .MuiTab-iconWrapper': {
                    marginRight: { xs: 0.3, sm: 0.4 }
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Panel de Formulario */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <DireccionFormMUI
                direccionSeleccionada={direccionSeleccionada}
                sectores={sectores}
                barrios={barrios}
                calles={calles}
                barriosFiltrados={barriosFiltrados}
                callesFiltradas={callesFiltradas}
                onSubmit={handleGuardar}
                onNuevo={handleNuevo}
                onEditar={handleEditar}
                onDelete={handleEliminar}
                onSectorChange={handleSectorChange}
                onBarrioChange={handleBarrioChange}
                loading={loading}
                loadingSectores={loadingSectores}
                loadingBarrios={loadingBarrios}
                loadingCalles={loadingCalles}
                isEditMode={modoEdicion}
              />
            </Box>
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <DireccionListMUI
                direcciones={direcciones}
                direccionSeleccionada={direccionSeleccionada}
                onSelectDireccion={handleSeleccionarDireccion}
                onEditDireccion={handleSeleccionarDireccion}
                onDeleteDireccion={handleEliminar}
                loading={loading}
                onSearch={handleBuscarSync}
              />
            </Box>
          </TabPanel>
        </Paper>
        </Box>

        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </Box>
    </MainLayout>
  );
};

export default DireccionesPage;