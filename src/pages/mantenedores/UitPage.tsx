// src/pages/mantenedores/UitPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Button,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { MainLayout } from '../../layout';
import { Breadcrumb, UitForm, UitList } from '../../components';
import { BreadcrumbItem } from '../../components/utils/Breadcrumb';
import { useUIT } from '../../hooks/useUIT';
import { NotificationService } from '../../components/utils/Notification';

/**
 * Página principal para gestión de UIT-EPA con Material-UI
 */
const UitPage: React.FC = () => {
  const theme = useTheme();
  
  // Usar el hook personalizado para acceder a toda la lógica de UIT
  const {
    uits,
    alicuotas,
    aniosDisponibles,
    anioSeleccionado,
    montoCalculo,
    resultadoCalculo,
    loading,
    error,
    handleAnioChange,
    handleMontoChange,
    calcularImpuesto,
    actualizarAlicuotas
  } = useUIT();

  // Migas de pan para la navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Módulo', path: '/' },
    { label: 'Mantenedores', path: '/mantenedores' },
    { label: 'Tarifas', path: '/mantenedores/tarifas' },
    { label: 'UIT - EPA', active: true }
  ];

  // Handler para el cálculo con notificación
  const handleCalcular = async () => {
    try {
      await calcularImpuesto();
      if (resultadoCalculo !== null) {
        NotificationService.success(`Cálculo completado. Impuesto: S/ ${resultadoCalculo.toFixed(2)}`);
      }
    } catch (err) {
      NotificationService.error('Error al realizar el cálculo');
    }
  };

  // Handler para actualizar
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
        {/* Navegación de migas de pan */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <AccountBalanceIcon color="primary" fontSize="large" />
              <Typography variant="h4" component="h1" fontWeight="bold">
                UIT - EPA
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Unidad Impositiva Tributaria - Emisión Predial Anual
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>
        </Stack>

        {/* Alert informativo */}
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<CalculateIcon />}
        >
          <Typography variant="body2">
            Calcule el impuesto predial basado en la UIT del año seleccionado. 
            Las alícuotas se aplican de forma progresiva según los rangos establecidos.
          </Typography>
        </Alert>

        {/* Mostrar errores si hay */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Mostrar resultado del cálculo */}
        {resultadoCalculo !== null && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              border: `1px solid ${theme.palette.success.main}`
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="success.dark">
                Resultado del cálculo:
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.dark">
                S/ {resultadoCalculo.toFixed(2)}
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Stack para organizar los componentes */}
        <Stack spacing={4}>
          {/* Formulario de UIT y Alicuotas */}
          <UitForm
            aniosDisponibles={aniosDisponibles}
            anioSeleccionado={anioSeleccionado}
            montoCalculo={montoCalculo}
            alicuotas={alicuotas}
            onAnioChange={handleAnioChange}
            onMontoChange={handleMontoChange}
            onCalcular={handleCalcular}
            onActualizarAlicuotas={actualizarAlicuotas}
            loading={loading}
            editable={true}
          />

          {/* Lista de UIT */}
          <UitList
            uits={uits}
            loading={loading}
          />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default UitPage;