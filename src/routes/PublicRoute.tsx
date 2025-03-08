import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

interface PublicRouteProps {
  restricted?: boolean;
}

const PublicRoute = ({ restricted = false }: PublicRouteProps) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Se l'utente è autenticato e la rotta è ristretta (come il login),
  // reindirizzalo alla dashboard
  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }

  // Altrimenti renderizza il contenuto della rotta pubblica
  return <Outlet />;
};

export default PublicRoute;
