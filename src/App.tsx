// 📦 Import principali
import {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {Provider, useDispatch} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import {persistor, store} from "./store/store";
import {getSession} from "./store/auth/authSlice";
import {fetchProfile} from "./store/profile/profileSlice.tsx";

// 📌 Import delle Pagine
import {
    AuthCallback,
    EmailConfirmed,
    EmailDebug,
    EmailVerification,
    Login,
    Register,
    VerifyEmailManual
} from "./pages/auth";
import {Dashboard, Profile, Settings} from "./pages/protected";
import {NotFound, Unauthorized} from "./pages/error";

// 📌 Import Componenti Layout e Routing
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home.tsx";

// 🔹 Componente per inizializzare l'autenticazione
const AuthInitializer = ({children}: { children: React.ReactNode }) => {
    const dispatch = useDispatch();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            if (initialized) return;
            setInitialized(true);

            const result = await dispatch(getSession());

            if (result.payload?.session?.user) {
                dispatch(fetchProfile());
            }
        };

        initAuth();
    }, [dispatch, initialized]);

    return <>{children}</>;
};

// 🔹 Componente principale dell'app con le rotte
const AppContent = () => {
    return (
        <BrowserRouter>
            <AuthInitializer>
                <Routes>
                    {/* 📌 Route pubbliche */}
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/auth/callback" element={<AuthCallback/>}/>
                    <Route path="/email-debug" element={<EmailDebug/>}/>
                    <Route path="/email-confirmed" element={<EmailConfirmed/>}/>
                    <Route path="/verify-email-manual" element={<VerifyEmailManual/>}/>

                    {/* 📌 Route semi-protette */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/email-verification" element={<EmailVerification/>}/>

                        {/* 📌 Route con Layout Principale */}
                        <Route element={<MainLayout/>}>
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="/profile" element={<Profile/>}/>
                            <Route path="/settings" element={<Settings/>}/>
                        </Route>
                    </Route>

                    {/* 📌 Gestione errori e route non trovate */}
                    <Route path="*" element={<NotFound/>}/>
                    <Route path="/unauthorized" element={<Unauthorized/>}/>
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                </Routes>
            </AuthInitializer>
        </BrowserRouter>
    );
};

// 🔹 Wrapper principale con Redux e PersistGate
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
