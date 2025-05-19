import React, { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarWidget from './SidebarWiget';
import { useSidebar } from '../context/SidebarContext';



// Define la estructura de los elementos del submenú para permitir anidamiento
interface SubMenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  subMenuItems?: SubMenuItem[];
}

// Define la estructura de los elementos del menú principal
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  subMenuItems?: SubMenuItem[];
}

// Define las propiedades del componente AppSidebar
interface AppSidebarProps {
  toggleSidebar?: () => void;
}

// Iconos y configuración de menú...
// (el resto de tu código de iconos y configuración de menú se mantiene igual)

/**
 * Componente principal de la barra lateral de la aplicación.
 * Soporta modo expandido y colapsado.
 */
const AppSidebar: FC<AppSidebarProps> = memo(({
  toggleSidebar
}) => {
  // ... el resto de tu código
});

// Para React DevTools
AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;