// src/components/aranceles/ListaArancelesPorDireccion.tsx
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
  IconButton,
  Tooltip,
  TablePagination,
  Skeleton,
  Stack,
  InputAdornment,
  Chip,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import SearchableSelect from '../ui/SearchableSelect';
import { useAranceles } from '../../hooks/useAranceles';
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
  const anioOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: currentYear - i,
      value: currentYear - i,
      label: (currentYear - i).toString(),
      description: i === 0 ? 'Año actual' : `Hace ${i} años`
    }));
  }, [currentYear]);

  // Efecto para buscar cuando cambia el año
  useEffect(() => {
    if (anioSeleccionado) {
      buscarArancelesPorDireccion(anioSeleccionado.value);
    }
  }, [anioSeleccionado, buscarArancelesPorDireccion]);

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
    return `${arancel.sector} + ${arancel.barrio}, ${arancel.tipoVia} ${arancel.nombreVia} - Cuadra ${arancel.cuadra}`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <LocationIcon color="primary" />
          <Typography variant="h6" component="h3">
            Lista de Aranceles por Dirección
          </Typography>
        </Stack>

        {/* Controles de búsqueda */}
        <Stack spacing={2} mb={2}>
          {/* Selector de año usando SearchableSelect */}
          <SearchableSelect
            label="Seleccione el año"
            options={anioOptions}
            value={anioSeleccionado}
            onChange={setAnioSeleccionado}
            placeholder="Seleccione un año..."
            required
            size="small"
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">{option.label}</Typography>
                    {option.description && (
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          />

          {/* Campo de búsqueda */}
          {anioSeleccionado && arancelesPorDireccion.length > 0 && (
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por dirección o monto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Stack>

        {/* Mensaje informativo */}
        {!anioSeleccionado && (
          <Alert severity="info" icon={<CalendarIcon />}>
            Seleccione un año para ver los aranceles asignados
          </Alert>
        )}

        {/* Resumen de resultados */}
        {anioSeleccionado && !loading && (
          <Stack direction="row" spacing={1} mb={2}>
            <Chip
              size="small"
              label={`Año: ${anioSeleccionado.label}`}
              color="primary"
              icon={<CalendarIcon />}
            />
            <Chip
              size="small"
              label={`${arancelesFiltrados.length} registros`}
              color="default"
            />
          </Stack>
        )}
      </CardContent>

      {/* Tabla */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, pb: 2 }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} height={60} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : anioSeleccionado && arancelesPorDireccion.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Sector</TableCell>
                  <TableCell>Barrio</TableCell>
                  <TableCell>Cuadra</TableCell>
                  <TableCell>Lado</TableCell>
                  <TableCell>Lotes</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arancelesPaginados.map((arancel) => (
                  <TableRow key={arancel.id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                        {`${arancel.tipoVia} ${arancel.nombreVia}`}
                      </Typography>
                    </TableCell>
                    <TableCell>{arancel.sector}</TableCell>
                    <TableCell>{arancel.barrio}</TableCell>
                    <TableCell align="center">{arancel.cuadra}</TableCell>
                    <TableCell>{arancel.lado}</TableCell>
                    <TableCell>{`${arancel.loteInicial} - ${arancel.loteFinal}`}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(arancel.monto)}
                        color="success"
                        size="small"
                        icon={<MoneyIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : anioSeleccionado && arancelesPorDireccion.length === 0 ? (
          <Alert severity="warning">
            No se encontraron aranceles para el año {anioSeleccionado.label}
          </Alert>
        ) : null}
      </Box>

      {/* Paginación */}
      {anioSeleccionado && arancelesPorDireccion.length > 0 && (
        <TablePagination
          component="div"
          count={arancelesFiltrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Card>
  );
};