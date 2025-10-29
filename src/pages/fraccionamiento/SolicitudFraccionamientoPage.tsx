// src/pages/fraccionamiento/SolicitudFraccionamientoPage.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Calculate as CalculateIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import { useFraccionamiento } from '../../hooks/useFraccionamiento';
import SelectorContribuyente from '../../components/modal/SelectorContribuyente';
import type { DeudaFraccionamiento, SolicitudFraccionamientoForm } from '../../types/fraccionamiento.types';

const steps = ['Seleccionar Contribuyente', 'Seleccionar Deudas', 'Condiciones de Pago', 'Confirmar'];

const SolicitudFraccionamientoPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [modalContribuyente, setModalContribuyente] = useState(false);

  // Datos del formulario
  const [contribuyente, setContribuyente] = useState({
    codigo: '',
    nombre: ''
  });
  const [deudasDisponibles] = useState<DeudaFraccionamiento[]>([
    { id: 1, codigoDeuda: 'IP-2023-001', concepto: 'Impuesto Predial 2023', periodo: '2023', montoOriginal: 1500.00, montoInteres: 150.00, montoTotal: 1650.00 },
    { id: 2, codigoDeuda: 'ARB-2023-Q4', concepto: 'Arbitrios Q4 2023', periodo: '2023-Q4', montoOriginal: 450.00, montoInteres: 45.00, montoTotal: 495.00 },
    { id: 3, codigoDeuda: 'IP-2024-001', concepto: 'Impuesto Predial 2024', periodo: '2024', montoOriginal: 1600.00, montoInteres: 80.00, montoTotal: 1680.00 },
    { id: 4, codigoDeuda: 'ARB-2024-Q1', concepto: 'Arbitrios Q1 2024', periodo: '2024-Q1', montoOriginal: 480.00, montoInteres: 24.00, montoTotal: 504.00 }
  ]);
  const [deudasSeleccionadas, setDeudasSeleccionadas] = useState<number[]>([]);
  const [cuotaInicial, setCuotaInicial] = useState('500');
  const [numeroCuotas, setNumeroCuotas] = useState('12');
  const [tasaInteres, setTasaInteres] = useState('1.5');
  const [observaciones, setObservaciones] = useState('');
  const [confirmacionDialogo, setConfirmacionDialogo] = useState(false);

  const { crearSolicitud, cargando, error } = useFraccionamiento();

  // Calcular totales
  const montoTotal = useMemo(() => {
    return deudasDisponibles
      .filter(d => deudasSeleccionadas.includes(d.id!))
      .reduce((sum, d) => sum + d.montoTotal, 0);
  }, [deudasSeleccionadas, deudasDisponibles]);

  const montoFinanciar = useMemo(() => {
    return montoTotal - parseFloat(cuotaInicial || '0');
  }, [montoTotal, cuotaInicial]);

  const montoCuota = useMemo(() => {
    const cuotas = parseInt(numeroCuotas || '0');
    const tasa = parseFloat(tasaInteres || '0') / 100 / 12;

    if (cuotas === 0 || montoFinanciar <= 0) return 0;

    if (tasa === 0) {
      return montoFinanciar / cuotas;
    }

    // Cuota francesa
    const cuota = montoFinanciar * (tasa * Math.pow(1 + tasa, cuotas)) /
                  (Math.pow(1 + tasa, cuotas) - 1);
    return Math.round(cuota * 100) / 100;
  }, [montoFinanciar, numeroCuotas, tasaInteres]);

  const handleSeleccionarContribuyente = useCallback((contrib: any) => {
    setContribuyente({
      codigo: contrib.codigo || '',
      nombre: contrib.contribuyente || ''
    });
    setModalContribuyente(false);
  }, []);

  const handleToggleDeuda = useCallback((id: number) => {
    setDeudasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  }, []);

  const handleNext = useCallback(() => {
    setActiveStep(prev => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleConfirmar = useCallback(async () => {
    const deudasParaFraccionar = deudasDisponibles.filter(d => deudasSeleccionadas.includes(d.id!));

    const solicitud: SolicitudFraccionamientoForm = {
      codigoContribuyente: contribuyente.codigo,
      nombreContribuyente: contribuyente.nombre,
      deudas: deudasParaFraccionar,
      montoTotal,
      montoCuotaInicial: parseFloat(cuotaInicial || '0'),
      numeroCuotas: parseInt(numeroCuotas || '0'),
      tasaInteres: parseFloat(tasaInteres || '0'),
      observaciones
    };

    try {
      await crearSolicitud(solicitud);
      setConfirmacionDialogo(true);
    } catch (err) {
      console.error('Error al crear solicitud:', err);
    }
  }, [contribuyente, deudasDisponibles, deudasSeleccionadas, montoTotal, cuotaInicial, numeroCuotas, tasaInteres, observaciones, crearSolicitud]);

  const validarPaso = useCallback((paso: number): boolean => {
    switch (paso) {
      case 0:
        return contribuyente.codigo !== '';
      case 1:
        return deudasSeleccionadas.length > 0;
      case 2:
        return parseFloat(cuotaInicial || '0') >= 0 &&
               parseInt(numeroCuotas || '0') > 0 &&
               parseInt(numeroCuotas || '0') <= 36;
      default:
        return true;
    }
  }, [contribuyente.codigo, deudasSeleccionadas.length, cuotaInicial, numeroCuotas]);

  const renderPaso = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Seleccionar Contribuyente
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '0 1 400px' }}>
                    <TextField
                      fullWidth
                      label="Nombre del Contribuyente"
                      value={contribuyente.nombre}
                      InputProps={{ readOnly: true }}
                      placeholder="Seleccione un contribuyente..."
                    />
                  </Box>
                  <Box sx={{ flex: '0 1 200px' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={() => setModalContribuyente(true)}
                      sx={{ height: 38 }}
                    >
                      Buscar
                    </Button>
                  </Box>
                </Box>
                {contribuyente.codigo && (
                  <Alert severity="success">
                    <strong>Código:</strong> {contribuyente.codigo}
                  </Alert>
                )}
              </Box>
            </Paper>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon color="primary" />
              Seleccionar Deudas a Fraccionar
            </Typography>
            <Paper variant="outlined" sx={{ mt: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white' }} padding="checkbox">
                        <Checkbox
                          sx={{ color: 'white' }}
                          checked={deudasSeleccionadas.length === deudasDisponibles.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDeudasSeleccionadas(deudasDisponibles.map(d => d.id!));
                            } else {
                              setDeudasSeleccionadas([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Código</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Concepto</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Periodo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Capital</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Interés</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deudasDisponibles.map((deuda) => (
                      <TableRow key={deuda.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={deudasSeleccionadas.includes(deuda.id!)}
                            onChange={() => handleToggleDeuda(deuda.id!)}
                          />
                        </TableCell>
                        <TableCell>{deuda.codigoDeuda}</TableCell>
                        <TableCell>{deuda.concepto}</TableCell>
                        <TableCell>{deuda.periodo}</TableCell>
                        <TableCell align="right">S/ {deuda.montoOriginal.toFixed(2)}</TableCell>
                        <TableCell align="right">S/ {deuda.montoInteres.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>S/ {deuda.montoTotal.toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="body2">
                    <strong>{deudasSeleccionadas.length}</strong> deuda(s) seleccionada(s)
                  </Typography>
                  <Typography variant="h6" color="primary">
                    Total: S/ {montoTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon color="primary" />
              Condiciones de Pago
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 250px' }}>
                  <TextField
                    fullWidth
                    label="Cuota Inicial (S/)"
                    type="number"
                    value={cuotaInicial}
                    onChange={(e) => setCuotaInicial(e.target.value)}
                    inputProps={{ min: 0, max: montoTotal, step: 0.01 }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <TextField
                    fullWidth
                    label="Número de Cuotas"
                    type="number"
                    value={numeroCuotas}
                    onChange={(e) => setNumeroCuotas(e.target.value)}
                    inputProps={{ min: 1, max: 36 }}
                    helperText="Máximo 36 cuotas"
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <TextField
                    fullWidth
                    label="Tasa de Interés (%)"
                    type="number"
                    value={tasaInteres}
                    onChange={(e) => setTasaInteres(e.target.value)}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    helperText="Tasa anual"
                  />
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones adicionales..."
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Monto Total</Typography>
                    <Typography variant="h6" color="primary">S/ {montoTotal.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Cuota Inicial</Typography>
                    <Typography variant="h6" color="warning.main">S/ {parseFloat(cuotaInicial || '0').toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">A Financiar</Typography>
                    <Typography variant="h6" color="info.main">S/ {montoFinanciar.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 200px' }}>
                <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: 'white' }}>Cuota Mensual</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                      S/ {montoCuota.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon color="primary" />
              Confirmar Solicitud
            </Typography>

            <Stack spacing={3} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Datos del Contribuyente
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 0' }}>
                      <Typography variant="body2" color="text.secondary">Código:</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 0' }}>
                      <Typography variant="body2" fontWeight={600}>{contribuyente.codigo}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 0' }}>
                      <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 0' }}>
                      <Typography variant="body2" fontWeight={600}>{contribuyente.nombre}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Deudas Seleccionadas
                </Typography>
                <Divider sx={{ my: 2 }} />
                {deudasDisponibles
                  .filter(d => deudasSeleccionadas.includes(d.id!))
                  .map((deuda, index) => (
                    <Box key={deuda.id} sx={{ mb: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{index + 1}. {deuda.concepto}</Typography>
                        <Typography variant="body2" fontWeight={600}>S/ {deuda.montoTotal.toFixed(2)}</Typography>
                      </Stack>
                    </Box>
                  ))}
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Resumen del Fraccionamiento
                </Typography>
                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2">Monto Total:</Typography>
                    <Typography variant="body2" fontWeight={700}>S/ {montoTotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2">Cuota Inicial:</Typography>
                    <Typography variant="body2" fontWeight={700}>S/ {parseFloat(cuotaInicial || '0').toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2">A Financiar:</Typography>
                    <Typography variant="body2" fontWeight={700}>S/ {montoFinanciar.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2">Número de Cuotas:</Typography>
                    <Typography variant="body2" fontWeight={700}>{numeroCuotas} meses</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2">Tasa de Interés:</Typography>
                    <Typography variant="body2" fontWeight={700}>{tasaInteres}% anual</Typography>
                  </Box>
                  <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.5)' }} />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="h6">Cuota Mensual:</Typography>
                    <Typography variant="h6" fontWeight={700}>S/ {montoCuota.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Paper>

              {error && (
                <Alert severity="error">{error}</Alert>
              )}
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Nueva Solicitud de Fraccionamiento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete los pasos para crear una solicitud de fraccionamiento de deudas
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderPaso()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Anterior
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={cargando ? <CircularProgress size={20} /> : <PaymentIcon />}
                  onClick={handleConfirmar}
                  disabled={!validarPaso(activeStep) || cargando}
                  size="large"
                >
                  {cargando ? 'Procesando...' : 'Enviar Solicitud'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validarPaso(activeStep)}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Modal de contribuyente */}
        <SelectorContribuyente
          isOpen={modalContribuyente}
          onClose={() => setModalContribuyente(false)}
          onSelectContribuyente={handleSeleccionarContribuyente}
        />

        {/* Diálogo de confirmación */}
        <Dialog open={confirmacionDialogo} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
            Solicitud Enviada
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                ¡Solicitud de Fraccionamiento Creada!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                La solicitud ha sido enviada y está pendiente de aprobación
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => window.location.reload()} variant="contained">
              Nueva Solicitud
            </Button>
            <Button onClick={() => setConfirmacionDialogo(false)} variant="outlined">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default SolicitudFraccionamientoPage;
