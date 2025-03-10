import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Divider
} from '@mui/material';
import { Email as EmailIcon, Logout as LogoutIcon } from '@mui/icons-material';

import { sendEmailVerification, logout } from '../../redux/thunks/authThunks';
import { AppDispatch, RootState } from '../../redux/store';

const WaitingVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isResending, setIsResending] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  
  const [email, setEmail] = useState<string>(
    location.state?.email || user?.email || ''
  );
  
  useEffect(() => {
    // Se non abbiamo né email né utente, reindirizza al login
    if (!email && !user) {
      navigate('/login');
    }
  }, [email, user, navigate]);
  
  const handleResendVerification = async (): Promise<void> => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await dispatch(sendEmailVerification(email));
      setEmailSent(true);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };
  
  const handleLogout = async (): Promise<void> => {
    try {
      await dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Verifica il tuo indirizzo email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Abbiamo inviato un'email di verifica a <strong>{email}</strong>.
            Per favore controlla la tua casella di posta e clicca sul link di conferma.
          </Typography>
        </Box>
        
        {emailSent && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Email di verifica inviata con successo!
          </Alert>
        )}
        
        {!location.state?.email && !user?.email && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Il tuo indirizzo email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Box>
        )}
        
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResendVerification}
            disabled={isResending || !email}
            fullWidth
          >
            {isResending ? <CircularProgress size={24} /> : 'Invia di nuovo l\'email'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            fullWidth
          >
            Torna al login
          </Button>
        </Stack>
        
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            oppure
          </Typography>
        </Divider>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
        >
          Logout
        </Button>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Non hai ricevuto l'email? Controlla la cartella spam o prova a inviare di nuovo.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default WaitingVerification;