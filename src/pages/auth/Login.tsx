// src/pages/auth/Login.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Alert, 
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { loginUser, clearError, selectError, selectLoading } from '../../store/slices/authSlice';
import { z } from 'zod';
import { supabase } from '../../services/supabase';

// Schema di validazione per il login
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location as { state: { message?: string } | null };
  
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notificationMessage, setNotificationMessage] = useState<{text: string, type: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Mostra il messaggio di notifica se reindirizzato con state
  useEffect(() => {
    if (state?.message) {
      setNotificationMessage({
        text: state.message,
        type: 'info'
      });
      // Pulisce lo state della location
      navigate(location.pathname, { replace: true });
    }
  }, [state, navigate, location.pathname]);

  // Pulisce gli errori quando il componente viene smontato
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Pulisce l'errore relativo quando l'utente inizia a digitare
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Pulisce l'errore API quando l'utente inizia a digitare
    if (error) {
      dispatch(clearError());
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pulisce eventuali errori precedenti
    dispatch(clearError());
    
    if (validateForm()) {
      try {
        await dispatch(loginUser({ 
          email: formData.email, 
          password: formData.password 
        })).unwrap();
        // In caso di login riuscito, l'utente verrà reindirizzato automaticamente da ProtectedRoute
      } catch (err) {
        // Verifica se l'errore riguarda l'email non confermata
        if (typeof err === 'string' && err.includes('verify')) {
          setNotificationMessage({
            text: "Your email hasn't been verified yet. Please check your inbox for the verification link.",
            type: 'warning'
          });
        }
      }
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setFormErrors({
        email: 'Please enter your email to resend verification'
      });
      return;
    }

    setResendingVerification(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });
      
      if (error) throw error;
      
      setNotificationMessage({
        text: 'Verification email has been resent. Please check your inbox.',
        type: 'success'
      });
    } catch (error) {
      setNotificationMessage({
        text: 'Failed to resend verification email. Please try again later.',
        type: 'error'
      });
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          PennyWise
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personal finance management solution
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="medium" gutterBottom>
            Sign in to your account
          </Typography>
          
          {notificationMessage && (
            <Alert severity={notificationMessage.type} sx={{ my: 2 }}>
              {notificationMessage.text}
              {notificationMessage.type === 'warning' && (
                <Box sx={{ mt: 1 }}>
                  <MuiLink 
                    component="button"
                    variant="body2"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {resendingVerification ? 'Sending...' : 'Resend verification email'}
                  </MuiLink>
                </Box>
              )}
            </Alert>
          )}
          
          {error && !notificationMessage && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 2 }}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email || ''}
              disabled={loading || resendingVerification}
              size="small"
            />
            
            <TextField
              type="password"
              label="Password"
              fullWidth
              margin="normal"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password || ''}
              disabled={loading || resendingVerification}
              size="small"
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || resendingVerification}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" align="center">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    color: 'primary.main', 
                    textDecoration: 'none', 
                    fontWeight: 500 
                  }}
                >
                  Sign up
                </Link>
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                <MuiLink 
                  component="button"
                  variant="body2"
                  onClick={() => {
                    // TODO: Implementare la funzionalità di recupero password
                    alert('Forgot password functionality will be implemented soon!');
                  }}
                  sx={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  Forgot password?
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;