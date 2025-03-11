import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountIcon,
  Receipt as ReceiptIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  AssignmentTurnedIn as BudgetIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';

interface SidebarProps {
  onMenuItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Define navigation items
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Gruppi', path: '/groups', icon: <GroupIcon /> },
    { label: 'Transazioni', path: '/transactions', icon: <ReceiptIcon /> },
    { label: 'Conti', path: '/accounts', icon: <AccountIcon /> },
    { label: 'Budget', path: '/budgets', icon: <BudgetIcon /> },
    { label: 'Categorie', path: '/categories', icon: <CategoryIcon /> },
  ];

  const bottomMenuItems = [
    { label: 'Impostazioni', path: '/settings', icon: <SettingsIcon /> },
    { label: 'Aiuto', path: '/help', icon: <HelpIcon /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onMenuItemClick) {
      onMenuItemClick();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* User profile section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <Avatar
          src={user?.avatar_url || undefined}
          alt={user?.display_name || 'User'}
          sx={{ width: 64, height: 64 }}
        >
          {user?.display_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="body1" fontWeight="bold" noWrap>
          {user?.display_name || user?.username || 'Guest'}
        </Typography>
      </Box>

      <Divider />

      {/* Main navigation items */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={item.label} placement="right" arrow>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Bottom navigation items */}
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={item.label} placement="right" arrow>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
