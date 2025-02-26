// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { getSession } from './store/auth/authSlice';

// Pagine di autenticazione
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/auth/AuthCallback';
import EmailVerification from './pages/auth/EmailVerification';
import EmailConfirmed from './pages/auth/EmailConfirmed';
import EmailDebug from './pages/auth/EmailDebug';

// Pagine protette
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componente per inizializzare l'autenticazione
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Verifica la sessione all'avvio dell'app
        dispatch(getSession());
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/email-debug" element={<EmailDebug />} />
                    <Route path="/email-confirmed" element={<EmailConfirmed />} />

                    {/* Route semi-protette (richiedono autenticazione ma non email verificata) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/email-verification" element={<EmailVerification />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        {/* Aggiungi qui altre route protette */}
                    </Route>

                    {/* Reindirizzamenti predefiniti */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
                <AppContent />
            </PersistGate>
        </Provider>
    );
};

export default App;