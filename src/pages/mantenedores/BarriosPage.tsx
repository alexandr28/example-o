// src/pages/mantenedores/BarrioPage.tsx
import React, { useState } from 'react';
import { MainLayout } from '../../layout';
import { Breadcrumb } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useBarrios } from '../../hooks/useBarrios';
import { useSectores } from '../../hooks/useSectores';
import BarrioList from '../../components/barrio/BarrioList';
import BarrioForm from '../../components/barrio/BarrioForm';

// Material-UI imports
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';

const BarrioPage: React.FC = () => {
  // Hooks
  const {
    barrios,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    barrioSeleccionado,
    modoEdicion,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    estadisticas,
    setError  // Agregar setError
  } = useBarrios();

  const { sectores } = useSectores();

  // Estados locales
  const [guardando, setGuardando] = useState(false);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Barrios', path: '/mantenedores/barrios', active: true }
  ];

  // Abrir modal para editar
  const abrirModal = (barrio?: any) => {
    if (barrio) {
      seleccionarBarrio(barrio);
    } else {
      limpiarSeleccion();
    }
  };

  // Manejar guardado
  const handleGuardar = async (datos: any) => {
    setGuardando(true);
    try {
      const exito = await guardarBarrio(datos);
      if (exito) {
        limpiarSeleccion();
      }
    } finally {
      setGuardando(false);
    }
  };

  // Manejar eliminación
  const handleEliminar = async (barrio: any) => {
    await eliminarBarrio(barrio.id);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Encabezado */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Barrios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administre los barrios del sistema
          </Typography>
        </Box>

        {/* Contenedor principal con dos columnas */}
        <Grid container spacing={3}>
          {/* Columna izquierda - Formulario */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {modoEdicion ? 'Editar Barrio' : 'Nuevo Barrio'}
              </Typography>
              
              <BarrioForm
                onSubmit={handleGuardar}
                onCancel={limpiarSeleccion}
                initialData={barrioSeleccionado || undefined}
                isSubmitting={guardando}
              />
            </Paper>
          </Grid>

          {/* Columna derecha - Lista y búsqueda */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              {/* Barra de búsqueda */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar barrios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>

              {/* Estadísticas compactas */}
              {estadisticas && (
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1,
                      textAlign: 'center' 
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        TOTAL
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {estadisticas.total}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      bgcolor: 'success.50', 
                      p: 1, 
                      borderRadius: 1,
                      textAlign: 'center' 
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        ACTIVOS
                      </Typography>
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        {estadisticas.activos}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      bgcolor: 'error.50', 
                      p: 1, 
                      borderRadius: 1,
                      textAlign: 'center' 
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        INACTIVOS
                      </Typography>
                      <Typography variant="h6" color="error.main" fontWeight="bold">
                        {estadisticas.inactivos}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Lista de barrios */}
              <Box sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}>
                <BarrioList
                  barrios={barrios || []}
                  sectores={sectores || []}
                  onEdit={abrirModal}
                  onDelete={handleEliminar}
                  loading={loading}
                  searchTerm={searchTerm}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Mensaje de error global */}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default BarrioPage;