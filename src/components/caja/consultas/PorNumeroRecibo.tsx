// src/components/caja/consultas/PorNumeroRecibo.tsx
import React, { useState } from 'react';
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
  Alert,
  InputAdornment,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
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

const DetailCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: `2px solid ${theme.palette.primary.main}`
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'flex-start'
}));

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginRight: theme.spacing(1),
  minWidth: 120
}));

// Interfaces
interface ReciboDetalle {
  id: string;
  numeroRecibo: string;
  fecha: Date;
  contribuyente: {
    nombre: string;
    rucDni: string;
    direccion: string;
  };
  conceptos: {
    descripcion: string;
    monto: number;
    periodo: string;
  }[];
  montoTotal: number;
  estado: 'CANCELADO' | 'ANULADO' | 'PENDIENTE';
  cajero: string;
  fechaPago: Date;
  formaPago: string;
  observaciones?: string;
}

interface PorNumeroReciboProps {
  onExportPdf?: () => void;
}

const PorNumeroRecibo: React.FC<PorNumeroReciboProps> = ({ onExportPdf }) => {
  const [loading, setLoading] = useState(false);
  const [numeroRecibo, setNumeroRecibo] = useState('');
  const [reciboDetalle, setReciboDetalle] = useState<ReciboDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Datos de ejemplo
  const reciboEjemplo: ReciboDetalle = {
    id: '1',
    numeroRecibo: 'R-2024-001234',
    fecha: new Date(2024, 0, 15),
    contribuyente: {
      nombre: 'Garcia Lopez Juan Carlos',
      rucDni: '12345678',
      direccion: 'Av. Principal 123, Lima'
    },
    conceptos: [
      { descripcion: 'Impuesto Predial - 2024', monto: 850.50, periodo: '2024' },
      { descripcion: 'Limpieza Publica - 2024', monto: 250.00, periodo: '2024' },
      { descripcion: 'Parques y Jardines - 2024', monto: 150.00, periodo: '2024' }
    ],
    montoTotal: 1250.50,
    estado: 'CANCELADO',
    cajero: 'Maria Rodriguez',
    fechaPago: new Date(2024, 0, 15),
    formaPago: 'CONTADO',
    observaciones: 'Pago completo del año 2024'
  };

  // Buscar recibo por numero
  const handleBuscar = () => {
    if (!numeroRecibo.trim()) {
      setError('Ingrese un numero de recibo');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      // Simular busqueda
      if (numeroRecibo === 'R-2024-001234') {
        setReciboDetalle(reciboEjemplo);
      } else {
        setReciboDetalle(null);
        setError(`No se encontro el recibo N° ${numeroRecibo}`);
      }
      setLoading(false);
    }, 1000);
  };

  // Limpiar busqueda
  const handleLimpiar = () => {
    setNumeroRecibo('');
    setReciboDetalle(null);
    setError(null);
  };

  // Imprimir recibo
  const handleImprimir = () => {
    if (reciboDetalle) {
      console.log('Imprimir recibo:', reciboDetalle);
      window.print();
    }
  };

  // Ver detalle completo
  const handleVerDetalle = () => {
    if (reciboDetalle) {
      console.log('Ver detalle completo:', reciboDetalle);
    }
  };

  return (
    <Box>
      {/* Filtros */}
      <FilterCard>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
          Buscar Recibo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="Numero de Recibo"
            placeholder="Ej: R-2024-001234"
            value={numeroRecibo}
            onChange={(e) => setNumeroRecibo(e.target.value.toUpperCase())}
            size="small"
            sx={{ minWidth: 250 }}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptIcon color="primary" />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleBuscar();
            }}
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

      {/* Resultados */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : !reciboDetalle && !error ? (
        <Alert severity="info" sx={{ borderRadius: 1 }}>
          Ingrese un numero de recibo para buscar
        </Alert>
      ) : reciboDetalle ? (
        <DetailCard>
          <CardContent sx={{ p: 3 }}>
            {/* Header del recibo */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {reciboDetalle.numeroRecibo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fecha emision: {format(reciboDetalle.fecha, 'dd/MM/yyyy')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={reciboDetalle.estado}
                  color={reciboDetalle.estado === 'CANCELADO' ? 'success' : 'default'}
                  sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                />
                <Tooltip title="Imprimir Recibo">
                  <IconButton color="primary" onClick={handleImprimir}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Ver Detalle Completo">
                  <IconButton color="primary" onClick={handleVerDetalle}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Informacion del contribuyente */}
            <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'white', mb: 3, borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Datos del Contribuyente
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <InfoItem>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {reciboDetalle.contribuyente.nombre}
                    </Typography>
                  </InfoItem>
                  <InfoItem>
                    <Typography variant="body2">
                      <strong>RUC/DNI:</strong> {reciboDetalle.contribuyente.rucDni}
                    </Typography>
                  </InfoItem>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <InfoItem>
                    <Typography variant="body2">
                      <strong>Direccion:</strong> {reciboDetalle.contribuyente.direccion}
                    </Typography>
                  </InfoItem>
                </Box>
              </Box>
            </Paper>

            {/* Conceptos */}
            <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
              Conceptos del Recibo
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Concepto</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Periodo</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reciboDetalle.conceptos.map((concepto, index) => (
                    <TableRow key={index}>
                      <TableCell>{concepto.descripcion}</TableCell>
                      <TableCell>{concepto.periodo}</TableCell>
                      <TableCell align="right">S/. {concepto.monto.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      TOTAL
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}>
                      S/. {reciboDetalle.montoTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Informacion adicional */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <InfoItem>
                  <Label>Fecha de Pago:</Label>
                  <Typography>{format(reciboDetalle.fechaPago, 'dd/MM/yyyy HH:mm')}</Typography>
                </InfoItem>
                <InfoItem>
                  <Label>Forma de Pago:</Label>
                  <Typography>{reciboDetalle.formaPago}</Typography>
                </InfoItem>
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <InfoItem>
                  <Label>Cajero:</Label>
                  <Typography>{reciboDetalle.cajero}</Typography>
                </InfoItem>
                {reciboDetalle.observaciones && (
                  <InfoItem>
                    <Label>Observaciones:</Label>
                    <Typography>{reciboDetalle.observaciones}</Typography>
                  </InfoItem>
                )}
              </Box>
            </Box>
          </CardContent>
        </DetailCard>
      ) : null}
    </Box>
  );
};

export default PorNumeroRecibo;