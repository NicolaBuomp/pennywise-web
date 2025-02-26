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
    const [checkingInterval, setCheckingInterval] = useState<number | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Se l'email è verificata, reindirizza alla dashboard
    useEffect(() => {
        if (isEmailVerified) {
            navigate('/dashboard');
        }
    }, [isEmailVerified, navigate]);

    // Stato per tracciare la verifica manuale
    const [isChecking, setIsChecking] = useState(false);

    // Funzione per verificare manualmente lo stato di verifica
    const handleCheckVerification = () => {
        setIsChecking(true);
        refreshStatus();

        // Nascondi l'indicatore dopo 2 secondi
        setTimeout(() => {
            setIsChecking(false);
        }, 2000);
    };

    // Imposta un controllo periodico dello stato di verifica
    useEffect(() => {
        // Verifica ogni 30 secondi se l'email è stata verificata
        const interval = window.setInterval(() => {
            console.log('Checking email verification status...');
            refreshStatus();
        }, 30000); // 30 secondi

        setCheckingInterval(interval);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [refreshStatus]);

    // Gestisce il countdown del cooldown
    useEffect(() => {
        let interval: number | undefined;

        if (cooldownActive && cooldownTime > 0) {
            interval = window.setInterval(() => {
                setCooldownTime((prevTime) => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        setCooldownActive(false);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [cooldownActive, cooldownTime]);

    const handleResendEmail = async () => {
        if (!user?.email || cooldownActive) return;

        try {
            setIsResending(true);
            setError(null);

            const {error} = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) {
                throw error;
            }

            setResendSuccess(true);

            // Attiva il cooldown per 60 secondi
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verifica il tuo indirizzo email
                    </h2>
                    <div className="mt-4 flex justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-4">
                        Ti abbiamo inviato un'email di verifica all'indirizzo:
                    </p>
                    <p className="text-xl font-semibold text-primary mb-6">
                        {user?.email}
                    </p>
                    <p className="text-gray-600 mb-8">
                        Per accedere all'applicazione, devi prima verificare il tuo indirizzo email cliccando sul link
                        nell'email che ti abbiamo inviato.
                    </p>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                             role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}


                    {resendSuccess && (
                        <div
                            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                            role="alert">
                              <span className="block sm:inline">
                                Email di verifica inviata con successo! Controlla la tua casella di posta.
                              </span>
                        </div>
                    )}

                    {cooldownActive && (
                        <div className="mb-4">
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                                    <div
                                        style={{width: `${(cooldownTime / 60) * 100}%`}}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Puoi richiedere un nuovo invio tra {cooldownTime} secondi
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mb-4 text-center">
                        <button
                            onClick={handleCheckVerification}
                            disabled={isChecking}
                            className="text-primary hover:underline text-sm flex items-center justify-center mx-auto"
                        >
                            {isChecking ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    </div>
                </div>
            </div>


            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={handleResendEmail}
                    disabled={isResending || cooldownActive}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                    {isResending ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Invio in corso...
                        </>
                    ) : cooldownActive ? (
                        <>
                            <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Riprova tra {cooldownTime} secondi
                        </>
                    ) : (
                        'Invia nuovamente l\'email'
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Torna al login
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Il link nell'email non funziona?{' '}
                    <Link to="/verify-email-manual" className="text-primary hover:underline">
                        Prova la verifica manuale
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default EmailVerification;