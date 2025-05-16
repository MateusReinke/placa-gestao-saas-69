
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // Debug logging
  console.log('[ProtectedRoute]', { 
    path: location.pathname,
    isAuthenticated, 
    userRole: user?.role,
    allowedRoles,
    loading
  });
  
  if (loading) {
    // Show loading state while we're checking authentication
    console.log('[ProtectedRoute] Still loading auth state...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/30 animate-pulse"></div>
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the current location
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect to dashboard
    console.log('[ProtectedRoute] User lacks permission, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[ProtectedRoute] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
