// src/components/direcciones/DireccionListMUI.tsx
import React, { useState, useMemo } from 'react';
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
  Stack,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  Home as HomeIcon
} from '@mui/icons-material';

interface DireccionListMUIProps {
  direcciones: any[];
  direccionSeleccionada: any | null;
  onSelectDireccion: (direccion: any) => void;
  loading?: boolean;
}

type Order = 'asc' | 'desc';

const DireccionListMUI: React.FC<DireccionListMUIProps> = ({
  direcciones,
  direccionSeleccionada,
  onSelectDireccion,
  loading = false
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('nombreVia');

  // Filtrar direcciones localmente
  const filteredDirecciones = useMemo(() => {
    return direcciones.filter(dir => {
      const search = searchTerm.toLowerCase();
      return (
        dir.nombreSector?.toLowerCase().includes(search) ||
        dir.nombreBarrio?.toLowerCase().includes(search) ||
        dir.nombreVia?.toLowerCase().includes(search) ||
        dir.nombreTipoVia?.toLowerCase().includes(search) ||
        dir.cuadra?.toString().includes(search)
      );
    });
  }, [direcciones, searchTerm]);

  // Ordenar direcciones
  const sortedDirecciones = useMemo(() => {
    const comparator = (a: any, b: any) => {
      let aValue = a[orderBy] || '';
      let bValue = b[orderBy] || '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (order === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    };
    
    return [...filteredDirecciones].sort(comparator);
  }, [filteredDirecciones, order, orderBy]);

  // Paginación
  const paginatedDirecciones = sortedDirecciones.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRequestSort = (property: string) => {
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

  // Columnas de la tabla
  const columns = [
    { id: 'codDireccion', label: 'Código', width: '10%' },
    { id: 'nombreSector', label: 'Sector', width: '15%' },
    { id: 'nombreBarrio', label: 'Barrio', width: '15%' },
    { id: 'nombreTipoVia', label: 'Tipo Vía', width: '12%' },
    { id: 'nombreVia', label: 'Nombre Vía', width: '20%' },
    { id: 'cuadra', label: 'Cuadra', width: '10%', align: 'center' as const },
    { id: 'lotes', label: 'Lotes', width: '10%', align: 'center' as const },
    { id: 'actions', label: 'Acciones', width: '8%', align: 'center' as const }
  ];

  return (
    <Paper elevation={3}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h3">
            Lista de Direcciones
          </Typography>
          
          {/* Búsqueda local */}
          <TextField
            size="small"
            placeholder="Filtrar resultados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ width: column.width }}
                  sx={{ 
                    bgcolor: 'grey.100',
                    fontWeight: 'bold'
                  }}
                >
                  {column.id !== 'actions' && column.id !== 'lotes' ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              // Skeletons de carga
              [...Array(5)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedDirecciones.length === 0 ? (
              // Estado vacío
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box sx={{ py: 8 }}>
                    <LocationIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron direcciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Intente con otros términos de búsqueda' : 'No hay direcciones registradas'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Filas de datos
              paginatedDirecciones.map((direccion) => {
                const isSelected = direccionSeleccionada?.codDireccion === direccion.codDireccion;
                
                return (
                  <TableRow
                    key={direccion.codDireccion}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'inherit',
                      '&:hover': {
                        bgcolor: isSelected 
                          ? alpha(theme.palette.primary.main, 0.12) 
                          : alpha(theme.palette.action.hover, 0.04)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'normal'}>
                        {direccion.codDireccion}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {direccion.nombreSector}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <HomeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {direccion.nombreBarrio}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={direccion.nombreTipoVia}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {direccion.nombreVia}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={direccion.cuadra}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Typography variant="body2">
                        {direccion.loteInicial} - {direccion.loteFinal}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Tooltip title={isSelected ? "Dirección seleccionada" : "Seleccionar dirección"}>
                        <IconButton
                          size="small"
                          color={isSelected ? "primary" : "default"}
                          onClick={() => onSelectDireccion(direccion)}
                        >
                          {isSelected ? <LocationIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
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

      {/* Resumen */}
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<LocationIcon />}
            label={`Total: ${direcciones.length} direcciones`}
            size="small"
            color="primary"
          />
          {searchTerm && (
            <Chip
              icon={<FilterIcon />}
              label={`Filtradas: ${filteredDirecciones.length}`}
              size="small"
              color="secondary"
            />
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default DireccionListMUI;