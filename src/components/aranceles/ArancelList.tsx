// src/components/aranceles/ListaArancelesPorDireccion.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Skeleton,
  Stack,
  InputAdornment,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAranceles } from '../../hooks/useAranceles';
import { formatCurrency } from '../../utils/formatters';
import { ArancelData } from '../../services/arancelService';
import arancelService from '../../services/arancelService';
import { NotificationService } from '../utils/Notification';

interface ListaArancelesPorDireccionProps {
  onSelectArancel?: (arancel: ArancelData) => void;
  selectedArancelId?: number | null;
  selectionMode?: boolean;
  initialSearchParams?: { anio: number; codDireccion: number } | null;
  onEditArancel?: (arancel: ArancelData) => void;
  useGeneralApi?: boolean; // Nueva prop para usar la API general
}

export const ListaArancelesPorDireccion: React.FC<ListaArancelesPorDireccionProps> = ({
  onSelectArancel,
  selectedArancelId,
  selectionMode = false,
  initialSearchParams,
  onEditArancel,
  useGeneralApi = false
}) => {
  // Estados
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(new Date().getFullYear());
  const [codDireccionBusqueda, setCodDireccionBusqueda] = useState<number | null>(null);
  const [parametroBusqueda, setParametroBusqueda] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [arancelToDelete, setArancelToDelete] = useState<ArancelData | null>(null);

  // Estados para manejar la búsqueda específica
  const [arancelesEncontrados, setArancelesEncontrados] = useState<ArancelData[]>([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  
  // Hook con nuevos métodos para la API general
  const { eliminarArancel } = useAranceles();


  // Función para realizar búsqueda por código de dirección usando GET API (legacy)
  const buscarPorCodDireccion = useCallback(async () => {
    if (anioSeleccionado && codDireccionBusqueda) {
      try {
        setLoadingBusqueda(true);
        console.log(`🔄 [ListaArancelesPorDireccion] Buscando arancel específico:`);
        console.log(`📡 [ListaArancelesPorDireccion] API GET: http://26.161.18.122:8085/api/arancel?codDireccion=${codDireccionBusqueda}&anio=${anioSeleccionado}&parametroBusqueda=a&codUsuario=1`);
        
        // Usar arancelService directamente con parámetros
        const resultados = await arancelService.listarAranceles({
          anio: anioSeleccionado,
          codDireccion: codDireccionBusqueda,
          codUsuario: 1,
          parametroBusqueda: 'a'
        });
        
        console.log('✅ [ListaArancelesPorDireccion] Resultados encontrados:', resultados);
        setArancelesEncontrados(resultados);
        
      } catch (error) {
        console.error('❌ [ListaArancelesPorDireccion] Error en búsqueda:', error);
        setArancelesEncontrados([]);
        NotificationService.error('Error al buscar aranceles');
      } finally {
        setLoadingBusqueda(false);
      }
    }
  }, [anioSeleccionado, codDireccionBusqueda]);

  // Función para realizar búsqueda usando la nueva API general
  const buscarConApiGeneral = useCallback(async () => {
    try {
      setLoadingBusqueda(true);
      console.log('🔄 [ListaArancelesPorDireccion] Buscando con API general:', { parametroBusqueda, anioSeleccionado });
      
      let resultados: any[] = [];
      
      if (parametroBusqueda.trim() === '') {
        // Si no hay búsqueda, cargar todos los aranceles
        console.log('📋 [ListaArancelesPorDireccion] Cargando todos los aranceles...');
        resultados = await arancelService.obtenerTodosAranceles();
      } else {
        // Buscar con parámetro específico
        console.log('🔍 [ListaArancelesPorDireccion] Buscando con parámetro:', parametroBusqueda.trim());
        resultados = await arancelService.listarArancelesGeneral({
          parametroBusqueda: parametroBusqueda.trim(),
          anio: anioSeleccionado || new Date().getFullYear(),
          codUsuario: 1
        });
      }
      
      console.log('✅ [ListaArancelesPorDireccion] Resultados obtenidos de API general:', resultados);
      console.log('📊 [ListaArancelesPorDireccion] Cantidad de resultados:', resultados.length);
      
      // Actualizar estado con los resultados
      setArancelesEncontrados(resultados);
      
      // Log después de actualizar el estado
      console.log('🔄 [ListaArancelesPorDireccion] Estado actualizado, resultados guardados');
      
    } catch (error) {
      console.error('❌ [ListaArancelesPorDireccion] Error en búsqueda con API general:', error);
      setArancelesEncontrados([]);
      NotificationService.error('Error al buscar aranceles');
    } finally {
      setLoadingBusqueda(false);
    }
  }, [parametroBusqueda, anioSeleccionado]);

  // Efecto para manejar parámetros de búsqueda iniciales desde redirección
  useEffect(() => {
    if (initialSearchParams) {
      console.log('🎯 [ListaArancelesPorDireccion] Recibiendo parámetros iniciales:', initialSearchParams);
      
      // Establecer los valores en el estado
      setAnioSeleccionado(initialSearchParams.anio);
      setCodDireccionBusqueda(initialSearchParams.codDireccion);
      
      // Realizar la búsqueda automáticamente
      setTimeout(async () => {
        console.log('🔄 [ListaArancelesPorDireccion] Ejecutando búsqueda automática...');
        try {
          setLoadingBusqueda(true);
          const resultados = await arancelService.listarAranceles({
            anio: initialSearchParams.anio,
            codDireccion: initialSearchParams.codDireccion,
            codUsuario: 1
          });
          
          console.log('✅ [ListaArancelesPorDireccion] Búsqueda automática completada:', resultados);
          setArancelesEncontrados(resultados);
        } catch (error) {
          console.error('❌ [ListaArancelesPorDireccion] Error en búsqueda automática:', error);
          setArancelesEncontrados([]);
          NotificationService.error('Error al cargar el arancel');
        } finally {
          setLoadingBusqueda(false);
        }
      }, 500); // Pequeño delay para permitir que se actualice la UI
    }
  }, [initialSearchParams]);

  // Usar los aranceles encontrados en la búsqueda específica
  const arancelesFiltrados = arancelesEncontrados;

  // Paginación
  const arancelesPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return arancelesFiltrados.slice(start, end);
  }, [arancelesFiltrados, page, rowsPerPage]);

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const handleDeleteConfirm = async () => {
    if (arancelToDelete?.codArancel) {
      try {
        await eliminarArancel(arancelToDelete.codArancel);
        setDeleteDialogOpen(false);
        setArancelToDelete(null);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setArancelToDelete(null);
  };

  // Handler para selección de arancel
  const handleRowClick = (arancel: ArancelData) => {
    if (selectionMode && onSelectArancel) {
      onSelectArancel(arancel);
    }
  };

  const theme = useTheme();

  return (
    <Paper 
      elevation={3}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 3 }}>
    

        {/* Controles de búsqueda */}
        <Stack spacing={3} mb={3}>
          {useGeneralApi ? (
            /* Búsqueda con API general */
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              {/* Campo de búsqueda general */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(60% - 8px)' },
                minWidth: { xs: '100%', sm: '250px' }
              }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar Aranceles"
                  value={parametroBusqueda}
                  onChange={(e) => {
                    setParametroBusqueda(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    )
                  }}
                  placeholder="Buscar por sector, barrio, calle..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      buscarConApiGeneral();
                    }
                  }}
                />
              </Box>

              {/* Año */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '0 0 120px' },
                minWidth: { xs: '100%', sm: '120px' }
              }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Año"
                  type="number"
                  value={anioSeleccionado || ''}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value) || null;
                    setAnioSeleccionado(newYear);
                    setPage(0);
                  }}
                  InputProps={{
                    inputProps: { 
                      min: 1900, 
                      max: new Date().getFullYear() 
                    }
                  }}
                />
              </Box>

              {/* Botón de búsqueda */}
              <Box sx={{ flex: '0 0 auto' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loadingBusqueda ? <CircularProgress size={16} /> : <SearchIcon />}
                  onClick={buscarConApiGeneral}
                  disabled={loadingBusqueda}
                  sx={{
                    height: 40,
                    minWidth: 100,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Buscar
                </Button>
              </Box>
            </Box>
          ) : (
            /* Búsqueda por año y código de dirección (legacy) */
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              {/* Año */}
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
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value) || null;
                    setAnioSeleccionado(newYear);
                    setPage(0);
                  }}
                  InputProps={{
                    inputProps: { 
                      min: 1900, 
                      max: new Date().getFullYear() 
                    }
                  }}
                  required
                />
              </Box>

              {/* Código de dirección */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 150px' },
                minWidth: { xs: '100%', md: '150px' }
              }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Código Dirección"
                  type="number"
                  value={codDireccionBusqueda || ''}
                  onChange={(e) => {
                    const newCodDireccion = parseInt(e.target.value) || null;
                    setCodDireccionBusqueda(newCodDireccion);
                    setPage(0);
                  }}
                  InputProps={{
                    inputProps: { min: 1 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    )
                  }}
                  placeholder="Ej: 4"
                  required
                />
              </Box>

              {/* Botón de búsqueda */}
              <Box sx={{ flex: '0 0 auto' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loadingBusqueda ? <CircularProgress size={16} /> : <SearchIcon />}
                  onClick={buscarPorCodDireccion}
                  disabled={loadingBusqueda || !anioSeleccionado || !codDireccionBusqueda}
                  sx={{
                    height: 40,
                    minWidth: 100,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Buscar
                </Button>
              </Box>
            </Box>
          )}

          {/* Mensaje informativo mejorado */}
          {useGeneralApi ? (
            arancelesEncontrados.length === 0 && !loadingBusqueda && (
              <Alert 
                severity="info" 
                icon={<SearchIcon />}
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: 'primary.main'
                  }
                }}
              >
                Use la búsqueda general para encontrar aranceles por sector, barrio, calle o deje vacío para ver todos.
         
              </Alert>
            )
          ) : (
            (!anioSeleccionado || !codDireccionBusqueda) && (
              <Alert 
                severity="info" 
                icon={<SearchIcon />}
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: 'primary.main'
                  }
                }}
              >
                Ingrese el año y código de dirección para buscar aranceles específicos.
            
              </Alert>
            )
          )}

        
        </Stack>
      </Box>

      {/* Tabla mejorada */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, pb: 2 }}>
        {loadingBusqueda ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton 
                key={index} 
                height={60} 
                sx={{ mb: 1, borderRadius: 1 }} 
                animation="wave"
              />
            ))}
          </Box>
        ) : (useGeneralApi ? arancelesEncontrados.length > 0 : anioSeleccionado && codDireccionBusqueda && arancelesEncontrados.length > 0) ? (
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: 0
              }
            }}
          >
            <Table size="medium" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      borderBottom: 2,
                      borderColor: 'divider'
                    }}
                  >
                    Año
                  </TableCell>
                  {useGeneralApi && (
                    <TableCell sx={{ 
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      borderBottom: 2,
                      borderColor: 'divider'
                    }}>
                      Dirección Completa
                    </TableCell>
                  )}
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      borderBottom: 2,
                      borderColor: 'divider'
                    }}
                  >
                    Costo Arancel
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      borderBottom: 2,
                      borderColor: 'divider'
                    }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arancelesPaginados.map((arancel) => {
                  const isSelected = selectedArancelId === arancel.codArancel;
                  return (
                  <Fade in={true} key={arancel.codArancel || `${arancel.anio}-${arancel.codDireccion}`}>
                    <TableRow 
                      hover
                      selected={isSelected}
                      onClick={() => handleRowClick(arancel)}
                      sx={{
                        cursor: selectionMode ? 'pointer' : 'default',
                        '&:nth-of-type(even)': {
                          bgcolor: alpha(theme.palette.primary.main, 0.02)
                        },
                        '&:hover': {
                          bgcolor: selectionMode 
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.primary.main, 0.08),
                          transform: selectionMode ? 'scale(1.01)' : 'none',
                          transition: 'all 0.2s ease'
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.20),
                          }
                        }
                      }}
                    >
                      <TableCell align="center">
                        <Chip
                          label={arancel.anio}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      {useGeneralApi && (
                        <TableCell sx={{ minWidth: '300px' }}>
                          <Typography variant="body2" sx={{ 
                            whiteSpace: 'nowrap',
                            fontWeight: 500
                          }}>
                            {arancel.direccionCompleta || 'N/A'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Chip
                          label={formatCurrency(arancel.costoArancel)}
                          color="success"
                          size="small"
                          icon={<MoneyIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Editar arancel">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditArancel) {
                                  console.log('✏️ [ListaArancelesPorDireccion] Editando arancel:', arancel);
                                  onEditArancel(arancel);
                                } else {
                                  NotificationService.info('Funcionalidad de edición disponible desde el formulario');
                                }
                              }}
                              sx={{
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Fade>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (useGeneralApi && arancelesEncontrados.length === 0) || (anioSeleccionado && codDireccionBusqueda && arancelesEncontrados.length === 0) ? (
          <Alert 
            severity="warning"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: 'warning.main'
              }
            }}
          >
            {useGeneralApi 
              ? 'No se encontraron aranceles con los criterios de búsqueda especificados'
              : `No se encontraron aranceles para el año ${anioSeleccionado} y código de dirección ${codDireccionBusqueda}`
            }
          </Alert>
        ) : null}
      </Box>

      {/* Paginación mejorada */}
      {((useGeneralApi && arancelesEncontrados.length > 0) || (anioSeleccionado && codDireccionBusqueda && arancelesEncontrados.length > 0)) && (
        <Box sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <TablePagination
            component="div"
            count={arancelesFiltrados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              '& .MuiTablePagination-toolbar': {
                px: 2
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500
              }
            }}
          />
        </Box>
      )}

      {/* Diálogo de confirmación mejorado */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'error.main',
          fontWeight: 600
        }}>
          <DeleteIcon />
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Está seguro de que desea eliminar este arancel?
          </Typography>
          {arancelToDelete && (
            <Box sx={{ 
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.2)
            }}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Año:</strong> {arancelToDelete.anio}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Costo:</strong> {formatCurrency(arancelToDelete.costoArancel)}
                </Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ textTransform: 'none' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};