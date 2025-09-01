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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PredioForm from '../../components/predio/PredioForm';
import NotificationContainer from '../../components/utils/Notification';
import MainLayout from '../../layout/MainLayout';
import { usePredios } from '../../hooks/usePredioAPI';

/**
 * Página para registrar un nuevo predio usando API POST sin autenticación
 * URL: POST http://26.161.18.122:8080/api/predio
 */
const NuevoPredio: FC = memo(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Hook para gestión de predios con API integrada
  const { crearPredio, loading } = usePredios();

  // Definir las migas de pan para la navegación
  const breadcrumbItems = [
    { label: 'Módulo', path: '/', icon: <HomeIcon sx={{ fontSize: 20 }} /> },
    { label: 'Predio', path: '/predio', icon: <DomainIcon sx={{ fontSize: 20 }} /> },
    { label: 'Registro de predio', active: true }
  ];

  // Handler para cuando se envía el formulario
  const handleSubmitPredio = async (data: any) => {
    console.log('🏠 [NuevoPredio] Datos del formulario recibidos:', data);
    
    // Preparar datos según estructura exacta del JSON del API
    const datosFormulario = {
      // Datos requeridos
      numeroFinca: data.numeroFinca || '',
      areaTerreno: Number(data.areaTerreno) || 0,
      direccionId: data.direccion?.id || data.direccionId,
      
      // Datos del formulario mapeados correctamente
      anio: data.anio || new Date().getFullYear(),
      otroNumero: data.otroNumero || '',
      fechaAdquisicion: data.fechaAdquisicion,
      
      // Mapeo correcto de códigos del formulario
      codClasificacion: data.clasificacionPredio, // Campo del form → campo del API
      estadoPredio: data.estadoPredio, // Para usarlo como estPredio en el DTO
      codTipoPredio: data.tipoPredio, // Campo del form → campo del API
      codCondicionPropiedad: data.condicionPropiedad, // Campo del form → campo del API
      codUsoPredio: data.usoPredio, // Campo del form → campo del API
      codListaConductor: data.conductor, // Campo del form → campo del API
      
      // Datos numéricos
      numeroPisos: Number(data.numeroPisos) || 1,
      numeroCondominos: Number(data.numeroCondominos) || 2, // Por defecto 2 según JSON ejemplo
      
      // Datos opcionales (pueden ser null)
      totalAreaConstruccion: data.totalAreaConstruccion ? Number(data.totalAreaConstruccion) : null,
      valorTerreno: data.valorTerreno ? Number(data.valorTerreno) : null,
      valorTotalConstruccion: data.valorTotalConstruccion ? Number(data.valorTotalConstruccion) : null,
      autoavaluo: data.autoavaluo ? Number(data.autoavaluo) : null,
      
      // Valores por defecto según el JSON ejemplo
      codUbicacionAreaVerde: 1,
      codEstado: "0201",
      codUsuario: 1
    };
    
    console.log('📤 [NuevoPredio] Enviando datos al hook:', datosFormulario);
    
    // Llamar al hook que maneja la creación con la API
    const predioCreado = await crearPredio(datosFormulario);
    
    if (predioCreado) {
      console.log('✅ [NuevoPredio] Predio creado exitosamente:', predioCreado);
      
      // La redirección se maneja en PredioForm después de guardar exitosamente
      // No es necesario redirigir aquí
    }
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
            loading={loading}
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