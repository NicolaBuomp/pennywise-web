// src/routes/PublicRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectLoading } from '../redux/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

interface PublicRouteProps {
  restricted?: boolean;
}

const PublicRoute = ({ restricted = false }: PublicRouteProps) => {
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
  
  // Se la rotta è limitata e l'utente è autenticato,
  // reindirizza alla dashboard
  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se la rotta è pubblica, consenti l'accesso
  return <Outlet />;
};

export default PublicRoute;