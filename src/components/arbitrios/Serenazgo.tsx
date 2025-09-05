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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Save as SaveIcon
} from '@mui/icons-material';

interface GrupoUsoOption {
  id: number;
  label: string;
}

interface CuadranteOption {
  id: number;
  label: string;
}

interface TasaSerenazgoData {
  cuadrante: string;
  casaHabitacion: number | '';
  comercio: number | '';
  servicios: number | '';
  industrias: number | '';
  otros: number | '';
}

const Serenazgo: React.FC = () => {
  // Estados para Registro de Tasas
  const [grupoUso, setGrupoUso] = useState<GrupoUsoOption | null>(null);
  const [cuadrante, setCuadrante] = useState<CuadranteOption | null>(null);
  const [tasaNueva, setTasaNueva] = useState<string>('');
  
  // Estado para formData y errors
  const [formData, setFormData] = useState<{ anio: number | '' }>({
    anio: new Date().getFullYear()
  });
  const [errors, setErrors] = useState<{ anio?: string }>({});
  
  // Estados para Consulta de Tasas
  const [anioConsulta, setAnioConsulta] = useState<string>(new Date().getFullYear().toString());
  
  // Estados para loading y datos de tabla
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // Datos de ejemplo para los Autocomplete
  // 1. Actualizar los grupos de uso para que coincidan con la tabla
const gruposUso: GrupoUsoOption[] = [
    { id: 1, label: 'Casa Habitación' },
    { id: 2, label: 'Comercio' },
    { id: 3, label: 'Servicios' },
    { id: 4, label: 'Industrias' },
    { id: 5, label: 'Otros' },
  ];
  
  // 2. Actualizar los cuadrantes para tener 12 en lugar de 4
  const cuadrantes: CuadranteOption[] = [
    { id: 1, label: 'Cuadrante 1' },
    { id: 2, label: 'Cuadrante 2' },
    { id: 3, label: 'Cuadrante 3' },
    { id: 4, label: 'Cuadrante 4' },
    { id: 5, label: 'Cuadrante 5' },
    { id: 6, label: 'Cuadrante 6' },
    { id: 7, label: 'Cuadrante 7' },
    { id: 8, label: 'Cuadrante 8' },
    { id: 9, label: 'Cuadrante 9' },
    { id: 10, label: 'Cuadrante 10' },
    { id: 11, label: 'Cuadrante 11' },
    { id: 12, label: 'Cuadrante 12' },
  ];

  // Datos de ejemplo para la tabla de tasas de serenazgo con 12 cuadrantes
  const datosTasasSerenazgo: TasaSerenazgoData[] = [
    { cuadrante: 'Cuadrante 1', casaHabitacion: 25.50, comercio: 45.30, servicios: 55.75, industrias: 75.75, otros: 30.25 },
    { cuadrante: 'Cuadrante 2', casaHabitacion: 22.75, comercio: 42.60, servicios: 52.40, industrias: 72.40, otros: 28.45 },
    { cuadrante: 'Cuadrante 3', casaHabitacion: 20.30, comercio: 38.85, servicios: 48.60, industrias: 68.60, otros: 25.95 },
    { cuadrante: 'Cuadrante 4', casaHabitacion: 18.80, comercio: 35.90, servicios: 44.85, industrias: 64.85, otros: 23.60 },
    { cuadrante: 'Cuadrante 5', casaHabitacion: 24.20, comercio: 44.10, servicios: 54.20, industrias: 74.20, otros: 29.80 },
    { cuadrante: 'Cuadrante 6', casaHabitacion: 21.45, comercio: 41.25, servicios: 50.90, industrias: 70.90, otros: 27.95 },
    { cuadrante: 'Cuadrante 7', casaHabitacion: 19.60, comercio: 37.50, servicios: 47.15, industrias: 67.15, otros: 25.40 },
    { cuadrante: 'Cuadrante 8', casaHabitacion: 17.85, comercio: 34.75, servicios: 43.40, industrias: 63.40, otros: 23.10 },
    { cuadrante: 'Cuadrante 9', casaHabitacion: 23.10, comercio: 42.80, servicios: 52.65, industrias: 72.65, otros: 29.35 },
    { cuadrante: 'Cuadrante 10', casaHabitacion: 20.35, comercio: 39.95, servicios: 49.30, industrias: 69.30, otros: 27.50 },
    { cuadrante: 'Cuadrante 11', casaHabitacion: 18.70, comercio: 36.20, servicios: 45.55, industrias: 65.55, otros: 24.95 },
    { cuadrante: 'Cuadrante 12', casaHabitacion: 16.95, comercio: 33.45, servicios: 41.80, industrias: 61.80, otros: 22.65 }
  ];

  // Handler para cambio de año
  const handleAnioChange = (year: number | '') => {
    setFormData({ ...formData, anio: year });
    setErrors({ ...errors, anio: undefined });
    
    // Validación
    if (year && (year < 1900 || year > new Date().getFullYear())) {
      setErrors({ ...errors, anio: 'Año inválido' });
    }
  };

  // Handler para click en celda de tasa
  const handleTasaClick = (grupoUsoLabel: string, cuadranteNumber: number, tasaValue: number) => {
    // Encontrar el grupo de uso correspondiente
    const grupoSeleccionado = gruposUso.find(gu => gu.label === grupoUsoLabel);
    
    // Encontrar el cuadrante correspondiente (cuadranteNumber es el número real del cuadrante)
    const cuadranteSeleccionado = cuadrantes.find(c => c.id === cuadranteNumber);
    
    // Actualizar los campos del formulario
    setFormData({ ...formData, anio: parseInt(anioConsulta) });
    setGrupoUso(grupoSeleccionado || null);
    setCuadrante(cuadranteSeleccionado || null);
    setTasaNueva(tasaValue.toString());
    
    // Limpiar errores
    setErrors({});
    
    // Scroll hacia arriba para mostrar el formulario de registro
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers para Registro
  const handleRegistroTasa = () => {
    console.log('Registrar Tasa:', {
      anio: formData.anio,
      grupoUso,
      cuadrante,
      tasaNueva
    });
    // Aquí iría la lógica para registrar la tasa
  };

  const handleNuevo = () => {
    setFormData({ anio: new Date().getFullYear() });
    setErrors({});
    setGrupoUso(null);
    setCuadrante(null);
    setTasaNueva('');
  };

  // Handler para Consulta
  const handleBuscar = () => {
    console.log('Buscar tasas del año:', anioConsulta);
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setMostrarTabla(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Sección Registro de Tasas */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
          width:'77%'
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

        {/* Primera fila: Todos los campos */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap'
        }}>
          {/* seleccionar año*/}
          <TextField
            size="small"
            label="Año"
            type="number"
            value={formData.anio || ''}
            onChange={(e) => {
              const newYear = parseInt(e.target.value) || '';
              handleAnioChange(newYear);
            }}
            error={!!errors.anio}
            helperText={errors.anio}
            sx={{ 
              width: '120px' ,
              '& .MuiInputBase-root': {
                height: '38px'
              }
            }}
            InputProps={{
              inputProps: { 
                min: 1900, 
                max: new Date().getFullYear() 
              }
            }}
          />

          {/* seleccionar grupo de uso*/}
          <Autocomplete
            value={grupoUso}
            onChange={(_, newValue) => setGrupoUso(newValue)}
            options={gruposUso}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{ minWidth: 200, flex: 0 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Grupo de Uso"
                placeholder="Seleccione grupo de uso"
              />
            )}
          />

          {/* seleccionar cuadrante*/}
          <Autocomplete
            value={cuadrante}
            onChange={(_, newValue) => setCuadrante(newValue)}
            options={cuadrantes}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{ minWidth: 150, flex: 0 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cuadrante"
                placeholder="Seleccione cuadrante"
              />
            )}
          />

          {/* seleccionar tasa nueva*/}
          <TextField
            label="Tasa Nueva"
            value={tasaNueva}
            onChange={(e) => setTasaNueva(e.target.value)}
            size="small"
            type="number"
            sx={{ 
              width: '150px',
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& .MuiInputBase-root': {
                height: '38px'
              }
            }}
            InputProps={{
              startAdornment: <Box sx={{ mr: 0.5, color: 'text.secondary' }}>S/</Box>
            }}
            placeholder="0.00"
          />
        </Box>

        {/* Segunda fila: Botones alineados a la derecha */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          mt: 2
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleRegistroTasa}
            disabled={!grupoUso || !cuadrante || !tasaNueva || isLoading}
            sx={{
              minWidth: 140,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Registrar Tasa
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
            disabled={isLoading}
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Nuevo
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Seccion Consulta de Tasas */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
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

        {/* Filtro de búsqueda */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 3
        }}>
          {/* seleccionar año*/}
          <TextField
            size="small"
            label="Año"
            type="number"
            value={formData.anio || ''}
            onChange={(e) => {
              const newYear = parseInt(e.target.value) || '';
              handleAnioChange(newYear);
            }}
            error={!!errors.anio}
            helperText={errors.anio}
            sx={{ width: '120px' }}
            InputProps={{
              inputProps: { 
                min: 1900, 
                max: new Date().getFullYear() 
              }
            }}
          />

          {/* boton buscar*/}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleBuscar}
            disabled={!formData.anio || isLoading}
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </Box>

        {/* area para mostrar resultados - TABLA DE TASAS SERENAZGO */}
        {mostrarTabla ? (
          <Box sx={{ mt: 3 }}>
            {/* Header mejorado con chip */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3,
              p: 2,
              backgroundColor: 'primary.main',
              borderRadius: 2,
              color: 'primary.contrastText'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                🚔 Tasas de Serenazgo por Grupo de Uso y Cuadrante
              </Typography>
              <Box sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                Año {anioConsulta}
              </Box>
            </Box>
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                boxShadow: 3,
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.main',
                overflow: 'auto',
                maxHeight: 500,
                maxWidth: '100%',
                '&::-webkit-scrollbar': {
                  width: 8,
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'grey.200',
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'grey.400',
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: 'grey.500',
                  },
                },
              }}
            >
              <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: 'primary.main',
                    '& .MuiTableCell-head': {
                      color: 'primary.contrastText',
                      fontWeight: 700
                    }
                  }}>
                    <TableCell 
                      sx={{ 
                        fontSize: '1rem',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        minWidth: 200,
                        borderRight: '2px solid rgba(255,255,255,0.3)',
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        backgroundColor: 'primary.main'
                      }}
                      rowSpan={2}
                    >
                      🏙️ Zona de Servicios
                    </TableCell>
                    <TableCell 
                      colSpan={5}
                      sx={{ 
                        fontSize: '1rem',
                        textAlign: 'center',
                        borderBottom: '2px solid rgba(255,255,255,0.3)',
                        pb: 1
                      }}
                    >
                      📍 Cuadrantes - Tasa Mensual (S/)
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ 
                    backgroundColor: 'primary.dark',
                    '& .MuiTableCell-head': {
                      color: 'primary.contrastText',
                      fontWeight: 600
                    }
                  }}>
                    {gruposUso.map((grupo, index) => (
                      <TableCell 
                        key={grupo.id}
                        sx={{ 
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          borderRight: index < gruposUso.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          minWidth: 120,
                          py: 1.5
                        }}
                      >
                        🏢 {grupo.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosTasasSerenazgo.map((fila, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(even)': { 
                          backgroundColor: 'grey.50' 
                        },
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          transform: 'scale(1.005)',
                          transition: 'all 0.2s ease-in-out',
                          boxShadow: 1
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          borderRight: '2px solid',
                          borderColor: 'divider',
                          backgroundColor: index % 2 === 0 ? 'grey.100' : 'grey.50',
                          py: 2,
                          cursor: 'default',
                          position: 'sticky',
                          left: 0,
                          zIndex: 1
                        }}
                      >
                        {fila.cuadrante}
                      </TableCell>
                      {[fila.casaHabitacion, fila.comercio, fila.servicios, fila.industrias, fila.otros].map((tasa, grupoIndex) => (
                        <TableCell 
                          key={grupoIndex}
                          sx={{ 
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            borderRight: grupoIndex < 4 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            py: 2,
                            color: tasa ? 'success.main' : 'text.secondary',
                            cursor: tasa ? 'pointer' : 'default'
                          }}
                        >
                          {tasa ? (
                            <Tooltip 
                              title={`Clic para editar: ${fila.cuadrante} - ${gruposUso[grupoIndex].label}`}
                              arrow
                              placement="top"
                            >
                              <Box 
                                onClick={() => handleTasaClick(gruposUso[grupoIndex].label, parseInt(fila.cuadrante.split(' ')[1]), tasa)}
                                sx={{
                                  backgroundColor: 'success.light',
                                  color: 'success.contrastText',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
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
                                S/ {tasa.toFixed(2)}
                              </Box>
                            </Tooltip>
                          ) : (
                            <Box sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic'
                            }}>
                              No aplica
                            </Box>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Información adicional mejorada */}
            <Box sx={{ 
              mt: 3, 
              p: 3, 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'info.main'
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'info.dark',
                  fontWeight: 600,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                🛡️ Información sobre las Tasas de Serenazgo
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'info.dark',
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                Las tasas se calculan mensualmente según el <strong>grupo de uso del predio</strong> y el 
                <strong> cuadrante de seguridad</strong> donde se encuentra ubicado. Los predios comerciales e industriales 
                tienen tasas más altas debido a la mayor necesidad de vigilancia y seguridad.
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'warning.dark',
                  lineHeight: 1.6,
                  fontWeight: 500,
                  backgroundColor: 'rgba(255,193,7,0.1)',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'warning.light'
                }}
              >
                🛡️ <strong>Tip:</strong> Haga clic en cualquier valor de tasa para cargarlo automáticamente 
                en el formulario de <strong>Registro de Tasas</strong> y poder editarlo.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.50',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Cargando datos...' : 'Ingrese un año y haga clic en "Buscar" para ver las tasas de serenazgo'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Serenazgo;