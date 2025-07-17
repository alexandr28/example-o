// src/components/modal/SelectorDirecciones.tsx - VERSIÓN SIMPLIFICADA
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
import { NotificationService } from '../utils/Notification';

// Definir interfaces localmente para evitar problemas de importación
interface DireccionData {
  codDireccion: number;
  codBarrioVia?: string | null;
  cuadra?: number;
  lado?: string | null;
  loteInicial?: number;
  loteFinal?: number;
  codUsuario?: number | null;
  codSector?: string | null;
  codVia?: string | null;
  codBarrio?: number;
  parametroBusqueda?: string | null;
  nombreBarrio?: string;
  nombreSector?: string;
  codTipoVia?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
}

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

/**
 * Modal para seleccionar direcciones con Material-UI
 */
const SelectorDirecciones: React.FC<SelectorDireccionesProps> = ({
  open,
  onClose,
  onSelectDireccion,
  direccionSeleccionada
}) => {
  const theme = useTheme();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [direcciones, setDirecciones] = useState<DireccionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(
    direccionSeleccionada?.id || null
  );
  const [error, setError] = useState<string | null>(null);

  // Buscar direcciones - Implementación simplificada
  const buscarDirecciones = async () => {
    if (searchTerm.trim().length < 2) {
      NotificationService.warning('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Por ahora, simular la búsqueda con datos de ejemplo
      // TODO: Implementar cuando el servicio esté disponible
      console.log('Buscando direcciones con término:', searchTerm);
      
      // Datos de ejemplo para pruebas
      const direccionesEjemplo: DireccionData[] = [
        {
          codDireccion: 1,
          nombreSector: 'Centro',
          nombreBarrio: 'Barrio Central',
          nombreTipoVia: 'AVENIDA',
          nombreVia: 'Principal',
          cuadra: 1,
          lado: 'I',
          loteInicial: 1,
          loteFinal: 20,
          codBarrioVia: '001',
          codUsuario: 1,
          codSector: '01',
          codVia: '001',
          codBarrio: 1,
          parametroBusqueda: searchTerm,
          codTipoVia: '01'
        },
        {
          codDireccion: 2,
          nombreSector: 'Norte',
          nombreBarrio: 'Barrio Norte',
          nombreTipoVia: 'CALLE',
          nombreVia: 'Secundaria',
          cuadra: 2,
          lado: 'D',
          loteInicial: 1,
          loteFinal: 15,
          codBarrioVia: '002',
          codUsuario: 1,
          codSector: '02',
          codVia: '002',
          codBarrio: 2,
          parametroBusqueda: searchTerm,
          codTipoVia: '02'
        }
      ];
      
      // Filtrar por término de búsqueda
      const resultado = direccionesEjemplo.filter(d => 
        d.nombreVia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nombreBarrio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nombreSector?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setDirecciones(resultado);
      
      if (resultado.length === 0) {
        NotificationService.info('No se encontraron direcciones');
      }
    } catch (error: any) {
      console.error('Error al buscar direcciones:', error);
      setError('Error al buscar direcciones');
      NotificationService.error('Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección
  const handleSelect = () => {
    const direccionSeleccionada = direcciones.find(d => d.codDireccion === selectedId);
    
    if (!direccionSeleccionada) {
      NotificationService.warning('Debe seleccionar una dirección');
      return;
    }

    // Convertir al formato esperado
    const direccionFormateada: Direccion = {
      id: direccionSeleccionada.codDireccion,
      codigo: direccionSeleccionada.codDireccion.toString(),
      sector: direccionSeleccionada.nombreSector || '',
      barrio: direccionSeleccionada.nombreBarrio || '',
      tipoVia: direccionSeleccionada.nombreTipoVia || 'CALLE',
      nombreVia: direccionSeleccionada.nombreVia || '',
      cuadra: direccionSeleccionada.cuadra || 0,
      lado: direccionSeleccionada.lado || '-',
      loteInicial: direccionSeleccionada.loteInicial || 0,
      loteFinal: direccionSeleccionada.loteFinal || 0,
      descripcion: `${direccionSeleccionada.nombreTipoVia || 'CALLE'} ${direccionSeleccionada.nombreVia || ''} - Cuadra ${direccionSeleccionada.cuadra || 0}`
    };

    onSelectDireccion(direccionFormateada);
    handleClose();
  };

  // Limpiar y cerrar
  const handleClose = () => {
    setSearchTerm('');
    setDirecciones([]);
    setSelectedId(null);
    setError(null);
    onClose();
  };

  // Buscar al presionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarDirecciones();
    }
  };

  // Actualizar selectedId cuando cambia la prop
  useEffect(() => {
    setSelectedId(direccionSeleccionada?.id || null);
  }, [direccionSeleccionada]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Fade}
    >
      <DialogTitle>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            <Typography variant="h6">Seleccionar Dirección</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Buscador */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Buscar por nombre de vía"
              placeholder="Ingrese nombre de calle, avenida, jirón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
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
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={buscarDirecciones}
              disabled={loading || searchTerm.trim().length < 2}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Buscar
            </Button>
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Tabla de resultados */}
          {direcciones.length > 0 && (
            <TableContainer 
              component={Paper} 
              sx={{ 
                maxHeight: 400,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 50 }}>
                      Selección
                    </TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Barrio</TableCell>
                    <TableCell>Vía</TableCell>
                    <TableCell align="center">Cuadra</TableCell>
                    <TableCell align="center">Lado</TableCell>
                    <TableCell align="center">Lotes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {direcciones.map((direccion) => (
                    <TableRow
                      key={direccion.codDireccion}
                      hover
                      selected={selectedId === direccion.codDireccion}
                      onClick={() => setSelectedId(direccion.codDireccion)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selectedId === direccion.codDireccion}
                          value={direccion.codDireccion}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={direccion.nombreSector || 'Sin sector'} 
                          size="small" 
                          variant="outlined"
                          icon={<ApartmentIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {direccion.nombreBarrio || 'Sin barrio'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MapIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {direccion.nombreTipoVia || 'CALLE'} {direccion.nombreVia || 'Sin nombre'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={direccion.cuadra || '0'} 
                          size="small" 
                          color="primary"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {direccion.lado || '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {direccion.loteInicial || 0} - {direccion.loteFinal || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Mensaje cuando no hay resultados */}
          {!loading && searchTerm && direcciones.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}>
              <LocationIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography>
                No se encontraron direcciones
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSelect} 
          variant="contained"
          disabled={!selectedId}
          startIcon={<CheckCircleIcon />}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorDirecciones;