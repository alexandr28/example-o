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
  aniosDisponibles,
  tiposCasa,
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

  // Convertir opciones al formato de SearchableSelect
  const anioOptions = aniosDisponibles.map(anio => ({
    id: anio.value,
    value: parseInt(anio.value),
    label: anio.label,
    description: anio.value === new Date().getFullYear().toString() ? 'Año actual' : undefined
  }));

  const tipoCasaOptions = tiposCasa.map(tipo => ({
    id: tipo.value,
    value: tipo.value,
    label: tipo.label,
    description: getTipoCasaDescription(tipo.value)
  }));

  // Helper para descripciones de tipos de casa
  function getTipoCasaDescription(tipo: string): string {
    const descripciones: Record<string, string> = {
      'Casa-Habitación': 'Vivienda unifamiliar',
      'Comercio': 'Locales comerciales',
      'Industria': 'Instalaciones industriales',
      'Otros': 'Otros tipos de construcción'
    };
    return descripciones[tipo] || '';
  }

  // Manejar cambio de valores de conservación
  const handleConservacionChange = (index: number, value: string) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const newEstados = [...estadosConservacion];
      newEstados[index].value = parseFloat(value) || 0;
      setEstadosConservacion(newEstados);
    }
  };

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <TrendingDownIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Datos de depreciación
          </Typography>
        </Stack>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Selectores */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SearchableSelect
                label="Año"
                options={anioOptions}
                value={anioSeleccionado ? anioOptions.find(opt => opt.value === anioSeleccionado) || null : null}
                onChange={(option) => onAnioChange(option ? option.value : null)}
                placeholder="Seleccione el año"
                disabled={loading}
                required
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SearchableSelect
                label="Tipos de casa"
                options={tipoCasaOptions}
                value={tipoCasaSeleccionado ? tipoCasaOptions.find(opt => opt.value === tipoCasaSeleccionado) || null : null}
                onChange={(option) => onTipoCasaChange(option ? option.value : null)}
                placeholder="Seleccione el tipo"
                disabled={loading}
                required
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <HomeIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                )}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Estados de conservación */}
          <Box>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Estados de conservación
            </Typography>
            <Grid container spacing={2}>
              {estadosConservacion.map((estado, index) => (
                <Grid item xs={6} md={3} key={estado.nombre}>
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{
                py: 1.5,
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                },
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                '&:hover:not(:disabled)': {
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default Depreciacion;