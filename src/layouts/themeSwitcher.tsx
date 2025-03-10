import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import { 
  ToggleButtonGroup, 
  ToggleButton,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { selectThemeMode, selectIsDarkMode, setSystemTheme, ThemeMode, setThemeMode } from '@/redux/slices/themeSlice';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector(selectThemeMode);
  const isDarkMode = useSelector(selectIsDarkMode);
  const theme = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemTheme(e.matches));
    };

    dispatch(setSystemTheme(mediaQuery.matches));
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [dispatch]);

  const handleThemeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ThemeMode | null
  ) => {
    if (newMode !== null) {
      dispatch(setThemeMode(newMode));
    }
  };

  return (
    <Box 
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1
      }}
    >
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={handleThemeChange}
        aria-label="theme mode"
        size="small"
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          '& .MuiToggleButtonGroup-grouped': {
            margin: 0.5,
            border: 0,
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              }
            },
          },
        }}
      >
        <ToggleButton value="light" aria-label="light theme">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Light
            </Typography>
          </Box>
        </ToggleButton>
        
        <ToggleButton value="dark" aria-label="dark theme">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Dark
            </Typography>
          </Box>
        </ToggleButton>
        
        <ToggleButton value="system" aria-label="system theme">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              System
            </Typography>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ThemeSwitcher;
