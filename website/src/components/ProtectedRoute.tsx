import React, { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();

  if (!isAuthenticated) {
    nav('/login');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
