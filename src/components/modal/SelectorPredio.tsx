// src/components/modal/SelectorPredio.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Stack,
  InputAdornment,
  Radio,
  TablePagination,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { usePredios } from '../../hooks/usePredioAPI';
import { Predio } from '../../models/Predio';
import { formatCurrency } from '../../utils/formatters';

interface SelectorPredioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPredio: (predio: Predio) => void;
  title?: string;
  selectedId?: string | null;
  contribuyenteId?: number | null;
}

/**
 * Modal para seleccionar un predio
 */
const SelectorPredio: React.FC<SelectorPredioProps> = ({
  isOpen,
  onClose,
  onSelectPredio,
  title = 'Selector de predios',
  selectedId,
  contribuyenteId
}) => {
  const theme = useTheme();
  const { 
    predios, 
    loading, 
    error,
    cargarPredios,
    buscarPrediosConFormData
  } = usePredios();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPredio, setSelectedPredio] = useState<Predio | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar predios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (contribuyenteId) {
        // Usar el endpoint de búsqueda con Query Params como se especifica en la historia de usuario
        // http://26.161.18.122:8080/api/predio?codPredio=20231&anio=2023&direccion=1
        buscarPrediosConFormData('20231', 2023, 1);
      } else {
        cargarPredios();
      }
    }
  }, [isOpen, contribuyenteId, cargarPredios, buscarPrediosConFormData]);

  // Filtrar predios por búsqueda
  const filteredPredios = useMemo(() => {
    if (!searchTerm) return predios;
    
    const term = searchTerm.toLowerCase();
    return predios.filter(predio => 
      predio.codigoPredio?.toLowerCase().includes(term) ||
      predio.direccion?.toString().toLowerCase().includes(term)
    );
  }, [predios, searchTerm]);

  // Paginar resultados
  const paginatedPredios = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredPredios.slice(start, end);
  }, [filteredPredios, page, rowsPerPage]);

  // Handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSelectPredio = (predio: Predio) => {
    setSelectedPredio(predio);
  };

  const handleConfirm = () => {
    if (selectedPredio) {
      onSelectPredio(selectedPredio);
      onClose();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            aria-label="cerrar"
            onClick={onClose}
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          {/* Barra de búsqueda */}
          <TextField
            fullWidth
            placeholder="Ingrese código del predio o dirección"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <FilterIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Tabla de predios */}
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 50 }} />
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="caption" fontWeight={600}>
                      Código predio
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="caption" fontWeight={600}>
                      Dirección
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <Typography variant="caption" fontWeight={600}>
                      Área del Terreno
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <Typography variant="caption" fontWeight={600}>
                      Valor Arancel
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <Typography variant="caption" fontWeight={600}>
                      Valor Terreno
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <Typography variant="caption" fontWeight={600}>
                      Valor de Construcción
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <Typography variant="caption" fontWeight={600}>
                      Otras Instalaciones
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <Typography variant="caption" fontWeight={600}>
                      Autoavalúo
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : paginatedPredios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No se encontraron predios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPredios.map((predio) => {
                  const isSelected = selectedPredio?.codigoPredio === predio.codigoPredio;

                  return (
                    <TableRow
                      key={predio.codigoPredio}
                      hover
                      onClick={() => handleSelectPredio(predio)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'inherit',
                        '&:hover': {
                          bgcolor: isSelected 
                            ? alpha(theme.palette.primary.main, 0.12) 
                            : alpha(theme.palette.action.hover, 0.04)
                        }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={isSelected}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {predio.codigoPredio}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {predio.direccion || 'Dirección ' + predio.codigoPredio}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {predio.areaTerreno?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(predio.valorArancel || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(predio.valorTerreno || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(predio.valorConstruccion || predio.valorTotalConstruccion || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(predio.otrasInstalaciones || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(predio.autoavaluo || 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <TablePagination
            component="div"
            count={filteredPredios.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage=""
            labelDisplayedRows={() => ''}
            ActionsComponent={() => (
              <Stack direction="row" spacing={1}>
                {[1, 2, 3, 4].map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum - 1 ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setPage(pageNum - 1)}
                    sx={{ minWidth: 32, px: 1 }}
                  >
                    {pageNum}
                  </Button>
                ))}
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              </Stack>
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!selectedPredio}
          sx={{ 
            px: 4,
            bgcolor: '#4ECDC4',
            '&:hover': {
              bgcolor: '#45B8B0'
            }
          }}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorPredio;