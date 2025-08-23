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
  Alert,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  List as ListIcon
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
    setSearchTerm,
    barrioSeleccionado,
    modoEdicion,
    seleccionarBarrio,
    limpiarSeleccion,
    guardarBarrio,
    eliminarBarrio,
    estadisticas
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
        </Box>

        {/* Contenedor principal con tabs */}
        <Paper 
          elevation={2}
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
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
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
            <Box sx={{ p: 3 }}>
              <BarrioForm
                onSubmit={handleGuardar}
                onCancel={limpiarSeleccion}
                initialData={barrioSeleccionado || undefined}
                isSubmitting={guardando}
              />
            </Box>
          </TabPanel>

          {/* Panel de Lista */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
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

        {/* Mensaje de error global */}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">
              {error}
            </Alert>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default BarrioPage;