// src/components/coactiva/ExpedientesTable.tsx
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
  Gavel as GavelIcon
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

interface Expediente {
  id: number;
  numeroExpediente: string;
  contribuyente: string;
  dni: string;
  montoDeuda: number;
  estado: 'En Proceso' | 'Notificado' | 'Ejecutado' | 'Cerrado';
  fechaInicio: string;
  ultimaActualizacion: string;
}

// Datos de ejemplo
const expedientesEjemplo: Expediente[] = [
  {
    id: 1,
    numeroExpediente: 'EXP-2025-001',
    contribuyente: 'Juan Pérez García',
    dni: '12345678',
    montoDeuda: 5450.00,
    estado: 'En Proceso',
    fechaInicio: '2025-01-15',
    ultimaActualizacion: '2025-10-30'
  },
  {
    id: 2,
    numeroExpediente: 'EXP-2025-002',
    contribuyente: 'María Rodríguez López',
    dni: '87654321',
    montoDeuda: 8750.50,
    estado: 'Notificado',
    fechaInicio: '2025-02-20',
    ultimaActualizacion: '2025-10-28'
  },
  {
    id: 3,
    numeroExpediente: 'EXP-2024-098',
    contribuyente: 'Carlos Sánchez Torres',
    dni: '45678912',
    montoDeuda: 12300.00,
    estado: 'Ejecutado',
    fechaInicio: '2024-11-05',
    ultimaActualizacion: '2025-10-25'
  }
];

interface ExpedientesTableProps {
  onView?: (expediente: Expediente) => void;
  onEdit?: (expediente: Expediente) => void;
  onAdd?: () => void;
}

const ExpedientesTable: React.FC<ExpedientesTableProps> = ({ onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expedientes] = useState<Expediente[]>(expedientesEjemplo);

  const filteredExpedientes = expedientes.filter(exp =>
    exp.numeroExpediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.contribuyente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.dni.includes(searchTerm)
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En Proceso': return 'warning';
      case 'Notificado': return 'info';
      case 'Ejecutado': return 'success';
      case 'Cerrado': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Buscar por expediente, contribuyente o DNI..."
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
              <StyledTableCell>N° Expediente</StyledTableCell>
              <StyledTableCell>Contribuyente</StyledTableCell>
              <StyledTableCell>DNI</StyledTableCell>
              <StyledTableCell align="right">Monto Deuda</StyledTableCell>
              <StyledTableCell align="center">Estado</StyledTableCell>
              <StyledTableCell>Fecha Inicio</StyledTableCell>
              <StyledTableCell>Última Act.</StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpedientes.length > 0 ? (
              filteredExpedientes.map((expediente) => (
                <StyledTableRow key={expediente.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GavelIcon fontSize="small" color="primary" />
                      <Typography fontWeight="medium">{expediente.numeroExpediente}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{expediente.contribuyente}</TableCell>
                  <TableCell>{expediente.dni}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color="error">
                      S/. {expediente.montoDeuda.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={expediente.estado}
                      color={getEstadoColor(expediente.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{expediente.fechaInicio}</TableCell>
                  <TableCell>{expediente.ultimaActualizacion}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onView?.(expediente)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => onEdit?.(expediente)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No se encontraron expedientes
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

export default ExpedientesTable;
