// src/components/uit/UitList.tsx
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { UITData, uitService } from '../../services/uitService';
import { NotificationService } from '../utils/Notification';

interface UitListProps {
  uits: UITData[];
  onEditar?: (uit: UITData) => void;
  loading?: boolean;
  uitSeleccionada?: UITData | null;
}

/**
 * Componente para mostrar la lista de UITs con DataGrid de MUI
 */
const UitList: React.FC<UitListProps> = ({
  uits,
  onEditar,
  loading = false,
  uitSeleccionada
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UITData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5, // Reducir a 5 filas por página
  });

  // Función para procesar UITs - NO eliminar duplicados, mostrar todos los registros
  const procesarUItsUnicos = (uitsArray: UITData[]) => {
    // Mostrar todos los registros tal como vienen del API
    // No filtrar duplicados ya que cada registro puede representar una alícuota diferente
    return uitsArray;
  };

  // Determinar qué datos mostrar: resultados de búsqueda o UITs originales
  const datosAMostrar = hasSearched ? searchResults : uits;
  const uitsUnicos = procesarUItsUnicos(datosAMostrar);

  console.log('🔍 [UitList] Modo:', hasSearched ? 'Búsqueda' : 'Datos originales');
  console.log('📊 [UitList] Datos a mostrar:', datosAMostrar.length, 'UITs únicos:', uitsUnicos.length);

  // Para búsquedas, mostrar todos los resultados; para datos originales, aplicar filtro de texto
  const filteredUits = hasSearched 
    ? uitsUnicos // Mostrar todos los resultados de búsqueda
    : uitsUnicos.filter(uit => 
        uit.anio.toString().includes(searchTerm) ||
        uit.valor.toString().includes(searchTerm)
      );


  // Formatear número sin símbolo de moneda
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
 
  // Función para buscar UITs por año
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      NotificationService.warning('Ingrese un año para buscar');
      return;
    }

    const año = parseInt(searchTerm.trim());
    if (isNaN(año) || año < 1990 || año > 2100) {
      NotificationService.error('Ingrese un año válido (entre 1990 y 2100)');
      return;
    }

    try {
      setIsSearching(true);
      console.log('🔍 [UitList] Buscando UITs para año:', año);
      
      const results = await uitService.listarUITs(año);
      console.log('📊 [UitList] Resultados encontrados:', results.length);
      
      setSearchResults(results);
      setHasSearched(true);
      
      if (results.length === 0) {
        NotificationService.info(`No se encontraron UITs para el año ${año}`);
      } else {
        NotificationService.success(`Se encontraron ${results.length} registro(s) para el año ${año}`);
      }
    } catch (error: any) {
      console.error('❌ [UitList] Error en búsqueda:', error);
      NotificationService.error('Error al buscar UITs: ' + (error.message || 'Error desconocido'));
      setSearchResults([]);
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
  };

  // Manejar Enter en el campo de búsqueda
  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Definir columnas para DataGrid con mejor styling y alineación corregida
  const columns: GridColDef[] = [
    {
      field: 'anio',
      headerName: 'Año',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
        >
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            color="primary"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              height: 24,
              '& .MuiChip-label': {
                paddingLeft: 1,
                paddingRight: 1,
                fontSize: '0.75rem'
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'valorUit',
      headerName: 'Valor UIT',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        // Usar valorUit si existe, sino usar valor
        const valorMostrar = params.row.valorUit || params.row.valor || 0;
        return (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            width="100%"
            sx={{ py: 1 }}
          >
            <Typography 
              variant="body2" 
              fontWeight={700}
              sx={{
                color: theme.palette.success.main,
                fontSize: '0.8rem',
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              S/ {formatNumber(valorMostrar)}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'alicuota',
      headerName: 'Alícuota (%)',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.text.primary,
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            {params.value ? `${(params.value * 100).toFixed(1)}%` : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'rangoInicial',
      headerName: 'Rango Inicial',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8rem'
            }}
          >
            {params.value !== undefined ? formatNumber(params.value) : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'rangoFinal',
      headerName: 'Rango Final',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8rem'
            }}
          >
            {params.value !== undefined && params.value > 0 ? formatNumber(params.value) : params.value === 0 ? '∞' : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'impuestoParcial',
      headerName: 'Imp. Parcial',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.info.main,
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            {params.value !== undefined ? formatNumber(params.value) : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'impuestoAcumulado',
      headerName: 'Imp. Acumulado',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
        >
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.warning.main,
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {params.value !== undefined ? formatNumber(params.value) : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100%"
          width="100%"
          sx={{ py: 1 }}
          onClick={(e) => e.stopPropagation()} // Prevenir propagación del click
        >
          <Tooltip title="Editar UIT" arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevenir que el click se propague a la fila
                console.log('🎯 [UitList] Editando UIT:', params.row);
                onEditar?.(params.row);
              }}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  borderColor: theme.palette.primary.main,
                  transform: 'scale(1.05)',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <EditIcon 
                sx={{ 
                  fontSize: 16,
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }} 
              />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Obtener año actual y calcular variación usando datos únicos
  const anioActual = new Date().getFullYear();
  const uitActual = uitsUnicos.find(u => u.anio === anioActual);
  const uitAnterior = uitsUnicos.find(u => u.anio === anioActual - 1);

  return (
    <Paper 
      elevation={3}
      sx={{ 
        height: 'auto', // Cambiar a altura automática
        maxHeight: '700px', // Altura máxima más reducida
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {/* Header mejorado */}
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        p: 3
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <AccountBalanceIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Valores UIT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unidad Impositiva Tributaria - Histórico
              </Typography>
            </Box>
          </Box>
     
        </Stack>
      </Box>

 
      {/* Barra de búsqueda por Año */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          justifyContent="flex-start"
          sx={{ 
            minHeight: 33,
            alignItems: 'center', // Reforzar alineación vertical
            '& > *': { // Aplicar a todos los hijos directos
              margin: 0,
              alignSelf: 'center'
            }
          }}
        >
          <TextField
            size="small"
            placeholder="Ingrese año"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              maxWidth: 150,
              margin: 0, // Eliminar márgenes que puedan causar desalineación
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: 33, // Mismo height que el botón
                display: 'flex',
                alignItems: 'center',
                margin: 0,
                '& input': {
                  padding: '8.5px 14px', // Padding estándar de MUI small
                  height: 'auto',
                  lineHeight: 1,
                },
                '& .MuiInputAdornment-root': {
                  height: '100%',
                  maxHeight: 33,
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
          />
          
          {/* Botones de búsqueda */}
          <Button
            variant="contained"
            startIcon={isSearching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            sx={{
              minWidth: 100,
              height: 33,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              margin: 0, // Eliminar márgenes
              padding: '0 16px', // Padding interno consistente
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxSizing: 'border-box'
            }}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>

          {/* Botón para mostrar todos los datos nuevamente */}
          {hasSearched && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleClearSearch}
              sx={{
                minWidth: 100,
                height: 33, // Mismo height que los otros elementos
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                margin: 0, // Eliminar márgenes
                padding: '0 16px', // Padding interno consistente
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxSizing: 'border-box'
              }}
            >
              Ver Todos
            </Button>
          )}

        </Stack>
      </Box>

      {/* Tabla de datos mejorada con altura reducida */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Paper 
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            height: 350, // Altura fija más pequeña
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <DataGrid
            rows={filteredUits}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 15]}
            disableRowSelectionOnClick
            loading={loading || isSearching}
            rowHeight={56} // Altura específica para mejor alineación
            sx={{
              border: 'none',
              height: '100%',
              '& .MuiDataGrid-main': {
                borderRadius: 0,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                minHeight: '48px !important',
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-within': {
                    outline: 'none',
                  },
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.85rem'
                },
                '& .MuiDataGrid-sortIcon': {
                  color: theme.palette.primary.main,
                }
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                },
              },
              '& .MuiDataGrid-row': {
                cursor: 'default', // Cambiar cursor para indicar que la fila no es clickeable
                transition: 'all 0.2s ease-in-out',
                maxHeight: '56px !important',
                minHeight: '56px !important',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02), // Hover más sutil
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                  }
                },
                '&:nth-of-type(even):not(.Mui-selected)': {
                  backgroundColor: alpha(theme.palette.grey[50], 0.3),
                }
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: alpha(theme.palette.grey[50], 0.5),
                borderTop: `1px solid ${theme.palette.divider}`,
                minHeight: '52px',
                '& .MuiTablePagination-root': {
                  color: theme.palette.text.secondary,
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
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
              },
              '& .MuiDataGrid-overlay': {
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(2px)',
              },
              // Personalizar scrollbar interno
              '& .MuiDataGrid-virtualScroller': {
                '&::-webkit-scrollbar': {
                  width: 8,
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.grey[300], 0.2),
                  borderRadius: 4,
                },
                '& ::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                  }
                },
              },
              // Asegurar que el contenido no se desborde
              '& .MuiDataGrid-virtualScrollerContent': {
                height: 'auto !important',
              },
              '& .MuiDataGrid-virtualScrollerRenderZone': {
                position: 'relative',
              }
            }}
            getRowClassName={(params) => 
              uitSeleccionada && params.row.id === uitSeleccionada.id ? 'Mui-selected' : ''
            }
            localeText={{
              noRowsLabel: 'No hay datos de UIT disponibles',
              paginationRowsPerPage: 'Filas por página:',
              paginationDisplayedRows: ({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`,
            }}
            slots={{
              noRowsOverlay: () => (
                <Stack 
                  height="100%" 
                  alignItems="center" 
                  justifyContent="center" 
                  spacing={3}
                  sx={{ py: 4 }}
                >
                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                  }}>
                    <MoneyIcon sx={{ 
                      fontSize: 64, 
                      color: alpha(theme.palette.primary.main, 0.4)
                    }} />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No hay datos de UIT disponibles
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {searchTerm ? 
                        `No se encontraron resultados para "${searchTerm}"` :
                        'Aún no se han registrado valores UIT'
                      }
                    </Typography>
                  </Box>
                </Stack>
              ),
              loadingOverlay: () => (
                <Stack 
                  height="100%" 
                  alignItems="center" 
                  justifyContent="center" 
                  spacing={2}
                  sx={{ py: 4 }}
                >
                  <CircularProgress 
                    size={48} 
                    thickness={4}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    Cargando datos de UIT...
                  </Typography>
                </Stack>
              )
            }}
          />
        </Paper>
      </Box>
    </Paper>
  );
};

export default UitList;