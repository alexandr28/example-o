// src/pages/predio/NuevoPredio.tsx
import React, { FC, memo, useState } from 'react';
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
  alpha,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Domain as DomainIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import PredioForm from '../../components/predio/PredioForm';
import SelectorContribuyente from '../../components/modal/SelectorContribuyente';
import NotificationContainer from '../../components/utils/Notification';
import MainLayout from '../../layout/MainLayout';

interface Contribuyente {
  codigo: number;
  contribuyente: string;
  documento: string;
  direccion: string;
  telefono?: string;
  tipoPersona?: 'natural' | 'juridica';
}

/**
 * Página para registrar un nuevo predio con selector de contribuyente
 */
const NuevoPredio: FC = memo(() => {
  const theme = useTheme();
  const [contribuyenteSeleccionado, setContribuyenteSeleccionado] = useState<Contribuyente | null>(null);
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  // Definir las migas de pan para la navegación
  const breadcrumbItems = [
    { label: 'Módulo', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Predio', path: '/predio', icon: <DomainIcon sx={{ fontSize: 20 }} /> },
    { label: 'Registro de predio', active: true }
  ];

  // Handler para seleccionar contribuyente
  const handleSelectContribuyente = (contribuyente: Contribuyente) => {
    setContribuyenteSeleccionado(contribuyente);
    setShowSelectorModal(false);
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
                      size="small"
                      icon={item.icon}
                      color="primary"
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
                      gap: 0.5
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Header con información */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
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

          {/* Sección de Contribuyente */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={600}>
                    Contribuyente Propietario
                  </Typography>
                  {!contribuyenteSeleccionado && (
                    <Chip 
                      label="Requerido" 
                      color="warning" 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Stack>

                {!contribuyenteSeleccionado ? (
                  // Mostrar botón para seleccionar contribuyente
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.grey[500], 0.04),
                      borderRadius: 2,
                      border: `2px dashed ${theme.palette.divider}`
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No se ha seleccionado ningún contribuyente
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonIcon />}
                      onClick={() => setShowSelectorModal(true)}
                      sx={{ mt: 2 }}
                    >
                      Seleccionar Contribuyente
                    </Button>
                  </Box>
                ) : (
                  // Mostrar información del contribuyente seleccionado
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {contribuyenteSeleccionado.tipoPersona === 'juridica' ? 
                              <BusinessIcon /> : <PersonIcon />
                            }
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {contribuyenteSeleccionado.contribuyente}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                icon={<BadgeIcon />}
                                label={contribuyenteSeleccionado.documento}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={contribuyenteSeleccionado.tipoPersona === 'juridica' ? 
                                  'Persona Jurídica' : 'Persona Natural'
                                }
                                color={contribuyenteSeleccionado.tipoPersona === 'juridica' ? 
                                  'secondary' : 'primary'
                                }
                              />
                            </Stack>
                          </Box>
                        </Stack>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => setShowSelectorModal(true)}
                        >
                          Cambiar
                        </Button>
                      </Stack>
                      
                      <Divider />
                      
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                          <LocationIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Dirección:
                            </Typography>
                            <Typography variant="body2">
                              {contribuyenteSeleccionado.direccion}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        {contribuyenteSeleccionado.telefono && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Teléfono:
                              </Typography>
                              <Typography variant="body2">
                                {contribuyenteSeleccionado.telefono}
                              </Typography>
                            </Box>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Alerta informativa */}
          {!contribuyenteSeleccionado && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Debe seleccionar un contribuyente antes de poder registrar un predio
            </Alert>
          )}
          
          {/* Contenedor del formulario */}
          <Paper 
            elevation={1}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              opacity: !contribuyenteSeleccionado ? 0.6 : 1,
              pointerEvents: !contribuyenteSeleccionado ? 'none' : 'auto'
            }}
          >
            <PredioForm codPersona={contribuyenteSeleccionado?.codigo} />
          </Paper>
        </Box>
      </Container>
      
      {/* Modal de selección de contribuyente */}
      <SelectorContribuyente
        isOpen={showSelectorModal}
        onClose={() => setShowSelectorModal(false)}
        onSelectContribuyente={handleSelectContribuyente}
        selectedId={contribuyenteSeleccionado?.codigo}
      />
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer />
    </MainLayout>
  );
});

// Nombre para DevTools
NuevoPredio.displayName = 'NuevoPredio';

export default NuevoPredio;