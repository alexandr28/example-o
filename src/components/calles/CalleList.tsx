// src/components/calles/CalleListMUI.tsx
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
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  LocationCity as LocationCityIcon,
  Home as HomeIcon,
  Route as RouteIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Calle } from '../../models/Calle';

interface CalleListProps {
  calles: Calle[];
  onSelectCalle: (calle: Calle) => void;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  obtenerNombreSector?: (sectorId: number) => string;
  obtenerNombreBarrio?: (barrioId: number) => string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Calle | 'ubicacion' | 'acciones';
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

const headCells: HeadCell[] = [
  { id: 'nombre', label: 'Calle', sortable: true },
  { id: 'ubicacion', label: 'Ubicación', sortable: true },
  { id: 'estado', label: 'Estado', align: 'center', sortable: true },
  { id: 'acciones', label: 'Acciones', align: 'center' }
];

const CalleListMUI: React.FC<CalleListProps> = ({
  calles,
  onSelectCalle,
  onEliminar,
  loading = false,
  onSearch,
  searchTerm = '',
  obtenerNombreSector,
  obtenerNombreBarrio
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

  // Selección de calle
  const handleSelectCalle = (calle: Calle) => {
    setSelectedId(calle.id);
    onSelectCalle(calle);
  };

  // Obtener nombre completo de la calle
  const getNombreCompleto = (calle: Calle) => {
    const tipoDesc = calle.tipoVia || '';
    return `${tipoDesc} ${calle.nombre}`.trim();
  };

  // Obtener ubicación completa
  const getUbicacion = (calle: Calle) => {
    const sector = obtenerNombreSector ? obtenerNombreSector(calle.sectorId) : `Sector ${calle.sectorId}`;
    const barrio = obtenerNombreBarrio ? obtenerNombreBarrio(calle.barrioId) : `Barrio ${calle.barrioId}`;
    return `${sector} - ${barrio}`;
  };

  // Ordenar y filtrar datos
  const sortedAndFilteredCalles = useMemo(() => {
    let filteredData = [...calles];

    // Aplicar filtro de búsqueda local si no hay función de búsqueda externa
    if (!onSearch && localSearchTerm) {
      filteredData = filteredData.filter(calle => {
        const nombreCompleto = getNombreCompleto(calle).toLowerCase();
        const ubicacion = getUbicacion(calle).toLowerCase();
        const searchLower = localSearchTerm.toLowerCase();
        
        return nombreCompleto.includes(searchLower) || ubicacion.includes(searchLower);
      });
    }

    // Ordenar
    filteredData.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (orderBy === 'ubicacion') {
        aValue = getUbicacion(a);
        bValue = getUbicacion(b);
      } else {
        aValue = a[orderBy as keyof Calle];
        bValue = b[orderBy as keyof Calle];
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
  }, [calles, order, orderBy, localSearchTerm, onSearch]);

  // Calcular datos paginados
  const paginatedCalles = sortedAndFilteredCalles.slice(
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

  // Obtener icono según tipo de vía
  const getTipoViaIcon = (tipoVia: string) => {
    const tipo = tipoVia?.toUpperCase();
    if (tipo === 'AV' || tipo === 'AVENIDA') return <RouteIcon sx={{ fontSize: 16 }} />;
    if (tipo === 'JR' || tipo === 'JIRON') return <MapIcon sx={{ fontSize: 16 }} />;
    return <MapIcon sx={{ fontSize: 16 }} />;
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon color="primary" />
              <Typography variant="h6">
                Lista de Calles
              </Typography>
              <Chip
                label={sortedAndFilteredCalles.length}
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
            placeholder="Buscar por nombre de calle o ubicación..."
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
            ) : paginatedCalles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ display: 'inline-flex' }}>
                    {localSearchTerm 
                      ? `No se encontraron calles con "${localSearchTerm}"`
                      : 'No hay calles registradas'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCalles.map((calle) => (
                <Fade in={true} key={calle.id}>
                  <TableRow
                    hover
                    onClick={() => handleSelectCalle(calle)}
                    selected={selectedId === calle.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTipoViaIcon(calle.tipoVia)}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {getNombreCompleto(calle)}
                          </Typography>
                          {process.env.NODE_ENV === 'development' && (
                            <Typography variant="caption" color="text.secondary">
                              ID: {calle.id} | Código: {calle.codCalle || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationCityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {obtenerNombreSector ? obtenerNombreSector(calle.sectorId) : `Sector ${calle.sectorId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <HomeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {obtenerNombreBarrio ? obtenerNombreBarrio(calle.barrioId) : `Barrio ${calle.barrioId}`}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={calle.estado === false ? <CancelIcon /> : <CheckCircleIcon />}
                        label={calle.estado === false ? 'Inactivo' : 'Activo'}
                        size="small"
                        color={calle.estado === false ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {onEliminar && (
                        <Tooltip title="Eliminar calle">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEliminar(calle.id);
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
        count={sortedAndFilteredCalles.length}
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

export default CalleListMUI;