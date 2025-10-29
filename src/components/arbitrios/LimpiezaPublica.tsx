import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Home as HomeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useListaUsosOptions } from '../../hooks/useConstantesOptions';
import { useLimpiezaPublica } from '../../hooks/useLimpiezaPublica';

// Interfaces
interface ZonaOption {
  id: number;
  label: string;
}

interface CriterioOption {
  id: number;
  label: string;
}

interface TasaCasaHabitacion {
  zona: string;
  tasaMensual: number;
}

interface TasaOtrosUsos {
  usoPredio: string;
  tasaMensual: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel Component
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`limpieza-tabpanel-${index}`}
      aria-labelledby={`limpieza-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `limpieza-tab-${index}`,
    'aria-controls': `limpieza-tabpanel-${index}`,
  };
};

const LimpiezaPublica: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Hook para opciones de uso
  const { options: usosOptions } = useListaUsosOptions();

  // Hook para limpieza publica
  const {
    limpiezaPublica,
    limpiezaPublicaOtros,
    loading: loadingLimpieza,
    listarLimpiezaPublica,
    crearLimpiezaPublica,
    actualizarLimpiezaPublica,
    listarLimpiezaPublicaOtros,
    crearLimpiezaPublicaOtros,
    actualizarLimpiezaPublicaOtros
  } = useLimpiezaPublica();

  // Estados para Casa Habitación
  const [anioCasa, setAnioCasa] = useState<number>(new Date().getFullYear());
  const [zonaCasa, setZonaCasa] = useState<ZonaOption | null>(null);
  const [criterioUsoCasa, setCriterioUsoCasa] = useState<any>(null);
  const [tasaCasa, setTasaCasa] = useState<string>('');
  const [anioConsultaCasa, setAnioConsultaCasa] = useState<string>(new Date().getFullYear().toString());
  const [mostrarTablaCasa, setMostrarTablaCasa] = useState(false);

  // Estados para Otros Usos
  const [anioOtros, setAnioOtros] = useState<number>(new Date().getFullYear());
  const [zonaOtros, setZonaOtros] = useState<ZonaOption | null>(null);
  const [criterioUsoOtros, setCriterioUsoOtros] = useState<any>(null);
  const [criterioOtros, setCriterioOtros] = useState<CriterioOption | null>(null);
  const [tasaOtros, setTasaOtros] = useState<string>('');
  const [anioConsultaOtros, setAnioConsultaOtros] = useState<string>(new Date().getFullYear().toString());
  const [mostrarTablaOtros, setMostrarTablaOtros] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  // Opciones para Zonas (16 zonas)
  const zonas: ZonaOption[] = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    label: `Zona ${i + 1}`
  }));
  
  // Opciones para Criterios (8 criterios)
  const criterios: CriterioOption[] = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    label: `CT${i + 1}`
  }));
  
  // Mapear datos de Casa Habitación desde el hook
  const datosCasaHabitacion: TasaCasaHabitacion[] = limpiezaPublica.map(lp => ({
    zona: lp.nombreZona || `Zona ${lp.codZona}`,
    tasaMensual: lp.tasaMensual
  }));

  // Mapear datos de Otros Usos desde el hook
  const datosOtrosUsos: TasaOtrosUsos[] = limpiezaPublicaOtros.map(lp => ({
    usoPredio: lp.criterioUso || `CT${lp.codCriterio}`,
    tasaMensual: lp.tasaMensual
  }));
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handlers para Casa Habitación
  const handleRegistroCasa = async () => {
    if (!zonaCasa || !tasaCasa || !criterioUsoCasa) {
      console.warn('Faltan datos requeridos');
      return;
    }

    try {
      const datos = {
        anio: anioCasa,
        tasaMensual: parseFloat(tasaCasa),
        codZona: zonaCasa.id,
        codCriterio: parseInt(criterioUsoCasa.value)
      };

      console.log('Registrar/Actualizar Tasa Casa Habitación:', datos);

      // Verificar si ya existe para decidir si crear o actualizar
      const existente = limpiezaPublica.find(
        lp => lp.anio === datos.anio && lp.codZona === datos.codZona && lp.codCriterio === datos.codCriterio
      );

      if (existente) {
        await actualizarLimpiezaPublica(datos);
      } else {
        await crearLimpiezaPublica(datos);
      }

      // Limpiar formulario
      setZonaCasa(null);
      setCriterioUsoCasa(null);
      setTasaCasa('');

      // Recargar datos
      await listarLimpiezaPublica({ anio: anioCasa });
    } catch (error) {
      console.error('Error en handleRegistroCasa:', error);
    }
  };

  const handleNuevoCasa = () => {
    setAnioCasa(new Date().getFullYear());
    setZonaCasa(null);
    setCriterioUsoCasa(null);
    setTasaCasa('');
  };

  const handleBuscarCasa = async () => {
    if (!anioConsultaCasa) return;

    setIsLoading(true);
    try {
      await listarLimpiezaPublica({ anio: parseInt(anioConsultaCasa) });
      setMostrarTablaCasa(true);
    } catch (error) {
      console.error('Error buscando Casa Habitación:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handlers para Otros Usos
  const handleRegistroOtros = async () => {
    if (!zonaOtros || !tasaOtros || !criterioUsoOtros) {
      console.warn('[LimpiezaPublica] Faltan datos requeridos para Otros Usos');
      return;
    }

    try {
      const datos = {
        anio: anioOtros,
        tasaMensual: parseFloat(tasaOtros),
        codZona: zonaOtros.id,
        codCriterio: parseInt(criterioUsoOtros.value)
      };

      console.log('[LimpiezaPublica] Registrando Otros Usos con datos:', datos);

      // Verificar si ya existe un registro con esa combinación
      const existente = limpiezaPublicaOtros.find(
        lp => lp.anio === datos.anio &&
              lp.codZona === datos.codZona &&
              lp.codCriterio === datos.codCriterio
      );

      if (existente) {
        console.log('[LimpiezaPublica] Actualizando registro existente de Otros Usos');
        await actualizarLimpiezaPublicaOtros(datos);
      } else {
        console.log('[LimpiezaPublica] Creando nuevo registro de Otros Usos');
        await crearLimpiezaPublicaOtros(datos);
      }

      // Limpiar formulario
      handleNuevoOtros();

      // Recargar tabla
      await listarLimpiezaPublicaOtros({ anio: datos.anio });
      setMostrarTablaOtros(true);

    } catch (error) {
      console.error('[LimpiezaPublica] Error registrando Otros Usos:', error);
    }
  };

  const handleNuevoOtros = () => {
    setAnioOtros(new Date().getFullYear());
    setZonaOtros(null);
    setCriterioUsoOtros(null);
    setTasaOtros('');
  };

  const handleBuscarOtros = async () => {
    try {
      setIsLoading(true);
      await listarLimpiezaPublicaOtros({ anio: parseInt(anioConsultaOtros) });
      setMostrarTablaOtros(true);
    } catch (error) {
      console.error('[LimpiezaPublica] Error buscando Otros Usos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler para click en celda de Casa Habitación
  const handleCasaClick = (zona: string, tasaValue: number) => {
    // Buscar el registro completo en los datos
    const registro = limpiezaPublica.find(lp =>
      (lp.nombreZona === zona || `Zona ${lp.codZona}` === zona) &&
      lp.tasaMensual === tasaValue
    );

    if (registro) {
      // Encontrar la zona y criterio correspondientes
      const zonaSeleccionada = zonas.find(z => z.id === registro.codZona);
      const criterioSeleccionado = usosOptions.find(u => Number(u.value) === registro.codCriterio);

      // Actualizar los campos del formulario
      setAnioCasa(registro.anio || parseInt(anioConsultaCasa));
      setZonaCasa(zonaSeleccionada || null);
      setCriterioUsoCasa(criterioSeleccionado || null);
      setTasaCasa(registro.tasaMensual.toString());

      // Scroll hacia arriba para mostrar el formulario
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handler para click en celda de Otros Usos
  const handleOtrosClick = (usoPredio: string, tasaValue: number) => {
    // Buscar el registro completo en los datos
    const registro = limpiezaPublicaOtros.find(lp =>
      (lp.criterioUso === usoPredio || `CT${lp.codCriterio}` === usoPredio) &&
      lp.tasaMensual === tasaValue
    );

    if (registro) {
      // Encontrar la zona y criterio correspondientes
      const zonaSeleccionada = zonas.find(z => z.id === registro.codZona);
      const criterioSeleccionado = usosOptions.find(u => Number(u.value) === registro.codCriterio);

      // Actualizar los campos del formulario
      setAnioOtros(registro.anio || parseInt(anioConsultaOtros));
      setZonaOtros(zonaSeleccionada || null);
      setCriterioUsoOtros(criterioSeleccionado || null);
      setTasaOtros(registro.tasaMensual.toString());

      // Scroll hacia arriba para mostrar el formulario
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Tabs de limpieza pública"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
                minHeight: 56,
                '&.Mui-selected': {
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              icon={<HomeIcon />} 
              iconPosition="start" 
              label="Casa Habitación" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<BusinessIcon />} 
              iconPosition="start" 
              label="Otros Usos" 
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>

        {/* Tab Panel - Casa Habitación */}
        <TabPanel value={tabValue} index={0}>
          {/* Sección Registro de Tasas - Casa Habitación */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3,
              mb: 3,
              backgroundColor: 'background.paper',
              width: '70%'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SaveIcon />
              Registro de Tasas
            </Typography>

            {/* Primera fila */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              mb: 2
            }}>
              {/* Año  */}
              <TextField
                size="small"
                label="Año"
                type="number"
                value={anioCasa}
                onChange={(e) => setAnioCasa(parseInt(e.target.value))}
                sx={{
                  width: '120px',
                  '& .MuiInputBase-root': {
                    height: '35px'
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 1900,
                    max: new Date().getFullYear()
                  }
                }}
              />

              {/* Tasa Mensual */}
              <TextField
                label="Tasa Mensual"
                value={tasaCasa}
                onChange={(e) => setTasaCasa(e.target.value)}
                size="small"
                type="number"
                sx={{
                  width: '120px',
                  '& .MuiInputBase-root': {
                    height: '35px'
                  }
                }}
                InputProps={{
                  startAdornment: <Box sx={{ mr: 0.5, color: 'text.secondary' }}>S/ x m²</Box>
                }}
                placeholder="0.00"
              />

              {/* Zona */}
              <Autocomplete
                value={zonaCasa}
                onChange={(_, newValue) => setZonaCasa(newValue)}
                options={zonas}
                getOptionLabel={(option) => option.label}
                size="small"
                sx={{ minWidth: 150, flex: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Zona"
                    placeholder="Seleccione zona"
                  />
                )}
              />

              {/* Criterio Uso */}
              <Autocomplete
                value={criterioUsoCasa}
                onChange={(_, newValue) => setCriterioUsoCasa(newValue)}
                options={usosOptions.filter(option =>
                  option.label?.toUpperCase().includes('CASA')
                )}
                getOptionLabel={(option) => option.label || ''}
                size="small"
                sx={{ minWidth: 180, flex: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Criterio Uso"
                    placeholder="Seleccione criterio"
                  />
                )}
              />
            </Box>

            {/* Segunda fila - Botones */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1
            }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleRegistroCasa}
                disabled={!zonaCasa || !tasaCasa}
              >
                Registrar
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNuevoCasa}
                sx={{ backgroundColor: 'white' }}
              >
                Nuevo
              </Button>
            </Box>
          </Paper>

          <Divider sx={{ my: 2 }} />

          {/* Sección Consulta de Tasas - Casa Habitación */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3,
              backgroundColor: 'background.paper'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SearchIcon />
              Consulta de Tasas
            </Typography>

            {/* Filtro */}
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              mb: 3
            }}>
              <TextField
                size="small"
                label="Año"
                type="number"
                value={anioConsultaCasa}
                onChange={(e) => setAnioConsultaCasa(e.target.value)}
                sx={{ width: '120px' }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleBuscarCasa}
                disabled={!anioConsultaCasa || isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>

            {/* Tabla Casa Habitación */}
            {mostrarTablaCasa && (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 400,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&::-webkit-scrollbar': {
                    width: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.200',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 4,
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        Zona de Servicio
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        Tasa Mensual (S/ x m²)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        Tasa Anual
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosCasaHabitacion.map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell sx={{ cursor: 'default' }}>{row.zona}</TableCell>
                        <TableCell align="center" sx={{ cursor: 'pointer' }}>
                          <Tooltip
                            title={`Clic para editar: ${row.zona} - S/ ${row.tasaMensual.toFixed(2)}`}
                            arrow
                            placement="top"
                          >
                            <Box
                              onClick={() => handleCasaClick(row.zona, row.tasaMensual)}
                              sx={{
                                display: 'inline-block',
                                backgroundColor: 'success.light',
                                color: 'success.contrastText',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: 'success.main',
                                  transform: 'scale(1.05)',
                                  boxShadow: 2
                                },
                                '&:active': {
                                  transform: 'scale(0.95)'
                                }
                              }}
                            >
                              S/ {row.tasaMensual.toFixed(2)}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-block',
                              backgroundColor: 'info.light',
                              color: 'info.contrastText',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 600
                            }}
                          >
                            S/ {(row.tasaMensual * 12).toFixed(2)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>

        {/* Tab Panel - Otros Usos */}
        <TabPanel value={tabValue} index={1}>
          {/* Sección Registro de Tasas - Otros Usos */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3,
              mb: 3,
              backgroundColor: 'background.paper',
              width:'70%'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SaveIcon />
              Registro de Tasas
            </Typography>

            {/* Primera fila */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              mb: 2
            }}>
              {/* Año */}
              <TextField
                size="small"
                label="Año"
                type="number"
                value={anioOtros}
                onChange={(e) => setAnioOtros(parseInt(e.target.value))}
                sx={{
                  width: '120px',
                  '& .MuiInputBase-root': {
                    height: '35px'
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 1900,
                    max: new Date().getFullYear()
                  }
                }}
              />

              {/* Tasa Mensual */}
              <TextField
                label="Tasa Mensual"
                value={tasaOtros}
                onChange={(e) => setTasaOtros(e.target.value)}
                size="small"
                type="number"
                sx={{
                  width: '120px',
                  '& .MuiInputBase-root': {
                    height: '35px'
                  }
                }}
                InputProps={{
                  startAdornment: <Box sx={{ mr: 0.5, color: 'text.secondary' }}>S/ x m²</Box>
                }}
                placeholder="0.00"
              />

              {/* Zona */}
              <Autocomplete
                value={zonaOtros}
                onChange={(_, newValue) => setZonaOtros(newValue)}
                options={zonas}
                getOptionLabel={(option) => option.label}
                size="small"
                sx={{ minWidth: 150, flex: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Zona"
                    placeholder="Seleccione zona"
                  />
                )}
              />

              {/* Criterio Uso */}
              <Autocomplete
                value={criterioUsoOtros}
                onChange={(_, newValue) => setCriterioUsoOtros(newValue)}
                options={usosOptions.filter(option =>
                  !option.label?.toUpperCase().includes('CASA')
                )}
                getOptionLabel={(option) => option.label || ''}
                size="small"
                sx={{ minWidth: 180, flex: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Criterio Uso"
                    placeholder="Seleccione criterio"
                  />
                )}
              />
            </Box>

            {/* Segunda fila - Botones */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1
            }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleRegistroOtros}
                disabled={!zonaOtros || !tasaOtros || !criterioUsoOtros}
              >
                Registrar
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNuevoOtros}
                sx={{ backgroundColor: 'white' }}
              >
                Nuevo
              </Button>
            </Box>
          </Paper>

          <Divider sx={{ my: 2 }} />

          {/* Sección Consulta de Tasas - Otros Usos */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3,
              backgroundColor: 'background.paper'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SearchIcon />
              Consulta de Tasas
            </Typography>

            {/* Filtro */}
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              mb: 3
            }}>
              <TextField
                size="small"
                label="Año"
                type="number"
                value={anioConsultaOtros}
                onChange={(e) => setAnioConsultaOtros(e.target.value)}
                sx={{ width: '120px' }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleBuscarOtros}
                disabled={!anioConsultaOtros || isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>

            {/* Tabla Otros Usos */}
            {mostrarTablaOtros && (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 400,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&::-webkit-scrollbar': {
                    width: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.200',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 4,
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        Uso del Predio
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        Tasa Mensual (S/ x m²)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        Tasa Anual
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosOtrosUsos.map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell sx={{ cursor: 'default' }}>{row.usoPredio}</TableCell>
                        <TableCell align="center" sx={{ cursor: 'pointer' }}>
                          <Tooltip
                            title={`Clic para editar: ${row.usoPredio} - S/ ${row.tasaMensual.toFixed(2)}`}
                            arrow
                            placement="top"
                          >
                            <Box
                              onClick={() => handleOtrosClick(row.usoPredio, row.tasaMensual)}
                              sx={{
                                display: 'inline-block',
                                backgroundColor: 'info.light',
                                color: 'info.contrastText',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: 'info.main',
                                  transform: 'scale(1.05)',
                                  boxShadow: 2
                                },
                                '&:active': {
                                  transform: 'scale(0.95)'
                                }
                              }}
                            >
                              S/ {row.tasaMensual.toFixed(2)}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-block',
                              backgroundColor: 'success.light',
                              color: 'success.contrastText',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 600
                            }}
                          >
                            S/ {(row.tasaMensual * 12).toFixed(2)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default LimpiezaPublica;