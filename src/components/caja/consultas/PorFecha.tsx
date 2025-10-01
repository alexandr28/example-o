// src/components/caja/consultas/PorFecha.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

// Styled Components
const FilterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.primary.main,
    '& .MuiTableCell-head': {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    }
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

// Interfaces
interface ReciboData {
  id: string;
  numeroRecibo: string;
  fecha: Date;
  contribuyente: string;
  rucDni: string;
  concepto: string;
  monto: number;
  estado: 'CANCELADO' | 'ANULADO';
  cajero: string;
}

interface PorFechaProps {
  onExportPdf?: () => void;
}

const PorFecha: React.FC<PorFechaProps> = ({ onExportPdf }) => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [recibos, setRecibos] = useState<ReciboData[]>([]);
  const [totalRecaudado, setTotalRecaudado] = useState(0);

  // Datos de ejemplo
  const recibosEjemplo: ReciboData[] = [
    {
      id: '1',
      numeroRecibo: 'R-2024-001234',
      fecha: new Date(),
      contribuyente: 'Garcia Lopez Juan Carlos',
      rucDni: '12345678',
      concepto: 'Impuesto Predial - 2024',
      monto: 1250.50,
      estado: 'CANCELADO',
      cajero: 'Maria Rodriguez'
    },
    {
      id: '2',
      numeroRecibo: 'R-2024-001235',
      fecha: new Date(),
      contribuyente: 'Empresa ABC S.A.C.',
      rucDni: '20123456789',
      concepto: 'Limpieza Publica - 2024',
      monto: 850.00,
      estado: 'CANCELADO',
      cajero: 'Carlos Mendoza'
    },
    {
      id: '3',
      numeroRecibo: 'R-2024-001236',
      fecha: new Date(),
      contribuyente: 'Rodriguez Silva Maria Elena',
      rucDni: '87654321',
      concepto: 'Parques y Jardines - 2024',
      monto: 320.75,
      estado: 'CANCELADO',
      cajero: 'Maria Rodriguez'
    }
  ];

  // Buscar recibos
  const handleBuscar = () => {
    setLoading(true);
    // Simular busqueda
    setTimeout(() => {
      setRecibos(recibosEjemplo);
      const total = recibosEjemplo.reduce((sum, recibo) => sum + recibo.monto, 0);
      setTotalRecaudado(total);
      setLoading(false);
    }, 1000);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setFechaInicio(new Date());
    setFechaFin(new Date());
    setRecibos([]);
    setTotalRecaudado(0);
  };

  // Ver detalle del recibo
  const handleVerDetalle = (recibo: ReciboData) => {
    console.log('Ver detalle del recibo:', recibo);
    // Aqui se puede abrir un modal con el detalle
  };

  // Imprimir recibo individual
  const handleImprimirRecibo = (recibo: ReciboData) => {
    console.log('Imprimir recibo:', recibo);
    // Logica de impresion individual
  };

  // Cargar busqueda inicial con fecha actual
  useEffect(() => {
    handleBuscar();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        {/* Filtros */}
        <FilterCard>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
            Filtros de Busqueda
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <DatePicker
              label="Fecha Inicio"
              value={fechaInicio}
              onChange={(newValue) => setFechaInicio(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 200 }
                }
              }}
              format="dd/MM/yyyy"
            />
            <DatePicker
              label="Fecha Fin"
              value={fechaFin}
              onChange={(newValue) => setFechaFin(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 200 }
                }
              }}
              format="dd/MM/yyyy"
              minDate={fechaInicio || undefined}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleBuscar}
              disabled={loading}
              sx={{ height: 40 }}
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleLimpiar}
              sx={{ height: 40 }}
            >
              Limpiar
            </Button>
          </Box>
        </FilterCard>

        {/* Resumen */}
        {recibos.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="body2">Total Recibos</Typography>
              <Typography variant="h5" fontWeight="bold">{recibos.length}</Typography>
            </Paper>
            <Paper sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="body2">Total Recaudado</Typography>
              <Typography variant="h5" fontWeight="bold">S/. {totalRecaudado.toFixed(2)}</Typography>
            </Paper>
            <Paper sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="body2">Periodo</Typography>
              <Typography variant="h6">
                {fechaInicio && format(fechaInicio, 'dd/MM/yyyy')} - {fechaFin && format(fechaFin, 'dd/MM/yyyy')}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Tabla de Resultados */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : recibos.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            No se encontraron recibos para el periodo seleccionado
          </Alert>
        ) : (
          <StyledTableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>N° Recibo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Contribuyente</TableCell>
                  <TableCell>RUC/DNI</TableCell>
                  <TableCell>Concepto</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Cajero</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recibos.map((recibo) => (
                  <TableRow key={recibo.id}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {recibo.numeroRecibo}
                    </TableCell>
                    <TableCell>{format(recibo.fecha, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{recibo.contribuyente}</TableCell>
                    <TableCell>{recibo.rucDni}</TableCell>
                    <TableCell>{recibo.concepto}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      S/. {recibo.monto.toFixed(2)}
                    </TableCell>
                    <TableCell>{recibo.cajero}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={recibo.estado}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Ver Detalle">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleVerDetalle(recibo)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleImprimirRecibo(recibo)}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default PorFecha;