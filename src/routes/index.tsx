// src/routes/index.tsx
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

  // Controlla la sessione esistente al caricamento dell'app
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Reindirizza la root alla dashboard o al login in base allo stato di autenticazione */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotte pubbliche che reindirizzano alla dashboard se autenticati */}
        <Route element={<PublicRoute restricted />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Rotte protette che richiedono autenticazione */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Aggiungi altre rotte protette qui se necessario */}
        </Route>
        
        {/* Rotta 404 - cattura tutte le rotte non corrispondenti */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Componente 404 semplice
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