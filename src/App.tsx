// App.tsx
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
import WaitingVerification from './pages/auth/WaitingVerification';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Redux
import { AppDispatch, RootState } from './redux/store';
import { checkAuthState } from './redux/thunks/authThunks';
import LoadingScreen from './components/common/LoadingScreen';
import AlertManager from './components/common/AlertManager';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isAuthenticated, isEmailVerified } = useSelector((state: RootState) => state.auth);
  const { theme: themeMode } = useSelector((state: RootState) => state.ui);

  const theme = React.useMemo(() => {
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: themeMode,
      },
    });
  }, [themeMode]);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <CssBaseline />
        <Router>
          <AlertManager />
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
              <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
              <Route path="/auth/waiting-verification" element={<WaitingVerification />} />
            </Route>
            <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;