// src/components/uit/UitFormAlicuota.tsx
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
  Button,
  TextField,
  InputAdornment,
  Collapse,
  Alert,
  IconButton,
  Skeleton,
  Autocomplete,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Percent as PercentIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Calculate as CalculateIcon,
  Save as SaveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useUIT } from '../../hooks/useUIT';
import { UITData } from '../../services/uitService';

interface UitFormAlicuotaProps {
  uitSeleccionada: UITData | null;
  onGuardar: (datos: any) => Promise<void>;
  onNuevo: () => void;
  modoEdicion: boolean;
  loading?: boolean;
  anioSeleccionado: number;
  onAnioChange: (anio: number) => void;
}

/**
 * Componente fusionado que incluye formulario UIT y visualización de alícuotas
 */
const UitFormAlicuota: React.FC<UitFormAlicuotaProps> = ({
  uitSeleccionada,
  onGuardar,
  onNuevo,
  modoEdicion,
  loading = false,
  anioSeleccionado,
  onAnioChange
}) => {
  const theme = useTheme();
  const { uits, loading: uitsLoading, cargarUITs } = useUIT();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    anio: anioSeleccionado || new Date().getFullYear(),
    valor: '',
    monto: ''
  });
  const [errors, setErrors] = useState<any>({});

  // Estados de las alícuotas
  const [expandidoAlicuotas, setExpandidoAlicuotas] = useState(true);
  const [valorPrueba, setValorPrueba] = useState('');
  const [resultadoCalculo, setResultadoCalculo] = useState<{
    baseImponible: number;
    impuesto: number;
    rangoAplicado: number;
  } | null>(null);

  // Generar opciones de años localmente (más confiable que el API de constantes)
  const currentYear = new Date().getFullYear();
  const anioOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
    id: (currentYear - i).toString()
  }));
  const loadingAnios = false;

  // Cargar UITs del año seleccionado
  useEffect(() => {
    if (anioSeleccionado && anioSeleccionado > 0) {
      console.log('🔄 [UitFormAlicuota] Cargando para año:', anioSeleccionado);
      cargarUITs(anioSeleccionado);
    }
  }, [anioSeleccionado]); // Removemos cargarUITs de las dependencias para evitar loops

  // Efecto para cargar datos cuando se selecciona una UIT
  useEffect(() => {
    if (uitSeleccionada && modoEdicion) {
      setFormData({
        anio: uitSeleccionada.anio,
        valor: uitSeleccionada.valor.toString(),
        monto: ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        anio: anioSeleccionado
      }));
    }
  }, [uitSeleccionada, modoEdicion, anioSeleccionado]);

  // Filtrar UITs por año y ordenar por rango para alícuotas
  // Los datos del API ya vienen con los campos: alicuota, rangoInicial, rangoFinal, impuestoParcial, impuestoAcumulado
  const alicuotas = uits
    .filter((uit): uit is UITData & { rangoInicial: number; alicuota: number } => {
      const filtro = uit.anio === anioSeleccionado && 
        uit.alicuota !== undefined && 
        uit.alicuota > 0 && 
        uit.rangoInicial !== undefined;
      return filtro;
    })
    .sort((a, b) => (a.rangoInicial || 0) - (b.rangoInicial || 0));

  // Log solo si hay cambios importantes
  console.log('📊 [UitFormAlicuota] Año:', anioSeleccionado, 'UITs:', uits.length, 'Alícuotas:', alicuotas.length);


  // Obtener UIT vigente para el año (buscar uno que tenga valorUit definido)
  const uitVigente = uits.find(uit => 
    uit.anio === anioSeleccionado && 
    (uit.valor > 0 || (uit.valorUit && uit.valorUit > 0))
  );
  // Usar valorUit si valor es null/0, tal como viene del API
  const valorUIT = uitVigente?.valor || uitVigente?.valorUit || 0;

  // Funciones de formateo
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Validar formulario
  const validarFormulario = () => {
    const newErrors: any = {};

    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'El valor UIT debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Si cambia el año, notificar al padre
    if (field === 'anio' && typeof value === 'number') {
      onAnioChange(value);
    }
  };

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      await onGuardar({
        anio: formData.anio,
        valor: parseFloat(formData.valor)
      });

      // Limpiar formulario después de guardar
      if (!modoEdicion) {
        setFormData({
          anio: anioSeleccionado,
          valor: '',
          monto: ''
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // Calcular impuesto según base imponible
  const calcularImpuesto = () => {
    if (!valorPrueba) return;

    const base = parseFloat(valorPrueba);
    if (isNaN(base) || base <= 0) {
      setResultadoCalculo(null);
      return;
    }

    // Los rangos ahora están en soles directamente, no en UITs
    const rangoAplicable = alicuotas.find(a => {
      const inicio = a.rangoInicial || 0;
      const fin = a.rangoFinal || Infinity;
      return base >= inicio && base <= fin;
    });

    if (!rangoAplicable) {
      setResultadoCalculo(null);
      return;
    }

    // Calcular impuesto - el API devuelve alicuota en decimal (ej: 0.2 para 20%)
    const porcentaje = rangoAplicable.alicuota;
    if (typeof porcentaje !== 'number') {
      setResultadoCalculo(null);
      return;
    }

    // El API devuelve la alícuota ya en decimal (0.2 = 20%), no necesita /100
    const impuesto = base * porcentaje;

    setResultadoCalculo({
      baseImponible: base,
      impuesto,
      rangoAplicado: porcentaje
    });
  };

  // Obtener color según la alícuota (recibe el valor en porcentaje para mostrar)
  const getAlicuotaColor = (alicuotaPorcentaje: number): 'success' | 'warning' | 'error' => {
    if (alicuotaPorcentaje <= 20) return 'success';
    if (alicuotaPorcentaje <= 60) return 'warning';
    return 'error';
  };


  return (
    <Box>
      {/* Formulario UIT */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon color="primary" />
          Unidad Impositiva Tributaria
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          {/* Formulario en una sola fila */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            alignItems: 'flex-start',
            mb: 2
          }}>
            {/* Selección de año */}
            <Box sx={{ flex: '0 0 120px', minWidth: '120px' }}>
              <Autocomplete
                options={anioOptions}
                getOptionLabel={(option) => option.label}
                value={anioOptions.find(opt => opt.value === formData.anio.toString()) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    const anio = parseInt(newValue.value);
                    handleChange('anio', anio);
                  }
                }}
                disabled={loading || modoEdicion || loadingAnios}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Año"
                    error={!!errors.anio}
                    helperText={errors.anio}
                    InputProps={{
                      ...params.InputProps,
                      sx: { height: 40 },
                      endAdornment: (
                        <>
                          {loadingAnios ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {/* Valor UIT */}
            <Box sx={{ flex: '0 0 100px', minWidth: '150px' }}>
              <TextField
                label="Valor UIT"
                type="number"
                size="small"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                error={!!errors.valor}
                InputProps={{
                  startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                  sx: { height: 40 }
                }}
                fullWidth
                required
                disabled={loading}
              />
            </Box>

            {/* Botones de acción en la misma fila */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flex: '0 0 auto'
            }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{ 
                  minWidth: 100,
                  height: 40,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onNuevo}
                disabled={loading}
                sx={{ 
                  minWidth: 90,
                  height: 40,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Nuevo
              </Button>
            </Box>
          </Box>

          {/* Errores debajo del formulario */}
          {(errors.anio || errors.valor) && (
            <Box sx={{ mt: 1 }}>
              {errors.anio && (
                <Typography variant="caption" color="error" display="block">
                  {errors.anio}
                </Typography>
              )}
              {errors.valor && (
                <Typography variant="caption" color="error" display="block">
                  {errors.valor}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Alícuotas */}
      <Paper 
        elevation={3}
        sx={{ 
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
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
          onClick={() => setExpandidoAlicuotas(!expandidoAlicuotas)}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PercentIcon color="info" />
              <Typography variant="h6" fontWeight={500}>
                Alícuotas del Impuesto Predial - {anioSeleccionado}
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
              {expandidoAlicuotas ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        </Box>

        <Collapse in={expandidoAlicuotas}>
          {uitsLoading ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={400} />
            </Box>
          ) : (
            <>
              {/* Información */}
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ m: 3, mb: 2 }}
              >
                <Typography variant="body2">
                  Las alícuotas se aplican de forma progresiva sobre la base imponible del predio.
                  Los rangos están expresados directamente en soles peruanos (S/).
                </Typography>
              </Alert>

              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                p: 3, 
                pt: 0,
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'flex-start'
              }}>
                {/* Tabla de alícuotas */}
                <Box sx={{ flex: { md: '1 1 60%' }, width: '100%' }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tramo</TableCell>
                          <TableCell>Rango Inicial (S/)</TableCell>
                          <TableCell>Rango Final (S/)</TableCell>
                          <TableCell align="center">Alícuota (%)</TableCell>
                          <TableCell align="right">Impuesto Parcial (S/)</TableCell>
                          <TableCell align="right">Impuesto Acumulado (S/)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {alicuotas.length > 0 ? (
                          alicuotas.map((alicuota, index) => (
                            <TableRow 
                              key={alicuota.id || `${alicuota.codEpa}-${index}`}
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
                                  {formatCurrency(alicuota.rangoInicial || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {alicuota.rangoFinal ? formatCurrency(alicuota.rangoFinal) : '∞'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={formatPercentage(alicuota.alicuota * 100)}
                                  size="small"
                                  color={getAlicuotaColor(alicuota.alicuota * 100)}
                                  variant="filled"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(alicuota.impuestoParcial || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(alicuota.impuestoAcumulado || 0)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                No hay alícuotas configuradas para el año {anioSeleccionado}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Calculadora */}
                <Box sx={{ flex: { md: '1 1 40%' }, width: '100%' }}>
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
                        sx={{ textTransform: 'none' }}
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
                              <strong>Alícuota aplicada:</strong> {formatPercentage(resultadoCalculo.rangoAplicado * 100)}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.dark">
                              <strong>Impuesto a pagar:</strong> {formatCurrency(resultadoCalculo.impuesto)}
                            </Typography>
                          </Stack>
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Box>

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
            </>
          )}
        </Collapse>
      </Paper>
    </Box>
  );
};

export default UitFormAlicuota;