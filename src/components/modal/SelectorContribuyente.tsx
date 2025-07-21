// src/components/modal/SelectorContribuyente.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  
  // Hook de contribuyentes
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
  
  // Ref para controlar la carga inicial
  const hasLoadedRef = useRef(false);
  const previousIsOpenRef = useRef(isOpen);

  // Cargar contribuyentes al abrir el modal - VERSIÓN CORREGIDA
  useEffect(() => {
    // Solo cargar si el modal se acaba de abrir (transición de cerrado a abierto)
    if (isOpen && !previousIsOpenRef.current) {
      // Solo cargar si no están cargados o si no se está cargando actualmente
      if (contribuyentes.length === 0 && !loading && !hasLoadedRef.current) {
        console.log('🔄 [SelectorContribuyente] Cargando contribuyentes...');
        cargarContribuyentes();
        hasLoadedRef.current = true;
      }
    }
    
    // Actualizar el estado previo
    previousIsOpenRef.current = isOpen;
    
    // Si el modal se cierra, resetear la bandera
    if (!isOpen) {
      hasLoadedRef.current = false;
    }
  }, [isOpen]); // Solo depender de isOpen, no de cargarContribuyentes

  // Resetear estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedContribuyente(null);
      setPage(0);
      setTabValue(0);
    }
  }, [isOpen]);

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
    if (tipo === 'juridica') {
      return (
        <Chip 
          size="small" 
          label="Jurídica" 
          color="primary"
          icon={<BusinessIcon />}
        />
      );
    }
    return (
      <Chip 
        size="small" 
        label="Natural" 
        color="info"
        icon={<PersonIcon />}
      />
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px'
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Barra de búsqueda */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
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
              )
            }}
          />
        </Box>

        {/* Tabs de filtro */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={`Todos (${contribuyentes.length})`} 
              icon={<Stack direction="row" spacing={0.5}>
                <PersonIcon sx={{ fontSize: 20 }} />
                <BusinessIcon sx={{ fontSize: 20 }} />
              </Stack>} 
              iconPosition="start"
            />
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