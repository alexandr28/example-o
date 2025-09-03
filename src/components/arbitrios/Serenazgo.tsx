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
  grupoUso: string;
  cuadrante1: number | '';
  cuadrante2: number | '';
  cuadrante3: number | '';
  cuadrante4: number | '';
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
  const gruposUso: GrupoUsoOption[] = [
    { id: 1, label: 'Vivienda' },
    { id: 2, label: 'Comercial' },
    { id: 3, label: 'Industrial' },
    { id: 4, label: 'Institucional' },
    { id: 5, label: 'Otros Usos' },
  ];

  const cuadrantes: CuadranteOption[] = [
    { id: 1, label: 'Cuadrante 1 - Centro' },
    { id: 2, label: 'Cuadrante 2 - Norte' },
    { id: 3, label: 'Cuadrante 3 - Sur' },
    { id: 4, label: 'Cuadrante 4 - Periferia' },
  ];

  // Datos de ejemplo para la tabla de tasas de serenazgo
  const datosTasasSerenazgo: TasaSerenazgoData[] = [
    {
      grupoUso: 'Vivienda',
      cuadrante1: 25.50,
      cuadrante2: 22.75,
      cuadrante3: 20.30,
      cuadrante4: 18.80
    },
    {
      grupoUso: 'Comercial',
      cuadrante1: 45.30,
      cuadrante2: 42.60,
      cuadrante3: 38.85,
      cuadrante4: 35.90
    },
    {
      grupoUso: 'Industrial',
      cuadrante1: 65.75,
      cuadrante2: 62.40,
      cuadrante3: 58.60,
      cuadrante4: 54.85
    },
    {
      grupoUso: 'Institucional',
      cuadrante1: 35.50,
      cuadrante2: 32.80,
      cuadrante3: 29.20,
      cuadrante4: 26.15
    },
    {
      grupoUso: 'Otros Usos',
      cuadrante1: 30.25,
      cuadrante2: 28.45,
      cuadrante3: 25.95,
      cuadrante4: 23.60
    }
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
  const handleTasaClick = (grupoUsoLabel: string, cuadranteIndex: number, tasaValue: number) => {
    // Encontrar el grupo de uso correspondiente
    const grupoSeleccionado = gruposUso.find(gu => gu.label === grupoUsoLabel);
    
    // Encontrar el cuadrante correspondiente (cuadranteIndex + 1 porque el array empieza en 0 pero los cuadrantes en 1)
    const cuadranteSeleccionado = cuadrantes.find(c => c.id === cuadranteIndex + 1);
    
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
    // Aqu� ir�a la l�gica para registrar la tasa
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
      {/* Secci�n Registro de Tasas */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          mb: 3,
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
            sx={{ width: '120px' }}
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
            sx={{ minWidth: 200, flex: 1 }}
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
            sx={{ minWidth: 250, flex: 1 }}
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

      {/* Secci�n Consulta de Tasas */}
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

        {/* Filtro de b�squeda */}
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

        {/* �rea para mostrar resultados - TABLA DE TASAS SERENAZGO */}
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
                overflow: 'hidden'
              }}
            >
              <Table sx={{ minWidth: 650 }}>
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
                        borderRight: '2px solid rgba(255,255,255,0.3)'
                      }}
                      rowSpan={2}
                    >
                      🏢 Grupo de Uso
                    </TableCell>
                    <TableCell 
                      colSpan={4}
                      sx={{ 
                        fontSize: '1rem',
                        textAlign: 'center',
                        borderBottom: '2px solid rgba(255,255,255,0.3)',
                        pb: 1
                      }}
                    >
                      🛡️ Tasa Mensual (S/)
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ 
                    backgroundColor: 'primary.dark',
                    '& .MuiTableCell-head': {
                      color: 'primary.contrastText',
                      fontWeight: 600
                    }
                  }}>
                    {[1, 2, 3, 4].map((cuadrante) => (
                      <TableCell 
                        key={cuadrante}
                        sx={{ 
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          borderRight: cuadrante < 4 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          minWidth: 120,
                          py: 1.5
                        }}
                      >
                        🛡️ Cuadrante {cuadrante}
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
                          py: 2
                        }}
                      >
                        {fila.grupoUso}
                      </TableCell>
                      {[fila.cuadrante1, fila.cuadrante2, fila.cuadrante3, fila.cuadrante4].map((tasa, cuadranteIndex) => (
                        <TableCell 
                          key={cuadranteIndex}
                          sx={{ 
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            borderRight: cuadranteIndex < 3 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            py: 2,
                            color: tasa ? 'success.main' : 'text.secondary',
                            cursor: tasa ? 'pointer' : 'default'
                          }}
                        >
                          {tasa ? (
                            <Tooltip 
                              title={`Clic para editar: ${fila.grupoUso} - Cuadrante ${cuadranteIndex + 1}`}
                              arrow
                              placement="top"
                            >
                              <Box 
                                onClick={() => handleTasaClick(fila.grupoUso, cuadranteIndex, tasa)}
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

            {/* Informaci�n adicional mejorada */}
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
                🛡️ Informaci�n sobre las Tasas de Serenazgo
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