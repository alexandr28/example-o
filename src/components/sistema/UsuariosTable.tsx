// src/components/sistema/UsuariosTable.tsx
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
  Button,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon
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

interface Usuario {
  id: number;
  codigo: string;
  nombre: string;
  email: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  ultimoAcceso: string;
}

// Datos de ejemplo
const usuariosEjemplo: Usuario[] = [
  {
    id: 1,
    codigo: 'USR001',
    nombre: 'Juan Pérez',
    email: 'juan.perez@municipalidad.gob.pe',
    rol: 'Administrador',
    estado: 'Activo',
    ultimoAcceso: '2025-10-31 09:30'
  },
  {
    id: 2,
    codigo: 'USR002',
    nombre: 'María García',
    email: 'maria.garcia@municipalidad.gob.pe',
    rol: 'Cajero',
    estado: 'Activo',
    ultimoAcceso: '2025-10-31 08:15'
  },
  {
    id: 3,
    codigo: 'USR003',
    nombre: 'Carlos López',
    email: 'carlos.lopez@municipalidad.gob.pe',
    rol: 'Operador',
    estado: 'Inactivo',
    ultimoAcceso: '2025-10-28 17:45'
  }
];

interface UsuariosTableProps {
  onEdit?: (usuario: Usuario) => void;
  onDelete?: (usuario: Usuario) => void;
  onAdd?: () => void;
}

const UsuariosTable: React.FC<UsuariosTableProps> = ({ onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios] = useState<Usuario[]>(usuariosEjemplo);

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Barra de búsqueda y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onAdd}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Código</StyledTableCell>
              <StyledTableCell>Nombre</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Rol</StyledTableCell>
              <StyledTableCell align="center">Estado</StyledTableCell>
              <StyledTableCell>Último Acceso</StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsuarios.length > 0 ? (
              filteredUsuarios.map((usuario) => (
                <StyledTableRow key={usuario.id}>
                  <TableCell>{usuario.codigo}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{usuario.nombre}</Typography>
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.rol}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={usuario.estado}
                      color={usuario.estado === 'Activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{usuario.ultimoAcceso}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit?.(usuario)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete?.(usuario)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No se encontraron usuarios
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

export default UsuariosTable;
