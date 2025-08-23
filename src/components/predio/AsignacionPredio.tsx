// src/components/predio/AsignacionPredio.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Autocomplete,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import SelectorContribuyente from '../modal/SelectorContribuyente';
import SelectorPredio from '../modal/SelectorPredio';
import { NotificationService } from '../utils/Notification';
import {
  useEstadoOptions,
  useAnioOptions
} from '../../hooks/useConstantesOptions';
import { error } from 'console';

interface AsignacionData {
  año: number;
  contribuyente: any;
  predio: any;
  modoDeclaracion: string;
  fechaVenta: Date | null;
  fechaDeclaracion: Date | null;
  esPensionista: boolean;
  porcentajeCondominio: number;
  porcentajeLibre: number;
  estado: string;
}

const AsignacionPredio: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  // Hooks para opciones
  const { options: aniosOptions } = useAnioOptions(2020);
  const { options: estadosOptions } = useEstadoOptions();
  
  // Estado para controlar el tab activo
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados
  const [asignacionData, setAsignacionData] = useState<AsignacionData>({
    año: currentYear,
    contribuyente: null,
    predio: null,
    modoDeclaracion: '',
    fechaVenta: null,
    fechaDeclaracion: null,
    esPensionista: false,
    porcentajeCondominio: 100,
    porcentajeLibre: 100,
    estado: 'Activo'
  });
  
  const [showContribuyenteModal, setShowContribuyenteModal] = useState(false);
  const [showPredioModal, setShowPredioModal] = useState(false);

  // Debug para verificar las opciones (después de que el estado esté inicializado)
  useEffect(() => {
    console.log('🔍 aniosOptions:', aniosOptions);
    console.log('🔍 asignacionData.año:', asignacionData.año);
    console.log('🔍 asignacionData.año.toString():', asignacionData.año.toString());
  }, [aniosOptions, asignacionData.año]);

  // Opciones para modos de declaración
  const modoDeclaracionOptions = [
    { value: 'COMPRA', label: 'Compra', id: 'COMPRA' },
    { value: 'VENTA', label: 'Venta', id: 'VENTA' },
    { value: 'HERENCIA', label: 'Herencia', id: 'HERENCIA' },
    { value: 'DONACION', label: 'Donación', id: 'DONACION' },
    { value: 'OTRO', label: 'Otro', id: 'OTRO' }
  ];

  // Handlers
  const handleSelectContribuyente = (contribuyente: any) => {
    setAsignacionData({ ...asignacionData, contribuyente });
    setShowContribuyenteModal(false);
  };

  const handleSelectPredio = (predio: any) => {
    setAsignacionData({ ...asignacionData, predio });
    setShowPredioModal(false);
  };

  const handleRegistrar = () => {
    if (!asignacionData.contribuyente || !asignacionData.predio) {
      NotificationService.error('Debe seleccionar un contribuyente y un predio');
      return;
    }

    // Aquí iría la lógica para registrar la asignación
    NotificationService.success('Asignación registrada exitosamente');
  };

  const handleNuevo = () => {
    setAsignacionData({
      año: currentYear,
      contribuyente: null,
      predio: null,
      modoDeclaracion: '',
      fechaVenta: null,
      fechaDeclaracion: null,
      esPensionista: false,
      porcentajeCondominio: 100,
      porcentajeLibre: 100,
      estado: 'Activo'
    });
    NotificationService.info('Formulario limpiado');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        {/* Tabs de navegación */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 600
              }
            }}
          >
            <Tab label="Asignación" icon={<AssignmentIcon />} iconPosition="start" />
            <Tab label="PU" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="PU-Masivo" icon={<HomeIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Panel de Asignación */}
        {activeTab === 0 && (
          <Box>
        {/* Sección: Seleccionar contribuyente y predio */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Seleccionar contribuyente y predio
              </Typography>
            </Stack>
            
            <Stack spacing={2}>
              {/* Primera fila - Contribuyente */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ flex: '0 0 120px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowContribuyenteModal(true)}
                    startIcon={<PersonIcon />}
                    sx={{ height: 33 }}
                  >
                    Seleccionar contribuyente
                  </Button>
                </Box>
                <Box sx={{ flex: '0 0 80px' }}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={asignacionData.contribuyente?.codigo || ''}
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    fullWidth
                    label="Nombre del contribuyente"
                    value={asignacionData.contribuyente?.contribuyente || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 120px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowPredioModal(true)}
                    disabled={!asignacionData.contribuyente}
                    startIcon={<HomeIcon />}
                    sx={{ height: 33 }}
                  >
                    Seleccionar predio
                  </Button>
                </Box>
                <Box sx={{ flex: '0 0 80px' }}>
                  <TextField
                    fullWidth
                    label="Código de predio"
                    value={asignacionData.predio?.codigoPredio || ''}
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>

              </Box>

              {/* Segunda fila - Predio */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                
                
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Dirección predial"
                    value={asignacionData.predio?.direccion || ''}
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Sección: Datos de la asignación */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Datos de la asignación
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              {/* Primera fila */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '0 0 138px' }}>
                  <Autocomplete
                    options={modoDeclaracionOptions}
                    getOptionLabel={(option) => option?.label || ''}
                    value={modoDeclaracionOptions.find(opt => opt.value === asignacionData.modoDeclaracion) || null}
                    onChange={(_, newValue) => setAsignacionData({
                      ...asignacionData,
                      modoDeclaracion: newValue?.value || ''
                    })}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Modos Declaración"
                        placeholder="Seleccione"
                        sx={{
                          '& .MuiInputBase-root':{
                             height:'33px'
                          }  
                        }}
                        required
                      />
                    )}
                    
                  />
                </Box>

                <Box sx={{ flex: '0 0 100px', maxWidth:'110px' }}>
                  <DatePicker
                    label="Fecha venta"
                    value={asignacionData.fechaVenta}
                    onChange={(newValue) => setAsignacionData({
                      ...asignacionData,
                      fechaVenta: newValue
                    })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size:'small',
                        sx:{
                          '& .MuiInputBase-root':{
                            height:'33'
                          }
                        },
                      }
                    }}
                    
                  />
                </Box>

                <Box sx={{ flex: '0 0 100px', maxWidth:'145px' }}>
                  <DatePicker
                    label="Fecha declaración"
                    value={asignacionData.fechaDeclaracion}
                    onChange={(newValue) => setAsignacionData({
                      ...asignacionData,
                      fechaDeclaracion: newValue
                    })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size:'small',
                        sx:{
                          '& .MuiInputBase-root':{
                            height:'33'
                          }
                        },
                        InputProps: {
                          endAdornment: <CalendarIcon />
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 0 120px' }}>
                  <Autocomplete
                    options={estadosOptions}
                    getOptionLabel={(option) => option?.label || ''}
                    value={estadosOptions.find(opt => opt.value === asignacionData.estado) || null}
                    onChange={(_, newValue) => setAsignacionData({
                      ...asignacionData,
                      estado: String(newValue?.value || 'Activo')
                    })}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Estado"
                        placeholder="Seleccione"
                        required
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            height: '33px' 
                          }
                        }}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    size='small'
                    label="% Condominos"
                    value={asignacionData.porcentajeCondominio}
                    onChange={(e) => setAsignacionData({
                      ...asignacionData,
                      porcentajeCondominio: Number(e.target.value)
                    })}
                    type="number"
                    InputProps={{
                      endAdornment: '%',
                      inputProps: { min: 0, max: 100 }
                    }}
                    helperText=""
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px' 
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    size='small'
                    label="% Libre"
                    value={asignacionData.porcentajeLibre}
                    onChange={(e) => setAsignacionData({
                      ...asignacionData,
                      porcentajeLibre: Number(e.target.value)
                    })}
                    type="number"
                    InputProps={{
                      endAdornment: '%',
                      inputProps: { min: 0, max: 100 }
                    }}
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px' 
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: '0 0 140px' }}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Es Pensionista
                    </Typography>
                    <RadioGroup
                      row
                      value={asignacionData.esPensionista ? 'Si' : 'No'}
                      onChange={(e) => setAsignacionData({
                        ...asignacionData,
                        esPensionista: e.target.value === 'Si'
                      })}
                      sx={{ 
                        '& .MuiInputBase-root': { 
                          height: '33px', 
                          maxHeight:'50'
                        }
                      }}
                    >
                      <FormControlLabel value="Si" control={<Radio />} label="Si" />
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                  </Paper>
                </Box>
              </Box>

            
            </Stack>

            {/* Botones de acción */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleRegistrar}
                startIcon={<AssignmentIcon />}
                sx={{ px: 4 }}
              >
                Registrar
              </Button>
              <Button
                variant="outlined"
                onClick={handleNuevo}
                sx={{ px: 4 }}
              >
                Nuevo
              </Button>
            </Box>
          </CardContent>
        </Card>

          </Box>
        )}

        {/* Panel de PU */}
        {activeTab === 1 && (
          <Box>
            {/* Sección: PU-Contribuyente */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              PU- Contribuyente
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: '0 0 120px' }}>
                  <Autocomplete
                    options={aniosOptions}
                    getOptionLabel={(option) => option?.label || ''}
                    value={aniosOptions.find(opt => opt.value === asignacionData.año.toString()) || null}
                    onChange={(_, newValue) => {
                      console.log('🎯 PU-Contribuyente Año seleccionado:', newValue);
                      console.log('🎯 Tipo de valor:', typeof newValue?.value);
                      setAsignacionData({
                        ...asignacionData,
                        año: parseInt(newValue?.value?.toString() || new Date().getFullYear().toString())
                      });
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Año"
                        placeholder="Seleccione año..."
                      />
                    )}
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px' 
                      }
                    }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 120px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    sx={{ height: 33
                     }}
                  >
                    Seleccionar contribuyente
                  </Button>
                </Box>
                <Box sx={{ flex: '0 0 100px' }}>
                  <TextField
                    fullWidth
                    label="Código"
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 250px' }}>
                  <TextField
                    fullWidth
                    label="Nombre del contribuyente"
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 100px' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PrintIcon />}
                    sx={{ height: 33 }}
                  >
                    Imprimir PU
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código Predio</TableCell>
                      <TableCell>Dirección</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>130077</TableCell>
                      <TableCell>Sector Central Barrio B1 Mz-21 - Av Gran Chimu N°650 - Unidad 2</TableCell>
                      <TableCell>
                        <Chip label="ACTIVO" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </CardContent>
        </Card>

          </Box>
        )}

        {/* Panel de PU-Masivo */}
        {activeTab === 2 && (
          <Box>
            {/* Sección: PU-Masivo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              PU- Masivo
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: '0 0 100px' }}>
                  <Autocomplete
                    options={aniosOptions}
                    getOptionLabel={(option) => option?.label || ''}
                    value={aniosOptions.find(opt => opt.value === asignacionData.año.toString()) || null}
                    onChange={(_, newValue) => setAsignacionData({
                      ...asignacionData,
                      año: parseInt(newValue?.value?.toString() || new Date().getFullYear().toString())
                    })}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Año"
                        placeholder="Seleccione año..."
                      />
                    )}
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        height: '33px' 
                      }
                    }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 120px' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    sx={{ height: 33 }}
                  >
                    Seleccionar predio
                  </Button>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <TextField
                    fullWidth
                    label="Dirección predial"
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 120px' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PrintIcon />}
                    sx={{ height: 33 }}
                  >
                    Imprimir PU Masivo
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Código Predio</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Contribuyente</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>130077</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>Cuzco Rodriguez Celinda Elena</TableCell>
                      <TableCell>
                        <Chip label="ACTIVO" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>145620</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>Maldona Maldonado Carlos</TableCell>
                      <TableCell>
                        <Chip label="ACTIVO" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </CardContent>
        </Card>
          </Box>
        )}
      </Box>

      {/* Modales */}
      <SelectorContribuyente
        isOpen={showContribuyenteModal}
        onClose={() => setShowContribuyenteModal(false)}
        onSelectContribuyente={handleSelectContribuyente}
        title="Seleccionar contribuyente"
      />

      <SelectorPredio
        isOpen={showPredioModal}
        onClose={() => setShowPredioModal(false)}
        onSelectPredio={handleSelectPredio}
        title="Selector de predios"
        contribuyenteId={asignacionData.contribuyente?.codigo}
      />
    </LocalizationProvider>
  );
};

export default AsignacionPredio;