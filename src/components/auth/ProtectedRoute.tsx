import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireNonAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireNonAdmin = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if admin access is required but user is not admin
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  // Redirect to home if non-admin access is required but user is admin
  if (requireNonAdmin && user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}