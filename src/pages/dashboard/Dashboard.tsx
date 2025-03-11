import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { RootState } from '../../redux/store';
import EmailVerificationBanner from '../../components/common/EmailVerificationBanner';

const Dashboard: React.FC = () => {
  const { user, isEmailVerified } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  
  // Redirect unverified users to waiting-verification page
  useEffect(() => {
    if (user && !isEmailVerified) {
      navigate('/auth/waiting-verification', { state: { email: user.email } });
    }
  }, [user, isEmailVerified, navigate]);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Show banner for unverified users (as a fallback) */}
      <EmailVerificationBanner displayMode="always" />
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Benvenuto, {user?.display_name || user?.username || 'Utente'}!
        </Typography>
        
        <Typography variant="body1">
          Stato email: {isEmailVerified ? 'Verificata ✓' : 'Non verificata ⚠️'}
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Attività recenti</Typography>
            <Typography variant="body2" color="textSecondary">
              Nessuna attività recente da mostrare.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Statistiche</Typography>
            <Typography variant="body2" color="textSecondary">
              I tuoi dati verranno visualizzati qui.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
