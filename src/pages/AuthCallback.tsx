// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSession } from '../store/auth/authSlice';

const AuthCallback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            // Aggiorna la sessione dopo il callback OAuth
            const result = await dispatch(getSession());

            if (getSession.fulfilled.match(result)) {
                // Se c'è una sessione valida, reindirizza alla dashboard
                if (result.payload.session) {
                    navigate('/dashboard');
                } else {
                    // Se non c'è sessione, reindirizza al login
                    navigate('/login');
                }
            } else {
                // Se c'è stato un errore, reindirizza al login
                navigate('/login');
            }
        };

        handleCallback();
    }, [dispatch, navigate]);

    return (
        <div className="min-h-screen flex justify-center items-center bg-background-light dark:bg-background-dark">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-primary-light dark:text-text-primary-dark">Autenticazione in corso...</p>
            </div>
        </div>
    );
};

export default AuthCallback;