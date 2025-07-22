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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
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
import { ArancelData } from '../../services/arancelService';
import { NotificationService } from '../utils/Notification';

export const ListaArancelesPorDireccion: React.FC = () => {
  // Estados
  const [anioSeleccionado, setAnioSeleccionado] = useState<{id: number, value: number, label: string} | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [arancelToDelete, setArancelToDelete] = useState<ArancelData | null>(null);

  // Hook
  const { aranceles, loading, eliminarArancel, recargar } = useAranceles(anioSeleccionado?.value);

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

  // Filtrar aranceles según búsqueda
  const arancelesFiltrados = useMemo(() => {
    if (!busqueda) return aranceles;
    
    const searchTerm = busqueda.toLowerCase();
    return aranceles.filter(arancel => {
      // Como ahora no tenemos los datos de dirección completos en el arancel,
      // solo podemos buscar por costo o ID de dirección
      return arancel.costoArancel.toString().includes(searchTerm) ||
             arancel.codDireccion.toString().includes(searchTerm);
    });
  }, [aranceles, busqueda]);

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

  const handleDeleteClick = (arancel: ArancelData) => {
    setArancelToDelete(arancel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (arancelToDelete?.codArancel) {
      try {
        await eliminarArancel(arancelToDelete.codArancel);
        setDeleteDialogOpen(false);
        setArancelToDelete(null);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setArancelToDelete(null);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <LocationIcon color="primary" />
          <Typography variant="h6" component="h3">
            Lista de Aranceles por Año
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
          {anioSeleccionado && aranceles.length > 0 && (
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por costo o código de dirección..."
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
        ) : anioSeleccionado && aranceles.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Año</TableCell>
                  <TableCell>Código Dirección</TableCell>
                  <TableCell align="right">Costo Arancel</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arancelesPaginados.map((arancel) => (
                  <TableRow key={arancel.codArancel || `${arancel.anio}-${arancel.codDireccion}`} hover>
                    <TableCell>{arancel.codArancel || 'N/A'}</TableCell>
                    <TableCell>{arancel.anio}</TableCell>
                    <TableCell>{arancel.codDireccion}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(arancel.costoArancel)}
                        color="success"
                        size="small"
                        icon={<MoneyIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            // Navegar a la página de edición o abrir modal
                            NotificationService.info('Seleccione el arancel en el formulario de asignación para editarlo');
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(arancel)}
                          disabled={!arancel.codArancel}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : anioSeleccionado && aranceles.length === 0 ? (
          <Alert severity="warning">
            No se encontraron aranceles para el año {anioSeleccionado.label}
          </Alert>
        ) : null}
      </Box>

      {/* Paginación */}
      {anioSeleccionado && aranceles.length > 0 && (
        <TablePagination
          component="div"
          count={arancelesFiltrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar este arancel?
          </Typography>
          {arancelToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Año: {arancelToDelete.anio}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Costo: {formatCurrency(arancelToDelete.costoArancel)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};