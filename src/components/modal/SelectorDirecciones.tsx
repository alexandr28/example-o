// src/components/modal/SelectorDireccionesMUI.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Stack,
  Tooltip,
  useTheme,
  alpha,
  TablePagination,
  Skeleton
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { direccionService } from '../../services/direcionService';
import { NotificationService } from '../utils/Notification';

// Interfaz para Dirección
interface Direccion {
  id: number;
  codDireccion?: number;
  descripcion: string;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  sectorId?: number;
  barrioId?: number;
  calleId?: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  cuadra?: string;
}

interface SelectorDireccionesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDireccion: (direccion: Direccion) => void;
  direcciones?: Direccion[];
}

const SelectorDireccionesMUI: React.FC<SelectorDireccionesProps> = ({
  isOpen,
  onClose,
  onSelectDireccion,
  direcciones: direccionesProp,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Parámetros de búsqueda
  const [nombreVia, setNombreVia] = useState('');
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<any>(null);

  // Opciones mock para sectores y barrios (reemplazar con datos reales)
  const sectoresOptions = [
    { id: 1, label: 'Centro', descripcion: 'Sector Centro' },
    { id: 2, label: 'Norte', descripcion: 'Sector Norte' },
    { id: 3, label: 'Sur', descripcion: 'Sector Sur' }
  ];

  const barriosOptions = [
    { id: 1, label: 'San Juan', descripcion: 'Barrio San Juan' },
    { id: 2, label: 'Las Flores', descripcion: 'Barrio Las Flores' },
    { id: 3, label: 'El Carmen', descripcion: 'Barrio El Carmen' }
  ];

  // Cargar direcciones al abrir el modal
  useEffect(() => {
    if (isOpen && !direccionesProp) {
      buscarDirecciones();
    } else if (direccionesProp) {
      setDirecciones(direccionesProp);
    }
  }, [isOpen, direccionesProp]);

  // Función para buscar direcciones
  const buscarDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        nombreVia: nombreVia || 'a',
        codUsuario: 1,
        codSector: selectedSector?.id,
        codBarrio: selectedBarrio?.id
      };
      
      console.log('🔍 Buscando direcciones con parámetros:', params);
      
      const data = await direccionService.buscarPorNombreVia(params);
      setDirecciones(data);
      setPage(0); // Resetear a la primera página
      
      if (data.length === 0) {
        NotificationService.info('No se encontraron direcciones con los criterios especificados');
      }
      
    } catch (err: any) {
      console.error('❌ Error al buscar direcciones:', err);
      setError(err.message || 'Error al buscar direcciones');
      NotificationService.error('Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  }, [nombreVia, selectedSector, selectedBarrio]);

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setNombreVia('');
    setSelectedSector(null);
    setSelectedBarrio(null);
    setSearchTerm('');
    setSelectedDireccion(null);
    buscarDirecciones();
  };

  // Filtrar direcciones según el término de búsqueda
  const direccionesFiltradas = direcciones.filter(dir => {
    const descripcionCompleta = `${dir.descripcion} ${dir.nombreSector || ''} ${dir.nombreBarrio || ''} ${dir.nombreVia || ''}`.toLowerCase();
    return descripcionCompleta.includes(searchTerm.toLowerCase());
  });

  // Calcular direcciones paginadas
  const direccionesPaginadas = direccionesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Manejo de selección
  const handleSelectDireccion = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleConfirmar = () => {
    if (selectedDireccion) {
      onSelectDireccion(selectedDireccion);
      onClose();
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

  // Renderizar skeleton para loading
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton width={40} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: 900
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            <Typography variant="h6">Seleccionar Dirección</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Filtros de búsqueda */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.grey[50] }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Nombre de vía"
                value={nombreVia}
                onChange={(e) => setNombreVia(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') buscarDirecciones();
                }}
                placeholder="Ingrese nombre de la vía..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <SearchableSelect
                id="sector-filter"
                label="Sector"
                options={sectoresOptions}
                value={selectedSector}
                onChange={setSelectedSector}
                placeholder="Todos"
                textFieldProps={{ size: 'small' }}
                startIcon={<ApartmentIcon />}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <SearchableSelect
                id="barrio-filter"
                label="Barrio"
                options={barriosOptions}
                value={selectedBarrio}
                onChange={setSelectedBarrio}
                placeholder="Todos"
                textFieldProps={{ size: 'small' }}
                startIcon={<HomeIcon />}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={buscarDirecciones}
                  disabled={loading}
                  startIcon={<SearchIcon />}
                  size="small"
                >
                  Buscar
                </Button>
                <Tooltip title="Limpiar filtros">
                  <IconButton onClick={limpiarBusqueda} size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>

          {/* Búsqueda rápida en resultados */}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filtrar resultados..."
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
          </Box>
        </Box>

        {/* Progress bar */}
        {loading && <LinearProgress />}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabla de direcciones */}
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Detalles</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Seleccionar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : direccionesPaginadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Alert severity="info" sx={{ display: 'inline-flex' }}>
                      {searchTerm 
                        ? 'No se encontraron direcciones con los filtros aplicados'
                        : 'No hay direcciones disponibles'}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                direccionesPaginadas.map((direccion) => (
                  <TableRow
                    key={direccion.id}
                    hover
                    selected={selectedDireccion?.id === direccion.id}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelectDireccion(direccion)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {direccion.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {direccion.nombreSector && (
                          <Chip
                            icon={<ApartmentIcon />}
                            label={direccion.nombreSector}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {direccion.nombreBarrio && (
                          <Chip
                            icon={<HomeIcon />}
                            label={direccion.nombreBarrio}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {direccion.lado && `Lado: ${direccion.lado}`}
                        {direccion.cuadra && ` • Cuadra: ${direccion.cuadra}`}
                        {` • Lotes: ${direccion.loteInicial}-${direccion.loteFinal}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color={selectedDireccion?.id === direccion.id ? 'primary' : 'default'}
                      >
                        {selectedDireccion?.id === direccion.id && <CheckIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={direccionesFiltradas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          disabled={!selectedDireccion}
          startIcon={<CheckIcon />}
        >
          Confirmar Selección
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorDireccionesMUI;