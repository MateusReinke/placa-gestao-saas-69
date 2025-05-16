
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userDetails, setUserDetails] = useState<{
    role: UserRole;
    name: string;
    email: string;
    document?: string;
    phone?: string;
    photo?: string;
  } | null>(null);
  const navigate = useNavigate();

  // Função para obter os detalhes do usuário a partir da tabela users
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Erro ao buscar detalhes do usuário:', error);
        return null;
      }

      if (data) {
        return {
          role: data.role as UserRole,
          name: data.name,
          email: data.email,
          document: data.document,
          phone: data.phone,
          photo: data.photo_url
        };
      }
      
      return null;
    } catch (error) {
      console.error('[Auth] Erro ao buscar detalhes do usuário:', error);
      return null;
    }
  };

  // Inicializa a autenticação e configura o listener
  useEffect(() => {
    // Define um handler para mudanças no estado de autenticação
    const handleAuthStateChange = (event: string, newSession: Session | null) => {
      console.log('[Auth] Estado de autenticação alterado:', event, newSession?.user?.id);
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      // Se tiver um novo usuário autenticado, busca os detalhes
      if (newSession?.user) {
        // Usar setTimeout para evitar operações de Supabase dentro do callback
        setTimeout(async () => {
          const details = await fetchUserDetails(newSession.user.id);
          setUserDetails(details);
          setLoading(false);
        }, 0);
      } else {
        setUserDetails(null);
        setLoading(false);
      }
    };

    // Verifica se já existe uma sessão
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          console.log('[Auth] Sessão existente encontrada:', currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
          
          const details = await fetchUserDetails(currentSession.user.id);
          setUserDetails(details);
        }
      } catch (error) {
        console.error('[Auth] Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    // Configura o listener de eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Verifica a sessão atual
    initializeAuth();

    // Limpa o listener ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função para realizar login
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('[Auth] Erro de login:', error);
        toast.error(error.message || 'Erro ao fazer login');
        return false;
      }

      if (data.user) {
        console.log('[Auth] Login bem-sucedido:', data.user.id);
        toast.success('Login realizado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Auth] Erro ao fazer login:', error);
      toast.error('Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para realizar logout
  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Auth] Erro ao fazer logout:', error);
        toast.error('Erro ao fazer logout');
        return;
      }
      
      console.log('[Auth] Logout realizado');
      toast.info('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('[Auth] Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // Função para redirecionar o usuário com base no seu papel
  const redirectBasedOnRole = (userRole: UserRole) => {
    console.log('[Auth] Redirecionando com base no papel:', userRole);
    
    switch (userRole) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'seller':
        navigate('/seller/dashboard', { replace: true });
        break;
      case 'physical':
      case 'juridical':
        navigate('/client/dashboard', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  };

  return {
    user,
    userDetails,
    isAuthenticated: !!user && !!userDetails,
    loading,
    login,
    logout,
    redirectBasedOnRole,
  };
};
