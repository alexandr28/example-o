// src/components/barrio/BarrioList.tsx
import React, { useMemo, useState } from 'react';
import { Barrio } from '../../models/Barrio';
import { Sector } from '../../models/Sector';

// Material-UI imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Paper,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Alert,
  Skeleton,
  useTheme,
  alpha,
  Fade,
  TableSortLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

interface BarrioListProps {
  barrios: Barrio[];
  sectores?: Sector[];
  onEdit?: (barrio: Barrio) => void;
  onDelete?: (barrio: Barrio) => void;
  onView?: (barrio: Barrio) => void;
  onSelect?: (barrio: Barrio) => void;
  loading?: boolean;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  selectedBarrio?: Barrio | null;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Barrio | 'sector' | 'acciones';
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

const headCells: HeadCell[] = [
  { id: 'id', label: 'N°', sortable: true, align: 'center' },
  { id: 'nombre', label: 'Nombre del Barrio', sortable: true },
  { id: 'sector', label: 'Sector', sortable: true },
  { id: 'acciones', label: 'Acciones', align: 'center' }
];

const BarrioList: React.FC<BarrioListProps> = ({
  barrios = [],
  sectores = [],
  onEdit,
  onDelete,
  onView,
  onSelect,
  loading = false,
  searchTerm = '',
  onSearch,
  selectedBarrio
}) => {
  const theme = useTheme();
  // Estados para paginación y ordenamiento
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('nombre');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Crear un mapa de sectores para búsqueda eficiente
  const sectoresMap = useMemo(() => {
    const map = new Map<number, Sector>();
    if (Array.isArray(sectores)) {
      sectores.forEach(sector => {
        map.set(sector.id, sector);
      });
    }
    return map;
  }, [sectores]);

  // Obtener el nombre del sector
  const getNombreSector = (codSector: number | undefined): string => {
    if (!codSector) return 'Sin sector';
    const sector = sectoresMap.get(codSector);
    return sector?.nombre || `Sector ${codSector}`;
  };

  // Manejar ordenamiento
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Manejar búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // Manejar cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar selección de barrio
  const handleSelectBarrio = (barrio: Barrio) => {
    if (onSelect) {
      onSelect(barrio);
    }
  };

  // Filtrar y ordenar barrios
  const sortedAndFilteredBarrios = useMemo(() => {
    let filteredData = [...barrios];

    // Aplicar filtro de búsqueda local si no hay función de búsqueda externa
    if (!onSearch && localSearchTerm) {
      filteredData = filteredData.filter(barrio => {
        const nombreBarrio = barrio.nombre?.toLowerCase() || '';
        const nombreSector = getNombreSector(barrio.codSector).toLowerCase();
        const searchLower = localSearchTerm.toLowerCase();
        
        return nombreBarrio.includes(searchLower) || nombreSector.includes(searchLower);
      });
    }

    // Ordenar
    filteredData.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (orderBy === 'sector') {
        aValue = getNombreSector(a.codSector);
        bValue = getNombreSector(b.codSector);
      } else {
        aValue = a[orderBy as keyof Barrio];
        bValue = b[orderBy as keyof Barrio];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  }, [barrios, order, orderBy, localSearchTerm, onSearch, sectoresMap]);

  // Calcular barrios paginados
  const paginatedBarrios = sortedAndFilteredBarrios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Skeleton rows para loading
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell align="center"><Skeleton width={40} /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell align="center"><Skeleton width={40} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%',
        minWidth: '800px',
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HomeIcon />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Listar Barrios
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Chip
            label={`Total: ${barrios.length}`}
            color="primary"
            variant="filled"
            size="small"
          />
          <Chip
            label={`Filtrados: ${sortedAndFilteredBarrios.length}`}
            color="secondary"
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Barra de búsqueda expandida horizontalmente */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por nombre de barrio o sector..."
            value={localSearchTerm}
            onChange={handleSearchChange}
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

        {/* Tabla expandida horizontalmente */}
        <TableContainer 
          component={Paper}
          elevation={2}
          sx={{ 
            width: '100%',
            height: 400,
            maxHeight: 400,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'auto',
            position: 'relative',
            '& .MuiTable-root': {
              minWidth: 600
            },
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
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
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || 'left'}
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
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
              ) : paginatedBarrios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 2 
                    }}>
                      <HomeIcon sx={{ 
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
                          ? `No se encontraron barrios con "${localSearchTerm}"`
                          : 'No hay barrios registrados'}
                      </Alert>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBarrios.map((barrio, index) => (
                  <Fade in={true} key={barrio.id} timeout={300 + (index * 100)}>
                    <TableRow
                      hover
                      onClick={() => handleSelectBarrio(barrio)}
                      selected={selectedBarrio?.id === barrio.id}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
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
                        sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                      >
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          {barrio.id}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5
                        }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                            }}
                          >
                            <HomeIcon sx={{ fontSize: 20 }} />
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
                              {barrio.nombre}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem'
                              }}
                            >
                              Barrio #{barrio.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Chip
                          icon={<LocationIcon fontSize="small" />}
                          label={getNombreSector(barrio.codSector)}
                          size="small"
                          variant="outlined"
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.08),
                            color: theme.palette.info.dark,
                            borderColor: alpha(theme.palette.info.main, 0.3),
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              color: theme.palette.info.main
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                      >
                        {onEdit && (
                          <Tooltip title="Editar barrio" arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(barrio);
                              }}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                                  transform: 'scale(1.1)',
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={sortedAndFilteredBarrios.length}
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
    </Paper>
  );
};

export default BarrioList;