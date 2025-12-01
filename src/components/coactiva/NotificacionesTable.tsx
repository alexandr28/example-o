// src/components/coactiva/NotificacionesTable.tsx
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
  Email as EmailIcon
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

interface Notificacion {
  id: number;
  numeroNotificacion: string;
  expediente: string;
  contribuyente: string;
  tipoNotificacion: 'Inicio' | 'Embargo' | 'Remate' | 'Citación';
  fechaNotificacion: string;
  estado: 'Pendiente' | 'Entregada' | 'Devuelta' | 'Rechazada';
  direccion: string;
}

// Datos de ejemplo
const notificacionesEjemplo: Notificacion[] = [
  {
    id: 1,
    numeroNotificacion: 'NOT-2025-001',
    expediente: 'EXP-2025-001',
    contribuyente: 'Juan Pérez García',
    tipoNotificacion: 'Inicio',
    fechaNotificacion: '2025-01-22',
    estado: 'Entregada',
    direccion: 'Av. Los Pinos 123, Lima'
  },
  {
    id: 2,
    numeroNotificacion: 'NOT-2025-002',
    expediente: 'EXP-2025-002',
    tipoNotificacion: 'Embargo',
    contribuyente: 'María Rodríguez López',
    fechaNotificacion: '2025-02-28',
    estado: 'Pendiente',
    direccion: 'Jr. Las Flores 456, Lima'
  },
  {
    id: 3,
    numeroNotificacion: 'NOT-2025-003',
    expediente: 'EXP-2024-098',
    tipoNotificacion: 'Remate',
    contribuyente: 'Carlos Sánchez Torres',
    fechaNotificacion: '2025-10-15',
    estado: 'Devuelta',
    direccion: 'Calle Los Olivos 789, Lima'
  }
];

interface NotificacionesTableProps {
  onView?: (notificacion: Notificacion) => void;
  onEdit?: (notificacion: Notificacion) => void;
  onAdd?: () => void;
}

const NotificacionesTable: React.FC<NotificacionesTableProps> = ({ onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notificaciones] = useState<Notificacion[]>(notificacionesEjemplo);

  const filteredNotificaciones = notificaciones.filter(not =>
    not.numeroNotificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    not.expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    not.contribuyente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Inicio': return 'primary';
      case 'Embargo': return 'warning';
      case 'Remate': return 'error';
      case 'Citación': return 'info';
      default: return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Entregada': return 'success';
      case 'Devuelta': return 'error';
      case 'Rechazada': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box display="flex" justifyContent="flex-start" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Buscar por notificación, expediente o contribuyente..."
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
              <StyledTableCell>N° Notificación</StyledTableCell>
              <StyledTableCell>Expediente</StyledTableCell>
              <StyledTableCell>Contribuyente</StyledTableCell>
              <StyledTableCell align="center">Tipo</StyledTableCell>
              <StyledTableCell>Fecha</StyledTableCell>
              <StyledTableCell align="center">Estado</StyledTableCell>
              <StyledTableCell>Dirección</StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotificaciones.length > 0 ? (
              filteredNotificaciones.map((notificacion) => (
                <StyledTableRow key={notificacion.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="primary" />
                      <Typography fontWeight="medium">{notificacion.numeroNotificacion}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{notificacion.expediente}</TableCell>
                  <TableCell>{notificacion.contribuyente}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={notificacion.tipoNotificacion}
                      color={getTipoColor(notificacion.tipoNotificacion) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{notificacion.fechaNotificacion}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={notificacion.estado}
                      color={getEstadoColor(notificacion.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {notificacion.direccion}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onView?.(notificacion)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => onEdit?.(notificacion)}
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
                    No se encontraron notificaciones
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

export default NotificacionesTable;
