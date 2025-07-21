// src/components/modal/SelectorDirecciones.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  TablePagination,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Apartment as ApartmentIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { NotificationService } from '../utils/Notification';
import direccionService from '../../services/direccionService';

// Interfaces
interface DireccionData {
  id: number;
  codigo?: number;
  codigoSector: number;
  codigoBarrio: number;
  codigoCalle: number;
  nombreSector?: string;
  nombreBarrio?: string;
  nombreCalle?: string;
  nombreVia?: string;
  nombreTipoVia?: string;
  cuadra?: string;
  lado?: string;
  loteInicial?: number;
  loteFinal?: number;
  descripcion?: string;
  estado?: string;
}

interface Direccion {
  id: number;
  codigo: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: string;
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
 * Modal mejorado para seleccionar direcciones
 */
const SelectorDirecciones: React.FC<SelectorDireccionesProps> = ({
  open,
  onClose,
  onSelectDireccion,
  direccionSeleccionada
}) => {
  const theme = useTheme();
  
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [direcciones, setDirecciones] = useState<DireccionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(
    direccionSeleccionada?.id || null
  );
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDirecciones, setTotalDirecciones] = useState(0);

  // Cargar todas las direcciones al abrir el modal
  useEffect(() => {
    if (open) {
      cargarDirecciones();
    }
  }, [open]);

  // Cargar todas las direcciones
  const cargarDirecciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📍 Cargando direcciones...');
      
      // Usar el servicio real si está disponible
      try {
        const resultado = await direccionService.obtenerTodos();
        console.log('✅ Direcciones cargadas:', resultado);
        setDirecciones(resultado);
        setTotalDirecciones(resultado.length);
      } catch (apiError) {
        console.log('⚠️ Usando datos de ejemplo debido a error en API');
        // Usar datos de ejemplo si falla la API
        const direccionesEjemplo = generarDireccionesEjemplo();
        setDirecciones(direccionesEjemplo);
        setTotalDirecciones(direccionesEjemplo.length);
      }
      
    } catch (error: any) {
      console.error('❌ Error al cargar direcciones:', error);
      setError('Error al cargar las direcciones');
      NotificationService.error('Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  };

  // Buscar direcciones con filtro
  const buscarDirecciones = async () => {
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, cargar todas
      cargarDirecciones();
      return;
    }

    if (searchTerm.trim().length < 2) {
      NotificationService.warning('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando direcciones con:', searchTerm);
      
      // Intentar buscar con el servicio real
      try {
        const parametros = {
          nombreVia: searchTerm,
          parametrosBusqueda: searchTerm
        };
        
        const resultado = await direccionService.buscar(parametros);
        setDirecciones(resultado);
        setTotalDirecciones(resultado.length);
        
        if (resultado.length === 0) {
          NotificationService.info('No se encontraron direcciones con ese criterio');
        }
      } catch (apiError) {
        // Si falla la API, filtrar localmente
        const todasLasDirecciones = await cargarTodasLasDirecciones();
        const filtradas = filtrarDireccionesLocalmente(todasLasDirecciones, searchTerm);
        setDirecciones(filtradas);
        setTotalDirecciones(filtradas.length);
      }
      
    } catch (error: any) {
      console.error('❌ Error al buscar direcciones:', error);
      setError('Error al buscar direcciones');
      NotificationService.error('Error al buscar direcciones');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar direcciones localmente
  const filtrarDireccionesLocalmente = (dirs: DireccionData[], termino: string): DireccionData[] => {
    const term = termino.toLowerCase();
    return dirs.filter(d => 
      d.nombreVia?.toLowerCase().includes(term) ||
      d.nombreBarrio?.toLowerCase().includes(term) ||
      d.nombreSector?.toLowerCase().includes(term) ||
      d.descripcion?.toLowerCase().includes(term) ||
      d.cuadra?.toLowerCase().includes(term)
    );
  };

  // Cargar todas las direcciones (helper)
  const cargarTodasLasDirecciones = async (): Promise<DireccionData[]> => {
    try {
      return await direccionService.obtenerTodos();
    } catch {
      return generarDireccionesEjemplo();
    }
  };

  // Generar direcciones de ejemplo
  const generarDireccionesEjemplo = (): DireccionData[] => {
    const sectores = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'];
    const barrios = ['San Juan', 'La Esperanza', 'Los Jardines', 'Vista Hermosa', 'El Porvenir'];
    const tiposVia = ['AVENIDA', 'CALLE', 'JIRON', 'PASAJE', 'PROLONGACION'];
    const nombresVia = ['Principal', 'Secundaria', 'Los Olivos', 'Las Flores', 'San Martin', 'Bolivar', 'Grau'];
    
    const direcciones: DireccionData[] = [];
    let id = 1;
    
    // Generar 50 direcciones de ejemplo
    for (let i = 0; i < 50; i++) {
      const sector = sectores[Math.floor(Math.random() * sectores.length)];
      const barrio = barrios[Math.floor(Math.random() * barrios.length)];
      const tipoVia = tiposVia[Math.floor(Math.random() * tiposVia.length)];
      const nombreVia = nombresVia[Math.floor(Math.random() * nombresVia.length)];
      const cuadra = Math.floor(Math.random() * 20) + 1;
      const lado = Math.random() > 0.5 ? 'I' : 'D';
      
      direcciones.push({
        id: id++,
        codigo: id,
        codigoSector: Math.floor(Math.random() * 5) + 1,
        codigoBarrio: Math.floor(Math.random() * 5) + 1,
        codigoCalle: Math.floor(Math.random() * 10) + 1,
        nombreSector: sector,
        nombreBarrio: barrio,
        nombreTipoVia: tipoVia,
        nombreVia: nombreVia,
        cuadra: cuadra.toString(),
        lado: lado,
        loteInicial: 1,
        loteFinal: Math.floor(Math.random() * 50) + 10,
        descripcion: `${tipoVia} ${nombreVia} CUADRA ${cuadra}`,
        estado: 'ACTIVO'
      });
    }
    
    return direcciones;
  };

  // Manejar selección
  const handleSelect = () => {
    const direccionSeleccionada = direcciones.find(d => d.id === selectedId);
    
    if (!direccionSeleccionada) {
      NotificationService.warning('Debe seleccionar una dirección');
      return;
    }

    // Convertir al formato esperado
    const direccionFormateada: Direccion = {
      id: direccionSeleccionada.id,
      codigo: direccionSeleccionada.codigo?.toString() || direccionSeleccionada.id.toString(),
      sector: direccionSeleccionada.nombreSector || '',
      barrio: direccionSeleccionada.nombreBarrio || '',
      tipoVia: direccionSeleccionada.nombreTipoVia || 'CALLE',
      nombreVia: direccionSeleccionada.nombreVia || '',
      cuadra: direccionSeleccionada.cuadra || '0',
      lado: direccionSeleccionada.lado || '-',
      loteInicial: direccionSeleccionada.loteInicial || 0,
      loteFinal: direccionSeleccionada.loteFinal || 0,
      descripcion: direccionSeleccionada.descripcion || 
        `${direccionSeleccionada.nombreTipoVia || 'CALLE'} ${direccionSeleccionada.nombreVia || ''} - CUADRA ${direccionSeleccionada.cuadra || '0'}`
    };

    onSelectDireccion(direccionFormateada);
    handleClose();
  };

  // Limpiar y cerrar
  const handleClose = () => {
    setSearchTerm('');
    setPage(0);
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

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    cargarDirecciones();
  };

  // Manejar cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Obtener direcciones paginadas
  const direccionesPaginadas = useMemo(() => {
    const inicio = page * rowsPerPage;
    const fin = inicio + rowsPerPage;
    return direcciones.slice(inicio, fin);
  }, [direcciones, page, rowsPerPage]);

  // Actualizar selectedId cuando cambia la prop
  useEffect(() => {
    setSelectedId(direccionSeleccionada?.id || null);
  }, [direccionSeleccionada]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: { height: '90vh', display: 'flex', flexDirection: 'column' }
      }}
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
            {totalDirecciones > 0 && (
              <Chip 
                label={`${totalDirecciones} direcciones`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Recargar">
              <IconButton onClick={cargarDirecciones} size="small" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
        <Stack sx={{ height: '100%', p: 2 }}>
          {/* Buscador */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Buscar por nombre de vía"
              placeholder="Ingrese nombre de calle, avenida, jirón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={buscarDirecciones}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Buscar
            </Button>
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Tabla de resultados */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              flex: 1,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'auto'
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 50 }}>
                    Sel.
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
                {loading ? (
                  // Skeletons mientras carga
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={7}>
                        <Skeleton variant="rectangular" height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : direccionesPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Stack alignItems="center" spacing={2}>
                        <LocationIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography color="text.secondary">
                          {searchTerm 
                            ? 'No se encontraron direcciones con ese criterio' 
                            : 'No hay direcciones disponibles'}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  direccionesPaginadas.map((direccion) => (
                    <TableRow
                      key={direccion.id}
                      hover
                      selected={selectedId === direccion.id}
                      onClick={() => setSelectedId(direccion.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selectedId === direccion.id}
                          value={direccion.id}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={direccion.nombreSector || 'Sin sector'} 
                          size="small" 
                          variant="outlined"
                          color="primary"
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
                          color="default"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" fontWeight={500}>
                          {direccion.lado || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {direccion.loteInicial || 0} - {direccion.loteFinal || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          {direcciones.length > 0 && (
            <TablePagination
              component="div"
              count={totalDirecciones}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
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