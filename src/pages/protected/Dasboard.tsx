import { Box, Typography, Container, Paper, Grid, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks';
import { logoutUser } from '../../store/slices/authSlice';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
          Loading user data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to PennyWise Dashboard
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Profile
          </Typography>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Email:</strong> {user.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Name:</strong> {user.user_metadata?.first_name || ''} {user.user_metadata?.last_name || ''}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Quick Statistics
          </Typography>
          <Grid container spacing={3}>
            {/* These would be replaced with actual data components */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              >
                <Typography variant="h4">$0</Typography>
                <Typography variant="body1">Monthly Budget</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: 'success.light',
                  color: 'success.contrastText'
                }}
              >
                <Typography variant="h4">$0</Typography>
                <Typography variant="body1">Total Income</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: 'warning.light',
                  color: 'warning.contrastText'
                }}
              >
                <Typography variant="h4">$0</Typography>
                <Typography variant="body1">Total Expenses</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;