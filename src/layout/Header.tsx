// src/layout/Header.tsx - Versión mejorada con Material-UI
import React, { FC, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Chip,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  Brightness4,
  Brightness7,
  Search,
  MoreVert,
  Person,
  Security,
  Language
} from '@mui/icons-material';
import { useSidebar } from '../context/SidebarContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
}

const Header: FC<HeaderProps> = memo(({ title = 'Sistema de Gestión Tributaria' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { toggleSidebar, toggleMobileSidebar, isExpanded } = useSidebar();
  const { theme: appTheme, toggleTheme } = useCustomTheme();
  const { user, logout } = useAuthContext();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

  // Estados para las notificaciones de ejemplo
  const [notifications] = useState([
    { id: 1, message: 'Nuevo contribuyente registrado', time: '5 min', read: false },
    { id: 2, message: 'Reporte de predios generado', time: '1 hora', read: false },
    { id: 3, message: 'Caja cerrada exitosamente', time: '2 horas', read: true },
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/perfil');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    navigate('/configuracion');
  };

  const drawerWidth = isExpanded ? 280 : 72;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        left: { xs: 0, md: `${drawerWidth}px` },
        transition: theme.transitions.create(['width', 'left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        backgroundColor: '#2D3748',
        color: '#FFFFFF',
        boxShadow: `0px 1px 3px rgba(0, 0, 0, 0.2)`,
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Botón del menú móvil */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="abrir menú"
          onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
          sx={{ 
            mr: 2,
            display: { md: 'none' },
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título de la página */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            noWrap
            component="div"
            sx={{ 
              fontWeight: 600,
              color: '#10B981',
            }}
          >
            {title}
          </Typography>
          
          {/* Breadcrumb o información adicional */}
          {!isMobile && user && (
            <Chip
              label={`${user.roles?.[0] || 'Usuario'}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        {/* Sección de acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Búsqueda rápida (solo desktop) */}
          {!isMobile && (
            <Tooltip title="Búsqueda rápida">
              <IconButton
                size="large"
                color="inherit"
                onClick={() => navigate('/buscar')}
              >
                <Search />
              </IconButton>
            </Tooltip>
          )}

          {/* Cambiar tema */}
          <Tooltip title={appTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton
              size="large"
              color="inherit"
              onClick={toggleTheme}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              {appTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleOpenNotifications}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Menú de usuario */}
          <Tooltip title="Cuenta de usuario">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#10B981',
                  color: '#FFFFFF',
                }}
              >
                {user?.nombreCompleto?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Menú de notificaciones */}
        <Menu
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              mt: 1.5,
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Notificaciones</Typography>
            <Chip label={`${unreadNotifications} nuevas`} size="small" color="primary" />
          </Box>
          <Divider />
          {notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleCloseNotifications}
              sx={{
                py: 2,
                backgroundColor: !notification.read ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                '&:hover': {
                  backgroundColor: !notification.read 
                    ? alpha(theme.palette.primary.main, 0.08)
                    : theme.palette.action.hover,
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: !notification.read ? 600 : 400 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={handleCloseNotifications} sx={{ justifyContent: 'center', py: 1.5 }}>
            <Typography variant="body2" color="primary">
              Ver todas las notificaciones
            </Typography>
          </MenuItem>
        </Menu>

        {/* Menú de usuario */}
        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 280,
              mt: 1.5,
            }
          }}
        >
          {/* Header del menú con info del usuario */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#10B981',
                }}
              >
                {user?.nombreCompleto?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.nombreCompleto || user?.username || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || 'usuario@sistema.com'}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider />
          
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mi Perfil</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Configuración</ListItemText>
          </MenuItem>
          
          <MenuItem>
            <ListItemIcon>
              <Security fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cambiar Contraseña</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <Box sx={{ px: 2, py: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appTheme === 'dark'}
                  onChange={toggleTheme}
                  size="small"
                />
              }
              label="Modo oscuro"
              sx={{ width: '100%' }}
            />
          </Box>
          
          <MenuItem>
            <ListItemIcon>
              <Language fontSize="small" />
            </ListItemIcon>
            <ListItemText>Idioma</ListItemText>
            <Typography variant="caption" color="text.secondary">
              Español
            </Typography>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Cerrar Sesión</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default Header;