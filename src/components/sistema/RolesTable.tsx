// src/components/sistema/RolesTable.tsx
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
  Add as AddIcon
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

interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  permisos: number;
  usuarios: number;
  estado: 'Activo' | 'Inactivo';
}

// Datos de ejemplo
const rolesEjemplo: Rol[] = [
  {
    id: 1,
    codigo: 'ROL001',
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: 25,
    usuarios: 3,
    estado: 'Activo'
  },
  {
    id: 2,
    codigo: 'ROL002',
    nombre: 'Cajero',
    descripcion: 'Gestión de caja y cobros',
    permisos: 8,
    usuarios: 5,
    estado: 'Activo'
  },
  {
    id: 3,
    codigo: 'ROL003',
    nombre: 'Operador',
    descripcion: 'Registro de contribuyentes y predios',
    permisos: 12,
    usuarios: 7,
    estado: 'Activo'
  }
];

interface RolesTableProps {
  onEdit?: (rol: Rol) => void;
  onDelete?: (rol: Rol) => void;
  onAdd?: () => void;
}

const RolesTable: React.FC<RolesTableProps> = ({ onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roles] = useState<Rol[]>(rolesEjemplo);

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Barra de búsqueda y acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Buscar roles..."
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
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Nuevo Rol
        </Button>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Código</StyledTableCell>
              <StyledTableCell>Nombre</StyledTableCell>
              <StyledTableCell>Descripción</StyledTableCell>
              <StyledTableCell align="center">Permisos</StyledTableCell>
              <StyledTableCell align="center">Usuarios</StyledTableCell>
              <StyledTableCell align="center">Estado</StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoles.length > 0 ? (
              filteredRoles.map((rol) => (
                <StyledTableRow key={rol.id}>
                  <TableCell>{rol.codigo}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{rol.nombre}</Typography>
                  </TableCell>
                  <TableCell>{rol.descripcion}</TableCell>
                  <TableCell align="center">
                    <Chip label={rol.permisos} color="primary" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={rol.usuarios} color="info" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={rol.estado}
                      color={rol.estado === 'Activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit?.(rol)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete?.(rol)}
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
                    No se encontraron roles
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

export default RolesTable;
