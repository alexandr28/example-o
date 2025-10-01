// src/components/caja/consultas/PorContribuyente.tsx
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
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Badge as BadgeIcon
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

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.light,
  color: 'white',
  borderRadius: theme.spacing(1)
}));

// Interfaces
interface ContribuyenteOption {
  id: string;
  nombre: string;
  rucDni: string;
  direccion: string;
}

interface ReciboData {
  id: string;
  numeroRecibo: string;
  fecha: Date;
  concepto: string;
  monto: number;
  estado: 'CANCELADO' | 'ANULADO';
  cajero: string;
  periodo: string;
}

interface PorContribuyenteProps {
  onExportPdf?: () => void;
}

const PorContribuyente: React.FC<PorContribuyenteProps> = ({ onExportPdf }) => {
  const [loading, setLoading] = useState(false);
  const [rucDni, setRucDni] = useState('');
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<ContribuyenteOption | null>(null);
  const [recibos, setRecibos] = useState<ReciboData[]>([]);
  const [totalPagado, setTotalPagado] = useState(0);

  // Lista de contribuyentes de ejemplo
  const contribuyentesEjemplo: ContribuyenteOption[] = [
    { id: '1', nombre: 'Garcia Lopez Juan Carlos', rucDni: '12345678', direccion: 'Av. Principal 123' },
    { id: '2', nombre: 'Empresa ABC S.A.C.', rucDni: '20123456789', direccion: 'Jr. Industrial 456' },
    { id: '3', nombre: 'Rodriguez Silva Maria Elena', rucDni: '87654321', direccion: 'Calle Los Olivos 789' }
  ];

  // Datos de ejemplo de recibos
  const recibosEjemplo: ReciboData[] = [
    {
      id: '1',
      numeroRecibo: 'R-2024-001234',
      fecha: new Date(2024, 0, 15),
      concepto: 'Impuesto Predial',
      monto: 450.50,
      estado: 'CANCELADO',
      cajero: 'Maria Rodriguez',
      periodo: '2024-01'
    },
    {
      id: '2',
      numeroRecibo: 'R-2024-001456',
      fecha: new Date(2024, 1, 20),
      concepto: 'Limpieza Publica',
      monto: 120.00,
      estado: 'CANCELADO',
      cajero: 'Carlos Mendoza',
      periodo: '2024-01'
    },
    {
      id: '3',
      numeroRecibo: 'R-2024-001789',
      fecha: new Date(2024, 2, 10),
      concepto: 'Parques y Jardines',
      monto: 85.75,
      estado: 'CANCELADO',
      cajero: 'Maria Rodriguez',
      periodo: '2024-02'
    }
  ];

  // Buscar por RUC/DNI
  const handleBuscarPorDocumento = () => {
    if (!rucDni.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const contribuyente = contribuyentesEjemplo.find(c => c.rucDni === rucDni);
      if (contribuyente) {
        setContribuyenteSeleccionado(contribuyente);
        setRecibos(recibosEjemplo);
        const total = recibosEjemplo.reduce((sum, recibo) => sum + recibo.monto, 0);
        setTotalPagado(total);
      } else {
        setContribuyenteSeleccionado(null);
        setRecibos([]);
        setTotalPagado(0);
      }
      setLoading(false);
    }, 1000);
  };

  // Seleccionar contribuyente del autocomplete
  const handleSeleccionarContribuyente = (contribuyente: ContribuyenteOption | null) => {
    if (!contribuyente) {
      handleLimpiar();
      return;
    }

    setLoading(true);
    setContribuyenteSeleccionado(contribuyente);
    setRucDni(contribuyente.rucDni);

    setTimeout(() => {
      setRecibos(recibosEjemplo);
      const total = recibosEjemplo.reduce((sum, recibo) => sum + recibo.monto, 0);
      setTotalPagado(total);
      setLoading(false);
    }, 1000);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setRucDni('');
    setContribuyenteSeleccionado(null);
    setRecibos([]);
    setTotalPagado(0);
  };

  // Ver detalle del recibo
  const handleVerDetalle = (recibo: ReciboData) => {
    console.log('Ver detalle del recibo:', recibo);
  };

  // Imprimir recibo individual
  const handleImprimirRecibo = (recibo: ReciboData) => {
    console.log('Imprimir recibo:', recibo);
  };

  return (
    <Box>
      {/* Filtros */}
      <FilterCard>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
          Buscar Contribuyente
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="RUC/DNI"
            value={rucDni}
            onChange={(e) => setRucDni(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="primary" />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleBuscarPorDocumento();
            }}
          />
          <Autocomplete
            options={contribuyentesEjemplo}
            getOptionLabel={(option) => `${option.nombre} - ${option.rucDni}`}
            value={contribuyenteSeleccionado}
            onChange={(_, newValue) => handleSeleccionarContribuyente(newValue)}
            sx={{ minWidth: 350 }}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar por Nombre"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleBuscarPorDocumento}
            disabled={loading || !rucDni}
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

      {/* Informacion del Contribuyente */}
      {contribuyenteSeleccionado && (
        <InfoCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {contribuyenteSeleccionado.nombre}
              </Typography>
              <Typography variant="body2">
                RUC/DNI: {contribuyenteSeleccionado.rucDni}
              </Typography>
              <Typography variant="body2">
                Direccion: {contribuyenteSeleccionado.direccion}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">Total de Recibos</Typography>
              <Typography variant="h5" fontWeight="bold">{recibos.length}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Total Pagado</Typography>
              <Typography variant="h5" fontWeight="bold">S/. {totalPagado.toFixed(2)}</Typography>
            </Box>
          </Box>
        </InfoCard>
      )}

      {/* Tabla de Resultados */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : !contribuyenteSeleccionado ? (
        <Alert severity="info" sx={{ borderRadius: 1 }}>
          Busque un contribuyente para ver sus recibos cancelados
        </Alert>
      ) : recibos.length === 0 ? (
        <Alert severity="warning" sx={{ borderRadius: 1 }}>
          No se encontraron recibos para el contribuyente seleccionado
        </Alert>
      ) : (
        <StyledTableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>N° Recibo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Concepto</TableCell>
                <TableCell>Periodo</TableCell>
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
                  <TableCell>{recibo.concepto}</TableCell>
                  <TableCell>{recibo.periodo}</TableCell>
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
  );
};

export default PorContribuyente;