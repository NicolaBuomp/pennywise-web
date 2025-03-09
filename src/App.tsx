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
// Il DashboardLayout verrà implementato successivamente

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// Altre pagine verranno implementate successivamente

// Redux
import { AppDispatch, RootState } from './redux/store';
import { checkAuthState } from './redux/thunks/authThunks';
import LoadingScreen from './components/common/LoadingScreen';

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
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
              {/* Altre route di autenticazione verranno aggiunte successivamente */}
            </Route>

            {/* Protected Routes - verranno implementate in seguito */}
            <Route 
              path="/"
              element={
                isAuthenticated ? 
                <div>Dashboard (verrà implementata successivamente)</div> : 
                <Navigate to="/login" />
              } 
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;