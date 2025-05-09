import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NuevoContribuyente from '../pages/NuevoContribuyente';
import NuevoContribuyenteConLayout from '../pages/NuevoContribuyente';
import DemoPage from '../pages/DemoPage';
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
            <Route path="/contribuyente/nuevo" element={<NuevoContribuyenteConLayout />} />
            <Route path="/contribuyente/nuevo-simple" element={<NuevoContribuyente />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas de ejemplo para los diferentes elementos del menú */}
            <Route path="/contribuyente/buscar" element={<DemoPage />} />
            <Route path="/contribuyente/listado" element={<DemoPage />} />
            
            <Route path="/predio/nuevo" element={<DemoPage />} />
            <Route path="/predio/buscar" element={<DemoPage />} />
            <Route path="/predio/listado" element={<DemoPage />} />
            
            <Route path="/cuenta-corriente/*" element={<DemoPage />} />
            <Route path="/reportes/*" element={<DemoPage />} />
            <Route path="/caja/*" element={<DemoPage />} />
            <Route path="/coactiva/*" element={<DemoPage />} />
            <Route path="/mantenedores/*" element={<DemoPage />} />
            <Route path="/sistema/*" element={<DemoPage />} />
            <Route path="/migracion/*" element={<DemoPage />} />
          </Routes>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default AppRouter;