import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Container, useTheme, Drawer, List, ListItem, ListItemText, ListItemButton, ListItemIcon, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import ThemeSwitcher from './themeSwitcher';
import { Link, useLocation, Location } from 'react-router-dom';

// You can add Material-UI icons or other icons here
// We're just using emoji for simplicity
const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Transactions', path: '/transactions', icon: '💸' },
  { name: 'Budget', path: '/budget', icon: '💰' },
  { name: 'Reports', path: '/reports', icon: '📈' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

// Safe Link component that doesn't rely on Router context
const SafeLink = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => {
  try {
    // Try to use the actual Link component
    // This will throw if outside a Router context
    useLocation();
    return <Link to={to} {...props}>{children}</Link>;
  } catch (error) {
    // Fall back to a regular anchor tag
    return <a href={to} {...props}>{children}</a>;
  }
};

// Safe wrapper to check if we're in a router context
const isInRouterContext = (): boolean => {
  try {
    useLocation();
    return true;
  } catch (error) {
    return false;
  }
};

// Component to safely render router-dependent content
const SafeRouter = ({ children }: { children: React.ReactNode }) => {
  const hasRouterContext = isInRouterContext();
  
  // For components that need location but are rendered outside Router context
  if (!hasRouterContext) {
    return <Box>{children}</Box>; // Render without Router-dependent features
  }
  
  return <>{children}</>; // Render normally inside Router context
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const user = useSelector(selectUser);
  
  // Get current path, with a safe default
  let currentPath = '/';
  try {
    const location = useLocation();
    currentPath = location.pathname;
  } catch (error) {
    // If useLocation fails, we use the default path
  }
  
  // We would normally manage these with state, but keeping it simple for this example
  const isAuthenticated = !!user;
  
  // Only show drawer for authenticated routes
  const showDrawer = isAuthenticated && 
    currentPath !== '/login' && 
    currentPath !== '/register';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar - always visible */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component={SafeLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <span role="img" aria-label="PennyWise logo" style={{ fontSize: '1.5rem' }}>💰</span>
            PennyWise
          </Typography>
          
          <ThemeSwitcher />
          
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user?.email}
              </Typography>
              <IconButton 
                size="small"
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Side drawer - only for authenticated routes */}
      {showDrawer && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: DRAWER_WIDTH, 
              boxSizing: 'border-box',
              bgcolor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Toolbar /> {/* This creates space for the AppBar */}
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List>
              {MENU_ITEMS.map((item) => (
                <ListItem key={item.name} disablePadding>
                  <ListItemButton
                    component={SafeLink}
                    to={item.path}
                    selected={currentPath === item.path}
                    sx={{
                      py: 1.5,
                      borderRadius: '0 24px 24px 0',
                      mr: 1,
                      ml: 0,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, fontSize: '1.25rem' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} PennyWise
              </Typography>
            </Box>
          </Box>
        </Drawer>
      )}
      
      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${showDrawer ? DRAWER_WIDTH : 0}px)` },
          ml: { sm: showDrawer ? `${DRAWER_WIDTH}px` : 0 },
        }}
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <SafeRouter>
            {children}
          </SafeRouter>
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;