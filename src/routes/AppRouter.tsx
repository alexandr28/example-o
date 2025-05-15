import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import NuevoContribuyenteConLayout from '../pages/NuevoContribuyente';
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
AlcabalaPage
} 
  from  '../pages'
import { SidebarProvider } from '../context/SidebarContext';
import { ThemeProvider } from '../context/ThemeContext';

const AppRouter: React.FC = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/dashboard" element={<DemoPage />} />

            {/* Rutas de contribuyente */}
            <Route path="/contribuyente/nuevo" element={<NuevoContribuyente />} />
            <Route path="/contribuyente/consulta" element={<ConsultaContribuyente/>} />

            {/* Rutas de predio */}
            <Route path="/predio/nuevo" element={<DemoPage />} />
            <Route path="/predio/buscar" element={<DemoPage />} />
            <Route path="/predio/listado" element={<DemoPage />} />

             {/* Rutas Caja */}
            <Route path="/caja/apertura" element={<DemoPage />} />
            <Route path="/caja/Cierre" element={<DemoPage />} />
            <Route path="/caja/movimiento" element={<DemoPage />} />

            {/* Rutas Reportes */}
            <Route path="/reportes/contribuyente" element={<DemoPage />} />
            <Route path="/reportes/predio" element={<DemoPage />} />
            <Route path="/reportes/recaudacion" element={<DemoPage />} />

            {/* Rutas coactiva */}
            <Route path="/coactiva/expediente" element={<DemoPage />} />
             <Route path="/coactiva/resoluciones" element={<DemoPage />} />
              <Route path="/coactiva/notificaciones" element={<DemoPage />} />
            
            {/* Rutas de mantenedores */}
            <Route path="/mantenedores/ubicacion/calles" element={<CallePage />} />
            <Route path="/mantenedores/ubicacion/sectores" element={<SectoresPage />} />
            <Route path="/mantenedores/ubicacion/barrios" element={<BarriosPage />} />
            <Route path="/mantenedores/ubicacion/direcciones" element={<DireccionesPage />} />
             <Route path="/mantenedores/arancel/asignacion" element={<ArancelesPage />} />
             <Route path="/mantenedores/arancel/valoresUnitarios" element={<ValoresUnitariosPage />} />
            <Route path="/mantenedores/tarifas/uit" element={<UitPage />} />
            <Route path="/mantenedores/tarifas/alcabala" element={<AlcabalaPage />} />
            <Route path="/mantenedores/tarifas/depreciacion" element={<DemoPage />} />
            <Route path="/mantenedores/tarifas/arbitrios" element={<DemoPage />} />
            <Route path="/mantenedores/roles" element={<DemoPage />} />
            
            {/* Rutas de sistema */}
            <Route path="/sistema/configuracion" element={<DemoPage />} />
            <Route path="/sistema/auditoria" element={<DemoPage />} />
            <Route path="/sistema/respaldo" element={<DemoPage />} />
            
            {/* Rutas de migración */}
            <Route path="/migracion/importar" element={<DemoPage />} />
            <Route path="/migracion/exportar" element={<DemoPage />} />
            <Route path="/migracion/historial" element={<DemoPage />} />
            
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AppRouter;