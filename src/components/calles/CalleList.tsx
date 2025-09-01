// src/components/calles/CalleListMUI.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tooltip,
  TableSortLabel,
  Skeleton,
  Alert,
  Stack,
  useTheme,
  alpha,
  Fade,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  LocationCity as LocationCityIcon,
  Home as HomeIcon,
  Route as RouteIcon,
  Map as MapIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Calle } from '../../models/Calle';

interface CalleListProps {
  calles: Calle[];
  onSelectCalle: (calle: Calle) => void;
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  obtenerNombreSector?: (sectorId: number) => string;
  obtenerNombreBarrio?: (barrioId: number) => string;
  onNuevaCalle?: () => void;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Calle | 'ubicacion' | 'acciones';
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

const headCells: HeadCell[] = [
  { id: 'nombreVia', label: 'N°', sortable: true },
  { id: 'ubicacion', label: 'Ubicación', sortable: true },
  { id: 'acciones', label: 'Acciones', align: 'center' }
];

const CalleListMUI: React.FC<CalleListProps> = ({
  calles,
  onSelectCalle,
  loading = false,
  onSearch,
  searchTerm = '',
  obtenerNombreSector,
  obtenerNombreBarrio,
  onNuevaCalle
}) => {
  // Debug: Log de datos recibidos
  console.log('📊 [CalleList] Datos recibidos:', {
    totalCalles: calles.length,
    loading,
    searchTerm,
    primerasCincoCalles: calles.slice(0, 5)
  });

  // Debug: Verificar keys únicas
  const keys = calles.map((calle, index) => calle.codVia || calle.id || `calle-${index}`);
  const uniqueKeys = new Set(keys);
  if (keys.length !== uniqueKeys.size) {
    console.warn('⚠️ [CalleList] Keys duplicadas detectadas:', keys);
  }
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('nombreVia');
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Manejo de ordenamiento
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Manejo de cambio de texto (sin búsqueda automática)
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchTerm(value);
    // NO ejecutar búsqueda automáticamente - solo actualizar el estado local
  };

  // Ejecutar búsqueda local manual
  const handleSearchClick = () => {
    console.log('🔍 [CalleList] Ejecutando búsqueda local:', localSearchTerm);
    // La búsqueda se ejecuta automáticamente a través del useMemo en sortedAndFilteredCalles
    // Solo necesitamos forzar un re-render si es necesario
    setPage(0); // Resetear a la primera página al buscar
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    setPage(0); // Resetear a la primera página
  };

  // Cambio de página
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Selección de calle para edición
  const handleSelectCalle = (calle: Calle) => {
    console.log('📝 [CalleList] Seleccionando calle para edición:', calle);
    console.log('📝 [CalleList] Datos completos de la calle:', {
      codVia: calle.codVia,
      codTipoVia: calle.codTipoVia,
      nombreVia: calle.nombreVia,
      codBarrio: calle.codBarrio,
      codSector: calle.codSector,
      nombreBarrio: calle.nombreBarrio,
      descTipoVia: calle.descTipoVia
    });
    
    setSelectedId(calle.codVia ?? calle.id ?? 0);
    onSelectCalle(calle);
  };

  // Obtener nombre completo de la calle
  const getNombreCompleto = (calle: Calle) => {
    const tipoDesc = calle.descTipoVia || calle.nombreTipoVia || '';
    const nombre = calle.nombreVia || calle.nombreCalle || '';
    return `${tipoDesc} ${nombre}`.trim();
  };

  // Obtener ubicación completa
  const getUbicacion = useCallback((calle: Calle) => {
    const codigoBarrio = calle.codBarrio || calle.codigoBarrio;
    const nombreBarrio = calle.nombreBarrio || (obtenerNombreBarrio ? obtenerNombreBarrio(codigoBarrio || 0) : `Barrio ${codigoBarrio}`);
    return nombreBarrio || 'Sin ubicación';
  }, [obtenerNombreBarrio]);

  // Ordenar y filtrar datos
  const sortedAndFilteredCalles = useMemo(() => {
    let filteredData = [...calles];
    
    // Debug: Log datos de calles para verificar nombreBarrio
    if (filteredData.length > 0) {
      console.log('🔍 [CalleList] Primera calle:', filteredData[0]);
      console.log('🔍 [CalleList] nombreBarrio en primera calle:', filteredData[0].nombreBarrio);
    }

    // Aplicar filtro de búsqueda local siempre
    if (localSearchTerm) {
      filteredData = filteredData.filter(calle => {
        const nombreCompleto = getNombreCompleto(calle).toLowerCase();
        const ubicacion = getUbicacion(calle).toLowerCase();
        const searchLower = localSearchTerm.toLowerCase();
        
        return nombreCompleto.includes(searchLower) || ubicacion.includes(searchLower);
      });
    }

    // Ordenar
    filteredData.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (orderBy === 'ubicacion') {
        aValue = getUbicacion(a);
        bValue = getUbicacion(b);
      } else {
        aValue = a[orderBy as keyof Calle];
        bValue = b[orderBy as keyof Calle];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  }, [calles, order, orderBy, localSearchTerm, onSearch, getUbicacion]);

  // Calcular datos paginados
  const paginatedCalles = sortedAndFilteredCalles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Skeleton rows para loading
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell align="center"><Skeleton width={40} /></TableCell>
      </TableRow>
    ));
  };

  // Obtener icono según tipo de vía
  const getTipoViaIcon = (tipoVia?: number | string) => {
    const tipo = typeof tipoVia === 'string' ? tipoVia?.toUpperCase() : String(tipoVia || '');
    if (tipo === 'AV' || tipo === 'AVENIDA') return <RouteIcon sx={{ fontSize: 16, color: 'primary.main' }} />;
    if (tipo === 'JR' || tipo === 'JIRON') return <HomeIcon sx={{ fontSize: 16, color: 'info.main' }} />;
    if (tipo === 'CALLE') return <MapIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    return <LocationCityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%',
        minWidth: '800px',
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
       
        {/* Barra de búsqueda expandida horizontalmente */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Buscar por nombre de calle o ubicación..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: localSearchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                height: 40,
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              }
            }}
            sx={{ maxWidth: '400px' }}
          />
          
          {/* Botón Buscar */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearchClick}
            disabled={!localSearchTerm.trim()}
            sx={{
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Buscar
          </Button>

          {/* Botón Nuevo */}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => {
              console.log('➕ [CalleList] Botón Nuevo clickeado');
              // Limpiar búsquedas
              setLocalSearchTerm('');
              setPage(0);
              // Ejecutar función de nuevo si existe
              if (onNuevaCalle) {
                console.log('📝 [CalleList] Ejecutando función onNuevaCalle');
                onNuevaCalle();
              }
            }}
            sx={{
              minWidth: 100,
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Nuevo
          </Button>
        </Box>

        {/* Tabla con scroll interno */}
        <TableContainer 
          component={Paper}
          elevation={2}
          sx={{ 
            width: '100%',
            height: 400,
            maxHeight: 400,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'auto',
            position: 'relative',
            '& .MuiTable-root': {
              minWidth: 750
            },
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.grey[200], 0.5),
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.5),
              }
            }
          }}
        >
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || 'left'}
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: theme.palette.background.paper, // Fondo sólido primero
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.08)})`, // Luego el color
                      color: theme.palette.primary.main,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      py: 2,
                      position: 'sticky',
                      top: 0,
                      zIndex: 10 // Aumentar z-index para asegurar que esté encima
                    }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as string)}
                        sx={{
                          color: 'inherit !important',
                          '&.Mui-active': {
                            color: `${theme.palette.primary.main} !important`,
                            '& .MuiTableSortLabel-icon': {
                              color: `${theme.palette.primary.main} !important`,
                            }
                          },
                          '&:hover': {
                            color: `${theme.palette.primary.dark} !important`,
                          }
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : paginatedCalles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 2 
                    }}>
                      <MapIcon sx={{ 
                        fontSize: 48, 
                        color: 'text.disabled' 
                      }} />
                      <Alert 
                        severity="info" 
                        variant="outlined"
                        sx={{ 
                          borderRadius: 2,
                          '& .MuiAlert-message': {
                            fontSize: '0.875rem'
                          }
                        }}
                      >
                        {localSearchTerm 
                          ? `No se encontraron calles con "${localSearchTerm}"`
                          : 'No hay calles registradas'}
                      </Alert>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCalles.map((calle, index) => (
                  <Fade in={true} key={calle.codVia || calle.id || `calle-${index}`} timeout={300 + (index * 100)}>
                    <TableRow
                      hover
                      selected={selectedId === (calle.codVia || calle.id)}
                      sx={{ 
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                          }
                        },
                        '&:nth-of-type(even):not(.Mui-selected)': {
                          bgcolor: alpha(theme.palette.grey[100], 0.3),
                        }
                      }}
                    >
                      <TableCell sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5
                        }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                            }}
                          >
                            {getTipoViaIcon(calle.descTipoVia || calle.nombreTipoVia)}
                          </Box>
                          <Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 500,
                                color: theme.palette.text.primary,
                                mb: 0.5
                              }}
                            >
                              {getNombreCompleto(calle)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                fontSize: '0.75rem'
                              }}
                            >
                              Calle #{calle.codVia || calle.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap'
                        }}>
                          <Chip
                            icon={<LocationCityIcon fontSize="small" />}
                            label={calle.nombreSector || (obtenerNombreSector && calle.codSector ? obtenerNombreSector(calle.codSector) : `Sector ${calle.codSector ?? 'N/A'}`)}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.08),
                              color: theme.palette.info.dark,
                              borderColor: alpha(theme.palette.info.main, 0.3),
                              fontWeight: 500,
                              height: 28, // Altura aumentada
                              minHeight: 28, // Altura mínima
                              display: 'flex',
                              alignItems: 'center',
                              '& .MuiChip-root': {
                                alignItems: 'center'
                              },
                              '& .MuiChip-icon': {
                                color: theme.palette.info.main,
                                marginLeft: '5px',
                                marginRight: '-2px'
                              },
                              '& .MuiChip-label': {
                                paddingLeft: '8px',
                                paddingRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1
                              }
                            }}
                          />
                          <Chip
                            icon={<HomeIcon fontSize="small" />}
                            label={calle.nombreBarrio || (obtenerNombreBarrio ? obtenerNombreBarrio(calle.codBarrio || calle.codigoBarrio || 0) : `Barrio ${calle.codBarrio || calle.codigoBarrio || 'N/A'}`)}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.08),
                              color: theme.palette.success.dark,
                              borderColor: alpha(theme.palette.success.main, 0.3),
                              fontWeight: 500,
                              height: 28, // Altura aumentada
                              minHeight: 28, // Altura mínima
                              display: 'flex',
                              alignItems: 'center',
                              '& .MuiChip-root': {
                                alignItems: 'center'
                              },
                              '& .MuiChip-icon': {
                                color: theme.palette.success.main,
                                marginLeft: '5px',
                                marginRight: '-2px'
                              },
                              '& .MuiChip-label': {
                                paddingLeft: '8px',
                                paddingRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ py: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
                      >
                        <Tooltip title="Editar calle" arrow>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCalle(calle);
                            }}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.16),
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={sortedAndFilteredCalles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Stack>
    </Paper>
  );
};

export default CalleListMUI;