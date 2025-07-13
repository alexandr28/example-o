// src/pages/mantenedores/BarriosPage.tsx - VERSIÓN COMPLETA CORREGIDA
import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Grid,
  Alert,
  LinearProgress,
  Typography,
  Collapse
} from '@mui/material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useBarrios } from '../../hooks/useBarrios';
import { CreateBarrioDTO } from '../../services/barrioService';
import BarrioFormMUI from '../../components/barrio/BarrioForm';
import BarrioListMUI from '../../components/barrio/BarrioList';
import { NotificationService } from '../../components/utils/Notification';
import { NotificationContainer } from '../../components';

const BarriosPage: React.FC = () => {
  // Hook de barrios con las propiedades correctas
  const {
    // Estados del hook
    barrios,
    barrioSeleccionado,
    loading,
    error,
    searchTerm,
    isOffline, // Nota: es isOffline, no isOfflineMode
    
    // Estados adicionales
    sectores,
    loadingSectores,
    
    // Acciones CRUD
    cargarBarrios,
    crearBarrio,
    actualizarBarrio,
    eliminarBarrio,
    seleccionarBarrio,
    buscarBarrios,
    limpiarSeleccion,
    
    // Acciones adicionales
    buscarPorSector,
    cargarSectores,
    refrescar,
    limpiarError
  } = useBarrios();

  // Estados locales del componente
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', href: '/' },
    { label: 'Mantenedores', href: '/mantenedores' },
    { label: 'Ubicación', href: '/mantenedores/ubicacion' },
    { label: 'Barrios', active: true }
  ];

  // Función helper para obtener nombre del sector
  const obtenerNombreSector = useCallback((sectorId: number): string => {
    const sector = sectores.find(s => s.codigo === sectorId);
    return sector?.nombre || `Sector ${sectorId}`;
  }, [sectores]);

  // Manejar guardado
  const handleGuardar = useCallback(async (formData: any) => {
    try {
      setSuccessMessage(null);
      
      const barrioData: CreateBarrioDTO = {
        codigoSector: formData.sectorId,
        nombre: formData.nombre,
        descripcion: formData.descripcion || '',
        codUsuario: 1
      };

      if (modoEdicion && barrioSeleccionado) {
        await actualizarBarrio(barrioSeleccionado.codigo, barrioData);
        setSuccessMessage('Barrio actualizado exitosamente');
        NotificationService.success('Barrio actualizado exitosamente');
      } else {
        await crearBarrio(barrioData);
        setSuccessMessage('Barrio creado exitosamente');
        NotificationService.success('Barrio creado exitosamente');
      }

      limpiarSeleccion();
      setModoEdicion(false);
      await refrescar();
      
    } catch (error: any) {
      console.error('Error al guardar:', error);
      NotificationService.error(error.message || 'Error al guardar el barrio');
    }
  }, [modoEdicion, barrioSeleccionado, actualizarBarrio, crearBarrio, limpiarSeleccion, refrescar]);

  // Manejar edición
  const handleEditar = useCallback(() => {
    if (barrioSeleccionado) {
      setModoEdicion(true);
    }
  }, [barrioSeleccionado]);

  // Manejar nuevo
  const handleNuevo = useCallback(() => {
    limpiarSeleccion();
    setModoEdicion(false);
    setSuccessMessage(null);
  }, [limpiarSeleccion]);

  // Manejar selección
  const handleSeleccionarBarrio = useCallback((barrio: any) => {
    seleccionarBarrio(barrio);
    setModoEdicion(false);
  }, [seleccionarBarrio]);

  // Manejar eliminación
  const handleEliminar = useCallback(async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este barrio?')) {
      try {
        await eliminarBarrio(id);
        setSuccessMessage('Barrio eliminado exitosamente');
        NotificationService.success('Barrio eliminado exitosamente');
      } catch (error: any) {
        console.error('Error al eliminar:', error);
        NotificationService.error(error.message || 'Error al eliminar el barrio');
      }
    }
  }, [eliminarBarrio]);

  return (
    <MainLayout title="Mantenedor de Barrios">
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
            {error}
          </Alert>
        </Collapse>

        {/* Modo offline */}
        {isOffline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Trabajando sin conexión. Los cambios se guardarán localmente.
            </Typography>
          </Alert>
        )}

        {/* Layout principal */}
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <BarrioFormMUI
                barrio={barrioSeleccionado}
                sectores={sectores}
                onSubmit={handleGuardar}
                onNuevo={handleNuevo}
                onEditar={handleEditar}
                loading={loading || loadingSectores}
                isEditMode={modoEdicion}
              />
            </Paper>
          </Grid>

          {/* Lista */}
          <Grid item xs={12} md={8}>
            <BarrioListMUI
              barrios={barrios}
              onSelectBarrio={handleSeleccionarBarrio}
              onEliminar={handleEliminar}
              loading={loading}
              onSearch={buscarBarrios}
              searchTerm={searchTerm}
              obtenerNombreSector={obtenerNombreSector}
            />
          </Grid>
        </Grid>

        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </Box>
    </MainLayout>
  );
};

export default BarriosPage;