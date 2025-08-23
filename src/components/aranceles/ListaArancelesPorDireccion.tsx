// src/components/aranceles/ListaArancelesPorDireccion.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Autocomplete,
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
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAranceles } from '../../hooks/useAranceles';
import { formatCurrency } from '../../utils/formatters';
import { ArancelData } from '../../services/arancelService';
import { NotificationService } from '../utils/Notification';

interface ListaArancelesPorDireccionProps {
  onSelectArancel?: (arancel: ArancelData) => void;
  selectedArancelId?: number | null;
  selectionMode?: boolean;
}

export const ListaArancelesPorDireccion: React.FC<ListaArancelesPorDireccionProps> = ({
  onSelectArancel,
  selectedArancelId,
  selectionMode = false
}) => {
  // Estados
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [arancelToDelete, setArancelToDelete] = useState<ArancelData | null>(null);

  // Hook - no pasamos año inicial para controlar manualmente las peticiones
  const { aranceles, loading, eliminarArancel, cargarPorAnio } = useAranceles();

  // Generar opciones de años
  const currentYear = new Date().getFullYear();
  const anioOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: currentYear - i,
      value: currentYear - i,
      label: (currentYear - i).toString(),
      description: i === 0 ? 'Año actual' : `Hace ${i} años`
    }));
  }, [currentYear]);

  // Efecto para cargar aranceles cuando cambie el año
  useEffect(() => {
    if (anioSeleccionado) {
      console.log(`🔄 [ListaArancelesPorDireccion] Cargando aranceles para año: ${anioSeleccionado}`);
      cargarPorAnio(anioSeleccionado);
    }
  }, [anioSeleccionado, cargarPorAnio]);

  // Filtrar aranceles según búsqueda
  const arancelesFiltrados = useMemo(() => {
    if (!busqueda) return aranceles;
    
    const searchTerm = busqueda.toLowerCase();
    return aranceles.filter(arancel => {
      // Como ahora no tenemos los datos de dirección completos en el arancel,
      // solo podemos buscar por costo o ID de dirección
      return arancel.costoArancel.toString().includes(searchTerm) ||
             arancel.codDireccion.toString().includes(searchTerm);
    });
  }, [aranceles, busqueda]);

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

  const handleDeleteClick = (arancel: ArancelData) => {
    setArancelToDelete(arancel);
    setDeleteDialogOpen(true);
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
        {/* Header mejorado */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AssignmentIcon />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Lista de Aranceles por Año
          </Typography>
          <Box sx={{ flex: 1 }} />
          {anioSeleccionado && !loading && (
            <Chip
              label={`${arancelesFiltrados.length} registros`}
              color="primary"
              variant="outlined"
              size="small"
              icon={<VisibilityIcon />}
            />
          )}
        </Box>

        {/* Controles de búsqueda mejorados */}
        <Stack spacing={3} mb={3}>
          {/* Selector de año usando Autocomplete */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1, maxWidth: 300 }}>
              <Autocomplete
                options={anioOptions}
                getOptionLabel={(option) => option.label}
                value={anioOptions.find(a => a.value === anioSeleccionado) || null}
                onChange={(_, newValue) => {
                  setAnioSeleccionado(newValue ? newValue.value : null);
                  setPage(0); // Reset página al cambiar año
                }}
                loading={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccione el año"
                    size="small"
                    placeholder="Seleccione un año..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                      sx: { 
                        height: 40,
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        }
                      }
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box key={key} {...otherProps} component="li">
                      <Stack>
                        <Typography variant="body2" fontWeight={500}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                }}
              />
            </Box>

            {/* Campo de búsqueda en la misma fila */}
            {anioSeleccionado && aranceles.length > 0 && (
              <Box sx={{ flex: 1, maxWidth: 400 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por costo o código de dirección..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      height: 40,
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Mensaje informativo mejorado */}
          {!anioSeleccionado && (
            <Alert 
              severity="info" 
              icon={<CalendarIcon />}
              sx={{
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'primary.main'
                }
              }}
            >
              Seleccione un año para ver los aranceles asignados
            </Alert>
          )}

          {/* Resumen de resultados mejorado */}
          {anioSeleccionado && !loading && (
            <Box sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2)
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={`Año: ${anioSeleccionado}`}
                  color="primary"
                  icon={<CalendarIcon />}
                  sx={{ fontWeight: 600 }}
                />
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" color="text.secondary">
                  Total de registros: <strong>{arancelesFiltrados.length}</strong>
                </Typography>
                {busqueda && (
                  <Typography variant="body2" color="text.secondary">
                    Filtrados: <strong>{arancelesFiltrados.length}</strong> de {aranceles.length}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Tabla mejorada */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, pb: 2 }}>
        {loading ? (
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
        ) : anioSeleccionado && aranceles.length > 0 ? (
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
                  <TableCell sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper',
                    borderBottom: 2,
                    borderColor: 'divider'
                  }}>
                    Código
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper',
                    borderBottom: 2,
                    borderColor: 'divider'
                  }}>
                    Año
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600,
                    bgcolor: 'background.paper',
                    borderBottom: 2,
                    borderColor: 'divider'
                  }}>
                    Código Dirección
                  </TableCell>
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
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {arancel.codArancel || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={arancel.anio}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight={500}>
                            {arancel.codDireccion}
                          </Typography>
                        </Box>
                      </TableCell>
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
                              onClick={() => {
                                NotificationService.info('Seleccione el arancel en el formulario de asignación para editarlo');
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
                          <Tooltip title="Eliminar arancel">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteClick(arancel)}
                              disabled={!arancel.codArancel}
                              sx={{
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
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
        ) : anioSeleccionado && aranceles.length === 0 ? (
          <Alert 
            severity="warning"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: 'warning.main'
              }
            }}
          >
            No se encontraron aranceles para el año {anioSeleccionado}
          </Alert>
        ) : null}
      </Box>

      {/* Paginación mejorada */}
      {anioSeleccionado && aranceles.length > 0 && (
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
                  <strong>Código Dirección:</strong> {arancelToDelete.codDireccion}
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