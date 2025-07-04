// src/components/sector/SectorList.tsx - Versión Material-UI
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  // Paper,
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
  CircularProgress,
  TableSortLabel,
  Menu,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';
import { Sector } from '../../models/Sector';

interface SectorListProps {
  sectores: Sector[]; // Lista de sectores a mostrar
  onSelectSector: (sector: Sector) => void; // Callback al seleccionar un sector
  isOfflineMode?: boolean; // Indica si los datos son locales
  onEliminar?: (id: number) => void; // Callback para eliminar un sector
  loading?: boolean; // Indica si está cargando
  onSearch?: (term: string) => void; // Callback para búsqueda externa
  searchTerm?: string; // Término de búsqueda externo
}

type Order = 'asc' | 'desc';

// Componente principal de la lista de sectores
const SectorList: React.FC<SectorListProps> = ({ 
  sectores, 
  onSelectSector,
  isOfflineMode = false,
  loading = false,
  onSearch,
  searchTerm = ''
}) => {
  const theme = useTheme();
  // Estado para el término de búsqueda local
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  // Estado para la página actual de la tabla
  const [page, setPage] = useState(0);
  // Estado para filas por página
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Estado para el orden de la tabla
  const [order, setOrder] = useState<Order>('asc');
  // Estado para la columna por la que se ordena
  const [orderBy, setOrderBy] = useState<string>('nombre');
  // Estado para los sectores seleccionados
  const [selected, setSelected] = useState<number[]>([]);
  // Estado para el menú contextual
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // Estado para el sector seleccionado en el menú

  // Limpiar selección y formulario al presionar ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected([]);
        // Notificar al padre para limpiar el formulario
        if (typeof onSelectSector === 'function') {
          onSelectSector(null as unknown as Sector); // null para limpiar selección en el padre, tipado seguro
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectSector]);

  // Sincronizar término de búsqueda externo con el local
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Filtrar y ordenar sectores según búsqueda y orden seleccionados
  const filteredAndSortedSectores = useMemo(() => {
    let filtered = [...sectores];

    // Si no hay búsqueda externa, filtrar localmente
    if (!onSearch && localSearchTerm) {
      filtered = filtered.filter(sector =>
        sector.nombre.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
    }

    // Ordenar por la columna seleccionada
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

  // Obtener los sectores de la página actual
  const paginatedSectores = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedSectores.slice(start, start + rowsPerPage);
  }, [filteredAndSortedSectores, page, rowsPerPage]);

  // Cambiar el orden de la tabla
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Manejar selección de filas (solo una fila seleccionada a la vez)
  const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
    setSelected([id]);
  };

  // Cambiar página de la tabla
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Cambiar cantidad de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar búsqueda local y externa
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Limpiar campo de búsqueda
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Cerrar menú contextual
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Verificar si un sector está seleccionado
  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-6 py-2 bg-gray-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-md font-medium text-gray-800">Lista de Sectores</h2>
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
        </div>
        <div>
          <TextField
            size="small"
            placeholder="Buscar por nombre..."
            value={localSearchTerm}
            onChange={handleSearch}
            sx={{
              minWidth: 140,
              width: 200,
              '& .MuiInputBase-root': {
                fontSize: '0.80rem',
                height: 32,
                paddingTop: 0,
                paddingBottom: 0,
              },
              '& .MuiInputBase-input': {
                fontSize: '0.80rem',
                padding: '6px 8px',
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.80rem',
              }
            }}
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
        </div>
      </div>
      <div className="p-6">
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table
              stickyHeader
              size="small"
              sx={{
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid #e5e7eb', // línea horizontal delgada
                  borderRight: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  paddingTop: '6px',
                  paddingBottom: '6px',
                },
                '& .MuiTableCell-head': {
                  backgroundColor: '#f9fafb',
                  fontWeight: 400,
                  fontSize: '0.85rem',
                  color: '#374151',
                },
                '& .MuiTableRow-root': {
                  // sin borde vertical
                }
              }}
            >
              <TableHead>
                <TableRow>
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
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  // Mostrar spinner de carga
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : paginatedSectores.length === 0 ? (
                  // Mensaje si no hay sectores
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
                  // Renderizar filas de sectores
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
                          backgroundColor: isItemSelected
                            ? alpha(theme.palette.primary.main, 0.10)
                            : undefined,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.03)
                          },
                          borderBottom: '1px solid #e5e7eb' // línea horizontal delgada entre filas
                        }}
                      >
                        <TableCell>
                          <span style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                            {sector.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <span style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                              {sector.nombre}
                            </span>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
        </Box>
      </div>
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
      </Menu>
    </div>
  );
};

export default SectorList;