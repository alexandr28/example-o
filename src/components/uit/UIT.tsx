// src/components/uit/UIT.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUIT } from '../../hooks/useUIT';
import UitForm from './UitForm';
import UitList from './UitList';
import Alicuota from './Alicuota';

const UIT: React.FC = () => {
  const theme = useTheme();
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
    obtenerEstadisticas
  } = useUIT();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [mostrarAlicuotas, setMostrarAlicuotas] = useState(false);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());

  // Cargar estadísticas al montar
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const stats = await obtenerEstadisticas();
        setEstadisticas(stats);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };
    
    cargarEstadisticas();
  }, [obtenerEstadisticas, uits]);

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
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // Manejar edición
  const handleEditar = (uit: UITData) => {
    seleccionarUIT(uit);
    setModoEdicion(true);
  };

  // Manejar eliminación
  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este valor UIT?')) {
      try {
        await eliminarUIT(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  // Manejar nuevo
  const handleNuevo = () => {
    seleccionarUIT(null);
    setModoEdicion(false);
  };

  // Recargar datos
  const handleRecargar = async () => {
    await cargarUITs();
    const stats = await obtenerEstadisticas();
    setEstadisticas(stats);
  };

  return (
    <Box>
      {/* Header con información principal */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card UIT Vigente */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              height: '100%'
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  <Chip 
                    label="VIGENTE" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: 'white'
                    }} 
                  />
                </Box>
                
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    S/ {uitVigente?.valor?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Valor UIT {uitVigente?.anio || new Date().getFullYear()}
                  </Typography>
                </Box>
                
                {uitVigente && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Vigente desde: {new Date(uitVigente.fechaVigenciaDesde || '').toLocaleDateString()}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Estadísticas */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="h6">Estadísticas</Typography>
                </Box>
                
                {estadisticas ? (
                  <>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Incremento anual
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {estadisticas.incrementoAnual > 0 ? '+' : ''}{estadisticas.incrementoAnual.toFixed(2)}%
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Promedio últimos 5 años
                      </Typography>
                      <Typography variant="h6">
                        S/ {estadisticas.promedioUltimos5Anios.toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <CircularProgress size={30} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Resumen */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  <Typography variant="h6">Resumen</Typography>
                </Box>
                
                {estadisticas && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {estadisticas.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total UITs
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main">
                          {estadisticas.activos}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Activos
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRecargar}
                  disabled={loading}
                  fullWidth
                  size="small"
                >
                  Actualizar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert informativo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Calcule el impuesto predial basado en la UIT del año seleccionado. 
          Las alícuotas se aplican de forma progresiva según los rangos establecidos.
        </Typography>
      </Alert>

      {/* Tabs o secciones */}
      <Grid container spacing={3}>
        {/* Formulario UIT */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon color="primary" />
              Unidad Impositiva Tributaria
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <UitForm
              uitSeleccionada={uitSeleccionada}
              onGuardar={handleGuardar}
              onNuevo={handleNuevo}
              modoEdicion={modoEdicion}
              loading={loading}
              anioSeleccionado={anioSeleccionado}
              onAnioChange={setAnioSeleccionado}
            />
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setMostrarAlicuotas(!mostrarAlicuotas)}
                fullWidth
              >
                {mostrarAlicuotas ? 'Ocultar' : 'Ver'} Lista de rangos y tasas
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de UITs */}
        <Grid item xs={12} lg={7}>
          <UitList
            uits={uits}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            loading={loading}
            uitSeleccionada={uitSeleccionada}
          />
        </Grid>

        {/* Alícuotas */}
        {mostrarAlicuotas && (
          <Grid item xs={12}>
            <Alicuota anio={anioSeleccionado} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UIT;