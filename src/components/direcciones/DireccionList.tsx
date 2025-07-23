// src/components/direcciones/DireccionList.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { DireccionData } from '../../services/direccionService';

interface DireccionListProps {
  direcciones: DireccionData[];
  direccionSeleccionada?: DireccionData | null;
  onSelectDireccion: (direccion: DireccionData) => void;
  onEditDireccion?: (direccion: DireccionData) => void;
  onDeleteDireccion?: (id: number) => void;
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
  searchTerm?: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof DireccionData | 'actions';
  label: string;
  numeric: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'codigo', label: 'Código', numeric: true, width: '8%' },
  { id: 'nombreSector', label: 'Sector', numeric: false, width: '12%' },
  { id: 'nombreBarrio', label: 'Barrio', numeric: false, width: '12%' },
  { id: 'nombreVia', label: 'Calle/Mz', numeric: false, width: '15%' },
  { id: 'cuadra', label: 'Cuadra', numeric: false, width: '8%' },
  { id: 'lado', label: 'Lado', numeric: false, width: '8%' },
  { id: 'loteInicial', label: 'Lote Inicial', numeric: true, width: '10%' },
  { id: 'loteFinal', label: 'Lote Final', numeric: true, width: '10%' },
  { id: 'estado', label: 'Estado', numeric: false, width: '8%' },
  { id: 'actions', label: 'Acciones', numeric: false, width: '10%' }
];

const DireccionListMUI: React.FC<DireccionListProps> = ({
  direcciones = [],
  direccionSeleccionada,
  onSelectDireccion,
  onEditDireccion,
  onDeleteDireccion,
  loading = false,
  onSearch,
  searchTerm = ''
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DireccionData>('codigo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDireccion, setSelectedDireccion] = useState<DireccionData | null>(null);

  // Debug
  console.log('📊 DireccionList - Direcciones recibidas:', direcciones.length);
  if (direcciones.length > 0) {
    console.log('Ejemplo de dirección:', direcciones[0]);
  }

  // Filtrar direcciones localmente
  const filteredDirecciones = useMemo(() => {
    if (!localSearchTerm) return direcciones;
    
    const searchLower = localSearchTerm.toLowerCase();
    return direcciones.filter(direccion => 
      direccion.descripcion?.toLowerCase().includes(searchLower) ||
      direccion.nombreSector?.toLowerCase().includes(searchLower) ||
      direccion.nombreBarrio?.toLowerCase().includes(searchLower) ||
      direccion.nombreVia?.toLowerCase().includes(searchLower) ||
      direccion.codigo?.toString().includes(searchLower)
    );
  }, [direcciones, localSearchTerm]);

  // Ordenar direcciones
  const sortedDirecciones = useMemo(() => {
    const comparator = (a: DireccionData, b: DireccionData) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return order === 'asc' ? 1 : -1;
      if (!bValue) return order === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    };
    
    return [...filteredDirecciones].sort(comparator);
  }, [filteredDirecciones, order, orderBy]);

  // Paginación
  const paginatedDirecciones = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedDirecciones.slice(start, start + rowsPerPage);
  }, [sortedDirecciones, page, rowsPerPage]);

  const handleRequestSort = (property: keyof DireccionData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, direccion: DireccionData) => {
    setAnchorEl(event.currentTarget);
    setSelectedDireccion(direccion);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDireccion(null);
  };

  const handleEdit = () => {
    if (selectedDireccion && onEditDireccion) {
      onEditDireccion(selectedDireccion);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDireccion && onDeleteDireccion) {
      onDeleteDireccion(selectedDireccion.id);
    }
    handleMenuClose();
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            Lista de Direcciones ({direcciones.length})
          </Typography>
          
          <Chip
            label={`Total: ${direcciones.length} direcciones`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Búsqueda */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por dirección..."
          value={localSearchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />

        {/* Tabla */}
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    style={{ width: headCell.width }}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.id !== 'actions' ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof DireccionData)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : paginatedDirecciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <LocationIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No hay direcciones registradas
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDirecciones.map((direccion) => {
                  const isSelected = direccionSeleccionada?.id === direccion.id;
                  
                  return (
                    <TableRow
                      key={direccion.id}
                      hover
                      onClick={() => onSelectDireccion(direccion)}
                      selected={isSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell align="right">{direccion.codigo || direccion.id}</TableCell>
                      <TableCell>{direccion.nombreSector || '-'}</TableCell>
                      <TableCell>{direccion.nombreBarrio || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={direccion.nombreTipoVia || 'CALLE'} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Typography variant="body2">
                            {direccion.nombreVia || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{direccion.cuadra || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={direccion.lado || '-'} 
                          size="small"
                          color={direccion.lado === 'Izquierdo' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{direccion.loteInicial || 0}</TableCell>
                      <TableCell align="right">{direccion.loteFinal || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={direccion.estado || 'ACTIVO'}
                          color={direccion.estado === 'ACTIVO' ? 'success' : 'default'}
                          size="small"
                          icon={direccion.estado === 'ACTIVO' ? <ActiveIcon /> : <InactiveIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, direccion);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredDirecciones.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
        />

        {/* Menú de acciones */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {onEditDireccion && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>
          )}
          {onDeleteDireccion && (
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Eliminar</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Chip
          label={`Total: ${direcciones.length} direcciones`}
          color="primary"
          size="small"
        />
        <Chip
          label={`Activas: ${direcciones.filter(d => d.estado === 'ACTIVO').length}`}
          color="success"
          size="small"
        />
      </Box>
    </Paper>
  );
};

export default DireccionListMUI;