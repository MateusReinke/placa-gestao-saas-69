
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const { login, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[Login] User is already authenticated, redirecting based on role:', user.role);
      
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
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError('Preencha todos os campos');
      return;
    }
    
    try {
      console.log('[Login] Attempting login with email:', email);
      await login(email, password);
      // The redirect happens in the auth provider
    } catch (error) {
      console.error('[Login] Login error:', error);
      setFormError('Erro ao fazer login');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">VehiclePlate</h1>
          <p className="mt-2 text-muted-foreground">
            Sistema de Gestão para Emplacadoras
          </p>
        </div>
        
        <Card className="border border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {formError && (
                <div className="text-destructive text-sm">{formError}</div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Contas de demonstração:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <code className="bg-secondary px-2 py-1 rounded text-xs">admin@example.com</code>
            <code className="bg-secondary px-2 py-1 rounded text-xs">seller@example.com</code>
            <code className="bg-secondary px-2 py-1 rounded text-xs">client@example.com</code>
            <code className="bg-secondary px-2 py-1 rounded text-xs">company@example.com</code>
          </div>
          <p className="mt-1">Senha para todas as contas: <code className="bg-secondary px-2 py-1 rounded text-xs">password</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
