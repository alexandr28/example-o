// src/components/barrio/BarrioList.tsx
import React, { useMemo, useState, useCallback } from 'react';
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
  Tooltip,
  Paper,
  TextField,
  InputAdornment,
  Stack,
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
  Home as HomeIcon
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

// Definir anchos de columna para layout fijo
const getColumnWidth = (columnId: string): string => {
  switch (columnId) {
    case 'id': return '10%';
    case 'nombre': return '45%';
    case 'sector': return '30%';
    case 'acciones': return '15%';
    default: return 'auto';
  }
};

const BarrioList: React.FC<BarrioListProps> = ({
  barrios = [],
  sectores = [],
  onEdit,
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
  const getNombreSector = useCallback((codSector: number | undefined): string => {
    if (!codSector) return 'Sin sector';
    const sector = sectoresMap.get(codSector);
    return sector?.nombre || `Sector ${codSector}`;
  }, [sectoresMap]);

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
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  }, [barrios, order, orderBy, localSearchTerm, onSearch, sectoresMap, getNombreSector]);

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
        maxWidth: '100%',
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
       
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
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            '& .MuiTable-root': {
              width: '100%',
              tableLayout: 'fixed'
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
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || 'left'}
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: '#f0f7ff',
                      color: theme.palette.primary.main,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      py: 1.5,
                      px: 1.5,
                      position: 'sticky',
                      top: 0,
                      zIndex: 100,
                      width: getColumnWidth(headCell.id as string),
                      maxWidth: getColumnWidth(headCell.id as string)
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
                      selected={selectedBarrio?.id === barrio.id}
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
                        sx={{ py: 1.5, px: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
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
                      <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1
                        }}>
                          <HomeIcon sx={{ 
                            fontSize: 18, 
                            color: theme.palette.secondary.main,
                            flexShrink: 0 
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {barrio.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: theme.palette.info.dark,
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <LocationIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                          {getNombreSector(barrio.codSector)}
                        </Typography>
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ py: 1.5, px: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
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