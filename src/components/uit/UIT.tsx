// src/components/uit/UIT.tsx
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
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Calculate as CalculateIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';

interface UITProps {
  aniosDisponibles: { value: string, label: string }[];
  anioSeleccionado: number | null;
  montoCalculo: number;
  onAnioChange: (anio: number | null) => void;
  onMontoChange: (monto: number) => void;
  onCalcular: () => void;
  loading?: boolean;
}

/**
 * Componente para capturar los datos de cálculo de UIT
 */
const UIT: React.FC<UITProps> = ({
  aniosDisponibles,
  anioSeleccionado,
  montoCalculo,
  onAnioChange,
  onMontoChange,
  onCalcular,
  loading = false
}) => {
  const theme = useTheme();

  // Convertir opciones de años al formato de SearchableSelect
  const anioOptions = aniosDisponibles.map(anio => ({
    id: anio.value,
    value: parseInt(anio.value),
    label: anio.label,
    description: anio.value === new Date().getFullYear().toString() ? 'Año actual' : undefined
  }));

  // Manejar cambio de monto
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onMontoChange(parseFloat(value) || 0);
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
          <AccountBalanceIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Unidad Impositiva Tributaria
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
          </Box>
          
          {/* Campo Monto */}
          <Box>
            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={montoCalculo || ''}
              onChange={handleMontoChange}
              disabled={loading}
              placeholder="Ingresar monto"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">S/</InputAdornment>
              }}
              inputProps={{
                step: 0.01,
                min: 0
              }}
              helperText={anioSeleccionado ? "Ingrese el monto para calcular el impuesto" : "Seleccione primero el año"}
            />
          </Box>
          
          {/* Botón Calcular */}
          <Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onCalcular}
              disabled={loading || !anioSeleccionado || montoCalculo <= 0}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
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
              {loading ? 'Calculando...' : 'Calcular'}
            </Button>
          </Box>

          {/* Información adicional */}
          {anioSeleccionado && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.08),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography variant="caption" color="text.secondary">
                El cálculo se realizará basado en las alícuotas vigentes para el año {anioSeleccionado}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default UIT;