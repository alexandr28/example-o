// src/pages/caja/CajaPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes
import MainLayout from '../../layout/MainLayout';
import AperturaCaja, { AperturaCajaData } from '../../components/caja/AperturaCaja';
import Pagos from '../../components/caja/Pagos';
import Movimientos from '../../components/caja/modal/Movimientos';
import { NotificationService } from '../../components/utils/Notification';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: `0 4px 20px ${theme.palette.primary.main}30`,
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: '1px solid #e0e0e0',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

// Interface para el estado de la caja
interface EstadoCaja {
  numeroCaja: string;
  fechaApertura: string;
  montoInicial: number;
  montoActual: number;
  totalIngresos: number;
  totalEgresos: number;
  abierta: boolean;
  ultimaTransaccion?: string;
}

const CajaPage: React.FC = () => {
  // Estado de la caja
  const [estadoCaja, setEstadoCaja] = useState<EstadoCaja>({
    numeroCaja: '00013',
    fechaApertura: '',
    montoInicial: 0,
    montoActual: 0,
    totalIngresos: 0,
    totalEgresos: 0,
    abierta: false,
    ultimaTransaccion: undefined
  });

  // Estados de modales
  const [aperturaModalOpen, setAperturaModalOpen] = useState(false);
  const [movimientosModalOpen, setMovimientosModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Manejar apertura de caja
  const handleAperturaCaja = async (data: AperturaCajaData) => {
    setLoading(true);
    
    try {
      console.log('Apertura de caja:', data);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar estado de la caja
      setEstadoCaja({
        numeroCaja: data.numeroCaja,
        fechaApertura: data.fechaApertura,
        montoInicial: data.montoInicial,
        montoActual: data.montoInicial,
        totalIngresos: 0,
        totalEgresos: 0,
        abierta: true,
        ultimaTransaccion: new Date().toLocaleTimeString('es-PE')
      });

      // Cerrar modal
      setAperturaModalOpen(false);
      
      // Mostrar notificación
      NotificationService.success(
        `¡Caja abierta exitosamente! Caja N° ${data.numeroCaja} iniciada con S/. ${data.montoInicial.toFixed(2)}`
      );
      
    } catch (error) {
      console.error('Error al abrir caja:', error);
      NotificationService.error(
        'Error al abrir caja: No se pudo procesar la apertura de caja. Intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejar cierre de caja
  const handleCierreCaja = () => {
    if (window.confirm('¿Está seguro que desea cerrar la caja?')) {
      setEstadoCaja(prev => ({
        ...prev,
        abierta: false
      }));
      
      NotificationService.info(
        `Caja cerrada: Caja N° ${estadoCaja.numeroCaja} cerrada exitosamente`
      );
    }
  };

  // Manejar apertura del modal de movimientos
  const handleVerMovimientos = () => {
    setMovimientosModalOpen(true);
  };

  return (
    <MainLayout title="Gestión de Caja">
      <PageContainer maxWidth="xl">
      {/* Header */}
      <HeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CreditCardIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Gestión de Caja
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Sistema de control de ingresos y egresos
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              label={estadoCaja.abierta ? 'CAJA ABIERTA' : 'CAJA CERRADA'}
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 2,
                py: 1,
                color: 'white',
                background: estadoCaja.abierta 
                  ? 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)' 
                  : 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                '&:hover': {
                  background: estadoCaja.abierta 
                    ? 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)' 
                    : 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                }
              }}
            />
          </Box>
        </Box>
      </HeaderBox>

   

      {/* Botones de Control */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Controles de Caja
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <ActionButton
            variant="contained"
            startIcon={<CreditCardIcon />}
            onClick={() => setAperturaModalOpen(true)}
            disabled={estadoCaja.abierta}
            sx={{
              background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
              },
              '&:disabled': {
                background: '#ccc',
              }
            }}
          >
            Abrir Caja
          </ActionButton>
          
          <ActionButton
            variant="contained"
            startIcon={<ScheduleIcon />}
            onClick={handleCierreCaja}
            disabled={!estadoCaja.abierta}
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #e57373 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              },
              '&:disabled': {
                background: '#ccc',
              }
            }}
          >
            Cerrar Caja
          </ActionButton>
          
          <ActionButton
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleVerMovimientos}
            disabled={!estadoCaja.abierta}
          >
            Ver Movimientos
          </ActionButton>
        </Box>
      </Paper>

      {/* Sección de Pagos/Ingresos */}
      {estadoCaja.abierta ? (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Pagos />
        </Paper>
      ) : (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body1">
            <strong>Caja cerrada:</strong> Para realizar operaciones, primero debe abrir la caja.
          </Typography>
        </Alert>
      )}

      {/* Modal de Apertura de Caja */}
      <AperturaCaja
        open={aperturaModalOpen}
        onClose={() => setAperturaModalOpen(false)}
        onSave={handleAperturaCaja}
        loading={loading}
      />

      {/* Modal de Movimientos */}
      <Movimientos
        open={movimientosModalOpen}
        onClose={() => setMovimientosModalOpen(false)}
      />
      </PageContainer>
    </MainLayout>
  );
};

export default CajaPage;