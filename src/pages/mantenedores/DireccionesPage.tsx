// src/pages/mantenedores/DireccionesPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Alert,
  AlertTitle,
  Typography,
  LinearProgress,
  Collapse,
  Button,
  Stack,
  Paper,
  Chip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDirecciones } from '../../hooks/useDirecciones';
import DireccionFormMUI from '../../components/direcciones/DireccionForm';
import DireccionListMUI from '../../components/direcciones/DireccionList';
import { NotificationService } from '../../components/utils/Notification';
//import { NotificationContainer } from '../../components/utils/Notification';

const DireccionesPage: React.FC = () => {
  const {
    // Estados principales
    direcciones,
    direccionSeleccionada,
    loading,
    error,
    searchTerm,
    modoEdicion,
    
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
    buscarDirecciones,
    seleccionarDireccion,
    limpiarSeleccion,
    guardarDireccion,
    eliminarDireccion,
    setModoEdicion,
    buscarPorNombreVia,
    
    // Filtros
    filtrarBarriosPorSector,
    filtrarCallesPorBarrio,
    
    // Acciones adicionales
    cargarDependencias,
    refrescar,
    limpiarError
  } = useDirecciones();

  // Estados locales
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSearchForm, setShowSearchForm] = useState(false);

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

  // Manejo de edición
  const handleEditar = useCallback(() => {
    if (direccionSeleccionada) {
      setModoEdicion(true);
      showMessage('Modo edición activado', 'success');
    }
  }, [direccionSeleccionada, setModoEdicion, showMessage]);

  // Manejo de nuevo
  const handleNuevo = useCallback(() => {
    limpiarSeleccion();
    setModoEdicion(false);
    limpiarError();
    setSuccessMessage(null);
  }, [limpiarSeleccion, setModoEdicion, limpiarError]);

  // Manejo de guardado
  const handleGuardar = useCallback(async (data: any) => {
    try {
      await guardarDireccion(data);
      showMessage(
        modoEdicion ? '✅ Dirección actualizada exitosamente' : '✅ Dirección creada exitosamente',
        'success'
      );
      setModoEdicion(false);
      await refrescar();
    } catch (error: any) {
      console.error('❌ [DireccionesPage] Error al guardar:', error);
      showMessage(
        `❌ Error al guardar: ${error.message || 'Error desconocido'}`,
        'error'
      );
    }
  }, [guardarDireccion, modoEdicion, refrescar, showMessage, setModoEdicion]);

  // Manejo de eliminación
  const handleEliminar = useCallback(async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta dirección?')) {
      try {
        await eliminarDireccion(id);
        showMessage('✅ Dirección eliminada exitosamente', 'success');
        await refrescar();
      } catch (error: any) {
        console.error('❌ [DireccionesPage] Error al eliminar:', error);
        showMessage(
          `❌ Error al eliminar: ${error.message || 'Error desconocido'}`,
          'error'
        );
      }
    }
  }, [eliminarDireccion, refrescar, showMessage]);

  // Manejo de búsqueda
  const handleBuscar = useCallback(async (searchValue: string) => {
    if (searchValue.trim()) {
      await buscarPorNombreVia(searchValue);
    } else {
      await cargarDirecciones();
    }
  }, [buscarPorNombreVia, cargarDirecciones]);

  // Recargar datos
  const handleRecargar = useCallback(async () => {
    limpiarError();
    setSuccessMessage(null);
    await Promise.all([
      cargarDirecciones(),
      cargarDependencias()
    ]);
    showMessage('✅ Datos recargados', 'success', 2000);
  }, [cargarDirecciones, cargarDependencias, limpiarError, showMessage]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const activas = direcciones.filter(d => d.estado === 'ACTIVO').length;
    const inactivas = direcciones.filter(d => d.estado !== 'ACTIVO').length;
    const porSector = direcciones.reduce((acc, dir) => {
      const sector = dir.nombreSector || 'Sin sector';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total: direcciones.length, activas, inactivas, porSector };
  }, [direcciones]);

  return (
    <MainLayout title="Gestión de Direcciones">
      <Box sx={{ p: 3 }}>
        {/* Navegación de migas de pan */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Progress bar */}
        {(loading || loadingSectores || loadingBarrios || loadingCalles) && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Header con estadísticas */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" />
                Direcciones
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={`Total: ${estadisticas.total}`} size="small" color="primary" />
                <Chip label={`Activas: ${estadisticas.activas}`} size="small" color="success" />
                <Chip label={`Inactivas: ${estadisticas.inactivas}`} size="small" color="error" />
              </Stack>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => setShowSearchForm(!showSearchForm)}
              >
                {showSearchForm ? 'Ocultar búsqueda' : 'Búsqueda avanzada'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRecargar}
                disabled={loading}
              >
                Recargar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNuevo}
                disabled={loading}
              >
                Nueva Dirección
              </Button>
            </Stack>
          </Stack>
        </Paper>

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
            onClose={limpiarError}
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Collapse>

        {/* Alertas de dependencias */}
        {sectores.length === 0 && !loadingSectores && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Sin sectores disponibles</AlertTitle>
            No hay sectores registrados. Por favor, registre sectores primero.
          </Alert>
        )}

        {barrios.length === 0 && !loadingBarrios && sectores.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Sin barrios disponibles</AlertTitle>
            No hay barrios registrados. Por favor, registre barrios primero.
          </Alert>
        )}

        {calles.length === 0 && !loadingCalles && barrios.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Sin calles disponibles</AlertTitle>
            No hay calles registradas. Por favor, registre calles primero.
          </Alert>
        )}

        {/* Layout principal */}
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12}>
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
              onSectorChange={filtrarBarriosPorSector}
              onBarrioChange={filtrarCallesPorBarrio}
              loading={loading}
              loadingSectores={loadingSectores}
              loadingBarrios={loadingBarrios}
              loadingCalles={loadingCalles}
              isEditMode={modoEdicion}
            />
          </Grid>

          {/* Lista */}
          <Grid item xs={12}>
            <DireccionListMUI
              direcciones={direcciones}
              direccionSeleccionada={direccionSeleccionada}
              onSelectDireccion={seleccionarDireccion}
              onEditDireccion={(direccion) => {
                seleccionarDireccion(direccion);
                handleEditar();
              }}
              onDeleteDireccion={handleEliminar}
              loading={loading}
              onSearch={handleBuscar}
              searchTerm={searchTerm}
            />
          </Grid>
        </Grid>

        {/* Contenedor de notificaciones */}
       
      </Box>
    </MainLayout>
  );
};

export default DireccionesPage;