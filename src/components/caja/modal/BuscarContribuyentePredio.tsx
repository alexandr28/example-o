// src/components/caja/modal/BuscarContribuyentePredio.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Paper,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Importar hooks de atajos de teclado
import { useModuleHotkeys } from '../../../hooks/useModuleHotkeys';
import { Tooltip } from '@mui/material';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '800px',
    maxWidth: '1000px',
    height: '600px',
    overflowX: 'hidden',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(2),
  margin: theme.spacing(-3, -3, 2, -3),
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
}));

// Interfaces
export interface ContribuyenteData {
  codigoPredio: string;
  dniRuc: string;
  contribuyente: string;
  direccionPredio: string;
}

export interface FiltrosBusqueda {
  codigoContribuyente: string;
  nombreContribuyente: string;
}

interface BuscarContribuyentePredioProps {
  open: boolean;
  onClose: () => void;
  onSelect: (contribuyente: ContribuyenteData) => void;
  loading?: boolean;
}

// Datos de ejemplo
const contribuyentesData: ContribuyenteData[] = [
  {
    codigoPredio: 'P001',
    dniRuc: '12345678',
    contribuyente: 'Garcia Lopez Juan Carlos',
    direccionPredio: 'Av. Principal 123'
  },
  {
    codigoPredio: 'P002',
    dniRuc: '87654321',
    contribuyente: 'Rodriguez Silva Maria Elena',
    direccionPredio: 'Jr. Los Olivos 456'
  },
  {
    codigoPredio: 'P003',
    dniRuc: '20123456789',
    contribuyente: 'Empresa ABC S.A.C.',
    direccionPredio: 'Av. Industrial 789'
  },
  {
    codigoPredio: 'P004',
    dniRuc: '11223344',
    contribuyente: 'Perez Martinez Luis Alberto',
    direccionPredio: 'Calle Las Flores 321'
  },
  {
    codigoPredio: 'P005',
    dniRuc: '55667788',
    contribuyente: 'Constructora DEF S.R.L.',
    direccionPredio: 'Jr. Comercio 654'
  }
];

const BuscarContribuyentePredio: React.FC<BuscarContribuyentePredioProps> = ({
  open,
  onClose,
  onSelect,
  loading = false
}) => {
  // Estados
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    codigoContribuyente: '',
    nombreContribuyente: ''
  });
  const [resultados, setResultados] = useState<ContribuyenteData[]>([]);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Refs
  const codigoInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus en el campo Código Contribuyente cuando se abre el modal
  useEffect(() => {
    if (open) {
      // Pequeño delay para asegurar que el modal esté completamente renderizado
      setTimeout(() => {
        codigoInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Hacer scroll a la fila seleccionada
  const scrollToSelectedRow = useCallback((index: number) => {
    if (!tableContainerRef.current) return;

    const container = tableContainerRef.current;
    const rowHeight = 53; // Altura aproximada de cada fila
    const headerHeight = 42; // Altura del header de la tabla
    const scrollPosition = (index * rowHeight) - (container.clientHeight / 2) + headerHeight;

    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  }, []);

  // Navegar hacia abajo en la tabla
  const handleNavigateDown = useCallback(() => {
    if (resultados.length === 0) return;

    const newIndex = Math.min(selectedIndex + 1, resultados.length - 1);
    setSelectedIndex(newIndex);
    setSelectedRow(resultados[newIndex].codigoPredio);

    // Hacer scroll a la fila seleccionada
    scrollToSelectedRow(newIndex);
  }, [resultados, selectedIndex, scrollToSelectedRow]);

  // Navegar hacia arriba en la tabla
  const handleNavigateUp = useCallback(() => {
    if (resultados.length === 0) return;

    const newIndex = Math.max(selectedIndex - 1, 0);
    setSelectedIndex(newIndex);
    setSelectedRow(resultados[newIndex].codigoPredio);

    // Hacer scroll a la fila seleccionada
    scrollToSelectedRow(newIndex);
  }, [resultados, selectedIndex, scrollToSelectedRow]);

  // Escuchar teclas de navegación (Arrow Up/Down) cuando hay resultados
  useEffect(() => {
    if (!open || resultados.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo responder a las flechas si no estamos en un input
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (!isInputFocused) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          handleNavigateDown();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          handleNavigateUp();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, resultados, handleNavigateDown, handleNavigateUp]);

  // Manejar cambios en filtros
  const handleFiltroChange = (field: keyof FiltrosBusqueda, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Realizar busqueda
  const handleBuscar = () => {
    setSearching(true);

    // Simular busqueda
    setTimeout(() => {
      let resultadosFiltrados = contribuyentesData;

      if (filtros.codigoContribuyente.trim()) {
        resultadosFiltrados = resultadosFiltrados.filter(c =>
          c.codigoPredio.toLowerCase().includes(filtros.codigoContribuyente.toLowerCase()) ||
          c.dniRuc.includes(filtros.codigoContribuyente)
        );
      }

      if (filtros.nombreContribuyente.trim()) {
        resultadosFiltrados = resultadosFiltrados.filter(c =>
          c.contribuyente.toLowerCase().includes(filtros.nombreContribuyente.toLowerCase())
        );
      }

      setResultados(resultadosFiltrados);

      // Seleccionar automáticamente la primera fila si hay resultados
      if (resultadosFiltrados.length > 0) {
        setSelectedRow(resultadosFiltrados[0].codigoPredio);
        setSelectedIndex(0);
      } else {
        setSelectedRow(null);
        setSelectedIndex(0);
      }

      setSearching(false);
    }, 500);
  };

  // Seleccionar fila
  const handleRowSelect = (codigoPredio: string, index?: number) => {
    setSelectedRow(codigoPredio === selectedRow ? null : codigoPredio);
    if (index !== undefined) {
      setSelectedIndex(index);
    }
  };

  // Confirmar seleccion
  const handleConfirmarSeleccion = () => {
    const contribuyenteSelected = resultados.find(c => c.codigoPredio === selectedRow);
    if (contribuyenteSelected) {
      onSelect(contribuyenteSelected);
    }
  };

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setFiltros({
      codigoContribuyente: '',
      nombreContribuyente: ''
    });
    setResultados([]);
    setSelectedRow(null);
    setSelectedIndex(0);
    onClose();
  };

  // Manejar acción de Nuevo contribuyente
  const handleNuevo = () => {
    console.log('Nuevo contribuyente');
    // Aquí iría la lógica para abrir formulario de nuevo contribuyente
  };

  // Configurar atajos de teclado cuando el modal está abierto
  useModuleHotkeys('Buscar Contribuyente', [
    {
      id: 'buscar-contribuyente',
      name: 'Buscar',
      description: 'Buscar contribuyentes con los filtros actuales',
      hotkey: { key: 'F3', preventDefault: true, enabled: open },
      action: handleBuscar,
      enabled: open && !searching && (!!filtros.codigoContribuyente.trim() || !!filtros.nombreContribuyente.trim()),
      icon: 'search'
    },
    {
      id: 'nuevo-contribuyente',
      name: 'Nuevo',
      description: 'Crear nuevo contribuyente',
      hotkey: { key: 'F2', preventDefault: true, enabled: open },
      action: handleNuevo,
      enabled: open,
      icon: 'add'
    },
    {
      id: 'seleccionar-contribuyente',
      name: 'Seleccionar',
      description: 'Seleccionar contribuyente marcado',
      hotkey: { key: 'Enter', preventDefault: true, enabled: open },
      action: handleConfirmarSeleccion,
      enabled: open && !!selectedRow,
      icon: 'check_circle'
    },
    {
      id: 'cerrar-modal',
      name: 'Cerrar',
      description: 'Cerrar el modal de búsqueda',
      hotkey: { key: 'Escape', preventDefault: true, enabled: open },
      action: handleClose,
      enabled: open,
      icon: 'close'
    }
  ]);

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      {/* Header */}
      <HeaderBox>
        <Box display="flex" alignItems="center" gap={1}>
          <SearchIcon />
          <Typography variant="h6" fontWeight="bold">
            Buscar Contribuyente - Predio
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </HeaderBox>

      <DialogContent sx={{ padding: 3, height: '100%', overflowX: 'hidden' }}>
        <ContentBox>
          {/* Contenido de Buscar Contribuyente */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Filtros de Busqueda */}
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Filtros de Busqueda
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Codigo Contribuyente"
                      value={filtros.codigoContribuyente}
                      onChange={(e) => handleFiltroChange('codigoContribuyente', e.target.value)}
                      size="small"
                      fullWidth
                      disabled={searching}
                      placeholder="Ingrese codigo o DNI/RUC"
                      inputRef={codigoInputRef}
                    />
                  </Box>
                  
                  <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <TextField
                      label="Nombre Contribuyente"
                      value={filtros.nombreContribuyente}
                      onChange={(e) => handleFiltroChange('nombreContribuyente', e.target.value)}
                      size="small"
                      fullWidth
                      disabled={searching}
                      placeholder="Ingrese nombre del contribuyente"
                    />
                  </Box>
                  {/* Button Buscar */}
                  <Box sx={{ flex: '0 1 auto' }}>
                    <Tooltip title="Buscar (F3)" arrow>
                      <span>
                        <Button
                          variant="contained"
                          startIcon={<SearchIcon />}
                          onClick={handleBuscar}
                          disabled={searching || (!filtros.codigoContribuyente.trim() && !filtros.nombreContribuyente.trim())}
                          sx={{
                            backgroundColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                            height: '40px',
                            px: 3
                          }}
                        >
                          {searching ? 'Buscando...' : 'Buscar'}
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Button Nuevo */}
                  <Box sx={{ flex: '0 1 auto' }}>
                    <Tooltip title="Nuevo Contribuyente (F2)" arrow>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleNuevo}
                        sx={{
                          backgroundColor: 'white',
                          borderColor: 'success.main',
                          color: 'success.main',
                          '&:hover': {
                            backgroundColor: 'success.light',
                            borderColor: 'success.main',
                            color: 'success.main',
                          },
                          height: '40px',
                          px: 3
                        }}
                      >
                        Nuevo
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>

              {/* Tabla de Resultados */}
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  ref={tableContainerRef}
                  sx={{
                    height: '100%',
                    maxHeight: 350,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#888',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: '#555',
                      },
                    },
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          Codigo Predio
                        </TableCell>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          DNI/RUC
                        </TableCell>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          Contribuyente
                        </TableCell>
                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                          Direccion Predio
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              {searching ? 'Buscando...' : 'No hay resultados. Realice una busqueda para ver los datos.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        resultados.map((contribuyente, index) => (
                          <TableRow
                            key={contribuyente.codigoPredio}
                            hover
                            selected={selectedRow === contribuyente.codigoPredio}
                            sx={{
                              cursor: 'pointer',
                              '&.Mui-selected': {
                                backgroundColor: '#e3f2fd',
                                '&:hover': {
                                  backgroundColor: '#bbdefb',
                                }
                              },
                              '&:hover': {
                                backgroundColor: selectedRow === contribuyente.codigoPredio ? '#bbdefb' : '#f5f5f5',
                              }
                            }}
                            onClick={() => handleRowSelect(contribuyente.codigoPredio, index)}
                          >
                            <TableCell>{contribuyente.codigoPredio}</TableCell>
                            <TableCell>{contribuyente.dniRuc}</TableCell>
                            <TableCell>{contribuyente.contribuyente}</TableCell>
                            <TableCell>{contribuyente.direccionPredio}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Boton Seleccionar */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                <Tooltip title="Seleccionar Contribuyente (Enter)" arrow>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={handleConfirmarSeleccion}
                      disabled={!selectedRow}
                      sx={{
                        background: selectedRow
                          ? 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)'
                          : undefined,
                        '&:hover': selectedRow ? {
                          background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                        } : undefined,
                        px: 4
                      }}
                    >
                      Seleccionar
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
        </ContentBox>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Leyenda de Atajos de Teclado */}
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mr: 1 }}>
              Atajos:
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>F2</Paper>
              <Typography variant="caption" color="text.secondary">Nuevo</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>F3</Paper>
              <Typography variant="caption" color="text.secondary">Buscar</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>↑↓</Paper>
              <Typography variant="caption" color="text.secondary">Navegar</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>Enter</Paper>
              <Typography variant="caption" color="text.secondary">Seleccionar</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>Esc</Paper>
              <Typography variant="caption" color="text.secondary">Cerrar</Typography>
            </Box>
          </Box>
        </Box>

        {/* Botón Cerrar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Cerrar (Esc)" arrow>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              disabled={loading}
            >
              Cerrar
            </Button>
          </Tooltip>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default BuscarContribuyentePredio;