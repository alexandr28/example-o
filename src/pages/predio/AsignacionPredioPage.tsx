// src/pages/predio/AsignacionPredioPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Breadcrumbs,
  Link,
  useTheme,
  alpha
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import SelectorContribuyente from '../../components/modal/SelectorContribuyente';
import SelectorPredio from '../../components/modal/SelectorPredio';
import { NotificationService } from '../../components/utils/Notification';

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

const AsignacionPredioPage: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
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
  const [asignacionesMasivas, setAsignacionesMasivas] = useState<any[]>([]);

  // Generar opciones de años
  const añosOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

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

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Módulo', path: '/' },
    { label: 'Predio', path: '/predio' },
    { label: 'Asignación de predios', path: '/predio/asignacion' },
    { label: 'Registro', active: true }
  ];

  return (
    <MainLayout title="Asignación de Predios">
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>
            {/* Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;
                  
                  if (isLast || item.active) {
                    return (
                      <Typography key={item.label} color="text.primary">
                        {item.label}
                      </Typography>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      component={RouterLink}
                      to={item.path || '/'}
                      underline="hover"
                      color="inherit"
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </Box>

            {/* Sección: Seleccionar contribuyente y predio */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Seleccionar contribuyente y predio
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setShowContribuyenteModal(true)}
                      sx={{ 
                        bgcolor: '#E0E0E0', 
                        color: 'text.primary',
                        '&:hover': { bgcolor: '#D0D0D0' }
                      }}
                    >
                      Seleccionar contribuyente
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Código"
                      value={asignacionData.contribuyente?.codigo || ''}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del contribuyente"
                      value={asignacionData.contribuyente?.contribuyente || ''}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setShowPredioModal(true)}
                      disabled={!asignacionData.contribuyente}
                      sx={{ 
                        bgcolor: '#E0E0E0', 
                        color: 'text.primary',
                        '&:hover': { bgcolor: '#D0D0D0' }
                      }}
                    >
                      Seleccionar predio
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Código de predio"
                      value={asignacionData.predio?.codigoPredio || ''}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Dirección predial"
                      value={asignacionData.predio?.direccion || ''}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Sección: Datos de la asignación */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Datos de la asignación
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Modos de declaración</InputLabel>
                      <Select
                        value={asignacionData.modoDeclaracion}
                        onChange={(e) => setAsignacionData({
                          ...asignacionData,
                          modoDeclaracion: e.target.value
                        })}
                        label="Modos de declaración"
                      >
                        <MenuItem value="">Seleccione</MenuItem>
                        <MenuItem value="COMPRA">Compra</MenuItem>
                        <MenuItem value="VENTA">Venta</MenuItem>
                        <MenuItem value="HERENCIA">Herencia</MenuItem>
                        <MenuItem value="DONACION">Donación</MenuItem>
                        <MenuItem value="OTRO">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Fecha de venta"
                      value={asignacionData.fechaVenta}
                      onChange={(newValue) => setAsignacionData({
                        ...asignacionData,
                        fechaVenta: newValue
                      })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          InputProps: {
                            endAdornment: <CalendarIcon />
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
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
                          InputProps: {
                            endAdornment: <CalendarIcon />
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={asignacionData.estado}
                        onChange={(e) => setAsignacionData({
                          ...asignacionData,
                          estado: e.target.value
                        })}
                        label="Estado"
                      >
                        <MenuItem value="Activo">Activo</MenuItem>
                        <MenuItem value="Inactivo">Inactivo</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#F5F5F5' }}>
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
                      >
                        <FormControlLabel value="Si" control={<Radio />} label="Si" />
                        <FormControlLabel value="No" control={<Radio />} label="No" />
                      </RadioGroup>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
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
                      helperText="Ingresa % condominos"
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
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
                    />
                  </Grid>
                </Grid>

                {/* Botones de acción */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleRegistrar}
                    sx={{ 
                      px: 4,
                      bgcolor: '#4ECDC4',
                      '&:hover': { bgcolor: '#45B8B0' }
                    }}
                  >
                    Registrar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNuevo}
                    sx={{ 
                      px: 4,
                      bgcolor: '#4B5563',
                      '&:hover': { bgcolor: '#374151' }
                    }}
                  >
                    Nuevo
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Sección: PU-Contribuyente */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  PU- Contribuyente
                </Typography>
                
                <Paper sx={{ p: 2, bgcolor: '#F9F9F9' }}>
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle2">Año</Typography>
                      <FormControl fullWidth size="small">
                        <Select value={asignacionData.año}>
                          {añosOptions.map(año => (
                            <MenuItem key={año} value={año}>{año}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                          bgcolor: '#E0E0E0', 
                          color: 'text.primary',
                          '&:hover': { bgcolor: '#D0D0D0' }
                        }}
                      >
                        Seleccionar contribuyente
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Código"
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nombre del contribuyente"
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                          bgcolor: '#6B7280',
                          '&:hover': { bgcolor: '#4B5563' }
                        }}
                      >
                        Imprimir PU
                      </Button>
                    </Grid>
                  </Grid>

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

            {/* Sección: PU-Masivo */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  PU- Masivo
                </Typography>
                
                <Paper sx={{ p: 2, bgcolor: '#F9F9F9' }}>
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} md={2}>
                      <Typography variant="subtitle2">Año</Typography>
                      <FormControl fullWidth size="small">
                        <Select value={asignacionData.año}>
                          {añosOptions.map(año => (
                            <MenuItem key={año} value={año}>{año}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                          bgcolor: '#E0E0E0', 
                          color: 'text.primary',
                          '&:hover': { bgcolor: '#D0D0D0' }
                        }}
                      >
                        Seleccionar predio
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Dirección predial"
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                          bgcolor: '#6B7280',
                          '&:hover': { bgcolor: '#4B5563' }
                        }}
                      >
                        Imprimir PU Masivo
                      </Button>
                    </Grid>
                  </Grid>

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
        </Container>

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

        {/* Notificaciones */}
     
      </LocalizationProvider>
    </MainLayout>
  );
};

export default AsignacionPredioPage;