// src/components/reportes/ReportesPredios.tsx
// Reporte de Predios con pdfmake
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Paper,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { usePredios } from '../../hooks/usePredioAPI';
import {
  createPdfHeader,
  createPdfFooter,
  createTable,
  pdfStyles,
  pdfMargins,
  generateAndDownloadPdf,
  createDivider,
  createInfoRow
} from '../../utils/pdfUtils';

const ReportesPredios: React.FC = () => {
  const { predios, cargarTodosPredios } = usePredios();

  const [filtros, setFiltros] = useState({
    estado: 'todos',
    sector: 'todos'
  });

  useEffect(() => {
    cargarTodosPredios();
  }, [cargarTodosPredios]);

  const handleGenerarPDF = useCallback(() => {
    // Filtrar predios
    let prediosFiltrados = predios;

    if (filtros.estado !== 'todos') {
      prediosFiltrados = prediosFiltrados.filter(
        p => {
          const estado = p.codEstado?.toString() || p.estado?.toString() || '';
          return estado === filtros.estado;
        }
      );
    }

    if (prediosFiltrados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Preparar datos para la tabla
    const datosTabla = prediosFiltrados.map(p => ({
      codigo: p.codigoPredio || p.codPredio || '-',
      direccion: typeof p.direccion === 'string' ? p.direccion : 'Sin dirección',
      sector: '-', // No disponible en el modelo actual
      area: p.areaTerreno ? `${p.areaTerreno} m²` : '-',
      pisos: p.numeroPisos || '-',
      estado: (p.codEstado?.toString() === '0201' || p.estado === true || p.estado === '1') ? 'Activo' : 'Inactivo'
    }));

    // Definir columnas
    const columnas = [
      { header: 'Código', dataKey: 'codigo', width: 70, alignment: 'center' as const },
      { header: 'Dirección', dataKey: 'direccion', width: 200, alignment: 'left' as const },
      { header: 'Sector', dataKey: 'sector', width: 50, alignment: 'center' as const },
      { header: 'Área', dataKey: 'area', width: 70, alignment: 'center' as const },
      { header: 'Pisos', dataKey: 'pisos', width: 45, alignment: 'center' as const },
      { header: 'Estado', dataKey: 'estado', width: 60, alignment: 'center' as const }
    ];

    // Calcular estadísticas
    const areaTotal = prediosFiltrados.reduce((sum, p) => sum + (parseFloat(p.areaTerreno || '0')), 0);
    const pisosTotal = prediosFiltrados.reduce((sum, p) => sum + (parseInt(p.numeroPisos || '0')), 0);

    // Crear documento PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: pdfMargins,
      header: () => ({
        stack: [
          ...createPdfHeader(
            'REPORTE DE PREDIOS',
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
                createInfoRow('Total de predios', datosTabla.length.toString())
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Filtro Estado', filtros.estado === 'todos' ? 'Todos' : filtros.estado === '0201' ? 'Activos' : 'Inactivos'),
                createInfoRow('Área total', `${areaTotal.toFixed(2)} m²`),
                createInfoRow('Total pisos', pisosTotal.toString())
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },
        createDivider(),
        // Tabla de predios
        createTable(columnas, datosTabla),
        // Resumen
        createDivider(),
        {
          text: 'Resumen Estadístico',
          style: 'subheader',
          margin: [0, 10, 0, 10]
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                createInfoRow('Predios Activos', datosTabla.filter(d => d.estado === 'Activo').length.toString()),
                createInfoRow('Predios Inactivos', datosTabla.filter(d => d.estado === 'Inactivo').length.toString()),
                createInfoRow('Área Total', `${areaTotal.toFixed(2)} m²`)
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Área Promedio', `${(areaTotal / datosTabla.length).toFixed(2)} m²`),
                createInfoRow('Total de Pisos', pisosTotal.toString()),
                createInfoRow('Promedio Pisos', (pisosTotal / datosTabla.length).toFixed(2))
              ]
            }
          ]
        }
      ],
      styles: pdfStyles
    };

    // Generar y descargar PDF
    generateAndDownloadPdf(docDefinition, 'reporte_predios');
  }, [predios, filtros]);

  return (
    <Stack spacing={3}>
      {/* Descripción */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HomeIcon color="primary" />
          <PdfIcon color="error" />
          Reporte de Predios (PDF)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera un reporte detallado en PDF con la lista de predios registrados en el sistema,
          incluyendo información de ubicación, área, número de pisos y estado.
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

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            select
            label="Estado"
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="0201">Activos</MenuItem>
            <MenuItem value="0202">Inactivos</MenuItem>
          </TextField>

          <TextField
            select
            label="Sector"
            value={filtros.sector}
            onChange={(e) => setFiltros({ ...filtros, sector: e.target.value })}
            sx={{ minWidth: 200 }}
            size="small"
            disabled
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="sector1">Sector 1</MenuItem>
            <MenuItem value="sector2">Sector 2</MenuItem>
          </TextField>
        </Stack>

        {/* Chips de filtros activos */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filtros.estado !== 'todos' && (
            <Chip
              label={`Estado: ${filtros.estado === '0201' ? 'Activos' : 'Inactivos'}`}
              color="primary"
              size="small"
              onDelete={() => setFiltros({ ...filtros, estado: 'todos' })}
            />
          )}
        </Box>
      </Paper>

      {/* Información de datos */}
      <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2">
            <strong>{predios.length}</strong> predios disponibles para el reporte
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`Activos: ${predios.filter(p => p.codEstado?.toString() === '0201' || p.estado === true || p.estado === '1').length}`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Inactivos: ${predios.filter(p => !(p.codEstado?.toString() === '0201' || p.estado === true || p.estado === '1')).length}`}
              size="small"
              color="default"
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
          disabled={predios.length === 0}
          sx={{ minWidth: 250, height: 50 }}
        >
          {predios.length === 0 ? 'Sin datos' : 'Generar PDF'}
        </Button>
      </Box>
    </Stack>
  );
};

export default ReportesPredios;
