import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../../redux/store';
import LoadingScreen from '../common/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEmailVerification = true 
}) => {
  const location = useLocation();
  const { isAuthenticated, isInitialLoading, isEmailVerified, user } = useSelector(
    (state: RootState) => state.auth
  );

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && !isEmailVerified) {
    // Redirect to waiting-verification if email is not verified
    return <Navigate to="/auth/waiting-verification" state={{ email: user?.email }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;