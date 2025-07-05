// src/pages/mantenedores/BarriosPage.tsx - Versión con Material-UI
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Typography,
  Collapse,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  Button,
  ButtonGroup,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  CloudOff as CloudOffIcon,
  CloudQueue as CloudIcon,
  DeleteSweep as DeleteSweepIcon,
  Sync as SyncIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationCity as LocationCityIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useBarrios } from '../../hooks/useBarrios';
import { BarrioFormData } from '../../models/Barrio';
import BarrioFormMUI from '../../components/barrio/BarrioForm';
import BarrioListMUI from '../../components/barrio/BarrioList';

const BarriosPage: React.FC = () => {
  const theme = useTheme();
  const {
    // Estados principales
    barrios,
    barrioSeleccionado,
    modoEdicion,
    loading,
    error,
    isOfflineMode,
    searchTerm,
    lastSyncTime,
    
    // Estados adicionales
    sectores,
    loadingSectores,
    
    // Funciones
    cargarBarrios,
    buscarBarrios,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    setModoEdicion,
    sincronizarManualmente,
    cargarSectores,
    forzarModoOnline,
    testApiConnection,
    obtenerNombreSector,
    
    // Debug
    debugInfo
  } = useBarrios();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);

  // Migas de pan
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Ubicación', path: '/mantenedores/ubicacion' },
    { label: 'Barrios', active: true }
  ], []);

  // Función para mostrar mensaje temporal
  const showMessage = (message: string, duration = 3000) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), duration);
  };

  // Manejo de edición
  const handleEditar = () => {
    if (barrioSeleccionado) {
      setModoEdicion(true);
    } else {
      showMessage("⚠️ Por favor, seleccione un barrio para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: BarrioFormData) => {
    try {
      console.log('📤 [BarriosPage] Guardando barrio:', data);
      
      const exito = await guardarBarrio(data);
      
      if (exito) {
        showMessage(modoEdicion 
          ? "✅ Barrio actualizado correctamente" 
          : "✅ Barrio creado correctamente");
        
        setTimeout(async () => {
          await cargarBarrios();
        }, 500);
      }
    } catch (error: any) {
      console.error('❌ [BarriosPage] Error al guardar:', error);
      showMessage(`❌ Error al guardar: ${error.message}`);
    }
  };

  // Manejo de eliminación
  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este barrio?')) {
      return;
    }
    
    try {
      await eliminarBarrio(id);
      showMessage("✅ Barrio eliminado correctamente");
      await cargarBarrios();
    } catch (error: any) {
      showMessage(`❌ Error al eliminar: ${error.message}`);
    }
  };

  // Test de API
  const handleTestApi = async () => {
    showMessage("🧪 Probando conexión con API...");
    
    try {
      const isConnected = await testApiConnection();
      showMessage(isConnected 
        ? "✅ API conectada correctamente" 
        : "❌ API no responde correctamente");
    } catch (error) {
      showMessage("❌ Error al probar API");
    }
  };

  // Forzar recarga
  const handleForceReload = async () => {
    showMessage("🔄 Forzando recarga desde API...");
    
    try {
      await forzarModoOnline();
      showMessage("✅ Datos recargados desde API");
    } catch (error: any) {
      showMessage(`❌ Error al forzar recarga: ${error.message}`);
    }
  };

  // Limpiar cache
  const handleClearCache = () => {
    localStorage.removeItem('barrios_cache');
    localStorage.removeItem('sectores_cache');
    showMessage("🧹 Cache limpiado (barrios y sectores)");
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
    <MainLayout title="Mantenimiento de Barrios">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Progress bar */}
        {(loading || loadingSectores) && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Header removido - título ahora está solo en el breadcrumb */}

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
            No se pueden crear barrios sin sectores.
          </Alert>
        )}

        {/* Error general */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Debug info */}
        {showDebug && process.env.NODE_ENV === 'development' && (
          <Collapse in={showDebug}>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography variant="subtitle2" gutterBottom>
                Debug Info:
              </Typography>
              <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </Paper>
          </Collapse>
        )}

        {/* Layout principal */}
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} md={4}>
            <BarrioFormMUI
              barrioSeleccionado={barrioSeleccionado}
              sectores={sectores}
              onSubmit={handleGuardar}
              onNuevo={limpiarSeleccion}
              onEditar={handleEditar}
              loading={loading}
              loadingSectores={loadingSectores}
              isEditMode={modoEdicion}
              isOfflineMode={isOfflineMode}
            />
          </Grid>

          {/* Lista */}
          <Grid item xs={12} md={8}>
            <BarrioListMUI
              barrios={barrios}
              onSelectBarrio={seleccionarBarrio}
              isOfflineMode={isOfflineMode}
              onEliminar={handleEliminar}
              loading={loading}
              onSearch={buscarBarrios}
              searchTerm={searchTerm}
              obtenerNombreSector={obtenerNombreSector}
            />
          </Grid>
        </Grid>

        {/* Panel de información expandible */}
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Box
                onClick={() => setExpandedInfo(!expandedInfo)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Información del Sistema
                </Typography>
                <IconButton size="small">
                  {expandedInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedInfo}>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Total barrios
                      </Typography>
                      <Typography variant="h6">
                        {barrios.length}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Total sectores
                      </Typography>
                      <Typography variant="h6">
                        {sectores.length}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Modo
                      </Typography>
                      <Chip
                        label={modoEdicion ? 'Edición' : 'Vista'}
                        color={modoEdicion ? 'primary' : 'default'}
                        size="small"
                      />
                    </Stack>
                  </Grid>
                </Grid>

                {/* Información del barrio seleccionado */}
                {barrioSeleccionado && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Barrio Seleccionado:
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Nombre: <strong>{barrioSeleccionado.nombre}</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Sector: <strong>{obtenerNombreSector(barrioSeleccionado.sectorId)}</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Estado: {' '}
                            <Chip
                              icon={barrioSeleccionado.estado ? <CheckCircleIcon /> : <CancelIcon />}
                              label={barrioSeleccionado.estado ? 'Activo' : 'Inactivo'}
                              color={barrioSeleccionado.estado ? 'success' : 'error'}
                              size="small"
                            />
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}

                {/* Búsqueda activa */}
                {searchTerm && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      borderRadius: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SearchIcon color="info" />
                        <Typography variant="body2">
                          Búsqueda activa: <strong>"{searchTerm}"</strong> - {barrios.length} resultados
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={() => buscarBarrios('')}
                      >
                        Limpiar búsqueda
                      </Button>
                    </Box>
                  </>
                )}
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default BarriosPage