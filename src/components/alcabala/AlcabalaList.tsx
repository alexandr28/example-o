// src/components/alcabala/AlcabalaList.tsx
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
  Pagination,
  useTheme,
  alpha,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Alcabala, PaginacionOptions } from '../../models/Alcabala';

interface AlcabalaListProps {
  alcabalas: Alcabala[];
  paginacion: PaginacionOptions;
  onCambiarPagina: (pagina: number) => void;
  loading?: boolean;
  onEditar?: (alcabala: Alcabala) => void;
  onEliminar?: (alcabala: Alcabala) => void;
}

/**
 * Componente para mostrar la lista de valores de Alcabala con Material-UI
 */
const AlcabalaList: React.FC<AlcabalaListProps> = ({
  alcabalas,
  paginacion,
  onCambiarPagina,
  loading = false,
  onEditar,
  onEliminar
}) => {
  const theme = useTheme();

  // Formatear porcentaje
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Obtener color del chip según el estado
  const getEstadoColor = (estado?: string): 'success' | 'default' => {
    return estado === 'ACTIVO' ? 'success' : 'default';
  };

  // Manejar cambio de página
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onCambiarPagina(value);
  };

  // Calcular total de páginas
  const totalPaginas = Math.ceil(paginacion.total / paginacion.porPagina);

  return (
    <Paper 
      elevation={1}
      sx={{ 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
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
          <TrendingUpIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={500}>
            Lista de valores de alcabala
          </Typography>
        </Stack>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Stack spacing={1}>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} height={60} animation="wave" />
              ))}
            </Stack>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" stickyHeader>
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
                    TASA
                  </TableCell>
                  {(onEditar || onEliminar) && (
                    <TableCell 
                      align="center"
                      sx={{ 
                        bgcolor: theme.palette.grey[50],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: theme.palette.text.secondary,
                        width: 100
                      }}
                    >
                      ACCIONES
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {alcabalas.length > 0 ? (
                  alcabalas.map((alcabala) => (
                    <TableRow 
                      key={alcabala.id || alcabala.anio} 
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Chip
                            label={alcabala.anio}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                          {alcabala.estado && (
                            <Chip
                              label={alcabala.estado}
                              size="small"
                              color={getEstadoColor(alcabala.estado)}
                              variant="filled"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<ReceiptIcon fontSize="small" />}
                          label={formatPercentage(alcabala.tasa)}
                          size="medium"
                          color="secondary"
                          sx={{ 
                            fontWeight: 600,
                            minWidth: 80
                          }}
                        />
                      </TableCell>
                      {(onEditar || onEliminar) && (
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {onEditar && (
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => onEditar(alcabala)}
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onEliminar && (
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  onClick={() => onEliminar(alcabala)}
                                  sx={{ 
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.error.main, 0.1)
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                      <Stack alignItems="center" spacing={2}>
                        <ReceiptIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                        <Typography variant="body1" color="text.secondary">
                          No hay datos de alcabala disponibles
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <Box 
          sx={{ 
            p: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: theme.palette.grey[50]
          }}
        >
          <Pagination
            count={totalPaginas}
            page={paginacion.pagina}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Resumen */}
      {!loading && alcabalas.length > 0 && (
        <Box 
          sx={{ 
            px: 3,
            py: 1.5,
            bgcolor: theme.palette.grey[100],
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Mostrando {alcabalas.length} de {paginacion.total} registros
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AlcabalaList;