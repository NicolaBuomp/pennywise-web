// src/pages/Login.tsx
import {FormEvent, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {resetAuthError, signIn} from '../../store/auth/authSlice.ts';
import {AppDispatch, RootState} from '../../store/store.ts';
import {fetchProfile, updateProfile} from "../../store/profile/profileSlice.tsx";

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
                if (!profileResult.payload?.first_name || !profileResult.payload?.last_name || !profileResult.payload?.phone_number) {
                    await dispatch(updateProfile({
                        first_name: user.user_metadata?.firstName || '',
                        last_name: user.user_metadata?.lastName || '',
                        phone_number: user.user_metadata?.phoneNumber || ''
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
        <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
            <div className="p-8 bg-[var(--color-bg-soft)] shadow-lg rounded-lg glass w-96">
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">Login</h2>
                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <Input type="password" placeholder="Password" value={password}
                           onChange={(e) => setPassword(e.target.value)}/>
                    <Button type="submit" className="w-full">Accedi</Button>
                </form>
            </div>
        </div>
    );
};

export default Login;