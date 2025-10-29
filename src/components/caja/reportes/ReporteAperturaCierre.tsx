// src/components/caja/reportes/ReporteAperturaCierre.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Paper,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon
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
const datosAperturasCierres = [
  {
    fecha: '15/10/2024',
    cajero: 'Juan Pérez',
    horaApertura: '08:00 AM',
    horaCierre: '05:00 PM',
    montoInicial: 500.00,
    montoFinal: 3250.00,
    totalRecaudado: 2750.00,
    estado: 'Cerrado'
  },
  {
    fecha: '16/10/2024',
    cajero: 'María García',
    horaApertura: '08:00 AM',
    horaCierre: '05:00 PM',
    montoInicial: 500.00,
    montoFinal: 4120.00,
    totalRecaudado: 3620.00,
    estado: 'Cerrado'
  },
  {
    fecha: '17/10/2024',
    cajero: 'Carlos López',
    horaApertura: '08:00 AM',
    horaCierre: '05:00 PM',
    montoInicial: 500.00,
    montoFinal: 2890.00,
    totalRecaudado: 2390.00,
    estado: 'Cerrado'
  },
  {
    fecha: '18/10/2024',
    cajero: 'Ana Martínez',
    horaApertura: '08:00 AM',
    horaCierre: '-',
    montoInicial: 500.00,
    montoFinal: 0.00,
    totalRecaudado: 1250.00,
    estado: 'Abierto'
  }
];

const ReporteAperturaCierre: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [cajero, setCajero] = useState('');

  const handleGenerarPDF = useCallback(() => {
    if (datosAperturasCierres.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Preparar datos para la tabla
    const datosTabla = datosAperturasCierres.map(d => ({
      fecha: d.fecha,
      cajero: d.cajero,
      horaApertura: d.horaApertura,
      horaCierre: d.horaCierre,
      montoInicial: `S/ ${d.montoInicial.toFixed(2)}`,
      montoFinal: `S/ ${d.montoFinal.toFixed(2)}`,
      totalRecaudado: `S/ ${d.totalRecaudado.toFixed(2)}`,
      estado: d.estado
    }));

    // Definir columnas
    const columnas = [
      { header: 'Fecha', dataKey: 'fecha', width: 60, alignment: 'center' as const },
      { header: 'Cajero', dataKey: 'cajero', width: 80, alignment: 'left' as const },
      { header: 'H. Apertura', dataKey: 'horaApertura', width: 55, alignment: 'center' as const },
      { header: 'H. Cierre', dataKey: 'horaCierre', width: 55, alignment: 'center' as const },
      { header: 'Monto Inicial', dataKey: 'montoInicial', width: 60, alignment: 'right' as const },
      { header: 'Monto Final', dataKey: 'montoFinal', width: 60, alignment: 'right' as const },
      { header: 'Recaudado', dataKey: 'totalRecaudado', width: 60, alignment: 'right' as const },
      { header: 'Estado', dataKey: 'estado', width: 50, alignment: 'center' as const }
    ];

    // Calcular totales
    const totalInicial = datosAperturasCierres.reduce((sum, d) => sum + d.montoInicial, 0);
    const totalFinal = datosAperturasCierres.reduce((sum, d) => sum + d.montoFinal, 0);
    const totalRecaudado = datosAperturasCierres.reduce((sum, d) => sum + d.totalRecaudado, 0);

    // Crear documento PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: pdfMargins,
      header: () => ({
        stack: [
          ...createPdfHeader(
            'REPORTE DE APERTURA Y CIERRE DE CAJA',
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
                createInfoRow('Total registros', datosTabla.length.toString())
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Periodo', fechaInicio && fechaFin ?
                  `${fechaInicio.toLocaleDateString('es-PE')} - ${fechaFin.toLocaleDateString('es-PE')}` : 'Todos'),
                createInfoRow('Cajero', cajero || 'Todos'),
                createInfoRow('Estado del sistema', 'Activo')
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },
        createDivider(),
        // Tabla de aperturas y cierres
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
                createInfoRow('Total Monto Inicial', `S/ ${totalInicial.toFixed(2)}`),
                createInfoRow('Total Monto Final', `S/ ${totalFinal.toFixed(2)}`),
                createInfoRow('Total Recaudado', `S/ ${totalRecaudado.toFixed(2)}`)
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Cajas Cerradas', datosAperturasCierres.filter(d => d.estado === 'Cerrado').length.toString()),
                createInfoRow('Cajas Abiertas', datosAperturasCierres.filter(d => d.estado === 'Abierto').length.toString()),
                createInfoRow('Promedio Recaudado', `S/ ${(totalRecaudado / datosTabla.length).toFixed(2)}`)
              ]
            }
          ]
        }
      ],
      styles: pdfStyles
    };

    // Generar y descargar PDF
    generateAndDownloadPdf(docDefinition, 'reporte_apertura_cierre_caja');
  }, [fechaInicio, fechaFin, cajero]);

  return (
    <Stack spacing={3}>
      {/* Descripción */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon color="primary" />
          <PdfIcon color="error" />
          Reporte de Apertura y Cierre de Caja (PDF)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera un reporte detallado de las aperturas y cierres de caja por fecha y cajero,
          incluyendo montos iniciales, finales y totales recaudados.
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
          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Cajero"
              value={cajero}
              onChange={(e) => setCajero(e.target.value)}
              fullWidth
              size="small"
              placeholder="Nombre del cajero..."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFechaInicio(null);
                setFechaFin(null);
                setCajero('');
              }}
              sx={{ height: 40 }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>

        {/* Chips de filtros activos */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {fechaInicio && (
            <Chip
              label={`Desde: ${fechaInicio.toLocaleDateString('es-PE')}`}
              color="primary"
              size="small"
              onDelete={() => setFechaInicio(null)}
            />
          )}
          {fechaFin && (
            <Chip
              label={`Hasta: ${fechaFin.toLocaleDateString('es-PE')}`}
              color="primary"
              size="small"
              onDelete={() => setFechaFin(null)}
            />
          )}
          {cajero && (
            <Chip
              label={`Cajero: ${cajero}`}
              color="primary"
              size="small"
              onDelete={() => setCajero('')}
            />
          )}
        </Box>
      </Paper>

      {/* Información de datos */}
      <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2">
            <strong>{datosAperturasCierres.length}</strong> registros disponibles para el reporte
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`Cerradas: ${datosAperturasCierres.filter(d => d.estado === 'Cerrado').length}`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Abiertas: ${datosAperturasCierres.filter(d => d.estado === 'Abierto').length}`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>
      </Alert>

      {/* Botón de generación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleGenerarPDF}
          disabled={datosAperturasCierres.length === 0}
          sx={{ minWidth: 250, height: 50 }}
        >
          Generar PDF
        </Button>
      </Box>
    </Stack>
  );
};

export default ReporteAperturaCierre;
