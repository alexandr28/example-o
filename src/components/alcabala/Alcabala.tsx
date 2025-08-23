// src/components/alcabala/Alcabala.tsx
import React from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Percent as PercentIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';

interface AlcabalaProps {
  aniosDisponibles: { value: string, label: string }[];
  anioSeleccionado: number | null;
  tasa: number;
  onAnioChange: (anio: number | null) => void;
  onTasaChange: (tasa: number) => void;
  onRegistrar: () => void;
  loading?: boolean;
}

/**
 * Componente para capturar los datos de Alcabala con Material-UI
 */
const Alcabala: React.FC<AlcabalaProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  tasa,
  onAnioChange,
  onTasaChange,
  onRegistrar,
  loading = false
}) => {
  const theme = useTheme();

  // Convertir opciones de años al formato de SearchableSelect
  const anioOptions = aniosDisponibles.map(anio => ({
    value: parseInt(anio.value),
    label: anio.label
  }));

  // Manejar cambio de tasa
  const handleTasaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
      onTasaChange(parseFloat(value) || 0);
    }
  };

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%'
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
          <ReceiptIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Datos del alcabala
          </Typography>
        </Stack>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Campo Año con SearchableSelect */}
          <Box>
            <SearchableSelect
              label="Año"
              options={anioOptions}
              value={anioSeleccionado ?? undefined}
              onChange={(value) => onAnioChange(typeof value === 'number' ? value : null)}
              placeholder="Seleccione el año"
              disabled={loading}
              required
            />
          </Box>
          
          {/* Campo Tasa */}
          <Box>
            <TextField
              fullWidth
              label="Tasa"
              type="number"
              value={tasa}
              onChange={handleTasaChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PercentIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              inputProps={{
                step: 0.01,
                min: 0,
                max: 100
              }}
              helperText={anioSeleccionado ? `Tasa de alcabala para el año ${anioSeleccionado}` : "Seleccione primero el año"}
            />
          </Box>
          
          {/* Información adicional */}
          {anioSeleccionado && tasa > 0 && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.08),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Se aplicará una tasa del {tasa}% para las transferencias del año {anioSeleccionado}
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
              disabled={loading || !anioSeleccionado || tasa <= 0}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{
                py: 1.5,
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                },
                '&:disabled': {
                  bgcolor: theme.palette.action.disabledBackground,
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

export default Alcabala;