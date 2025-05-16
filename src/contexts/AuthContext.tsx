
import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { 
    user, 
    userDetails, 
    isAuthenticated, 
    loading, 
    login, 
    logout, 
    redirectBasedOnRole 
  } = useSupabaseAuth();
  
  // Debug helper function
  const logAuthState = (message: string, data?: any) => {
    console.log(`[Auth] ${message}`, data || '');
  };
  
  // Verifica se tem dados do usuário para construir o objeto User
  const currentUser: User | null = userDetails 
    ? {
        id: user?.id || '',
        name: userDetails.name,
        email: userDetails.email,
        role: userDetails.role,
        phone: userDetails.phone,
        document: userDetails.document,
        photo: userDetails.photo
      }
    : null;
  
  // Quando o usuário está autenticado e estamos na página de login, redireciona para o dashboard
  if (isAuthenticated && userDetails && location.pathname === '/login') {
    logAuthState('Usuário autenticado na página de login, redirecionando:', userDetails.role);
    redirectBasedOnRole(userDetails.role);
  }
  
  const value = {
    user: currentUser,
    isAuthenticated,
    login,
    logout,
    loading
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
