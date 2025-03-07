// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// Tema Light
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // colore primario personalizzato
    },
    secondary: {
      main: '#dc004e',
    },
    // altre personalizzazioni...
  },
});

// Tema Dark
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // colore primario per dark mode
    },
    secondary: {
      main: '#f48fb1',
    },
    // altre personalizzazioni...
  },
});
