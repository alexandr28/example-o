// src/pages/predio/NuevoPredio.tsx
import React, { FC, memo } from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Chip,
  useTheme
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
 * Ahora la selección de contribuyente está integrada dentro del PredioForm
 */
const NuevoPredio: FC = memo(() => {
  const theme = useTheme();

  // Definir las migas de pan para la navegación
  const breadcrumbItems = [
    { label: 'Módulo', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Predio', path: '/predio', icon: <DomainIcon sx={{ fontSize: 20 }} /> },
    { label: 'Registro de predio', active: true }
  ];

  // Handler para cuando se envía el formulario
  const handleSubmitPredio = (data: any) => {
    console.log('Datos del predio a registrar:', data);
    // Aquí iría la lógica para enviar los datos al backend
    // Por ejemplo: await predioService.crearPredio(data);
  };

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
                      icon={item.icon}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  );
                }

                return (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path || '/'}
                    underline="hover"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {item.icon && (
                      <Box component="span" sx={{ mr: 0.5, display: 'flex' }}>
                        {item.icon}
                      </Box>
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Formulario de Predio con selector de contribuyente integrado */}
          <PredioForm 
            onSubmit={handleSubmitPredio}
          />
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