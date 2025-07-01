// src/layout/MainLayout.tsx - Versión completa con Material-UI
import React, { FC, ReactNode, memo, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { useAuthContext } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disablePadding?: boolean;
  containerProps?: any;
}

// Styled component para la pantalla de carga
const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5F5F5',
  zIndex: theme.zIndex.modal + 1,
}));

const MainLayout: FC<MainLayoutProps> = memo(({ 
  children, 
  title = 'Sistema de Gestión Tributaria',
  maxWidth = 'xl',
  disablePadding = false,
  containerProps = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { loading, isAuthenticated } = useAuthContext();
  const { isExpanded } = useSidebar();
  
  // Calcular el ancho del drawer
  const drawerWidth = isExpanded ? 280 : 72;

  // Para depuración
  useEffect(() => {
    console.log('MainLayout rendered', { loading, isAuthenticated });
  }, [loading, isAuthenticated]);

  // Pantalla de carga mejorada
  if (loading) {
    return (
      <LoadingOverlay>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: theme.palette.primary.main,
            mb: 3
          }} 
        />
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            fontWeight: 300,
            letterSpacing: 1
          }}
        >
          Cargando Sistema...
        </Typography>
        <Typography 
          variant="caption" 
          color="text.disabled"
          sx={{ mt: 1 }}
        >
          Por favor espere un momento
        </Typography>
      </LoadingOverlay>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Barra lateral */}
      <AppSidebar />

      {/* Header - posicionado absolutamente */}
      <Header title={title} />

      {/* Contenido principal - posicionado absolutamente */}
      <Box
        component="main"
        sx={{
          position: 'fixed',
          top: 64, // Altura del header
          left: isMobile ? 0 : drawerWidth,
          right: 0,
          bottom: 0,
          backgroundColor: '#F5F5F5',
          overflow: 'auto',
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
});

// Nombre para DevTools
MainLayout.displayName = 'MainLayout';

export default MainLayout;