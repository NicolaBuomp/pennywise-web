import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Divider, Tooltip, 
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Gruppi', icon: <PeopleIcon />, path: '/groups' },
  { text: 'Spese', icon: <ReceiptIcon />, path: '/expenses' },
  { text: 'Saldi', icon: <PaymentIcon />, path: '/balances' },
  { text: 'Liste della Spesa', icon: <ShoppingCartIcon />, path: '/shopping-lists' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isSmallScreen) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Box sx={{ p: 2 }}>
        <img 
          src="/logo.svg" 
          alt="PennyWise Logo" 
          style={{ 
            width: '100%', 
            maxWidth: '180px', 
            display: 'block',
            margin: '0 auto'
          }} 
        />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={item.text} placement="right" arrow>
              <ListItemButton 
                selected={pathname === item.path}
                onClick={() => handleItemClick(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List>
        <ListItem disablePadding>
          <Tooltip title="Impostazioni" placement="right" arrow>
            <ListItemButton onClick={() => handleItemClick('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Impostazioni" />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            background: theme.palette.background.paper,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
