import { PaletteOptions } from '@mui/material';

// Palette personalizzata per l'applicazione Pennywise
const palette: PaletteOptions = {
  primary: {
    main: '#2E7D32', // Verde come colore principale per richiamare il tema del denaro
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF8F00', // Arancione come colore secondario
    light: '#FFA726',
    dark: '#EF6C00',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#FFC107',
    light: '#FFECB3',
    dark: '#FFA000',
  },
  info: {
    main: '#0288D1',
    light: '#4FC3F7',
    dark: '#01579B',
  },
  success: {
    main: '#2E7D32',
    light: '#A5D6A7',
    dark: '#1B5E20',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  background: {
    default: '#F9F9F9',
    paper: '#FFFFFF',
  },
};

export default palette;