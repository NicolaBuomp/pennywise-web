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

import { register, loginWithProvider } from '../../redux/thunks/authThunks';
import { AppDispatch, RootState } from '../../redux/store';

interface FormData {
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    displayName: 'Admin',
    phoneNumber: '1234567890',
    email: 'nicolabuompane96@gmail.com',
    password: 'Admin123!!',
    confirmPassword: 'Admin123!!',
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Reset errore specifico quando l'utente inizia a digitare
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validazione display name
    if (!formData.displayName) {
      errors.displayName = 'Il nome visualizzato è obbligatorio';
    }
    
    // Validazione numero di telefono (opzionale)
    if (formData.phoneNumber && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Formato numero di telefono non valido';
    }
    
    // Validazione email
    if (!formData.email) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email non valida';
    }
    
    // Validazione password
    if (!formData.password) {
      errors.password = 'La password è obbligatoria';
    } else if (formData.password.length < 8) {
      errors.password = 'La password deve contenere almeno 8 caratteri';
    }
    
    // Validazione conferma password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Le password non coincidono';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const userData = {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber || null,
        username: formData.email.split('@')[0], // Ensure username is set
      };
      
      const result = await dispatch(register(formData.email, formData.password, userData));
      
      // Force redirect to waiting verification page, regardless of result
      navigate('/auth/waiting-verification', { 
        state: { email: formData.email } 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      // The error is already handled in the reducer
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
            Crea un account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inizia a gestire le tue spese condivise con Pennywise
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
            id="displayName"
            label="Nome completo"
            name="displayName"
            autoComplete="name"
            value={formData.displayName}
            onChange={handleChange}
            error={!!formErrors.displayName}
            helperText={formErrors.displayName}
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="phoneNumber"
            label="Numero di telefono (opzionale)"
            name="phoneNumber"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
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
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Conferma password"
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Registrati'}
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
              disabled={isLoading}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AppleIcon />}
              onClick={handleAppleLogin}
              disabled={isLoading}
            >
              Apple
            </Button>
          </Stack>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Hai già un account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Accedi
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;