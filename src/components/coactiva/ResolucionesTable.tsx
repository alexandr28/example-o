// src/components/coactiva/ResolucionesTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

interface Resolucion {
  id: number;
  numeroResolucion: string;
  expediente: string;
  tipo: 'Inicio' | 'Embargo' | 'Remate' | 'Archivo';
  contribuyente: string;
  fechaEmision: string;
  estado: 'Vigente' | 'Ejecutada' | 'Anulada';
}

// Datos de ejemplo
const resolucionesEjemplo: Resolucion[] = [
  {
    id: 1,
    numeroResolucion: 'RES-2025-001',
    expediente: 'EXP-2025-001',
    tipo: 'Inicio',
    contribuyente: 'Juan Pérez García',
    fechaEmision: '2025-01-20',
    estado: 'Vigente'
  },
  {
    id: 2,
    numeroResolucion: 'RES-2025-002',
    expediente: 'EXP-2025-002',
    tipo: 'Embargo',
    contribuyente: 'María Rodríguez López',
    fechaEmision: '2025-02-25',
    estado: 'Ejecutada'
  },
  {
    id: 3,
    numeroResolucion: 'RES-2024-125',
    expediente: 'EXP-2024-098',
    tipo: 'Remate',
    contribuyente: 'Carlos Sánchez Torres',
    fechaEmision: '2024-12-10',
    estado: 'Vigente'
  }
];

interface ResolucionesTableProps {
  onView?: (resolucion: Resolucion) => void;
  onEdit?: (resolucion: Resolucion) => void;
  onAdd?: () => void;
}

const ResolucionesTable: React.FC<ResolucionesTableProps> = ({ onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resoluciones] = useState<Resolucion[]>(resolucionesEjemplo);

  const filteredResoluciones = resoluciones.filter(res =>
    res.numeroResolucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.contribuyente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Inicio': return 'primary';
      case 'Embargo': return 'warning';
      case 'Remate': return 'error';
      case 'Archivo': return 'default';
      default: return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Vigente': return 'success';
      case 'Ejecutada': return 'info';
      case 'Anulada': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box display="flex" justifyContent="flex-start" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Buscar por resolución, expediente o contribuyente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>N° Resolución</StyledTableCell>
              <StyledTableCell>Expediente</StyledTableCell>
              <StyledTableCell align="center">Tipo</StyledTableCell>
              <StyledTableCell>Contribuyente</StyledTableCell>
              <StyledTableCell>Fecha Emisión</StyledTableCell>
              <StyledTableCell align="center">Estado</StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResoluciones.length > 0 ? (
              filteredResoluciones.map((resolucion) => (
                <StyledTableRow key={resolucion.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DescriptionIcon fontSize="small" color="primary" />
                      <Typography fontWeight="medium">{resolucion.numeroResolucion}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{resolucion.expediente}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={resolucion.tipo}
                      color={getTipoColor(resolucion.tipo) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{resolucion.contribuyente}</TableCell>
                  <TableCell>{resolucion.fechaEmision}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={resolucion.estado}
                      color={getEstadoColor(resolucion.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onView?.(resolucion)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => onEdit?.(resolucion)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No se encontraron resoluciones
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResolucionesTable;
