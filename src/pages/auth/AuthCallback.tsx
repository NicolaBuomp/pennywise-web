// src/pages/auth/AuthCallback.tsx
import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {getSession} from '../../store/auth/authSlice';
import {fetchProfile, updateProfile} from '../../store/profile/profileSlice';
import {AppDispatch} from '../../store/store';

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
                const result = await dispatch(getSession());

                if (result.payload?.session?.user) {
                    const user = result.payload.session.user;

                    await dispatch(updateProfile({
                        first_name: user.user_metadata?.first_name || '',
                        last_name: user.user_metadata?.last_name || '',
                        phone_number: user.user_metadata?.phone_number || ''
                    }));

                    await dispatch(fetchProfile()); // Recupera il profilo aggiornato
                }

                if (!result.payload?.session?.user?.email_confirmed_at) {
                    navigate('/email-verification');
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
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
                <p className="mt-4 text-gray-600">{message || 'Elaborazione in corso...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Errore di autenticazione</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button onClick={() => navigate('/login')}
                            className="w-full bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary-dark">
                        Torna al login
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default AuthCallback;