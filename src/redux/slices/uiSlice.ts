import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interfacce per il tipo di alert
interface Alert {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  autoHideDuration?: number;
}

interface AlertPayload {
  type: Alert['type'];
  message: string;
  autoHideDuration?: number;
}

interface LoadingPayload {
  key: string;
  isLoading: boolean;
}

// Interfaccia per lo stato UI
interface UiState {
  theme: 'light' | 'dark';
  language: string;
  sidebarOpen: boolean;
  loading: Record<string, boolean>;
  alerts: Alert[];
}

// Stato iniziale dell'interfaccia utente
const initialState: UiState = {
  theme: 'light', // 'light' o 'dark'
  language: 'it', // Lingua predefinita: italiano
  sidebarOpen: false, // Stato della sidebar su mobile
  loading: {}, // Stato di caricamento per diverse operazioni
  alerts: [], // Array di alert/notifiche UI da mostrare
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Gestione del tema
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    // Gestione della lingua
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    
    // Gestione della sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Gestione degli stati di caricamento
    setLoading: (state, action: PayloadAction<LoadingPayload>) => {
      state.loading = {
        ...state.loading,
        [action.payload.key]: action.payload.isLoading,
      };
    },
    
    // Gestione degli alert
    addAlert: (state, action: PayloadAction<AlertPayload>) => {
      state.alerts.push({
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        autoHideDuration: action.payload.autoHideDuration || 6000,
      });
    },
    removeAlert: (state, action: PayloadAction<number>) => {
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addAlert,
  removeAlert,
} = uiSlice.actions;

export default uiSlice.reducer;