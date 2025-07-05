// src/components/barrio/BarrioListMUI.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tooltip,
  TableSortLabel,
  Skeleton,
  Alert,
  Stack,
  useTheme,
  alpha,
  Fade,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  LocationCity as LocationCityIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CloudOff as CloudOffIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Barrio } from '../../models/Barrio';

interface BarrioListProps {
  barrios: Barrio[];
  onSelectBarrio: (barrio: Barrio) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  obtenerNombreSector?: (sectorId: number) => string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Barrio | 'sector' | 'acciones';
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

const headCells: HeadCell[] = [
  { id: 'nombre', label: 'Barrio', sortable: true },
  { id: 'sector', label: 'Sector', sortable: true },
  { id: 'estado', label: 'Estado', align: 'center', sortable: true },
  { id: 'acciones', label: 'Acciones', align: 'center' }
];

const BarrioListMUI: React.FC<BarrioListProps> = ({
  barrios,
  onSelectBarrio,
  isOfflineMode = false,
  onEliminar,
  loading = false,
  onSearch,
  searchTerm = '',
  obtenerNombreSector
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('nombre');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Manejo de ordenamiento
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Manejo de búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      // Debounce la búsqueda
      const timeoutId = setTimeout(() => {
        onSearch(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Selección de barrio
  const handleSelectBarrio = (barrio: Barrio) => {
    setSelectedId(barrio.id);
    onSelectBarrio(barrio);
  };

  // Ordenar y filtrar datos
  const sortedAndFilteredBarrios = useMemo(() => {
    let filteredData = [...barrios];

    // Aplicar filtro de búsqueda local si no hay función de búsqueda externa
    if (!onSearch && localSearchTerm) {
      filteredData = filteredData.filter(barrio =>
        barrio.nombre?.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
    }

    // Ordenar
    filteredData.sort((a, b) => {
      let aValue: any = a[orderBy as keyof Barrio];
      let bValue: any = b[orderBy as keyof Barrio];

      // Para el caso especial de sector
      if (orderBy === 'sector' && obtenerNombreSector) {
        aValue = obtenerNombreSector(a.sectorId);
        bValue = obtenerNombreSector(b.sectorId);
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
  }, [barrios, order, orderBy, localSearchTerm, onSearch, obtenerNombreSector]);

  // Calcular datos paginados
  const paginatedBarrios = sortedAndFilteredBarrios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Skeleton rows para loading
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell align="center"><Skeleton width={80} /></TableCell>
        <TableCell align="center"><Skeleton width={40} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon color="primary" />
              <Typography variant="h6">
                Lista de Barrios
              </Typography>
              <Chip
                label={sortedAndFilteredBarrios.length}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Barra de búsqueda */}
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por nombre de barrio..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
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
              )
            }}
          />
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper',
                    borderBottom: 2,
                    borderColor: 'divider'
                  }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id as string)}
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
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ display: 'inline-flex' }}>
                    {localSearchTerm 
                      ? `No se encontraron barrios con "${localSearchTerm}"`
                      : 'No hay barrios registrados'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBarrios.map((barrio) => (
                <Fade in={true} key={barrio.id}>
                  <TableRow
                    hover
                    onClick={() => handleSelectBarrio(barrio)}
                    selected={selectedId === barrio.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {barrio.nombre || barrio.nombreBarrio || 'Sin nombre'}
                        </Typography>
                        {process.env.NODE_ENV === 'development' && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {barrio.id} | Código: {barrio.codBarrio || 'N/A'}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationCityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {obtenerNombreSector ? obtenerNombreSector(barrio.sectorId) : `Sector ${barrio.sectorId}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={barrio.estado === false ? <CancelIcon /> : <CheckCircleIcon />}
                        label={barrio.estado === false ? 'Inactivo' : 'Activo'}
                        size="small"
                        color={barrio.estado === false ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {onEliminar && (
                        <Tooltip title="Eliminar barrio">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEliminar(barrio.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
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
    </Paper>
  );
};

export default BarrioListMUI;