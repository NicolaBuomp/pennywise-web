import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectLoading } from '../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

interface PublicRouteProps {
  restricted?: boolean;
}

const PublicRoute = ({ restricted = false }: PublicRouteProps) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectLoading);
  
  // Show a loading indicator while checking authentication status
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
  
  // If the route is restricted and the user is authenticated,
  // redirect to the dashboard
  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }

  // If the route is public, allow access
  return <Outlet />;
};

export default PublicRoute;