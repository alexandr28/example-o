import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Today as TodayIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useAsignacionCajas } from '../../hooks/useAsignacionCajas';
import { useTurnos } from '../../hooks/useTurnos';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AsignacionCaja: React.FC = () => {
  const [value, setValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedCajero, setSelectedCajero] = useState('');
  const [selectedCaja, setSelectedCaja] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [searchDate, setSearchDate] = useState<Date | null>(new Date());
  const [searchTermino, setSearchTermino] = useState('');
  const [searchCodUsuario, setSearchCodUsuario] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Usar hook de asignaciones
  const {
    asignaciones,
    loading: loadingAsignaciones,
    crearAsignacion,
    eliminarAsignacion,
    buscarAsignaciones
  } = useAsignacionCajas();

  // Usar hook de turnos
  const {
    turnos,
    loading: loadingTurnos
  } = useTurnos();

  // Datos estaticos de ejemplo para cajeros y cajas (estos podrian venir de otros servicios)
  const cajeros = [
    { id: 1, nombre: 'Juan Perez Garcia' },
    { id: 2, nombre: 'Maria Lopez Rodriguez' },
    { id: 3, nombre: 'Carlos Diaz Martin' },
    { id: 4, nombre: 'Ana Sanchez Torres' },
    { id: 5, nombre: 'Roberto Gomez Silva' }
  ];

  const cajas = [
    { codCaja: 1, descripcion: 'Caja 01', estado: 'ACTIVO' },
    { codCaja: 2, descripcion: 'Caja 02', estado: 'ACTIVO' },
    { codCaja: 3, descripcion: 'Caja 03', estado: 'ACTIVO' },
    { codCaja: 4, descripcion: 'Caja 04', estado: 'INACTIVO' },
    { codCaja: 5, descripcion: 'Caja 05', estado: 'ACTIVO' }
  ];

  // Handler para buscar asignaciones con filtros
  const handleBuscar = async () => {
    const params: any = {};

    if (searchTermino) {
      params.terminoBusqueda = searchTermino;
    }

    if (searchDate) {
      params.fecha = format(searchDate, 'yyyy-MM-dd');
    }

    if (searchCodUsuario) {
      params.codUsuario = Number(searchCodUsuario);
    }

    await buscarAsignaciones(params);
  };

  const handleNuevaBusqueda = () => {
    setSearchTermino('');
    setSearchDate(new Date());
    setSearchCodUsuario('');
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleGuardarAsignacion = async () => {
    if (!selectedCajero || !selectedCaja || !selectedTurno || !selectedDate) {
      setSnackbarMessage('Por favor complete todos los campos');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const fechaStr = format(selectedDate, 'yyyy-MM-dd');

    const resultado = await crearAsignacion({
      codUsuario: Number(selectedCajero),
      codCaja: Number(selectedCaja),
      codTurno: Number(selectedTurno),
      fecha: fechaStr
    });

    if (resultado) {
      // Limpiar formulario
      setSelectedCajero('');
      setSelectedCaja('');
      setSelectedTurno('');
    }
  };

  const handleEliminarAsignacion = async (codAsignacionCaja: number) => {
    const confirmacion = window.confirm('¿Esta seguro de eliminar esta asignacion?');
    if (confirmacion) {
      await eliminarAsignacion(codAsignacionCaja);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="asignacion tabs">
              <Tab
                label="Asignar Cajero"
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                label="Cajeros Asignados"
                icon={<TodayIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Nueva Asignacion de Cajero */}
          <TabPanel value={value} index={0}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Nueva Asignacion de Cajero
            </Typography>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Primera fila */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {/* Fecha de Asignacion */}
                      <Box sx={{ flex: '0 1 150px', minWidth: '150px' }}>
                        <DatePicker
                          label="Fecha de Asignacion"
                          value={selectedDate}
                          onChange={(newValue) => setSelectedDate(newValue)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              sx: {
                                '& .MuiInputBase-root': {
                                  height: '40px'
                                },
                                '& .MuiInputLabel-root': {
                                  transform: 'translate(14px, 9px) scale(1)',
                                  '&.MuiInputLabel-shrink': {
                                    transform: 'translate(14px, -9px) scale(0.75)'
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </Box>

                      {/* Cajero */}
                      <Box sx={{ flex: '0 1 250px', minWidth: '250px' }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Cajero</InputLabel>
                          <Select
                            value={selectedCajero}
                            onChange={(e) => setSelectedCajero(e.target.value)}
                            label="Cajero"
                            startAdornment={<PersonIcon sx={{ mr: 1, color: 'action.active', fontSize: 18 }} />}
                          >
                            {cajeros.map((cajero) => (
                              <MenuItem key={cajero.id} value={cajero.id}>
                                {cajero.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Caja */}
                      <Box sx={{ flex: '0 1 150px', minWidth: '150px' }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Caja</InputLabel>
                          <Select
                            value={selectedCaja}
                            onChange={(e) => setSelectedCaja(e.target.value)}
                            label="Caja"
                          >
                            {cajas.map((caja) => (
                              <MenuItem key={caja.codCaja} value={caja.codCaja}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 'calc(100% - 24px)', pr: 1 }}>
                                  <span>{caja.descripcion}</span>
                                  <Chip
                                    label={caja.estado}
                                    size="small"
                                    color={caja.estado === 'ACTIVO' ? 'success' : 'default'}
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Turno */}
                      <Box sx={{ flex: '0 1 180px', minWidth: '150px' }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Turno</InputLabel>
                          <Select
                            value={selectedTurno}
                            onChange={(e) => setSelectedTurno(e.target.value)}
                            label="Turno"
                            disabled={loadingTurnos}
                            sx={{
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                py: 0.5
                              },
                              '& .MuiSelect-icon': {
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }
                            }}
                          >
                            {turnos.map((turno) => (
                              <MenuItem key={turno.codTurno} value={turno.codTurno}>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                  <span style={{ fontSize: '0.875rem' }}>{turno.nombreTurno}</span>
                                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                    {turno.horario}
                                  </span>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    {/* Botones */}
                    <Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedCajero('');
                            setSelectedCaja('');
                            setSelectedTurno('');
                          }}
                          disabled={loadingAsignaciones}
                        >
                          Limpiar
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={loadingAsignaciones ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleGuardarAsignacion}
                          disabled={loadingAsignaciones}
                        >
                          Guardar Asignacion
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
          </TabPanel>

          {/* Cajeros Asignados */}
          <TabPanel value={value} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Cajeros Asignados por Dia
              </Typography>

              {/* Filtros de Busqueda */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Buscar */}
                <Box sx={{ flex: '0 1 200px', minWidth: '200px' }}>
                  <TextField
                    label="Buscar"
                    value={searchTermino}
                    onChange={(e) => setSearchTermino(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Termino de busqueda"
                    disabled={loadingAsignaciones}
                  />
                </Box>

                {/* Fecha de Busqueda */}
                <Box sx={{ flex: '0 1 180px', minWidth: '180px' }}>
                  <DatePicker
                    label="Fecha"
                    value={searchDate}
                    onChange={(newValue) => setSearchDate(newValue)}
                    disabled={loadingAsignaciones}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true
                      }
                    }}
                  />
                </Box>

                {/* Codigo Usuario */}
                <Box sx={{ flex: '0 1 150px', minWidth: '150px' }}>
                  <TextField
                    label="Cod. Usuario"
                    value={searchCodUsuario}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setSearchCodUsuario(value);
                    }}
                    size="small"
                    fullWidth
                    placeholder="Solo numeros"
                    disabled={loadingAsignaciones}
                    inputProps={{
                      pattern: '[0-9]*',
                      inputMode: 'numeric'
                    }}
                  />
                </Box>

                {/* Botones */}
                <Box sx={{ flex: '0 1 auto', display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleBuscar}
                    disabled={loadingAsignaciones}
                    size="small"
                  >
                    Buscar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleNuevaBusqueda}
                    disabled={loadingAsignaciones}
                    size="small"
                  >
                    Nuevo
                  </Button>
                </Box>
              </Box>

              {/* Info de resultados */}
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  Mostrando {asignaciones.length} asignaciones
                </Alert>
              </Box>
            </Box>

            {/* Tabla de Cajeros Asignados */}
            {loadingAsignaciones ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cajero</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caja</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Turno</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asignaciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No hay asignaciones para esta fecha
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      asignaciones.map((asignacion) => (
                        <TableRow key={asignacion.codAsignacionCaja} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon color="action" />
                              {asignacion.nombreUsuario}
                            </Box>
                          </TableCell>
                          <TableCell>{asignacion.numCaja}</TableCell>
                          <TableCell>{asignacion.turno}</TableCell>
                          <TableCell>{asignacion.fechaStr}</TableCell>
                          <TableCell>
                            <Chip
                              label={asignacion.estado}
                              color={asignacion.estado === 'ACTIVO' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              size="small"
                              title="Editar"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleEliminarAsignacion(asignacion.codAsignacionCaja)}
                              title="Eliminar"
                              disabled={loadingAsignaciones}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AsignacionCaja;
