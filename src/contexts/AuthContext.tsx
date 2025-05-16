
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock API functions - would be replaced with real API calls
const mockLogin = async (email: string, password: string): Promise<{user: User, token: string} | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock users for different roles
  const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin' as UserRole,
      phone: '(11) 99999-9999',
      document: '123.456.789-00',
      photo: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: '2',
      name: 'Seller User',
      email: 'seller@example.com',
      role: 'seller' as UserRole,
      phone: '(11) 88888-8888',
      document: '987.654.321-00',
      photo: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: '3',
      name: 'Physical Client',
      email: 'client@example.com',
      role: 'physical' as UserRole,
      phone: '(11) 77777-7777',
      document: '111.222.333-44',
    },
    {
      id: '4',
      name: 'Corporate Client',
      email: 'company@example.com',
      role: 'juridical' as UserRole,
      phone: '(11) 66666-6666',
      document: '11.222.333/0001-44',
    },
  ];
  
  const user = users.find(u => u.email === email);
  
  if (user && password === 'password') {
    // In a real app, the token would come from the backend
    return {
      user,
      token: 'mock-jwt-token.' + btoa(JSON.stringify(user)) + '.signature'
    };
  }
  
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for saved token on mount
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await mockLogin(email, password);
      
      if (result) {
        setUser(result.user);
        setToken(result.token);
        
        // Save auth data to localStorage
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
    toast.info('Logout realizado com sucesso');
  };
  
  const value = {
    user,
    token,
    isAuthenticated: !!user,
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
