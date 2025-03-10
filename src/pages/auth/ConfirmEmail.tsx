import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

import { AppDispatch } from '../../redux/store';
import { setEmailVerified } from '../../redux/slices/authSlice';
import supabase from '../../supabaseClient';
import { logout, sendEmailVerification } from '../../redux/thunks/authThunks';

/**
 * Componente per la pagina di conferma email
 * Gestisce la verifica del link di conferma email inviato all'utente
 */
const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState<boolean>(false);
  
  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      try {
        // Ottieni i parametri dall'URL
        const token: string | null = searchParams.get('token');
        const type: string | null = searchParams.get('type');
        const userEmail: string | null = searchParams.get('email');
        
        if (userEmail) {
          setEmail(userEmail);
        }
        
        if (!token || type !== 'email_confirmation') {
          setError('Link di conferma non valido. Per favore richiedi un nuovo link di verifica.');
          setIsLoading(false);
          return;
        }
        
        // Utilizziamo la funzione di Supabase per verificare il token
        // Nota: Supabase gestisce internamente questa operazione
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });
        
        if (error) {
          throw error;
        }
        
        // Aggiorniamo lo stato Redux
        dispatch(setEmailVerified(true));
        setSuccess(true);
        setIsLoading(false);
      } catch (error: any) {
        setError(error.message || 'Errore durante la verifica dell\'email');
        setIsLoading(false);
      }
    };
    
    verifyEmail();
  }, [searchParams, dispatch]);
  
  const handleNavigateToLogin = (): void => {
    navigate('/login');
  };
  
  const handleNavigateToDashboard = (): void => {
    navigate('/');
  };
  
  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await dispatch(sendEmailVerification(email));
      setError(null);
      setIsResending(false);
    } catch (error) {
      setError('Errore nell\'invio dell\'email di verifica. Riprova più tardi.');
      setIsResending(false);
    }
  };
  
  const handleLogout = async () => {
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
        {isLoading ? (
          <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">Verifica dell'email in corso...</Typography>
          </Box>
        ) : success ? (
          <Box sx={{ py: 2 }}>
            <CheckCircleOutline color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Email verificata con successo!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Grazie per aver verificato la tua email. Ora puoi accedere a tutte le funzionalità di Pennywise.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleNavigateToDashboard}
              sx={{ mt: 2 }}
            >
              Vai alla Dashboard
            </Button>
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Verifica fallita
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error || 'Si è verificato un errore durante la verifica dell\'email.'}
            </Alert>
            
            {email && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  sx={{ mb: 2 }}
                >
                  {isResending ? 'Invio in corso...' : 'Richiedi un nuovo link'}
                </Button>
              </Box>
            )}
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleNavigateToLogin}
              >
                Torna al Login
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ConfirmEmail;