// src/components/caja/Pagos.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  DeleteSweep as DeleteSweepIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Importar modales
import BuscarContribuyentePredio, { ContribuyenteData } from './modal/BuscarContribuyentePredio';
import DeudaContribuyente, { DatosPagoDeudaOrdinaria } from './modal/DeudaContribuyente';

// Importar hooks de atajos de teclado
import { useModuleHotkeys } from '../../hooks/useModuleHotkeys';
import HotkeyHelper from '../common/HotkeyHelper';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const FormCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
}));

const TotalBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  textAlign: 'center',
}));

// Interfaces
interface ContribuyenteOption {
  id: string;
  label: string;
  documento: string;
  direccion: string;
}

interface ConceptoDetalle {
  id: string;
  descripcion: string;
  total: number;
}

interface PagoData {
  codigo: string;
  rucDni: string;
  contribuyente: ContribuyenteOption | null;
  direccion: string;
  fechaRecibo: Date | null;
  descripcion: string;
  conceptos: ConceptoDetalle[];
  formaPago: string;
  total: number;
}

// Datos de ejemplo
const contribuyentesOptions: ContribuyenteOption[] = [
  {
    id: '1',
    label: 'García López Juan Carlos',
    documento: '12345678',
    direccion: 'Av. Principal 123'
  },
  {
    id: '2',
    label: 'Rodríguez Silva María Elena',
    documento: '87654321',
    direccion: 'Jr. Los Olivos 456'
  },
  {
    id: '3',
    label: 'Empresa ABC S.A.C.',
    documento: '20123456789',
    direccion: 'Av. Industrial 789'
  }
];

const formasPago = [
  { value: 'CONTADO', label: 'CONTADO' },
  { value: 'TARJETA', label: 'TARJETA' },
  { value: 'TRANSFERENCIA', label: 'TRANSFERENCIA' }
];

const Pagos: React.FC = () => {
  const [pagoData, setPagoData] = useState<PagoData>({
    codigo: '',
    rucDni: '',
    contribuyente: null,
    direccion: '',
    fechaRecibo: new Date(),
    descripcion: '',
    conceptos: [],
    formaPago: 'CONTADO',
    total: 0
  });

  const [busquedaContribuyente, setBusquedaContribuyente] = useState('');
  const [modalBusquedaOpen, setModalBusquedaOpen] = useState(false);
  const [modalDeudaOpen, setModalDeudaOpen] = useState(false);
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<ContribuyenteData | null>(null);

  // Función para grabar (placeholder)
  const handleGrabar = () => {
    if (pagoData.conceptos.length === 0) {
      alert('No hay conceptos para grabar');
      return;
    }
    if (!contribuyenteSeleccionado) {
      alert('Debe seleccionar un contribuyente');
      return;
    }
    // Aquí iría la lógica de grabado
    console.log('Grabando pago:', pagoData);
    alert('Pago registrado exitosamente');
  };

  // Función para imprimir recibo (placeholder)
  const handleImprimirRecibo = () => {
    if (pagoData.conceptos.length === 0) {
      alert('No hay conceptos para imprimir');
      return;
    }
    console.log('Imprimiendo recibo...');
    alert('Generando recibo...');
  };

  // Función para limpiar tabla de conceptos
  const handleLimpiarConceptos = () => {
    if (pagoData.conceptos.length > 0) {
      setPagoData(prev => ({ ...prev, conceptos: [], total: 0 }));
    }
  };

  // Buscar contribuyente - abrir modal
  const handleBuscarContribuyente = () => {
    setModalBusquedaOpen(true);
  };

  // Manejar apertura del modal de deuda
  const handleVerDeuda = () => {
    if (contribuyenteSeleccionado) {
      setModalDeudaOpen(true);
    }
  };

  // Limpiar formulario completo
  const handleNuevo = () => {
    setPagoData({
      codigo: '',
      rucDni: '',
      contribuyente: null,
      direccion: '',
      fechaRecibo: new Date(),
      descripcion: '',
      conceptos: [],
      formaPago: 'CONTADO',
      total: 0
    });
    setBusquedaContribuyente('');
    setContribuyenteSeleccionado(null);
  };

  // Configurar atajos de teclado para el módulo de Pagos
  useModuleHotkeys('Pagos - Ingresos', [
    {
      id: 'buscar-contribuyente',
      name: 'Buscar Contribuyente',
      description: 'Abrir modal de búsqueda de contribuyente',
      hotkey: { key: 'F2', preventDefault: true },
      action: handleBuscarContribuyente,
      icon: 'search'
    },
    {
      id: 'ver-deuda',
      name: 'Ver Deuda',
      description: 'Ver deuda del contribuyente seleccionado',
      hotkey: { key: 'F3', preventDefault: true },
      action: handleVerDeuda,
      enabled: !!contribuyenteSeleccionado,
      icon: 'visibility'
    },
    {
      id: 'grabar-pago',
      name: 'Grabar',
      description: 'Grabar el pago actual',
      hotkey: { key: 'F4', preventDefault: true },
      action: handleGrabar,
      enabled: pagoData.conceptos.length > 0 && !!contribuyenteSeleccionado,
      icon: 'save'
    },
    {
      id: 'nuevo-pago',
      name: 'Nuevo',
      description: 'Limpiar formulario y crear nuevo pago',
      hotkey: { key: 'F5', preventDefault: true },
      action: handleNuevo,
      enabled: !!contribuyenteSeleccionado || pagoData.conceptos.length > 0,
      icon: 'refresh'
    },
    {
      id: 'imprimir-recibo',
      name: 'Imprimir Recibo',
      description: 'Imprimir recibo del pago',
      hotkey: { key: 'F6', preventDefault: true },
      action: handleImprimirRecibo,
      enabled: pagoData.conceptos.length > 0,
      icon: 'print'
    },
    {
      id: 'limpiar-conceptos',
      name: 'Limpiar Conceptos',
      description: 'Eliminar todos los conceptos de la tabla',
      hotkey: { key: 'L', ctrl: true, preventDefault: true },
      action: handleLimpiarConceptos,
      enabled: pagoData.conceptos.length > 0,
      icon: 'delete_sweep'
    }
  ]);

  // Manejar cambios en el contribuyente
  const handleContribuyenteChange = (newValue: ContribuyenteOption | null) => {
    setPagoData(prev => ({
      ...prev,
      contribuyente: newValue,
      rucDni: newValue?.documento || '',
      direccion: newValue?.direccion || ''
    }));
  };

  // Manejar selección de contribuyente del modal
  const handleSeleccionarContribuyente = (contribuyente: ContribuyenteData) => {
    setPagoData(prev => ({
      ...prev,
      codigo: contribuyente.codigoPredio,
      rucDni: contribuyente.dniRuc,
      direccion: contribuyente.direccionPredio
    }));
    setBusquedaContribuyente(contribuyente.contribuyente);
    setContribuyenteSeleccionado(contribuyente);
    setModalBusquedaOpen(false);
  };

  // Manejar datos de pago desde DeudaContribuyente
  const handlePagoGenerado = (datosPago: DatosPagoDeudaOrdinaria) => {
    // Convertir conceptos de deuda a conceptos de pago
    const nuevosConceptos = datosPago.conceptos.map(concepto => ({
      id: concepto.id,
      descripcion: concepto.descripcion,
      total: concepto.total
    }));

    // Actualizar el estado de pagos
    setPagoData(prev => ({
      ...prev,
      conceptos: [...prev.conceptos, ...nuevosConceptos],
      total: prev.total + datosPago.montoTotal
    }));

    // Cerrar el modal de deuda
    setModalDeudaOpen(false);
  };

  // Agregar concepto
  const handleAgregarConcepto = () => {
    if (pagoData.descripcion.trim()) {
      const nuevoConcepto: ConceptoDetalle = {
        id: Date.now().toString(),
        descripcion: pagoData.descripcion,
        total: 0 // Se podría calcular automáticamente
      };
      
      setPagoData(prev => ({
        ...prev,
        conceptos: [...prev.conceptos, nuevoConcepto],
        descripcion: ''
      }));
    }
  };

  // Eliminar concepto
  const handleEliminarConcepto = (id: string) => {
    setPagoData(prev => ({
      ...prev,
      conceptos: prev.conceptos.filter(c => c.id !== id)
    }));
  };

  // Calcular total
  const calcularTotal = () => {
    return pagoData.conceptos.reduce((sum, concepto) => sum + concepto.total, 0);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <HeaderBox>
        <ReceiptIcon />
        <Typography variant="h6" fontWeight="bold">
          Ingresos
        </Typography>
      </HeaderBox>

      {/* Formulario Principal */}
      <FormCard>


          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Primera fila */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Botón Buscar Contribuyente */}
              <Box sx={{ flex: '0 0 auto' }}>
                <Tooltip title="Buscar Contribuyente (F2)" arrow>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleBuscarContribuyente}
                    size="small"
                    sx={{
                      backgroundColor: theme => theme.palette.info.main,
                      '&:hover': {
                        backgroundColor: theme => theme.palette.info.dark,
                      },
                      height: '40px',
                      px: 2
                    }}
                  >
                    Buscar Contribuyente
                  </Button>
                </Tooltip>
              </Box>
              
              {/** Codigo Predio */}
              <Box sx={{ flex: '0 1 120px', minWidth: '120px' }}>
                <TextField
                  label="Código Predio"
                  value={pagoData.codigo}
                  onChange={(e) => setPagoData(prev => ({ ...prev, codigo: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled
                  sx={{ 
                    backgroundColor: 'white',
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
              </Box>
            {/* TextField RUC/DNI */}
              <Box sx={{ flex: '0 1 130px', minWidth: '130px' }}>
                <TextField
                  label="RUC/DNI"
                  value={pagoData.rucDni}
                  onChange={(e) => setPagoData(prev => ({ ...prev, rucDni: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled
                  sx={{ 
                    backgroundColor: 'white',
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                  InputProps={{
                  }}
                />
              </Box>
              
              {/* TextField Contribuyente */}
              <Box sx={{ flex: '1 1 350px', minWidth: '300px' }}>
                <TextField
                  label="Contribuyente"
                  value={busquedaContribuyente}
                  onChange={(e) => setBusquedaContribuyente(e.target.value)}
                  size="small"
                  fullWidth
                  disabled
                  sx={{ 
                    backgroundColor: 'white',
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Box>

            {/* Segunda fila - Dirección */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* TextField Direccion  */ }
              <Box sx={{ flex: '1 1 400px', minWidth: '350px' }}>
                <TextField
                  label="Dirección"
                  value={pagoData.direccion}
                  onChange={(e) => setPagoData(prev => ({ ...prev, direccion: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled
                  sx={{ 
                    backgroundColor: 'white',
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
               {/* Fecha de Recibo */}
              <Box sx={{ flex: '0 1 150px', minWidth: '150px' }}>
                 <DatePicker
                      label="Fecha de Recibo"
                      value={pagoData.fechaRecibo}
                      onChange={(newValue) => setPagoData(prev => ({ ...prev, fechaRecibo: newValue }))}
                      slotProps={{
                            textField: {
                            size: 'small',
                             fullWidth: true
                            }
                        }}
                    />
                </Box>

              {/* Button Ver Deuda */}
              <Box sx={{ flex: '0 1 auto' }}>
                <Tooltip title="Ver Deuda (F3)" arrow>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={handleVerDeuda}
                      disabled={!contribuyenteSeleccionado}
                      sx={{
                        backgroundColor: 'success.main',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                        },
                        height: '40px',
                        px: 3
                      }}
                    >
                      Ver Deuda
                    </Button>
                  </span>
                </Tooltip>
              </Box>

              {/* Button Limpiar Tabla de Conceptos */}
              <Box sx={{ flex: '0 0 auto' }}>
                <Tooltip title="Limpiar Conceptos (Ctrl+L)" arrow>
                  <span>
                    <IconButton
                      color="error"
                      onClick={handleLimpiarConceptos}
                      disabled={pagoData.conceptos.length === 0}
                      sx={{
                        border: '1px solid',
                        borderColor: pagoData.conceptos.length === 0 ? 'divider' : 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.light',
                          borderColor: 'error.dark',
                        },
                      }}
                    >
                      <DeleteSweepIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
      
      </FormCard>

      {/* Sección de Conceptos */}
  

          {/* Tabla de conceptos */}
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{
              maxHeight: 300,
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
                    Descripción
                  </TableCell>
                  <TableCell align="right" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    Total
                  </TableCell>
                  <TableCell align="center" width={80} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagoData.conceptos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No hay conceptos agregados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagoData.conceptos.map((concepto) => (
                    <TableRow key={concepto.id} hover>
                      <TableCell>{concepto.descripcion}</TableCell>
                      <TableCell align="right">
                        S/. {concepto.total.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminarConcepto(concepto.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
      
      {/* Espaciador entre secciones */}
      <Box sx={{ mb: 3 }} />

      {/* Sección de Totales y Forma de Pago */}
      <FormCard>
        <CardContent>
     
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: '0 1 250px', minWidth: '200px' }}>
             
              <Autocomplete
                options={formasPago}
                value={formasPago.find(fp => fp.value === pagoData.formaPago) || formasPago[0]}
                onChange={(_, newValue) => setPagoData(prev => ({ 
                  ...prev, 
                  formaPago: newValue?.value || 'CONTADO' 
                }))}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pasarela de Pago"
                    placeholder='Selecione '
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Box>
           {/* Total a Pagar  */}
            <Box sx={{ 
              flex: '0 1 auto', 
              minWidth: '250px',
              backgroundColor: '#fff3cd',
              border: '2px solid #ffeaa7',
              borderRadius: 2,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5
            }}>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                fontWeight="medium"
                sx={{ lineHeight: 1, mb: 0 }}
              >
                Total a Pagar:
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color="success.main"
                sx={{ lineHeight: 1, mb: 0 }}
              >
                S/. {calcularTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </FormCard>

      {/* Botones de Acción */}
      <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3 }}>
        <Tooltip title="Grabar (F4)" arrow>
          <span>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              onClick={handleGrabar}
              disabled={pagoData.conceptos.length === 0 || !contribuyenteSeleccionado}
              sx={{
                background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                },
                px: 4
              }}
            >
              Grabar
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Nuevo (F5)" arrow>
          <span>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              color="primary"
              size="large"
              onClick={handleNuevo}
              disabled={!contribuyenteSeleccionado && pagoData.conceptos.length === 0}
              sx={{ px: 4 }}
            >
              Nuevo
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Imprimir Recibo (F6)" arrow>
          <span>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              color="success"
              size="large"
              onClick={handleImprimirRecibo}
              disabled={pagoData.conceptos.length === 0}
              sx={{ px: 4 }}
            >
              Imprimir Recibo
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Leyenda de Atajos de Teclado */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ mr: 1 }}>
            Atajos de Teclado:
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="F2" size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }} />
            <Typography variant="caption" color="text.secondary">Buscar</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="F3" size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }} />
            <Typography variant="caption" color="text.secondary">Ver Deuda</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="F4" size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }} />
            <Typography variant="caption" color="text.secondary">Grabar</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="F5" size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }} />
            <Typography variant="caption" color="text.secondary">Nuevo</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="F6" size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }} />
            <Typography variant="caption" color="text.secondary">Imprimir</Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="Ctrl+L" size="small" sx={{ fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }} />
            <Typography variant="caption" color="text.secondary">Limpiar</Typography>
          </Box>
        </Box>
      </Box>

      {/* Modal de Búsqueda de Contribuyente */}
      <BuscarContribuyentePredio
        open={modalBusquedaOpen}
        onClose={() => setModalBusquedaOpen(false)}
        onSelect={handleSeleccionarContribuyente}
      />

      {/* Modal de Deuda Contribuyente */}
      <DeudaContribuyente
        open={modalDeudaOpen}
        onClose={() => setModalDeudaOpen(false)}
        contribuyenteData={contribuyenteSeleccionado}
        onPagoGenerado={handlePagoGenerado}
      />

      {/* Helper de Atajos de Teclado */}
      <HotkeyHelper showButton={true} />

    </Box>
  );
};

export default Pagos;