import { FC, memo } from 'react';
import MainLayout from '../layout/MainLayout';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useAuthContext } from '../context/AuthContext';

/**
 * Página de demostración que utiliza el MainLayout con AppSidebar
 */
const DemoPage: FC = memo(() => {
  const { theme } = useTheme();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user } = useAuthContext();

  return (
    <MainLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Bienvenido al Sistema Tributario, {user?.nombreCompleto || user?.username || 'Usuario'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Esta es una página de demostración que muestra el layout principal con la barra lateral.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Contribuyentes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Gestión de contribuyentes del municipio</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Predios</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Administración de predios y propiedades</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Reportes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Generación de informes y estadísticas</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Estado actual:</h2>
          <ul className="list-disc ml-5 space-y-1 text-gray-600 dark:text-gray-300">
            <li>Tema: <span className="font-medium">{theme}</span></li>
            <li>Barra lateral: <span className="font-medium">{isExpanded ? 'Expandida' : 'Colapsada'}</span></li>
            <li>Usuario: <span className="font-medium">{user?.username}</span></li>
            <li>Nombre: <span className="font-medium">{user?.nombreCompleto}</span></li>
            <li>Roles: <span className="font-medium">{user?.roles ? user.roles.join(', ') : 'Sin roles'}</span></li>
          </ul>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {isExpanded ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
});

// Nombre para DevTools
DemoPage.displayName = 'DemoPage';

export default DemoPage;