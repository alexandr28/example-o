// src/components/sector/SectorList.tsx - Versión Material-UI
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  TableSortLabel,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  CloudOff as CloudOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Sector } from '../../models/Sector';

interface SectorListProps {
  sectores: Sector[];
  onSelectSector: (sector: Sector) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

type Order = 'asc' | 'desc';

const SectorList: React.FC<SectorListProps> = ({ 
  sectores, 
  onSelectSector,
  isOfflineMode = false,
  onEliminar,
  loading = false,
  onSearch,
  searchTerm = ''
}) => {
  const theme = useTheme();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('nombre');
  const [selected, setSelected] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Sincronizar término de búsqueda
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Filtrar y ordenar sectores
  const filteredAndSortedSectores = useMemo(() => {
    let filtered = [...sectores];

    // Aplicar búsqueda local si no hay función de búsqueda externa
    if (!onSearch && localSearchTerm) {
      filtered = filtered.filter(sector =>
        sector.nombre.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aValue = a[orderBy as keyof Sector];
      const bValue = b[orderBy as keyof Sector];
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [sectores, localSearchTerm, order, orderBy, onSearch]);

  // Paginación
  const paginatedSectores = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedSectores.slice(start, start + rowsPerPage);
  }, [filteredAndSortedSectores, page, rowsPerPage]);

  // Handlers
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = paginatedSectores.map(n => n.id).filter(Boolean) as number[];
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
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

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sector: Sector) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSector(sector);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSector(null);
  };

  const handleDelete = () => {
    if (selectedSector && onEliminar) {
      onEliminar(selectedSector.id);
    }
    handleMenuClose();
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Lista de Sectores
            </Typography>
            <Chip 
              label={`${filteredAndSortedSectores.length} registros`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {isOfflineMode && (
              <Chip
                icon={<CloudOffIcon sx={{ fontSize: '1rem' }} />}
                label="Datos locales"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar por nombre..."
            value={localSearchTerm}
            onChange={handleSearch}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: localSearchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < paginatedSectores.length}
                  checked={paginatedSectores.length > 0 && selected.length === paginatedSectores.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'nombre'}
                  direction={orderBy === 'nombre' ? order : 'asc'}
                  onClick={() => handleRequestSort('nombre')}
                >
                  Nombre del Sector
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : paginatedSectores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {localSearchTerm 
                      ? 'No se encontraron sectores que coincidan con la búsqueda'
                      : 'No hay sectores registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedSectores.map((sector) => {
                const isItemSelected = isSelected(sector.id);
                
                return (
                  <TableRow
                    hover
                    onClick={(event) => {
                      handleClick(event, sector.id);
                      onSelectSector(sector);
                    }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={sector.id}
                    selected={isItemSelected}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {sector.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {sector.nombre}
                        </Typography>
                        {process.env.NODE_ENV === 'development' && (
                          <Typography variant="caption" color="text.secondary">
                            Creado: {new Date().toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {sector.estado ? (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                          label="Activo"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<CancelIcon sx={{ fontSize: '1rem' }} />}
                          label="Inactivo"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, sector)}
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAndSortedSectores.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          if (selectedSector) {
            onSelectSector(selectedSector);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Acciones seleccionadas */}
      {selected.length > 0 && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20,
          bgcolor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          p: 2
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {selected.length} seleccionado(s)
            </Typography>
            <Button
              size="small"
              startIcon={<FileDownloadIcon />}
              variant="outlined"
            >
              Exportar
            </Button>
            <Button
              size="small"
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
              onClick={() => {
                // Lógica para eliminar múltiples
                setSelected([]);
              }}
            >
              Eliminar
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default SectorList;