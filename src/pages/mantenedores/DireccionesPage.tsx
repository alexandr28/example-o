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
import { Breadcrumb, NotificationContainer } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDirecciones } from '../../hooks/useDirecciones';
import DireccionFormMUI from '../../components/direcciones/DireccionForm';
import DireccionListMUI from '../../components/direcciones/DireccionList';
import { NotificationService } from '../../components/utils/Notification';

const DireccionesPage: React.FC = () => {
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

  // Manejo de búsqueda
  const handleBuscar = useCallback(async (searchValue: string) => {
    if (searchValue.trim()) {
      // Por ahora solo filtramos localmente
      // TODO: Implementar búsqueda en el servidor cuando esté disponible
      console.log('Buscando:', searchValue);
    } else {
      await cargarDirecciones();
    }
  }, [cargarDirecciones]);

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
    setDireccionSeleccionada(direccion);
    setModoEdicion(true);
  }, [setDireccionSeleccionada]);

  return (
    <MainLayout title="Gestión de Direcciones">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>

        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Direcciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administre las direcciones del sistema
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRecargar}
            disabled={loading}
          >
            Recargar
          </Button>
        </Stack>

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

        {/* Grid principal */}
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} lg={5}>
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
              onSectorChange={handleSectorChange}
              onBarrioChange={handleBarrioChange}
              loading={loading}
              loadingSectores={loadingSectores}
              loadingBarrios={loadingBarrios}
              loadingCalles={loadingCalles}
              isEditMode={modoEdicion}
            />
          </Grid>

          {/* Lista */}
          <Grid item xs={12} lg={7}>
            <DireccionListMUI
              direcciones={direcciones}
              onSeleccionar={handleSeleccionarDireccion}
              onEliminar={handleEliminar}
              onBuscar={handleBuscar}
              loading={loading}
              direccionSeleccionada={direccionSeleccionada}
            />
          </Grid>
        </Grid>

        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </Box>
    </MainLayout>
  );
};

export default DireccionesPage;