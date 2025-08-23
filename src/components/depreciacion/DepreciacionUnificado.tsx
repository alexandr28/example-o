// src/components/depreciacion/DepreciacionUnificado.tsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Autocomplete,
  InputAdornment,
  useTheme,
  alpha,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  HighlightOff as HighlightOffIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Construction as ConstructionIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Depreciacion } from '../../models/Depreciacion';
import { 
  useAnioOptions, 
  useClasificacionPredio,
  useTipoNivelAntiguedad,
  useMaterialPredominante 
} from '../../hooks/useConstantesOptions';

interface DepreciacionUnificadoProps {
  anioSeleccionado: number | null;
  tipoCasaSeleccionado: string | null;
  depreciaciones: Depreciacion[];
  onAnioChange: (anio: number | null) => void;
  onTipoCasaChange: (tipoCasa: string | null) => void;
  onRegistrar: (datos?: any) => void;
  onBuscar: () => void;
  onActualizar?: (id: number, datos: any) => void;
  onEliminar?: (id: number) => void;
  loading?: boolean;
}

interface EstadoConservacion {
  nombre: string;
  field: keyof Pick<Depreciacion, 'porcMuyBueno' | 'porcBueno' | 'porcRegular' | 'porcMalo'>;
  icon: React.ReactNode;
  color: string;
  value: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`depreciacion-tabpanel-${index}`}
      aria-labelledby={`depreciacion-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

/**
 * Componente unificado que integra registro, búsqueda y visualización de depreciaciones
 */
const DepreciacionUnificado: React.FC<DepreciacionUnificadoProps> = ({
  anioSeleccionado,
  tipoCasaSeleccionado,
  depreciaciones,
  onAnioChange,
  onTipoCasaChange,
  onRegistrar,
  onBuscar,
  onActualizar,
  onEliminar,
  loading = false
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para los nuevos campos
  const [nivelAntiguedadSeleccionado, setNivelAntiguedadSeleccionado] = useState<string | null>(null);
  const [materialEstructuralSeleccionado, setMaterialEstructuralSeleccionado] = useState<string | null>(null);
  
  // Usar el hook para obtener años disponibles
  const { options: aniosDisponibles, loading: loadingAnios } = useAnioOptions(2020, new Date().getFullYear() + 2);
  
  // Usar el hook para obtener tipos de casa (clasificación de predios)
  const { options: tiposCasa, loading: loadingTiposCasa } = useClasificacionPredio();
  
  // Usar el hook para obtener niveles de antigüedad
  const { options: nivelesAntiguedad, loading: loadingNivelesAntiguedad } = useTipoNivelAntiguedad();
  
  // Usar el hook para obtener materiales estructurales
  const { options: materialesEstructurales, loading: loadingMaterialesEstructurales } = useMaterialPredominante();
  
  // Estados para el formulario de registro
  const [estadosConservacion, setEstadosConservacion] = useState<EstadoConservacion[]>([
    { 
      nombre: 'Muy bueno', 
      field: 'porcMuyBueno',
      icon: <CheckCircleIcon />, 
      color: theme.palette.success.main,
      value: 0.00 
    },
    { 
      nombre: 'Bueno', 
      field: 'porcBueno',
      icon: <CheckCircleIcon />, 
      color: theme.palette.info.main,
      value: 0.00 
    },
    { 
      nombre: 'Regular', 
      field: 'porcRegular',
      icon: <WarningIcon />, 
      color: theme.palette.warning.main,
      value: 0.00 
    },
    { 
      nombre: 'Malo', 
      field: 'porcMalo',
      icon: <ErrorIcon />, 
      color: theme.palette.error.main,
      value: 0.00 
    }
  ]);

  // Estados para búsqueda y resultados
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Handlers para cambios en los controles
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAnioSelect = (anio: { value: string | number, label: string } | null) => {
    onAnioChange(anio ? (typeof anio.value === 'number' ? anio.value : parseInt(anio.value.toString())) : null);
  };

  const handleTipoCasaSelect = (tipo: { value: string | number, label: string } | null) => {
    onTipoCasaChange(tipo ? tipo.value.toString() : null);
  };

  const handleNivelAntiguedadSelect = (nivel: { value: string | number, label: string } | null) => {
    setNivelAntiguedadSeleccionado(nivel ? nivel.value.toString() : null);
  };

  const handleMaterialEstructuralSelect = (material: { value: string | number, label: string } | null) => {
    setMaterialEstructuralSeleccionado(material ? material.value.toString() : null);
  };

  const handleConservacionChange = (index: number, value: string) => {
    const nuevosEstados = [...estadosConservacion];
    nuevosEstados[index].value = parseFloat(value) || 0;
    setEstadosConservacion(nuevosEstados);
  };

  const handleRegistrar = () => {
    // Construir objeto con los datos del formulario
    const datosFormulario = {
      nivelAntiguedad: nivelAntiguedadSeleccionado,
      materialEstructural: materialEstructuralSeleccionado,
      estadosConservacion: estadosConservacion.reduce((acc, estado) => {
        acc[estado.field] = estado.value;
        return acc;
      }, {} as Record<string, number>)
    };
    
    onRegistrar(datosFormulario);
    
    // Limpiar formulario después del registro
    setEstadosConservacion(prev => prev.map(estado => ({ ...estado, value: 0.00 })));
    setNivelAntiguedadSeleccionado(null);
    setMaterialEstructuralSeleccionado(null);
  };

  const handleBuscar = () => {
    onBuscar();
    setHasSearched(true);
  };

  // Obtener color del material
  const getMaterialColor = (material: string): string => {
    switch (material) {
      case 'Concreto': return theme.palette.primary.main;
      case 'Ladrillo': return theme.palette.warning.main;
      case 'Adobe': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Filtrar depreciaciones según búsqueda
  const filteredDepreciaciones = depreciaciones.filter(dep => 
    dep.anio.toString().includes(searchTerm) ||
    dep.tipoCasa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dep.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dep.antiguedad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper 
      elevation={2}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header con tabs */}
      <Box sx={{ 
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="depreciacion tabs"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500,
            }
          }}
        >
          <Tab 
            icon={<SaveIcon />} 
            iconPosition="start"
            label="Registrar Depreciación" 
            id="depreciacion-tab-0"
            aria-controls="depreciacion-tabpanel-0"
          />
          <Tab 
            icon={<SearchIcon />} 
            iconPosition="start"
            label="Buscar y Consultar" 
            id="depreciacion-tab-1"
            aria-controls="depreciacion-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Panel de Registro */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Título de la sección de registro */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TrendingDownIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Configurar Depreciación
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure los valores de depreciación por estado de conservación
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* Controles de selección - todos en una sola fila */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)' 
              },
              gap: 1.5
            }}>
              {/* Año */}
              <Autocomplete
                size="small"
                options={aniosDisponibles}
                getOptionLabel={(option) => option.label}
                value={aniosDisponibles.find(a => (typeof a.value === 'number' ? a.value : parseInt(a.value.toString())) === anioSeleccionado) || null}
                onChange={(_, newValue) => handleAnioSelect(newValue)}
                loading={loading || loadingAnios}
                disabled={loading || loadingAnios}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Año"
                    placeholder="Año"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ fontSize: 14 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {(loading || loadingAnios) ? <CircularProgress color="inherit" size={14} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: '0.875rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                )}
              />
              
              {/* Tipo de Casa */}
              <Autocomplete
                size="small"
                options={tiposCasa}
                getOptionLabel={(option) => option.label}
                value={tiposCasa.find(t => t.value === tipoCasaSeleccionado) || null}
                onChange={(_, newValue) => handleTipoCasaSelect(newValue)}
                loading={loading || loadingTiposCasa}
                disabled={loading || loadingTiposCasa || !anioSeleccionado}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de Casa"
                    placeholder="Tipo"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ fontSize: 14 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {(loading || loadingTiposCasa) ? <CircularProgress color="inherit" size={14} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: '0.875rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                )}
              />

              {/* Nivel de Antigüedad */}
              <Autocomplete
                size="small"
                options={nivelesAntiguedad}
                getOptionLabel={(option) => option.label}
                value={nivelesAntiguedad.find(n => n.value === nivelAntiguedadSeleccionado) || null}
                onChange={(_, newValue) => handleNivelAntiguedadSelect(newValue)}
                loading={loading || loadingNivelesAntiguedad}
                disabled={loading || loadingNivelesAntiguedad || !tipoCasaSeleccionado}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Antigüedad"
                    placeholder="Antigüedad"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ fontSize: 14 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {(loading || loadingNivelesAntiguedad) ? <CircularProgress color="inherit" size={14} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: '0.875rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                )}
              />
              
              {/* Material Estructural */}
              <Autocomplete
                size="small"
                options={materialesEstructurales}
                getOptionLabel={(option) => option.label}
                value={materialesEstructurales.find(m => m.value === materialEstructuralSeleccionado) || null}
                onChange={(_, newValue) => handleMaterialEstructuralSelect(newValue)}
                loading={loading || loadingMaterialesEstructurales}
                disabled={loading || loadingMaterialesEstructurales || !tipoCasaSeleccionado}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Material"
                    placeholder="Material"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <ConstructionIcon sx={{ fontSize: 14 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {(loading || loadingMaterialesEstructurales) ? <CircularProgress color="inherit" size={14} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: '0.875rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* Estados de Conservación */}
            <Box>
              <Typography variant="subtitle2" fontWeight={500} mb={2}>
                Estados de Conservación
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 1.5
              }}>
                {estadosConservacion.map((estado, index) => (
                  <Box key={estado.nombre} sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1.5,
                    '&:hover': {
                      borderColor: estado.color,
                      boxShadow: `0 0 0 1px ${alpha(estado.color, 0.2)}`
                    }
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Box sx={{ color: estado.color, fontSize: '1rem' }}>
                        {estado.icon}
                      </Box>
                      <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                        {estado.nombre}
                      </Typography>
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={estado.value}
                      onChange={(e) => handleConservacionChange(index, e.target.value)}
                      disabled={loading || !anioSeleccionado || !tipoCasaSeleccionado}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TrendingDownIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>%</InputAdornment>
                      }}
                      inputProps={{
                        step: 0.01,
                        min: 0,
                        max: 100
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: 32,
                          fontSize: '0.875rem',
                          '&:hover fieldset': {
                            borderColor: estado.color,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: estado.color,
                          }
                        },
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Información adicional */}
            {anioSeleccionado && tipoCasaSeleccionado && nivelAntiguedadSeleccionado && materialEstructuralSeleccionado && (
              <Alert severity="info" variant="outlined">
                Configure los porcentajes de depreciación para {tiposCasa.find(t => t.value === tipoCasaSeleccionado)?.label} 
                {' '}con antigüedad {nivelesAntiguedad.find(n => n.value === nivelAntiguedadSeleccionado)?.label}
                {' '}y material {materialesEstructurales.find(m => m.value === materialEstructuralSeleccionado)?.label}
                {' '}en el año {anioSeleccionado}
              </Alert>
            )}

            {/* Botón Registrar */}
            <Stack direction="row" justifyContent="center">
              <Button
                variant="contained"
                size="small"
                onClick={handleRegistrar}
                disabled={loading || !anioSeleccionado || !tipoCasaSeleccionado || !nivelAntiguedadSeleccionado || !materialEstructuralSeleccionado}
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                sx={{
                  height: 36,
                  px: 3,
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </TabPanel>

      {/* Panel de Búsqueda */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* Título de la sección de búsqueda */}
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <SearchIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={500}>
                Búsqueda de Depreciación
              </Typography>
            </Stack>

            {/* Controles de búsqueda en una sola fila */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              p: 2,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Autocomplete
                size="small"
                options={aniosDisponibles}
                getOptionLabel={(option) => option.label}
                value={aniosDisponibles.find(a => (typeof a.value === 'number' ? a.value : parseInt(a.value.toString())) === anioSeleccionado) || null}
                onChange={(_, newValue) => handleAnioSelect(newValue)}
                loading={loading || loadingAnios}
                disabled={loading || loadingAnios}
                sx={{ minWidth: 120, maxWidth: 150 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Año"
                    size="small"
                    placeholder="Año"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 28,
                        fontSize: '0.8rem',
                        bgcolor: 'white'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.8rem',
                        top: '-2px'
                      },
                      '& .MuiInputLabel-shrink': {
                        top: '0px'
                      }
                    }}
                  />
                )}
              />
              
              <Autocomplete
                size="small"
                options={tiposCasa}
                getOptionLabel={(option) => option.label}
                value={tiposCasa.find(t => t.value === tipoCasaSeleccionado) || null}
                onChange={(_, newValue) => handleTipoCasaSelect(newValue)}
                loading={loading || loadingTiposCasa}
                disabled={loading || loadingTiposCasa}
                sx={{ minWidth: 180, maxWidth: 220 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo de Casa"
                    size="small"
                    placeholder="Tipo"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 28,
                        fontSize: '0.8rem',
                        bgcolor: 'white'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.8rem',
                        top: '-2px'
                      },
                      '& .MuiInputLabel-shrink': {
                        top: '0px'
                      }
                    }}
                  />
                )}
              />
              
              <Button
                variant="contained"
                size="small"
                onClick={handleBuscar}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={12} color="inherit" /> : <SearchIcon sx={{ fontSize: 14 }} />}
                sx={{ 
                  height: 28, 
                  px: 2, 
                  minWidth: 80,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>

              {/* Barra de búsqueda por texto integrada en la misma fila */}
              {hasSearched && filteredDepreciaciones.length > 0 && (
                <TextField
                  size="small"
                  placeholder="Filtrar resultados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 14 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    minWidth: 160,
                    maxWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      height: 28,
                      fontSize: '0.8rem',
                      bgcolor: 'white'
                    }
                  }}
                />
              )}
            </Box>

            {/* Tabla de resultados */}
            <Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : hasSearched && filteredDepreciaciones.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  elevation={2}
                  sx={{ 
                    maxHeight: 400,
                    overflow: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '& .MuiTable-root': {
                      minWidth: 650
                    }
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            borderBottom: `2px solid ${theme.palette.primary.main}`
                          }}
                        >
                          MATERIAL
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            borderBottom: `2px solid ${theme.palette.primary.main}`
                          }}
                        >
                          ANTIGÜEDAD
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            color: theme.palette.success.main,
                            borderBottom: `2px solid ${theme.palette.success.main}`
                          }}
                        >
                          MUY BUENO
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.info.main, 0.08),
                            color: theme.palette.info.main,
                            borderBottom: `2px solid ${theme.palette.info.main}`
                          }}
                        >
                          BUENO
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.warning.main, 0.08),
                            color: theme.palette.warning.main,
                            borderBottom: `2px solid ${theme.palette.warning.main}`
                          }}
                        >
                          REGULAR
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            color: theme.palette.error.main,
                            borderBottom: `2px solid ${theme.palette.error.main}`
                          }}
                        >
                          MALO
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            borderBottom: `2px solid ${theme.palette.primary.main}`
                          }}
                        >
                          ACCIONES
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDepreciaciones.map((depreciacion, index) => (
                        <TableRow 
                          key={`${depreciacion.id || index}`}
                          hover
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: alpha(theme.palette.grey[100], 0.5),
                            }
                          }}
                        >
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              icon={<ConstructionIcon fontSize="small" />}
                              label={depreciacion.material}
                              size="small"
                              variant="outlined"
                              sx={{
                                bgcolor: alpha(getMaterialColor(depreciacion.material), 0.1),
                                color: getMaterialColor(depreciacion.material),
                                fontWeight: 600,
                                borderColor: getMaterialColor(depreciacion.material),
                                '& .MuiChip-icon': {
                                  color: getMaterialColor(depreciacion.material)
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 500,
                                color: theme.palette.text.primary
                              }}
                            >
                              {depreciacion.antiguedad}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 56,
                                height: 28,
                                px: 1,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.success.dark,
                                  fontSize: '0.8125rem'
                                }}
                              >
                                {depreciacion.porcMuyBueno.toFixed(2)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 56,
                                height: 28,
                                px: 1,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.info.dark,
                                  fontSize: '0.8125rem'
                                }}
                              >
                                {depreciacion.porcBueno.toFixed(2)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 56,
                                height: 28,
                                px: 1,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.warning.dark,
                                  fontSize: '0.8125rem'
                                }}
                              >
                                {depreciacion.porcRegular.toFixed(2)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 56,
                                height: 28,
                                px: 1,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.error.dark,
                                  fontSize: '0.8125rem'
                                }}
                              >
                                {depreciacion.porcMalo.toFixed(2)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            {onActualizar && (
                              <Tooltip title="Editar depreciación" arrow>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => onActualizar(depreciacion.id!, depreciacion)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.16),
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : hasSearched ? (
                <Alert 
                  severity="info" 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  No se encontraron resultados para los criterios seleccionados
                </Alert>
              ) : (
                <Alert 
                  severity="info" 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  Seleccione los criterios y haga clic en buscar
                </Alert>
              )}
            </Box>
          </Stack>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default DepreciacionUnificado;