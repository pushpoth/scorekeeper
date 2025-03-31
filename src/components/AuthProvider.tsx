import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Component that handles authentication checking and redirects
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (loading) return;
    
    if (requireAuth && !user) {
      // Save current location to redirect back after login
      const returnPath = location.pathname + location.search;
      navigate(`/auth?returnPath=${encodeURIComponent(returnPath)}`);
    } else if (!requireAuth && user) {
      // If we're on an auth page but already logged in
      navigate('/games');
    }
  }, [user, loading, requireAuth, navigate, location]);
  
  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-phase10-blue mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If we require auth and don't have user, show nothing (will redirect)
  if (requireAuth && !user) {
    return null;
  }
  
  // Otherwise render children
  return <>{children}</>;
};

export default AuthProvider;
