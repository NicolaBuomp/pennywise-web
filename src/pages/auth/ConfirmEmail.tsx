// ConfirmEmail.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Paper, Typography, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { AppDispatch } from '../../redux/store';
import { setEmailVerified } from '../../redux/slices/authSlice';
import supabase from '../../supabaseClient';
import { checkEmailVerification } from '../../redux/thunks/authThunks';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Verifica se c'è un token nell'URL
        const token = searchParams.get('token');
        
        // Actually check with Supabase if the email is verified
        const isVerified = await dispatch(checkEmailVerification());
        
        if (isVerified) {
          // Imposta esplicitamente lo stato di verifica
          dispatch(setEmailVerified(true));
          setSuccess(true);
        } else if (token) {
          // Se abbiamo un token ma isVerified è false, potrebbe esserci un ritardo
          // nella propagazione dello stato di verifica
          setTimeout(() => {
            dispatch(checkEmailVerification()).then(verified => {
              if (verified) {
                dispatch(setEmailVerified(true));
                setSuccess(true);
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
  }, [searchParams, dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 450 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2, textAlign: 'center' }}>
        {isLoading ? (
          <CircularProgress size={60} sx={{ mb: 2 }} />
        ) : success ? (
          <>
            <CheckCircleOutline color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5">Email verificata con successo!</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>Vai alla Dashboard</Button>
          </>
        ) : (
          <>
            <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Alert severity="error">{error}</Alert>
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>Torna al Login</Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ConfirmEmail;