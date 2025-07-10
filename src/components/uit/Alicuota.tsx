// src/components/uit/Alicuota.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  Tooltip,
  Collapse,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Percent as PercentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { Alicuota } from '../../models/UIT';

interface AlicuotaProps {
  alicuotas: Alicuota[];
  onActualizarAlicuotas?: (alicuotas: Alicuota[]) => void;
  editable?: boolean;
  loading?: boolean;
}

/**
 * Componente para mostrar y editar las alícuotas (rangos y tasas)
 */
const AlicuotaComponent: React.FC<AlicuotaProps> = ({
  alicuotas,
  onActualizarAlicuotas,
  editable = false,
  loading = false
}) => {
  const theme = useTheme();
  const [editandoAlicuotas, setEditandoAlicuotas] = useState<Alicuota[]>(alicuotas);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [alicuotasModificadas, setAlicuotasModificadas] = useState(false);

  // Actualizar cuando cambien las alícuotas externas
  useEffect(() => {
    if (!modoEdicion) {
      setEditandoAlicuotas(alicuotas);
    }
  }, [alicuotas, modoEdicion]);

  // Manejar cambio en una alícuota
  const handleAlicuotaChange = (id: number | undefined, value: string) => {
    if (modoEdicion && id !== undefined) {
      const tasa = parseFloat(value) || 0;
      const nuevasAlicuotas = editandoAlicuotas.map(a => 
        a.id === id ? { ...a, tasa } : a
      );
      setEditandoAlicuotas(nuevasAlicuotas);
      setAlicuotasModificadas(true);
    }
  };

  // Activar modo edición
  const activarEdicion = () => {
    setEditandoAlicuotas([...alicuotas]);
    setModoEdicion(true);
    setAlicuotasModificadas(false);
  };

  // Guardar cambios
  const guardarCambios = () => {
    if (onActualizarAlicuotas) {
      onActualizarAlicuotas(editandoAlicuotas);
    }
    setModoEdicion(false);
    setAlicuotasModificadas(false);
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoAlicuotas([...alicuotas]);
    setModoEdicion(false);
    setAlicuotasModificadas(false);
  };

  // Obtener color según el valor de la tasa
  const getTasaColor = (tasa: number) => {
    if (tasa <= 0.2) return theme.palette.success.main;
    if (tasa <= 0.6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
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
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendingUpIcon color="primary" fontSize="small" />
            <Typography variant="h6" fontWeight={500}>
              Lista de rangos y tasas
            </Typography>
          </Stack>
          
          {editable && !modoEdicion && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={activarEdicion}
              disabled={loading}
            >
              Cambiar tasas
            </Button>
          )}
        </Stack>
      </Box>
      
      <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
        {/* Mensaje informativo cuando está en modo edición */}
        <Collapse in={modoEdicion}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Modifique las tasas y haga clic en "Guardar" para aplicar los cambios
          </Alert>
        </Collapse>

        {/* Tabla de alícuotas */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  RANGO
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                  ALÍCUOTA
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(modoEdicion ? editandoAlicuotas : alicuotas).map((alicuota) => (
                <TableRow 
                  key={alicuota.id} 
                  sx={{ 
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.04) 
                    },
                    '&:last-child td': { 
                      borderBottom: 0 
                    }
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccountBalanceIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {alicuota.descripcion}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {modoEdicion ? (
                      <TextField
                        size="small"
                        type="number"
                        value={alicuota.tasa}
                        onChange={(e) => handleAlicuotaChange(alicuota.id, e.target.value)}
                        sx={{ width: 120 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <PercentIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          step: 0.01,
                          min: 0,
                          max: 100,
                          style: { textAlign: 'right' }
                        }}
                      />
                    ) : (
                      <Chip
                        label={`${alicuota.tasa.toFixed(2)}%`}
                        size="small"
                        sx={{
                          bgcolor: alpha(getTasaColor(alicuota.tasa), 0.1),
                          color: getTasaColor(alicuota.tasa),
                          fontWeight: 500,
                          minWidth: 80
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Botones de acción en modo edición */}
        {modoEdicion && (
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="flex-end" 
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={cancelarEdicion}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={guardarCambios}
              disabled={loading || !alicuotasModificadas}
            >
              Guardar cambios
            </Button>
          </Stack>
        )}

        {/* Información adicional */}
        {!modoEdicion && (
          <Box 
            sx={{ 
              mt: 3,
              p: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.08),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Las alícuotas se aplican de forma progresiva según los rangos de UIT establecidos
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AlicuotaComponent;