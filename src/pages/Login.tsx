// src/pages/Login.tsx
import {FormEvent, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {resetAuthError, signIn} from '../store/auth/authSlice';
import {AppDispatch, RootState} from '../store/store';
import {fetchProfile, updateProfile} from "../store/profile/profileSlice.tsx";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const {loading, error, user} = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            if (!user.email_confirmed_at) {
                navigate('/email-verification');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        dispatch(resetAuthError());
    }, [dispatch]);

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const result = await dispatch(signIn({email, password}));

            if (signIn.fulfilled.match(result)) {
                const user = result.payload.user;

                // Recupera il profilo
                const profileResult = await dispatch(fetchProfile());

                // Se il profilo non esiste o è incompleto, aggiorniamolo
                if (!profileResult.payload?.firstName || !profileResult.payload?.lastName || !profileResult.payload?.phoneNumber) {
                    await dispatch(updateProfile({
                        firstName: user.user_metadata?.firstName || '',
                        lastName: user.user_metadata?.lastName || '',
                        phoneNumber: user.user_metadata?.phoneNumber || ''
                    }));
                }

                // Redirezione in base alla verifica email
                if (!user.email_confirmed_at) {
                    navigate('/email-verification');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error('Errore durante il login:', err);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 py-8 px-4">
            <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Accedi al tuo account</h1>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}
                           placeholder="Email"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required/>
                    <input type="password" name="password" value={password}
                           onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required/>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" checked={rememberMe}
                                   onChange={(e) => setRememberMe(e.target.checked)}
                                   className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                            <span className="ml-2 text-sm text-gray-700">Ricordami</span>
                        </label>
                        <Link to="/password-reset" className="text-sm text-primary hover:underline">Password
                            dimenticata?</Link>
                    </div>
                    <button type="submit" disabled={loading}
                            className="w-full bg-primary text-white font-medium rounded-lg py-2.5 px-5 text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-70">{loading ? 'Accesso in corso...' : 'Accedi'}</button>
                </form>
                <p className="text-sm text-gray-600 mt-4">Non hai un account? <Link to="/register"
                                                                                    className="text-primary hover:underline">Registrati</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;