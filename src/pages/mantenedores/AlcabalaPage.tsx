// src/pages/mantenedores/AlcabalaPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { AlcabalaForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useAlcabala } from '../../hooks/useAlcabala';
import { NotificationService } from '../../components/utils/Notification';

/**
 * Página principal para gestión de Alcabala con Material-UI
 */
const AlcabalaPage: React.FC = () => {
  const theme = useTheme();
  
  // Usar el hook personalizado para acceder a toda la lógica de Alcabala
  const {
    alcabalas,
    aniosDisponibles,
    anioSeleccionado,
    tasaAlcabala,
    paginacion,
    loading,
    error,
    handleAnioChange,
    handleTasaChange,
    registrarAlcabala,
    cambiarPagina
  } = useAlcabala();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Alcabala', active: true }
  ];

  // Handler para registrar con notificación
  const handleRegistrar = async () => {
    try {
      await registrarAlcabala();
      NotificationService.success('Alcabala registrada exitosamente');
    } catch (err) {
      NotificationService.error('Error al registrar alcabala');
    }
  };

  // Handler para editar (por implementar)
  const handleEditar = (alcabala: any) => {
    // Aquí se implementaría la lógica de edición
    handleAnioChange(alcabala.anio);
    handleTasaChange(alcabala.tasa);
    NotificationService.info('Modo edición activado');
  };

  // Handler para eliminar (por implementar)
  const handleEliminar = async (alcabala: any) => {
    if (window.confirm(`¿Está seguro de eliminar el registro del año ${alcabala.anio}?`)) {
      try {
        // Aquí se implementaría la lógica de eliminación
        NotificationService.success('Alcabala eliminada exitosamente');
      } catch (err) {
        NotificationService.error('Error al eliminar alcabala');
      }
    }
  };

  // Handler para actualizar
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <ReceiptIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Alcabala
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Configure las tasas de alcabala por año fiscal
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>
        </Stack>

        {/* Alert informativo */}
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<InfoIcon />}
        >
          <Typography variant="body2">
            La alcabala es el impuesto que grava las transferencias de propiedad de bienes inmuebles. 
            Configure la tasa aplicable para cada año fiscal.
          </Typography>
        </Alert>

        {/* Mostrar errores si hay */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Formulario de Alcabala */}
        <AlcabalaForm
          aniosDisponibles={aniosDisponibles}
          anioSeleccionado={anioSeleccionado}
          tasa={tasaAlcabala}
          alcabalas={alcabalas}
          paginacion={paginacion}
          onAnioChange={handleAnioChange}
          onTasaChange={handleTasaChange}
          onRegistrar={handleRegistrar}
          onCambiarPagina={cambiarPagina}
          loading={loading}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </Box>
    </MainLayout>
  );
};

export default AlcabalaPage;