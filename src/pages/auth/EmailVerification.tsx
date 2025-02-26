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
    const [isChecking, setIsChecking] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Se l'email è verificata, reindirizza alla dashboard
    useEffect(() => {
        if (isEmailVerified) {
            navigate('/dashboard');
        }
    }, [isEmailVerified, navigate]);

    // Imposta un controllo periodico dello stato di verifica
    useEffect(() => {
        const interval = window.setInterval(() => {
            refreshStatus();
        }, 30000); // 30 secondi

        return () => clearInterval(interval);
    }, [refreshStatus]);

    // Gestisce il countdown del cooldown
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

    const handleCheckVerification = () => {
        setIsChecking(true);
        refreshStatus();
        setTimeout(() => setIsChecking(false), 2000);
    };

    const handleResendEmail = async () => {
        if (!user?.email || cooldownActive) return;

        try {
            setIsResending(true);
            setError(null);

            const {error} = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) throw error;

            setResendSuccess(true);
            setCooldownTime(60);
            setCooldownActive(true);
        } catch (err: any) {
            setError(err.message || 'Si è verificato un errore durante l\'invio dell\'email');
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
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-primary/10 p-3">
                            <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifica il tuo indirizzo email</h2>

                    <p className="text-gray-600 mb-2">
                        Ti abbiamo inviato un'email di verifica all'indirizzo:
                    </p>
                    <p className="text-lg font-medium text-primary mb-6">
                        {user?.email}
                    </p>

                    <p className="text-gray-600 mb-6">
                        Per accedere all'applicazione, devi prima verificare il tuo indirizzo email
                        cliccando sul link nell'email che ti abbiamo inviato.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-sm text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {resendSuccess && (
                        <div className="mb-4 p-3 bg-green-100 text-sm text-green-700 rounded-md">
                            Email di verifica inviata con successo! Controlla la tua casella di posta.
                        </div>
                    )}

                    {cooldownActive && (
                        <div className="mb-6">
                            <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    style={{width: `${(cooldownTime / 60) * 100}%`}}
                                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Puoi richiedere un nuovo invio tra {cooldownTime} secondi
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleCheckVerification}
                        disabled={isChecking}
                        className="w-full flex items-center justify-center py-2 px-4 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                    >
                        {isChecking ? (
                            <>
                                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verificando...
                            </>
                        ) : (
                            "Ho già confermato l'email. Verifica ora →"
                        )}
                    </button>

                    <div className="flex flex-col space-y-3 mb-6">
                        <button
                            onClick={handleResendEmail}
                            disabled={isResending || cooldownActive}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {isResending ? "Invio in corso..." : cooldownActive ? `Riprova tra ${cooldownTime}s` : "Invia nuovamente l'email"}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                        >
                            Torna al login
                        </button>
                    </div>

                    <p className="text-sm text-gray-500">
                        Problemi con il link nell'email?{' '}
                        <Link to="/verify-email-manual" className="text-primary hover:underline">
                            Prova la verifica manuale
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;