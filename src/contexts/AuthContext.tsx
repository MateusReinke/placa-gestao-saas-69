import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "seller" | "physical" | "juridical";
  [key: string]: any;
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async () => false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Busca o perfil do usuário
  const fetchUserProfile = async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (profile && !error) {
      setUser(profile);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Restaura sessão ao carregar a aplicação
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    init();

    // Atualiza perfil em caso de login/logout em outras abas
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      setLoading(false);
      return false;
    }
    // Busca perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profile && !profileError) {
      setUser(profile);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
  };

  // Função de logout
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
