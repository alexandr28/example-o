// src/components/modal/SelectorContribuyente.tsx
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
  Chip,
  Tabs,
  Tab,
  Radio,
  TablePagination,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBox as AccountBoxIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useContribuyentes } from '../../hooks/useContribuyentes';
import { NotificationService } from '../utils/Notification';

// Interfaz para Contribuyente
interface Contribuyente {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica';
}

// Props del componente
interface SelectorContribuyenteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContribuyente: (contribuyente: Contribuyente) => void;
  title?: string;
  selectedId?: number | null;
}

/**
 * Modal para seleccionar un contribuyente con Material-UI
 */
const SelectorContribuyente: React.FC<SelectorContribuyenteProps> = ({
  isOpen,
  onClose,
  onSelectContribuyente,
  title = 'Seleccionar Contribuyente',
  selectedId
}) => {
  const theme = useTheme();
  
  // Hook de contribuyentes - solo usar las funciones que existen
  const { 
    contribuyentes, 
    loading, 
    error,
    cargarContribuyentes
  } = useContribuyentes();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContribuyente, setSelectedContribuyente] = useState<Contribuyente | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: Todos, 1: Naturales, 2: Jurídicas
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar contribuyentes al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarContribuyentes();
    }
  }, [isOpen, cargarContribuyentes]);

  // Filtrar contribuyentes por búsqueda y tipo
  const filteredContribuyentes = useMemo(() => {
    let filtered = contribuyentes;

    // Filtrar por tipo según tab seleccionado
    if (tabValue === 1) {
      filtered = filtered.filter(c => c.tipoPersona === 'natural');
    } else if (tabValue === 2) {
      filtered = filtered.filter(c => c.tipoPersona === 'juridica');
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.contribuyente.toLowerCase().includes(term) ||
        c.documento.toLowerCase().includes(term) ||
        c.direccion.toLowerCase().includes(term) ||
        (c.telefono && c.telefono.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [contribuyentes, searchTerm, tabValue]);

  // Paginar resultados
  const paginatedContribuyentes = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredContribuyentes.slice(start, end);
  }, [filteredContribuyentes, page, rowsPerPage]);

  // Handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleSelectContribuyente = (contribuyente: Contribuyente) => {
    setSelectedContribuyente(contribuyente);
  };

  const handleConfirm = () => {
    if (selectedContribuyente) {
      onSelectContribuyente(selectedContribuyente);
      onClose();
      NotificationService.success(`Contribuyente ${selectedContribuyente.contribuyente} seleccionado`);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDocumentTypeIcon = (documento: string) => {
    if (documento.length === 8) {
      return <BadgeIcon sx={{ fontSize: 16 }} />;
    }
    if (documento.length === 11) {
      return <BusinessIcon sx={{ fontSize: 16 }} />;
    }
    return <AccountBoxIcon sx={{ fontSize: 16 }} />;
  };

  const getPersonTypeChip = (tipo?: 'natural' | 'juridica') => {
    if (tipo === 'natural') {
      return (
        <Chip 
          icon={<PersonIcon sx={{ fontSize: 16 }} />} 
          label="Natural" 
          size="small" 
          color="primary" 
        />
      );
    } else if (tipo === 'juridica') {
      return (
        <Chip 
          icon={<BusinessIcon sx={{ fontSize: 16 }} />} 
          label="Jurídica" 
          size="small" 
          color="secondary" 
        />
      );
    }
    return null;
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
            placeholder="Buscar por nombre, documento, dirección o teléfono..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Tabs para filtrar por tipo */}
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Todos (${contribuyentes.length})`} />
            <Tab 
              label={`Personas Naturales (${contribuyentes.filter(c => c.tipoPersona === 'natural').length})`} 
              icon={<PersonIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
            />
            <Tab 
              label={`Personas Jurídicas (${contribuyentes.filter(c => c.tipoPersona === 'juridica').length})`} 
              icon={<BusinessIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tabla de contribuyentes */}
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 50 }} />
                <TableCell>Código</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Contribuyente</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Teléfono</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : paginatedContribuyentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No se encontraron contribuyentes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContribuyentes.map((contribuyente) => {
                  const isSelected = selectedContribuyente?.codigo === contribuyente.codigo;
                  const isPreviouslySelected = selectedId === contribuyente.codigo;

                  return (
                    <TableRow
                      key={contribuyente.codigo}
                      hover
                      onClick={() => handleSelectContribuyente(contribuyente)}
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
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {contribuyente.codigo}
                          </Typography>
                          {isPreviouslySelected && (
                            <Tooltip title="Contribuyente actualmente seleccionado">
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {getPersonTypeChip(contribuyente.tipoPersona)}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {getDocumentTypeIcon(contribuyente.documento)}
                          <Typography variant="body2">
                            {contribuyente.documento}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                          {contribuyente.contribuyente}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {contribuyente.direccion}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {contribuyente.telefono && (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {contribuyente.telefono}
                            </Typography>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredContribuyentes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />

        {/* Información del contribuyente seleccionado */}
        {selectedContribuyente && (
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Contribuyente seleccionado:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedContribuyente.tipoPersona === 'juridica' ? <BusinessIcon /> : <PersonIcon />}
              </Avatar>
              <Box flex={1}>
                <Typography variant="body1" fontWeight={600}>
                  {selectedContribuyente.contribuyente}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedContribuyente.documento} • {selectedContribuyente.direccion}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!selectedContribuyente}
          startIcon={<CheckCircleIcon />}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorContribuyente;