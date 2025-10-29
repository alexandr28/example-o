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
import { useParquesJardines } from '../../hooks/useParquesJardines';

interface UbicacionOption {
  id: number;
  label: string;
}

interface RutaOption {
  id: number;
  label: string;
}

interface TasaMensualData {
  ubicacion: string;
  ruta1: number | '';
  ruta2: number | '';
  ruta3: number | '';
  ruta4: number | '';
  ruta5: number | '';
  ruta6: number | '';
}

const ParquesJardines: React.FC = () => {
  // Hook de parques y jardines
  const {
    parquesJardines,
    loading: loadingParques,
    listarParquesJardines,
    crearParquesJardines,
    actualizarParquesJardines
  } = useParquesJardines();

  // Estados para Registro de Tasas
  const [anioRegistro, setAnioRegistro] = useState<string>(new Date().getFullYear().toString());
  const [ubicacion, setUbicacion] = useState<UbicacionOption | null>(null);
  const [ruta, setRuta] = useState<RutaOption | null>(null);
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
  const ubicaciones: UbicacionOption[] = [
    { id: 1, label: 'Frente a Parque' },
    { id: 2, label: 'Frente a área verdes' },
    { id: 3, label: 'Cerca de área verde' },
    { id: 4, label: 'Lejos de áreas verdes' },
  ];

  const rutas: RutaOption[] = [
    { id: 1, label: 'Ruta 01 ' },
    { id: 2, label: 'Ruta 02 ' },
    { id: 3, label: 'Ruta 03 ' },
    { id: 4, label: 'Ruta 04 ' },
    { id: 5, label: 'Ruta 05 ' },
    { id: 6, label: 'Ruta 06 ' },
  ];

  // Transformar datos del hook al formato de la tabla
  const datosTasasMensuales: TasaMensualData[] = React.useMemo(() => {
    console.log('[ParquesJardines] Transformando datos, total registros:', parquesJardines.length);

    if (parquesJardines.length > 0) {
      console.log('[ParquesJardines] Ejemplo de registro:', parquesJardines[0]);
    }

    // Obtener todas las ubicaciones únicas del API
    const ubicacionesUnicas = [...new Set(
      parquesJardines
        .map(pj => pj.ubicacionAreaVerde)
        .filter((ub): ub is string => ub !== null && ub !== undefined && ub.trim() !== '')
    )];

    console.log('[ParquesJardines] Ubicaciones únicas encontradas:', ubicacionesUnicas);

    // Si no hay datos, usar las ubicaciones hardcodeadas para mostrar la estructura vacía
    const ubicacionesAMostrar: string[] = ubicacionesUnicas.length > 0
      ? ubicacionesUnicas
      : ubicaciones.map(u => u.label);

    return ubicacionesAMostrar.map(ubicacionNombre => {
      // Para cada ubicación, buscar las tasas de cada ruta
      const fila: TasaMensualData = {
        ubicacion: ubicacionNombre,
        ruta1: '',
        ruta2: '',
        ruta3: '',
        ruta4: '',
        ruta5: '',
        ruta6: ''
      };

      // Buscar todos los registros de esta ubicación - comparar por nombre normalizado
      const registrosUbicacion = parquesJardines.filter(pj => {
        const ubicacionAPI = (pj.ubicacionAreaVerde || '').toLowerCase().trim();
        const ubicacionLocal = ubicacionNombre.toLowerCase().trim();
        return ubicacionAPI === ubicacionLocal;
      });

      console.log(`[ParquesJardines] ${ubicacionNombre}: encontrados ${registrosUbicacion.length} registros`);
      if (registrosUbicacion.length > 0) {
        console.log(`[ParquesJardines] Registros para ${ubicacionNombre}:`, registrosUbicacion);
      }

      // Mapear cada registro a la ruta correspondiente - comparar por nombre de ruta
      registrosUbicacion.forEach(registro => {
        const tasa = registro.tasaMensual;
        const nombreRuta = (registro.nombreRuta || '').toUpperCase().trim();

        console.log(`[ParquesJardines] Procesando: ubicacion=${registro.ubicacionAreaVerde}, ruta=${nombreRuta}, tasa=${tasa}`);

        // Extraer el número de la ruta desde el nombre (ej: "RUTA 1" -> 1)
        const match = nombreRuta.match(/RUTA\s*(\d+)/);
        if (match) {
          const numeroRuta = parseInt(match[1]);
          console.log(`[ParquesJardines] Número de ruta extraído: ${numeroRuta}`);

          if (numeroRuta === 1) {
            fila.ruta1 = tasa;
          } else if (numeroRuta === 2) {
            fila.ruta2 = tasa;
          } else if (numeroRuta === 3) {
            fila.ruta3 = tasa;
          } else if (numeroRuta === 4) {
            fila.ruta4 = tasa;
          } else if (numeroRuta === 5) {
            fila.ruta5 = tasa;
          } else if (numeroRuta === 6) {
            fila.ruta6 = tasa;
          }
        } else {
          console.log(`[ParquesJardines] ⚠️ No se pudo extraer número de ruta de: "${nombreRuta}"`);
        }
      });

      console.log(`[ParquesJardines] Fila resultante para ${ubicacionNombre}:`, fila);
      return fila;
    });
  }, [parquesJardines]);

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
  const handleTasaClick = (ubicacionLabel: string, rutaIndex: number, tasaValue: number) => {
    // Encontrar la ubicación correspondiente
    const ubicacionSeleccionada = ubicaciones.find(ub => ub.label === ubicacionLabel);
    
    // Encontrar la ruta correspondiente (rutaIndex + 1 porque el array empieza en 0 pero las rutas en 1)
    const rutaSeleccionada = rutas.find(r => r.id === rutaIndex + 1);
    
    // Actualizar los campos del formulario
    setFormData({ ...formData, anio: parseInt(anioConsulta) });
    setUbicacion(ubicacionSeleccionada || null);
    setRuta(rutaSeleccionada || null);
    setTasaNueva(tasaValue.toString());
    
    // Limpiar errores
    setErrors({});
    
    // Scroll hacia arriba para mostrar el formulario de registro
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers para Registro
  const handleRegistroTasa = async () => {
    if (!formData.anio || !ubicacion || !ruta || !tasaNueva) {
      console.warn('[ParquesJardines] Faltan datos requeridos');
      return;
    }

    try {
      const datos = {
        anio: Number(formData.anio),
        codRuta: ruta.id,
        codUbicacion: ubicacion.id,
        tasaMensual: parseFloat(tasaNueva)
      };

      console.log('[ParquesJardines] Registrando tasa con datos:', datos);

      // Verificar si ya existe un registro con esa combinación
      const existente = parquesJardines.find(
        pj => pj.anio === datos.anio &&
              pj.codRuta === datos.codRuta &&
              pj.codUbicacion === datos.codUbicacion
      );

      if (existente) {
        console.log('[ParquesJardines] Actualizando registro existente');
        await actualizarParquesJardines(datos);
      } else {
        console.log('[ParquesJardines] Creando nuevo registro');
        await crearParquesJardines(datos);
      }

      // Limpiar formulario
      handleNuevo();

      // Recargar datos
      await listarParquesJardines({ anio: datos.anio });
      setMostrarTabla(true);

    } catch (error) {
      console.error('[ParquesJardines] Error registrando tasa:', error);
    }
  };

  const handleNuevo = () => {
    setAnioRegistro(new Date().getFullYear().toString());
    setFormData({ anio: new Date().getFullYear() });
    setErrors({});
    setUbicacion(null);
    setRuta(null);
    setTasaNueva('');
  };

  // Handler para Consulta
  const handleBuscar = async () => {
    try {
      setIsLoading(true);
      console.log('[ParquesJardines] Buscando tasas del año:', anioConsulta);
      await listarParquesJardines({ anio: parseInt(anioConsulta) });
      setMostrarTabla(true);
    } catch (error) {
      console.error('[ParquesJardines] Error buscando tasas:', error);
    } finally {
      setIsLoading(false);
    }
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
          width:'74%'
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
        {/* seleccionar ruta*/}
          <Autocomplete
            value={ruta}
            onChange={(_, newValue) => setRuta(newValue)}
            options={rutas}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{ minWidth: 140, flex: 0 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ruta"
                placeholder="Seleccione ruta"
              />
            )}
          />
        {/* seleccionar ubicacion*/}
          <Autocomplete
            value={ubicacion}
            onChange={(_, newValue) => setUbicacion(newValue)}
            options={ubicaciones}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{ minWidth: 190, flex: 0 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ubicación"
                placeholder="Seleccione ubicación"
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
                height: '37px'
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
            disabled={!ubicacion || !ruta || !tasaNueva || isLoading}
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

      {/* Sección Consulta de Tasas */}
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
            value={anioConsulta || ''}
            onChange={(e) => {
              setAnioConsulta(e.target.value);
            }}
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
            disabled={!anioConsulta || isLoading}
            sx={{
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </Box>

        {/* Área para mostrar resultados - TABLA DE TASAS MENSUALES */}
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
                🌳 Tasas Mensuales por Ubicación y Ruta
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
                      📍 Ubicación
                    </TableCell>
                    <TableCell 
                      colSpan={6}
                      sx={{ 
                        fontSize: '1rem',
                        textAlign: 'center',
                        borderBottom: '2px solid rgba(255,255,255,0.3)',
                        pb: 1
                      }}
                    >
                      💰 Tasa Mensual (S/)
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ 
                    backgroundColor: 'primary.dark',
                    '& .MuiTableCell-head': {
                      color: 'primary.contrastText',
                      fontWeight: 600
                    }
                  }}>
                    {[1, 2, 3, 4, 5, 6].map((ruta) => (
                      <TableCell 
                        key={ruta}
                        sx={{ 
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          borderRight: ruta < 6 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          minWidth: 100,
                          py: 1.5
                        }}
                      >
                        🚛 Ruta {ruta}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosTasasMensuales.map((fila, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:nth-of-type(even)': {
                          backgroundColor: 'grey.50'
                        }
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
                        {fila.ubicacion}
                      </TableCell>
                      {[fila.ruta1, fila.ruta2, fila.ruta3, fila.ruta4, fila.ruta5, fila.ruta6].map((tasa, rutaIndex) => (
                        <TableCell 
                          key={rutaIndex}
                          sx={{
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            borderRight: rutaIndex < 5 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            py: 2,
                            color: typeof tasa === 'number' ? 'success.main' : 'text.secondary',
                            cursor: typeof tasa === 'number' ? 'pointer' : 'default'
                          }}
                        >
                          {typeof tasa === 'number' ? (
                            <Tooltip
                              title={`Clic para editar: ${fila.ubicacion} - Ruta ${rutaIndex + 1}`}
                              arrow
                              placement="top"
                            >
                              <Box
                                onClick={() => handleTasaClick(fila.ubicacion, rutaIndex, tasa)}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 0.5,
                                  backgroundColor: 'success.light',
                                  color: 'success.contrastText',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 1,
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  width: '100%',
                                  minHeight: '60px',
                                  '&:hover': {
                                    backgroundColor: 'success.main',
                                    transform: 'scale(1.02)',
                                    boxShadow: 2
                                  },
                                  '&:active': {
                                    transform: 'scale(0.98)'
                                  }
                                }}
                              >
                                <Box>Mensual: S/ {tasa.toFixed(2)}</Box>
                                <Box sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  opacity: 0.9,
                                  borderTop: '1px solid rgba(255,255,255,0.3)',
                                  pt: 0.3,
                                  width: '100%',
                                  textAlign: 'center'
                                }}>
                                  Anual: S/ {(tasa * 12).toFixed(2)}
                                </Box>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Box sx={{
                              color: 'text.secondary',
                              fontStyle: 'italic',
                              py: 2
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
                📊 Información sobre las Tasas
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'info.dark',
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                Las tasas se calculan mensualmente según la <strong>ubicación del predio</strong> respecto a las áreas verdes 
                y la <strong>ruta de servicio</strong> asignada. Los predios más cercanos a parques y áreas verdes tienen 
                tasas más altas debido al mayor beneficio que reciben del servicio de mantenimiento.
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
                💡 <strong>Tip:</strong> Haga clic en cualquier valor de tasa para cargarlo automáticamente 
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
              {isLoading ? 'Cargando datos...' : 'Ingrese un año y haga clic en "Buscar" para ver las tasas mensuales'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ParquesJardines;