// src/components/modal/SelectorDirecciones.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Apartment as ApartmentIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useDirecciones } from '../../hooks/useDirecciones';
import { NotificationService } from '../utils/Notification';

// Interfaces
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
  // Campos adicionales opcionales
  codigoSector?: number;
  codigoBarrio?: number;
  codigoCalle?: number;
  codigoTipoVia?: number;
  estado?: string;
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
  const [direccionesFiltradas, setDireccionesFiltradas] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(direccionSeleccionada?.id || null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Usar el hook de direcciones
  const {
    direcciones,
    loading,
    error,
    cargarDirecciones
  } = useDirecciones();

  // Cargar direcciones al abrir el modal
  useEffect(() => {
    if (open) {
      console.log('🔄 [SelectorDirecciones] Modal abierto, cargando direcciones...');
      cargarDirecciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Aplicar filtro de búsqueda
  const aplicarFiltroBusqueda = useCallback((termino: string) => {
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
  }, [direcciones]);

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
  }, [busqueda, direcciones, aplicarFiltroBusqueda]);

  // Inicializar direcciones filtradas cuando cambien las direcciones
  useEffect(() => {
    console.log('🔍 [SelectorDirecciones] Direcciones del hook:', direcciones.length);
    if (direcciones.length > 0) {
      console.log('📋 [SelectorDirecciones] Primera dirección:', direcciones[0]);
    }
    setDireccionesFiltradas(direcciones);
  }, [direcciones]);

  // Manejar selección
  const handleSelect = () => {
    const direccionSeleccionada = direccionesFiltradas.find(d => d.id === selectedId);
    if (direccionSeleccionada) {
      // Construir descripción completa si no existe
      const descripcionCompleta = direccionSeleccionada.descripcion || 
        `CALLE ${direccionSeleccionada.nombreVia || ''} ${direccionSeleccionada.cuadra ? `CUADRA ${direccionSeleccionada.cuadra}` : ''}`.trim();
      
      const direccionFormateada: Direccion = {
        id: direccionSeleccionada.id,
        codigo: direccionSeleccionada.codigo?.toString() || direccionSeleccionada.id.toString(),
        sector: direccionSeleccionada.nombreSector || '',
        barrio: direccionSeleccionada.nombreBarrio || '',
        tipoVia: direccionSeleccionada.nombreTipoVia || 'CALLE',
        nombreVia: direccionSeleccionada.nombreVia || direccionSeleccionada.nombreCalle || '',
        cuadra: direccionSeleccionada.cuadra || '',
        lado: direccionSeleccionada.lado || 'D',
        loteInicial: direccionSeleccionada.loteInicial || 1,
        loteFinal: direccionSeleccionada.loteFinal || 1,
        descripcion: descripcionCompleta,
        // Agregar campos adicionales que puedan ser útiles
        codigoSector: direccionSeleccionada.codigoSector,
        codigoBarrio: direccionSeleccionada.codigoBarrio,
        codigoCalle: direccionSeleccionada.codigoCalle,
        codigoTipoVia: direccionSeleccionada.codigoTipoVia,
        estado: direccionSeleccionada.estado
      };
      
      console.log('📍 Dirección seleccionada completa:', direccionFormateada);
      onSelectDireccion(direccionFormateada);
      onClose();
    }
  };

  // Manejar recarga de direcciones
  const handleReload = () => {
    cargarDirecciones();
    NotificationService.info('Recargando direcciones...');
  };

  // Paginación
  const handleChangePage = (_: unknown, newPage: number) => {
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
    const paginadas = direccionesFiltradas.slice(start, end);
    console.log('📄 [SelectorDirecciones] Direcciones paginadas:', paginadas.length);
    console.log('📄 [SelectorDirecciones] Total filtradas:', direccionesFiltradas.length);
    console.log('📄 [SelectorDirecciones] Página:', page, 'Filas por página:', rowsPerPage);
    return paginadas;
  }, [direccionesFiltradas, page, rowsPerPage]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      keepMounted={false}
      disableEnforceFocus={true}
      disableAutoFocus={true}
      disableRestoreFocus={true}
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
            <Alert severity="warning">
              {typeof error === 'string' ? error : 'Error al cargar direcciones'}
            </Alert>
          )}

          {direcciones.length === 0 && !loading && (
            <Alert severity="info" icon={<InfoIcon />}>
              No se encontraron direcciones. Intente recargar los datos.
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
                  <TableCell>Dirección Completa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : direccionesPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron direcciones
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  direccionesPaginadas.map((direccion, index) => (
                    <TableRow
                      key={`direccion-${direccion.id || index}-${index}`}
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
                        <Typography variant="body2">
                          {direccion.descripcion || '-'}
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
          onClick={handleReload}
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