// src/components/modal/SelectorDirecciones.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
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
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface Direccion {
  id: number;
  codigo: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  estado?: boolean;
}

interface SelectorDireccionesProps {
  open: boolean;
  onClose: () => void;
  onSelectDireccion: (direccion: Direccion) => void;
  direccionSeleccionada?: Direccion | null;
}

// Datos de ejemplo para desarrollo
const direccionesEjemplo: Direccion[] = [
  {
    id: 1,
    codigo: '001',
    sector: 'Centro',
    barrio: 'San Juan',
    tipoVia: 'Calle',
    nombreVia: 'Los Álamos',
    cuadra: 1,
    lado: 'Derecho',
    loteInicial: 1,
    loteFinal: 10,
    estado: true
  },
  {
    id: 2,
    codigo: '002',
    sector: 'Norte',
    barrio: 'Las Flores',
    tipoVia: 'Avenida',
    nombreVia: 'Principal',
    cuadra: 2,
    lado: 'Izquierdo',
    loteInicial: 1,
    loteFinal: 20,
    estado: true
  },
  {
    id: 3,
    codigo: '003',
    sector: 'Sur',
    barrio: 'Villa Sol',
    tipoVia: 'Jirón',
    nombreVia: 'Las Palmeras',
    cuadra: 3,
    lado: 'Ambos',
    loteInicial: 1,
    loteFinal: 15,
    estado: true
  }
];

const sectoresEjemplo = [
  { id: 1, nombre: 'Centro' },
  { id: 2, nombre: 'Norte' },
  { id: 3, nombre: 'Sur' },
  { id: 4, nombre: 'Este' },
  { id: 5, nombre: 'Oeste' }
];

const barriosEjemplo = [
  { id: 1, nombre: 'San Juan' },
  { id: 2, nombre: 'Las Flores' },
  { id: 3, nombre: 'Villa Sol' },
  { id: 4, nombre: 'Los Pinos' },
  { id: 5, nombre: 'Santa Rosa' }
];

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
  const [direcciones, setDirecciones] = useState<Direccion[]>(direccionesEjemplo);
  const [loading, setLoading] = useState(false);

  // Efecto para establecer la dirección seleccionada al abrir
  useEffect(() => {
    if (open && direccionSeleccionada) {
      setSelectedDireccion(direccionSeleccionada);
    }
  }, [open, direccionSeleccionada]);

  // Efecto para simular búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarDirecciones();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, sectorFilter, barrioFilter]);

  // Buscar direcciones (simulado)
  const buscarDirecciones = () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...direccionesEjemplo];

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(d => 
          d.nombreVia.toLowerCase().includes(term) ||
          d.codigo.toLowerCase().includes(term)
        );
      }

      // Filtrar por sector
      if (sectorFilter) {
        filtered = filtered.filter(d => d.sector === sectorFilter);
      }

      // Filtrar por barrio
      if (barrioFilter) {
        filtered = filtered.filter(d => d.barrio === barrioFilter);
      }

      setDirecciones(filtered);
      setLoading(false);
    }, 500);
  };

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
  };

  // Formatear dirección para mostrar
  const formatDireccion = (direccion: Direccion) => {
    return `${direccion.tipoVia} ${direccion.nombreVia} - Cuadra ${direccion.cuadra} - Lado ${direccion.lado} - Lotes ${direccion.loteInicial}-${direccion.loteFinal}`;
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre de vía o código..."
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
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sector</InputLabel>
              <Select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                label="Sector"
              >
                <MenuItem value="">Todos</MenuItem>
                {sectoresEjemplo.map((sector) => (
                  <MenuItem key={sector.id} value={sector.nombre}>
                    {sector.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Barrio</InputLabel>
              <Select
                value={barrioFilter}
                onChange={(e) => setBarrioFilter(e.target.value)}
                label="Barrio"
              >
                <MenuItem value="">Todos</MenuItem>
                {barriosEjemplo.map((barrio) => (
                  <MenuItem key={barrio.id} value={barrio.nombre}>
                    {barrio.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="small"
            >
              Limpiar
            </Button>
          </Stack>
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
              ) : direcciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron direcciones
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                direcciones.map((direccion) => (
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
                        label={direccion.estado !== false ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={direccion.estado !== false ? 'success' : 'default'}
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