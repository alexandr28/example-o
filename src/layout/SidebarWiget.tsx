// src/layout/SidebarWidget.tsx - Versión actualizada para tema verde oscuro
import React, { FC, ReactNode, memo, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Tooltip,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  FiberManualRecord
} from '@mui/icons-material';
import { useSidebar } from '../context/SidebarContext';
import { navigationGuard } from '../components/utils/navigationGuard';

// Interfaces
export interface SubMenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  subMenuItems?: SubMenuItem[];
}

interface SidebarWidgetProps {
  id: string;
  icon: ReactNode;
  label: string;
  path?: string;
  isActive?: boolean;
  subMenuItems?: SubMenuItem[];
  level?: number;
  onCustomToggle?: (menuId: string) => void;
}

const SidebarWidget: FC<SidebarWidgetProps> = memo(({
  id,
  icon,
  label,
  path,
  isActive = false,
  subMenuItems = [],
  level = 0,
  onCustomToggle
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isExpanded, openSubmenus, setActiveItem, toggleSubmenu } = useSidebar();
  const [hovered, setHovered] = useState(false);

  // Determina si un elemento del menú está activo
  const isActiveRoute = useCallback((itemPath?: string): boolean => {
    if (!itemPath) return false;
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
  }, [location.pathname]);

  // Determina si cualquier submenú tiene un elemento activo
  const hasActiveSubmenuItem = useCallback((items: SubMenuItem[]): boolean => {
    for (const item of items) {
      if (isActiveRoute(item.path)) {
        return true;
      }
      if (item.subMenuItems && hasActiveSubmenuItem(item.subMenuItems)) {
        return true;
      }
    }
    return false;
  }, [isActiveRoute]);

  const shouldBeOpen = hasActiveSubmenuItem(subMenuItems);
  const isMenuActive = isActive || shouldBeOpen || isActiveRoute(path);
  const hasSubMenu = subMenuItems.length > 0;
  const isSubMenuOpen = openSubmenus.includes(id) || (hasSubMenu && shouldBeOpen);

  // Manejar navegación con confirmación
  const handleNavigation = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!path) return;
    
    // Si la ruta actual es la misma, no hacer nada
    if (location.pathname === path) {
      return;
    }

    // Verificar si hay cambios sin guardar usando navigationGuard
    if (navigationGuard.hasUnsavedChanges()) {
      if (navigationGuard.confirmNavigation()) {
        navigationGuard.clearUnsavedChanges();
        setActiveItem(id);
        navigate(path);
      }
    } else {
      // No hay cambios, navegar normalmente
      setActiveItem(id);
      navigate(path);
    }
  }, [path, location.pathname, setActiveItem, id, navigate]);

  // Manejar clics para elementos sin ruta
  const handleClick = useCallback(() => {
    if (hasSubMenu) {
      // Si tiene submenú, toggle el submenú
      if (onCustomToggle) {
        onCustomToggle(id);
      } else {
        toggleSubmenu(id);
      }
    } else if (path) {
      // Si tiene path pero llegó aquí, significa que es un elemento sin submenú
      // que por alguna razón no se manejó con handleNavigation
      setActiveItem(id);
    }
  }, [hasSubMenu, path, id, onCustomToggle, toggleSubmenu, setActiveItem]);

  // Función recursiva para renderizar submenús
  const renderSubMenu = (items: SubMenuItem[], currentLevel: number) => {
    return items.map((item) => (
      <SidebarWidget
        key={item.id}
        id={item.id}
        icon={item.icon || <FiberManualRecord sx={{ fontSize: 6 }} />}
        label={item.label}
        path={item.path}
        isActive={isActiveRoute(item.path)}
        subMenuItems={item.subMenuItems}
        level={currentLevel + 1}
        onCustomToggle={onCustomToggle}
      />
    ));
  };

  // Estilos
  const paddingLeft = isExpanded ? level * 1.5 + 1 : 1;

  const buttonStyles = {
    minHeight: 44,
    justifyContent: isExpanded ? 'initial' : 'center',
    px: paddingLeft,
    py: 1,
    borderRadius: 0, // Sin bordes redondeados
    mx: 0.5,
    my: 0.25,
    position: 'relative',
    color: isMenuActive ? '#ffffff' : alpha('#ffffff', 0.7),
    backgroundColor: isMenuActive
      ? 'rgba(255, 255, 255, 0.15)' // Fondo semi-transparente para items activos
      : 'transparent',
    '&:hover': {
      backgroundColor: isMenuActive
        ? 'rgba(255, 255, 255, 0.2)' // Hover más visible
        : 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
    },
    '&::before': isMenuActive && level === 0 ? {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 3,
      height: '70%',
      backgroundColor: '#60a5fa', // Azul claro para el indicador activo
      borderRadius: 0, // Sin bordes redondeados
    } : {},
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.shorter,
    }),
  };

  const iconStyles = {
    minWidth: 0,
    mr: isExpanded ? 1.5 : 'auto',
    justifyContent: 'center',
    color: isMenuActive
      ? '#60a5fa' // Azul claro para íconos activos
      : 'inherit',
    '& svg': {
      fontSize: level === 0 ? 20 : 16,
      transition: theme.transitions.create('color'),
    },
  };

  const textStyles = {
    opacity: isExpanded ? 1 : 0,
    fontSize: level === 0 ? '0.875rem' : '0.813rem',
    fontWeight: isMenuActive ? 500 : 400,
    color: 'inherit',
    '& .MuiListItemText-primary': {
      fontSize: 'inherit',
      fontWeight: 'inherit',
    },
  };

  // Contenido del botón
  const buttonContent = (
    <>
      {icon && (
        <ListItemIcon sx={iconStyles}>
          {icon}
        </ListItemIcon>
      )}
      {isExpanded && (
        <>
          <ListItemText
            primary={label}
            sx={textStyles}
          />
          {hasSubMenu && (
            <Box
              sx={{
                ml: 'auto',
                color: isMenuActive ? '#60a5fa' : alpha('#ffffff', 0.5),
                transition: theme.transitions.create(['transform', 'color']),
                transform: isSubMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              {isSubMenuOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </Box>
          )}
        </>
      )}
    </>
  );

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ListItem
        disablePadding
        sx={{
          display: 'block',
          position: 'relative',
        }}
      >
        {path && !hasSubMenu ? (
          <Tooltip
            title={!isExpanded && level === 0 ? label : ''}
            placement="right"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(0, 0, 0, 0.9)',
                  },
                },
              },
            }}
          >
            <ListItemButton
              onClick={handleNavigation}
              sx={buttonStyles}
            >
              {buttonContent}
            </ListItemButton>
          </Tooltip>
        ) : (
          <Tooltip
            title={!isExpanded && level === 0 ? label : ''}
            placement="right"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(0, 0, 0, 0.9)',
                  },
                },
              },
            }}
          >
            <ListItemButton
              onClick={handleClick}
              sx={buttonStyles}
            >
              {buttonContent}
            </ListItemButton>
          </Tooltip>
        )}
      </ListItem>

      {hasSubMenu && (
        <Collapse
          in={isSubMenuOpen && isExpanded}
          timeout="auto"
          unmountOnExit
        >
          <List
            component="div"
            disablePadding
            sx={{
              position: 'relative',
              '&::before': level === 0 ? {
                content: '""',
                position: 'absolute',
                left: theme.spacing(2.5),
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: alpha('#ffffff', 0.1),
              } : {},
            }}
          >
            {renderSubMenu(subMenuItems, level)}
          </List>
        </Collapse>
      )}

      {!isExpanded && hasSubMenu && shouldBeOpen && (
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#60a5fa',
            boxShadow: `0 0 0 2px ${alpha('#60a5fa', 0.3)}`,
          }}
        />
      )}
    </Box>
  );
});

SidebarWidget.displayName = 'SidebarWidget';

export default SidebarWidget;