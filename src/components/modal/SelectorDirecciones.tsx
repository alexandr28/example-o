// src/components/modal/SelectorDirecciones.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useDirecciones } from '../../hooks/useDirecciones';
import { useSectores } from '../../hooks/useSectores';
import { useBarrios } from '../../hooks/useBarrios';

interface Direccion {
  id: number;
  codigo: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial?: number;
  loteFinal?: number;
  estado?: number;
}

interface SelectorDireccionesProps {
  open: boolean;
  onClose: () => void;
  onSelectDireccion: (direccion: Direccion) => void;
  direccionSeleccionada?: Direccion | null;
}

const SelectorDirecciones: React.FC<SelectorDireccionesProps> = ({
  open,
  onClose,
  onSelectDireccion,
  direccionSeleccionada
}) => {
  // Estados
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [barrioFilter, setBarrioFilter] = useState('');

  // Hooks
  const { direcciones, loading, buscarPorNombreVia, cargarDirecciones } = useDirecciones();
  const { sectores } = useSectores();
  const { barrios } = useBarrios();

  // Cargar direcciones al abrir
  useEffect(() => {
    if (open) {
      cargarDirecciones();
      if (direccionSeleccionada) {
        setSelectedDireccion(direccionSeleccionada);
      }
    }
  }, [open, direccionSeleccionada]);

  // Buscar direcciones
  const handleSearch = useCallback(() => {
    if (searchTerm.trim().length >= 2) {
      buscarPorNombreVia(searchTerm);
    } else {
      cargarDirecciones();
    }
  }, [searchTerm, buscarPorNombreVia, cargarDirecciones]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  // Filtrar direcciones localmente
  const direccionesFiltradas = React.useMemo(() => {
    let filtered = direcciones;

    if (sectorFilter) {
      filtered = filtered.filter(d => d.sector === sectorFilter);
    }

    if (barrioFilter) {
      filtered = filtered.filter(d => d.barrio === barrioFilter);
    }

    return filtered;
  }, [direcciones, sectorFilter, barrioFilter]);

  // Handlers
  const handleSelectDireccion = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleConfirm = () => {
    if (selectedDireccion) {
      onSelectDireccion(selectedDireccion);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedDireccion(null);
    setSearchTerm('');
    setSectorFilter('');
    setBarrioFilter('');
    onClose();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSectorFilter('');
    setBarrioFilter('');
    cargarDirecciones();
  };

  // Formatear dirección para mostrar
  const formatDireccion = (direccion: Direccion) => {
    return `${direccion.tipoVia} ${direccion.nombreVia} - Cuadra ${direccion.cuadra} - Lado ${direccion.lado} - Lotes ${(direccion.loteInicial ?? '-')} - ${(direccion.loteFinal ?? '-')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon color="primary" />
            <Typography variant="h6">Seleccionar Dirección</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Filtros de búsqueda */}
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre de vía..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sector"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                inputProps={{
                  'aria-label': 'Sector'
                }}
              >
                <option value="">Todos</option>
                {sectores.map((sector) => (
                  <option key={sector.id} value={sector.nombre}>
                    {sector.nombre}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Barrio"
                value={barrioFilter}
                onChange={(e) => setBarrioFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                inputProps={{
                  'aria-label': 'Barrio'
                }}
              >
                <option value="">Todos</option>
                {barrios.map((barrio) => (
                  <option key={barrio.id} value={barrio.nombre}>
                    {barrio.nombre}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                size="small"
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tabla de direcciones */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50}></TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell>Barrio</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : direccionesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron direcciones
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                direccionesFiltradas.map((direccion) => (
                  <TableRow
                    key={direccion.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      }
                    }}
                    selected={selectedDireccion?.id === direccion.id}
                    onClick={() => handleSelectDireccion(direccion)}
                  >
                    <TableCell>
                      <Radio
                        checked={selectedDireccion?.id === direccion.id}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{direccion.codigo}</TableCell>
                    <TableCell>{direccion.sector}</TableCell>
                    <TableCell>{direccion.barrio}</TableCell>
                    <TableCell>{formatDireccion(direccion)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={direccion.estado === 1 ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={direccion.estado === 1 ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dirección seleccionada */}
        {selectedDireccion && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Dirección seleccionada:</Typography>
            <Typography variant="body2">
              {selectedDireccion.sector} + {selectedDireccion.barrio} + {formatDireccion(selectedDireccion)}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedDireccion}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorDirecciones;