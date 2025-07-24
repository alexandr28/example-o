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
  Container
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb, UIT, NotificationContainer } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useUIT } from '../../hooks/useUIT';
import { NotificationService } from '../../components/utils/Notification';

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
    uitVigente,
    loading,
    error,
    cargarUITs,
    obtenerEstadisticas
  } = useUIT();

  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Stack>

          {/* Alerta informativa */}
          <Fade in={showInfo}>
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              onClose={() => setShowInfo(false)}
              icon={<InfoIcon />}
            >
              <Typography variant="body2">
                La UIT es el valor de referencia utilizado en las normas tributarias para determinar 
                las bases imponibles, deducciones, límites de afectación y demás aspectos tributarios.
              </Typography>
            </Alert>
          </Fade>

          {/* Mostrar errores si hay */}
          {error && !loading && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Mostrando datos de demostración. {error}
            </Alert>
          )}

          {/* Cards de estadísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* UIT Vigente */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        UIT Vigente
                      </Typography>
                      <MoneyIcon color="primary" />
                    </Stack>
                    {loadingStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight={600} color="primary">
                          {uitVigente ? formatCurrency(uitVigente.valor) : 'S/ 5,350.00'}
                        </Typography>
                        <Chip 
                          label={`Año ${new Date().getFullYear()}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Total de registros */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Total Registros
                      </Typography>
                      <CalculateIcon color="action" />
                    </Stack>
                    {loadingStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight={600}>
                          {estadisticas?.totalRegistros || uits.length || 6}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Histórico completo
                        </Typography>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Variación anual */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Variación Anual
                      </Typography>
                      <TrendingUpIcon color="success" />
                    </Stack>
                    {loadingStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight={600} color="success.main">
                          {estadisticas?.variacionAnual || '3.9'}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Respecto al año anterior
                        </Typography>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Años disponibles */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Años Registrados
                      </Typography>
                      <CalendarIcon color="action" />
                    </Stack>
                    {loadingStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight={600}>
                          {estadisticas?.aniosDisponibles || '6'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Desde {estadisticas?.anioMinimo || '2020'} hasta {estadisticas?.anioMaximo || '2025'}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Componente principal UIT */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <UIT />
          </Paper>

          {/* Contenedor de notificaciones */}
          <NotificationContainer />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default UitPage;