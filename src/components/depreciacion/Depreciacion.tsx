// src/components/depreciacion/Depreciacion.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  useTheme,
  alpha,
  CircularProgress,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as HighlightOffIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';

interface DepreciacionProps {
  aniosDisponibles: { value: string, label: string }[];
  tiposCasa: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tipoCasaSeleccionado: string | null;
  onAnioChange: (anio: number | null) => void;
  onTipoCasaChange: (tipoCasa: string | null) => void;
  onRegistrar: () => void;
  loading?: boolean;
}

interface EstadoConservacion {
  nombre: string;
  icon: React.ReactNode;
  color: string;
  value: number;
}

/**
 * Componente para capturar los datos de depreciación con Material-UI
 */
const Depreciacion: React.FC<DepreciacionProps> = ({
  aniosDisponibles = [], // Valor por defecto
  tiposCasa = [], // Valor por defecto
  anioSeleccionado,
  tipoCasaSeleccionado,
  onAnioChange,
  onTipoCasaChange,
  onRegistrar,
  loading = false
}) => {
  const theme = useTheme();
  
  // Estados de conservación con valores
  const [estadosConservacion, setEstadosConservacion] = useState<EstadoConservacion[]>([
    { 
      nombre: 'Muy bueno', 
      icon: <CheckCircleIcon />, 
      color: theme.palette.success.main,
      value: 0.00 
    },
    { 
      nombre: 'Bueno', 
      icon: <CheckCircleIcon />, 
      color: theme.palette.info.main,
      value: 0.00 
    },
    { 
      nombre: 'Regular', 
      icon: <WarningIcon />, 
      color: theme.palette.warning.main,
      value: 0.00 
    },
    { 
      nombre: 'Malo', 
      icon: <ErrorIcon />, 
      color: theme.palette.error.main,
      value: 0.00 
    }
  ]);

  // Convertir opciones al formato de SearchableSelect con validación
  const anioOptions = (aniosDisponibles || []).map(anio => ({
    id: anio.value,
    value: parseInt(anio.value),
    label: anio.label,
    description: anio.value === new Date().getFullYear().toString() ? 'Año actual' : undefined
  }));

  const tipoCasaOptions = (tiposCasa || []).map(tipo => ({
    id: tipo.value,
    value: tipo.value,
    label: tipo.label
  }));

  const handleAnioSelect = (option: any) => {
    onAnioChange(option ? option.value : null);
  };

  const handleTipoCasaSelect = (option: any) => {
    onTipoCasaChange(option ? option.value : null);
  };

  const handleConservacionChange = (index: number, value: string) => {
    const nuevosEstados = [...estadosConservacion];
    nuevosEstados[index].value = parseFloat(value) || 0;
    setEstadosConservacion(nuevosEstados);
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3,
        background: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Box>
        {/* Título de la sección */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingDownIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Registrar Depreciación
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure los valores de depreciación por estado
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Formulario */}
        <Stack spacing={3}>
          {/* Selección de Año */}
          <Box>
            <Typography variant="subtitle2" fontWeight={500} mb={1}>
              Año
            </Typography>
            <SearchableSelect
              options={anioOptions}
              value={anioSeleccionado ? anioOptions.find(opt => opt.value === anioSeleccionado) : null}
              onChange={handleAnioSelect}
              placeholder="Seleccione el año"
              label="Año"
              icon={<CalendarIcon />}
              disabled={loading}
              fullWidth
            />
          </Box>

          {/* Selección de Tipo de Casa */}
          <Box>
            <Typography variant="subtitle2" fontWeight={500} mb={1}>
              Tipo de Casa
            </Typography>
            <SearchableSelect
              options={tipoCasaOptions}
              value={tipoCasaSeleccionado ? tipoCasaOptions.find(opt => opt.value === tipoCasaSeleccionado) : null}
              onChange={handleTipoCasaSelect}
              placeholder="Seleccione el tipo de casa"
              label="Tipo de Casa"
              icon={<HomeIcon />}
              disabled={loading || !anioSeleccionado}
              fullWidth
            />
          </Box>

          {/* Estados de Conservación */}
          <Box>
            <Typography variant="subtitle2" fontWeight={500} mb={2}>
              Estados de Conservación
            </Typography>
            <Grid container spacing={2}>
              {estadosConservacion.map((estado, index) => (
                <Grid item xs={12} sm={6} key={estado.nombre}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Box sx={{ color: estado.color }}>
                        {estado.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {estado.nombre}
                      </Typography>
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={estado.value}
                      onChange={(e) => handleConservacionChange(index, e.target.value)}
                      disabled={loading || !anioSeleccionado || !tipoCasaSeleccionado}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TrendingDownIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      inputProps={{
                        step: 0.01,
                        min: 0,
                        max: 100
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: estado.color,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: estado.color,
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Información adicional */}
          {anioSeleccionado && tipoCasaSeleccionado && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.08),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Configure los porcentajes de depreciación para {tipoCasaSeleccionado} en el año {anioSeleccionado}
              </Typography>
            </Box>
          )}

          {/* Botón Registrar */}
          <Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onRegistrar}
              disabled={loading || !anioSeleccionado || !tipoCasaSeleccionado}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                height: 48,
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              {loading ? 'Registrando...' : 'Registrar Depreciación'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default Depreciacion;