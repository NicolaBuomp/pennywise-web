import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme/theme';
import { Container } from '@mui/material';
import AppRoutes from './routes';
import { useSelector } from 'react-redux';
import { selectIsDarkMode } from './store/slices/themeSlice';
import ThemeSwitcher from './components/layout/themeSwitcher';

function App() {
  const isDarkMode = useSelector(selectIsDarkMode);
  
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      {/* CssBaseline per normalizzare gli stili di default */}
      <CssBaseline />
      <Container>
        {/* Switch per il cambio tema */}
        <ThemeSwitcher />
        {/* Renderizza le rotte dell'app */}
        <AppRoutes />
      </Container>
    </ThemeProvider>
  );
}

export default App;
