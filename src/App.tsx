import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme/theme';
import { useSelector } from 'react-redux';
import { selectIsDarkMode } from './store/slices/themeSlice';
import AppRoutes from './routes';
import AppLayout from './components/layout/AppLayout';
import { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import { checkSession } from './store/slices/authSlice';

function App() {
  const isDarkMode = useSelector(selectIsDarkMode);
  const dispatch = useAppDispatch();
  
  // Check for existing session on app load
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);
  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      {/* CssBaseline normalizes styles */}
      <CssBaseline />
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </ThemeProvider>
  );
}

export default App;