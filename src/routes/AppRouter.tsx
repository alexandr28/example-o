import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import NuevoContribuyenteConLayout from '../pages/NuevoContribuyente';
import {DemoPage,CallePage,NuevoContribuyente} from  '../pages'
import { SidebarProvider } from '../context/SidebarContext';
import { ThemeProvider } from '../context/ThemeContext';

const AppRouter: React.FC = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/dashboard" element={<DemoPage />} />
            {/* Dos versiones de la misma página, una con el layout integrado y otra sin él */}
            
            <Route path="/contribuyente/nuevo" element={<NuevoContribuyente />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas de ejemplo para los diferentes elementos del menú */}
            <Route path="/contribuyente/buscar" element={<DemoPage />} />
            <Route path="/contribuyente/listado" element={<DemoPage />} />
            
            <Route path="/predio/nuevo" element={<DemoPage />} />
            <Route path="/predio/buscar" element={<DemoPage />} />
            <Route path="/predio/listado" element={<DemoPage />} />
            
            {/* Rutas de mantenedores */}
            <Route path="/mantenedores/ubicacion/calles" element={<CallePage />} />
            <Route path="/mantenedores/ubicacion/sectores" element={<DemoPage />} />
            <Route path="/mantenedores/ubicacion/barrios" element={<DemoPage />} />
            <Route path="/mantenedores/ubicacion/direcciones" element={<DemoPage />} />
            <Route path="/mantenedores/arancel/asignacion" element={<DemoPage />} />
            <Route path="/mantenedores/arancel/valoresUnitarios" element={<DemoPage />} />
            <Route path="/mantenedores/usuarios" element={<DemoPage />} />
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