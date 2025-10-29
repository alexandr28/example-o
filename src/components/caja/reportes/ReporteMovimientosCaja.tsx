// src/components/caja/reportes/ReporteMovimientosCaja.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Paper,
  MenuItem,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  CompareArrows as MovementsIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  createPdfHeader,
  createPdfFooter,
  createTable,
  pdfStyles,
  pdfMargins,
  generateAndDownloadPdf,
  createDivider,
  createInfoRow
} from '../../../utils/pdfUtils';

// Datos de ejemplo
const datosMovimientos = [
  { fecha: '18/10/2024', hora: '09:15 AM', tipoMovimiento: 'Pago', concepto: 'Impuesto Predial 2024', contribuyente: 'Juan Pérez', monto: 1500.00, formaPago: 'Efectivo', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '09:45 AM', tipoMovimiento: 'Pago', concepto: 'Arbitrios Q3 2024', contribuyente: 'Ana Martínez', monto: 350.00, formaPago: 'Tarjeta', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '10:20 AM', tipoMovimiento: 'Pago', concepto: 'Multa Declaración', contribuyente: 'Carlos López', monto: 200.00, formaPago: 'Transferencia', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '11:00 AM', tipoMovimiento: 'Pago', concepto: 'Alcabala', contribuyente: 'Rosa Silva', monto: 2800.00, formaPago: 'Efectivo', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '11:30 AM', tipoMovimiento: 'Pago', concepto: 'Impuesto Predial 2024', contribuyente: 'Luis Torres', monto: 1200.00, formaPago: 'Efectivo', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '02:15 PM', tipoMovimiento: 'Pago', concepto: 'Arbitrios Q4 2024', contribuyente: 'Patricia Díaz', monto: 380.00, formaPago: 'Tarjeta', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '03:00 PM', tipoMovimiento: 'Retiro', concepto: 'Retiro para Banco', contribuyente: '-', monto: 5000.00, formaPago: 'Efectivo', cajero: 'María García' },
  { fecha: '18/10/2024', hora: '04:20 PM', tipoMovimiento: 'Pago', concepto: 'Impuesto Predial 2024', contribuyente: 'Miguel Ramos', monto: 980.00, formaPago: 'Efectivo', cajero: 'María García' }
];

const ReporteMovimientosCaja: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState('todos');
  const [formaPago, setFormaPago] = useState('todos');

  const handleGenerarPDF = useCallback(() => {
    // Filtrar movimientos
    let movimientosFiltrados = datosMovimientos;

    if (tipoMovimiento !== 'todos') {
      movimientosFiltrados = movimientosFiltrados.filter(m => m.tipoMovimiento === tipoMovimiento);
    }

    if (formaPago !== 'todos') {
      movimientosFiltrados = movimientosFiltrados.filter(m => m.formaPago === formaPago);
    }

    if (movimientosFiltrados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Preparar datos para la tabla
    const datosTabla = movimientosFiltrados.map(m => ({
      fecha: m.fecha,
      hora: m.hora,
      tipo: m.tipoMovimiento,
      concepto: m.concepto,
      contribuyente: m.contribuyente,
      monto: `S/ ${m.monto.toFixed(2)}`,
      formaPago: m.formaPago
    }));

    // Definir columnas
    const columnas = [
      { header: 'Fecha', dataKey: 'fecha', width: 55, alignment: 'center' as const },
      { header: 'Hora', dataKey: 'hora', width: 50, alignment: 'center' as const },
      { header: 'Tipo', dataKey: 'tipo', width: 50, alignment: 'center' as const },
      { header: 'Concepto', dataKey: 'concepto', width: 120, alignment: 'left' as const },
      { header: 'Contribuyente', dataKey: 'contribuyente', width: 90, alignment: 'left' as const },
      { header: 'Monto', dataKey: 'monto', width: 60, alignment: 'right' as const },
      { header: 'Forma Pago', dataKey: 'formaPago', width: 60, alignment: 'center' as const }
    ];

    // Calcular totales
    const totalMovimientos = movimientosFiltrados.reduce((sum, m) => sum + m.monto, 0);
    const totalPagos = movimientosFiltrados.filter(m => m.tipoMovimiento === 'Pago').reduce((sum, m) => sum + m.monto, 0);
    const totalRetiros = movimientosFiltrados.filter(m => m.tipoMovimiento === 'Retiro').reduce((sum, m) => sum + m.monto, 0);

    // Crear documento PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: pdfMargins,
      header: () => ({
        stack: [
          ...createPdfHeader(
            'REPORTE DE MOVIMIENTOS DE CAJA',
            `Total de registros: ${datosTabla.length}`
          )
        ]
      }),
      footer: (currentPage: number, pageCount: number) => createPdfFooter(currentPage, pageCount),
      content: [
        // Información del reporte
        {
          columns: [
            {
              width: '*',
              stack: [
                createInfoRow('Fecha de generación', new Date().toLocaleDateString('es-PE')),
                createInfoRow('Hora', new Date().toLocaleTimeString('es-PE')),
                createInfoRow('Total movimientos', datosTabla.length.toString())
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Tipo Movimiento', tipoMovimiento === 'todos' ? 'Todos' : tipoMovimiento),
                createInfoRow('Forma de Pago', formaPago === 'todos' ? 'Todas' : formaPago),
                createInfoRow('Cajero', 'María García')
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },
        createDivider(),
        // Tabla de movimientos
        createTable(columnas, datosTabla),
        // Resumen
        createDivider(),
        {
          text: 'Resumen Financiero',
          style: 'subheader',
          margin: [0, 10, 0, 10]
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                createInfoRow('Total Pagos', `S/ ${totalPagos.toFixed(2)}`),
                createInfoRow('Total Retiros', `S/ ${totalRetiros.toFixed(2)}`),
                createInfoRow('Movimientos Totales', `S/ ${totalMovimientos.toFixed(2)}`)
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Pagos en Efectivo', movimientosFiltrados.filter(m => m.formaPago === 'Efectivo').length.toString()),
                createInfoRow('Pagos con Tarjeta', movimientosFiltrados.filter(m => m.formaPago === 'Tarjeta').length.toString()),
                createInfoRow('Pagos por Transferencia', movimientosFiltrados.filter(m => m.formaPago === 'Transferencia').length.toString())
              ]
            }
          ]
        }
      ],
      styles: pdfStyles
    };

    // Generar y descargar PDF
    generateAndDownloadPdf(docDefinition, 'reporte_movimientos_caja');
  }, [tipoMovimiento, formaPago, fechaInicio, fechaFin]);

  return (
    <Stack spacing={3}>
      {/* Descripción */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MovementsIcon color="primary" />
          <PdfIcon color="error" />
          Reporte de Movimientos de Caja (PDF)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera un reporte detallado de todos los movimientos de caja: pagos, cobros, retiros,
          con información de fecha, hora, concepto y forma de pago.
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Filtros de Reporte
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <DatePicker
              label="Fecha Inicio"
              value={fechaInicio}
              onChange={(newValue) => setFechaInicio(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <DatePicker
              label="Fecha Fin"
              value={fechaFin}
              onChange={(newValue) => setFechaFin(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="Tipo Movimiento"
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="Pago">Pagos</MenuItem>
              <MenuItem value="Retiro">Retiros</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="Forma de Pago"
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="todos">Todas</MenuItem>
              <MenuItem value="Efectivo">Efectivo</MenuItem>
              <MenuItem value="Tarjeta">Tarjeta</MenuItem>
              <MenuItem value="Transferencia">Transferencia</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFechaInicio(null);
                setFechaFin(null);
                setTipoMovimiento('todos');
                setFormaPago('todos');
              }}
              sx={{ height: 40 }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>

        {/* Chips de filtros activos */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {tipoMovimiento !== 'todos' && (
            <Chip
              label={`Tipo: ${tipoMovimiento}`}
              color="primary"
              size="small"
              onDelete={() => setTipoMovimiento('todos')}
            />
          )}
          {formaPago !== 'todos' && (
            <Chip
              label={`Forma Pago: ${formaPago}`}
              color="primary"
              size="small"
              onDelete={() => setFormaPago('todos')}
            />
          )}
        </Box>
      </Paper>

      {/* Información de datos */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>{datosMovimientos.length}</strong> movimientos registrados hoy
        </Typography>
      </Alert>

      {/* Botón de generación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleGenerarPDF}
          disabled={datosMovimientos.length === 0}
          sx={{ minWidth: 250, height: 50 }}
        >
          Generar PDF
        </Button>
      </Box>
    </Stack>
  );
};

export default ReporteMovimientosCaja;
