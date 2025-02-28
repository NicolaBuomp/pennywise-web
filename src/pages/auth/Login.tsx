import {FormEvent, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {resetAuthError, signIn} from "../../store/auth/authSlice";
import {AppDispatch, RootState} from "../../store/store";
import {fetchProfile, updateProfile} from "../../store/profile/profileSlice";
import {Button, Card, Input} from "../../components/common";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {loading, error, user} = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            if (!user.email_confirmed_at) {
                navigate("/email-verification");
            } else {
                navigate("/dashboard");
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
                const profileResult = await dispatch(fetchProfile());

                if (
                    !profileResult.payload?.first_name ||
                    !profileResult.payload?.last_name ||
                    !profileResult.payload?.phone_number
                ) {
                    await dispatch(updateProfile({
                        first_name: user.user_metadata?.firstName || '',
                        last_name: user.user_metadata?.lastName || '',
                        phone_number: user.user_metadata?.phoneNumber || ''
                    }));
                }

                if (!user.email_confirmed_at) {
                    navigate("/email-verification");
                } else {
                    navigate("/dashboard");
                }
            }
        } catch (err) {
            console.error("Errore durante il login:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
            <Card title="Accedi a Pennywise">
                {error && <p className="text-red-500">{error}</p>}
                <form className="mt-4 space-y-4" onSubmit={handleEmailLogin}>
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <Input type="password" placeholder="Password" value={password}
                           onChange={(e) => setPassword(e.target.value)}/>
                    <Button type="submit" className="w-full">{loading ? "Accesso in corso..." : "Accedi"}</Button>
                </form>
                <p className="mt-4 text-center text-sm text-[var(--color-text-soft)]">
                    Non hai un account? <Link to="/register"
                                              className="text-[var(--color-primary)] hover:underline">Registrati</Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
