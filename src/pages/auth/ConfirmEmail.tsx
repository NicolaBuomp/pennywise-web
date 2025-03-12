// ConfirmEmail.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { AppDispatch } from '../../redux/store';
import { setEmailVerified } from '../../redux/slices/authSlice';
import { checkEmailVerification } from '../../redux/thunks/authThunks';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Verifica se c'è un token nell'URL
        const token = searchParams.get('token');
        
        // Un solo tentativo di verifica iniziale
        const isVerified = await dispatch(checkEmailVerification());
        
        if (isVerified) {
          // Email verificata con successo
          dispatch(setEmailVerified(true));
          setSuccess(true);
          
          // Start countdown for redirect
          const intervalId = setInterval(() => {
            setCountdown(prevCount => {
              if (prevCount <= 1) {
                clearInterval(intervalId);
                navigate('/dashboard');
                return 0;
              }
              return prevCount - 1;
            });
          }, 1000);
          
          return () => clearInterval(intervalId);
        } else if (token) {
          // Se abbiamo un token ma la verifica non è ancora confermata,
          // potremmo essere in un caso di latenza nella propagazione dell'aggiornamento
          // Invece di fare polling, mostriamo un messaggio informativo
          setError("La verifica dell'email è in corso. Potrebbe richiedere qualche minuto. Riprova ad accedere tra poco.");
        } else {
          throw new Error("Nessun token di verifica trovato nell'URL.");
        }
      } catch (error: any) {
        setError(error.message || `Errore durante la verifica dell'email`);
      } finally {
        setIsLoading(false);
      }
    };
    verifyEmail();
  }, [searchParams, dispatch, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 450 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2, textAlign: 'center' }}>
        {isLoading ? (
          <>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">Verifica in corso...</Typography>
          </>
        ) : success ? (
          <>
            <CheckCircleOutline color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Email verificata con successo!</Typography>
            <Typography variant="body1">
              Verrai reindirizzato alla dashboard in {countdown} secondi...
            </Typography>
          </>
        ) : (
          <>
            <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Typography variant="body1">
              Puoi provare a tornare alla pagina di login e accedere nuovamente.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ConfirmEmail;