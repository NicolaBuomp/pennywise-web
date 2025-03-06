import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { Login } from './pages/auth/Login';
import { supabase } from './lib/supabase';
import { useAppDispatch } from './hooks';
import { setUser } from './store/auth/authSlice';

function App() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Check for session on app load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        dispatch(setUser(session.user));
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          dispatch(setUser(session.user));
        } else if (event === 'SIGNED_OUT') {
          dispatch(setUser(null));
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Altre rotte future */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;