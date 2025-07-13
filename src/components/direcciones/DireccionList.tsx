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
  { id: 'nombreSector', label: 'Sector', numeric: false, width: '15%' },
  { id: 'nombreBarrio', label: 'Barrio', numeric: false, width: '15%' },
  { id: 'nombreCalle', label: 'Calle/Mz', numeric: false, width: '20%' },
  { id: 'cuadra', label: 'Cuadra', numeric: false, width: '8%' },
  { id: 'lado', label: 'Lado', numeric: false, width: '10%' },
  { id: 'loteInicial', label: 'Lote Inicial', numeric: true, width: '8%' },
  { id: 'loteFinal', label: 'Lote Final', numeric: true, width: '8%' },
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

  // Filtrar direcciones localmente
  const filteredDirecciones = useMemo(() => {
    if (!localSearchTerm) return direcciones;
    
    const searchLower = localSearchTerm.toLowerCase();
    return direcciones.filter(direccion => 
      direccion.direccionCompleta?.toLowerCase().includes(searchLower) ||
      direccion.nombreSector?.toLowerCase().includes(searchLower) ||
      direccion.nombreBarrio?.toLowerCase().includes(searchLower) ||
      direccion.nombreCalle?.toLowerCase().includes(searchLower) ||
      direccion.codigo.toString().includes(searchLower)
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
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    };
    
    return [...filteredDirecciones].sort(comparator);
  }, [filteredDirecciones, order, orderBy]);

  // Paginación
  const paginatedDirecciones = sortedDirecciones.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    
    if (onSearch) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        onSearch(value);
      }, 300);
      
      return () => clearTimeout(timeoutId);
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

  const handleView = () => {
    if (selectedDireccion) {
      onSelectDireccion(selectedDireccion);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedDireccion && onEditDireccion) {
      onEditDireccion(selectedDireccion);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDireccion && onDeleteDireccion) {
      onDeleteDireccion(selectedDireccion.codigo);
    }
    handleMenuClose();
  };

  const getLadoChip = (lado: string) => {
    const ladoMap: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
      'Ninguno': { label: 'Ninguno', color: 'default' },
      'Izquierdo': { label: 'Izq.', color: 'primary' },
      'Derecho': { label: 'Der.', color: 'secondary' },
      'Par': { label: 'Par', color: 'info' },
      'Impar': { label: 'Impar', color: 'warning' }
    };
    
    const config = ladoMap[lado] || { label: lado, color: 'default' };
    return <Chip label={config.label} size="small" color={config.color} />;
  };

  return (
    <Paper elevation={3}>
      {/* Header con búsqueda */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            Lista de Direcciones
            <Chip label={filteredDirecciones.length} size="small" color="primary" />
          </Typography>
          
          <TextField
            size="small"
            placeholder="Buscar por dirección..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  style={{ width: headCell.width }}
                  sx={{ 
                    bgcolor: 'grey.100',
                    fontWeight: 'bold'
                  }}
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
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Cargando direcciones...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedDirecciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                  <LocationIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="body1" color="text.secondary">
                    No hay direcciones registradas
                  </Typography>
                  {localSearchTerm && (
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron resultados para "{localSearchTerm}"
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedDirecciones.map((direccion) => {
                const isSelected = direccionSeleccionada?.codigo === direccion.codigo;
                
                return (
                  <TableRow
                    key={direccion.codigo}
                    hover
                    selected={isSelected}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'action.selected' : 'inherit'
                    }}
                    onClick={() => onSelectDireccion(direccion)}
                  >
                    <TableCell align="right">{direccion.codigo}</TableCell>
                    <TableCell>{direccion.nombreSector || '-'}</TableCell>
                    <TableCell>{direccion.nombreBarrio || '-'}</TableCell>
                    <TableCell>{direccion.nombreCalle || '-'}</TableCell>
                    <TableCell>{direccion.cuadra || '-'}</TableCell>
                    <TableCell>{getLadoChip(direccion.lado || 'Ninguno')}</TableCell>
                    <TableCell align="right">{direccion.loteInicial || 0}</TableCell>
                    <TableCell align="right">{direccion.loteFinal || 0}</TableCell>
                    <TableCell>
                      <Chip
                        icon={direccion.estado === 'ACTIVO' ? <ActiveIcon /> : <InactiveIcon />}
                        label={direccion.estado}
                        size="small"
                        color={direccion.estado === 'ACTIVO' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            color={isSelected ? "primary" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDireccion(direccion);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, direccion);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={sortedDirecciones.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        
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
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Resumen en el footer */}
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<LocationIcon />}
            label={`Total: ${direcciones.length} direcciones`}
            size="small"
            color="primary"
          />
          {localSearchTerm && (
            <Chip
              icon={<FilterIcon />}
              label={`Filtradas: ${filteredDirecciones.length}`}
              size="small"
              color="secondary"
            />
          )}
          <Chip
            icon={<ActiveIcon />}
            label={`Activas: ${direcciones.filter(d => d.estado === 'ACTIVO').length}`}
            size="small"
            color="success"
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default DireccionListMUI;