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

// Gruppi
import Groups from './pages/groups/Groups';
import GroupDetail from './pages/groups/GroupDetail';
import JoinGroup from './pages/groups/JoinGroup';

// Redux
import { AppDispatch, RootState } from './redux/store';
import { checkAuthState } from './redux/thunks/authThunks';
import LoadingScreen from './components/common/LoadingScreen';
import AlertManager from './components/common/AlertManager';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialLoading, isAuthenticated, isEmailVerified } = useSelector((state: RootState) => state.auth);
  const { theme: themeMode } = useSelector((state: RootState) => state.ui);

  // Crea un tema derivato con il corretto mode (light/dark)
  const theme = React.useMemo(() => {
    // Verifica se baseTheme.palette esiste prima di usarlo
    const paletteBase = baseTheme?.palette || {};
    
    return createTheme({
      ...(baseTheme || {}),
      palette: {
        ...paletteBase,
        mode: themeMode,
      },
    });
  }, [themeMode]);

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  if (isInitialLoading) {
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
              <Route path="/login" element={isAuthenticated && isEmailVerified ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={isAuthenticated && isEmailVerified ? <Navigate to="/dashboard" /> : <Register />} />
              <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
              <Route path="/auth/waiting-verification" element={<WaitingVerification />} />
            </Route>
            
            {/* Ora controlliamo sia isAuthenticated che isEmailVerified per l'accesso alla dashboard */}
            <Route 
              element={
                isAuthenticated ? (
                  isEmailVerified ? (
                    <DashboardLayout />
                  ) : (
                    <Navigate to="/auth/waiting-verification" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Rotte gruppi */}
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:id" element={<GroupDetail />} />
              <Route path="/join-group/:token" element={<JoinGroup />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;