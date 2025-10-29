// src/components/escalas/RegResolucionTIM.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useResolucionInteresPorCodigo,
  useCreateResolucionInteres,
  useUpdateResolucionInteres,
  useDeleteResolucionInteres
} from '../../hooks/useResolucionInteres';
import type { ResolucionInteresData } from '../../services/resolucionInteresService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const RegResolucionTIM: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Estados para formulario
  const [codResolucionInteres, setCodResolucionInteres] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState<string>('');
  const [anioFiscal, setAnioFiscal] = useState<number>(new Date().getFullYear());
  const [tasa, setTasa] = useState<number>(0);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);

  // Estados para busqueda
  const [busquedaCodigo, setBusquedaCodigo] = useState<number | null>(null);
  const [codigoBuscado, setCodigoBuscado] = useState<number | null>(null);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  // Hooks
  const { data: resolucionEncontrada, loading: loadingLista, error: errorLista, refetch } = useResolucionInteresPorCodigo(
    codigoBuscado,
    shouldFetch
  );
  const { mutate: crearResolucion, loading: loadingCrear, error: errorCrear } = useCreateResolucionInteres();
  const { mutate: actualizarResolucion, loading: loadingActualizar, error: errorActualizar } = useUpdateResolucionInteres();
  const { mutate: eliminarResolucion, loading: loadingEliminar } = useDeleteResolucionInteres();

  // Lista de resultados
  const resolucionesFiltradas: ResolucionInteresData[] = resolucionEncontrada ? [resolucionEncontrada] : [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGuardar = async () => {
    if (!descripcion.trim() || !anioFiscal || tasa === undefined) {
      return;
    }

    if (modoEdicion && codResolucionInteres) {
      // Actualizar
      const resultado = await actualizarResolucion({
        codResolucionInteres,
        anioFiscal,
        descripcion,
        tasa
      });

      if (resultado) {
        handleNuevo();
        // Si el codigo actual coincide con el buscado, actualizar
        if (codigoBuscado === codResolucionInteres) {
          refetch();
        }
      }
    } else {
      // Crear
      const resultado = await crearResolucion({
        anioFiscal,
        descripcion,
        tasa
      });

      if (resultado) {
        handleNuevo();
      }
    }
  };

  const handleNuevo = () => {
    setCodResolucionInteres(null);
    setDescripcion('');
    setAnioFiscal(new Date().getFullYear());
    setTasa(0);
    setModoEdicion(false);
  };

  const handleEditar = (resolucion: ResolucionInteresData) => {
    setCodResolucionInteres(resolucion.codResolucionInteres);
    setDescripcion(resolucion.descripcion);
    setAnioFiscal(resolucion.anioFiscal || new Date().getFullYear());
    setTasa(resolucion.tasa || 0);
    setModoEdicion(true);
    setTabValue(0); // Cambiar al tab de formulario
  };

  const handleEliminar = async (codResolucion: number) => {
    if (window.confirm('¿Esta seguro de eliminar esta resolucion de interes?')) {
      const resultado = await eliminarResolucion({ codResolucionInteres: codResolucion });
      if (resultado) {
        // Limpiar la búsqueda después de eliminar
        setCodigoBuscado(null);
        setBusquedaCodigo(null);
        setShouldFetch(false);
      }
    }
  };

  const handleBuscar = () => {
    if (busquedaCodigo) {
      setCodigoBuscado(busquedaCodigo);
      setShouldFetch(true);
    }
  };

  const handleLimpiarFiltros = () => {
    setBusquedaCodigo(null);
    setCodigoBuscado(null);
    setShouldFetch(false);
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', maxWidth: 1200 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Registro Resolucion TIM" />
          <Tab label="Consultar Resoluciones TIM" />
        </Tabs>
      </Box>

      {/* TAB 1: Formulario Registro Resolución TIM */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          {/* Titulo */}
          <Typography variant="h6" component="h2">
            {modoEdicion ? 'Editar Resolucion de Interes' : 'Nueva Resolucion de Interes'}
          </Typography>

          {/* Formulario */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              sx={{ width: 350 }}
              placeholder="Ej: O.M. N 001-2025-MDE"
              size="small"
              required
            />
            <TextField
              label="Anio Fiscal"
              type="number"
              value={anioFiscal}
              onChange={(e) => setAnioFiscal(parseInt(e.target.value) || new Date().getFullYear())}
              sx={{ width: 130 }}
              size="small"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
              required
            />
            <TextField
              label="Tasa (%)"
              type="number"
              value={tasa}
              onChange={(e) => setTasa(parseFloat(e.target.value) || 0)}
              sx={{ width: 120 }}
              size="small"
              InputProps={{
                inputProps: { min: 0, max: 100, step: 0.1 }
              }}
              required
            />
          </Stack>

          {/* Mensajes de error */}
          {errorCrear && (
            <Alert severity="error">
              {errorCrear}
            </Alert>
          )}
          {errorActualizar && (
            <Alert severity="error">
              {errorActualizar}
            </Alert>
          )}

          {/* Botones */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-start">
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardar}
              disabled={loadingCrear || loadingActualizar || !descripcion.trim() || !anioFiscal}
              sx={{ minWidth: 140, height: 40 }}
              startIcon={(loadingCrear || loadingActualizar) ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loadingCrear || loadingActualizar ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleNuevo}
              disabled={loadingCrear || loadingActualizar}
              sx={{ minWidth: 120, height: 40 }}
            >
              Nuevo
            </Button>
          </Stack>

          {/* Informacion */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Nota:</strong> Las fechas de inicio y fin se generan automaticamente por el sistema.
              El estado (activo/inactivo) es asignado automaticamente segun las fechas vigentes.
            </Typography>
          </Box>
        </Stack>
      </TabPanel>

      {/* TAB 2: Busqueda/Consulta de Resoluciones */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          {/* Filtros de busqueda */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Codigo Resolucion Interes"
              type="number"
              value={busquedaCodigo || ''}
              onChange={(e) => setBusquedaCodigo(e.target.value ? parseInt(e.target.value) : null)}
              sx={{ width: 230 }}
              size="small"
              placeholder="Ingrese codigo..."
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleBuscar}
              disabled={loadingLista || !busquedaCodigo}
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLimpiarFiltros}
            >
              Limpiar
            </Button>
            {loadingLista && <CircularProgress size={24} />}
          </Stack>

          {/* Mensajes de error */}
          {errorLista && (
            <Alert severity="error">
              {errorLista}
            </Alert>
          )}

          {/* Tabla de resultados */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: 500,
              overflowX: 'auto',
              overflowY: 'auto'
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Codigo
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Descripcion
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Fecha Inicio
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Fecha Fin
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                    Estado
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingLista && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                )}

                {!loadingLista && resolucionesFiltradas && resolucionesFiltradas.length > 0 &&
                  resolucionesFiltradas.map((resolucion) => (
                    <TableRow key={resolucion.codResolucionInteres} hover>
                      <TableCell>{resolucion.codResolucionInteres}</TableCell>
                      <TableCell>{resolucion.descripcion}</TableCell>
                      <TableCell>{resolucion.fechaInicioStr}</TableCell>
                      <TableCell>{resolucion.fechaFinStr}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: resolucion.estado === 'ACTIVO' ? 'success.lighter' : 'error.lighter',
                            color: resolucion.estado === 'ACTIVO' ? 'success.dark' : 'error.dark',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {resolucion.estado}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditar(resolucion)}
                            disabled={loadingEliminar}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleEliminar(resolucion.codResolucionInteres)}
                            disabled={loadingEliminar}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                }

                {!loadingLista && (!resolucionesFiltradas || resolucionesFiltradas.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {!shouldFetch
                          ? 'Ingrese un codigo de resolucion y haga clic en Buscar'
                          : 'No se encontro la resolucion de interes con el codigo especificado'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumen */}
          {resolucionesFiltradas.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Resolucion encontrada:</strong> Codigo {resolucionesFiltradas[0].codResolucionInteres}
              </Typography>
            </Box>
          )}
        </Stack>
      </TabPanel>
    </Paper>
  );
};

export default RegResolucionTIM;
