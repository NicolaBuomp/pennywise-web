import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const EmailConfirmed = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // Reindirizza alla dashboard dopo 5 secondi
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-green-100 p-3">
                        <svg
                            className="h-10 w-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verificata!</h1>

                <p className="text-gray-600 mb-6">
                    Complimenti! Il tuo indirizzo email {user?.email} è stato verificato con successo.
                </p>

                <p className="text-sm text-gray-500 mb-6">
                    Verrai reindirizzato automaticamente alla dashboard tra pochi secondi.
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div className="bg-primary h-2.5 rounded-full animate-[progress_5s_linear]"></div>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Vai alla Dashboard
                </button>
            </div>
        </div>
    );
};

export default EmailConfirmed;