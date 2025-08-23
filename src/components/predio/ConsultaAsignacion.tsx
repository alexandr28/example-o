// src/components/predio/ConsultaAsignacion.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
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
  Autocomplete,
  Divider,
  CircularProgress,
  Fade,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  CheckCircle as ActiveIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import SelectorContribuyente from '../modal/SelectorContribuyente';
import { NotificationService } from '../utils/Notification';
import { useAnioOptions } from '../../hooks/useConstantesOptions';
import { useAsignacion } from '../../hooks/useAsignacion';
import { AsignacionPredio } from '../../services/asignacionService';

interface ConsultaAsignacionData {
  año: number;
  contribuyente: any;
}

const ConsultaAsignacion: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  // Hooks personalizados
  const { options: aniosOptions } = useAnioOptions(2020);
  const { asignaciones, loading, error, buscarAsignaciones, limpiarAsignaciones, limpiarError } = useAsignacion();
  
  // Estados locales
  const [filtros, setFiltros] = useState<ConsultaAsignacionData>({
    año: currentYear,
    contribuyente: null
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
    setFiltros({ ...filtros, contribuyente });
    setShowContribuyenteModal(false);
    
    // Buscar asignaciones automáticamente al seleccionar contribuyente
    if (contribuyente?.codigo) {
      await realizarBusqueda(contribuyente.codigo, filtros.año);
    }
  };

  const realizarBusqueda = async (codContribuyente?: string, anio?: number) => {
    const params = {
      codContribuyente: codContribuyente || filtros.contribuyente?.codigo,
      anio: anio || filtros.año
    };

    console.log('🔍 [ConsultaAsignacion] Realizando búsqueda con parámetros:', params);

    if (!params.codContribuyente) {
      NotificationService.error('Debe seleccionar un contribuyente');
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
    if (!filtros.contribuyente) {
      NotificationService.error('Debe seleccionar un contribuyente');
      return;
    }
    NotificationService.success('Generando PU...');
  };

  const handleEditar = (asignacion: AsignacionPredio) => {
    console.log('Editar asignación:', asignacion);
    NotificationService.info('Función de edición pendiente');
  };

  const handleEliminar = (asignacion: AsignacionPredio) => {
    console.log('Eliminar asignación:', asignacion);
    NotificationService.info('Función de eliminación pendiente');
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
            {/* Año */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 100px' },
              minWidth: { xs: '100%', md: '100px' }
            }}>
              <Autocomplete
                options={aniosOptions}
                getOptionLabel={(option) => option?.label || ''}
                value={aniosOptions.find(opt => opt.value === filtros.año.toString()) || null}
                onChange={(_, newValue) => setFiltros({
                  ...filtros,
                  año: parseInt(newValue?.value?.toString() || currentYear.toString())
                })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Año"
                    placeholder="Seleccione"
                  />
                )}
                fullWidth
                size="small"
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
            
            {/* Botón Contribuyente */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 100px' },
              minWidth: { xs: '100%', md: '100px' }
            }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowContribuyenteModal(true)}
                startIcon={<PersonIcon />}
                sx={{ 
                  height: 40,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                Contribuyente
              </Button>
            </Box>
            
            {/* Código */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 100px' },
              minWidth: { xs: '100%', md: '100px' }
            }}>
              <TextField
                fullWidth
                size="small"
                label="Código"
                value={filtros.contribuyente?.codigo || ''}
                InputProps={{ 
                  readOnly: true,
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                  }
                }}
              />
            </Box>
            
            {/* Nombre del contribuyente */}
            <Box sx={{ 
              flex: { xs: '0 0 100%', md: '0 0 280px' },
              minWidth: { xs: '100%', md: '280px' }
            }}>
              <TextField
                fullWidth
                size="small"
                label="Nombre del contribuyente"
                value={filtros.contribuyente?.contribuyente || ''}
                InputProps={{ 
                  readOnly: true,
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                  }
                }}
              />
            </Box>

            {/* Botón Buscar */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 100px' },
              minWidth: { xs: '100%', md: '100px' }
            }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleBuscar}
                disabled={loading || !filtros.contribuyente}
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
                      <LocationIcon fontSize="small" />
                      DIRECCIÓN
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
                        <ActiveIcon fontSize="small" />
                        ESTADO
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
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
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
                              {filtros.contribuyente 
                                ? 'No se encontraron asignaciones'
                                : 'Seleccione un contribuyente'
                              }
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                              {filtros.contribuyente 
                                ? 'Este contribuyente no tiene predios asignados'
                                : 'Seleccione un contribuyente para ver sus asignaciones de predios'
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
                          <TableCell sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.43 }}>
                                {asignacion.direccionPredio || 'Sin dirección'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Chip 
                              icon={<ActiveIcon fontSize="small" />}
                              label={asignacion.estado} 
                              color={asignacion.estado === 'Activo' ? 'success' : 'warning'} 
                              size="small" 
                              variant="filled"
                              sx={{
                                fontWeight: 500,
                                bgcolor: asignacion.estado === 'Activo' 
                                  ? alpha(theme.palette.success.main, 0.1) 
                                  : alpha(theme.palette.warning.main, 0.1),
                                color: asignacion.estado === 'Activo' 
                                  ? theme.palette.success.main 
                                  : theme.palette.warning.main
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 2,
                            verticalAlign: 'middle'
                          }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Editar asignación" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditar(asignacion)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.16),
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                >
                                  <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
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
                disabled={!filtros.contribuyente || asignaciones.length === 0}
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