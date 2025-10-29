// src/components/modal/SelectorPredio.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Stack,
  InputAdornment,
  Radio,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Terrain as TerrainIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { usePredios } from '../../hooks/usePredioAPI';
import { Predio } from '../../models/Predio';
import { Direccion } from '../../models/Direcciones';
import { formatCurrency } from '../../utils/formatters';
import { NotificationService } from '../utils/Notification';

/**
 * Función helper para formatear la dirección
 */
const formatDireccion = (direccion: string | Direccion | null | undefined): string => {
  if (!direccion) {
    return 'Sin dirección';
  }

  if (typeof direccion === 'string') {
    return direccion;
  }

  // Si es un objeto Direccion, construir la dirección formateada
  const partes: string[] = [];

  if (direccion.nombreTipoVia && direccion.nombreVia) {
    partes.push(`${direccion.nombreTipoVia} ${direccion.nombreVia}`);
  } else if (direccion.nombreVia) {
    partes.push(direccion.nombreVia);
  }

  if (direccion.cuadra) {
    partes.push(`Cuadra ${direccion.cuadra}`);
  }

  if (direccion.loteInicial && direccion.loteFinal) {
    if (direccion.loteInicial === direccion.loteFinal) {
      partes.push(`Lote ${direccion.loteInicial}`);
    } else {
      partes.push(`Lotes ${direccion.loteInicial}-${direccion.loteFinal}`);
    }
  } else if (direccion.loteInicial) {
    partes.push(`Lote ${direccion.loteInicial}`);
  }

  if (direccion.nombreBarrio) {
    partes.push(`${direccion.nombreBarrio}`);
  }

  if (direccion.nombreSector) {
    partes.push(`Sector ${direccion.nombreSector}`);
  }

  return partes.length > 0 ? partes.join(', ') : direccion.descripcion || 'Sin dirección';
};

interface SelectorPredioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPredio: (predio: Predio) => void;
  title?: string;
  selectedId?: string | null;
  contribuyenteId?: number | null;
}

/**
 * Modal para seleccionar un predio
 */
const SelectorPredio: React.FC<SelectorPredioProps> = ({
  isOpen,
  onClose,
  onSelectPredio,
  title = 'Selector de predios'
}) => {
  const theme = useTheme();

  // Estados locales - Filtros
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [codPredioBase, setCodPredioBase] = useState('');
  const [parametroBusqueda, setParametroBusqueda] = useState('');
  const [selectedPredio, setSelectedPredio] = useState<Predio | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);

  // Hook de predios - DEBE estar después de todos los estados
  const {
    predios,
    loading,
    error,
    cargarTodosPredios,
    buscarPrediosConFiltros
  } = usePredios();

  // Cargar predios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔓 [SelectorPredio] Modal abierto, cargando todos los predios desde /all');
      // Llamar explícitamente a cargarTodosPredios que usa GET /api/predio/all
      cargarTodosPredios().catch(err => {
        console.error('❌ [SelectorPredio] Error al cargar predios:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Resetear estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setAnio(new Date().getFullYear());
      setCodPredioBase('');
      setParametroBusqueda('');
      setSelectedPredio(null);
      setPage(0);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Mostrar predios según si se ha buscado o no
  const filteredPredios = useMemo(() => {
    // Los resultados ya vienen filtrados de la API o son todos los predios
    console.log('📊 [SelectorPredio] Predios actuales:', predios.length);
    return predios;
  }, [predios]);

  // Paginar resultados
  const paginatedPredios = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPredios.slice(start, end);
  }, [filteredPredios, page, rowsPerPage]);

  // Handlers
  const handleBuscar = async () => {
    setHasSearched(true);
    setPage(0);

    console.log('🔍 [SelectorPredio] Buscando con filtros:', {
      anio,
      codPredioBase,
      parametroBusqueda
    });

    try {
      // Llamar a la nueva API con query params
      await buscarPrediosConFiltros(
        anio || undefined,
        codPredioBase || undefined,
        parametroBusqueda || undefined
      );

      console.log('✅ [SelectorPredio] Búsqueda completada');
    } catch (error) {
      console.error('❌ [SelectorPredio] Error en búsqueda:', error);
    }
  };

  const handleLimpiar = async () => {
    setAnio(new Date().getFullYear());
    setCodPredioBase('');
    setParametroBusqueda('');
    setHasSearched(false);
    setPage(0);

    // Recargar todos los predios
    await cargarTodosPredios();
  };

  const handleSelectPredio = (predio: Predio) => {
    setSelectedPredio(predio);
  };

  const handleConfirm = () => {
    if (selectedPredio) {
      onSelectPredio(selectedPredio);
      onClose();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: '85vh',
          maxHeight: 800,
          width: '90vw'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Sección de Filtros de Búsqueda - Estilo compacto */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 0,
            background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <FilterIcon sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Búsqueda de Predios
              </Typography>
              {(codPredioBase || parametroBusqueda || hasSearched) && (
                <Chip
                  label={hasSearched ? "Búsqueda activa" : "Filtros ingresados"}
                  color="primary"
                  size="small"
                />
              )}
            </Stack>

            {/* Filtros compactos */}
            <Stack direction="row" spacing={1} alignItems="flex-end" flexWrap="wrap">
              {/* Año */}
              <Box sx={{ flex: '0 0 100px' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Año"
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value) || new Date().getFullYear())}
                  disabled={loading}
                  size="small"
                  InputProps={{
                    inputProps: {
                      min: 2020,
                      max: new Date().getFullYear() + 1
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBuscar();
                    }
                  }}
                />
              </Box>

              {/* Código Predio */}
              <Box sx={{ flex: '0 0 100px' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Código Predio"
                  placeholder="Ej: 4"
                  value={codPredioBase}
                  onChange={(e) => setCodPredioBase(e.target.value)}
                  disabled={loading}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: codPredioBase && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setCodPredioBase('')}
                          disabled={loading}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBuscar();
                    }
                  }}
                />
              </Box>

              {/* Parámetro Búsqueda */}
              <Box sx={{ flex: '0 0 80px' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Parámetro Búsqueda"
                  placeholder="Buscar..."
                  value={parametroBusqueda}
                  onChange={(e) => setParametroBusqueda(e.target.value)}
                  disabled={loading}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: parametroBusqueda && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setParametroBusqueda('')}
                          disabled={loading}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBuscar();
                    }
                  }}
                />
              </Box>

              {/* Botones de acción compactos */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button
                  variant="contained"
                  onClick={handleBuscar}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                  size="small"
                  sx={{ minWidth: 80 }}
                >
                  Buscar
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleLimpiar}
                  disabled={loading}
                  size="small"
                  sx={{ minWidth: 40, px: 1 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </Button>
              </Box>
            </Stack>

            {/* Texto de ayuda compacto */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {loading 
                ? 'Buscando predios...'
                : hasSearched 
                  ? `${filteredPredios.length} predios encontrados`
                  : `${predios.length} predios disponibles. Use código de predio para búsqueda específica.`
              }
            </Typography>
          </Box>
        </Paper>

        {/* Tabla responsiva con Material UI mejorado */}
        <Box>
          {/* Vista de tabla para pantallas medianas y grandes */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer sx={{
              maxHeight: 450,
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
              '&::-webkit-scrollbar': {
                width: 8,
                height: 8
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[200], 0.3),
                borderRadius: 4
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.4),
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.6)
                }
              }
            }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ 
                    '& .MuiTableCell-head': { 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      py: 1.5,
                      color: 'text.primary',
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }
                  }}>
                    <TableCell padding="checkbox" sx={{ width: 50, textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight={700}>Sel.</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <HomeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={700}>Código</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 250 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocationIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={700}>Dirección</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        <TerrainIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={700}>Área m²</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 130 }}>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        <PersonIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={700}>Conductor</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        <MoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption" fontWeight={700}>ValorTerreno</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <CircularProgress size={20} />
                      <Typography variant="caption" color="text.secondary">
                        Cargando predios...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Alert severity="error" sx={{ m: 0 }}>{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : paginatedPredios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <HomeIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                      <Typography color="text.secondary" variant="body2">
                        {hasSearched ? 'No se encontraron predios con los criterios de búsqueda' : 'No hay predios disponibles'}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPredios.map((predio, index) => {
                  const predioId = predio.codigoPredio || predio.codPredio || predio.id;

                  // Normalizar los valores para comparación (limpiar espacios y convertir a string)
                  const selectedId = selectedPredio
                    ? String(selectedPredio.codigoPredio || selectedPredio.codPredio || selectedPredio.id || '').trim()
                    : null;
                  const currentId = String(predioId || '').trim();

                  // Comparar solo si ambos IDs existen y coinciden exactamente
                  const isSelected = selectedId !== null && selectedId !== '' && currentId !== '' && selectedId === currentId;

                  return (
                    <TableRow
                      key={predioId || index}
                      hover
                      onClick={() => handleSelectPredio(predio)}
                      selected={!!isSelected}
                      sx={{
                        cursor: 'pointer',
                        height: 60,
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.12)
                          : index % 2 === 0
                            ? 'transparent'
                            : alpha(theme.palette.grey[50], 0.4),
                        borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        '&:hover': {
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, 0.18)
                            : alpha(theme.palette.primary.main, 0.06),
                          borderLeft: `4px solid ${alpha(theme.palette.primary.main, isSelected ? 1 : 0.4)}`,
                          boxShadow: isSelected
                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                            : `0 2px 8px ${alpha(theme.palette.grey[400], 0.2)}`,
                          transform: 'translateX(2px)',
                          zIndex: 1
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.18)
                          }
                        },
                        '&:last-child td': {
                          borderBottom: 'none'
                        },
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative'
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ textAlign: 'center' }}>
                        <Radio
                          checked={!!isSelected}
                          value={predioId || `predio-${index}`}
                          size="small"
                          color="primary"
                          sx={{
                            '&.Mui-checked': {
                              transform: 'scale(1.1)',
                              color: 'primary.main'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={predioId || 'Sin código'}
                            size="small"
                            variant={isSelected ? "filled" : "outlined"}
                            color={isSelected ? "primary" : "default"}
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              minWidth: 80
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 600 : 500,
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              color: isSelected ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {typeof predio.direccion === 'string'
                              ? predio.direccion
                              : predio.direccion
                              ? formatDireccion(predio.direccion)
                              : `Dirección del predio ${predioId}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {predio.areaTerreno?.toFixed(1) || '0.0'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            m²
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            maxWidth: 120,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: predio.conductor ? 'text.primary' : 'text.secondary'
                          }}
                        >
                          {predio.conductor || 'Sin conductor'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'success.main'
                            }}
                          >
                            {formatCurrency(predio.valorTerreno || 0)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación mejorada */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          borderTop: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: `linear-gradient(to right, ${alpha(theme.palette.grey[50], 0.8)}, ${alpha(theme.palette.grey[100], 0.5)})`,
          boxShadow: `inset 0 1px 3px ${alpha(theme.palette.grey[300], 0.2)}`
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Chip
              label={`Total: ${filteredPredios.length}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                borderWidth: 1.5
              }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {filteredPredios.length > 0
                ? `Mostrando ${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredPredios.length)}`
                : 'Sin resultados'
              }
            </Typography>
          </Stack>

          <TablePagination
            component="div"
            count={filteredPredios.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas:"
            labelDisplayedRows={() => ''}
            rowsPerPageOptions={[5, 10, 15, 20]}
            sx={{
              '.MuiTablePagination-toolbar': {
                minHeight: 40,
                pl: 2,
                gap: 2
              },
              '.MuiTablePagination-selectLabel': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.primary'
              },
              '.MuiTablePagination-select': {
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'primary.main',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: theme.palette.primary.main
                }
              },
              '.MuiTablePagination-actions': {
                gap: 0.5,
                '& .MuiIconButton-root': {
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 1,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: theme.palette.primary.main
                  },
                  '&.Mui-disabled': {
                    borderColor: alpha(theme.palette.grey[300], 0.5),
                    opacity: 0.4
                  }
                }
              }
            }}
          />
        </Box>
          </Box>

          {/* Vista de tarjetas para móviles y tablets */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ 
              maxHeight: 320, 
              overflow: 'auto',
              px: 1,
              '&::-webkit-scrollbar': {
                width: 4
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[300], 0.2)
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[400], 0.5),
                borderRadius: 2
              }
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando predios...
                    </Typography>
                  </Stack>
                </Box>
              ) : error ? (
                <Box sx={{ p: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : paginatedPredios.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <HomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary" variant="body2" align="center">
                    {hasSearched ? 'No se encontraron predios con los criterios de búsqueda' : 'No hay predios disponibles'}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1} sx={{ py: 1 }}>
                  {paginatedPredios.map((predio, index) => {
                    const predioId = predio.codigoPredio || predio.codPredio || predio.id;

                    // Normalizar los valores para comparación (limpiar espacios y convertir a string)
                    const selectedId = selectedPredio
                      ? String(selectedPredio.codigoPredio || selectedPredio.codPredio || selectedPredio.id || '').trim()
                      : null;
                    const currentId = String(predioId || '').trim();

                    // Comparar solo si ambos IDs existen y coinciden exactamente
                    const isSelected = selectedId !== null && selectedId !== '' && currentId !== '' && selectedId === currentId;

                    return (
                      <Paper
                        key={predioId || index}
                        onClick={() => handleSelectPredio(predio)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: isSelected 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                          bgcolor: isSelected 
                            ? alpha(theme.palette.primary.main, 0.05)
                            : 'background.paper',
                          borderRadius: 2,
                          transition: 'all 0.3s ease-in-out',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.grey[400], 0.15)}`,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                          },
                          '&:before': isSelected ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 4,
                            height: '100%',
                            bgcolor: 'primary.main',
                            borderRadius: '0 2px 2px 0'
                          } : {}
                        }}
                      >
                        {/* Header de la tarjeta con código y radio */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <HomeIcon 
                              sx={{ 
                                fontSize: 16, 
                                color: isSelected ? 'primary.main' : 'text.secondary' 
                              }} 
                            />
                            <Chip
                              label={predioId || 'Sin código'}
                              size="small"
                              variant={isSelected ? "filled" : "outlined"}
                              color={isSelected ? "primary" : "default"}
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Stack>
                          <Radio
                            checked={!!isSelected}
                            value={predioId || `predio-mobile-${index}`}
                            size="small"
                            color="primary"
                            sx={{
                              '&.Mui-checked': {
                                transform: 'scale(1.1)',
                                color: 'primary.main'
                              }
                            }}
                          />
                        </Stack>

                        {/* Información del predio en grid */}
                        <Stack spacing={1.5}>
                          {/* Dirección */}
                          <Box>
                            <Stack direction="row" alignItems="flex-start" spacing={1}>
                              <LocationIcon sx={{ fontSize: 14, color: 'primary.main', mt: 0.3 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.5 }}>
                                  DIRECCIÓN
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: isSelected ? 600 : 500,
                                    lineHeight: 1.3,
                                    color: isSelected ? 'primary.main' : 'text.primary'
                                  }}
                                >
                                  {typeof predio.direccion === 'string'
                                    ? predio.direccion
                                    : predio.direccion
                                    ? formatDireccion(predio.direccion)
                                    : `Dirección del predio ${predioId}`}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          {/* Grid de información adicional */}
                          <Stack 
                            direction="row" 
                            spacing={2} 
                            sx={{ 
                              bgcolor: alpha(theme.palette.grey[50], 0.5),
                              p: 1.5,
                              borderRadius: 1,
                              border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`
                            }}
                          >
                            {/* Área */}
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                                <TerrainIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                  ÁREA
                                </Typography>
                              </Stack>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                {predio.areaTerreno?.toFixed(1) || '0.0'} m²
                              </Typography>
                            </Box>

                            {/* Autoavalúo */}
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                                <MoneyIcon sx={{ fontSize: 12, color: 'success.main' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                  AUTOAVALÚO
                                </Typography>
                              </Stack>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'success.main'
                                }}
                              >
                                {formatCurrency(predio.autoavaluo || 0)}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Conductor */}
                          {predio.conductor && (
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <PersonIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    CONDUCTOR
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontSize: '0.8rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    {predio.conductor}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Paginación móvil */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              px: 2, 
              py: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}>
              <Typography variant="caption" color="text.secondary">
                {filteredPredios.length > 0 
                  ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredPredios.length)} de ${filteredPredios.length}` 
                  : 'No hay resultados'
                }
              </Typography>
              
              <TablePagination
                component="div"
                count={filteredPredios.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage=""
                labelDisplayedRows={() => ''}
                rowsPerPageOptions={[5, 8, 10]}
                sx={{
                  '.MuiTablePagination-toolbar': {
                    minHeight: 32,
                    justifyContent: 'center',
                    px: 0
                  },
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    display: 'none'
                  },
                  '.MuiTablePagination-select': {
                    fontSize: '0.75rem'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!selectedPredio}
          sx={{ 
            px: 4,
            bgcolor: '#4ECDC4',
            '&:hover': {
              bgcolor: '#45B8B0'
            }
          }}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorPredio;