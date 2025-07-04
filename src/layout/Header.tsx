// src/layout/Header.tsx - Actualizado para trabajar con el sidebar
import React, { FC, memo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  useTheme,
  styled,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useSidebar } from '../context/SidebarContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: 'fixed',
  backgroundColor: '#2d3748', // Color que combina con el sidebar
  color: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  zIndex: theme.zIndex.drawer + 1, // Asegurar que esté por encima del sidebar
}));

const Header: FC<HeaderProps> = memo(({ title = 'Dashboard' }) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { user } = useAuthContext();
  const { isExpanded } = useSidebar();
  
  // Calcular el ancho del sidebar
  const drawerWidth = isExpanded ? 260 : 72;

  return (
    <StyledAppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Usuario logueado */}
        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 2,
              px: 2,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: alpha('#ffffff', 0.1),
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              {user.nombre || 'Usuario'}
            </Typography>
            <Badge 
              badgeContent="USER" 
              color="success"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.625rem',
                  height: 16,
                  minWidth: 35,
                }
              }}
            />
          </Box>
        )}

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" size="large">
            <SearchIcon />
          </IconButton>
          
          <IconButton color="inherit" size="large" onClick={toggleTheme}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <IconButton color="inherit" size="large">
            <Badge badgeContent={2} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" size="large">
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
});

Header.displayName = 'Header';

export default Header;