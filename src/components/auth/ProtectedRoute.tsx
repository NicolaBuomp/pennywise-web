// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { getSession } from '../../store/auth/authSlice';

/**
 * Componente per proteggere le route che richiedono autenticazione.
 * Reindirizza al login se l'utente non è autenticato.
 * Reindirizza alla pagina di verifica email se l'utente non ha confermato l'email.
 */
const ProtectedRoute = () => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Se non abbiamo un utente, verifichiamo se c'è una sessione valida
            if (!user) {
                await dispatch(getSession());
            }
            setIsChecking(false);
        };

        checkAuth();
    }, [dispatch, user]);

    // Mostra lo spinner di caricamento mentre verifichiamo l'autenticazione
    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Caricamento...</p>
            </div>
        );
    }

    // Se non c'è un utente, reindirizza al login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verifica se l'utente ha confermato l'email
    // Controlla se il campo email_confirmed_at è null o undefined
    const isEmailConfirmed = user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;

    // Se l'utente non ha confermato l'email, reindirizza alla pagina di verifica
    if (!isEmailConfirmed && location.pathname !== '/email-verification') {
        return <Navigate to="/email-verification" replace />;
    }

    // Se l'utente è autenticato e ha confermato l'email, renderizza le route figlie
    return <Outlet />;
};

export default ProtectedRoute;