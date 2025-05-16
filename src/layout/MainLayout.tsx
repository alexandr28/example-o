import { FC, ReactNode, memo } from 'react';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { SidebarProvider } from '../context/SidebarContext';
import { ThemeProvider } from '../context/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: FC<MainLayoutProps> = memo(({ 
  children, 
  title = 'Gerencia de Administración Tributaria'
}) => {
  

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
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
});

// Nombre para DevTools
MainLayout.displayName = 'MainLayout';

export default MainLayout;