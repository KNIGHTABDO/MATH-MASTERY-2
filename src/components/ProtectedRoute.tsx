import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute check:', { user: !!user, loading, isAdmin, adminOnly });
    
    if (!loading) {
      setHasChecked(true);
      
      if (!user && !redirecting) {
        console.log('No user, redirecting to login');
        setRedirecting(true);
        navigate('/login', { replace: true });
        return;
      }

      if (user && adminOnly && !isAdmin && !redirecting) {
        console.log('User is not admin, redirecting to dashboard');
        setRedirecting(true);
        navigate('/', { replace: true });
        return;
      }
    }
  }, [user, loading, isAdmin, adminOnly, navigate, redirecting]);

  // Show loading while auth is being determined
  if (loading || !hasChecked || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {redirecting ? 'Redirection...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or doesn't have required permissions
  if (!user || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;