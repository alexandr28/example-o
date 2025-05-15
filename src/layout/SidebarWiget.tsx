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
  // Determina si un elemento del menú está activo basado en la ruta actual
  const isActiveRoute = (path?: string): boolean => {
    if (!path) return false;
    const location = window.location.pathname;
    return location === path || location.startsWith(path + '/');
  };

  // Determina si cualquier submenú tiene un elemento activo (para mantenerlo abierto)
  const hasActiveSubmenuItem = (items: SubMenuItem[]): boolean => {
    for (const item of items) {
      if (isActiveRoute(item.path)) {
        return true;
      }
      if (item.subMenuItems && hasActiveSubmenuItem(item.subMenuItems)) {
        return true;
      }
    }
    return false;
  };

  // Verifica si este menú tiene algún elemento activo
  const shouldBeOpen = hasActiveSubmenuItem(subMenuItems);

  // Determinar si el ítem actual corresponde a la ruta activa o un elemento hijo lo está
  const isMenuActive = isActive || shouldBeOpen || isActiveRoute(path);

  const hasSubMenu = subMenuItems.length > 0;
  // Determinar si el elemento debe estar abierto
  const isSubMenuOpen = openSubmenu === id || openSubmenus.includes(id) || (hasSubMenu && (shouldBeOpen || isMenuActive));
  const paddingLeft = level > 0 ? `${level * 1}rem` : '';

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubMenu) {
      e.preventDefault(); // Prevenir navegación si tiene submenú
      
      // Si el elemento ya está en openSubmenus, no lo quitamos para mantenerlo abierto
      if (!openSubmenus.includes(id)) {
        toggleSubmenu(id);
      }
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
              className={`flex items-center py-2 text-sm transition-colors duration-150 
                ${isActiveRoute(item.path) 
                  ? 'bg-gray-100 text-green-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              style={{ paddingLeft: `${(currentLevel + 1) * 0.75}rem` }}
              onClick={() => {
                // Evitamos cerrar submenús al navegar
                setActiveItem(item.id);
                
                // Almacenar los menús abiertos en localStorage para persistencia
                if (item.path) {
                  try {
                    const currentPath = item.path;
                    const parentMenuIds = [id]; // Incluir el id del menú padre actual
                    
                    // Si hay submenús padres, añadir también sus IDs
                    if (level > 0) {
                      const parentId = `parent-${level-1}`;
                      const storedParentId = localStorage.getItem(parentId);
                      if (storedParentId) {
                        parentMenuIds.unshift(storedParentId);
                      }
                    }
                    
                    // Guardar esta información en localStorage
                    localStorage.setItem('activeMenuPath', currentPath);
                    localStorage.setItem('activeMenuParents', JSON.stringify(parentMenuIds));
                    
                    // Forzar la apertura de todos los menús padres
                    parentMenuIds.forEach(menuId => {
                      if (!openSubmenus.includes(menuId)) {
                        toggleSubmenu(menuId);
                      }
                    });
                  } catch (e) {
                    console.error('Error saving menu state:', e);
                  }
                }
              }}
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
              className={`flex items-center py-2 text-sm transition-colors duration-150 cursor-pointer
                ${openSubmenus.includes(item.id) 
                  ? 'bg-gray-50 text-gray-800 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              style={{ paddingLeft: `${(currentLevel + 1) * 0.75}rem` }}
              onClick={(e) => {
                e.stopPropagation(); // Evitar que el evento se propague al padre
                if (hasNestedSubMenu) {
                  // Si ya está abierto y hacemos clic, no queremos cerrarlo si tiene elementos activos
                  if (!openSubmenus.includes(item.id) || !hasActiveSubmenuItem(item.subMenuItems || [])) {
                    toggleSubmenu(item.id);
                  }
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
          className={`flex items-center w-full py-3 px-4 cursor-pointer transition-colors duration-200 
            ${isActive || isActiveRoute(path)
              ? 'bg-gray-100 text-green-600 font-medium' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
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
          className={`flex items-center w-full py-3 px-4 cursor-pointer transition-colors duration-200 
            ${isActive || shouldBeOpen
              ? 'bg-gray-50 text-green-600 font-medium' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
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