// src/main.tsx - Versión actualizada con Material-UI
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importar las fuentes de Material-UI
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// En main.tsx
import './styles/sidebar-mui.css';

// Estilos globales compactos - IMPORTANTE: Cargar después del tema
import './styles/global.css';

// Estilos globales
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);