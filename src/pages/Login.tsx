// src/pages/Login.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, signInWithGoogle, resetAuthError } from '../store/auth/authSlice';
import { RootState } from '../store/store';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Recupera lo stato di autenticazione dal redux store
    const { loading, error } = useSelector((state: RootState) => state.auth);

    // Determina dove reindirizzare dopo il login
    const from = location.state?.from?.pathname || '/dashboard';

    // Resetta gli errori quando il componente viene montato
    useSelector(() => {
        dispatch(resetAuthError());
    }, [dispatch]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            return;
        }

        const result = await dispatch(signIn({ email, password }));

        if (signIn.fulfilled.match(result)) {
            navigate(from, { replace: true });
        }
    };

    const handleGoogleLogin = async () => {
        await dispatch(signInWithGoogle());
        // Il redirect viene gestito da Supabase OAuth
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-background-light dark:bg-background-dark">
            <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-surface-light dark:bg-surface-dark">
                <h1 className="text-2xl font-bold mb-6 text-center text-text-primary-light dark:text-text-primary-dark">Accedi a Pennywise</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-medium rounded-lg py-2.5 px-5 text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-70"
                    >
                        {loading ? 'Accesso in corso...' : 'Accedi'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">oppure</span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mt-4 bg-white text-gray-700 font-medium rounded-lg py-2.5 px-5 text-center border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 disabled:opacity-70 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Accedi con Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Non hai un account?{' '}
                        <Link to="/register" className="text-primary hover:underline">
                            Registrati
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;