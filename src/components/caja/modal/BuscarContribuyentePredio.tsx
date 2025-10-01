// src/components/caja/modal/BuscarContribuyentePredio.tsx
import React, { useState } from 'react';
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
      setSelectedRow(null);
      setSearching(false);
    }, 500);
  };

  // Seleccionar fila
  const handleRowSelect = (codigoPredio: string) => {
    setSelectedRow(codigoPredio === selectedRow ? null : codigoPredio);
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
    onClose();
  };

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
                  </Box>

                  {/* Button Nuevo */}
                  <Box sx={{ flex: '0 1 auto' }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => console.log('Nuevo contribuyente')}
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
                  </Box>
                </Box>
              </Paper>

              {/* Tabla de Resultados */}
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <TableContainer 
                  component={Paper} 
                  variant="outlined"
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
                        resultados.map((contribuyente) => (
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
                            onClick={() => handleRowSelect(contribuyente.codigoPredio)}
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
              </Box>
            </Box>
        </ContentBox>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="error"
          startIcon={<CloseIcon />}
          disabled={loading}
        >
          Cerrar
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default BuscarContribuyentePredio;