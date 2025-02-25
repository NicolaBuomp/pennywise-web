// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const ProtectedRoute = () => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Caricamento...</div>;
    }

    if (!user) {
        // Redirect alla pagina di login, salvando dove l'utente stava cercando di andare
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se l'utente è autenticato, renderizza il contenuto protetto
    return <Outlet />;
};

export default ProtectedRoute;