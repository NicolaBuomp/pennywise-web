import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import { useEffect } from 'react';
import { useAppDispatch } from '../hooks';
import { checkSession } from '../store/slices/authSlice';
import Dashboard from '../pages/protected/Dasboard';

const AppRoutes = () => {
  const dispatch = useAppDispatch();

  // Check for existing session on app load
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard or login based on auth status */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes that redirect to dashboard if authenticated */}
        <Route element={<PublicRoute restricted />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Protected routes that require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here as needed */}
        </Route>
        
        {/* 404 route - catch all non-matching routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Simple 404 component
const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center'
    }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Go Home
      </button>
    </div>
  );
};

export default AppRoutes;