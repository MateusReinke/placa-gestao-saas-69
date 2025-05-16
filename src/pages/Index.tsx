
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;
    
    // Redirect based on authentication status
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
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
          navigate('/client/dashboard', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, isAuthenticated, user, loading]);
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-primary">VehiclePlate</h1>
        <p className="text-xl text-muted-foreground">Sistema de Gestão para Emplacadoras</p>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="w-12 h-12 rounded-full bg-primary/30 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Bem-vindo ao sistema de gestão para emplacadoras. Faça login para acessar o sistema.
            </p>
            <Button onClick={handleGoToLogin} className="w-full">
              Ir para o Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
