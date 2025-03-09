import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Container, Typography, Paper } from '@mui/material';

import { RootState } from '../../redux/store';
import EmailVerificationBanner from '../auth/EmailVerificationBanner';

/**
 * Pagina Dashboard principale dell'applicazione
 * Questa è una versione semplificata, da espandere in seguito
 */
const Dashboard: React.FC = () => {
  const { user, isEmailVerified } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Banner di verifica email - mostrato solo se l'email non è verificata */}
      {!isEmailVerified && <EmailVerificationBanner displayMode="once-per-session" />}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Benvenuto, {user?.display_name || user?.username || 'Utente'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestisci le tue spese condivise in modo semplice con Pennywise
        </Typography>
      </Box>
      
      {/* Contenuto principale */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Questa è una versione semplificata della dashboard. Verrà espansa con ulteriori funzionalità
          nelle prossime fasi di sviluppo.
        </Typography>
      </Paper>
      
      {/* Altri componenti e sezioni verranno aggiunti qui */}
    </Container>
  );
};

export default Dashboard;