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
  Alert,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

// Interface para TabPanel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`barrio-tabpanel-${index}`}
      aria-labelledby={`barrio-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const BarrioPage: React.FC = () => {
  const theme = useTheme();
  
  // Hooks
  const {
    barrios,
    loading,
    error,
    searchTerm,
    barrioSeleccionado,
    modoEdicion,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
  } = useBarrios();

  const { sectores } = useSectores();

  // Estados locales
  const [guardando, setGuardando] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Barrios', path: '/mantenedores/barrios', active: true }
  ];

  // Manejar cambio de tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Abrir modal para editar
  const abrirModal = (barrio?: any) => {
    if (barrio) {
      seleccionarBarrio(barrio);
      setTabValue(0); // Cambiar al tab de formulario al editar
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
        setTabValue(1); // Cambiar al tab de lista después de guardar
      }
    } finally {
      setGuardando(false);
    }
  };

  // Manejar eliminación
  const handleEliminar = async (barrio: any) => {
    await eliminarBarrio(barrio.id);
  };

  // Manejar eliminación desde el formulario
  const handleEliminarDesdeFormulario = async () => {
    if (barrioSeleccionado) {
      await eliminarBarrio(barrioSeleccionado.id);
      limpiarSeleccion();
      setTabValue(1); // Cambiar al tab de lista después de eliminar
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header mejorado con Material UI */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mb: 3,
            mt: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 3 },
          }}>
            {/* Icono principal */}
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <HomeIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Box>
            
            {/* Título y descripción */}
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.dark,
                  mb: 0.5
                }}
              >
                Gestión de Barrios
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Administra los barrios por sector del sistema tributario
              </Typography>
            </Box>
            
            {/* Estadísticas */}
            <Stack 
              direction="row" 
              spacing={2}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              
              
            </Stack>
          </Box>
        </Paper>

        {/* Contenedor principal con tabs */}
        <Box sx={{ 
          maxWidth: { xs: '100%', sm: '100%', md: '90%', lg: '80%' }, 
          mx: 'auto' 
        }}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Header con tabs */}
            <Box sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="barrio tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: { xs: 48, sm: 56, md: 64 },
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                    px: { xs: 1, sm: 2, md: 3 },
                    '&.Mui-selected': {
                      fontWeight: 600,
                    }
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
              <Tab 
                icon={<AddIcon />} 
                iconPosition="start"
                label={modoEdicion ? 'Editar Barrio' : 'Nuevo Barrio'}
                id="barrio-tab-0"
                aria-controls="barrio-tabpanel-0"
              />
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start"
                label="Lista de Barrios" 
                id="barrio-tab-1"
                aria-controls="barrio-tabpanel-1"
              />
            </Tabs>
          </Box>

            {/* Panel de Formulario */}
            <TabPanel value={tabValue} index={0}>
              
                <BarrioForm
                  onSubmit={handleGuardar}
                  onNew={limpiarSeleccion}
                  onDelete={handleEliminarDesdeFormulario}
                  initialData={barrioSeleccionado || undefined}
                  isSubmitting={guardando}
                />
             
            </TabPanel>

            {/* Panel de Lista */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                <BarrioList
                  barrios={barrios || []}
                  sectores={sectores || []}
                  onEdit={abrirModal}
                  onDelete={handleEliminar}
                  loading={loading}
                  searchTerm={searchTerm}
                  selectedBarrio={barrioSeleccionado}
                />
              </Box>
            </TabPanel>
          </Paper>
        </Box>

        {/* Mensaje de error global */}
        {error && (
          <Box sx={{ 
            mt: 2,
            maxWidth: { xs: '100%', sm: '100%', md: '90%', lg: '80%' }, 
            mx: 'auto' 
          }}>
            <Alert 
              severity="error"
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default BarrioPage;