import { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Card, CardContent } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';

export const Login = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });

  // Clear Redux error when component unmounts or input changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
    if (!email) {
      newErrors.email = 'Email è richiesta';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email non valida';
      valid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password è richiesta';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };

  const handleLogin = () => {
    // Clear any previous errors
    dispatch(clearError());
    
    if (validateForm()) {
      dispatch(loginUser({ email, password }));
    }
  };

  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Login</Typography>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleInputChange();
            }}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            type="password"
            label="Password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{ mt: 2 }}
          >
            {loading ? 'Caricamento...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};