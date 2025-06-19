import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * Redirige a la página de login si el usuario no está autenticado
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();
  
  // Para depuración
  useEffect(() => {
    console.log('ProtectedRoute rendered', { 
      isAuthenticated, 
      loading, 
      pathname: location.pathname 
    });
  }, [isAuthenticated, loading, location.pathname]);
  
  // Mientras se verifica la autenticación, muestra un indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('No autenticado, redirigiendo a /login');
    // Almacenar la ubicación actual para redirigir después del login exitoso
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si está autenticado, mostrar el contenido protegido
  console.log('Autenticado, mostrando contenido protegido');
  
  // IMPORTANTE: Asegurarse de que children sea un elemento React válido
  // Envolver en un Fragment para evitar problemas con props booleanas
  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedRoute;