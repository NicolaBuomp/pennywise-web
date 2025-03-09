// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectLoading } from '../redux/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectLoading);
  
  // Mostra un indicatore di caricamento durante il controllo dello stato di autenticazione
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column',
        height: '100vh' 
      }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }
  
  // Reindirizza l'utente al login se non è autenticato
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se l'utente è autenticato, visualizza il contenuto protetto
  return <Outlet />;
};

export default ProtectedRoute;