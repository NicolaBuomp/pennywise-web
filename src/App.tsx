import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/it';

// Theme
import baseTheme from './theme';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ConfirmEmail from './pages/auth/ConfirmEmail';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
// import Profile from './pages/dashboard/Profile';
// import Settings from './pages/dashboard/Settings';

// Redux
import { AppDispatch, RootState } from './redux/store';
import { checkAuthState } from './redux/thunks/authThunks';
import LoadingScreen from './components/common/LoadingScreen';
import AlertManager from './components/common/AlertManager';
import { Dashboard } from '@mui/icons-material';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme: themeMode } = useSelector((state: RootState) => state.ui);

  // Crea tema dinamico basato sulle preferenze dell'utente
  const theme = React.useMemo(() => {
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: themeMode,
      },
    });
  }, [themeMode]);

  // Verifica lo stato di autenticazione all'avvio dell'app
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  // Mostra schermata di caricamento durante il controllo dell'autenticazione
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <CssBaseline />
        <Router>
          {/* Sistema di gestione degli alert globali */}
          <AlertManager />
          
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
              <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
              {/* <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} /> */}
            </Route>

            {/* Protected Routes */}
            <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<Dashboard />} />
              {/* <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} /> */}
              
              {/* Altre rotte protette verranno aggiunte qui */}
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;