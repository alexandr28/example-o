import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuthContext } from '../../context/AuthContext';

/**
 * Página de inicio de sesión
 * 
 * Muestra un fondo de imagen con overlay y el formulario de login
 */
const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  
  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <div className="relative min-h-screen w-full">
      {/* Imagen de fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('fondo.jpeg')" }}
      ></div>
      
      {/* Overlay semitransparente */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      
      {/* Contenedor centrado para el formulario */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;