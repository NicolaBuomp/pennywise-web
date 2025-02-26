// src/pages/auth/EmailDebug.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const EmailDebug = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const handleSendVerificationEmail = async () => {
        if (!email) return;

        try {
            setStatus('loading');
            setMessage('Inviando email di verifica...');

            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) {
                throw error;
            }

            setDebugInfo(data);
            setStatus('success');
            setMessage(`Email di verifica inviata a ${email}. Controlla la tua casella di posta e i log della console.`);
            console.log('OTP Auth Response:', data);

        } catch (error: any) {
            console.error('Error sending verification email:', error);
            setStatus('error');
            setMessage(error.message || 'Errore durante l\'invio dell\'email');
            setDebugInfo(error);
        }
    };

    const testCallbackUrl = async () => {
        try {
            setStatus('loading');
            setMessage('Testando URL di callback...');

            // URL di prova
            const testUrl = `${window.location.origin}/auth/callback`;

            // Controlla se l'URL è raggiungibile
            const response = await fetch(testUrl, { method: 'HEAD' });

            setDebugInfo({
                url: testUrl,
                status: response.status,
                ok: response.ok
            });

            setStatus('success');
            setMessage(`L'URL di callback ${testUrl} è raggiungibile. Status: ${response.status}`);

        } catch (error: any) {
            console.error('Error testing callback URL:', error);
            setStatus('error');
            setMessage('Errore durante il test dell\'URL di callback');
            setDebugInfo(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug Verifica Email</h1>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Inserisci la tua email"
                    />
                </div>

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={handleSendVerificationEmail}
                        disabled={status === 'loading' || !email}
                        className="flex-1 bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        Invia Email di Verifica
                    </button>

                    <button
                        onClick={testCallbackUrl}
                        disabled={status === 'loading'}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                        Test URL Callback
                    </button>
                </div>

                {status !== 'idle' && (
                    <div className={`p-4 rounded-md mb-4 ${
                        status === 'loading' ? 'bg-blue-50 text-blue-700' :
                            status === 'success' ? 'bg-green-50 text-green-700' :
                                'bg-red-50 text-red-700'
                    }`}>
                        <p>{message}</p>
                    </div>
                )}

                {debugInfo && (
                    <div className="mt-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Informazioni di Debug</h2>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
                    </div>
                )}

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Consigli per la risoluzione dei problemi</h2>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                        <li>Assicurati che l'URL di reindirizzamento nella Console Supabase includa <code>/auth/callback</code></li>
                        <li>Verifica che l'applicazione sia accessibile all'URL configurato</li>
                        <li>Controlla che non ci siano blocchi CORS</li>
                        <li>Verifica che l'URL di reindirizzamento sia stato aggiunto ai "Site URL" nelle impostazioni di Supabase</li>
                        <li>Controlla la console del browser per eventuali errori durante il processo di conferma</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EmailDebug;