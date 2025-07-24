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
  Skeleton
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ShowChartIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { UITData } from '../../services/uitService';
import { NotificationService } from '../utils/Notification';

interface UitListProps {
  uits: UITData[];
  onEditar?: (uit: UITData) => void;
  onEliminar?: (id: number) => Promise<void>;
  loading?: boolean;
  uitSeleccionada?: UITData | null;
}

/**
 * Componente para mostrar la lista de UITs con DataGrid de MUI
 */
const UitList: React.FC<UitListProps> = ({
  uits,
  onEditar,
  onEliminar,
  loading = false,
  uitSeleccionada
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Filtrar UITs según búsqueda
  const filteredUits = uits.filter(uit => 
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

  // Manejar eliminación
  const handleEliminar = async (id: number) => {
    if (!onEliminar) return;
    
    try {
      await onEliminar(id);
      NotificationService.success('UIT eliminada exitosamente');
    } catch (error) {
      NotificationService.error('Error al eliminar UIT');
    }
  };

  // Exportar datos
  const handleExportar = () => {
    // Aquí iría la lógica de exportación
    NotificationService.info('Funcionalidad de exportación en desarrollo');
  };

  // Definir columnas para DataGrid
  const columns: GridColDef[] = [
    {
      field: 'anio',
      headerName: 'Año',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'valor',
      headerName: 'Valor UIT',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={500} color="primary">
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value || 'ACTIVO'}
          size="small"
          color={params.value === 'ACTIVO' ? 'success' : 'default'}
          variant={params.value === 'ACTIVO' ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'fechaVigenciaDesde',
      headerName: 'Vigencia Desde',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString('es-PE') : '-'}
        </Typography>
      )
    },
    {
      field: 'fechaVigenciaHasta',
      headerName: 'Vigencia Hasta',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value ? new Date(params.value).toLocaleDateString('es-PE') : '-'}
        </Typography>
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEditar?.(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => handleEliminar(params.row.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // Obtener año actual y calcular variación
  const anioActual = new Date().getFullYear();
  const uitActual = uits.find(u => u.anio === anioActual);
  const uitAnterior = uits.find(u => u.anio === anioActual - 1);
  const variacion = uitActual && uitAnterior 
    ? ((uitActual.valor - uitAnterior.valor) / uitAnterior.valor) * 100 
    : 0;

  return (
    <Paper 
      elevation={3}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShowChartIcon color="primary" />
            <Typography variant="h6" fontWeight={500}>
              Historial de Valores UIT
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Actualizar
            </Button>
            <Button
              size="small"
              startIcon={<ExportIcon />}
              onClick={handleExportar}
              variant="outlined"
            >
              Exportar
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Estadísticas */}
      {uitActual && (
        <Box sx={{ px: 3, py: 2, bgcolor: theme.palette.grey[50] }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                UIT {anioActual}
              </Typography>
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatCurrency(uitActual.valor)}
              </Typography>
            </Box>
            {variacion !== 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Variación anual
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUpIcon 
                    fontSize="small" 
                    color={variacion > 0 ? "success" : "error"}
                  />
                  <Typography 
                    variant="h6" 
                    fontWeight={600}
                    color={variacion > 0 ? "success.main" : "error.main"}
                  >
                    {variacion.toFixed(1)}%
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* Barra de búsqueda */}
      <Box sx={{ px: 3, py: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar por año o valor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Tabla de datos */}
      <Box sx={{ flexGrow: 1, px: 3, pb: 3 }}>
        <DataGrid
          rows={filteredUits}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          loading={loading}
          autoHeight
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              },
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12)
                }
              }
            }
          }}
          getRowClassName={(params) => 
            uitSeleccionada && params.row.id === uitSeleccionada.id ? 'Mui-selected' : ''
          }
          localeText={{
            noRowsLabel: 'No hay datos de UIT disponibles',
            MuiTablePagination: {
              labelRowsPerPage: 'Filas por página:',
            }
          }}
          slots={{
            noRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center" spacing={2}>
                <MoneyIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                <Typography variant="body1" color="text.secondary">
                  No hay datos de UIT disponibles
                </Typography>
              </Stack>
            ),
            loadingOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                <CircularProgress />
              </Stack>
            )
          }}
        />
      </Box>
    </Paper>
  );
};

export default UitList;