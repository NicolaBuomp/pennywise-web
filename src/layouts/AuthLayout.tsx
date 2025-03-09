import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Logo componente
const Logo = styled('img')(({ theme }) => ({
  height: 40,
  marginRight: theme.spacing(1)
}));

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Logo src="/logo.svg" alt="Pennywise Logo" />
            <Typography variant="h5" color="primary" fontWeight="bold">
              Pennywise
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4} 
            alignItems="center"
            justifyContent="center"
          >
            {/* Left column: decorative content (hidden on mobile) */}
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: '1 1 50%',
                  maxWidth: 480,
                  textAlign: 'center',
                }}
              >
                <Box
                  component="img"
                  src="/auth-illustration.svg"
                  alt="Gestione condivisa delle spese"
                  sx={{
                    width: '100%',
                    maxWidth: 360,
                    mb: 4,
                  }}
                />
                <Typography variant="h3" gutterBottom>
                  Gestione condivisa delle spese
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Semplifica la tua vita finanziaria con coinquilini, amici o familiari.
                  Tieni traccia di chi deve cosa, quando, e ottieni statistiche in tempo reale.
                </Typography>
              </Box>
            )}

            {/* Right column: auth forms */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: '1 1 50%',
                width: '100%',
              }}
            >
              <Outlet />
            </Box>
          </Stack>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 3,
          mt: 'auto',
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Pennywise - Gestione condivisa delle spese
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;