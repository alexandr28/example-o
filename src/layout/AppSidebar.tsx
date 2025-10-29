// src/layout/AppSidebar.tsx - Versión completa sin Paper

import React, { FC, memo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  List,
  Typography,
  IconButton,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Assessment as ReportsIcon,
  Gavel as GavelIcon,
  Business as FraccionamientoIcon,
  Settings as SettingsIcon,
  Computer as ComputerIcon,
  SwapVert as SwapVertIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import SidebarWidget from './SidebarWidget';
import { useSidebar } from '../context/SidebarContext';

// Interfaces
interface SubMenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  subMenuItems?: SubMenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  subMenuItems?: SubMenuItem[];
}

interface AppSidebarProps {
  toggleSidebar?: () => void;
}

// Contenedor principal del Sidebar - Usando Box en lugar de Paper
const SidebarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  backgroundColor: '#4a5568',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  zIndex: theme.zIndex.drawer,
  opacity: 1,
  borderRadius: 0,
  boxShadow: theme.shadows[8],
  borderRight: `1px solid ${alpha('#000', 0.12)}`,
  '& *': {
    opacity: 1,
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #3d4451 0%, #4a5568 100%)',
  borderBottom: `2px solid ${alpha('#60a5fa', 0.2)}`,
  position: 'relative',
  minHeight: 64,
  boxShadow: `0 2px 4px ${alpha('#000', 0.1)}`,
}));

const MenuSection = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  color: alpha('#60a5fa', 0.8),
  textTransform: 'uppercase',
  padding: theme.spacing(2, 2, 1),
  letterSpacing: '1px',
  display: 'flex',
  alignItems: 'center',
  '&::after': {
    content: '""',
    flex: 1,
    height: 1,
    backgroundColor: alpha('#60a5fa', 0.2),
    marginLeft: theme.spacing(1),
  },
}));

const ScrollableContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  backgroundColor: '#4a5568',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 0,
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 0,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.4)',
    },
  },
});

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: '50%',
  transform: 'translateY(-50%)',
  color: alpha('#60a5fa', 0.9),
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#000', 0.1),
  border: `1px solid ${alpha('#60a5fa', 0.2)}`,
  transition: theme.transitions.create(['all']),
  '&:hover': {
    backgroundColor: alpha('#60a5fa', 0.1),
    color: '#60a5fa',
    transform: 'translateY(-50%) scale(1.1)',
    borderColor: alpha('#60a5fa', 0.4),
  },
}));

// Elementos del menú principal
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  
  {
    id: 'contribuyentes',
    label: 'Contribuyentes',
    icon: <PeopleIcon />,
    subMenuItems: [
      { id: 'nuevo-contribuyente', label: 'Registro Contribuyente', path: '/contribuyente/nuevo' },
      { id: 'consulta-contribuyente', label: 'Consulta Contribuyente', path: '/contribuyente/consulta' },
      { id: 'deduccion-beneficio', label: 'Deduccion Beneficio', path: '/contribuyente/deduccion-beneficio' },
     
    ],
  },
  {
    id: 'predio',
    label: 'Predio',
    icon: <HomeIcon />,
    subMenuItems: [
      { id: 'registro-predio', label: 'Registro Predio', path: '/predio/nuevo' },
      { id: 'consulta-predio', label: 'Consulta Predio', path: '/predio/consulta' },
      { id: 'registro-pisos', label: 'Registro Pisos', path: '/predio/pisos/registro' },
      { id: 'consulta-pisos', label: 'Consulta Pisos', path: '/predio/pisos/consulta' },
      { id: 'asignacion-predios', label: 'Asignación', path: '/predio/asignacion/nuevo' },
      { id: 'consulta-asignacion', label: 'Consulta Asignación', path: '/predio/asignacion/consulta' },
      { id: 'transferencia-predios', label: 'Transferencia', path: '/predio/transferencia' },
    ],
  },
  {
    id: 'cuenta-corriente',
    label: 'Cuenta Corriente',
    icon: <AccountBalanceIcon />,
    subMenuItems: [
      { id: 'consulta-cuenta', label: 'Consulta Cuenta', path: '/cuenta-corriente/consulta' },
    ],
  },
  {
    id: 'fraccionamiento',
    label: 'Fraccionamiento',
    icon: <FraccionamientoIcon />,
    subMenuItems: [
      { id: 'nuevo-fraccionamiento', label: 'Nuevo', path: '/fraccionamiento/nuevo' },
      { id: 'consulta-fraccionamiento', label: 'Consulta', path: '/fraccionamiento/consulta' },
      { id: 'aprobacion-fraccionamiento', label: 'Aprobacion', path: '/fraccionamiento/aprobacion' },
      { id: 'reporte-fraccionamiento', label: 'Reporte Fraccionamiento', path: '/fraccionamiento/reportes' },
    ],
  },
  {
    id: 'caja',
    label: 'Caja',
    icon: <ReceiptIcon />,
    subMenuItems: [
      { id: 'asignacion-caja', label: 'Asignacion de Caja', path: '/caja/asignacion' },
      { id: 'caja', label: 'Caja', path: '/caja/apertura' },
      { id: 'consultas', label: 'Consultas', path: '/caja/consultas' },
      { id: 'Reportes', label: 'Reportes', path: '/caja/reportes' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: <ReportsIcon />,
    subMenuItems: [
      { id: 'reporte-contribuyentes', label: 'Contribuyentes', path: '/reportes/contribuyentes' },
      { id: 'reporte-predios', label: 'Predios', path: '/reportes/predios' },
      { id: 'reporte-recaudacion', label: 'Recaudación', path: '/reportes/recaudacion' },
    ],
  },
  {
    id: 'coactiva',
    label: 'Coactiva',
    icon: <GavelIcon />,
    subMenuItems: [
      { id: 'expedientes', label: 'Expedientes', path: '/coactiva/expedientes' },
      { id: 'resoluciones', label: 'Resoluciones', path: '/coactiva/resoluciones' },
      { id: 'notificaciones', label: 'Notificaciones', path: '/coactiva/notificaciones' },
    ],
  },
];

// Elementos del menú SISTEMA
const sistemaMenuItems: MenuItem[] = [
  {
    id: 'mantenedores',
    label: 'Mantenedores',
    icon: <SettingsIcon />,
    subMenuItems: [
      // Ubicación - Agrupado en un sub-menú
      {
        id: 'ubicacion',
        label: 'Ubicación',
        subMenuItems: [
          { id: 'sectores-ubicacion', label: 'Sectores', path: '/mantenedores/sectores' },
          { id: 'barrios-ubicacion', label: 'Barrios', path: '/mantenedores/barrios' },
          { id: 'calles-ubicacion', label: 'Calles', path: '/mantenedores/calles' },
          { id: 'direcciones-ubicacion', label: 'Direcciones', path: '/mantenedores/direcciones' },
        ]
      },
      // Valores
      {
        id: 'valores',
        label: 'Valores',
        subMenuItems: [
          { id: 'asignacion-arancel', label: 'Valores Arancelarios', path: '/mantenedores/aranceles' },
          { id: 'valoresUnitarios-arancel', label: 'Valores Unitarios', path: '/mantenedores/valores-unitarios' },
        ]
      },
      // Tarifas
      {
        id: 'tarifas',
        label: 'Tarifas',
        subMenuItems: [
          { id: 'uit-epa', label: 'UIT - EPA', path: '/mantenedores/uit' },
          { id: 'arbitrios', label: 'Arbitrios', path: '/mantenedores/arbitrios' },
        ]
      },
      // Escalas
      {
        id: 'escala',
        label: 'Escala',
        subMenuItems: [
          { id: 'alcabala', label: 'Alcabala', path: '/mantenedores/alcabala' },
          { id: 'depreciacion', label: 'Depreciación', path: '/mantenedores/depreciacion' },
          { id: 'registro-tim', label: 'Registro TIM', path: '/mantenedores/escalas/registro-tim' },
          { id: 'reg-resol-tim', label: 'Reg. Resol. TIM', path: '/mantenedores/escalas/reg-resolucion-tim' },
          { id: 'vencimiento', label: 'Vencimiento', path: '/mantenedores/escalas/vencimiento' },
          
        ]
      },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: <ComputerIcon />,
    subMenuItems: [
      { id: 'configuracion', label: 'Configuración', path: '/sistema/configuracion' },
      { id: 'auditoria', label: 'Auditoría', path: '/sistema/auditoria' },
      { id: 'respaldo', label: 'Respaldo', path: '/sistema/respaldo' },
    ],
  },
  {
    id: 'migracion',
    label: 'Migración',
    icon: <SwapVertIcon />,
    subMenuItems: [
      { id: 'importar', label: 'Importar', path: '/migracion/importar' },
      { id: 'exportar', label: 'Exportar', path: '/migracion/exportar' },
      { id: 'historial', label: 'Historial', path: '/migracion/historial' },
    ],
  },
];

/**
 * Componente principal de la barra lateral de la aplicación.
 */
const AppSidebar: FC<AppSidebarProps> = memo(() => {
  const theme = useTheme();
  const location = useLocation();
  const { 
    isExpanded, 
    activeItem, 
    openSubmenus,
    setActiveItem, 
    toggleSubmenu,
    toggleSidebar: contextToggleSidebar,
    setOpenSubmenus,
  } = useSidebar();

  const drawerWidth = isExpanded ? 260 : 72;

  // Debug para verificar que el componente se está renderizando
  useEffect(() => {
    console.log('AppSidebar montado - isExpanded:', isExpanded, 'width:', drawerWidth);
    console.log('MenuItems:', menuItems);
    console.log('OpenSubmenus:', openSubmenus);
  }, [isExpanded, drawerWidth, openSubmenus]);

  // Determina si un elemento del menú está activo
  const isActiveRoute = useCallback((path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  // Determina si un elemento del menú debe mostrarse como activo
  const isActiveMenuItem = useCallback((item: MenuItem): boolean => {
    if (activeItem === item.id) return true;
    if (isActiveRoute(item.path)) {
      return true;
    }
    return !!item.subMenuItems?.some(subItem => {
      if (isActiveRoute(subItem.path)) return true;
      return !!subItem.subMenuItems?.some(nestedItem => isActiveRoute(nestedItem.path));
    });
  }, [activeItem, isActiveRoute]);

  // Función para cerrar submenús de nivel inferior
  const closeChildSubmenus = useCallback((menuId: string) => {
    const findChildMenus = (id: string, items: MenuItem[] | SubMenuItem[]): string[] => {
      const childMenus: string[] = [];
      
      for (const item of items) {
        if (item.id === id && item.subMenuItems) {
          item.subMenuItems.forEach(subItem => {
            childMenus.push(subItem.id);
            if (subItem.subMenuItems) {
              subItem.subMenuItems.forEach(nestedItem => {
                childMenus.push(nestedItem.id);
              });
            }
          });
          break;
        } else if (item.subMenuItems) {
          childMenus.push(...findChildMenus(id, item.subMenuItems));
        }
      }
      
      return childMenus;
    };

    const childMenus = findChildMenus(menuId, [...menuItems, ...sistemaMenuItems]);
    
    if (childMenus.length > 0) {
      setOpenSubmenus(prev => prev.filter(id => !childMenus.includes(id)));
    }
  }, [setOpenSubmenus]);

  // Manejador personalizado para el toggle de submenús
  const handleSubmenuToggle = useCallback((menuId: string) => {
    // Si el menú ya está abierto, simplemente cerrarlo
    if (openSubmenus.includes(menuId)) {
      setOpenSubmenus(prev => prev.filter(id => id !== menuId));
    } else {
      // Si está cerrado, agregarlo al array (mantener los padres abiertos)
      setOpenSubmenus(prev => [...prev, menuId]);
    }
  }, [openSubmenus, setOpenSubmenus]);

  // Efecto para expandir submenús según la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    
    const findParentMenuIds = (path: string): string[] => {
      const parentIds: string[] = [];
      
      const searchInMenu = (items: (MenuItem | SubMenuItem)[], parentId?: string) => {
        for (const item of items) {
          if (item.path && (item.path === path || path.startsWith(item.path + '/'))) {
            if (parentId) {
              parentIds.push(parentId);
            }
          }
          
          if (item.subMenuItems && item.subMenuItems.length > 0) {
            searchInMenu(item.subMenuItems, item.id);
          }
        }
      };
      
      searchInMenu(menuItems);
      searchInMenu(sistemaMenuItems);
      
      return parentIds;
    };
    
    const parentIds = findParentMenuIds(currentPath);
    
    // Solo mantener abiertos los menús que contienen la ruta actual
    if (parentIds.length > 0) {
      setOpenSubmenus(parentIds);
    } else {
      // Si no hay coincidencias, cerrar todos los submenús
      setOpenSubmenus([]);
    }
  }, [location.pathname, setOpenSubmenus]);

  // Manejar el toggle del sidebar
  const handleToggleSidebar = () => {
    if (contextToggleSidebar) {
      contextToggleSidebar();
    }
  };

  return (
    <SidebarContainer
      className="sidebar-container"
      sx={{
        width: drawerWidth,
        backgroundColor: '#4a5568 !important',
        opacity: '1 !important',
        borderRadius: '0 !important',
        borderTopLeftRadius: '0 !important',
        borderTopRightRadius: '0 !important',
        borderBottomLeftRadius: '0 !important',
        borderBottomRightRadius: '0 !important',
        overflow: 'hidden',
        '&, & *': {
          borderRadius: '0 !important',
        },
        '& .MuiPaper-root, & .MuiBox-root': {
          borderRadius: '0 !important',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#4a5568',
          zIndex: -1,
          borderRadius: 0,
        }
      }}
      style={{
        borderRadius: 0,
        WebkitBorderRadius: 0,
        MozBorderRadius: 0,
      }}
    >
      {/* Logo y botón de toggle */}
      <LogoContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 8px ${alpha('#60a5fa', 0.3)}`,
            }}
          >
            <Box
              component="img"
              src="/escudoMDE.png"
              alt="Escudo MDE"
              sx={{
                width: 24,
                height: 24,
                objectFit: 'contain',
                //filter: 'brightness(0) invert(1)', // Convierte la imagen a blanco
              }}
            />
          </Box>
          {isExpanded && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: 0.5,
                fontSize: '1.1rem',
                transition: theme.transitions.create(['opacity']),
              }}
            >
              SIS. Rentas
            </Typography>
          )}
        </Box>
        <ToggleButton
          onClick={handleToggleSidebar}
          size="small"
          aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
        >
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </ToggleButton>
      </LogoContainer>

      {/* Contenido scrollable */}
      <ScrollableContent>
        {/* Sección MENU */}
        {isExpanded ? (
          <MenuSection>MENU</MenuSection>
        ) : (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
              •••
            </Typography>
          </Box>
        )}

        {/* Elementos del menú principal */}
        <List component="nav" sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <SidebarWidget
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={isExpanded ? item.label : ''}
              path={item.path}
              isActive={isActiveMenuItem(item)}
              subMenuItems={item.subMenuItems || []}
              onCustomToggle={handleSubmenuToggle}
            />
          ))}
        </List>

        {/* Separador SISTEMA */}
        {isExpanded ? (
          <MenuSection>SISTEMA</MenuSection>
        ) : (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
              •••
            </Typography>
          </Box>
        )}

        {/* Elementos del menú SISTEMA */}
        <List component="nav" sx={{ px: 1 }}>
          {sistemaMenuItems.map((item) => (
            <SidebarWidget
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={isExpanded ? item.label : ''}
              path={item.path}
              isActive={isActiveMenuItem(item)}
              subMenuItems={item.subMenuItems || []}
              onCustomToggle={handleSubmenuToggle}
            />
          ))}
        </List>
      </ScrollableContent>
    </SidebarContainer>
  );
});

// Para React DevTools
AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;