// src/components/caja/reportes/ReporteEstadoCaja.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid
} from '@mui/material';
import {
  Download as DownloadIcon,
  AccountBalance as CajaIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { generatePdfFromHtml } from '../../../utils/htmlToPdfUtils';

// Datos de ejemplo
const datosEstadoCaja = {
  cajero: 'María García',
  fecha: '18/10/2024',
  horaApertura: '08:00 AM',
  horaActual: '04:45 PM',
  montoInicial: 500.00,
  montoActual: 8250.00,
  totalRecaudado: 7750.00,
  estado: 'Abierto'
};

const detalleMovimientos = [
  { hora: '09:15 AM', tipo: 'Pago', concepto: 'Impuesto Predial', monto: 1500.00, formaPago: 'Efectivo' },
  { hora: '09:45 AM', tipo: 'Pago', concepto: 'Arbitrios', monto: 350.00, formaPago: 'Tarjeta' },
  { hora: '10:20 AM', tipo: 'Pago', concepto: 'Multa', monto: 200.00, formaPago: 'Transferencia' },
  { hora: '11:00 AM', tipo: 'Pago', concepto: 'Alcabala', monto: 2800.00, formaPago: 'Efectivo' },
  { hora: '11:30 AM', tipo: 'Pago', concepto: 'Impuesto Predial', monto: 1200.00, formaPago: 'Efectivo' },
  { hora: '02:15 PM', tipo: 'Pago', concepto: 'Arbitrios', monto: 380.00, formaPago: 'Tarjeta' },
  { hora: '03:00 PM', tipo: 'Retiro', concepto: 'Depósito Banco', monto: -5000.00, formaPago: 'Efectivo' },
  { hora: '04:20 PM', tipo: 'Pago', concepto: 'Impuesto Predial', monto: 980.00, formaPago: 'Efectivo' },
  { hora: '04:35 PM', tipo: 'Pago', concepto: 'Licencia', monto: 1340.00, formaPago: 'Tarjeta' }
];

const ReporteEstadoCaja: React.FC = () => {
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const handleGenerarPDF = useCallback(async () => {
    setGenerandoPdf(true);
    try {
      await generatePdfFromHtml('reporte-estado-caja', {
        filename: 'estado_caja',
        orientation: 'portrait',
        scale: 2,
        quality: 0.95
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setGenerandoPdf(false);
    }
  }, []);

  // Calcular resumen
  const totalEfectivo = detalleMovimientos
    .filter(m => m.formaPago === 'Efectivo' && m.tipo === 'Pago')
    .reduce((sum, m) => sum + m.monto, 0);
  const totalTarjeta = detalleMovimientos
    .filter(m => m.formaPago === 'Tarjeta')
    .reduce((sum, m) => sum + m.monto, 0);
  const totalTransferencia = detalleMovimientos
    .filter(m => m.formaPago === 'Transferencia')
    .reduce((sum, m) => sum + m.monto, 0);
  const totalRetiros = Math.abs(detalleMovimientos
    .filter(m => m.tipo === 'Retiro')
    .reduce((sum, m) => sum + m.monto, 0));

  return (
    <Stack spacing={3}>
      {/* Descripción */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          Estado de Caja Detallado (Captura HTML)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera un reporte PDF capturando el diseño exacto del estado actual de caja,
          preservando todos los estilos Material-UI.
        </Typography>
      </Box>

      <Alert severity="info">
        Este reporte captura la vista exacta mostrada en pantalla, ideal para auditorías y registros visuales
      </Alert>

      {/* Botón de generación */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={generandoPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleGenerarPDF}
          disabled={generandoPdf}
          sx={{ minWidth: 250, height: 50 }}
        >
          {generandoPdf ? 'Generando PDF...' : 'Generar PDF'}
        </Button>
      </Box>

      {/* Contenedor del reporte que será capturado */}
      <Paper
        id="reporte-estado-caja"
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: 'white',
          minHeight: 900
        }}
      >
        {/* Header del reporte */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CajaIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            SISTEMA DE GESTIÓN TRIBUTARIA
          </Typography>
          <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
            ESTADO DE CAJA DETALLADO
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fecha de emisión: {new Date().toLocaleDateString('es-PE')} | Hora: {new Date().toLocaleTimeString('es-PE')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Información de la caja */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary.main" gutterBottom fontWeight={600}>
                  INFORMACIÓN DE CAJA
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Cajero:</Typography>
                    <Typography variant="body2">{datosEstadoCaja.cajero}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Fecha:</Typography>
                    <Typography variant="body2">{datosEstadoCaja.fecha}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Hora Apertura:</Typography>
                    <Typography variant="body2">{datosEstadoCaja.horaApertura}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Hora Actual:</Typography>
                    <Typography variant="body2">{datosEstadoCaja.horaActual}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Estado:</Typography>
                    <Chip
                      label={datosEstadoCaja.estado}
                      color={datosEstadoCaja.estado === 'Abierto' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'white' }}>
                  RESUMEN FINANCIERO
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Monto Inicial:</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      S/ {datosEstadoCaja.montoInicial.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Total Recaudado:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.light">
                      S/ {datosEstadoCaja.totalRecaudado.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={700}>Monto Actual:</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      S/ {datosEstadoCaja.montoActual.toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detalle por forma de pago */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
          RESUMEN POR FORMA DE PAGO
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Efectivo</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  S/ {totalEfectivo.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Tarjeta</Typography>
                <Typography variant="h6" fontWeight={700} color="info.main">
                  S/ {totalTarjeta.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Transferencia</Typography>
                <Typography variant="h6" fontWeight={700} color="warning.main">
                  S/ {totalTransferencia.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Retiros</Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  S/ {totalRetiros.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de movimientos */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
          DETALLE DE MOVIMIENTOS
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Hora</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Concepto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Monto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Forma Pago</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalleMovimientos.map((mov, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                >
                  <TableCell>{mov.hora}</TableCell>
                  <TableCell>
                    <Chip
                      label={mov.tipo}
                      size="small"
                      color={mov.tipo === 'Pago' ? 'success' : 'error'}
                      sx={{ minWidth: 65 }}
                    />
                  </TableCell>
                  <TableCell>{mov.concepto}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={mov.monto >= 0 ? 'success.main' : 'error.main'}
                    >
                      S/ {Math.abs(mov.monto).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{mov.formaPago}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer del reporte */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                <strong>Observaciones:</strong> Este documento representa el estado de caja al momento
                de su generación y debe ser verificado por el responsable.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Sistema de Gestión Tributaria Municipal
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Documento generado automáticamente
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Stack>
  );
};

export default ReporteEstadoCaja;
