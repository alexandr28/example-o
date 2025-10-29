// src/components/reportes/ReportesContribuyentes.tsx
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
  Alert
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useContribuyentes } from '../../hooks/useContribuyentes';
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

const ReportesContribuyentes: React.FC = () => {
  const { contribuyentes, loading, cargarContribuyentes } = useContribuyentes();

  const [filtros, setFiltros] = useState({
    tipoPersona: 'todos',
    tipoDocumento: 'todos'
  });

  React.useEffect(() => {
    if (contribuyentes.length === 0) {
      cargarContribuyentes();
    }
  }, []);

  const handleGenerarPDF = useCallback(() => {
    // Filtrar contribuyentes
    let contribuyentesFiltrados = contribuyentes;

    if (filtros.tipoPersona !== 'todos') {
      contribuyentesFiltrados = contribuyentesFiltrados.filter(
        c => c.tipoPersona === filtros.tipoPersona
      );
    }

    if (contribuyentesFiltrados.length === 0) {
      alert('No hay datos para generar el reporte');
      return;
    }

    // Preparar datos para la tabla
    const datosTabla = contribuyentesFiltrados.map(c => ({
      codigo: c.codigo,
      tipo: c.tipoPersona === 'juridica' ? 'Jurídica' : 'Natural',
      documento: c.documento,
      nombre: c.contribuyente,
      direccion: c.direccion || 'Sin dirección',
      telefono: c.telefono || 'Sin teléfono'
    }));

    // Definir columnas
    const columnas = [
      { header: 'Código', dataKey: 'codigo', width: 50, alignment: 'center' as const },
      { header: 'Tipo', dataKey: 'tipo', width: 60, alignment: 'center' as const },
      { header: 'Documento', dataKey: 'documento', width: 80, alignment: 'center' as const },
      { header: 'Nombre/Razón Social', dataKey: 'nombre', width: 150, alignment: 'left' as const },
      { header: 'Dirección', dataKey: 'direccion', width: 120, alignment: 'left' as const },
      { header: 'Teléfono', dataKey: 'telefono', width: 70, alignment: 'center' as const }
    ];

    // Crear documento PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: pdfMargins,
      header: () => ({
        stack: [
          ...createPdfHeader(
            'REPORTE DE CONTRIBUYENTES',
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
                createInfoRow('Total de contribuyentes', datosTabla.length.toString())
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Filtro Tipo Persona', filtros.tipoPersona === 'todos' ? 'Todos' : filtros.tipoPersona === 'natural' ? 'Natural' : 'Jurídica'),
                createInfoRow('Estado del sistema', 'Activo'),
                createInfoRow('Usuario', 'Sistema')
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },
        createDivider(),
        // Tabla de contribuyentes
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
                createInfoRow('Personas Naturales', datosTabla.filter(d => d.tipo === 'Natural').length.toString()),
                createInfoRow('Personas Jurídicas', datosTabla.filter(d => d.tipo === 'Jurídica').length.toString())
              ]
            },
            {
              width: '*',
              stack: [
                createInfoRow('Con Teléfono', datosTabla.filter(d => d.telefono !== 'Sin teléfono').length.toString()),
                createInfoRow('Sin Teléfono', datosTabla.filter(d => d.telefono === 'Sin teléfono').length.toString())
              ]
            }
          ]
        }
      ],
      styles: pdfStyles
    };

    // Generar y descargar PDF
    generateAndDownloadPdf(docDefinition, 'reporte_contribuyentes');
  }, [contribuyentes, filtros]);

  return (
    <Stack spacing={3}>
      {/* Descripción */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PdfIcon color="error" />
          Reporte de Contribuyentes (PDF)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genera un reporte detallado en PDF con la lista de contribuyentes registrados en el sistema.
          Utiliza filtros para personalizar tu reporte.
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
            label="Tipo de Persona"
            value={filtros.tipoPersona}
            onChange={(e) => setFiltros({ ...filtros, tipoPersona: e.target.value })}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="natural">Persona Natural</MenuItem>
            <MenuItem value="juridica">Persona Jurídica</MenuItem>
          </TextField>

          <TextField
            select
            label="Tipo de Documento"
            value={filtros.tipoDocumento}
            onChange={(e) => setFiltros({ ...filtros, tipoDocumento: e.target.value })}
            sx={{ minWidth: 200 }}
            size="small"
            disabled
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="dni">DNI</MenuItem>
            <MenuItem value="ruc">RUC</MenuItem>
          </TextField>
        </Stack>

        {/* Chips de filtros activos */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filtros.tipoPersona !== 'todos' && (
            <Chip
              label={`Tipo: ${filtros.tipoPersona === 'natural' ? 'Natural' : 'Jurídica'}`}
              color="primary"
              size="small"
              onDelete={() => setFiltros({ ...filtros, tipoPersona: 'todos' })}
            />
          )}
        </Box>
      </Paper>

      {/* Información de datos */}
      <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            <strong>{contribuyentes.length}</strong> contribuyentes disponibles para el reporte
          </Typography>
          <Chip
            label={`${contribuyentes.filter(c => c.tipoPersona === 'natural').length} Naturales | ${contribuyentes.filter(c => c.tipoPersona === 'juridica').length} Jurídicas`}
            size="small"
            color="info"
          />
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
          disabled={loading || contribuyentes.length === 0}
          sx={{ minWidth: 250, height: 50 }}
        >
          {loading ? 'Cargando datos...' : 'Generar PDF'}
        </Button>
      </Box>
    </Stack>
  );
};

export default ReportesContribuyentes;
