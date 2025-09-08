import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireNonAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  requireNonAdmin = false 
}) => {
  const { user, isAdmin } = useAuth();

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && (!user || !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  // If non-admin access is required but user is admin
  if (requireNonAdmin && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;