// src/pages/auth/Register.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Alert, 
  CircularProgress,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { 
  registerUser, 
  clearError, 
  selectError, 
  selectLoading, 
  selectRegistrationSuccess,
  resetRegistrationSuccess,
  selectEmailVerificationSent,
  resetEmailVerificationSent
} from '../../store/slices/authSlice';

// Schema di validazione per la registrazione
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const registrationSuccess = useAppSelector(selectRegistrationSuccess);
  const emailVerificationSent = useAppSelector(selectEmailVerificationSent);
  
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  // Mostra finestra di dialogo di verifica quando la registrazione ha successo e la verifica via email è richiesta
  useEffect(() => {
    if (registrationSuccess && emailVerificationSent) {
      setVerificationDialogOpen(true);
    }
  }, [registrationSuccess, emailVerificationSent]);

  // Pulizia allo smontaggio
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(resetRegistrationSuccess());
      dispatch(resetEmailVerificationSent());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Pulisce l'errore relativo quando l'utente digita
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Pulisce l'errore API quando l'utente inizia a digitare
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    try {
      registerSchema.parse(formData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pulisce eventuali errori precedenti
    dispatch(clearError());
    
    if (validateForm()) {
      try {
        await dispatch(registerUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })).unwrap();
        // La gestione del successo avviene nell'useEffect che mostra la finestra di dialogo
      } catch (err) {
        // L'errore è gestito dallo stato Redux
      }
    }
  };

  const handleVerificationDialogClose = () => {
    setVerificationDialogOpen(false);
    navigate('/login', { 
      state: { 
        message: 'Please check your email to verify your account before logging in.' 
      }
    });
    dispatch(resetRegistrationSuccess());
    dispatch(resetEmailVerificationSent());
  };

  return (
    <>
      <Container component="main" maxWidth="lg" sx={{ height: '100vh', display: 'flex', py: 4 }}>
        {/* Contenitore principale */}
        <Box sx={{ display: 'flex', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Lato sinistro - Form */}
          <Box
            sx={{ 
              flex: 1,
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              p: 3
            }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%',
                maxWidth: 450
              }}
            >
              <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Create your PennyWise account
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Campi nome in riga con Stack */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName || ''}
                      size="small"
                      disabled={loading}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName || ''}
                      size="small"
                      disabled={loading}
                    />
                  </Box>
                </Stack>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email || ''}
                  size="small"
                  disabled={loading}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password || ''}
                  size="small"
                  disabled={loading}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword || ''}
                  size="small"
                  sx={{ mb: 3 }}
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}>
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
          
          {/* Lato destro - Branding/Immagine */}
          <Box
            sx={{ 
              flex: 1,
              display: { xs: 'none', md: 'flex' }, 
              bgcolor: 'primary.main',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              p: 4,
              borderRadius: 2
            }}
          >
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
              Welcome to PennyWise
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9 }}>
              Your personal finance management solution
            </Typography>
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h2" component="span">
                💰
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4, maxWidth: 400, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Take control of your finances with PennyWise. Track your spending, manage your budget, and reach your financial goals with ease.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Finestra di dialogo per la verifica email */}
      <Dialog
        open={verificationDialogOpen}
        onClose={handleVerificationDialogClose}
        aria-labelledby="verification-dialog-title"
        aria-describedby="verification-dialog-description"
      >
        <DialogTitle id="verification-dialog-title">
          Email Verification Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="verification-dialog-description">
            We've sent a verification link to <strong>{formData.email}</strong>. Please check your email and click the link to verify your account before logging in.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            If you don't see the email, please check your spam folder.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerificationDialogClose} color="primary" autoFocus>
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Register;