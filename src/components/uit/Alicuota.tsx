// src/components/uit/Alicuota.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Collapse,
  Alert,
  IconButton,
  Skeleton,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { useUIT } from '../../hooks/useUIT';
import { UITData } from '../../services/uitService';

interface AlicuotaProps {
  anio?: number;
}

/**
 * Componente para mostrar las alícuotas (rangos y tasas) del impuesto predial
 */
const Alicuota: React.FC<AlicuotaProps> = ({ 
  anio = new Date().getFullYear() 
}) => {
  const theme = useTheme();
  const { uits, loading, cargarUITs } = useUIT();
  const [expandido, setExpandido] = useState(true);
  const [valorPrueba, setValorPrueba] = useState('');
  const [resultadoCalculo, setResultadoCalculo] = useState<{
    baseImponible: number;
    impuesto: number;
    rangoAplicado: number;
  } | null>(null);

  // Cargar UITs del año si no están cargadas
  useEffect(() => {
    if (!uits || uits.length === 0) {
      cargarUITs();
    }
  }, [uits, cargarUITs]);

  // Filtrar UITs por año y ordenar por rango
  const alicuotas = uits
    .filter(uit => uit.anio === anio && uit.rangoInicial !== undefined)
    .sort((a, b) => (a.rangoInicial || 0) - (b.rangoInicial || 0));

  // Obtener UIT vigente para el año
  const uitVigente = uits.find(uit => uit.anio === anio && !uit.rangoInicial);
  const valorUIT = uitVigente?.valor || 0;

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Calcular impuesto según base imponible
  const calcularImpuesto = () => {
    if (!valorPrueba || !valorUIT) return;

    const base = parseFloat(valorPrueba);
    if (isNaN(base) || base <= 0) {
      setResultadoCalculo(null);
      return;
    }

    // Convertir base imponible a UITs
    const baseEnUITs = base / valorUIT;
    
    // Encontrar el rango aplicable
    const rangoAplicable = alicuotas.find(a => {
      const inicio = a.rangoInicial || 0;
      const fin = a.rangoFinal || Infinity;
      return baseEnUITs >= inicio && baseEnUITs <= fin;
    });

    if (!rangoAplicable) {
      setResultadoCalculo(null);
      return;
    }

    // Calcular impuesto
    const impuesto = base * (rangoAplicable.alicuota / 100);

    setResultadoCalculo({
      baseImponible: base,
      impuesto,
      rangoAplicado: rangoAplicable.alicuota
    });
  };

  // Obtener color según la alícuota
  const getAlicuotaColor = (alicuota: number): 'success' | 'warning' | 'error' => {
    if (alicuota <= 0.2) return 'success';
    if (alicuota <= 0.6) return 'warning';
    return 'error';
  };

  // Obtener descripción del rango
  const getRangoDescripcion = (inicio?: number, fin?: number): string => {
    if (!inicio && !fin) return 'Todos los valores';
    if (!fin || fin === 999999) return `Más de ${inicio} UIT`;
    return `De ${inicio} a ${fin} UIT`;
  };

  if (loading) {
    return (
      <Paper elevation={1} sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.info.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`,
          cursor: 'pointer'
        }}
        onClick={() => setExpandido(!expandido)}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <PercentIcon color="info" />
            <Typography variant="h6" fontWeight={500}>
              Alícuotas del Impuesto Predial - {anio}
            </Typography>
            {uitVigente && (
              <Chip 
                label={`UIT: ${formatCurrency(valorUIT)}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
          <IconButton size="small">
            {expandido ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expandido}>
        {/* Información */}
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ m: 3, mb: 2 }}
        >
          <Typography variant="body2">
            Las alícuotas se aplican de forma progresiva sobre la base imponible expresada en UITs.
            Para el año {anio}, el valor de la UIT es {formatCurrency(valorUIT)}.
          </Typography>
        </Alert>

        <Grid container spacing={3} sx={{ p: 3, pt: 0 }}>
          {/* Tabla de alícuotas */}
          <Grid item xs={12} md={7}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tramo</TableCell>
                    <TableCell>Rango (UIT)</TableCell>
                    <TableCell align="center">Alícuota</TableCell>
                    <TableCell align="right">Base en S/</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alicuotas.length > 0 ? (
                    alicuotas.map((alicuota, index) => (
                      <TableRow 
                        key={alicuota.id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.04) 
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            Tramo {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getRangoDescripcion(alicuota.rangoInicial, alicuota.rangoFinal)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatPercentage(alicuota.alicuota)}
                            size="small"
                            color={getAlicuotaColor(alicuota.alicuota)}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {alicuota.rangoInicial 
                              ? formatCurrency(alicuota.rangoInicial * valorUIT)
                              : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No hay alícuotas configuradas para el año {anio}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Calculadora */}
          <Grid item xs={12} md={5}>
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.grey[50],
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Calculadora de Impuesto
                </Typography>
                
                <TextField
                  label="Base Imponible"
                  value={valorPrueba}
                  onChange={(e) => setValorPrueba(e.target.value)}
                  type="number"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">S/</InputAdornment>
                  }}
                  helperText="Ingrese el valor del predio"
                />

                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={calcularImpuesto}
                  disabled={!valorPrueba || !valorUIT}
                  fullWidth
                >
                  Calcular Impuesto
                </Button>

                {resultadoCalculo && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Base Imponible:</strong> {formatCurrency(resultadoCalculo.baseImponible)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Base en UITs:</strong> {(resultadoCalculo.baseImponible / valorUIT).toFixed(2)} UIT
                      </Typography>
                      <Typography variant="body2">
                        <strong>Alícuota aplicada:</strong> {formatPercentage(resultadoCalculo.rangoAplicado)}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.dark">
                        <strong>Impuesto a pagar:</strong> {formatCurrency(resultadoCalculo.impuesto)}
                      </Typography>
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Footer con información adicional */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: theme.palette.grey[50],
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <TrendingUpIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Las alícuotas están establecidas según la normativa vigente y pueden variar según las ordenanzas municipales.
            </Typography>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default Alicuota;