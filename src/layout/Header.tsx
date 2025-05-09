import React, { FC, memo } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  title: string;
}

/**
 * Componente de encabezado para la aplicación
 * 
 * Muestra el título de la aplicación, botón para colapsar/expandir el sidebar
 * y controles de usuario adicionales
 */
const Header: FC<HeaderProps> = memo(({ title }) => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 shadow-sm">
      {/* Botón para mostrar/ocultar sidebar */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
        aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isExpanded ? "M4 6h16M4 12h16M4 18h7" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
      
      {/* Título de la página o sección */}
      <div className="ml-4 text-lg font-semibold text-gray-700 dark:text-white">
        {title}
      </div>
      
      {/* Controles adicionales (derecha) */}
      <div className="ml-auto flex items-center space-x-2">
        {/* Botón de notificaciones */}
        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
          aria-label="Notificaciones"
        >
          <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        
        {/* Botón de tema */}
        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
          aria-label={theme === 'dark' ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        
        {/* Botón de perfil de usuario */}
        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
          aria-label="Perfil de usuario"
        >
          <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  );
});

// Nombre para DevTools
Header.displayName = 'Header';

export default Header;