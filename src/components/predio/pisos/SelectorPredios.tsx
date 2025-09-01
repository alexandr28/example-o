// src/components/predio/pisos/SelectorPredios.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Chip,
  Stack,
  LinearProgress,
  TablePagination,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  CheckCircle as CheckIcon,
  Clear as ClearIcon,
  Terrain as TerrainIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { usePredios } from '../../../hooks/usePredioAPI';
import { Predio } from '../../../models/Predio';
import { Direccion } from '../../../models/Direcciones';

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

interface SelectorPrediosProps {
  open: boolean;
  onClose: () => void;
  onSelect: (predio: Predio) => void;
}

const SelectorPredios: React.FC<SelectorPrediosProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const theme = useTheme();
  const { 
    predios, 
    loading, 
    cargarPredios, 
    buscarPredios
  } = usePredios();

  // Estados locales
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPredio, setSelectedPredio] = useState<Predio | null>(null);
  const [filtros, setFiltros] = useState({
    codigoPredio: '',
    anio: new Date().getFullYear(),
    estadoPredio: '',
    condicionPropiedad: ''
  });

  // Cargar predios cuando se abre el modal
  useEffect(() => {
    if (open) {
      cargarPredios();
    }
  }, [open, cargarPredios]);

  // Filtrar predios localmente
  const filteredPredios = useMemo(() => {
    if (!searchTerm) return predios;
    
    const term = searchTerm.toLowerCase();
    return predios.filter(predio => 
      predio.codigoPredio?.toLowerCase().includes(term) ||
      predio.direccion?.toString().toLowerCase().includes(term) ||
      predio.conductor?.toLowerCase().includes(term) ||
      predio.numeroFinca?.toLowerCase().includes(term)
    );
  }, [predios, searchTerm]);

  // Paginar predios
  const paginatedPredios = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPredios.slice(start, end);
  }, [filteredPredios, page, rowsPerPage]);

  // Handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBuscar = () => {
    buscarPredios(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      codigoPredio: '',
      anio: new Date().getFullYear(),
      estadoPredio: '',
      condicionPropiedad: ''
    });
    setSearchTerm('');
    cargarPredios();
  };

  const getEstadoChip = (estado?: string) => {
    const estadoUpper = estado?.toUpperCase();
    switch (estadoUpper) {
      case 'TERMINADO':
        return <Chip label="Terminado" color="success" size="small" />;
      case 'EN_CONSTRUCCION':
        return <Chip label="En Construcción" color="warning" size="small" />;
      case 'EN_PROCESO':
        return <Chip label="En Proceso" color="info" size="small" />;
      case 'REGISTRADO':
        return <Chip label="Registrado" color="primary" size="small" />;
      case 'OBSERVADO':
        return <Chip label="Observado" color="error" size="small" />;
      default:
        return <Chip label={estado || 'Sin Estado'} size="small" />;
    }
  };

  // Seleccionar predio
  const handleSelectPredio = (predio: Predio) => {
    setSelectedPredio(predio);
  };

  // Confirmar selección
  const handleConfirm = () => {
    if (selectedPredio) {
      onSelect(selectedPredio);
      onClose();
    }
  };

  // Limpiar al cerrar
  const handleClose = () => {
    setSearchTerm('');
    setSelectedPredio(null);
    setPage(0);
    setFiltros({
      codigoPredio: '',
      anio: new Date().getFullYear(),
      estadoPredio: '',
      condicionPropiedad: ''
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <HomeIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Seleccionar Predio
            </Typography>
          </Stack>
          <IconButton
            onClick={handleClose}
            sx={{
              color: theme.palette.grey[500],
              '&:hover': {
                color: theme.palette.grey[700]
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Barra de búsqueda y filtros */}
        <Paper sx={{ p: 2, m: 2, mb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2, 
            alignItems: { xs: 'stretch', md: 'center' },
            flexWrap: 'wrap'
          }}>
            {/* Campo de búsqueda principal */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 300px' },
              minWidth: { xs: '100%', md: '300px' },
              maxWidth: { xs: '100%', md: '400px' }
            }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por código, dirección, conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            {/* Código Predio */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 150px' },
              minWidth: { xs: '100%', md: '150px' }
            }}>
              <TextField
                fullWidth
                size="small"
                label="Código Predio"
                value={filtros.codigoPredio}
                onChange={(e) => setFiltros({ ...filtros, codigoPredio: e.target.value })}
              />
            </Box>
            
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
                value={filtros.anio}
                onChange={(e) => setFiltros({ ...filtros, anio: parseInt(e.target.value) })}
                InputProps={{
                  inputProps: { 
                    min: 1900, 
                    max: new Date().getFullYear() 
                  }
                }}
              />
            </Box>
            
            {/* Botones de acción */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '0 0 auto' },
              display: 'flex',
              gap: 1,
              justifyContent: { xs: 'stretch', md: 'flex-start' },
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap'
            }}>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={handleBuscar}
                disabled={loading}
                size="small"
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                onClick={handleLimpiarFiltros}
                disabled={loading}
                size="small"
              >
                Limpiar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarPredios}
                disabled={loading}
                size="small"
              >
                Actualizar
              </Button>
            </Box>
          </Box>
        </Paper>

        {loading && <LinearProgress />}

        {/* Tabla de predios mejorada */}
        <Paper 
          elevation={1}
          sx={{ 
            mx: 2,
            overflow: 'hidden',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
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
                <HomeIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={600} fontSize="1rem">
                Seleccionar Predio
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`Total: ${predios.length}`}
                color="primary"
                variant="filled"
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
              <Chip
                label={`Filtrados: ${filteredPredios.length}`}
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>

          <TableContainer sx={{ 
            maxHeight: 350,
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
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow key="header-row">
                  <TableCell padding="checkbox" sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                  </TableCell>
                  <TableCell sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerrainIcon fontSize="small" />
                      CÓDIGO
                    </Box>
                  </TableCell>
                  <TableCell sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                    DIRECCIÓN
                  </TableCell>
                  <TableCell sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                    CONDUCTOR
                  </TableCell>
                  <TableCell sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                    CONDICIÓN
                  </TableCell>
                  <TableCell align="right" sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                    ÁREA (m²)
                  </TableCell>
                  <TableCell sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1
                  }}>
                    ESTADO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow key="loading-row">
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Stack alignItems="center" spacing={2}>
                        <CircularProgress 
                          size={32} 
                          thickness={4}
                          sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Cargando predios...
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : paginatedPredios.length > 0 ? (
                  paginatedPredios.map((predio, index) => (
                    <TableRow
                      key={predio.codPredio || predio.codigoPredio || `predio-${index}`}
                      hover
                      selected={selectedPredio?.codigoPredio === predio.codigoPredio}
                      onClick={() => handleSelectPredio(predio)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12)
                          }
                        },
                        '&:nth-of-type(even)': {
                          bgcolor: alpha(theme.palette.grey[50], 0.3),
                        },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1
                      }}>
                        {selectedPredio?.codigoPredio === predio.codigoPredio && (
                          <CheckIcon color="primary" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={<TerrainIcon fontSize="small" />}
                            label={predio.codPredio || predio.codigoPredio || 'Sin código'}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              bgcolor: alpha(theme.palette.primary.main, 0.04)
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1,
                        verticalAlign: 'middle'
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 0.5 }}>
                          <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2, fontSize: '0.75rem' }}>
                            {formatDireccion(predio.direccion)}
                          </Typography>
                          {predio.numeroFinca && (
                            <Chip
                              label={`Finca: ${predio.numeroFinca}`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.6rem', 
                                height: 16,
                                bgcolor: alpha(theme.palette.info.main, 0.04)
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1
                      }}>
                        <Chip 
                          label={predio.conductor} 
                          size="small" 
                          variant="filled"
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1,
                        verticalAlign: 'middle'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
                          <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.43, fontSize: '0.75rem' }}>
                            {predio.condicionPropiedad}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1,
                        verticalAlign: 'middle'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.3, height: '100%' }}>
                          <Typography variant="body2" fontWeight={600} color="warning.main" sx={{ lineHeight: 1.43, fontSize: '0.75rem' }}>
                            {predio.areaTerreno.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.43, fontSize: '0.65rem' }}>
                            M²
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        py: 1,
                        verticalAlign: 'middle'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
                          {getEstadoChip(predio.estadoPredio)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data-row">
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={3}>                      <Box sx={{
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                      }}>
                        <SearchIcon sx={{ 
                          fontSize: 48, 
                          color: alpha(theme.palette.primary.main, 0.4)
                        }} />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          No se encontraron predios
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          Intente ajustar los filtros de búsqueda
                        </Typography>
                      </Box>
                    </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Paginación mejorada */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.grey[50], 0.5),
          px: 2,
          py: 1,
          mx: 2,
          mt: 1
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
            Mostrando {paginatedPredios.length} de {filteredPredios.length} predios
            {filteredPredios.length !== predios.length && (
              <Chip 
                label={`${predios.length - filteredPredios.length} filtrados`}
                size="small"
                variant="outlined"
                sx={{ ml: 1, fontSize: '0.6rem' }}
              />
            )}
          </Typography>
          <TablePagination
            component="div"
            count={filteredPredios.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              border: 'none',
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 0,
                paddingRight: 0
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.75rem',
                fontWeight: 500,
                color: theme.palette.text.secondary
              },
              '& .MuiIconButton-root': {
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                '&.Mui-disabled': {
                  color: theme.palette.text.disabled,
                }
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedPredio}
          startIcon={<CheckIcon />}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorPredios;