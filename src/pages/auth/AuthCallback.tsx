// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '../../lib/supabase';
import { getSession } from '../../store/auth/authSlice';
import { AppDispatch } from '../../store/store';

/**
 * Pagina di callback per l'autenticazione OAuth e la verifica email.
 * Gestisce il redirect dopo i flussi di autenticazione.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                setLoading(true);
                console.log('Auth callback - Processing URL:', window.location.href);

                // Ottieni tutti i parametri dalla URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const queryParams = new URLSearchParams(window.location.search);

                // Verifica se è presente un token di accesso (OAuth)
                const accessToken = hashParams.get('access_token');
                const refreshToken = queryParams.get('refresh_token');
                const type = hashParams.get('type') || queryParams.get('type');

                // Verifica se ci sono parametri specifici per la conferma email
                const emailToken = queryParams.get('token_hash') || queryParams.get('token');

                console.log('Auth params:', {
                    accessToken: accessToken ? 'present' : 'absent',
                    refreshToken: refreshToken ? 'present' : 'absent',
                    type,
                    emailToken: emailToken ? 'present' : 'absent'
                });

                // Gestione della verifica email
                if (emailToken) {
                    setMessage('Verificando la tua email...');

                    // Con alcuni provider email, il token potrebbe essere nella query string o nell'hash
                    // Impostiamo il recupero automatico nella URL
                    const { error } = await supabase.auth.refreshSession();

                    if (error) {
                        console.error('Email verification error:', error);
                        setError('Errore durante la verifica dell\'email. Il link potrebbe essere scaduto.');
                    } else {
                        // Ottieni la sessione aggiornata
                        await dispatch(getSession());
                        setMessage('Email verificata con successo! Redirecting...');

                        // Reindirizza alla pagina di conferma
                        setTimeout(() => {
                            navigate('/email-confirmed');
                        }, 2000);
                        return;
                    }
                }

                // Gestione OAuth callback
                if (accessToken || refreshToken) {
                    setMessage('Completando l\'autenticazione...');

                    // Gestisci il token PKCE (Authorization Code Flow con PKCE)
                    const { error } = await supabase.auth.refreshSession();

                    if (error) {
                        console.error('OAuth callback error:', error);
                        setError('Errore durante l\'autenticazione con il provider. Riprova.');
                    } else {
                        // Aggiorna la sessione nello store
                        await dispatch(getSession());
                        navigate('/dashboard');
                        return;
                    }
                }

                // Se nessuna delle condizioni sopra è soddisfatta
                if (!emailToken && !accessToken && !refreshToken) {
                    console.warn('No authentication tokens found in URL');
                    navigate('/login');
                    return;
                }
            } catch (err: any) {
                console.error('Authentication callback error:', err);
                setError('Si è verificato un errore durante l\'autenticazione. Riprova più tardi.');
            } finally {
                setLoading(false);
            }
        };

        handleAuthCallback();
    }, [navigate, dispatch, location]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">
                    {message || 'Elaborazione in corso...'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Errore di autenticazione</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary-dark"
                    >
                        Torna al login
                    </button>
                </div>
            </div>
        );
    }

    if (message) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Processo completato</h2>
                    <p className="text-gray-700 mb-6">{message}</p>
                    <div className="animate-pulse">
                        <p className="text-center text-gray-500">Reindirizzamento in corso...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback - non dovrebbe mai essere visualizzato
    return null;
};

export default AuthCallback;