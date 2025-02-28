// src/pages/auth/EmailVerification.tsx
import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../store/store';
import {signOut} from '../../store/auth/authSlice';
import {supabase} from '../../lib/supabase';
import useAuthStatus from '../../hooks/useAuthStatus';

const EmailVerification = () => {
    const {user, isEmailVerified, refreshStatus} = useAuthStatus();
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldownTime, setCooldownTime] = useState(0);
    const [cooldownActive, setCooldownActive] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (isEmailVerified) {
            navigate('/dashboard');
        }
    }, [isEmailVerified, navigate]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            refreshStatus();
        }, 30000);
        return () => clearInterval(interval);
    }, [refreshStatus]);

    useEffect(() => {
        if (!cooldownActive || cooldownTime <= 0) return;
        const interval = window.setInterval(() => {
            setCooldownTime((prevTime) => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    setCooldownActive(false);
                    return 0;
                }
                return newTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldownActive, cooldownTime]);

    const handleResendEmail = async () => {
        if (!user?.email || cooldownActive) return;
        try {
            setIsResending(true);
            setError(null);
            const {error} = await supabase.auth.resend({type: 'signup', email: user.email});
            if (error) throw error;
            setResendSuccess(true);
            setCooldownTime(60);
            setCooldownActive(true);
        } catch (err: any) {
            setError(err.message || 'Si è verificato un errore durante l’invio dell’email');
        } finally {
            setIsResending(false);
        }
    };

    const handleLogout = async () => {
        await dispatch(signOut());
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Verifica il tuo indirizzo email</h2>
                <p className="text-gray-600 mb-4 text-center">Ti abbiamo inviato un'email di verifica all'indirizzo:</p>
                <p className="text-lg font-medium text-primary mb-6 text-center">{user?.email}</p>
                <p className="text-gray-600 mb-6 text-center">Per accedere all'applicazione, verifica il tuo indirizzo
                    email.</p>
                {error && <div className="mb-4 p-3 bg-red-100 text-sm text-red-700 rounded-md">{error}</div>}
                {resendSuccess &&
                    <div className="mb-4 p-3 bg-green-100 text-sm text-green-700 rounded-md">Email di verifica
                        inviata!</div>}
                <button onClick={handleResendEmail} disabled={isResending || cooldownActive}
                        className="w-full bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary-dark disabled:opacity-50">
                    {isResending ? "Invio in corso..." : cooldownActive ? `Riprova tra ${cooldownTime}s` : "Invia nuovamente l'email"}
                </button>
                <button onClick={handleLogout}
                        className="w-full mt-4 border border-gray-300 rounded-lg py-2 px-4 text-gray-700 bg-white hover:bg-gray-50">
                    Torna al login
                </button>
                <p className="text-sm text-gray-500 mt-4 text-center">
                    Problemi con il link nell'email? <Link to="/verify-email-manual"
                                                           className="text-primary hover:underline">Prova la verifica
                    manuale</Link>
                </p>
            </div>
        </div>
    );
};

export default EmailVerification;