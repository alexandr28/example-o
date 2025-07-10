// src/components/uit/UitList.tsx
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { UIT } from '../../models/UIT';

interface UitListProps {
  uits: UIT[];
  loading?: boolean;
}

/**
 * Componente para mostrar la lista de UITs en formato de tabla
 */
const UitList: React.FC<UitListProps> = ({
  uits,
  loading = false
}) => {
  const theme = useTheme();

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Obtener color según la tasa
  const getTasaChipColor = (tasa: number): 'success' | 'warning' | 'error' => {
    if (tasa <= 0.2) return 'success';
    if (tasa <= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box 
        sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ShowChartIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Lista de UIT
          </Typography>
        </Stack>
      </Box>
      
      {loading ? (
        <Box sx={{ p: 3 }}>
          <Stack spacing={1}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} height={60} animation="wave" />
            ))}
          </Stack>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CalendarIcon fontSize="small" />
                    <span>AÑO</span>
                  </Stack>
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  UIT
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  TASA
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  RANGO INICIAL
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  RANGO FINAL
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  IMPUESTO PARCIAL
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    bgcolor: theme.palette.grey[50],
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  IMPUESTO ACUMULADO
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uits.length > 0 ? (
                uits.map((uit, index) => (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={uit.anio}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(uit.uit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatPercentage(uit.tasa)}
                        size="small"
                        color={getTasaChipColor(uit.tasa)}
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(uit.rangoInicial)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {typeof uit.rangoFinal === 'number' 
                          ? formatCurrency(uit.rangoFinal) 
                          : <Chip label="Sin límite" size="small" />
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(uit.impuestoParcial)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Estado del impuesto acumulado">
                        <Chip
                          label={uit.impuestoAcumulado}
                          size="small"
                          color={uit.impuestoAcumulado === 'ACTIVO' ? 'success' : 'default'}
                          variant={uit.impuestoAcumulado === 'ACTIVO' ? 'filled' : 'outlined'}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <MoneyIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                      <Typography variant="body1" color="text.secondary">
                        No hay datos de UIT disponibles
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resumen al pie */}
      {!loading && uits.length > 0 && (
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: theme.palette.grey[50],
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <TrendingUpIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Mostrando {uits.length} registros de UIT
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default UitList;