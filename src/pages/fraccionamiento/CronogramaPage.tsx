// src/pages/fraccionamiento/CronogramaPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import { useFraccionamiento } from '../../hooks/useFraccionamiento';
import { useParams } from 'react-router-dom';
import type { CuotaFraccionamiento, Fraccionamiento } from '../../types/fraccionamiento.types';

// Datos de ejemplo
const fraccionamientoEjemplo: Fraccionamiento = {
  id: 1,
  codigoFraccionamiento: 'FRAC-2024-001',
  codigoContribuyente: 'CONT-001',
  nombreContribuyente: 'Juan Pérez García',
  fechaSolicitud: '2024-10-15',
  fechaAprobacion: '2024-10-18',
  montoTotal: 4329.00,
  montoCuotaInicial: 500.00,
  numeroCuotas: 12,
  montoCuota: 329.08,
  tasaInteres: 1.5,
  estado: 'VIGENTE',
  aprobadoPor: 'Admin Sistema'
};

const cronogramaEjemplo: CuotaFraccionamiento[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  numeroCuota: i + 1,
  fechaVencimiento: new Date(2024, 10 + i, 15).toISOString(),
  montoCapital: 300.00,
  montoInteres: 29.08,
  montoTotal: 329.08,
  estado: i < 2 ? 'PAGADA' : i === 2 ? 'VENCIDA' : 'PENDIENTE' as any,
  fechaPago: i < 2 ? new Date(2024, 10 + i, 10).toISOString() : undefined,
  montoPagado: i < 2 ? 329.08 : undefined
}));

const CronogramaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fraccionamiento, setFraccionamiento] = useState<Fraccionamiento>(fraccionamientoEjemplo);
  const [cronograma, setCronograma] = useState<CuotaFraccionamiento[]>(cronogramaEjemplo);
  const [modalPago, setModalPago] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<CuotaFraccionamiento | null>(null);
  const [montoPago, setMontoPago] = useState('');

  const { registrarPagoCuota, cargando } = useFraccionamiento();

  const cuotasPagadas = cronograma.filter(c => c.estado === 'PAGADA').length;
  const cuotasPendientes = cronograma.filter(c => c.estado === 'PENDIENTE').length;
  const cuotasVencidas = cronograma.filter(c => c.estado === 'VENCIDA').length;
  const montoPagado = cronograma.filter(c => c.estado === 'PAGADA').reduce((sum, c) => sum + (c.montoPagado || 0), 0);
  const montoPendiente = cronograma.filter(c => c.estado !== 'PAGADA').reduce((sum, c) => sum + c.montoTotal, 0);
  const progreso = (cuotasPagadas / cronograma.length) * 100;

  const handlePagar = useCallback((cuota: CuotaFraccionamiento) => {
    setCuotaSeleccionada(cuota);
    setMontoPago(cuota.montoTotal.toString());
    setModalPago(true);
  }, []);

  const handleConfirmarPago = useCallback(async () => {
    if (cuotaSeleccionada && fraccionamiento.id) {
      const exito = await registrarPagoCuota(
        fraccionamiento.id,
        cuotaSeleccionada.id!,
        parseFloat(montoPago)
      );
      if (exito) {
        setModalPago(false);
        setMontoPago('');
        // Actualizar estado local
        setCronograma(prev =>
          prev.map(c =>
            c.id === cuotaSeleccionada.id
              ? { ...c, estado: 'PAGADA', fechaPago: new Date().toISOString(), montoPagado: parseFloat(montoPago) }
              : c
          )
        );
      }
    }
  }, [cuotaSeleccionada, fraccionamiento, montoPago, registrarPagoCuota]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return 'success';
      case 'VENCIDA':
        return 'error';
      case 'PARCIAL':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Cronograma de Pagos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fraccionamiento.codigoFraccionamiento} - {fraccionamiento.nombreContribuyente}
          </Typography>
        </Box>

        {/* Información del Fraccionamiento */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Información del Fraccionamiento</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">Código:</Typography>
              <Typography variant="body1" fontWeight={600}>{fraccionamiento.codigoFraccionamiento}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">Fecha Aprobación:</Typography>
              <Typography variant="body1">
                {fraccionamiento.fechaAprobacion
                  ? new Date(fraccionamiento.fechaAprobacion).toLocaleDateString('es-PE')
                  : '-'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">Monto Total:</Typography>
              <Typography variant="h6" color="primary">S/ {fraccionamiento.montoTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="caption" color="text.secondary">Estado:</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={fraccionamiento.estado} color="success" />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Estadísticas */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Cuotas Pagadas</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {cuotasPagadas} / {cronograma.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Cuotas Pendientes</Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {cuotasPendientes}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Monto Pagado</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  S/ {montoPagado.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Monto Pendiente</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  S/ {montoPendiente.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Progreso */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Progreso de Pago</Typography>
            <Typography variant="h6" color="primary">{progreso.toFixed(1)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progreso} sx={{ height: 10, borderRadius: 5 }} />
        </Paper>

        {/* Tabla de Cronograma */}
        <Paper elevation={3}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Detalle de Cuotas</Typography>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Descargar PDF
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Cuota</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Vencimiento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Capital</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Interés</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha Pago</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cronograma.map((cuota) => (
                  <TableRow
                    key={cuota.id}
                    sx={{
                      bgcolor: cuota.estado === 'VENCIDA' ? 'error.lighter' :
                               cuota.estado === 'PAGADA' ? 'success.lighter' : 'inherit'
                    }}
                  >
                    <TableCell align="center">
                      <Chip label={`#${cuota.numeroCuota}`} size="small" />
                    </TableCell>
                    <TableCell>{new Date(cuota.fechaVencimiento).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell align="right">S/ {cuota.montoCapital.toFixed(2)}</TableCell>
                    <TableCell align="right">S/ {cuota.montoInteres.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>S/ {cuota.montoTotal.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={cuota.estado}
                        color={getEstadoColor(cuota.estado) as any}
                        size="small"
                        icon={cuota.estado === 'PAGADA' ? <CheckIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      {cuota.fechaPago
                        ? new Date(cuota.fechaPago).toLocaleDateString('es-PE')
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {cuota.estado === 'PENDIENTE' || cuota.estado === 'VENCIDA' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color={cuota.estado === 'VENCIDA' ? 'error' : 'primary'}
                          startIcon={<PaymentIcon />}
                          onClick={() => handlePagar(cuota)}
                        >
                          Pagar
                        </Button>
                      ) : (
                        <Chip label="Pagada" color="success" size="small" icon={<CheckIcon />} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Modal de Pago */}
        <Dialog open={modalPago} onClose={() => setModalPago(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Registrar Pago de Cuota
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {cuotaSeleccionada && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="info">
                  Cuota N° <strong>{cuotaSeleccionada.numeroCuota}</strong>
                </Alert>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Vencimiento:</Typography>
                    <Typography variant="body1">
                      {new Date(cuotaSeleccionada.fechaVencimiento).toLocaleDateString('es-PE')}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 0' }}>
                    <Typography variant="caption" color="text.secondary">Monto Cuota:</Typography>
                    <Typography variant="h6" color="primary">S/ {cuotaSeleccionada.montoTotal.toFixed(2)}</Typography>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Monto a Pagar (S/)"
                  value={montoPago}
                  onChange={(e) => setMontoPago(e.target.value)}
                  inputProps={{ min: 0, max: cuotaSeleccionada.montoTotal, step: 0.01 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalPago(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmarPago}
              disabled={!montoPago || parseFloat(montoPago) <= 0 || cargando}
            >
              Confirmar Pago
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default CronogramaPage;
