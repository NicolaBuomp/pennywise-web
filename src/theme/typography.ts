import { TypographyOptions } from '@mui/material/styles/createTypography';

// Configurazione della tipografia per l'applicazione Pennywise
const typography: TypographyOptions = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem', // 40px
    lineHeight: 1.2,
  },
  h2: {
    fontWeight: 700,
    fontSize: '2rem', // 32px
    lineHeight: 1.3,
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.5rem', // 24px
    lineHeight: 1.4,
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.25rem', // 20px
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.125rem', // 18px
    lineHeight: 1.5,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57,
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57,
  },
  button: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57,
    fontWeight: 600,
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
};

export default typography;