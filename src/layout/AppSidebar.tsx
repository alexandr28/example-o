import React, { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarWidget from './SidebarWiget';
import { useSidebar } from '../context/SidebarContext';
import {
    GridIcon,PageIcon,ListIcon, PieChartIcon,TableIcon,TaskIcon,BoxCubeIcon,PlugInIcon,DocsIcon} from "../icons"

// Iconos para el menú
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const ContribuyenteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PredioIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CuentaCorrienteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ReportesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const CajaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CoactivaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MantenedoresIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const SistemaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

const MigracionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

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

// Configuración de los elementos del menú
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon/>,
    path: '/dashboard',
  },
  {
    id: 'contribuyente',
    label: 'Contribuyente',
    icon: <ContribuyenteIcon/>,
    subMenuItems: [
      { id: 'nuevo-contribuyente', label: 'Registrar', path: '/contribuyente/nuevo' },
      { id: 'consulta-contribuyentes', label: 'Consulta', path: '/contribuyente/listado' },
    ],
  },
  {
    id: 'predio',
    label: 'Predio',
    icon: <CuentaCorrienteIcon />,
    subMenuItems: [
      { id: 'nuevo-predio', label: 'Registro Predio', path: '/predio/nuevo' },
      { id: 'consulta-predios', label: 'Consulta General', path: '/predio/consulta' },
      { 
        id: 'pisos', 
        label: 'Pisos',
        subMenuItems: [
          { id: 'registro-pisos', label: 'Registro Pisos', path: '/predio/pisos/registro' },
          
          { id: 'consulta-pisos', label: 'Consulta Pisos', path: '/predio/pisos/consulta' },
        ]
      },
      { id: 'asignacion-predios', label: 'Asignación', path: '/predio/asignacion' },
      { id: 'transferencia-predios', label: 'Transferencia', path: '/predio/transferencia' },
    ],
  },
  {
    id: 'caja',
    label: 'Caja',
    icon: <CajaIcon />,
    subMenuItems: [
      { id: 'apertura-caja', label: 'Apertura de Caja', path: '/caja/apertura' },
      { id: 'cierre-caja', label: 'Cierre de Caja', path: '/caja/cierre' },
      { id: 'movimientos', label: 'Movimientos', path: '/caja/movimientos' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: <ReportesIcon />,
    subMenuItems: [
      { id: 'reporte-contribuyentes', label: 'Contribuyentes', path: '/reportes/contribuyentes' },
      { id: 'reporte-predios', label: 'Predios', path: '/reportes/predios' },
      { id: 'reporte-recaudacion', label: 'Recaudación', path: '/reportes/recaudacion' },
    ],
  },
  
  {
    id: 'coactiva',
    label: 'Coactiva',
    icon: <CoactivaIcon />,
    subMenuItems: [
      { id: 'expedientes', label: 'Expedientes', path: '/coactiva/expedientes' },
      { id: 'resoluciones', label: 'Resoluciones', path: '/coactiva/resoluciones' },
      { id: 'notificaciones', label: 'Notificaciones', path: '/coactiva/notificaciones' },
    ],
  },
];

// Elementos del menú OTHERS
const othersMenuItems: MenuItem[] = [
  {
    id: 'mantenedores',
    label: 'Mantenedores',
    icon: <MantenedoresIcon />,
    subMenuItems: [
      { 
        id: 'parametros', 
        label: 'Ubicacion', 
        subMenuItems: [
          { id: 'calles-ubicacion', label: 'Calles', path: '/mantenedores/ubicacion/calles' },
          { id: 'sectores-ubicacion', label: 'Sectores', path: '/mantenedores/ubicacion/sectores' },
          { id: 'barrios-ubicacion', label: 'Barrios', path: '/mantenedores/ubicacion/barrios' },
          { id: 'direcciones-ubicacion', label: 'Direcciones', path: '/mantenedores/ubicacion/direcciones' },
        ]
      },
      { 
        id: 'parametros', 
        label: 'Arancel', 
        subMenuItems: [
          { id: 'asignacion-arancel', label: 'Asignación', path: '/mantenedores/arancel/asignacion' },
          { id: 'valoresUnitarios-arancel', label: 'Valores Unitarios', path: '/mantenedores/arancel/valoresUnitarios' },
        ]
      },
      { id: 'usuarios', label: 'Usuarios', path: '/mantenedores/usuarios' },
      { id: 'roles', label: 'Roles', path: '/mantenedores/roles' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: <SistemaIcon />,
    subMenuItems: [
      { id: 'configuracion', label: 'Configuración', path: '/sistema/configuracion' },
      { id: 'auditoria', label: 'Auditoría', path: '/sistema/auditoria' },
      { id: 'respaldo', label: 'Respaldo', path: '/sistema/respaldo' },
    ],
  },
  {
    id: 'migracion',
    label: 'Migración',
    icon: <MigracionIcon />,
    subMenuItems: [
      { id: 'importar', label: 'Importar', path: '/migracion/importar' },
      { id: 'exportar', label: 'Exportar', path: '/migracion/exportar' },
      { id: 'historial', label: 'Historial', path: '/migracion/historial' },
    ],
  },
];

interface AppSidebarProps {
  toggleSidebar?: () => void;
}

/**
 * Componente principal de la barra lateral de la aplicación.
 * Soporta modo expandido y colapsado.
 */
const AppSidebar: FC<AppSidebarProps> = memo(({
  toggleSidebar
}) => {
  const location = useLocation();
  const { 
    isExpanded, 
    isMobileOpen, 
    activeItem, 
    openSubmenu, 
    setActiveItem, 
    toggleSubmenu,
    setIsHovered
  } = useSidebar();

  // Determina si un elemento del menú está activo
  const isActiveRoute = (path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Determina si un elemento del menú debe mostrarse como activo
  const isActiveMenuItem = (item: MenuItem): boolean => {
    if (activeItem === item.id) return true;
    if (isActiveRoute(item.path)) {
      setActiveItem(item.id);
      return true;
    }
    return !!item.subMenuItems?.some(subItem => isActiveRoute(subItem.path));
  };

  // Renderiza el logo
  const renderLogo = () => (
    <div className="flex items-center justify-center py-3 px-3">
      {!isExpanded ? (
        // Cuando la barra está colapsada, muestra solo el escudo
        <img 
          src="/escudoMDE.png" 
          alt="MDE" 
          className="w-12 h-12 transition-all duration-300" 
        />
      ) : (
        // Cuando la barra está expandida, muestra el logo completo
        <img 
          src="/logoMenu.png" 
          alt="Municipalidad Distrital de La Esperanza" 
          className="max-w-[200px] transition-all duration-300" 
        />
      )}
    </div>
  );

  return (
    <aside 
      className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      {renderLogo()}

      {/* Sección MENU */}
      {isExpanded && <div className="px-4 py-2 text-xs font-semibold text-gray-400">MENU</div>}
      {!isExpanded && <div className="flex justify-center text-xs py-2">•••</div>}

      {/* Elementos del menú principal */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-2">
          {menuItems.map((item) => (
            <SidebarWidget
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={isExpanded ? item.label : ''}
              path={item.path}
              isActive={isActiveMenuItem(item)}
              subMenuItems={isExpanded ? item.subMenuItems : []}
            />
          ))}
        </nav>

        {/* Separador OTHERS */}
        {isExpanded && <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-400">OTHERS</div>}
        {!isExpanded && <div className="flex justify-center text-xs py-2 mt-4">•••</div>}

        {/* Elementos del menú OTHER */}
        <nav className="py-2">
          {othersMenuItems.map((item) => (
            <SidebarWidget
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={isExpanded ? item.label : ''}
              path={item.path}
              isActive={isActiveMenuItem(item)}
              subMenuItems={isExpanded ? item.subMenuItems : []}
            />
          ))}
        </nav>
      </div>

      {/* Pie de página - Solo visible cuando no está colapsado */}
      {isExpanded && (
        <div className="border-t border-gray-200 py-4 px-4">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">Sub Gerencia de Sistemas</div>
            <div className="text-xs text-gray-500 mt-1">Todos los Derechos Reservados</div>
            <div className="text-xs text-gray-500">Municipalidad Distrital de la Esperanza</div>
            <button className="mt-3 bg-green-600 text-white rounded-md w-full py-2 text-sm font-medium">
              MDE
            </button>
          </div>
        </div>
      )}
    </aside>
  );
});

// Para React DevTools
AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;