// src/pages/auth/VerifyEmailManual.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { getSession } from '../../store/auth/authSlice';
import { supabase } from '../../lib/supabase';

/**
 * Questa pagina permette di verificare manualmente un'email
 * inserendo il token ricevuto via email.
 * Utile quando il link di verifica automatico non funziona correttamente.
 */
const VerifyEmailManual = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Carica eventuali token salvati nel localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('verification_token');
        if (savedToken) {
            setToken(savedToken);
            console.log('Found saved verification token');
        }

        // Carica anche gli eventuali errori salvati per il debug
        const savedError = localStorage.getItem('verification_error');
        if (savedError) {
            try {
                const errorObj = JSON.parse(savedError);
                console.log('Previous verification error:', errorObj);
            } catch (e) {
                console.log('Saved error:', savedError);
            }
        }
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !token) {
            setError('Inserisci sia l\'email che il token di verifica');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Ottieni il token di verifica dalla URL
            console.log('Attempting to verify email with token:', token);

            // Esegui la verifica
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email'
            });

            if (error) {
                console.error('Error verifying email:', error);
                throw error;
            }

            // Aggiorna la sessione
            await dispatch(getSession());
            setSuccess(true);

            // Reindirizza dopo un breve ritardo
            setTimeout(() => {
                navigate('/email-confirmed');
            }, 3000);

        } catch (err: any) {
            console.error('Error during manual verification:', err);
            setError(err.message || 'Si è verificato un errore durante la verifica');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verifica Manuale Email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Se il link di verifica non funziona, puoi inserire manualmente il token che hai ricevuto via email.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Email verificata con successo! Verrai reindirizzato automaticamente.</span>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Indirizzo Email</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Indirizzo email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="token" className="sr-only">Token di Verifica</label>
                                <input
                                    id="token"
                                    name="token"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Token di verifica"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifica in corso...
                                    </>
                                ) : 'Verifica Email'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-sm text-gray-500">
                    <p className="font-medium">Come trovare il token:</p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                        <li>Apri l'email di verifica che ti è stata inviata</li>
                        <li>Cerca un link che contiene una serie di caratteri dopo "token="</li>
                        <li>Copia tutti i caratteri che seguono "token=" e incollali nel campo sopra</li>
                    </ol>
                </div>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-primary hover:text-primary-dark"
                    >
                        Torna al login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailManual;