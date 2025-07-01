// src/pages/mantenedores/SectoresPage.tsx - Versión mejorada con Material-UI
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Chip,
  Grid,
  Stack,
  CircularProgress,
  Backdrop,
  useTheme,
  Fade,
  LinearProgress,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  Cloud as CloudIcon,
  Sync as SyncIcon,
  Storage as StorageIcon,
  BugReport as BugReportIcon,
  WifiOff as WifiOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { SectorList, SectorForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useSectores } from '../../hooks';

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
    cargarSectores,
    buscarSectores,
    seleccionarSector,
    limpiarSeleccion,
    guardarSector,
    eliminarSector,
    setModoEdicion,
    forzarModoOnline,
    testApiConnection,
    sincronizarManualmente,
  } = useSectores();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Inicio', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Sectores', active: true }
  ], []);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    setSuccessMessage(message);
    setAlertType(type);
    setTimeout(() => setSuccessMessage(null), duration);
  };

  // Obtener icono según el tipo de alerta
  const getAlertIcon = () => {
    switch (alertType) {
      case 'success': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      default: return <InfoIcon />;
    }
  };

  // Manejo de edición
  const handleEditar = () => {
    if (sectorSeleccionado) {
      setModoEdicion(true);
    } else {
      showMessage("Por favor, seleccione un sector para editar", 'warning');
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: { nombre: string }) => {
    try {
      await guardarSector(data);
      showMessage(
        modoEdicion 
          ? "Sector actualizado correctamente" 
          : "Sector creado correctamente",
        'success'
      );
    } catch (error: any) {
      showMessage(`Error al guardar: ${error.message}`, 'error');
    }
  };

  // Manejo de eliminación
  const handleEliminar = async (id: number) => {
    try {
      await eliminarSector(id);
      showMessage("Sector eliminado correctamente", 'success');
    } catch (error: any) {
      showMessage(`Error al eliminar: ${error.message}`, 'error');
    }
  };

  // Test de API
  const handleTestApi = async () => {
    showMessage("Probando conexión con API...", 'info');
    
    try {
      const isConnected = await testApiConnection();
      showMessage(
        isConnected 
          ? "Conexión con API exitosa" 
          : "No se pudo conectar con la API",
        isConnected ? 'success' : 'error'
      );
    } catch (error) {
      showMessage("Error al probar conexión", 'error');
    }
  };

  // Forzar recarga online
  const handleForceReload = async () => {
    await forzarModoOnline();
    await cargarSectores();
  };

  // Sincronización manual
  const handleSync = async () => {
    showMessage("Sincronizando con el servidor...", 'info');
    const success = await sincronizarManualmente();
    showMessage(
      success 
        ? "Sincronización completada" 
        : "Error en la sincronización",
      success ? 'success' : 'error'
    );
  };

  return (
    <MainLayout title="Mantenimiento de Sectores">
      <Box sx={{ height: '100%', bgcolor: '#F5F5F5' }}>
        {/* Breadcrumb */}
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Header con acciones */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            {/* Botones de acción */}
            <Button
              size="small"
              variant="text"
              startIcon={<WifiOffIcon />}
              onClick={handleTestApi}
              sx={{ 
                textTransform: 'none',
                color: '#8B5CF6',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Test API
            </Button>
            
            <Button
              size="small"
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={() => cargarSectores()}
              disabled={loading}
              sx={{ 
                textTransform: 'none',
                color: '#3B82F6',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Recargar
            </Button>
            
            <Button
              size="small"
              variant="text"
              startIcon={<ClearIcon />}
              onClick={() => localStorage.removeItem('sectores_cache')}
              sx={{ 
                textTransform: 'none',
                color: '#EF4444',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Limpiar Cache
            </Button>
            
            <IconButton 
              onClick={() => setShowDebug(!showDebug)}
              size="small"
              sx={{
                color: showDebug ? '#10B981' : '#6B7280',
              }}
            >
              <BugReportIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Panel de Debug */}
        <Collapse in={showDebug}>
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Estado de Debug
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Modo Offline:</Typography>
                <Typography variant="body2">{isOfflineMode ? 'Sí' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Total Sectores:</Typography>
                <Typography variant="body2">{sectores.length}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Caché Local:</Typography>
                <Typography variant="body2">{localStorage.getItem('sectores_cache') ? 'Sí' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">Token Auth:</Typography>
                <Typography variant="body2">{localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'}</Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleTestApi}
                startIcon={<WifiOffIcon />}
              >
                Test API Connection
              </Button>
            </Box>
          </Paper>
        </Collapse>

        {/* Alertas y mensajes */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* Mensaje de éxito/error */}
          <Collapse in={!!successMessage}>
            <Alert 
              severity={alertType}
              icon={getAlertIcon()}
              onClose={() => setSuccessMessage(null)}
              sx={{ 
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {successMessage}
            </Alert>
          </Collapse>

          {/* Alerta de modo offline */}
          {isOfflineMode && (
            <Alert 
              severity="warning" 
              icon={<CloudOffIcon />}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleForceReload}
                  disabled={loading}
                >
                  Reconectar
                </Button>
              }
            >
              <AlertTitle>Modo sin conexión</AlertTitle>
              Trabajando con datos locales. Los cambios se sincronizarán cuando se restablezca la conexión.
            </Alert>
          )}

          {/* Mensajes de error */}
          {error && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}
        </Stack>

        {/* Loading overlay */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute'
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Contenido principal */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={2}>
            {/* Formulario */}
            <Grid item xs={12}>
              <Fade in timeout={300}>
                <Box>
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
              </Fade>
            </Grid>

            {/* Lista */}
            <Grid item xs={12}>
              <Fade in timeout={500}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <SectorList
                    sectores={sectores}
                    onSelectSector={seleccionarSector}
                    isOfflineMode={isOfflineMode}
                    onEliminar={handleEliminar}
                    loading={loading}
                    onSearch={buscarSectores}
                    searchTerm={searchTerm}
                  />
                </Paper>
              </Fade>
            </Grid>
          </Grid>

          {/* Información adicional */}
          <Box sx={{ mt: 3 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 1
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StorageIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total sectores
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sectores.length}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {isOfflineMode ? (
                      <CloudOffIcon sx={{ color: 'warning.main', fontSize: '1.25rem' }} />
                    ) : (
                      <CloudIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Estado
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {isOfflineMode ? 'Offline' : 'Online'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EditIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Seleccionado
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sectorSeleccionado?.nombre || 'Ninguno'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InfoIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Modo
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {modoEdicion ? 'Edición' : 'Vista'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default SectoresPage;