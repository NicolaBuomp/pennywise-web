import { createTheme, ThemeOptions } from '@mui/material/styles';

// Opzioni per il tema chiaro
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#F97A6B', // Primario
    },
    secondary: {
      main: '#D06E68', // Secondario
    },
    background: {
      default: '#F0F2F5', // Sfondo principale
      paper: '#FFFFFF', // Superfici
    },
    text: {
      primary: '#1A1C21', // Testo principale
      secondary: '#555A66', // Testo secondario
    },
    divider: '#D0D2E3', // Bordo
  },
  shape: {
    borderRadius: 12, // Angoli arrotondati
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Effetto glassmorphism
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Evita lettere maiuscole forzate
          borderRadius: 8,
        },
      },
    },
  },
};

// Opzioni per il tema scuro
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF8A7E', // Primario
    },
    secondary: {
      main: '#E56E74', // Secondario
    },
    background: {
      default: '#121419', // Sfondo principale
      paper: '#1E2029', // Superfici
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8B97C3',
    },
    divider: '#3B3C4A', // Bordo
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 32, 41, 0.7)', // Effetto glassmorphism scuro
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
};

// Creazione dei temi
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
