// src/layout/Header.tsx - Actualizado para trabajar con el sidebar
import React, { FC, memo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  Chip,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSidebar } from '../context/SidebarContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import '../styles/header.css';

interface HeaderProps {
  title?: string;
}


const Header: FC<HeaderProps> = memo(({ title = 'Dashboard' }) => {
  const theme = useTheme();
  const { theme: currentTheme, toggleTheme } = useCustomTheme();
  const { user, logout } = useAuthContext();
  const { isExpanded } = useSidebar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Calcular el ancho del sidebar
  const drawerWidth = isExpanded ? 260 : 72;
  
  // Manejar menu del usuario
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(10px)',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar sx={{ px: 3, minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h6" 
            component="div"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Usuario y acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Chip
              avatar={
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main 
                }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={user.nombreCompleto || user.username || 'Usuario'}
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.3),
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                '& .MuiChip-label': {
                  fontWeight: 500,
                  fontSize: '0.875rem',
                },
              }}
            />
          )}

          <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

          {/* Notificaciones */}
          <IconButton
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.action.hover, 0.5),
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.main,
              },
            }}
          >
            <Badge badgeContent={3} color="error" variant="dot">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
          
          {/* Toggle tema */}
          <IconButton 
            size="small" 
            onClick={toggleTheme}
            sx={{
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.action.hover, 0.5),
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.main,
              },
            }}
          >
            {currentTheme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
          
          {/* Avatar del usuario */}
          <IconButton 
            size="small"
            onClick={handleUserMenuOpen}
            sx={{
              p: 0.5,
              '&:hover': {
                '& .MuiAvatar-root': {
                  transform: 'scale(1.05)',
                },
              },
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: theme.palette.primary.main,
                transition: theme.transitions.create(['transform']),
                boxShadow: theme.shadows[2],
              }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
          </IconButton>
          
          {/* Menu desplegable del usuario */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.nombreCompleto || user?.username}
              </Typography>
                             <Typography variant="caption" color="text.secondary">
                 {user?.username || 'usuario'}
               </Typography>
            </Box>
            
            <MenuItem 
              onClick={handleUserMenuClose}
              sx={{ 
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                py: 1.5,
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header'; 

export default Header;