// src/layout/MainLayout.tsx 
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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={80} 
              thickness={2}
              sx={{ 
                color: '#ffffff',
                opacity: 0.3,
                position: 'absolute'
              }} 
            />
            <CircularProgress 
              size={80} 
              thickness={2}
              sx={{ 
                color: '#ffffff',
                animationDuration: '1.5s'
              }} 
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>
                R
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: 2,
                color: '#ffffff',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              SIS. RENTAS
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: 1
              }}
            >
              Iniciando sistema...
            </Typography>
          </Box>
        </Box>
      </LoadingOverlay>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: theme.palette.grey[50]
    }}>
      {/* Barra lateral */}
      <AppSidebar />

      {/* Header - ajustado para dejar espacio al sidebar */}
      <Header title={title} />

      {/* Contenido principal - ajustado para el sidebar */}
      <Box
        component="main"
        sx={{
          position: 'fixed',
          top: 64, // Altura del header actualizada
          left: drawerWidth, // Dejar espacio para el sidebar
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.default} 100%)`,
          overflow: 'auto',
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          padding: theme.spacing(3),
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[200],
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: 4,
            '&:hover': {
              backgroundColor: theme.palette.grey[500],
            },
          },
        }}
      >
        <Box sx={{ 
          maxWidth: maxWidth || '100%',
          margin: '0 auto',
          animation: 'fadeIn 0.3s ease-in',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
});

// Nombre para DevTools
MainLayout.displayName = 'MainLayout';

export default MainLayout;