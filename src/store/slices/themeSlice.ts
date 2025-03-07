// src/store/slices/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Extended theme state
interface ThemeState {
  mode: ThemeMode;
  systemIsDark: boolean;
  fontSize: number;
}

// Get initial values from localStorage if available
const getInitialMode = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode as ThemeMode || 'system';
  }
  return 'system';
};

// Detect system preference
const detectSystemTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const initialState: ThemeState = {
  mode: getInitialMode(),
  systemIsDark: detectSystemTheme(),
  fontSize: 16,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeMode', action.payload);
      }
    },
    
    toggleDarkMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeMode', state.mode);
      }
    },
    
    setSystemTheme: (state, action: PayloadAction<boolean>) => {
      state.systemIsDark = action.payload;
    },
    
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    
    increaseFontSize: (state) => {
      state.fontSize = Math.min(state.fontSize + 1, 24);
    },
    
    decreaseFontSize: (state) => {
      state.fontSize = Math.max(state.fontSize - 1, 12);
    },
  },
});

// Export actions
export const {
  setThemeMode,
  toggleDarkMode,
  setSystemTheme,
  setFontSize,
  increaseFontSize,
  decreaseFontSize,
} = themeSlice.actions;

// Selectors
export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectIsDarkMode = (state: RootState) => 
  state.theme.mode === 'dark' || (state.theme.mode === 'system' && state.theme.systemIsDark);
export const selectFontSize = (state: RootState) => state.theme.fontSize;

export default themeSlice.reducer;
