// src/App.tsx
import {useEffect} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {Provider, useDispatch} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './store/store';
import {getSession} from './store/auth/authSlice';
import {ensureProfile} from './store/profile/profileSlice';

// Pagine di autenticazione
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/auth/AuthCallback';
import EmailVerification from './pages/auth/EmailVerification';
import EmailConfirmed from './pages/auth/EmailConfirmed';
import VerifyEmailManual from './pages/auth/VerifyEmailManual';
import EmailDebug from './pages/auth/EmailDebug';

// Pagine protette
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Componente per inizializzare l'autenticazione
const AuthInitializer = ({children}: { children: React.ReactNode }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const initAuth = async () => {
            await dispatch(getSession());

            // Assicuriamoci che il profilo esista se l'utente è autenticato
            dispatch(ensureProfile());
        };

        initAuth();
    }, [dispatch]);

    return <>{children}</>;
};

// Componente principale dell'app
const AppContent = () => {
    return (
        <BrowserRouter>
            <AuthInitializer>
                <Routes>
                    {/* Route publiche */}
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/auth/callback" element={<AuthCallback/>}/>
                    <Route path="/email-debug" element={<EmailDebug/>}/>
                    <Route path="/email-confirmed" element={<EmailConfirmed/>}/>
                    <Route path="/verify-email-manual" element={<VerifyEmailManual/>}/>

                    {/* Route semi-protette (richiedono autenticazione ma non email verificata) */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/email-verification" element={<EmailVerification/>}/>

                        {/* Route con layout principale */}
                        <Route element={<MainLayout/>}>
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            {/* Altre route protette con layout principale */}
                        </Route>
                    </Route>

                    {/* Reindirizzamenti predefiniti */}
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                </Routes>
            </AuthInitializer>
        </BrowserRouter>
    );
};

// Wrapper principale con Provider Redux
const App = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AppContent/>
            </PersistGate>
        </Provider>
    );
};

export default App;