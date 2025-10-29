// src/components/caja/modal/Movimientos.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapHorizIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { TableContainerProps } from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Importar hooks de atajos de teclado
import { useModuleHotkeys } from '../../../hooks/useModuleHotkeys';
import { Tooltip } from '@mui/material';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '900px',
    maxWidth: '1200px',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledTableContainer = styled(TableContainer)<TableContainerProps>(() => ({
  flex: 1,
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
}));

// Interfaces
interface Movimiento {
  id: string;
  codigo: string;
  contribuyente: string;
  concepto: 'Pago' | 'Anulación' | 'Devolución' | 'Apertura' | 'Cierre';
  monto: number;
  fecha: Date;
  hora: string;
  usuario: string;
}

interface MovimientosProps {
  open: boolean;
  onClose: () => void;
}

// Datos de ejemplo
const movimientosEjemplo: Movimiento[] = [
  {
    id: '1',
    codigo: 'REC-001-2024',
    contribuyente: 'García López Juan Carlos',
    concepto: 'Pago',
    monto: 1500.50,
    fecha: new Date(),
    hora: '09:15:00',
    usuario: 'admin'
  },
  {
    id: '2',
    codigo: 'REC-002-2024',
    contribuyente: 'Rodríguez Silva María Elena',
    concepto: 'Pago',
    monto: 2200.00,
    fecha: new Date(),
    hora: '10:30:00',
    usuario: 'admin'
  },
  {
    id: '3',
    codigo: 'ANU-001-2024',
    contribuyente: 'Empresa ABC S.A.C.',
    concepto: 'Anulación',
    monto: -500.00,
    fecha: new Date(),
    hora: '11:45:00',
    usuario: 'admin'
  },
  {
    id: '4',
    codigo: 'REC-003-2024',
    contribuyente: 'Martínez Pérez Luis Alberto',
    concepto: 'Pago',
    monto: 750.25,
    fecha: new Date(),
    hora: '12:00:00',
    usuario: 'admin'
  },
  {
    id: '5',
    codigo: 'DEV-001-2024',
    contribuyente: 'Torres Mendoza Ana María',
    concepto: 'Devolución',
    monto: -300.00,
    fecha: new Date(),
    hora: '14:20:00',
    usuario: 'admin'
  },
  {
    id: '6',
    codigo: 'REC-004-2024',
    contribuyente: 'Constructora XYZ E.I.R.L.',
    concepto: 'Pago',
    monto: 5500.00,
    fecha: new Date(),
    hora: '15:30:00',
    usuario: 'admin'
  },
  {
    id: '7',
    codigo: 'APE-001-2024',
    contribuyente: 'SISTEMA',
    concepto: 'Apertura',
    monto: 1000.00,
    fecha: new Date(),
    hora: '08:00:00',
    usuario: 'admin'
  },
  {
    id: '8',
    codigo: 'REC-005-2024',
    contribuyente: 'Vargas Sánchez Pedro José',
    concepto: 'Pago',
    monto: 890.75,
    fecha: new Date(),
    hora: '16:15:00',
    usuario: 'admin'
  },
  {
    id: '9',
    codigo: 'REC-006-2024',
    contribuyente: 'Asociación Vecinal Los Álamos',
    concepto: 'Pago',
    monto: 1250.00,
    fecha: new Date(),
    hora: '16:45:00',
    usuario: 'admin'
  },
  {
    id: '10',
    codigo: 'REC-007-2024',
    contribuyente: 'Díaz Fernández Carmen Rosa',
    concepto: 'Pago',
    monto: 450.50,
    fecha: new Date(),
    hora: '17:00:00',
    usuario: 'admin'
  }
];

const Movimientos: React.FC<MovimientosProps> = ({ open, onClose }) => {
  const [fechaFiltro, setFechaFiltro] = useState<Date | null>(new Date());
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  useEffect(() => {
    // Filtrar movimientos por fecha actual
    if (fechaFiltro) {
      const movimientosFiltrados = movimientosEjemplo.filter(mov => {
        const fechaMov = new Date(mov.fecha);
        return fechaMov.toDateString() === fechaFiltro.toDateString();
      });
      setMovimientos(movimientosFiltrados);
    } else {
      setMovimientos(movimientosEjemplo);
    }
  }, [fechaFiltro]);

  // Calcular totales
  const calcularTotales = () => {
    const ingresos = movimientos
      .filter(m => m.concepto === 'Pago' || m.concepto === 'Apertura')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const egresos = movimientos
      .filter(m => m.concepto === 'Anulación' || m.concepto === 'Devolución')
      .reduce((sum, m) => sum + Math.abs(m.monto), 0);
    
    const saldo = ingresos - egresos;
    
    return { ingresos, egresos, saldo };
  };

  const { ingresos, egresos, saldo } = calcularTotales();

  // Obtener color y icono según el concepto
  const getConceptoChip = (concepto: string) => {
    switch (concepto) {
      case 'Pago':
        return <Chip label={concepto} color="success" size="small" icon={<TrendingUpIcon />} />;
      case 'Anulación':
        return <Chip label={concepto} color="error" size="small" icon={<TrendingDownIcon />} />;
      case 'Devolución':
        return <Chip label={concepto} color="warning" size="small" icon={<SwapHorizIcon />} />;
      case 'Apertura':
        return <Chip label={concepto} color="info" size="small" />;
      case 'Cierre':
        return <Chip label={concepto} color="default" size="small" />;
      default:
        return <Chip label={concepto} size="small" />;
    }
  };

  // Manejar impresión de movimiento individual
  const handleImprimir = (movimiento: Movimiento) => {
    console.log('Imprimir movimiento:', movimiento);
    // Aquí iría la lógica de impresión
  };

  // Manejar impresión de reporte completo
  const handleImprimirReporte = () => {
    console.log('Imprimir reporte de movimientos');
    // Aquí iría la lógica de impresión del reporte
  };

  // Actualizar fecha a hoy
  const handleActualizarFecha = () => {
    setFechaFiltro(new Date());
  };

  // Configurar atajos de teclado cuando el modal está abierto
  useModuleHotkeys('Movimientos de Caja', [
    {
      id: 'imprimir-reporte',
      name: 'Imprimir Reporte',
      description: 'Imprimir reporte completo de movimientos',
      hotkey: { key: 'F6', preventDefault: true, enabled: open },
      action: handleImprimirReporte,
      enabled: open,
      icon: 'print'
    },
    {
      id: 'actualizar-fecha',
      name: 'Actualizar',
      description: 'Actualizar fecha a hoy',
      hotkey: { key: 'F5', preventDefault: true, enabled: open },
      action: handleActualizarFecha,
      enabled: open,
      icon: 'refresh'
    },
    {
      id: 'cerrar-modal',
      name: 'Cerrar',
      description: 'Cerrar el modal de movimientos',
      hotkey: { key: 'Escape', preventDefault: true, enabled: open },
      action: onClose,
      enabled: open,
      icon: 'close'
    }
  ]);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
    >
      {/* Header */}
      <HeaderBox>
        <Box display="flex" alignItems="center" gap={1}>
          <ReceiptIcon />
          <Typography variant="h6" fontWeight="bold">
            Movimientos de Caja
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </HeaderBox>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Filtro de fecha */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="Fecha de Movimientos"
              value={fechaFiltro}
              onChange={(newValue) => setFechaFiltro(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: false,
                  sx: { width: 200 },
                  InputProps: {
                    startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                  }
                }
              }}
            />
            
            {/* Resumen de totales */}
            <Box sx={{ flex: 1, display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Ingresos:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  S/. {ingresos.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Egresos:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="error.main">
                  S/. {egresos.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: '#d1ecf1',
                border: '1px solid #bee5eb'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Saldo:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="info.main">
                  S/. {saldo.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tabla de movimientos */}
        <StyledTableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  Código
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  Contribuyente
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }} align="center">
                  Concepto
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }} align="center">
                  Hora
                </TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }} align="center" width={80}>
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No hay movimientos registrados para esta fecha
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                movimientos.map((movimiento) => (
                  <TableRow key={movimiento.id} hover>
                    <TableCell>{movimiento.codigo}</TableCell>
                    <TableCell>{movimiento.contribuyente}</TableCell>
                    <TableCell align="center">
                      {getConceptoChip(movimiento.concepto)}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: 'bold',
                        color: movimiento.monto >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      S/. {Math.abs(movimiento.monto).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">{movimiento.hora}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleImprimir(movimiento)}
                        title="Imprimir comprobante"
                      >
                        <PrintIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
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
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>F5</Paper>
              <Typography variant="caption" color="text.secondary">Actualizar</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>F6</Paper>
              <Typography variant="caption" color="text.secondary">Imprimir Reporte</Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Paper elevation={1} sx={{ px: 1, py: 0.5, fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', bgcolor: 'white' }}>Esc</Paper>
              <Typography variant="caption" color="text.secondary">Cerrar</Typography>
            </Box>
          </Box>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Tooltip title="Cerrar (Esc)" arrow>
            <Button
              onClick={onClose}
              variant="outlined"
              startIcon={<CloseIcon />}
            >
              Cerrar
            </Button>
          </Tooltip>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar a Hoy (F5)" arrow>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleActualizarFecha}
              >
                Actualizar
              </Button>
            </Tooltip>

            <Tooltip title="Imprimir Reporte (F6)" arrow>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handleImprimirReporte}
              >
                Imprimir Reporte
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default Movimientos;