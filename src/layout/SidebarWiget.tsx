// src/layout/SidebarWidget.tsx - Versión mejorada con Material-UI
import React, { FC, ReactNode, memo, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  alpha,
  IconButton,
  Typography
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronRight,
  FiberManualRecord
} from '@mui/icons-material';
import { useSidebar } from '../context/SidebarContext';

// Interfaces para los elementos del submenú con soporte para anidamiento
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

/**
 * Componente para un elemento individual en la barra lateral
 * Soporta íconos, etiquetas y submenús desplegables anidados
 */
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
  const { isExpanded, openSubmenus, setActiveItem, toggleSubmenu } = useSidebar();
  const [hovered, setHovered] = useState(false);

  // Determina si un elemento del menú está activo basado en la ruta actual
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

  // Verifica si este menú tiene algún elemento activo
  const shouldBeOpen = hasActiveSubmenuItem(subMenuItems);
  const isMenuActive = isActive || shouldBeOpen || isActiveRoute(path);
  const hasSubMenu = subMenuItems.length > 0;
  const isSubMenuOpen = openSubmenus.includes(id) || (hasSubMenu && shouldBeOpen);

  // Manejo de clics
  const handleClick = useCallback(() => {
    if (hasSubMenu) {
      if (onCustomToggle) {
        onCustomToggle(id);
      } else {
        toggleSubmenu(id);
      }
    } else if (path) {
      setActiveItem(id);
    }
  }, [hasSubMenu, path, id, onCustomToggle, toggleSubmenu, setActiveItem]);

  // Función recursiva para renderizar submenús
  const renderSubMenu = (items: SubMenuItem[], currentLevel: number) => {
    return items.map((item) => (
      <SidebarWidget
        key={item.id}
        id={item.id}
        icon={item.icon || <FiberManualRecord sx={{ fontSize: 8 }} />}
        label={item.label}
        path={item.path}
        isActive={isActiveRoute(item.path)}
        subMenuItems={item.subMenuItems}
        level={currentLevel + 1}
        onCustomToggle={onCustomToggle}
      />
    ));
  };

  // Calcular indentación basada en el nivel
  const paddingLeft = isExpanded ? level * 2 + 2.5 : 2.5;

  // Estilos del botón según el estado
  const buttonStyles = {
    minHeight: 48,
    justifyContent: isExpanded ? 'initial' : 'center',
    px: paddingLeft,
    py: 1,
    borderRadius: 1,
    mx: 1,
    my: 0.5,
    position: 'relative',
    backgroundColor: isMenuActive
      ? 'rgba(16, 185, 129, 0.15)'
      : 'transparent',
    '&:hover': {
      backgroundColor: isMenuActive
        ? 'rgba(16, 185, 129, 0.25)'
        : 'rgba(255, 255, 255, 0.05)',
    },
    '&::before': isMenuActive && level === 0 ? {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 4,
      height: '70%',
      backgroundColor: '#10B981',
      borderRadius: '0 4px 4px 0',
    } : {},
    transition: theme.transitions.create(['background-color', 'padding'], {
      duration: theme.transitions.duration.shorter,
    }),
  };

  // Estilos del ícono
  const iconStyles = {
    minWidth: 0,
    mr: isExpanded ? 2 : 'auto',
    justifyContent: 'center',
    color: isMenuActive
      ? '#10B981'
      : 'rgba(255, 255, 255, 0.7)',
    transition: theme.transitions.create('color', {
      duration: theme.transitions.duration.shorter,
    }),
  };

  // Estilos del texto
  const textStyles = {
    opacity: isExpanded ? 1 : 0,
    transition: theme.transitions.create(['opacity'], {
      duration: theme.transitions.duration.shorter,
    }),
  };

  // Contenido del botón
  const buttonContent = (
    <>
      <ListItemIcon sx={iconStyles}>
        {level > 0 && !icon ? (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isMenuActive
                ? '#10B981'
                : 'rgba(255, 255, 255, 0.5)',
              opacity: isMenuActive ? 1 : 0.5,
            }}
          />
        ) : (
          icon
        )}
      </ListItemIcon>
      
      {isExpanded && (
        <>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: level > 0 ? '0.875rem' : '0.95rem',
              fontWeight: isMenuActive ? 600 : 400,
              color: isMenuActive
                ? '#10B981'
                : '#FFFFFF',
              sx: textStyles,
            }}
          />
          {hasSubMenu && (
            <Box
              sx={{
                ml: 'auto',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {isSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </>
      )}
    </>
  );

  // Renderizar el elemento del menú
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
          >
            <ListItemButton
              component={Link}
              to={path}
              onClick={() => setActiveItem(id)}
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

      {/* Submenú con animación */}
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
                left: theme.spacing(4),
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                opacity: 0.5,
              } : {},
            }}
          >
            {renderSubMenu(subMenuItems, level)}
          </List>
        </Collapse>
      )}

      {/* Indicador visual cuando está colapsado y tiene submenús activos */}
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
            backgroundColor: '#10B981',
            boxShadow: `0 0 0 2px rgba(16, 185, 129, 0.3)`,
          }}
        />
      )}
    </Box>
  );
});

// Para React DevTools
SidebarWidget.displayName = 'SidebarWidget';

export default SidebarWidget;