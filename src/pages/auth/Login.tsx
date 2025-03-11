import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Stack,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Apple as AppleIcon
} from '@mui/icons-material';

import { login, loginWithProvider } from '../../redux/thunks/authThunks';
import { AppDispatch, RootState } from '../../redux/store';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    email: 'vilawap947@makroyal.com',
    password: 'Admin123!!',
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.email) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email non valida';
    }
    if (!formData.password) {
      errors.password = 'La password è obbligatoria';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    setErrors(null);
  
    try {
      const result = await dispatch(login(formData.email, formData.password));
      
      if (result.success) {
        if (!result.isEmailVerified) {
          // Reindirizza sempre alla pagina di verifica dell'email se non è verificata
          navigate('/auth/waiting-verification', { 
            state: { email: formData.email } 
          });
        } else {
          // Solo se l'email è verificata consentiamo l'accesso alla dashboard
          navigate('/dashboard');
        }
      } else {
        setErrors(result.message || 'Login fallito. Controlla le tue credenziali.');
      }
    } catch (error: any) {
      // Gestiamo i diversi tipi di errori in modo più specifico
      if (error.message?.includes('Invalid login credentials')) {
        setErrors('Credenziali non valide. Controlla email e password.');
      } else if (error.message?.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
        // Reindirizza alla pagina di verifica email
        navigate('/auth/waiting-verification', { 
          state: { email: formData.email } 
        });
      } else {
        setErrors(error.message || 'Errore durante il login. Riprova più tardi.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithProvider('google'));
    } catch (error) {
      // Errore già gestito nel reducer
    }
  };
  
  const handleAppleLogin = async () => {
    try {
      await dispatch(loginWithProvider('apple'));
    } catch (error) {
      // Errore già gestito nel reducer
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 450,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Accedi a Pennywise
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestisci le tue spese condivise in modo semplice
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Password dimenticata?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            { 'Accedi'}
          </Button>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                oppure
              </Typography>
            </Divider>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AppleIcon />}
              onClick={handleAppleLogin}
            >
              Apple
            </Button>
          </Stack>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Non hai un account?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Registrati ora
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;