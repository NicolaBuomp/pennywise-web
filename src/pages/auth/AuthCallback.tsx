// src/pages/auth/AuthCallback.tsx
import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {supabase} from '../../lib/supabase';
import {getSession} from '../../store/auth/authSlice';
import {ensureProfile} from '../../store/profile/profileSlice';

/**
 * Pagina di callback per l'autenticazione OAuth e la verifica email.
 * Gestisce il redirect dopo i flussi di autenticazione.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                setLoading(true);

                // Log completo dell'URL per debugging
                const fullUrl = window.location.href;
                console.log('Auth callback - Full URL:', fullUrl);

                // Salva l'URL completo nel localStorage per debug
                localStorage.setItem('last_auth_callback_url', fullUrl);

                // Ottieni tutti i parametri dalla URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const queryParams = new URLSearchParams(window.location.search);

                // Log di tutti i parametri
                console.log('Auth callback - Query params:',
                    Array.from(queryParams.entries()).reduce((obj, [key, val]) => {
                        obj[key] = val;
                        return obj;
                    }, {} as Record<string, string>)
                );

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

                    try {
                        // Con alcuni provider email, il token potrebbe essere nella query string o nell'hash
                        const {error} = await supabase.auth.refreshSession();

                        if (error) {
                            console.error('Email verification error:', error);

                            // Conserva il token per la verifica manuale
                            localStorage.setItem('verification_token', emailToken);
                            localStorage.setItem('verification_type', type || 'signup');

                            setError('Errore durante la verifica dell\'email. Prova con la verifica manuale.');

                            // Reindirizza alla verifica manuale dopo 3 secondi
                            setTimeout(() => {
                                navigate('/verify-email-manual');
                            }, 3000);
                            return;
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
                    } catch (verifyError) {
                        console.error('Error during email verification:', verifyError);
                        localStorage.setItem('verification_error', JSON.stringify(verifyError));
                        setError('Si è verificato un errore tecnico durante la verifica. Prova con la verifica manuale.');

                        // Reindirizza alla verifica manuale dopo 3 secondi
                        setTimeout(() => {
                            navigate('/verify-email-manual');
                        }, 3000);
                        return;
                    }
                }

                // Gestione OAuth callback
                if (accessToken || refreshToken) {
                    setMessage('Completando l\'autenticazione...');

                    // Gestisci il token PKCE (Authorization Code Flow con PKCE)
                    const {error} = await supabase.auth.refreshSession();

                    if (error) {
                        console.error('OAuth callback error:', error);
                        setError('Errore durante l\'autenticazione con il provider. Riprova.');
                    } else {
                        // Aggiorna la sessione nello store
                        await dispatch(getSession());

                        // Assicura che il profilo esista
                        dispatch(ensureProfile());

                        // Reindirizza alla dashboard
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