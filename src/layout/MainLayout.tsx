import { FC, ReactNode, memo, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { SidebarProvider } from '../context/SidebarContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
// import AuthDebug from '../components/debug/AuthDebug'; // Descomentar para depuración

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: FC<MainLayoutProps> = memo(({ 
  children, 
  title = 'Gerencia de Administración Tributaria'
}) => {
  const { loading, isAuthenticated } = useAuthContext();
  
  // Para depuración
  useEffect(() => {
    console.log('MainLayout rendered', { loading, isAuthenticated });
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Barra lateral */}
          <AppSidebar />

          {/* Contenido principal */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Encabezado */}
            <Header title={title} />

            {/* Contenido */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
          
          {/* Componente de depuración */}
          {/* <AuthDebug /> */}
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
});

// Nombre para DevTools
MainLayout.displayName = 'MainLayout';

export default MainLayout;