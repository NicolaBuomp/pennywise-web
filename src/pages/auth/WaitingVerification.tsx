// src/pages/auth/WaitingVerification.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

import { sendEmailVerification } from '../../redux/thunks/authThunks';
import { AppDispatch } from '../../redux/store';

const WaitingVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isResending, setIsResending] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  
  // Recupera l'email dalla location state o mostra un form
  const [email, setEmail] = useState<string>(
    location.state?.email || ''
  );
  
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
        
        {!location.state?.email && (
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
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResendVerification}
            disabled={isResending || !email}
          >
            {isResending ? <CircularProgress size={24} /> : 'Invia di nuovo l\'email'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
          >
            Torna al login
          </Button>
        </Box>
        
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