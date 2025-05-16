
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-primary/30 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
