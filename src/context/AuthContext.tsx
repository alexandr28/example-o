import React, { createContext, useContext, ReactNode } from 'react';
import { AuthUser, AuthCredentials, AuthResult } from '../models/Auth';
import useAuth from '../hooks/useAuth';

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<AuthResult>;
  logout: () => void;
  renewToken: () => Promise<boolean>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

// Definir explícitamente el tipo de las props
interface AuthProviderProps {
  children: ReactNode;
}

// Componente proveedor de autenticación
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();
  
  // Para depuración
  React.useEffect(() => {
    console.log('AuthProvider state:', { 
      isAuthenticated: auth.isAuthenticated, 
      user: auth.user?.username || 'none',
      loading: auth.loading 
    });
  }, [auth.isAuthenticated, auth.user, auth.loading]);

  // Crear un objeto que cumpla exactamente con el tipo AuthContextType
  const authContextValue: AuthContextType = {
    user: auth.user || null, // Convertir undefined a null
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    renewToken: auth.renewToken
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;