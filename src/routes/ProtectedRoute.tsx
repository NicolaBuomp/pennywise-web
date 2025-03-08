import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Reindirizza l'utente alla pagina di login se non è autenticato
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se l'utente è autenticato, renderizza il contenuto della rotta
  return <Outlet />;
};

export default ProtectedRoute;
