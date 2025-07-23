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
  FilterList as FilterIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Importaciones de servicios
let NotificationService: any;
let direccionService: any;

try {
  NotificationService = require('../utils/Notification').NotificationService;
} catch (e) {
  console.warn('NotificationService no disponible');
  NotificationService = {
    success: (msg: string) => console.log('Success:', msg),
    error: (msg: string) => console.error('Error:', msg),
    info: (msg: string) => console.info('Info:', msg),
    warning: (msg: string) => console.warn('Warning:', msg)
  };
}

try {
  direccionService = require('../../services/direccionService').default;
} catch (e) {
  console.warn('direccionService no disponible, usando servicio temporal');
  // Servicio temporal que hace la petición directamente
  direccionService = {
    obtenerTodos: async () => {
      try {
        console.log('🔄 Usando servicio temporal para cargar direcciones...');
        const url = 'http://192.168.20.160:8080/api/direccion/listarDireccionPorNombreVia?parametrosBusqueda=a&codUsuario=1';
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('📊 Respuesta directa de la API:', responseData);
        
        if (responseData.success && responseData.data) {
          const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
          // Mapear los datos correctamente
          return data.map((item: any) => ({
            id: item.codDireccion || 0,
            codigo: item.codDireccion,
            codigoSector: item.codSector || 0,
            codigoBarrio: item.codBarrio || 0,
            codigoCalle: item.codVia || 0,
            nombreSector: item.nombreSector || '',
            nombreBarrio: item.nombreBarrio || '',
            nombreVia: item.nombreVia || '',
            nombreTipoVia: item.nombreTipoVia || 'CALLE',
            cuadra: item.cuadra?.toString() || '',
            lado: item.lado || 'D',
            loteInicial: parseInt(item.loteInicial || '1'),
            loteFinal: parseInt(item.loteFinal || '1'),
            descripcion: `${item.nombreTipoVia || 'CALLE'} ${item.nombreVia || ''} ${item.cuadra ? `CUADRA ${item.cuadra}` : ''}`.trim(),
            estado: item.estado || 'ACTIVO'
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Error en servicio temporal:', error);
        return [];
      }
    },
    buscarPorNombreVia: async (nombreVia: string) => {
      // Implementación similar a obtenerTodos pero con parámetro de búsqueda
      return [];
    }
  };
}

// Función para generar datos de ejemplo
const generarDatosEjemplo = () => {
  return [
    {
      id: 1,
      codigo: 1,
      codigoSector: 1,
      codigoBarrio: 1,
      codigoCalle: 11,
      nombreSector: 'Centro',
      nombreBarrio: 'Los Jardines',
      nombreVia: 'Secundaria',
      nombreTipoVia: 'CALLE',
      cuadra: '17',
      lado: 'D',
      loteInicial: 1,
      loteFinal: 37,
      descripcion: 'CALLE Secundaria CUADRA 17',
      estado: 'ACTIVO'
    },
    {
      id: 2,
      codigo: 2,
      codigoSector: 1,
      codigoBarrio: 2,
      codigoCalle: 14,
      nombreSector: 'Centro',
      nombreBarrio: 'Vista Hermosa',
      nombreVia: 'San Martin',
      nombreTipoVia: 'PROLONGACION',
      cuadra: '14',
      lado: 'D',
      loteInicial: 1,
      loteFinal: 27,
      descripcion: 'PROLONGACION San Martin CUADRA 14',
      estado: 'ACTIVO'
    },
    {
      id: 3,
      codigo: 3,
      codigoSector: 2,
      codigoBarrio: 3,
      codigoCalle: 11,
      nombreSector: 'Este',
      nombreBarrio: 'El Porvenir',
      nombreVia: 'Secundaria',
      nombreTipoVia: 'CALLE',
      cuadra: '11',
      lado: 'D',
      loteInicial: 1,
      loteFinal: 22,
      descripcion: 'CALLE Secundaria CUADRA 11',
      estado: 'ACTIVO'
    }
  ];
};

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
  titulo?: string;
}

const SelectorDirecciones: React.FC<SelectorDireccionesProps> = ({
  open,
  onClose,
  onSelectDireccion,
  direccionSeleccionada,
  titulo = "Seleccionar Dirección"
}) => {
  const theme = useTheme();
  const [busqueda, setBusqueda] = useState('');
  const [direcciones, setDirecciones] = useState<DireccionData[]>([]);
  const [direccionesFiltradas, setDireccionesFiltradas] = useState<DireccionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(direccionSeleccionada?.id || null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [usandoDatosLocales, setUsandoDatosLocales] = useState(false);

  // Cargar direcciones al abrir el modal
  useEffect(() => {
    if (open) {
      cargarDirecciones();
    }
  }, [open]);

  // Aplicar filtro cuando cambie la búsqueda
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (busqueda.trim()) {
        aplicarFiltroBusqueda(busqueda);
      } else {
        setDireccionesFiltradas(direcciones);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [busqueda, direcciones]);

  // Cargar direcciones desde el servicio
  const cargarDirecciones = async () => {
    setLoading(true);
    setError(null);
    setUsandoDatosLocales(false);
    
    try {
      console.log('🔄 Cargando direcciones desde el servicio...');
      
      if (!direccionService) {
        throw new Error('Servicio de direcciones no disponible');
      }
      
      const data = await direccionService.obtenerTodos();
      console.log('📊 Respuesta del servicio:', data);
      
      if (data && data.length > 0) {
        console.log(`✅ ${data.length} direcciones cargadas desde la base de datos`);
        setDirecciones(data);
        setDireccionesFiltradas(data);
        setUsandoDatosLocales(false);
      } else {
        console.log('⚠️ No se encontraron direcciones en la base de datos');
        // Intentar con una búsqueda más amplia
        const dataAmplia = await direccionService.buscarPorNombreVia('');
        if (dataAmplia && dataAmplia.length > 0) {
          console.log(`✅ ${dataAmplia.length} direcciones encontradas con búsqueda amplia`);
          setDirecciones(dataAmplia);
          setDireccionesFiltradas(dataAmplia);
          setUsandoDatosLocales(false);
        } else {
          console.log('📌 Usando datos de ejemplo como fallback');
          cargarDatosDeEjemplo();
        }
      }
    } catch (error: any) {
      console.error('❌ Error al cargar direcciones:', error);
      setError('No se pudieron cargar las direcciones de la base de datos. Mostrando datos de ejemplo.');
      cargarDatosDeEjemplo();
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos de ejemplo
  const cargarDatosDeEjemplo = () => {
    console.log('📌 Cargando datos de ejemplo...');
    setUsandoDatosLocales(true);
    const datosEjemplo = generarDatosEjemplo();
    setDirecciones(datosEjemplo);
    setDireccionesFiltradas(datosEjemplo);
  };

  // Aplicar filtro de búsqueda
  const aplicarFiltroBusqueda = (termino: string) => {
    const terminoLower = termino.toLowerCase();
    const filtradas = direcciones.filter(dir => 
      dir.nombreVia?.toLowerCase().includes(terminoLower) ||
      dir.nombreBarrio?.toLowerCase().includes(terminoLower) ||
      dir.nombreSector?.toLowerCase().includes(terminoLower) ||
      dir.descripcion?.toLowerCase().includes(terminoLower) ||
      dir.cuadra?.toLowerCase().includes(terminoLower) ||
      dir.nombreTipoVia?.toLowerCase().includes(terminoLower)
    );
    setDireccionesFiltradas(filtradas);
    setPage(0);
  };

  // Manejar selección
  const handleSelect = () => {
    const direccionSeleccionada = direccionesFiltradas.find(d => d.id === selectedId);
    if (direccionSeleccionada) {
      const direccionFormateada: Direccion = {
        id: direccionSeleccionada.id,
        codigo: direccionSeleccionada.codigo?.toString() || direccionSeleccionada.id.toString(),
        sector: direccionSeleccionada.nombreSector || '',
        barrio: direccionSeleccionada.nombreBarrio || '',
        tipoVia: direccionSeleccionada.nombreTipoVia || 'CALLE',
        nombreVia: direccionSeleccionada.nombreVia || '',
        cuadra: direccionSeleccionada.cuadra || '',
        lado: direccionSeleccionada.lado || 'D',
        loteInicial: direccionSeleccionada.loteInicial || 1,
        loteFinal: direccionSeleccionada.loteFinal || 1,
        descripcion: direccionSeleccionada.descripcion
      };
      onSelectDireccion(direccionFormateada);
      onClose();
    }
  };

  // Paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Direcciones paginadas
  const direccionesPaginadas = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return direccionesFiltradas.slice(start, end);
  }, [direccionesFiltradas, page, rowsPerPage]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationIcon color="primary" />
            <Typography variant="h6">{titulo}</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Búsqueda */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre de vía, barrio, sector, tipo de vía..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: busqueda && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setBusqueda('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Alertas */}
          {error && (
            <Alert severity="warning" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {usandoDatosLocales && (
            <Alert severity="info" icon={<InfoIcon />}>
              Mostrando datos de ejemplo. La conexión con el servidor no está disponible.
            </Alert>
          )}

          {/* Tabla de direcciones */}
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" width={50}>
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
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : direccionesPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron direcciones
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  direccionesPaginadas.map((direccion) => (
                    <TableRow 
                      key={direccion.id}
                      hover
                      onClick={() => setSelectedId(direccion.id)}
                      selected={selectedId === direccion.id}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selectedId === direccion.id}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={direccion.nombreSector || 'Sin sector'} 
                          size="small"
                          icon={<ApartmentIcon />}
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                        />
                      </TableCell>
                      <TableCell>{direccion.nombreBarrio || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={direccion.nombreTipoVia || 'CALLE'} 
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Typography variant="body2">
                            {direccion.nombreVia || '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        {direccion.cuadra || '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={direccion.lado || 'D'} 
                          size="small"
                          color={direccion.lado === 'I' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {direccion.loteInicial || 1} - {direccion.loteFinal || 1}
                        </Typography>
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
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={cargarDirecciones}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Recargar
        </Button>
        <Button
          variant="contained"
          onClick={handleSelect}
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