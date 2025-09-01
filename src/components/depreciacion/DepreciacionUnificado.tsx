// src/components/depreciacion/DepreciacionUnificado.tsx
import React, { useState } from 'react';
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
  Warning as WarningIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Construction as ConstructionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Depreciacion } from '../../models/Depreciacion';
import { 
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
  loading = false
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para los nuevos campos
  const [nivelAntiguedadSeleccionado, setNivelAntiguedadSeleccionado] = useState<string | null>(null);
  const [materialEstructuralSeleccionado, setMaterialEstructuralSeleccionado] = useState<string | null>(null);
  
  // Estado para modo de edición
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Hook para años disponibles ya no es necesario al usar TextField
  
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

  const handleRegistrar = async () => {
    // Construir objeto con los datos del formulario
    const datosFormulario = {
      nivelAntiguedad: nivelAntiguedadSeleccionado,
      materialEstructural: materialEstructuralSeleccionado,
      estadosConservacion: estadosConservacion.reduce((acc, estado) => {
        acc[estado.field] = estado.value;
        return acc;
      }, {} as Record<string, number>)
    };
    
    try {
      // Ejecutar el registro
      await onRegistrar(datosFormulario);
      
      // Limpiar formulario después del registro exitoso
      setEstadosConservacion(prev => prev.map(estado => ({ ...estado, value: 0.00 })));
      setNivelAntiguedadSeleccionado(null);
      setMaterialEstructuralSeleccionado(null);
      setIsEditMode(false);
      
      // Cambiar a la pestaña de búsqueda (ahora es index 0)
      setTabValue(0);
      
      // Ejecutar búsqueda para mostrar los datos recién agregados
      setTimeout(() => {
        onBuscar();
        setHasSearched(true);
      }, 100);
      
    } catch (error) {
      // En caso de error, mantener los datos en el formulario
      console.error('Error al registrar:', error);
    }
  };

  const handleBuscar = () => {
    onBuscar();
    setHasSearched(true);
  };

  const handleNuevo = () => {
    // Limpiar formulario y salir del modo edición
    setEstadosConservacion(prev => prev.map(estado => ({ ...estado, value: 0.00 })));
    setNivelAntiguedadSeleccionado(null);
    setMaterialEstructuralSeleccionado(null);
    onAnioChange(null);
    onTipoCasaChange(null);
    setIsEditMode(false);
  };

  const handleEliminar = () => {
    // Aquí se implementaría la lógica de eliminación
    // Por ahora solo limpiamos el formulario y salimos del modo edición
    handleNuevo();
  };

  const handleEditarDepreciacion = (depreciacion: Depreciacion) => {
    // Cargar datos en el formulario
    onAnioChange(depreciacion.anio);
    
    // Buscar y establecer el tipo de casa correcto
    const tipoCasa = tiposCasa.find(tipo => 
      tipo.label === depreciacion.tipoCasa || 
      tipo.value === depreciacion.tipoCasa
    );
    if (tipoCasa) {
      onTipoCasaChange(tipoCasa.value.toString());
    }
    
    // Buscar y establecer el nivel de antigüedad correcto
    const nivelAntigu = nivelesAntiguedad.find(nivel => 
      nivel.label === depreciacion.antiguedad || 
      nivel.value === depreciacion.antiguedad
    );
    if (nivelAntigu) {
      setNivelAntiguedadSeleccionado(nivelAntigu.value.toString());
    }
    
    // Buscar y establecer el material estructural correcto  
    const materialEstr = materialesEstructurales.find(material => 
      material.label === depreciacion.material || 
      material.value === depreciacion.material
    );
    if (materialEstr) {
      setMaterialEstructuralSeleccionado(materialEstr.value.toString());
    }
    
    // Cargar estados de conservación
    const nuevosEstados = estadosConservacion.map(estado => {
      switch (estado.field) {
        case 'porcMuyBueno':
          return { ...estado, value: depreciacion.porcMuyBueno };
        case 'porcBueno':
          return { ...estado, value: depreciacion.porcBueno };
        case 'porcRegular':
          return { ...estado, value: depreciacion.porcRegular };
        case 'porcMalo':
          return { ...estado, value: depreciacion.porcMalo };
        default:
          return estado;
      }
    });
    setEstadosConservacion(nuevosEstados);
    
    // Activar modo edición
    setIsEditMode(true);
    
    // Cambiar a la pestaña de registro (ahora es index 1)
    setTabValue(1);
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
            icon={<SearchIcon />} 
            iconPosition="start"
            label="Buscar y Consultar" 
            id="depreciacion-tab-0"
            aria-controls="depreciacion-tabpanel-0"
          />
          <Tab 
            icon={<SaveIcon />} 
            iconPosition="start"
            label="Registrar Depreciación" 
            id="depreciacion-tab-1"
            aria-controls="depreciacion-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Panel de Registro - Ahora en index 1 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
         

            {/* Controles de búsqueda en una sola fila */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 1.5 },
              alignItems: { xs: 'stretch', sm: 'center' },
              '& > *': {
                flex: { xs: '1 1 auto', sm: '0 0 auto' }
              }
            }}>
              {/* Selector Año */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(40% - 8px)', md: '0 0 120px' },
                minWidth: { xs: '100%', sm: '120px', md: '120px' }
              }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Año"
                  type="number"
                  value={anioSeleccionado || ''}
                  onChange={(e) => onAnioChange(parseInt(e.target.value) || null)}
                  InputProps={{
                    inputProps: { 
                      min: 1900, 
                      max: new Date().getFullYear() 
                    }
                  }}
                />
              </Box>
              
              {/* Tipo de Casa */}
              <Autocomplete
                size="small"
                options={tiposCasa}
                getOptionLabel={(option) => option.label}
                value={tiposCasa.find(t => t.value === tipoCasaSeleccionado) || null}
                onChange={(_, newValue) => handleTipoCasaSelect(newValue)}
                loading={loading || loadingTiposCasa}
                disabled={loading || loadingTiposCasa || !anioSeleccionado}
                sx={{ 
                  width: { xs: '100%', sm: 240, md: 240 },
                  flex: { xs: '1 1 100%', sm: '1 1 60%' }
                }}
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
                        fontSize: '0.875rem',
                        height: 32,
                        width: '100%'
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* Controles de selección - Segunda fila: Nivel de Antigüedad y Material Estructural */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 1.5 },
              alignItems: { xs: 'stretch', sm: 'center' },
              '& > *': {
                flex: { xs: '1 1 auto', sm: '0 0 auto' }
              }
            }}>
              {/* Nivel de Antigüedad */}
              <Autocomplete
                size="small"
                options={nivelesAntiguedad}
                getOptionLabel={(option) => option.label}
                value={nivelesAntiguedad.find(n => n.value === nivelAntiguedadSeleccionado) || null}
                onChange={(_, newValue) => handleNivelAntiguedadSelect(newValue)}
                loading={loading || loadingNivelesAntiguedad}
                disabled={loading || loadingNivelesAntiguedad || !tipoCasaSeleccionado}
                sx={{ 
                  width: { xs: '100%', sm: 180, md: 180 },
                  flex: { xs: '1 1 100%', sm: '1 1 48%' }
                }}
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
                          <CalendarIcon sx={{ fontSize: 12 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {(loading || loadingNivelesAntiguedad) ? <CircularProgress color="inherit" size={12} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiInputLabel-root': {
                        fontSize: '0.75rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.75rem',
                        height: 32,
                        width: '100%'
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
                sx={{ 
                  width: { xs: '100%', sm: 180, md: 180 },
                  flex: { xs: '1 1 100%', sm: '1 1 48%' }
                }}
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
                          <ConstructionIcon sx={{ fontSize: 12 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {(loading || loadingMaterialesEstructurales) ? <CircularProgress color="inherit" size={12} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiInputLabel-root': {
                        fontSize: '0.75rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.75rem',
                        height: 32,
                        width: '100%'
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
                gridTemplateColumns: { 
                  xs: 'repeat(1, 1fr)', 
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)' 
                },
                gap: { xs: 1, sm: 1.5 },
                maxWidth: { xs: '100%', sm: 600, md: 800 },
                justifyContent: 'start' // Alinear al inicio para mantener elementos compactos
              }}>
                {estadosConservacion.map((estado, index) => (
                  <Box key={estado.nombre} sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1, // Reducido de 1.5 para más compacto
                    width: '100%', // Asegurar que use todo el ancho del grid
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
                            <TrendingDownIcon sx={{ fontSize: 14 }} color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.7rem' }}>%</InputAdornment>
                      }}
                      inputProps={{
                        step: 0.01,
                        min: 0,
                        max: 100
                      }}
                      sx={{
                        maxWidth: { xs: '100%', sm: 150 },
                        '& .MuiOutlinedInput-root': {
                          height: { xs: 32, sm: 28 },
                          fontSize: { xs: '0.8rem', sm: '0.75rem' },
                          '&:hover fieldset': {
                            borderColor: estado.color,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: estado.color,
                          }
                        },
                        '& .MuiOutlinedInput-input': {
                          padding: '4px 6px' // Padding más compacto
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Información adicional */}
            {anioSeleccionado && tipoCasaSeleccionado && nivelAntiguedadSeleccionado && materialEstructuralSeleccionado && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', // Centrar el Alert
                width: '100%' 
              }}>
              
              </Box>
            )}

            {/* Línea divisoria */}
            <Divider sx={{ my: 2 }} />

            {/* Botones de acción */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="center" 
              alignItems="center"
              spacing={{ xs: 1, sm: 2 }}
              sx={{ width: '100%' }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={handleNuevo}
                startIcon={<AddIcon fontSize="small" />}
                sx={{
                  height: 36,
                  px: 3,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minWidth: { xs: 120, sm: 100 },
                  width: { xs: '100%', sm: 'auto' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Nuevo
              </Button>
              
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
                  fontSize: '0.875rem',
                  minWidth: { xs: 140, sm: 120 },
                  width: { xs: '100%', sm: 'auto' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {loading ? 'Registrando...' : 'Guardar'}
              </Button>
              
              {isEditMode && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleEliminar}
                  startIcon={<DeleteIcon fontSize="small" />}
                  sx={{
                    height: 36,
                    px: 3,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minWidth: { xs: 120, sm: 110 },
                    width: { xs: '100%', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      backgroundColor: 'error.light'
                    }
                  }}
                >
                  Eliminar
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </TabPanel>

      {/* Panel de Búsqueda - Ahora en index 0 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
         

            {/* Controles de búsqueda en una sola fila */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 1 },
              alignItems: { xs: 'stretch', sm: 'center' },
              p: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}>
              {/* Selector Año Busqueda */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 120px' },
                minWidth: { xs: '100%', md: '120px' }
              }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Año"
                  type="number"
                  value={anioSeleccionado || ''}
                  onChange={(e) => onAnioChange(parseInt(e.target.value) || null)}
                  InputProps={{
                    inputProps: { 
                      min: 1900, 
                      max: new Date().getFullYear() 
                    }
                  }}
                />
              </Box>
              
              <Autocomplete
                size="small"
                options={tiposCasa}
                getOptionLabel={(option) => option.label}
                value={tiposCasa.find(t => t.value === tipoCasaSeleccionado) || null}
                onChange={(_, newValue) => handleTipoCasaSelect(newValue)}
                loading={loading || loadingTiposCasa}
                disabled={loading || loadingTiposCasa}
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 auto' },
                  minWidth: { xs: '100%', sm: 200 },
                  maxWidth: { xs: '100%', sm: 350 }
                }}
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
                  minWidth: { xs: 100, sm: 80 },
                  width: { xs: '100%', sm: 'auto' },
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
                    maxHeight: { xs: 300, sm: 400 },
                    overflow: 'auto',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    mt: 2,
                    position: 'relative',
                    '& .MuiTable-root': {
                      minWidth: { xs: 500, sm: 650 }
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
                            bgcolor: '#ffffff !important',
                            color: theme.palette.primary.main,
                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 1000
                          }}
                        >
                          MATERIAL
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: '#ffffff !important',
                            color: theme.palette.primary.main,
                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 1000
                          }}
                        >
                          ANTIGÜEDAD
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: '#ffffff',
                            color: theme.palette.success.main,
                            borderBottom: `2px solid ${theme.palette.success.main}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 104,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderTop: 'none',
                            paddingTop: 0
                          }}
                        >
                          MUY BUENO
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: '#ffffff',
                            color: theme.palette.info.main,
                            borderBottom: `2px solid ${theme.palette.info.main}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 104,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderTop: 'none',
                            paddingTop: 0
                          }}
                        >
                          BUENO
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: '#ffffff',
                            color: theme.palette.warning.main,
                            borderBottom: `2px solid ${theme.palette.warning.main}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 104,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderTop: 'none',
                            paddingTop: 0
                          }}
                        >
                          REGULAR
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: '#ffffff',
                            color: theme.palette.error.main,
                            borderBottom: `2px solid ${theme.palette.error.main}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 104,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderTop: 'none',
                            paddingTop: 0
                          }}
                        >
                          MALO
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            bgcolor: '#ffffff',
                            color: theme.palette.primary.main,
                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 104,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderTop: 'none',
                            paddingTop: 0
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
                            <Tooltip title="Editar depreciación" arrow>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEditarDepreciacion(depreciacion)}
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