import { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  openSubmenus: string[];
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  setOpenSubmenus: (submenus: string[] | ((prev: string[]) => string[])) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Verifica si un ID o su ruta está entre los activos
  const isPathActive = (pathname: string, items: any[]): boolean => {
    for (const item of items) {
      if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) {
        return true;
      }
      if (item.subMenuItems && isPathActive(pathname, item.subMenuItems)) {
        return true;
      }
    }
    return false;
  };

  // Encuentra todos los IDs de los menús padres de una ruta activa
  const findActiveMenuParents = (pathname: string, items: any[], parentIds: string[] = []): string[] => {
    for (const item of items) {
      // Si este ítem coincide o es un padre de la ruta activa
      if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) {
        return parentIds;
      }
      
      // Si tiene submenús, búscalo recursivamente
      if (item.subMenuItems) {
        const foundIds = findActiveMenuParents(pathname, item.subMenuItems, [...parentIds, item.id]);
        if (foundIds.length > 0) {
          return foundIds;
        }
      }
    }
    return [];
  };

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item: string) => {
    // Verificamos si ya existe en la lista
    const isOpen = openSubmenus.includes(item);
    
    if (isOpen) {
      // Si ya está abierto y no tiene elementos hijos activos, lo cerramos
      const pathname = window.location.pathname;
      let hasActiveChild = false;
      
      // Aquí es donde verificaríamos si tiene elementos activos dentro
      // Como no tenemos acceso directo a la estructura del menú en este contexto,
      // implementamos una solución parcial:
      
      // Si el elemento corresponde a una ruta activa o es padre de una, no lo cerramos
      if (pathname.includes(item.toLowerCase())) {
        // Ruta incluye el nombre del ítem, probablemente es parte de su jerarquía
        // No lo cerramos
        return;
      }
      
      // Si llegamos aquí, podemos cerrarlo
      setOpenSubmenus(prevOpenSubmenus => prevOpenSubmenus.filter(id => id !== item));
      
      // También actualizamos el openSubmenu si coincide con el ítem actual
      if (openSubmenu === item) {
        setOpenSubmenu(null);
      }
    } else {
      // Si no está abierto, lo añadimos
      setOpenSubmenus(prevOpenSubmenus => [...prevOpenSubmenus, item]);
      
      // Actualizamos también openSubmenu para mantener compatibilidad con el código antiguo
      setOpenSubmenu(item);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        openSubmenus,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        setOpenSubmenus,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};