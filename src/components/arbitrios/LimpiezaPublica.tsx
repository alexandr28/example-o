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
  
  // Estados para Casa Habitación
  const [anioCasa, setAnioCasa] = useState<number>(new Date().getFullYear());
  const [zonaCasa, setZonaCasa] = useState<ZonaOption | null>(null);
  const [tasaCasa, setTasaCasa] = useState<string>('');
  const [anioConsultaCasa, setAnioConsultaCasa] = useState<string>(new Date().getFullYear().toString());
  const [mostrarTablaCasa, setMostrarTablaCasa] = useState(false);
  
  // Estados para Otros Usos
  const [anioOtros, setAnioOtros] = useState<number>(new Date().getFullYear());
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
  
  // Datos de ejemplo para Casa Habitación
  const datosCasaHabitacion: TasaCasaHabitacion[] = [
    { zona: 'Zona 1', tasaMensual: 0.50 },
    { zona: 'Zona 2', tasaMensual: 0.48 },
    { zona: 'Zona 3', tasaMensual: 0.46 },
    { zona: 'Zona 4', tasaMensual: 0.44 },
    { zona: 'Zona 5', tasaMensual: 0.42 },
    { zona: 'Zona 6', tasaMensual: 0.40 },
    { zona: 'Zona 7', tasaMensual: 0.38 },
    { zona: 'Zona 8', tasaMensual: 0.36 },
    { zona: 'Zona 9', tasaMensual: 0.35 },
    { zona: 'Zona 10', tasaMensual: 0.34 },
    { zona: 'Zona 11', tasaMensual: 0.33 },
    { zona: 'Zona 12', tasaMensual: 0.32 },
    { zona: 'Zona 13', tasaMensual: 0.31 },
    { zona: 'Zona 14', tasaMensual: 0.30 },
    { zona: 'Zona 15', tasaMensual: 0.29 },
    { zona: 'Zona 16', tasaMensual: 0.28 },
  ];
  
  // Datos de ejemplo para Otros Usos
  const datosOtrosUsos: TasaOtrosUsos[] = [
    { usoPredio: 'CT1 - Comercio Menor', tasaMensual: 0.85 },
    { usoPredio: 'CT2 - Comercio Mayor', tasaMensual: 1.20 },
    { usoPredio: 'CT3 - Servicios Profesionales', tasaMensual: 0.95 },
    { usoPredio: 'CT4 - Industria Ligera', tasaMensual: 1.50 },
    { usoPredio: 'CT5 - Industria Pesada', tasaMensual: 2.00 },
    { usoPredio: 'CT6 - Educación', tasaMensual: 0.60 },
    { usoPredio: 'CT7 - Salud', tasaMensual: 0.75 },
    { usoPredio: 'CT8 - Recreación', tasaMensual: 0.70 },
  ];
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handlers para Casa Habitación
  const handleRegistroCasa = () => {
    console.log('Registrar Tasa Casa Habitación:', {
      año: anioCasa,
      zona: zonaCasa,
      tasa: tasaCasa
    });
  };
  
  const handleNuevoCasa = () => {
    setAnioCasa(new Date().getFullYear());
    setZonaCasa(null);
    setTasaCasa('');
  };
  
  const handleBuscarCasa = () => {
    setIsLoading(true);
    setTimeout(() => {
      setMostrarTablaCasa(true);
      setIsLoading(false);
    }, 500);
  };
  
  // Handlers para Otros Usos
  const handleRegistroOtros = () => {
    console.log('Registrar Tasa Otros Usos:', {
      año: anioOtros,
      criterio: criterioOtros,
      tasa: tasaOtros
    });
  };
  
  const handleNuevoOtros = () => {
    setAnioOtros(new Date().getFullYear());
    setCriterioOtros(null);
    setTasaOtros('');
  };
  
  const handleBuscarOtros = () => {
    setIsLoading(true);
    setTimeout(() => {
      setMostrarTablaOtros(true);
      setIsLoading(false);
    }, 500);
  };
  
  // Handler para click en celda de Casa Habitación
  const handleCasaClick = (zona: string, tasaValue: number) => {
    // Encontrar la zona correspondiente
    const zonaSeleccionada = zonas.find(z => z.label === zona);
    
    // Actualizar los campos del formulario
    setAnioCasa(parseInt(anioConsultaCasa));
    setZonaCasa(zonaSeleccionada || null);
    setTasaCasa(tasaValue.toString());
    
    // Scroll hacia arriba para mostrar el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handler para click en celda de Otros Usos
  const handleOtrosClick = (usoPredio: string, tasaValue: number) => {
    // Extraer el criterio del usoPredio (ej: "CT1 - Comercio Menor" -> "CT1")
    const criterioCode = usoPredio.split(' - ')[0];
    const criterioSeleccionado = criterios.find(c => c.label === criterioCode);
    
    // Actualizar los campos del formulario
    setAnioOtros(parseInt(anioConsultaOtros));
    setCriterioOtros(criterioSeleccionado || null);
    setTasaOtros(tasaValue.toString());
    
    // Scroll hacia arriba para mostrar el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              width: '55%'
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
              {/* Tasa Mensual */}
              <TextField
                label="Tasa Mensual"
                value={tasaCasa}
                onChange={(e) => setTasaCasa(e.target.value)}
                size="small"
                type="number"
                sx={{ 
                  width: '120px' ,
                  '& .MuiInputBase-root': {
                    height: '35px'
                  }
                }}
                InputProps={{
                  startAdornment: <Box sx={{ mr: 0.5, color: 'text.secondary' }}>S/ x m²</Box>
                }}
                placeholder="0.00"
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
              width:'60%'
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

              <TextField
                size="small"
                label="Año"
                type="number"
                value={anioOtros}
                onChange={(e) => setAnioOtros(parseInt(e.target.value))}
                sx={{ 
                  width: '120px' ,
                  '& .MuiInputBase-root': {
                    height: '37px'
                  }
                }}
                InputProps={{
                  inputProps: { 
                    min: 1900, 
                    max: new Date().getFullYear() 
                  }
                }}
              />
              
              <Autocomplete
                value={criterioOtros}
                onChange={(_, newValue) => setCriterioOtros(newValue)}
                options={criterios}
                getOptionLabel={(option) => option.label}
                size="small"
                sx={{ minWidth: 180, flex: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Criterio"
                    placeholder="Seleccione criterio"
                  />
                )}
              />
              
              <TextField
                label="Tasa Mensual"
                value={tasaOtros}
                onChange={(e) => setTasaOtros(e.target.value)}
                size="small"
                type="number"
                sx={{ 
                  width: '120px' ,
                  '& .MuiInputBase-root': {
                    height: '37px'
                  }
                }}
                InputProps={{
                  startAdornment: <Box sx={{ mr: 0.5, color: 'text.secondary' }}>S/ x m²</Box>
                }}
                placeholder="0.00"
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
                disabled={!criterioOtros || !tasaOtros}
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