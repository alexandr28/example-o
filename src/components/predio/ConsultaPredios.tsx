// src/components/predio/ConsultaPredios.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  Chip,
  TablePagination,
  Collapse,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  Alert,
  FormControl,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../ui/SearchableSelect';
import { predioService } from '../../services/predioService';
import { Predio } from '../../models/Predio';
import { NotificationService } from '../utils/Notification';

interface Filtros {
  codPredio: string;
  anio: number;
  direccion: string;
}

const ConsultaPredios: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [predios, setPredios] = useState<Predio[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtros, setFiltros] = useState<Filtros>({
    codPredio: '',
    anio: new Date().getFullYear(),
    direccion: ''
  });

  // Generar opciones de años
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    id: currentYear - i,
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  // Cargar datos iniciales
  useEffect(() => {
    cargarPredios();
  }, []);

  // Función para cargar predios
  const cargarPredios = useCallback(async () => {
    setLoading(true);
    try {
      let prediosData: Predio[] = [];
      
      if (filtros.codPredio || filtros.anio || filtros.direccion) {
        prediosData = await predioService.buscarPredios(
          filtros.codPredio || undefined,
          filtros.anio || undefined,
          filtros.direccion ? parseInt(filtros.direccion) : undefined
        );
      } else {
        prediosData = await predioService.getAll();
      }
      
      setPredios(prediosData);
      setPage(0);
    } catch (error) {
      console.error('Error al cargar predios:', error);
      NotificationService.error('Error al cargar los predios');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Función de búsqueda local
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    cargarPredios();
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      codPredio: '',
      anio: new Date().getFullYear(),
      direccion: ''
    });
    setSearchTerm('');
    cargarPredios();
  };

  // Filtrar predios localmente
  const filteredPredios = predios.filter(predio => 
    predio.codigoPredio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.tipoPredio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.direccion?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const paginatedPredios = filteredPredios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (predio: Predio) => {
    navigate(`/predio/editar/${predio.id}`);
  };

  const handleDelete = async (predio: Predio) => {
    if (window.confirm(`¿Está seguro de eliminar el predio ${predio.codigoPredio}?`)) {
      try {
        setLoading(true);
        await predioService.delete(predio.id!);
        NotificationService.success('Predio eliminado correctamente');
        await cargarPredios();
      } catch (error) {
        console.error('Error al eliminar predio:', error);
        NotificationService.error('Error al eliminar el predio');
      } finally {
        setLoading(false);
      }
    }
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Características del predio
        </Typography>
      </Box>

      {/* Sección de filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={500}>
              Filtros de búsqueda
            </Typography>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color="primary"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <FilterIcon />
            </IconButton>
          </Stack>

          <Collapse in={showFilters}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Código Predio"
                  value={filtros.codPredio}
                  onChange={(e) => setFiltros({ ...filtros, codPredio: e.target.value })}
                  placeholder="Ej: 20241"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <SearchableSelect
                    label="Año"
                    options={yearOptions}
                    value={yearOptions.find(opt => opt.value === filtros.anio) || null}
                    onChange={(option) => setFiltros({ ...filtros, anio: option?.value || new Date().getFullYear() })}
                    placeholder="Seleccione año"
                    fullWidth
                    size="medium"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="ID de dirección"
                  value={filtros.direccion}
                  onChange={(e) => setFiltros({ ...filtros, direccion: e.target.value })}
                  placeholder="ID de dirección"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={aplicarFiltros}
                    startIcon={<SearchIcon />}
                    disabled={loading}
                    sx={{ 
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Aplicar
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={limpiarFiltros}
                    startIcon={<ClearIcon />}
                    disabled={loading}
                    sx={{ 
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Limpiar
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Búsqueda rápida */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar en los resultados..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Paper elevation={1}>
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    CÓDIGO PREDIO
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontWeight={600}>
                    TIPO PREDIO
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    ÁREA DEL TERRENO
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    VALOR ARANCEL
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    VALOR TERRENO
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    VALOR DE CONSTRUCCIÓN
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    OTRAS INSTALACIONES
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" fontWeight={600}>
                    AUTOVALÚO
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
              {paginatedPredios.length > 0 ? (
                paginatedPredios.map((predio) => (
                  <TableRow 
                    key={predio.id} 
                    hover
                    sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {predio.codigoPredio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={predio.tipoPredio} 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatCurrency(predio.areaTerreno)} m²
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        S/ {formatCurrency(predio.valorArancel)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        S/ {formatCurrency(predio.valorTerreno)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        S/ {formatCurrency(predio.valorConstruccion)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        S/ {formatCurrency(predio.otrasInstalaciones)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        S/ {formatCurrency(predio.autoavalo)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(predio)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(predio)}
                            color="error"
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
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
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
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Información adicional */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {paginatedPredios.length} de {filteredPredios.length} predios
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={cargarPredios}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>
    </Box>
  );
};

export default ConsultaPredios;