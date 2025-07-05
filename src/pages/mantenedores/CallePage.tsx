// src/pages/mantenedores/CallesPage.tsx - Versión con Material-UI
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  Alert,
  AlertTitle,
  Typography,
  LinearProgress,
  Collapse,
  Button
} from '@mui/material';
import {
  Clear as ClearIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useCalles } from '../../hooks/useCalles';
import CalleFormMUI from '../../components/calles/CalleForm';
import CalleListMUI from '../../components/calles/CalleList';

const CallePage: React.FC = () => {
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

  // Manejo de edición
  const handleEditar = () => {
    if (calleSeleccionada) {
      setModoEdicion(true);
    } else {
      showMessage("⚠️ Por favor, seleccione una calle para editar");
    }
  };

  // Manejo de guardado
  const handleGuardar = async (data: { sectorId: number; barrioId: number; tipoVia: string; nombre: string }) => {
    try {
      console.log('💾 [CallesPage] Iniciando guardado:', data);
      
      // Validaciones
      if (!data.sectorId || data.sectorId <= 0) {
        throw new Error('Debe seleccionar un sector válido');
      }
      
      if (!data.barrioId || data.barrioId <= 0) {
        throw new Error('Debe seleccionar un barrio válido');
      }
      
      if (!data.tipoVia || data.tipoVia.trim() === '') {
        throw new Error('Debe seleccionar un tipo de vía');
      }
      
      if (!data.nombre || data.nombre.trim().length < 2) {
        throw new Error('El nombre de la calle debe tener al menos 2 caracteres');
      }
      
      await guardarCalle(data);
      showMessage(modoEdicion 
        ? "✅ Calle actualizada correctamente" 
        : "✅ Calle creada correctamente");
      
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

        {/* Layout principal */}
        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} md={4}>
            <CalleFormMUI
              calleSeleccionada={calleSeleccionada}
              sectores={sectores}
              barrios={barrios}
              barriosFiltrados={barriosFiltrados}
              tiposVia={tiposVia}
              onSubmit={handleGuardar}
              onNuevo={limpiarSeleccion}
              onEditar={handleEditar}
              onSectorChange={filtrarBarriosPorSector}
              loading={loading}
              loadingSectores={loadingSectores}
              loadingBarrios={loadingBarrios}
              loadingTiposVia={loadingTiposVia}
              isEditMode={modoEdicion}
            />
          </Grid>

          {/* Lista */}
          <Grid item xs={12} md={8}>
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
          </Grid>
        </Grid>

      </Box>
    </MainLayout>
  );
};

export default CallePage;