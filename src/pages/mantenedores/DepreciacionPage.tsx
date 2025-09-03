// src/pages/mantenedores/DepreciacionPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  useTheme
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { DepreciacionUnificado, Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useDepreciacion } from '../../hooks/useDepreciacion';

/**
 * Página principal para gestión de Depreciación con Material-UI
 */
const DepreciacionPage: React.FC = () => {
  const theme = useTheme();
  
  // Usar el hook personalizado para acceder a toda la lógica de depreciación
  const {
    depreciaciones,
    todasLasDepreciaciones, // Para el panel de búsqueda
    // tiposCasa, // ELIMINADO: ahora se carga en el componente con useClasificacionPredio
    anioSeleccionado,
    tipoCasaSeleccionado,
    loading,
    error,
    handleAnioChange,
    handleTipoCasaChange,
    registrarDepreciacion,
    buscarDepreciaciones,
    actualizarDepreciacion,
    eliminarDepreciacion
  } = useDepreciacion();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'Depreciación', active: true }
  ];

  // Handler para registrar con notificación
  const handleRegistrar = async (datosFormulario?: any) => {
    try {
      await registrarDepreciacion(datosFormulario);
      // Las notificaciones ya se manejan en el hook
    } catch (err) {
      // El error ya se maneja en el hook
      console.error('Error en página:', err);
    }
  };

  // Handler para buscar con notificación
  const handleBuscar = async () => {
    try {
      await buscarDepreciaciones();
      // Las notificaciones ya se manejan en el hook
    } catch (err) {
      // El error ya se maneja en el hook
      console.error('Error en página:', err);
    }
  };

  // Handler para actualizar
  const handleActualizar = async (id: number, datos: any) => {
    try {
      await actualizarDepreciacion(id, datos);
      // Las notificaciones ya se manejan en el hook
    } catch (err) {
      // El error ya se maneja en el hook
      console.error('Error en página:', err);
    }
  };

  // Handler para eliminar
  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta depreciación?')) {
      try {
        await eliminarDepreciacion(id);
        // Las notificaciones ya se manejan en el hook
      } catch (err) {
        // El error ya se maneja en el hook
        console.error('Error en página:', err);
      }
    }
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

        {/* Componente Unificado de Depreciación */}
        <DepreciacionUnificado
          anioSeleccionado={anioSeleccionado}
          tipoCasaSeleccionado={tipoCasaSeleccionado}
          depreciaciones={todasLasDepreciaciones || depreciaciones} // Usar todas para búsqueda
          onAnioChange={handleAnioChange}
          onTipoCasaChange={handleTipoCasaChange}
          onRegistrar={handleRegistrar}
          onBuscar={handleBuscar}
          onActualizar={handleActualizar}
          onEliminar={handleEliminar}
          loading={loading}
        />
      </Box>
    </MainLayout>
  );
};

export default DepreciacionPage;