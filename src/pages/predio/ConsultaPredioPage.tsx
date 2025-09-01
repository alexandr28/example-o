// src/pages/predio/ConsultaPredioPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Domain as DomainIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import ConsultaPredios from '../../components/predio/ConsultaPredios';
import { NotificationService } from '../../components/utils/Notification';

/**
 * Página de consulta de predios con Material-UI
 */
const ConsultaPredioPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const { predioRecienCreado, mensaje } = location.state || {};
  const [mostrarAlerta, setMostrarAlerta] = useState(!!predioRecienCreado);

  useEffect(() => {
    // Si hay un predio recién creado, mostrar notificación
    if (predioRecienCreado && mensaje) {
      NotificationService.success(`${mensaje} - Código: ${predioRecienCreado.codPredio || predioRecienCreado.codigo || 'Nuevo'}`);
      setMostrarAlerta(true);
    }
  }, [predioRecienCreado, mensaje]);

  // Items del breadcrumb
  const breadcrumbItems = [
    { label: 'Inicio', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Predio', path: '/predio', icon: <DomainIcon sx={{ fontSize: 20 }} /> },
    { label: 'Consulta General', active: true, icon: <SearchIcon sx={{ fontSize: 20 }} /> }
  ];

  return (
    <MainLayout title="Consulta de Predios">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Breadcrumb mejorado */}
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
                      icon={item.icon}
                      color="primary"
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          fontSize: 18
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
                    color="inherit"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { 
                        color: theme.palette.primary.main 
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Header opcional */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main'
                }}
              >
                <SearchIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Consulta de Predios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Busque y gestione los predios registrados en el sistema
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Mostrar alerta si hay un predio recién creado */}
          {predioRecienCreado && mostrarAlerta && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setMostrarAlerta(false)}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                ¡Predio registrado exitosamente!
              </Typography>
              <Typography variant="body2">
                Código: {predioRecienCreado.codPredio || 'Nuevo'} | 
                Área: {predioRecienCreado.areaTerreno} m² | 
                N° Finca: {predioRecienCreado.numeroFinca}
              </Typography>
            </Alert>
          )}

          {/* Componente de consulta */}
          <ConsultaPredios />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default ConsultaPredioPage;