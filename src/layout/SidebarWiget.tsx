import React, { FC, ReactNode, memo } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

// Interfaces para los elementos del menú con soporte para anidamiento
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
  level = 0
}) => {
  const { isExpanded, openSubmenu, openSubmenus, setActiveItem, toggleSubmenu } = useSidebar();
  const hasSubMenu = subMenuItems.length > 0;
  const isSubMenuOpen = openSubmenu === id || openSubmenus.includes(id);
  const paddingLeft = level > 0 ? `${level * 1}rem` : '';

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubMenu) {
      e.preventDefault(); // Prevenir navegación si tiene submenú
      toggleSubmenu(id);
    }
    setActiveItem(id);
  };

  // Función recursiva para renderizar submenús anidados
  const renderSubMenu = (items: SubMenuItem[], currentLevel: number) => {
    return items.map((item) => {
      const hasNestedSubMenu = item.subMenuItems && item.subMenuItems.length > 0;
      const isItemOpen = openSubmenus.includes(item.id);
      
      return (
        <div key={item.id} className="mt-1">
          {item.path && !hasNestedSubMenu ? (
            <Link
              to={item.path}
              className="flex items-center py-2 text-sm text-gray-500 hover:text-gray-700"
              style={{ paddingLeft: `${(currentLevel + 1) * 0.75}rem` }}
              onClick={() => setActiveItem(item.id)}
            >
              {item.icon && (
                <div className="w-4 h-4 mr-2">
                  {item.icon}
                </div>
              )}
              <span>{item.label}</span>
            </Link>
          ) : (
            // Elemento que tiene submenú anidado
            <div 
              className="flex items-center py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              style={{ paddingLeft: `${(currentLevel + 1) * 0.75}rem` }}
              onClick={(e) => {
                e.stopPropagation(); // Evitar que el evento se propague al padre
                if (hasNestedSubMenu) {
                  toggleSubmenu(item.id);
                }
              }}
            >
              {item.icon && (
                <div className="w-4 h-4 mr-2">
                  {item.icon}
                </div>
              )}
              <span>{item.label}</span>
              {hasNestedSubMenu && (
                <div className="ml-auto">
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isItemOpen ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
          )}
          
          {/* Renderizado recursivo de submenús anidados */}
          {hasNestedSubMenu && isItemOpen && (
            <div className="pl-2 border-l-2 border-gray-100 ml-4">
              {renderSubMenu(item.subMenuItems!, currentLevel + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="relative">
      {/* Elemento principal del menú */}
      {path && !hasSubMenu ? (
        <Link 
          to={path} 
          className={`flex items-center w-full py-3 px-4 cursor-pointer transition-colors duration-200 ${
            isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{ paddingLeft }}
          onClick={() => setActiveItem(id)}
        >
          <div className="w-6 h-6 flex items-center justify-center mr-3">
            {icon}
          </div>
          {isExpanded && <span className="font-medium">{label}</span>}
        </Link>
      ) : (
        <div 
          className={`flex items-center w-full py-3 px-4 cursor-pointer transition-colors duration-200 ${
            isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{ paddingLeft }}
          onClick={handleClick}
        >
          <div className="w-6 h-6 flex items-center justify-center mr-3">
            {icon}
          </div>
          {isExpanded && (
            <>
              <span className="font-medium">{label}</span>
              {hasSubMenu && (
                <div className="ml-auto">
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${isSubMenuOpen ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Submenú con soporte para anidamiento */}
      {hasSubMenu && isSubMenuOpen && isExpanded && (
        <div className="pl-10 border-l-2 border-gray-100 ml-4 mt-1">
          {renderSubMenu(subMenuItems, level)}
        </div>
      )}
    </div>
  );
});

// Para React DevTools
SidebarWidget.displayName = 'SidebarWidget';

export default SidebarWidget;