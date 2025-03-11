import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Caricamento...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;