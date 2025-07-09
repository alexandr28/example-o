// src/components/mantenedores/aranceles/ListaArancelesPorDireccion.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  TablePagination,
  Skeleton,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { useAranceles } from '../..//hooks/useAranceles';
import { formatCurrency } from '../../utils/formatters';

interface ArancelDireccion {
  id: number;
  anio: number;
  direccion: string;
  sector: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  cuadra: number;
  lado: string;
  loteInicial: number;
  loteFinal: number;
  monto: number;
  estado: boolean;
}

export const ListaArancelesPorDireccion: React.FC = () => {
  // Estados
  const [anioSeleccionado, setAnioSeleccionado] = useState<{id: number, value: number, label: string} | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Hook
  const { arancelesPorDireccion, loading, buscarArancelesPorDireccion } = useAranceles();

  // Generar opciones de años
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    id: currentYear - i,
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  // Efecto para buscar cuando cambia el año
  useEffect(() => {
    if (anioSeleccionado?.value) {
      buscarArancelesPorDireccion(anioSeleccionado.value);
    }
  }, [anioSeleccionado]);

  // Filtrar aranceles según búsqueda
  const arancelesFiltrados = useMemo(() => {
    if (!busqueda) return arancelesPorDireccion;
    
    const searchTerm = busqueda.toLowerCase();
    return arancelesPorDireccion.filter(arancel => {
      const direccionCompleta = `${arancel.sector} ${arancel.barrio} ${arancel.tipoVia} ${arancel.nombreVia} ${arancel.cuadra} ${arancel.lado}`.toLowerCase();
      return direccionCompleta.includes(searchTerm) || 
             arancel.monto.toString().includes(searchTerm);
    });
  }, [arancelesPorDireccion, busqueda]);

  // Paginación
  const arancelesPaginados = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return arancelesFiltrados.slice(start, end);
  }, [arancelesFiltrados, page, rowsPerPage]);

  // Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatearDireccion = (arancel: ArancelDireccion) => {
    return `${arancel.sector} + ${arancel.barrio} + ${arancel.tipoVia} + ${arancel.nombreVia} + CUADRA ${arancel.cuadra} + LADO ${arancel.lado} + LT ${arancel.loteInicial} - ${arancel.loteFinal}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Lista de aranceles por dirección
        </Typography>

        {/* Controles de búsqueda compactados */}
        <Box sx={{ mb: 3, mt: 2, maxWidth: '50%' }}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <SearchableSelect
                label="Año"
                options={yearOptions}
                value={anioSeleccionado}
                onChange={(option) => setAnioSeleccionado(option)}
                placeholder="Seleccione"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Buscar por dirección..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }
                }}
                size="small"
              />
            </Box>
          </Stack>
        </Box>

        {/* Tabla de resultados */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2">AÑO</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2">DIRECCIÓN</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                    <MoneyIcon fontSize="small" />
                    <Typography variant="subtitle2">MONTO</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" width={120}>
                  <Typography variant="subtitle2">ACCIONES</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Skeletons de carga
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={80} /></TableCell>
                  </TableRow>
                ))
              ) : arancelesPaginados.length > 0 ? (
                arancelesPaginados.map((arancel) => (
                  <TableRow 
                    key={arancel.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child td, &:last-child th': { border: 0 } 
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {arancel.anio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatearDireccion(arancel)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {formatCurrency(arancel.monto)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {anioSeleccionado 
                        ? 'No se encontraron aranceles para el año seleccionado'
                        : 'Seleccione un año para ver los aranceles'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {arancelesFiltrados.length > 0 && (
          <TablePagination
            component="div"
            count={arancelesFiltrados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        )}

        {/* Resumen usando Stack en lugar de Grid */}
        {arancelesFiltrados.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                Total de direcciones: <strong>{arancelesFiltrados.length}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monto total: <strong>{formatCurrency(
                  arancelesFiltrados.reduce((sum, a) => sum + a.monto, 0)
                )}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monto promedio: <strong>{formatCurrency(
                  arancelesFiltrados.reduce((sum, a) => sum + a.monto, 0) / arancelesFiltrados.length
                )}</strong>
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};