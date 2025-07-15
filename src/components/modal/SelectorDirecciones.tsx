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
  MenuItem,
  useTheme,
  alpha,
  Fade,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Apartment as ApartmentIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { direccionService, DireccionData } from '../../services/direccionService';
import { NotificationService } from '../utils/Notification';

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
  descripcion?: string;
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
  const theme = useTheme();
  
  // Estados
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [barrioFilter, setBarrioFilter] = useState('');
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectores, setSectores] = useState<string[]>([]);
  const [barrios, setBarrios] = useState<string[]>([]);

  // Efecto para establecer la dirección seleccionada al abrir
  useEffect(() => {
    if (open && direccionSeleccionada) {
      setSelectedDireccion(direccionSeleccionada);
    }
  }, [open, direccionSeleccionada]);

  // Efecto para cargar direcciones cuando se abre el modal
  useEffect(() => {
    if (open) {
      cargarDirecciones();
    }
  }, [open]);

  // Efecto para buscar con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        buscarDirecciones();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, sectorFilter, barrioFilter]);

  // Cargar todas las direcciones inicialmente
  const cargarDirecciones = async () => {
    try {
      setLoading(true);
      const data = await direccionService.listarDireccionPorNombreVia('a'); // Buscar con 'a' para obtener más resultados
      
      // Convertir datos de la API al formato del componente
      const direccionesFormateadas = data.map(item => ({
        id: item.codDireccion,
        codigo: String(item.codDireccion).padStart(3, '0'),
        sector: item.nombreSector || 'Sin sector',
        barrio: item.nombreBarrio || 'Sin barrio',
        tipoVia: item.nombreTipoVia || 'CALLE',
        nombreVia: item.nombreVia || '',
        cuadra: item.cuadra || 0,
        lado: item.lado || '-',
        loteInicial: item.loteInicial || 0,
        loteFinal: item.loteFinal || 0,
        descripcion: `${item.nombreSector || ''} + ${item.nombreBarrio || ''} + ${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} - Cuadra ${item.cuadra || 0} - Lado ${item.lado || '-'} - Lotes ${item.loteInicial || 0}-${item.loteFinal || 0}`
      }));
      
      setDirecciones(direccionesFormateadas);
      
      // Extraer sectores y barrios únicos
      const sectoresUnicos = [...new Set(data.map(d => d.nombreSector).filter((x): x is string => Boolean(x)))];
      const barriosUnicos = [...new Set(data.map(d => d.nombreBarrio).filter((x): x is string => Boolean(x)))];
      
      setSectores(sectoresUnicos);
      setBarrios(barriosUnicos);
      
    } catch (error) {
      console.error('Error cargando direcciones:', error);
      NotificationService.error('Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  // Buscar direcciones con filtros
  const buscarDirecciones = async () => {
    try {
      setLoading(true);
      
      const data = await direccionService.buscarDirecciones({
        nombreVia: searchTerm,
        sector: sectorFilter,
        barrio: barrioFilter
      });
      
      // Convertir y filtrar localmente si es necesario
      const direccionesFormateadas = data.map(item => ({
        id: item.codDireccion,
        codigo: String(item.codDireccion).padStart(3, '0'),
        sector: item.nombreSector || 'Sin sector',
        barrio: item.nombreBarrio || 'Sin barrio',
        tipoVia: item.nombreTipoVia || 'CALLE',
        nombreVia: item.nombreVia || '',
        cuadra: item.cuadra || 0,
        lado: item.lado || '-',
        loteInicial: item.loteInicial || 0,
        loteFinal: item.loteFinal || 0,
        descripcion: `${item.nombreSector || ''} + ${item.nombreBarrio || ''} + ${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} - Cuadra ${item.cuadra || 0} - Lado ${item.lado || '-'} - Lotes ${item.loteInicial || 0}-${item.loteFinal || 0}`
      }));
      
      setDirecciones(direccionesFormateadas);
      
    } catch (error) {
      console.error('Error buscando direcciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSelectDireccion = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
  };

  const handleConfirm = () => {
    if (selectedDireccion) {
      // Asegurar que la dirección tenga una descripción
      const direccionConDescripcion = {
        ...selectedDireccion,
        descripcion: formatDireccion(selectedDireccion)
      };
      onSelectDireccion(direccionConDescripcion);
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
    return `${direccion.sector} + ${direccion.barrio} + ${direccion.tipoVia} ${direccion.nombreVia} - Cuadra ${direccion.cuadra} - Lado ${direccion.lado} - Lotes ${direccion.loteInicial}-${direccion.loteFinal}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md" // Cambiado de "lg" a "md" para reducir el ancho
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: { 
          minHeight: '70vh', // Reducido de 80vh
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={600}>
              Seleccionar Dirección
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ 
              color: theme.palette.grey[500],
              '&:hover': { 
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main 
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
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
                    <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                sx: { 
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sector</InputLabel>
              <Select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                label="Sector"
                startAdornment={
                  <InputAdornment position="start">
                    <ApartmentIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {sectores.map(sector => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
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
                startAdornment={
                  <InputAdornment position="start">
                    <MapIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {barrios.map(barrio => (
                  <MenuItem key={barrio} value={barrio}>
                    {barrio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Limpiar filtros">
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                sx={{ 
                  minWidth: 'auto',
                  borderColor: theme.palette.grey[300],
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Limpiar
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {/* Tabla de direcciones */}
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ 
            maxHeight: 400,
            '& .MuiTable-root': {
              minWidth: 500 // Reducido de 650
            }
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 50 }}></TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>Sector</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>Barrio</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : direcciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
                      '&.MuiTableRow-hover:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      ...(selectedDireccion?.id === direccion.id && {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        '&.MuiTableRow-hover:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12)
                        }
                      })
                    }}
                    onClick={() => handleSelectDireccion(direccion)}
                  >
                    <TableCell padding="checkbox">
                      <Radio
                        checked={selectedDireccion?.id === direccion.id}
                        size="small"
                        sx={{
                          color: theme.palette.grey[400],
                          '&.Mui-checked': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {direccion.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {direccion.sector}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {direccion.barrio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {direccion.tipoVia} {direccion.nombreVia} - Cuadra {direccion.cuadra} - 
                        Lado {direccion.lado} - Lotes {direccion.loteInicial}-{direccion.loteFinal}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dirección seleccionada */}
        {selectedDireccion && (
          <Fade in={true}>
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                '& .MuiAlert-icon': {
                  color: theme.palette.info.main
                }
              }}
              icon={<LocationIcon />}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Dirección seleccionada:
              </Typography>
              <Typography variant="body2">
                {formatDireccion(selectedDireccion)}
              </Typography>
            </Alert>
          </Fade>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          sx={{ mr: 1 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedDireccion}
          startIcon={<CheckCircleIcon />}
          sx={{
            minWidth: 120,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorDirecciones;