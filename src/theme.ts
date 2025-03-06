// src/theme.ts
import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: {
    mode: 'light', // puoi creare anche tema dark in seguito
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#ff9800',
    },
  },
})