import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import './index.css';
import './styles/animations.css';
import { selectTheme } from './store/theme/themeSlice';

// Componente wrapper per gestire il tema con Redux
const ThemedApp = () => {
    const themeMode = useSelector(selectTheme);
    return (
        <ThemeProvider theme={themeMode === "dark" ? darkTheme : lightTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ThemedApp />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
