// src/routes/AppRouter.tsx - Versión actualizada con Material-UI
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

// Componentes de debug
import SimpleDebug from '../components/debug/SimpleDebud';

// Páginas
import { 
  DemoPage,
  CallePage,
  NuevoContribuyente, 
  SectoresPage,
  BarriosPage, 
  DireccionesPage,
  ArancelesPage,
  ValoresUnitariosPage,
  ConsultaContribuyente,
  UitPage,
  AlcabalaPage,
  DepreciacionPage,
  NuevoPredio,
  ConsultaPredioPage,
  RegistroPisoPage,
  ConsultaPisosPage
} from '../pages';

// Providers y contextos
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SidebarProvider } from '../context/SidebarContext';
import MuiThemeProviderWrapper from '../providers/MuiThemeProvider';

// Componentes de autenticación
import LoginPage from '../pages/Login/LoginPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthHandler from '../components/auth/AuthHandler';

// Sistema de notificaciones
import { NotificationContainer } from '../components';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MuiThemeProviderWrapper>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <SidebarProvider>
              {/* Debug component para desarrollo */}
              {process.env.NODE_ENV === 'development' && <SimpleDebug />}
              
              <Router>
                {/* Manejador de autenticación automática y notificaciones */}
                <AuthHandler />
                
                {/* Container de notificaciones global */}
                <NotificationContainer />
                
                <Routes>
                  {/* Ruta pública - Login */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Ruta por defecto */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Rutas protegidas - Dashboard */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />

                  {/* Rutas de contribuyente */}
                  <Route path="/contribuyente/nuevo" element={
                    <ProtectedRoute>
                      <NuevoContribuyente />
                    </ProtectedRoute>
                  } />
                  <Route path="/contribuyente/consulta" element={
                    <ProtectedRoute>
                      <ConsultaContribuyente />
                    </ProtectedRoute>
                  } />

                  {/* Rutas de predio */}
                  <Route path="/predio/nuevo" element={
                    <ProtectedRoute>
                      <NuevoPredio />
                    </ProtectedRoute>
                  } />
                  <Route path="/predio/consulta" element={
                    <ProtectedRoute>
                      <ConsultaPredioPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/predio/pisos/registro" element={
                    <ProtectedRoute>
                      <RegistroPisoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/predio/pisos/consulta" element={
                    <ProtectedRoute>
                      <ConsultaPisosPage />
                    </ProtectedRoute>
                  } />

                  {/* Rutas de Caja */}
                  <Route path="/caja/apertura" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/caja/cierre" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/caja/cobro" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/caja/movimiento" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />

                  {/* Rutas de Cuenta Corriente */}
                  <Route path="/cuenta-corriente/cargo/nuevo" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/cuenta-corriente/abono/nuevo" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/cuenta-corriente/consulta" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />

                  {/* Rutas de Reportes */}
                  <Route path="/reportes/contribuyentes" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/predios" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/cuentas" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/recaudacion" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />

                  {/* Rutas coactiva */}
                  <Route path="/coactiva" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/coactiva/expediente" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/coactiva/resoluciones" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/coactiva/notificaciones" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rutas de mantenedores - Ubicación */}
                  <Route path="/mantenedores/sectores" element={
                    <ProtectedRoute>
                      <SectoresPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mantenedores/calles" element={
                    <ProtectedRoute>
                      <CallePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mantenedores/barrios" element={
                    <ProtectedRoute>
                      <BarriosPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mantenedores/direcciones" element={
                    <ProtectedRoute>
                      <DireccionesPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rutas de mantenedores - Aranceles */}
                  <Route path="/mantenedores/aranceles" element={
                    <ProtectedRoute>
                      <ArancelesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mantenedores/valores-unitarios" element={
                    <ProtectedRoute>
                      <ValoresUnitariosPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rutas de mantenedores - Tarifas */}
                  <Route path="/mantenedores/uit" element={
                    <ProtectedRoute>
                      <UitPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mantenedores/alcabala" element={
                    <ProtectedRoute>
                      <AlcabalaPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mantenedores/depreciacion" element={
                    <ProtectedRoute>
                      <DepreciacionPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rutas de sistema */}
                  <Route path="/sistema/usuarios" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sistema/roles" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sistema/permisos" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sistema/configuracion" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sistema/auditoria" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/sistema/respaldo" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rutas de migración */}
                  <Route path="/migracion" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/migracion/importar" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/migracion/exportar" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/migracion/historial" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />

                  {/* Rutas adicionales */}
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/buscar" element={
                    <ProtectedRoute>
                      <DemoPage />
                    </ProtectedRoute>
                  } />

                  {/* Ruta 404 */}
                  <Route path="*" element={
                    <ProtectedRoute>
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
                          <p className="text-gray-600 dark:text-gray-300">Página no encontrada</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Router>
            </SidebarProvider>
          </LocalizationProvider>
        </MuiThemeProviderWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppRouter;