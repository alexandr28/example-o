// src/pages/predio/NuevoPredio.tsx
import React, { FC, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Container,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Domain as DomainIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import PredioForm from '../../components/predio/PredioForm';
import NotificationContainer from '../../components/utils/Notification';
import MainLayout from '../../layout/MainLayout';

/**
 * Página para registrar un nuevo predio
 */
const NuevoPredio: FC = memo(() => {
  const theme = useTheme();
  
  // TODO: Obtener el codPersona del contribuyente seleccionado
  // Por ahora usamos un valor de ejemplo
  const codPersona = 1; // Este valor debería venir del contexto o de la selección previa

  // Definir las migas de pan para la navegación
  const breadcrumbItems = [
    { label: 'Módulo', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Predio', path: '/predio', icon: <DomainIcon sx={{ fontSize: 20 }} /> },
    { label: 'Registro de predio', active: true }
  ];

  return (
    <MainLayout title="Registro de Predio">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                
                if (isLast || item.active) {
                  return (
                    <Chip
                      key={item.label}
                      label={item.label}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  );
                }

                return (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path || '/'}
                    underline="hover"
                    color="inherit"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
          
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              borderRadius: 2
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: theme.shadows[3]
                }}
              >
                <DomainIcon />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary.dark">
                  Registro de Predio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete la información del predio para su registro en el sistema
                </Typography>
              </Box>
            </Stack>
          </Paper>
          
          {/* Contenedor del formulario */}
          <Paper 
            elevation={1}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'background.paper'
            }}
          >
            <PredioForm codPersona={codPersona} />
          </Paper>
        </Box>
      </Container>
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer />
    </MainLayout>
  );
});

// Nombre para DevTools
NuevoPredio.displayName = 'NuevoPredio';

export default NuevoPredio;