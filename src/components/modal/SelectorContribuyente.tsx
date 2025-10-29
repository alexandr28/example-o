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
  Radio,
  TablePagination,
  CircularProgress,
  Alert,
  Avatar,
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
  
  // Hook de contribuyentes - incluimos el método de búsqueda con query params
  const { 
    contribuyentes, 
    loading, 
    error,
    cargarContribuyentes,
    buscarContribuyentesConQueryParams
  } = useContribuyentes();

  // Estados locales - Filtros por códigos
  const [codigoContribuyente, setCodigoContribuyente] = useState('');
  const [codigoPersona, setCodigoPersona] = useState('');
  const [selectedContribuyente, setSelectedContribuyente] = useState<Contribuyente | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);
  
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
  }, [isOpen, cargarContribuyentes, contribuyentes.length, loading]); // Incluir todas las dependencias

  // Resetear estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setCodigoContribuyente('');
      setCodigoPersona('');
      setSelectedContribuyente(null);
      setPage(0);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Los contribuyentes mostrados dependen de si se ha buscado o no
  const filteredContribuyentes = useMemo(() => {
    // Los resultados ya vienen filtrados de la API, solo los devolvemos
    return contribuyentes;
  }, [contribuyentes]);

  // Paginar resultados
  const paginatedContribuyentes = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredContribuyentes.slice(start, end);
  }, [filteredContribuyentes, page, rowsPerPage]);

  // Handlers
  const handleBuscar = async () => {
    if (!codigoContribuyente && !codigoPersona) {
      NotificationService.warning('Ingrese al menos un código para buscar');
      return;
    }

    setHasSearched(true);
    setPage(0);
    
    console.log('🔍 [SelectorContribuyente] Buscando con códigos:', {
      codigoContribuyente,
      codigoPersona
    });

    try {
      // Llamar a la API con los códigos
      const resultados = await buscarContribuyentesConQueryParams(
        codigoContribuyente || undefined,
        codigoPersona || '0'
      );
      
      if (resultados.length === 0) {
        NotificationService.info('No se encontraron contribuyentes con los códigos especificados');
      } else {
        NotificationService.success(`Se encontró ${resultados.length} contribuyente${resultados.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('❌ [SelectorContribuyente] Error en búsqueda:', error);
      NotificationService.error('Error al buscar contribuyentes');
    }
  };

  const handleLimpiar = async () => {
    setCodigoContribuyente('');
    setCodigoPersona('');
    setHasSearched(false);
    setPage(0);
    
    // Recargar todos los contribuyentes
    await cargarContribuyentes();
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


  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableRestoreFocus
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
        {/* Sección de Filtros de Búsqueda - Estilo ContribuyenteConsulta */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 0,
            background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'primary.main'
            }}>
              <Box sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SearchIcon />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Búsqueda por Códigos
              </Typography>
              {(codigoContribuyente || codigoPersona) && (
                <Chip 
                  label="Códigos ingresados" 
                  color="primary" 
                  size="small"
                  icon={<BadgeIcon />}
                />
              )}
            </Box>

            {/* Filtros de búsqueda por códigos */}
            <Stack spacing={2}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                alignItems: 'flex-end'
              }}>
                {/* Código Contribuyente */}
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Código Contribuyente"
                    placeholder="Ej: 43905"
                    value={codigoContribuyente}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setCodigoContribuyente(value);
                    }}
                    disabled={loading}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: codigoContribuyente && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setCodigoContribuyente('')}
                            disabled={loading}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleBuscar();
                      }
                    }}
                  />
                </Box>

                {/* Código Persona */}
                <Box sx={{ flex: '1 1 200px' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Código Persona"
                    placeholder="Ej: 6 (opcional)"
                    value={codigoPersona}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setCodigoPersona(value);
                    }}
                    disabled={loading}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: codigoPersona && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setCodigoPersona('')}
                            disabled={loading}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleBuscar();
                      }
                    }}
                  />
                </Box>

                {/* Botones de acción */}
                <Box sx={{ 
                  display: 'flex',
                  gap: 1,
                  flex: '0 0 auto'
                }}>
                  <Button
                    variant="contained"
                    onClick={handleBuscar}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                    size="small"
                    sx={{ height: 40 }}
                  >
                    Buscar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleLimpiar}
                    disabled={loading}
                    startIcon={<CloseIcon />}
                    size="small"
                    sx={{ height: 40 }}
                  >
                    Limpiar
                  </Button>
                </Box>
              </Box>

              {/* Texto de ayuda */}
              <Typography variant="caption" color="text.secondary">
                {loading 
                  ? 'Buscando...'
                  : hasSearched 
                    ? `${filteredContribuyentes.length} contribuyente${filteredContribuyentes.length !== 1 ? 's' : ''} encontrado${filteredContribuyentes.length !== 1 ? 's' : ''}`
                    : `Total de contribuyentes disponibles: ${contribuyentes.length}. Use los códigos para búsqueda específica.`
                }
              </Typography>
            </Stack>
          </Box>
        </Paper>

        {/* Sección de Resultados - Estilo ContribuyenteConsulta */}
        <Box sx={{ 
          background: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ 
            px: 3, 
            pt: 2,
            pb: 1,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Contribuyentes Disponibles
            </Typography>
            <Chip 
              label={`${filteredContribuyentes.length} registro${filteredContribuyentes.length !== 1 ? 's' : ''}`}
              color="info" 
              size="small"
            />
          </Box>
        </Box>

        {/* Tabla de contribuyentes mejorada */}
        <TableContainer sx={{ maxHeight: 380 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ 
                '& .MuiTableCell-head': { 
                  backgroundColor: 'grey.50',
                  fontWeight: 600
                }
              }}>
                <TableCell padding="checkbox" sx={{ width: 50 }}>Sel.</TableCell>
                <TableCell sx={{ minWidth: 80 }}>Código</TableCell>
                <TableCell sx={{ minWidth: 90 }}>Tipo</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Documento</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Contribuyente</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Dirección</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Teléfono</TableCell>
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
                        <Chip
                          label={contribuyente.codigo}
                          size="small"
                          variant={isSelected ? "filled" : "outlined"}
                          color={isPreviouslySelected ? "success" : "primary"}
                          icon={isPreviouslySelected ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={contribuyente.tipoPersona === 'juridica' ? 'Jurídica' : 'Natural'}
                          size="small"
                          color={contribuyente.tipoPersona === 'juridica' ? 'primary' : 'info'}
                          variant="outlined"
                          icon={contribuyente.tipoPersona === 'juridica' ? <BusinessIcon sx={{ fontSize: 14 }} /> : <PersonIcon sx={{ fontSize: 14 }} />}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BadgeIcon sx={{ fontSize: 16, color: 'action.active' }} />
                          <Typography variant="body2">
                            {contribuyente.documento}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            {contribuyente.tipoPersona === 'juridica' ? 
                              <BusinessIcon sx={{ fontSize: 16, color: 'primary.main' }} /> : 
                              <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            }
                          </Avatar>
                          <Typography 
                            variant="body2" 
                            fontWeight={isSelected ? 600 : 500}
                            sx={{ 
                              color: isSelected ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {contribuyente.contribuyente}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                          <LocationIcon sx={{ fontSize: 16, color: 'action.active', mt: 0.2, flexShrink: 0 }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              wordWrap: 'break-word',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {contribuyente.direccion}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {contribuyente.telefono ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'action.active' }} />
                            <Typography variant="body2" color="text.secondary">
                              {contribuyente.telefono}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            Sin teléfono
                          </Typography>
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

        {/* Información del contribuyente seleccionado - Estilo mejorado */}
        {selectedContribuyente && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              bgcolor: alpha(theme.palette.primary.main, 0.04), 
              borderTop: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 0
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                CONTRIBUYENTE SELECCIONADO
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 48,
                  height: 48,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `2px solid ${theme.palette.primary.main}`
                }}
              >
                {selectedContribuyente.tipoPersona === 'juridica' ? 
                  <BusinessIcon sx={{ color: 'primary.main' }} /> : 
                  <PersonIcon sx={{ color: 'primary.main' }} />
                }
              </Avatar>
              
              <Box flex={1}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    {selectedContribuyente.contribuyente}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`Código: ${selectedContribuyente.codigo}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <BadgeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedContribuyente.documento}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      maxWidth: 300,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {selectedContribuyente.direccion}
                    </Typography>
                  </Stack>
                  
                  {selectedContribuyente.telefono && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedContribuyente.telefono}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>
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