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
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Today as TodayIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';

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

interface CajeroAsignado {
  id: number;
  cajero: string;
  cajaNumero: string;
  fecha: Date;
  turno: string;
  estado: 'Activo' | 'Inactivo';
  terminal: string;
}

const AsignacionCaja: React.FC = () => {
  const [value, setValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedCajero, setSelectedCajero] = useState('');
  const [selectedCaja, setSelectedCaja] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [searchDate, setSearchDate] = useState<Date | null>(new Date());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Datos de ejemplo
  const cajeros = [
    { id: 1, nombre: 'Juan Pérez García' },
    { id: 2, nombre: 'María López Rodríguez' },
    { id: 3, nombre: 'Carlos Díaz Martín' },
    { id: 4, nombre: 'Ana Sánchez Torres' },
    { id: 5, nombre: 'Roberto Gómez Silva' }
  ];

  const cajas = [
    { id: 1, numero: 'Caja 01', estado: 'Disponible' },
    { id: 2, numero: 'Caja 02', estado: 'Disponible' },
    { id: 3, numero: 'Caja 03', estado: 'Ocupada' },
    { id: 4, numero: 'Caja 04', estado: 'Disponible' },
    { id: 5, numero: 'Caja 05', estado: 'Mantenimiento' }
  ];

  const turnos = [
    { id: 1, nombre: 'Mañana', horario: '08:00 - 14:00' },
    { id: 2, nombre: 'Tarde', horario: '14:00 - 20:00' },
    { id: 3, nombre: 'Completo', horario: '08:00 - 17:00' }
  ];

  const terminales = [
    { id: 1, nombre: 'Terminal 01', ip: '192.168.1.101' },
    { id: 2, nombre: 'Terminal 02', ip: '192.168.1.102' },
    { id: 3, nombre: 'Terminal 03', ip: '192.168.1.103' },
    { id: 4, nombre: 'Terminal 04', ip: '192.168.1.104' },
    { id: 5, nombre: 'Terminal 05', ip: '192.168.1.105' }
  ];

  const [asignaciones, setAsignaciones] = useState<CajeroAsignado[]>([
    {
      id: 1,
      cajero: 'Juan Pérez García',
      cajaNumero: 'Caja 01',
      fecha: new Date(),
      turno: 'Mañana',
      estado: 'Activo',
      terminal: 'Terminal 01'
    },
    {
      id: 2,
      cajero: 'María López Rodríguez',
      cajaNumero: 'Caja 02',
      fecha: new Date(),
      turno: 'Tarde',
      estado: 'Activo',
      terminal: 'Terminal 02'
    },
    {
      id: 3,
      cajero: 'Carlos Díaz Martín',
      cajaNumero: 'Caja 03',
      fecha: new Date(),
      turno: 'Completo',
      estado: 'Activo',
      terminal: 'Terminal 03'
    }
  ]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleGuardarAsignacion = () => {
    if (!selectedCajero || !selectedCaja || !selectedTurno || !selectedTerminal || !selectedDate) {
      setSnackbarMessage('Por favor complete todos los campos');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const nuevaAsignacion: CajeroAsignado = {
      id: asignaciones.length + 1,
      cajero: cajeros.find(c => c.id === Number(selectedCajero))?.nombre || '',
      cajaNumero: cajas.find(c => c.id === Number(selectedCaja))?.numero || '',
      fecha: selectedDate,
      turno: turnos.find(t => t.id === Number(selectedTurno))?.nombre || '',
      estado: 'Activo',
      terminal: terminales.find(t => t.id === Number(selectedTerminal))?.nombre || ''
    };

    setAsignaciones([...asignaciones, nuevaAsignacion]);
    
    // Limpiar formulario
    setSelectedCajero('');
    setSelectedCaja('');
    setSelectedTurno('');
    setSelectedTerminal('');
    
    setSnackbarMessage('Asignación guardada exitosamente');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleEliminarAsignacion = (id: number) => {
    setAsignaciones(asignaciones.filter(a => a.id !== id));
    setSnackbarMessage('Asignación eliminada');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleCambiarEstado = (id: number) => {
    setAsignaciones(asignaciones.map(a => 
      a.id === id 
        ? { ...a, estado: a.estado === 'Activo' ? 'Inactivo' : 'Activo' }
        : a
    ));
  };

  const asignacionesDelDia = asignaciones.filter(a => {
    if (!searchDate) return true;
    return a.fecha.toDateString() === searchDate.toDateString();
  });

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

          <TabPanel value={value} index={0}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Nueva Asignación de Cajero
            </Typography>
            
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Primera fila */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '0 1 150px', minWidth: '150px' }}>
                      <DatePicker
                        label="Fecha de Asignación"
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
                    
                    <Box sx={{ flex: '0 1 150px', minWidth: '150px' }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Caja</InputLabel>
                        <Select
                          value={selectedCaja}
                          onChange={(e) => setSelectedCaja(e.target.value)}
                          label="Caja"
                        >
                          {cajas.map((caja) => (
                            <MenuItem key={caja.id} value={caja.id}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 'calc(100% - 24px)', pr: 1 }}>
                                <span>{caja.numero}</span>
                                <Chip 
                                  label={caja.estado} 
                                  size="small"
                                  color={caja.estado === 'Disponible' ? 'success' : caja.estado === 'Ocupada' ? 'warning' : 'default'}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: '0 1 180px', minWidth: '150px' }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Turno</InputLabel>
                        <Select
                          value={selectedTurno}
                          onChange={(e) => setSelectedTurno(e.target.value)}
                          label="Turno"
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
                            <MenuItem key={turno.id} value={turno.id}>
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ fontSize: '0.875rem' }}>{turno.nombre}</span>
                                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                  ({turno.horario})
                                </span>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                  </Box>

                  {/* Segunda fila */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    

                   
                  </Box>

                  {/* Tercera fila */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '0 1 250px', minWidth: '250px' }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Terminal</InputLabel>
                        <Select
                          value={selectedTerminal}
                          onChange={(e) => setSelectedTerminal(e.target.value)}
                          label="Terminal"
                          startAdornment={<ComputerIcon sx={{ mr: 1, color: 'action.active', fontSize: 18 }} />}
                          sx={{
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center'
                            },
                            '& .MuiSelect-icon': {
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }
                          }}
                        >
                          {terminales.map((terminal) => (
                            <MenuItem key={terminal.id} value={terminal.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 'calc(100% - 24px)' }}>
                                <span style={{ fontSize: '0.875rem' }}>{terminal.nombre}</span>
                                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                  IP: {terminal.ip}
                                </span>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ flex: '0 1 200px', minWidth: '500px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Observaciones"
                        multiline
                        rows={3}
                        placeholder="Ingrese observaciones adicionales..."
                      />
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
                          setSelectedTerminal('');
                        }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleGuardarAsignacion}
                      >
                        Guardar Asignación
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Cajeros Asignados por Día
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ flex: '0 0 150px', minWidth: '150px' }}>
                  <DatePicker
                    label="Buscar por fecha"
                    value={searchDate}
                    onChange={(newValue) => setSearchDate(newValue)}
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 auto', minWidth: '300px' }}>
                  <Alert severity="info">
                    Mostrando {asignacionesDelDia.length} asignaciones para el {searchDate?.toLocaleDateString('es-ES')}
                  </Alert>
                </Box>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cajero</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caja</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Terminal</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Turno</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asignacionesDelDia.map((asignacion) => (
                    <TableRow key={asignacion.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="action" />
                          {asignacion.cajero}
                        </Box>
                      </TableCell>
                      <TableCell>{asignacion.cajaNumero}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ComputerIcon color="action" fontSize="small" />
                          {asignacion.terminal}
                        </Box>
                      </TableCell>
                      <TableCell>{asignacion.turno}</TableCell>
                      <TableCell>
                        <Chip
                          label={asignacion.estado}
                          color={asignacion.estado === 'Activo' ? 'success' : 'default'}
                          size="small"
                          onClick={() => handleCambiarEstado(asignacion.id)}
                          sx={{ cursor: 'pointer' }}
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
                          onClick={() => handleEliminarAsignacion(asignacion.id)}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {asignacionesDelDia.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No hay asignaciones para esta fecha
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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