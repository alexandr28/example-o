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
  Button,
  Skeleton,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ShowChartIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { UITData } from '../../services/uitService';
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
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5, // Reducir a 5 filas por página
  });

  // Filtrar UITs únicos por año (eliminar duplicados de alícuotas)
  const uitsUnicos = uits.reduce((acc: UITData[], uit: UITData) => {
    const existeAnio = acc.find(u => u.anio === uit.anio);
    
    if (!existeAnio) {
      // Primer registro de este año
      acc.push(uit);
    } else {
      // Si ya existe el año, dar prioridad a registros con valor UIT válido
      const esValorUIT = uit.valor > 0 || (uit.valorUit && uit.valorUit > 0);
      const existenteEsValorUIT = existeAnio.valor > 0 || (existeAnio.valorUit && existeAnio.valorUit > 0);
      
      // Priorizar registros que no son alícuotas (sin rangoInicial)
      const esAlicuota = uit.alicuota !== undefined && uit.rangoInicial !== undefined;
      const existenteEsAlicuota = existeAnio.alicuota !== undefined && existeAnio.rangoInicial !== undefined;
      
      if (esValorUIT && !esAlicuota && (existenteEsAlicuota || !existenteEsValorUIT)) {
        // Reemplazar con el registro de valor UIT (no alícuota)
        const index = acc.findIndex(u => u.anio === uit.anio);
        acc[index] = uit;
      }
    }
    
    return acc;
  }, []);

  console.log('🔍 [UitList] UITs originales:', uits.length, 'UITs únicos:', uitsUnicos.length);
  console.log('📊 [UitList] UITs únicos detalle:', uitsUnicos.map(u => ({
    anio: u.anio,
    valor: u.valor,
    valorUit: u.valorUit,
    esAlicuota: u.alicuota !== undefined
  })));

  // Filtrar UITs según búsqueda
  const filteredUits = uitsUnicos.filter(uit => 
    uit.anio.toString().includes(searchTerm) ||
    uit.valor.toString().includes(searchTerm)
  );

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Formatear número sin símbolo de moneda
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };


  // Exportar datos
  const handleExportar = () => {
    // Aquí iría la lógica de exportación
    NotificationService.info('Funcionalidad de exportación en desarrollo');
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Definir columnas para DataGrid con mejor styling y alineación corregida
  const columns: GridColDef[] = [
    {
      field: 'anio',
      headerName: 'Año',
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
          <Chip
            icon={<CalendarIcon fontSize="small" />}
            label={params.value}
            size="small"
            variant="outlined"
            color="primary"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              height: 28,
              '& .MuiChip-icon': {
                color: theme.palette.primary.main
              },
              '& .MuiChip-label': {
                paddingLeft: 1,
                paddingRight: 1,
                fontSize: '0.8rem'
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'valor',
      headerName: 'Valor UIT',
      width: 200,
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
            fontWeight={700}
            sx={{
              color: theme.palette.success.main,
              fontSize: '0.875rem',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {formatNumber(params.value)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'fechaVigenciaDesde',
      headerName: 'Vigencia Desde',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          gap={1}
          sx={{ py: 1 }}
        >
          <CalendarIcon 
            fontSize="small" 
            sx={{ color: theme.palette.info.main }} 
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            {params.value ? new Date(params.value).toLocaleDateString('es-PE') : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'fechaVigenciaHasta',
      headerName: 'Vigencia Hasta',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          width="100%"
          gap={1}
          sx={{ py: 1 }}
        >
          <CalendarIcon 
            fontSize="small" 
            sx={{ color: theme.palette.warning.main }} 
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            {params.value ? new Date(params.value).toLocaleDateString('es-PE') : '-'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 120,
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
        >
          <Tooltip title="Editar UIT" arrow>
            <IconButton
              size="small"
              onClick={() => onEditar?.(params.row)}
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
        </Box>
      )
    }
  ];

  // Obtener año actual y calcular variación usando datos únicos
  const anioActual = new Date().getFullYear();
  const uitActual = uitsUnicos.find(u => u.anio === anioActual);
  const uitAnterior = uitsUnicos.find(u => u.anio === anioActual - 1);
  const variacion = uitActual && uitAnterior 
    ? ((uitActual.valor - uitAnterior.valor) / uitAnterior.valor) * 100 
    : 0;

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
          
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<CalendarIcon />}
              label={`Año Actual: ${anioActual}`}
              color="primary"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<MoneyIcon />}
              label={uitActual ? formatCurrency(uitActual.valor) : 'N/A'}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {variacion !== 0 && (
              <Chip
                icon={variacion > 0 ? <TrendingUpIcon /> : <ShowChartIcon />}
                label={`${variacion > 0 ? '+' : ''}${variacion.toFixed(1)}%`}
                color={variacion > 0 ? 'success' : 'error'}
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Sección de estadísticas con Flexbox */}
      <Box sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.grey[50], 0.5) }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          '@media (max-width: 600px)': {
            flexDirection: 'column'
          }
        }}>
          {/* Card 1 - Año Actual */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
            minWidth: { xs: '100%', sm: '200px', md: '150px' }
          }}>
            <Card elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {anioActual}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Año Actual
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Card 2 - Valor UIT Vigente */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
            minWidth: { xs: '100%', sm: '200px', md: '150px' }
          }}>
            <Card elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MoneyIcon color="success" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {uitActual ? formatCurrency(uitActual.valor) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Valor UIT Vigente
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Card 3 - Variación Anual */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
            minWidth: { xs: '100%', sm: '200px', md: '150px' }
          }}>
            <Card elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShowChartIcon color={variacion >= 0 ? 'success' : 'error'} />
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      color={variacion >= 0 ? 'success.main' : 'error.main'}
                    >
                      {variacion !== 0 ? `${variacion > 0 ? '+' : ''}${variacion.toFixed(1)}%` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Variación Anual
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Card 4 - Total Registros */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
            minWidth: { xs: '100%', sm: '200px', md: '150px' }
          }}>
            <Card elevation={1} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccountBalanceIcon color="info" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} color="info.main">
                      {uitsUnicos.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Registros
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Barra de búsqueda mejorada */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por año o valor UIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
          />
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
              onClick={handleExportar}
              sx={{ borderRadius: 2 }}
            >
              Exportar
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 2 }}
            >
              Actualizar
            </Button>
          </Stack>
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
            loading={loading}
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
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                maxHeight: '56px !important',
                minHeight: '56px !important',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`,
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