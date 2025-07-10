// src/components/predio/pisos/SelectorPredios.tsx
import React, { useState, useEffect } from 'react';
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
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { predioService } from '../../../services/predioService';

interface Predio {
  id: number | string;
  codigoPredio: string;
  tipoPredio: string;
  direccion?: string;
  contribuyente?: string;
  areaTerreno: number;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [predios, setPredios] = useState<Predio[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPredio, setSelectedPredio] = useState<Predio | null>(null);

  // Cargar predios cuando se abre el modal
  useEffect(() => {
    if (open) {
      cargarPredios();
    }
  }, [open]);

  // Cargar predios
  const cargarPredios = async () => {
    setLoading(true);
    try {
      const data = await predioService.getAll();
      setPredios(data);
    } catch (error) {
      console.error('Error al cargar predios:', error);
      // Datos de ejemplo si falla la API
      setPredios([
        {
          id: 1,
          codigoPredio: '1045',
          tipoPredio: 'Predio independiente',
          direccion: 'Av. Principal 123',
          contribuyente: 'Juan Pérez García',
          areaTerreno: 250.00
        },
        {
          id: 2,
          codigoPredio: '1022',
          tipoPredio: 'Departamento en edificio',
          direccion: 'Jr. Las Flores 456',
          contribuyente: 'María López Sánchez',
          areaTerreno: 120.50
        },
        {
          id: 3,
          codigoPredio: '1078',
          tipoPredio: 'Predio independiente',
          direccion: 'Calle Los Álamos 789',
          contribuyente: 'Carlos Rodríguez Díaz',
          areaTerreno: 180.75
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar predios
  const filteredPredios = predios.filter(predio =>
    predio.codigoPredio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    predio.contribuyente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const paginatedPredios = filteredPredios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        {/* Barra de búsqueda */}
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <TextField
            fullWidth
            placeholder="Buscar por código, dirección o contribuyente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {loading && <LinearProgress />}

        {/* Tabla de predios */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Contribuyente</TableCell>
                <TableCell align="center">Área (m²)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPredios.length > 0 ? (
                paginatedPredios.map((predio) => (
                  <TableRow
                    key={predio.id}
                    hover
                    selected={selectedPredio?.id === predio.id}
                    onClick={() => handleSelectPredio(predio)}
                    sx={{
                      cursor: 'pointer',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12)
                        }
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      {selectedPredio?.id === predio.id && (
                        <CheckIcon color="primary" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={predio.codigoPredio}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {predio.tipoPredio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {predio.direccion || 'Sin dirección'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {predio.contribuyente || 'No asignado'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {predio.areaTerreno.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No se encontraron predios
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredPredios.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25]}
        />
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