import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SimpleDebug from '../components/debug/SimpleDebud';
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
NuevoPredio
} 
  from  '../pages'
import { SidebarProvider } from '../context/SidebarContext';
import { ThemeProvider } from '../context/ThemeContext';

import LoginPage from '../pages/Login/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthHandler from '../components/auth/AuthHandler';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          {/* Añadir esto para depuración básica */}
          <SimpleDebug />
          <Router>
            {/* Este componente maneja la autenticación automática y notificaciones */}
            <AuthHandler />
            <Routes>
              {/* Ruta pública - Login */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Ruta por defecto */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rutas protegidas */}
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
                  <ConsultaContribuyente/>
                </ProtectedRoute>
              } />

              {/* Rutas de predio */}
              <Route path="/predio/nuevo" element={
                <ProtectedRoute>
                  <NuevoPredio />
                </ProtectedRoute>
              } />
              <Route path="/predio/buscar" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />
              <Route path="/predio/listado" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />

               {/* Rutas Caja */}
              <Route path="/caja/apertura" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />
              <Route path="/caja/Cierre" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />
              <Route path="/caja/movimiento" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />

              {/* Rutas Reportes */}
              <Route path="/reportes/contribuyente" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />
              <Route path="/reportes/predio" element={
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
              
              {/* Rutas de mantenedores */}
              <Route path="/mantenedores/ubicacion/calles" element={
                <ProtectedRoute>
                  <CallePage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/ubicacion/sectores" element={
                <ProtectedRoute>
                  <SectoresPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/ubicacion/barrios" element={
                <ProtectedRoute>
                  <BarriosPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/ubicacion/direcciones" element={
                <ProtectedRoute>
                  <DireccionesPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/arancel/asignacion" element={
                <ProtectedRoute>
                  <ArancelesPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/arancel/valoresUnitarios" element={
                <ProtectedRoute>
                  <ValoresUnitariosPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/tarifas/uit" element={
                <ProtectedRoute>
                  <UitPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/tarifas/alcabala" element={
                <ProtectedRoute>
                  <AlcabalaPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/tarifas/depreciacion" element={
                <ProtectedRoute>
                  <DepreciacionPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/tarifas/arbitrios" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />
              <Route path="/mantenedores/roles" element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              } />
              
              {/* Rutas de sistema */}
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
            </Routes>
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default AppRouter;