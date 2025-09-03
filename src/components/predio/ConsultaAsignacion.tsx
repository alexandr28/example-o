// src/components/predio/ConsultaAsignacion.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  CircularProgress,
  Fade,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import SelectorContribuyente from '../modal/SelectorContribuyente';
import { NotificationService } from '../utils/Notification';
import { useAsignacion } from '../../hooks/useAsignacion';
import { AsignacionPredio } from '../../services/asignacionService';

interface ConsultaAsignacionData {
  anio: string;
  codigoContribuyente: string;
}

const ConsultaAsignacion: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Hooks personalizados
  const { asignaciones, loading, error, buscarAsignaciones, limpiarError } = useAsignacion();
  
  // Estados locales
  const [filtros, setFiltros] = useState<ConsultaAsignacionData>({
    anio: new Date().getFullYear().toString(),
    codigoContribuyente: ''
  });
  
  const [showContribuyenteModal, setShowContribuyenteModal] = useState(false);

  // Debug: Logging de cambios en asignaciones
  useEffect(() => {
    console.log('🔍 [ConsultaAsignacion] Estado de asignaciones cambió:', asignaciones);
    console.log('🔍 [ConsultaAsignacion] Cantidad de asignaciones:', asignaciones.length);
    console.log('🔍 [ConsultaAsignacion] Loading:', loading);
    console.log('🔍 [ConsultaAsignacion] Error:', error);
  }, [asignaciones, loading, error]);

  // Limpiar error cuando se monta el componente
  useEffect(() => {
    limpiarError();
  }, [limpiarError]);

  // Handlers
  const handleSelectContribuyente = async (contribuyente: any) => {
    console.log('🔍 [ConsultaAsignacion] Contribuyente seleccionado:', contribuyente);
    setFiltros({ ...filtros, codigoContribuyente: contribuyente?.codigo || '' });
    setShowContribuyenteModal(false);
  };

  const realizarBusqueda = async () => {
    const params = {
      anio: filtros.anio ? parseInt(filtros.anio) : undefined,
      codContribuyente: filtros.codigoContribuyente || undefined
    };

    console.log('🔍 [ConsultaAsignacion] Realizando búsqueda con parámetros:', params);

    if (!params.codContribuyente && !params.anio) {
      NotificationService.error('Debe ingresar al menos un año o contribuyente');
      return;
    }

    try {
      await buscarAsignaciones(params);
      
      if (asignaciones.length > 0) {
        NotificationService.success(`Se encontraron ${asignaciones.length} asignaciones`);
      } else {
        NotificationService.info('No se encontraron asignaciones para este contribuyente');
      }
    } catch (err) {
      console.error('❌ [ConsultaAsignacion] Error en búsqueda:', err);
      NotificationService.error('Error al buscar asignaciones');
    }
  };

  const handleBuscar = async () => {
    await realizarBusqueda();
  };

  const handleImprimirPU = () => {
    if (!filtros.codigoContribuyente) {
      NotificationService.error('Debe ingresar un código de contribuyente');
      return;
    }
    NotificationService.success('Generando PU...');
  };

  const handleEditar = (asignacion: AsignacionPredio) => {
    console.log('🔄 [ConsultaAsignacion] Editando asignación:', asignacion);
    
    try {
      // Validar que tenemos los datos necesarios
      if (!asignacion.codPredio || !asignacion.codContribuyente) {
        NotificationService.error('Datos de asignación incompletos para editar');
        return;
      }

      // Preparar los datos para navegación
      const datosAsignacion = {
        codPredio: asignacion.codPredio?.trim(),
        codContribuyente: asignacion.codContribuyente,
        anio: asignacion.anio,
        nombreContribuyente: asignacion.nombreContribuyente,
        fechaDeclaracionStr: asignacion.fechaDeclaracionStr,
        porcentajeCondominio: asignacion.porcentajeCondominio,
        // Datos adicionales para la edición
        codModoDeclaracion: asignacion.codModoDeclaracion,
        fechaVentaStr: asignacion.fechaVentaStr,
        pensionista: asignacion.pensionista,
        codEstado: asignacion.codEstado,
        codUsuario: asignacion.codUsuario
      };

      console.log('📋 [ConsultaAsignacion] Datos preparados para edición:', datosAsignacion);

      // Navegar a la página de edición de asignación pasando los datos completos
      navigate('/predio/asignacion/nuevo', {
        state: {
          editMode: true,
          asignacionData: datosAsignacion,
          fromConsulta: true
        }
      });
      
      NotificationService.success(`Navegando a edición de asignación del predio ${asignacion.codPredio}`);
      
    } catch (error: any) {
      console.error('❌ [ConsultaAsignacion] Error al preparar edición:', error);
      NotificationService.error('Error al preparar la edición de la asignación');
    }
  };


  return (
    <Box sx={{ p: 0 }}>
      {/* Mostrar error si existe */}
      {error && (
        <Alert 
          severity="error" 
          onClose={limpiarError}
          icon={<ErrorIcon />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={500}>
            Error al cargar asignaciones: {error}
          </Typography>
        </Alert>
      )}

      {/* Header Principal Mejorado */}
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        <Box sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          p: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <AssignmentIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Consulta de Asignaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PU - Contribuyente y Predios Asignados
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Sección de Búsqueda Mejorada */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <SearchIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Buscar Contribuyente y Predio
            </Typography>
          </Box>
          {/* Formulario de Búsqueda con mejor layout */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2, 
            alignItems: { xs: 'stretch', md: 'flex-end' },
            mb: 3,
            p: 2,
            bgcolor: alpha(theme.palette.grey[50], 0.5),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
          }}>
            {/* Código Predio */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 180px' },
              minWidth: { xs: '100%', md: '180px' }
            }}>
              <TextField
                fullWidth
                size="small"
                label="Año"
                type="number"
                value={filtros.anio}
                onChange={(e) => setFiltros({
                  ...filtros,
                  anio: e.target.value
                })}
                InputProps={{
                  startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />,
                  inputProps: { 
                    min: 1900, 
                    max: new Date().getFullYear() + 10 
                  }
                }}
                placeholder={`Ej: ${new Date().getFullYear()}`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />
            </Box>
            
            {/* Código Contribuyente */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 180px' },
              minWidth: { xs: '100%', md: '180px' }
            }}>
              <TextField
                fullWidth
                size="small"
                label="Código Contribuyente"
                value={filtros.codigoContribuyente}
                onChange={(e) => setFiltros({
                  ...filtros,
                  codigoContribuyente: e.target.value
                })}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                placeholder="Ej: 43906"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />
            </Box>
            
          

            {/* Botón Buscar */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 120px' },
              minWidth: { xs: '100%', md: '120px' }
            }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleBuscar}
                disabled={loading || (!filtros.anio && !filtros.codigoContribuyente)}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{ 
                  height: 40,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />
        </Box>
      </Paper>

      {/* Tabla de asignaciones mejorada */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          mb: 3
        }}
      >
        {/* Header de la tabla */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HomeIcon />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Predios Asignados
              </Typography>
            </Box>
            
            <Chip
              label={`${asignaciones.length} asignaciones`}
              color="primary"
              variant="filled"
              size="small"
              sx={{ fontWeight: 600 }}
            />
        </Box>

        <TableContainer sx={{ 
          maxHeight: 400,
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: alpha(theme.palette.grey[100], 0.5),
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 2,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.5),
            }
          },
        }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon fontSize="small" />
                      CÓDIGO PREDIO
                    </Box>
                  </TableCell>
                  <TableCell sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      NOMBRE CONTRIBUYENTE
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 2
                  }}>
                    F. DECLARACIÓN
                  </TableCell>
                  <TableCell align="center" sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 2
                  }}>
                    % CONDOMINIO
                  </TableCell>
                    <TableCell align="center" sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      py: 2
                    }}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Stack alignItems="center" spacing={3}>
                          <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            <SearchIcon sx={{ 
                              fontSize: 64, 
                              color: alpha(theme.palette.primary.main, 0.4)
                            }} />
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {(filtros.codigoContribuyente || filtros.anio)
                                ? 'No se encontraron asignaciones'
                                : 'Ingrese criterios de búsqueda'
                              }
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                              {(filtros.codigoContribuyente || filtros.anio)
                                ? 'No hay predios asignados con los criterios especificados'
                                : 'Ingrese un año o contribuyente para buscar asignaciones'
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    asignaciones.map((asignacion, index) => (
                      <Fade in={true} key={index} timeout={300 + (index * 100)}>
                        <TableRow
                          hover
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              transform: 'translateY(-1px)',
                              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: alpha(theme.palette.grey[50], 0.3),
                            }
                          }}
                        >
                          {/* Código Predio */}
                          <TableCell sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                icon={<HomeIcon fontSize="small" />}
                                label={asignacion.codPredio}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                                }}
                              />
                            </Box>
                          </TableCell>
                          
                          {/* Nombre Contribuyente */}
                          <TableCell sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle',
                            maxWidth: '250px'
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {asignacion.nombreContribuyente || 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* Fecha Declaración */}
                          <TableCell align="center" sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {asignacion.fechaDeclaracionStr || 'N/A'}
                            </Typography>
                          </TableCell>
                          
                          {/* % Condominio */}
                          <TableCell align="center" sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Chip
                              label={`${asignacion.porcentajeCondominio}%`}
                              size="small"
                              variant="filled"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip 
                                title={`Editar asignación del predio ${asignacion.codPredio}`} 
                                arrow
                                placement="top"
                              >
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditar(asignacion)}
                                  disabled={loading}
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.16),
                                      transform: 'scale(1.1)',
                                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                      borderColor: theme.palette.primary.main,
                                    },
                                    '&:active': {
                                      transform: 'scale(1.05)',
                                    },
                                    '&:disabled': {
                                      bgcolor: alpha(theme.palette.grey[400], 0.1),
                                      color: theme.palette.grey[400],
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                    minWidth: '32px',
                                    minHeight: '32px'
                                  }}
                                >
                                  <EditIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      color: loading ? theme.palette.grey[400] : theme.palette.primary.main,
                                      transition: 'color 0.2s ease-in-out'
                                    }} 
                                  />
                                </IconButton>
                              </Tooltip>
                              
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Botón Imprimir PU mejorado */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handleImprimirPU}
                disabled={!filtros.codigoContribuyente || asignaciones.length === 0}
                sx={{ 
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: theme.shadows[3],
                  '&:hover': { 
                    bgcolor: theme.palette.success.dark,
                    boxShadow: theme.shadows[6],
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    bgcolor: alpha(theme.palette.grey[400], 0.6),
                    color: alpha(theme.palette.common.white, 0.6)
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Imprimir PU
              </Button>
            </Box>
      </Paper>

      {/* Información adicional */}
      <Box sx={{ 
        mt: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.grey[50], 0.8),
        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          Total de asignaciones encontradas: {asignaciones.length}
        </Typography>
        {asignaciones.length > 0 && (
          <Chip
            label="Datos actualizados"
            color="success"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>

      {/* Modal Selector de Contribuyente */}
      <SelectorContribuyente
        isOpen={showContribuyenteModal}
        onClose={() => setShowContribuyenteModal(false)}
        onSelectContribuyente={handleSelectContribuyente}
        title="Seleccionar contribuyente"
      />
    </Box>
  );
};

export default ConsultaAsignacion;