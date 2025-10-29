// src/pages/fraccionamiento/AprobacionFraccionamientoPage.tsx
import React, { useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';
import { useFraccionamiento } from '../../hooks/useFraccionamiento';
import type { Fraccionamiento } from '../../types/fraccionamiento.types';

const solicitudesPendientes: Fraccionamiento[] = [
  {
    id: 2,
    codigoFraccionamiento: 'FRAC-2024-002',
    codigoContribuyente: 'CONT-002',
    nombreContribuyente: 'María López Sánchez',
    fechaSolicitud: '2024-10-20',
    montoTotal: 3280.00,
    montoCuotaInicial: 500.00,
    numeroCuotas: 18,
    montoCuota: 162.22,
    tasaInteres: 1.5,
    estado: 'PENDIENTE'
  }
];

const AprobacionFraccionamientoPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Fraccionamiento[]>(solicitudesPendientes);
  const [seleccionada, setSeleccionada] = useState<Fraccionamiento | null>(null);
  const [modalAprobar, setModalAprobar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const { aprobarSolicitud, rechazarSolicitud, cargando } = useFraccionamiento();

  const handleAprobar = useCallback(async () => {
    if (seleccionada?.id) {
      const exito = await aprobarSolicitud(seleccionada.id, {
        id: seleccionada.id,
        aprobado: true,
        observaciones
      });
      if (exito) {
        setModalAprobar(false);
        setSolicitudes(prev => prev.filter(s => s.id !== seleccionada.id));
        setObservaciones('');
      }
    }
  }, [seleccionada, observaciones, aprobarSolicitud]);

  const handleRechazar = useCallback(async () => {
    if (seleccionada?.id) {
      const exito = await rechazarSolicitud(seleccionada.id, motivoRechazo);
      if (exito) {
        setModalRechazar(false);
        setSolicitudes(prev => prev.filter(s => s.id !== seleccionada.id));
        setMotivoRechazo('');
      }
    }
  }, [seleccionada, motivoRechazo, rechazarSolicitud]);

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Aprobación de Fraccionamientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revise y apruebe o rechace las solicitudes de fraccionamiento pendientes
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={4} justifyContent="center">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Solicitudes Pendientes</Typography>
                <Typography variant="h3" fontWeight={700} color="warning.main">{solicitudes.length}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Código</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contribuyente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha Solicitud</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Monto Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Cuotas</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Cuota Mensual</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {solicitudes.map((sol) => (
                  <TableRow key={sol.id} hover>
                    <TableCell>{sol.codigoFraccionamiento}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{sol.nombreContribuyente}</Typography>
                      <Typography variant="caption" color="text.secondary">{sol.codigoContribuyente}</Typography>
                    </TableCell>
                    <TableCell>{new Date(sol.fechaSolicitud).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>S/ {sol.montoTotal.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={sol.numeroCuotas} size="small" />
                    </TableCell>
                    <TableCell align="right">S/ {sol.montoCuota.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => { setSeleccionada(sol); setModalAprobar(true); }}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => { setSeleccionada(sol); setModalRechazar(true); }}
                        >
                          Rechazar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {solicitudes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay solicitudes pendientes de aprobación
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Modal Aprobar */}
        <Dialog open={modalAprobar} onClose={() => setModalAprobar(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
            Aprobar Fraccionamiento
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {seleccionada && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="success">
                    Está por aprobar el fraccionamiento <strong>{seleccionada.codigoFraccionamiento}</strong>
                  </Alert>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Contribuyente:</Typography>
                  <Typography variant="body1" fontWeight={600}>{seleccionada.nombreContribuyente}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Monto Total:</Typography>
                  <Typography variant="h6" color="primary">S/ {seleccionada.montoTotal.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observaciones (Opcional)"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalAprobar(false)}>Cancelar</Button>
            <Button variant="contained" color="success" onClick={handleAprobar} disabled={cargando}>
              Confirmar Aprobación
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Rechazar */}
        <Dialog open={modalRechazar} onClose={() => setModalRechazar(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
            Rechazar Fraccionamiento
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {seleccionada && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="error">
                    Está por rechazar el fraccionamiento <strong>{seleccionada.codigoFraccionamiento}</strong>
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Motivo del Rechazo"
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Ingrese el motivo del rechazo..."
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalRechazar(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRechazar}
              disabled={!motivoRechazo || cargando}
            >
              Confirmar Rechazo
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default AprobacionFraccionamientoPage;
