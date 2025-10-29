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
import { useSerenazgo } from '../../hooks/useSerenazgo';

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
  // Hook de serenazgo
  const {
    serenazgos,
    loading: loadingSerenazgo,
    listarSerenazgo,
    crearSerenazgo,
    actualizarSerenazgo
  } = useSerenazgo();

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

  // Transformar datos del hook al formato de la tabla
  const datosTasasSerenazgo: TasaSerenazgoData[] = React.useMemo(() => {
    console.log('[Serenazgo] Transformando datos, total registros:', serenazgos.length);

    if (serenazgos.length > 0) {
      console.log('[Serenazgo] Ejemplo de registro:', serenazgos[0]);
    }

    return cuadrantes.map(cuad => {
      // Para cada cuadrante, buscar las tasas de cada grupo de uso
      const fila: TasaSerenazgoData = {
        cuadrante: cuad.label,
        casaHabitacion: '',
        comercio: '',
        servicios: '',
        industrias: '',
        otros: ''
      };

      // Buscar todos los registros de este cuadrante - comparar por nombre o por ID
      const registrosCuadrante = serenazgos.filter(s =>
        s.nombreCuadrante === cuad.label || s.codCuadrante === cuad.id
      );

      console.log(`[Serenazgo] ${cuad.label}: encontrados ${registrosCuadrante.length} registros`);
      if (registrosCuadrante.length > 0) {
        console.log(`[Serenazgo] Registros encontrados:`, registrosCuadrante);
      }

      // Mapear cada registro al campo correspondiente según el nombre del grupo
      registrosCuadrante.forEach(registro => {
        const grupoNombre = registro.grupoUso?.toLowerCase() || '';
        const tasa = registro.tasaMensual;

        console.log(`[Serenazgo] Procesando: cuadrante=${registro.nombreCuadrante}, grupo=${registro.grupoUso}, tasa=${tasa}`);

        if (grupoNombre.includes('casa') || grupoNombre.includes('habitacion') || grupoNombre.includes('habitación')) {
          fila.casaHabitacion = tasa;
          console.log(`[Serenazgo] ✓ Asignado a casaHabitacion:`, tasa);
        } else if (grupoNombre.includes('comercio')) {
          fila.comercio = tasa;
          console.log(`[Serenazgo] ✓ Asignado a comercio:`, tasa);
        } else if (grupoNombre.includes('servicio')) {
          fila.servicios = tasa;
          console.log(`[Serenazgo] ✓ Asignado a servicios:`, tasa);
        } else if (grupoNombre.includes('industria')) {
          fila.industrias = tasa;
          console.log(`[Serenazgo] ✓ Asignado a industrias:`, tasa);
        } else if (grupoNombre.includes('otro')) {
          fila.otros = tasa;
          console.log(`[Serenazgo] ✓ Asignado a otros:`, tasa);
        } else {
          console.log(`[Serenazgo] ✗ No se pudo clasificar grupo: "${registro.grupoUso}"`);
        }
      });

      console.log(`[Serenazgo] Fila resultante para ${cuad.label}:`, fila);
      return fila;
    });
  }, [serenazgos]);

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
  const handleRegistroTasa = async () => {
    if (!formData.anio || !grupoUso || !cuadrante || !tasaNueva) {
      console.warn('[Serenazgo] Faltan datos requeridos');
      return;
    }

    try {
      const datos = {
        anio: Number(formData.anio),
        codGrupoUso: grupoUso.id,
        codCuadrante: cuadrante.id,
        tasaMensual: parseFloat(tasaNueva)
      };

      console.log('[Serenazgo] Registrando tasa con datos:', datos);

      // Verificar si ya existe un registro con esa combinación
      const existente = serenazgos.find(
        s => s.anio === datos.anio &&
             s.codGrupoUso === datos.codGrupoUso &&
             s.codCuadrante === datos.codCuadrante
      );

      if (existente) {
        console.log('[Serenazgo] Actualizando registro existente');
        await actualizarSerenazgo(datos);
      } else {
        console.log('[Serenazgo] Creando nuevo registro');
        await crearSerenazgo(datos);
      }

      // Limpiar formulario
      handleNuevo();

      // Recargar datos
      await listarSerenazgo({ anio: datos.anio });
      setMostrarTabla(true);

    } catch (error) {
      console.error('[Serenazgo] Error registrando tasa:', error);
    }
  };

  const handleNuevo = () => {
    setFormData({ anio: new Date().getFullYear() });
    setErrors({});
    setGrupoUso(null);
    setCuadrante(null);
    setTasaNueva('');
  };

  // Handler para Consulta
  const handleBuscar = async () => {
    try {
      setIsLoading(true);
      console.log('[Serenazgo] Buscando tasas del año:', anioConsulta);
      await listarSerenazgo({ anio: parseInt(anioConsulta) });
      setMostrarTabla(true);
    } catch (error) {
      console.error('[Serenazgo] Error buscando tasas:', error);
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
            {/* Tabla de tasas de serenazgo */}
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
                            color: typeof tasa === 'number' ? 'success.main' : 'text.secondary',
                            cursor: typeof tasa === 'number' ? 'pointer' : 'default'
                          }}
                        >
                          {typeof tasa === 'number' ? (
                            <Tooltip
                              title={`Clic para editar: ${fila.cuadrante} - ${gruposUso[grupoIndex].label}`}
                              arrow
                              placement="top"
                            >
                              <Box
                                onClick={() => handleTasaClick(gruposUso[grupoIndex].label, parseInt(fila.cuadrante.split(' ')[1]), tasa)}
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