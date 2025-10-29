// src/components/reportes/ReportesCuentas.tsx
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
  Receipt as ReceiptIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import { generatePdfFromHtml } from '../../utils/htmlToPdfUtils';

// Datos de ejemplo
const datosCuentaCorriente = [
  { fecha: '15/01/2024', concepto: 'Impuesto Predial 2024', tipo: 'Cargo', monto: 1500.00, saldo: 1500.00 },
  { fecha: '20/01/2024', concepto: 'Pago en efectivo', tipo: 'Abono', monto: -500.00, saldo: 1000.00 },
  { fecha: '05/02/2024', concepto: 'Arbitrios Q1 2024', tipo: 'Cargo', monto: 350.00, saldo: 1350.00 },
  { fecha: '15/02/2024', concepto: 'Pago con tarjeta', tipo: 'Abono', monto: -800.00, saldo: 550.00 },
  { fecha: '01/03/2024', concepto: 'Multa - Declaración tardía', tipo: 'Cargo', monto: 200.00, saldo: 750.00 },
  { fecha: '10/03/2024', concepto: 'Pago transferencia', tipo: 'Abono', monto: -750.00, saldo: 0.00 }
];

const ReportesCuentas: React.FC = () => {
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const handleGenerarPDF = useCallback(async () => {
    setGenerandoPdf(true);
    try {
      await generatePdfFromHtml('reporte-cuenta-corriente', {
        filename: 'reporte_cuenta_corriente',
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

  // Calcular totales
  const totalCargos = datosCuentaCorriente
    .filter(d => d.tipo === 'Cargo')
    .reduce((sum, d) => sum + d.monto, 0);

  const totalAbonos = Math.abs(datosCuentaCorriente
    .filter(d => d.tipo === 'Abono')
    .reduce((sum, d) => sum + d.monto, 0));

  const saldoFinal = datosCuentaCorriente[datosCuentaCorriente.length - 1]?.saldo || 0;

  return (
    <Stack spacing={3}>
      {/* Descripción */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon color="primary" />
          Reporte de Cuenta Corriente (Captura HTML)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera un reporte PDF manteniendo el diseño y estilos del sistema.
          Utiliza html2canvas para capturar la vista exacta como se muestra en pantalla.
        </Typography>
      </Box>

      <Alert severity="info">
        Este reporte captura el diseño exacto mostrado en pantalla, preservando todos los estilos Material-UI
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
        id="reporte-cuenta-corriente"
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: 'white',
          minHeight: 800
        }}
      >
        {/* Header del reporte */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
            SISTEMA DE GESTIÓN TRIBUTARIA
          </Typography>
          <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
            ESTADO DE CUENTA CORRIENTE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fecha de emisión: {new Date().toLocaleDateString('es-PE')} | Hora: {new Date().toLocaleTimeString('es-PE')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Información del contribuyente */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  DATOS DEL CONTRIBUYENTE
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Código:</Typography>
                    <Typography variant="body2">43905</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Nombre:</Typography>
                    <Typography variant="body2">Juan Pérez García</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Documento:</Typography>
                    <Typography variant="body2">DNI 12345678</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  RESUMEN DE CUENTA
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Total Cargos:</Typography>
                    <Typography variant="body2" color="error.main">
                      S/ {totalCargos.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Total Abonos:</Typography>
                    <Typography variant="body2" color="success.main">
                      S/ {totalAbonos.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={700}>Saldo Final:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={saldoFinal > 0 ? 'error.main' : 'success.main'}
                    >
                      S/ {saldoFinal.toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
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
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Concepto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Monto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Saldo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosCuentaCorriente.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                >
                  <TableCell>{row.fecha}</TableCell>
                  <TableCell>{row.concepto}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.tipo}
                      size="small"
                      color={row.tipo === 'Cargo' ? 'error' : 'success'}
                      sx={{ minWidth: 70 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={row.tipo === 'Cargo' ? 'error.main' : 'success.main'}
                      fontWeight={600}
                    >
                      S/ {Math.abs(row.monto).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      S/ {row.saldo.toFixed(2)}
                    </Typography>
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
                <strong>Nota:</strong> Este documento es una representación fiel del estado de cuenta
                al momento de su generación.
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

export default ReportesCuentas;
