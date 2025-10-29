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
  TableSortLabel,
  Menu,
  alpha,
  useTheme,
  Stack,
  Tooltip,
  Alert,
  Skeleton,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudOff as CloudOffIcon,
  Edit as EditIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { Sector } from '../../models/Sector';

interface SectorListProps {
  sectores: Sector[]; // Lista de sectores a mostrar
  onSelectSector: (sector: Sector) => void; // Callback al seleccionar un sector
  onEdit?: (sector: Sector) => void; // Callback para editar un sector
  isOfflineMode?: boolean; // Indica si los datos son locales
  onEliminar?: (id: number) => void; // Callback para eliminar un sector
  loading?: boolean; // Indica si está cargando
  onSearch?: (term: string) => void; // Callback para búsqueda externa
  searchTerm?: string; // Término de búsqueda externo
  selectedSector?: Sector | null; // Sector seleccionado
}

interface HeadCell {
  id: keyof Sector | 'acciones';
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

const headCells: HeadCell[] = [
  { id: 'id', label: 'N°', sortable: true, align: 'center' },
  { id: 'nombre', label: 'Nombre del Sector', sortable: true },
  { id: 'nombreCuadrante', label: 'Cuadrante', sortable: true },
  { id: 'unidadUrbana', label: 'UnidUrbana', sortable: true, align: 'center' },
  { id: 'acciones', label: 'Acciones', align: 'center' }
];

type Order = 'asc' | 'desc';

// Componente principal de la lista de sectores
const SectorList: React.FC<SectorListProps> = ({ 
  sectores, 
  onSelectSector,
  onEdit,
  isOfflineMode = false,
  loading = false,
  onSearch,
  searchTerm = '',
  selectedSector
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
  const [, setSelected] = useState<number[]>([]);
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


  // Skeleton rows para loading
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell align="center"><Skeleton width={40} /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell align="center"><Skeleton width={60} /></TableCell>
        <TableCell align="center"><Skeleton width={40} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: { xs: '100%', sm: '100%', md: '90%', lg: '100%' },
        minWidth: { xs: '100%', sm: '100%', md: '700px' },
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider',
        mx: 'auto'
      }}
    >
      <Stack spacing={2} sx={{ p: { xs: 1, sm: 2 } }}>
        {/* Header */}
        

        {/* Barra de búsqueda expandida horizontalmente */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          alignItems: { xs: 'stretch', sm: 'center' },
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por nombre del sector..."
            value={localSearchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: localSearchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                height: 40,
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              }
            }}
            sx={{ maxWidth: '400px' }}
          />
        </Box>

        {/* Mensaje offline */}
        {isOfflineMode && (
          <Alert severity="warning" icon={<CloudOffIcon />}>
            Mostrando datos almacenados localmente. Algunos datos pueden no estar actualizados.
          </Alert>
        )}

        {/* Tabla expandida horizontalmente */}
        <TableContainer 
          component={Paper}
          elevation={0}
          sx={{ 
            width: '100%',
            height: { xs: 300, sm: 350, md: 400 },
            maxHeight: { xs: 300, sm: 350, md: 400 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            '& .MuiTable-root': {
              minWidth: '100%',
              width: '100%'
            },
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.grey[200], 0.5),
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.5),
              }
            }
          }}
        >
          <Table stickyHeader size="medium">
            <TableHead sx={{ 
              backgroundColor: '#f0f7ff',
              opacity: 1
            }}>
              <TableRow sx={{ 
                backgroundColor: '#f0f7ff'
              }}>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || 'left'}
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      backgroundColor: '#f0f7ff',
                      color: theme.palette.primary.main,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      textTransform: 'uppercase',
                      letterSpacing: { xs: 0.3, sm: 0.5 },
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 0.5, sm: 1 },
                      position: 'sticky',
                      top: 0,
                      zIndex: 100,
                      opacity: 1,
                      display: 'table-cell'
                    }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as string)}
                        sx={{
                          color: 'inherit !important',
                          '&.Mui-active': {
                            color: `${theme.palette.primary.main} !important`,
                            '& .MuiTableSortLabel-icon': {
                              color: `${theme.palette.primary.main} !important`,
                            }
                          },
                          '&:hover': {
                            color: `${theme.palette.primary.dark} !important`,
                          }
                        }}
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
                renderSkeletonRows()
              ) : paginatedSectores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <BusinessIcon sx={{
                        fontSize: 48,
                        color: 'text.disabled'
                      }} />
                      <Alert
                        severity="info"
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          '& .MuiAlert-message': {
                            fontSize: '0.875rem'
                          }
                        }}
                      >
                        {localSearchTerm
                          ? `No se encontraron sectores con "${localSearchTerm}"`
                          : 'No hay sectores registrados'}
                      </Alert>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSectores.map((sector, index) => {
                  const isItemSelected = selectedSector?.id === sector.id;
                  return (
                    <Fade in={true} key={sector.id} timeout={300 + (index * 100)}>
                      <TableRow
                        hover
                        selected={isItemSelected}
                        sx={{ 
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.16),
                            }
                          },
                          '&:nth-of-type(even):not(.Mui-selected)': {
                            bgcolor: alpha(theme.palette.grey[100], 0.3),
                          }
                        }}
                      >
                        <TableCell 
                          align="center"
                          sx={{ py: 1.5, px: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {sector.id}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1
                          }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                              }}
                            >
                              <BusinessIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: theme.palette.text.primary,
                                  mb: 0.5
                                }}
                              >
                                {sector.nombre}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.75rem'
                                }}
                              >
                                Sector #{sector.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontStyle: sector.nombreCuadrante ? 'normal' : 'italic'
                            }}
                          >
                            {sector.nombreCuadrante || 'Sin cuadrante'}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ py: 1.5, px: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 500,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                          >
                            {sector.unidadUrbana || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ py: 1.5, px: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                        >
                          {onEdit && (
                            <Tooltip title="Editar sector" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={loading}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  // Ejecutar selección local para feedback visual inmediato
                                  handleClick(e, sector.id);
                                  
                                  // Ejecutar edición pasando directamente el sector
                                  // Esto evita cualquier dependencia del estado del padre
                                  if (onEdit) {
                                    onEdit(sector);
                                  }
                                  
                                  // Actualizar selección en el padre para sincronización
                                  onSelectSector(sector);
                                }}
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                                    transform: 'scale(1.1)',
                                  },
                                  '&:disabled': {
                                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                                  },
                                  transition: 'all 0.2s ease-in-out'
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    </Fade>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredAndSortedSectores.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Stack>

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
    </Paper>
  );
};

export default SectorList;