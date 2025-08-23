// src/pages/mantenedores/UitPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Button,
  Paper,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Container,
  Tabs,
  Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  List as ListIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb, NotificationContainer } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useUIT } from '../../hooks/useUIT';
import { NotificationService } from '../../components/utils/Notification';
import UitFormAlicuota from '../../components/uit/UitFormAlicuota';
import UitList from '../../components/uit/UitList';
import { UITData } from '../../services/uitService';

/**
 * Página principal para gestión de UIT-EPA con Material-UI
 */
const UitPage: React.FC = () => {
  const theme = useTheme();
  const [showInfo, setShowInfo] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Usar el hook personalizado para acceder a toda la lógica de UIT
  const {
    uits,
    uitSeleccionada,
    uitVigente,
    loading,
    error,
    cargarUITs,
    crearUIT,
    actualizarUIT,
    eliminarUIT,
    seleccionarUIT,
    calcularMontoUIT,
    obtenerEstadisticas,
    anioSeleccionado,
    setAnioSeleccionado
  } = useUIT();

  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', path: '/dashboard' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'UIT - EPA', active: true }
  ];

  // Cargar estadísticas de forma controlada
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const stats = await obtenerEstadisticas();
        setEstadisticas(stats);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
        // Establecer estadísticas por defecto si hay error
        setEstadisticas({
          totalRegistros: 0,
          anioMinimo: new Date().getFullYear() - 5,
          anioMaximo: new Date().getFullYear(),
          variacionAnual: 0,
          aniosDisponibles: 0
        });
      } finally {
        setLoadingStats(false);
      }
    };
    
    const timer = setTimeout(() => {
      loadStats();
    }, 500); // Pequeño delay para evitar múltiples llamadas

    return () => clearTimeout(timer);
  }, [obtenerEstadisticas, isInitialized]);

  // Manejar actualización
  const handleRefresh = async () => {
    try {
      await cargarUITs();
      const stats = await obtenerEstadisticas();
      setEstadisticas(stats);
      NotificationService.success('Datos actualizados correctamente');
    } catch (err) {
      NotificationService.info('Mostrando datos de demostración');
    }
  };

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Manejar guardado
  const handleGuardar = async (datos: any) => {
    try {
      if (modoEdicion && uitSeleccionada) {
        await actualizarUIT(uitSeleccionada.id, datos);
      } else {
        await crearUIT(datos);
      }
      
      setModoEdicion(false);
      seleccionarUIT(null);
      
      // Recargar estadísticas
      const stats = await obtenerEstadisticas();
      setEstadisticas(stats);
      NotificationService.success(modoEdicion ? 'UIT actualizada correctamente' : 'UIT creada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      NotificationService.error('Error al guardar la UIT');
    }
  };

  // Manejar edición
  const handleEditar = (uit: UITData) => {
    seleccionarUIT(uit);
    setModoEdicion(true);
  };

  // Manejar eliminación - Funcionalidad disponible pero no expuesta en la UI de lista
  // const handleEliminar = async (id: number) => {
  //   if (window.confirm('¿Está seguro de eliminar este valor UIT?')) {
  //     try {
  //       await eliminarUIT(id);
  //       NotificationService.success('UIT eliminada correctamente');
  //     } catch (error) {
  //       console.error('Error al eliminar:', error);
  //       NotificationService.error('Error al eliminar la UIT');
  //     }
  //   }
  // };

  // Manejar nuevo
  const handleNuevo = () => {
    seleccionarUIT(null);
    setModoEdicion(false);
  };

  // Manejar cambio de tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Componente TabPanel
  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`uit-tabpanel-${index}`}
        aria-labelledby={`uit-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  // Si está cargando la página inicial, mostrar skeleton
  if (!isInitialized) {
    return (
      <MainLayout title="UIT - EPA">
        <Container>
          <Box sx={{ p: 3 }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="UIT - EPA (Unidad Impositiva Tributaria)">
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          {/* Navegación de migas de pan */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumb items={breadcrumbItems} />
          </Box>

          {/* Header con acciones */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccountBalanceIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  UIT - EPA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestión de Unidad Impositiva Tributaria y Alícuotas
                </Typography>
              </Box>
            </Stack>
            
          </Stack>

       
          {/* Sistema de Tabs */}
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            {/* Tabs Header */}
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="UIT tabs"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    minHeight: 48,
                    px: 3
                  }
                }}
              >
                <Tab 
                  icon={<CalculateIcon />} 
                  iconPosition="start"
                  label="UIT-EPA" 
                  id="uit-tab-0"
                  aria-controls="uit-tabpanel-0"
                />
                <Tab 
                  icon={<ListIcon />} 
                  iconPosition="start"
                  label="Listar UIT" 
                  id="uit-tab-1"
                  aria-controls="uit-tabpanel-1"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
              {/* UIT-EPA: Formulario y Alícuotas */}
              <UitFormAlicuota
                uitSeleccionada={uitSeleccionada}
                onGuardar={handleGuardar}
                onNuevo={handleNuevo}
                modoEdicion={modoEdicion}
                loading={loading}
                anioSeleccionado={anioSeleccionado || new Date().getFullYear()}
                onAnioChange={setAnioSeleccionado}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {/* Listar UIT: Lista de UITs */}
              <UitList
                uits={uits}
                onEditar={handleEditar}
                loading={loading}
                uitSeleccionada={uitSeleccionada}
              />
            </TabPanel>
          </Paper>

          {/* Contenedor de notificaciones */}
          <NotificationContainer />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default UitPage;