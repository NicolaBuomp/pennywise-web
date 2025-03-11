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
        
        // Check with Supabase if the email is verified
        const isVerified = await dispatch(checkEmailVerification());
        
        if (isVerified) {
          // Imposta esplicitamente lo stato di verifica
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
          // Se abbiamo un token ma isVerified è false, potrebbe esserci un ritardo
          // nella propagazione dello stato di verifica
          setTimeout(() => {
            dispatch(checkEmailVerification()).then(verified => {
              if (verified) {
                dispatch(setEmailVerified(true));
                setSuccess(true);
                
                // Start countdown for redirect if verified on second attempt
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
              } else {
                setError("L'email non risulta ancora verificata. Potrebbe essere necessario attendere qualche minuto.");
              }
              setIsLoading(false);
            });
          }, 2000);
          return; // Ferma l'esecuzione qui per evitare di impostare isLoading = false troppo presto
        } else {
          throw new Error("L'email non risulta ancora verificata. Riprova più tardi.");
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