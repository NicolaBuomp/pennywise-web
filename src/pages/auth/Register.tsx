import { useState } from 'react';
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
  Stack
} from '@mui/material';
import { supabase } from '../../services/supabase';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      const validatedData = registerSchema.parse(formData);
      
      // Register with Supabase
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
          }
        }
      });
      
      if (error) throw error;
      
      // Redirect to login with success message
      navigate('/login', { state: { message: 'Registration successful! Please verify your email and log in.' } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Transform Zod errors into a more usable format
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else if (error instanceof Error) {
        // Handle API errors
        setErrors({ form: error.message || 'Registration failed. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ height: '100vh', display: 'flex', py: 4 }}>
      {/* Main container using Box instead of Grid container */}
      <Box sx={{ display: 'flex', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left side - Form */}
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
            
            {errors.form && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.form}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Name fields in row using Stack */}
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
                    error={!!errors.firstName}
                    helperText={errors.firstName || ''}
                    size="small"
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
                    error={!!errors.lastName}
                    helperText={errors.lastName || ''}
                    size="small"
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
                error={!!errors.email}
                helperText={errors.email || ''}
                size="small"
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
                error={!!errors.password}
                helperText={errors.password || ''}
                size="small"
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
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword || ''}
                size="small"
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ py: 1.5, mt: 1 }}
              >
                {isSubmitting ? (
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
        
        {/* Right side - Branding/Image */}
        <Box
          sx={{ 
            flex: 1,
            display: { xs: 'none', md: 'flex' }, 
            bgcolor: 'primary.main',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            p: 4
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
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
