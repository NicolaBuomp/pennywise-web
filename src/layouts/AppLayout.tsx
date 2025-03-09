// src/components/layout/AppLayout.tsx
import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Container, useTheme, Drawer, List, ListItem, ListItemText, ListItemButton, ListItemIcon, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import ThemeSwitcher from './themeSwitcher';
import { Link, useLocation } from 'react-router-dom';

// Elementi del menu principale
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

// Componente Link sicuro che non dipende dal contesto Router
const SafeLink = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => {
  try {
    // Prova a usare il componente Link
    // Genererà un errore se fuori dal contesto Router
    useLocation();
    return <Link to={to} {...props}>{children}</Link>;
  } catch (error) {
    // Fallback a un normale tag anchor
    return <a href={to} {...props}>{children}</a>;
  }
};

// Wrapper sicuro per verificare se siamo in un contesto router
const isInRouterContext = (): boolean => {
  try {
    useLocation();
    return true;
  } catch (error) {
    return false;
  }
};

// Componente per renderizzare in sicurezza contenuti dipendenti dal router
const SafeRouter = ({ children }: { children: React.ReactNode }) => {
  const hasRouterContext = isInRouterContext();
  
  // Per componenti che necessitano di location ma sono renderizzati fuori dal contesto Router
  if (!hasRouterContext) {
    return <Box>{children}</Box>; // Renderizza senza funzionalità dipendenti dal Router
  }
  
  return <>{children}</>; // Renderizza normalmente all'interno del contesto Router
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const user = useSelector(selectUser);
  
  // Ottiene il percorso corrente, con un valore predefinito
  let currentPath = '/';
  try {
    const location = useLocation();
    currentPath = location.pathname;
  } catch (error) {
    // Se useLocation fallisce, usiamo il percorso predefinito
  }
  
  // L'utente è autenticato se esiste l'oggetto user
  const isAuthenticated = !!user;
  
  // Mostra il drawer solo per le rotte autenticate
  const showDrawer = isAuthenticated && 
    currentPath !== '/login' && 
    currentPath !== '/register';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar - sempre visibile */}
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
      
      {/* Drawer laterale - solo per le rotte autenticate */}
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
          <Toolbar /> {/* Crea spazio per l'AppBar */}
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
      
      {/* Contenuto principale */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${showDrawer ? DRAWER_WIDTH : 0}px)` },
          ml: { sm: showDrawer ? `${DRAWER_WIDTH}px` : 0 },
        }}
      >
        <Toolbar /> {/* Crea spazio per l'AppBar */}
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