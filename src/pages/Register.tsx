// src/pages/Register.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, resetAuthError } from '../store/auth/authSlice';
import { RootState } from '../store/store';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Recupera lo stato di autenticazione dal redux store
    const { loading, error } = useSelector((state: RootState) => state.auth);

    // Resetta gli errori quando il componente viene montato
    useSelector(() => {
        dispatch(resetAuthError());
    }, [dispatch]);

    const validateForm = () => {
        setPasswordError('');

        if (password !== confirmPassword) {
            setPasswordError('Le password non corrispondono');
            return false;
        }

        if (password.length < 6) {
            setPasswordError('La password deve essere di almeno 6 caratteri');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const result = await dispatch(signUp({ email, password }));

        if (signUp.fulfilled.match(result)) {
            // Se la registrazione è avvenuta con successo, mostra un messaggio di conferma
            // o reindirizza alla pagina di conferma email
            navigate('/registration-success');
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-background-light dark:bg-background-dark">
            <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-surface-light dark:bg-surface-dark">
                <h1 className="text-2xl font-bold mb-6 text-center text-text-primary-light dark:text-text-primary-dark">Crea un account</h1>

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

                    <div className="mb-4">
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

                    <div className="mb-6">
                        <label
                            htmlFor="confirmPassword"
                            className="block mb-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
                        >
                            Conferma Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
                            required
                        />
                        {passwordError && (
                            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-medium rounded-lg py-2.5 px-5 text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-70"
                    >
                        {loading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Hai già un account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            Accedi
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;