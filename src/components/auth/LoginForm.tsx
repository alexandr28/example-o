import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

/**
 * Componente para el formulario de inicio de sesión
 */
const LoginForm: React.FC = () => {
  const { login, loading, error } = useAuthContext();
  const navigate = useNavigate();
  
  // Estados para los campos del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validación básica
    if (!username) {
      setFormError('El nombre de usuario es obligatorio');
      return;
    }
    
    if (!password) {
      setFormError('La contraseña es obligatoria');
      return;
    }
    
    try {
      const result = await login({ username, password });
      
      if (result.success) {
        // Redirigir al dashboard en caso de éxito
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
    }
  };
  
  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-white p-8 rounded-md shadow-md w-96">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src="/escudoMDE.png" alt="Escudo Municipal" className="h-16" />
      </div>
      
      {/* Título */}
      <h2 className="text-2xl text-center text-gray-700 font-medium mb-6">Sistema de Rentas</h2>
      
      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        {/* Nombre de usuario */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            NOMBRE DE USUARIO
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ingresa tu nombre de usuario"
          />
          <p className="text-xs text-gray-500 mt-1">Ejemplo: paredes</p>
        </div>
        
        {/* Contraseña */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            CONTRASEÑA
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ejemplo: 13579</p>
        </div>
        
        {/* Mensaje de error */}
        {(error || formError) && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {formError || error}
          </div>
        )}
        
        {/* Botón de inicio de sesión */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Iniciando sesión...</span>
            </div>
          ) : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;