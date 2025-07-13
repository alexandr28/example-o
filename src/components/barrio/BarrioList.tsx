// src/components/barrio/BarrioList.tsx - VERSIÓN COMPLETA CORREGIDA
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
import { BarrioData } from '../../services/barrioService';

interface BarrioListProps {
  barrios: BarrioData[];
  onSelectBarrio: (barrio: BarrioData) => void;
  isOfflineMode?: boolean;
  onEliminar?: (id: number) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  obtenerNombreSector?: (sectorId: number) => string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof BarrioData | 'sector' | 'acciones';
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

   // LOGS DE DEBUG
  useEffect(() => {
    console.log('🔍 [BarrioList] Props recibidas:', {
      barrios,
      cantidadBarrios: barrios?.length,
      loading,
      searchTerm
    });
    
    if (barrios && barrios.length > 0) {
      console.log('📋 [BarrioList] Primer barrio:', barrios[0]);
    }
  }, [barrios, loading]);
  
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Manejo de ordenamiento
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Manejo de búsqueda local
  const handleLocalSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    setPage(0);
    
    if (onSearch) {
      onSearch(value);
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

  // Seleccionar barrio
  const handleSelectBarrio = (barrio: BarrioData) => {
    setSelectedId(barrio.codigo);
    onSelectBarrio(barrio);
  };

  // Filtrado y ordenamiento
  const sortedAndFilteredBarrios = useMemo(() => {
    let filtered = [...barrios];

    // Filtrado local
    if (localSearchTerm) {
      const searchLower = localSearchTerm.toLowerCase();
      filtered = filtered.filter(barrio => 
        barrio.nombre.toLowerCase().includes(searchLower) ||
        (obtenerNombreSector && obtenerNombreSector(barrio.codigoSector).toLowerCase().includes(searchLower))
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (orderBy) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
        case 'sector':
          const sectorA = obtenerNombreSector ? obtenerNombreSector(a.codigoSector) : '';
          const sectorB = obtenerNombreSector ? obtenerNombreSector(b.codigoSector) : '';
          comparison = sectorA.localeCompare(sectorB);
          break;
        case 'estado':
          comparison = (a.estado === b.estado) ? 0 : (a.estado === 'ACTIVO' ? -1 : 1);
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [barrios, localSearchTerm, orderBy, order, obtenerNombreSector]);

  // Paginación
  const paginatedBarrios = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedAndFilteredBarrios.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedAndFilteredBarrios, page, rowsPerPage]);

  // Renderizado de skeleton
  const renderSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell align="center"><Skeleton variant="rounded" width={80} height={24} /></TableCell>
          <TableCell align="center"><Skeleton variant="circular" width={32} height={32} /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header con búsqueda */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre de barrio..."
            value={localSearchTerm}
            onChange={handleLocalSearch}
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
          
          {isOfflineMode && (
            <Chip
              icon={<CloudOffIcon />}
              label="Offline"
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>

      {/* Mensaje cuando no hay datos */}
      <Collapse in={!loading && barrios.length === 0}>
        <Alert 
          severity="info" 
          sx={{ m: 2 }}
          icon={<HomeIcon />}
        >
          <Typography variant="body2">
            No hay barrios registrados
          </Typography>
        </Alert>
      </Collapse>

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
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
              renderSkeleton()
            ) : paginatedBarrios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {localSearchTerm 
                      ? `No se encontraron barrios que coincidan con "${localSearchTerm}"`
                      : 'No hay barrios para mostrar'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBarrios.map((barrio, index) => (
                <Fade
                  key={barrio.codigo}
                  in={true}
                  timeout={300 + index * 50}
                >
                  <TableRow
                    hover
                    onClick={() => handleSelectBarrio(barrio)}
                    selected={selectedId === barrio.codigo}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12)
                        }
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {barrio.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationCityIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {obtenerNombreSector ? obtenerNombreSector(barrio.codigoSector) : `Sector ${barrio.codigoSector}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={barrio.estado === 'INACTIVO' ? <CancelIcon /> : <CheckCircleIcon />}
                        label={barrio.estado === 'INACTIVO' ? 'Inactivo' : 'Activo'}
                        size="small"
                        color={barrio.estado === 'INACTIVO' ? 'error' : 'success'}
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
                              onEliminar(barrio.codigo);
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