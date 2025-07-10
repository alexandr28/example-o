// src/pages/mantenedores/DepreciacionPage.tsx
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
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { DepreciacionForm, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDepreciacion } from '../../hooks/useDepreciacion';
import { NotificationService } from '../../components/utils/Notification';

/**
 * Página principal para gestión de Depreciación con Material-UI
 */
const DepreciacionPage: React.FC = () => {
  const theme = useTheme();
  
  // Usar el hook personalizado para acceder a toda la lógica de depreciación
  const {
    depreciaciones,
    aniosDisponibles,
    tiposCasa,
    anioSeleccionado,
    tipoCasaSeleccionado,
    paginacion,
    loading,
    error,
    handleAnioChange,
    handleTipoCasaChange,
    registrarDepreciacion,
    buscarDepreciaciones,
    cambiarPagina
  } = useDepreciacion();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Depreciación', active: true }
  ];

  // Handler para registrar con notificación
  const handleRegistrar = async () => {
    try {
      await registrarDepreciacion();
      NotificationService.success('Depreciación registrada exitosamente');
    } catch (err) {
      NotificationService.error('Error al registrar depreciación');
    }
  };

  // Handler para buscar con notificación
  const handleBuscar = async () => {
    try {
      await buscarDepreciaciones();
      NotificationService.info('Búsqueda completada');
    } catch (err) {
      NotificationService.error('Error al buscar depreciaciones');
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
              <TrendingDownIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Depreciación
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Configure los porcentajes de depreciación según el tipo de construcción y estado de conservación
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
            La depreciación se calcula en base al material de construcción, antigüedad y estado de conservación del inmueble. 
            Configure los porcentajes para cada combinación de factores.
          </Typography>
        </Alert>

        {/* Mostrar errores si hay */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Formulario de Depreciación */}
        <DepreciacionForm
          aniosDisponibles={aniosDisponibles}
          tiposCasa={tiposCasa}
          anioSeleccionado={anioSeleccionado}
          tipoCasaSeleccionado={tipoCasaSeleccionado}
          depreciaciones={depreciaciones}
          onAnioChange={handleAnioChange}
          onTipoCasaChange={handleTipoCasaChange}
          onRegistrar={handleRegistrar}
          onBuscar={handleBuscar}
          loading={loading}
        />
      </Box>
    </MainLayout>
  );
};

export default DepreciacionPage;