// src/components/predio/ConsultaPredios.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Stack,
  Typography,
  Chip,
  Tooltip,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Home as HomeIcon,
  Terrain as TerrainIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePredios } from '../../hooks/usePredioAPI';
import { Predio } from '../../models/Predio';
import { NotificationService } from '../utils/Notification';
import { formatCurrency } from '../../utils/formatters';

/**
 * Componente de consulta de predios con Material-UI
 */
const ConsultaPredios: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    predios, 
    loading, 
    cargarPredios, 
    buscarPredios,
    eliminarPredio,
    estadisticas,
    cargarEstadisticas
  } = usePredios();

  // Estados locales
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    codigoPredio: '',
    anio: new Date().getFullYear(),
    estadoPredio: '',
    condicionPropiedad: ''
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Filtrar predios localmente
  const filteredPredios = useMemo(() => {
    if (!searchTerm) return predios;
    
    const term = searchTerm.toLowerCase();
    return predios.filter(predio => 
      predio.codigoPredio?.toLowerCase().includes(term) ||
      predio.direccion?.toString().toLowerCase().includes(term) ||
      predio.conductor?.toLowerCase().includes(term) ||
      predio.numeroFinca?.toLowerCase().includes(term)
    );
  }, [predios, searchTerm]);

  // Paginar predios
  const paginatedPredios = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPredios.slice(start, end);
  }, [filteredPredios, page, rowsPerPage]);

  // Handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (predio: Predio) => {
    navigate(`/predio/editar/${predio.codigoPredio}`);
  };

  const handleDelete = async (codigoPredio: string) => {
    if (window.confirm(`¿Está seguro de eliminar el predio ${codigoPredio}?`)) {
      const result = await eliminarPredio(codigoPredio);
      if (result) {
        NotificationService.success('Predio eliminado exitosamente');
      }
    }
  };

  const handleView = (predio: Predio) => {
    navigate(`/predio/detalle/${predio.codigoPredio}`);
  };

  const handleBuscar = () => {
    buscarPredios(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      codigoPredio: '',
      anio: new Date().getFullYear(),
      estadoPredio: '',
      condicionPropiedad: ''
    });
    setSearchTerm('');
    cargarPredios();
  };

  const getEstadoChip = (estado?: string) => {
    const estadoUpper = estado?.toUpperCase();
    switch (estadoUpper) {
      case 'TERMINADO':
        return <Chip label="Terminado" color="success" size="small" />;
      case 'EN_CONSTRUCCION':
        return <Chip label="En Construcción" color="warning" size="small" />;
      case 'EN_PROCESO':
        return <Chip label="En Proceso" color="info" size="small" />;
      case 'REGISTRADO':
        return <Chip label="Registrado" color="primary" size="small" />;
      case 'OBSERVADO':
        return <Chip label="Observado" color="error" size="small" />;
      default:
        return <Chip label={estado || 'Sin Estado'} size="small" />;
    }
  };

  return (
    <Box>
      {/* Tarjetas de estadísticas */}
      {estadisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary" variant="body2">
                      Total Predios
                    </Typography>
                    <HomeIcon color="primary" />
                  </Stack>
                  <Typography variant="h4" fontWeight={600}>
                    {estadisticas.total}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary" variant="body2">
                      Área Total
                    </Typography>
                    <TerrainIcon color="success" />
                  </Stack>
                  <Typography variant="h5" fontWeight={600}>
                    {estadisticas.areaTerrenoTotal.toFixed(2)} m²
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary" variant="body2">
                      Área Construida
                    </Typography>
                    <HomeIcon color="warning" />
                  </Stack>
                  <Typography variant="h5" fontWeight={600}>
                    {estadisticas.areaConstruidaTotal.toFixed(2)} m²
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary" variant="body2">
                      Estados
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    {Object.entries(estadisticas.porEstado).slice(0, 3).map(([estado, count]) => (
                      <Chip 
                        key={estado}
                        label={`${estado}: ${count}`} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Barra de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por código, dirección, conductor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Código Predio"
              value={filtros.codigoPredio}
              onChange={(e) => setFiltros({ ...filtros, codigoPredio: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Año"
              type="number"
              value={filtros.anio}
              onChange={(e) => setFiltros({ ...filtros, anio: parseInt(e.target.value) })}
              InputProps={{
                inputProps: { 
                  min: 1900, 
                  max: new Date().getFullYear() 
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={handleBuscar}
                disabled={loading}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                onClick={handleLimpiarFiltros}
                disabled={loading}
              >
                Limpiar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarPredios}
                disabled={loading}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => navigate('/predio/nuevo')}
              >
                Nuevo
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de predios */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    CÓDIGO
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    DIRECCIÓN
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    CONDUCTOR
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    CONDICIÓN
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" fontWeight={600}>
                    ÁREA (m²)
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    ESTADO
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    ACCIONES
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedPredios.length > 0 ? (
                paginatedPredios.map((predio) => (
                  <TableRow
                    key={predio.codigoPredio}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {predio.codigoPredio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          {predio.direccion || 'Sin dirección'}
                        </Typography>
                        {predio.numeroFinca && (
                          <Typography variant="caption" color="text.secondary">
                            Finca: {predio.numeroFinca}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={predio.conductor} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {predio.condicionPropiedad}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {predio.areaTerreno.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getEstadoChip(predio.estadoPredio)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small" 
                            onClick={() => handleView(predio)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEdit(predio)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(predio.codigoPredio)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <SearchIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        No se encontraron predios
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Intente ajustar los filtros de búsqueda
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredPredios.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Información adicional */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {paginatedPredios.length} de {filteredPredios.length} predios
        </Typography>
      </Box>
    </Box>
  );
};

export default ConsultaPredios;