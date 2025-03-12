import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Drawer, 
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  styled,
  Button,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';

import Sidebar from '../components/dashboard/Sidebar';
import EmailVerificationBanner from '../components/common/EmailVerificationBanner';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/thunks/authThunks';
import { AppDispatch } from '../redux/store';

// Constants
const DRAWER_WIDTH = 260; // Width of sidebar when open
const CLOSED_DRAWER_WIDTH = 0;

// Styled components for responsive behavior
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean, ismobile: number }>(({ theme, open, ismobile }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && !ismobile && {
    marginLeft: DRAWER_WIDTH,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    width: DRAWER_WIDTH,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }),
  ...(!open && {
    width: CLOSED_DRAWER_WIDTH,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    '& .MuiDrawer-paper': {
      width: CLOSED_DRAWER_WIDTH,
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
  }),
}));

// Main component
const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const { isEmailVerified } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Function to close drawer on mobile when a menu item is clicked
  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Effect to handle responsive behavior
  React.useEffect(() => {
    // Close drawer by default on mobile, open by default on desktop
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* App bar */}
      <StyledAppBar 
        position="fixed" 
        open={drawerOpen} 
        ismobile={isMobile ? 1 : 0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Penny Wise
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Sidebar */}
      {isMobile ? (
        // Mobile version: temporary drawer that closes when clicking outside
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: DRAWER_WIDTH,
              boxSizing: 'border-box' 
            },
          }}
        >
          <Toolbar /> {/* Space for AppBar */}
          <Sidebar onMenuItemClick={handleMenuClick} />
          <Box sx={{ mt: 'auto', mb: 2, px: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
      ) : (
        // Desktop version: persistent drawer
        <StyledDrawer
          variant="permanent"
          open={drawerOpen}
        >
          <Toolbar /> {/* Space for AppBar */}
          <Sidebar onMenuItemClick={handleMenuClick} />
          <Box sx={{ mt: 'auto', mb: 2, px: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </StyledDrawer>
      )}

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Space for AppBar */}
        
        {!isEmailVerified && <EmailVerificationBanner displayMode="once-per-session" />}
        
        {/* Main content from child routes */}
        <Box sx={{ flexGrow: 1, width: '100%', overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;