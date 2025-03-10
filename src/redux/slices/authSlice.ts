import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interfaccia per i dati dell'utente
export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  phone_number?: string | null;
  avatar_url?: string;
  default_currency?: string;
  language?: string;
}

// Interfaccia per lo stato di autenticazione
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isEmailVerified: false,
  isLoading: true,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Gestione del login
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{user: User, isEmailVerified: boolean}>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.isEmailVerified = action.payload.isEmailVerified;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.isEmailVerified = false;
      state.error = action.payload;
    },
    
    // Gestione della registrazione
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{user: User, isEmailVerified: boolean}>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.isEmailVerified = action.payload.isEmailVerified;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Aggiornamento dello stato di verifica dell'email
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;
    },
    
    // Gestione del logout
    logoutStart: (state) => {
      state.isLoading = true;
    },
    logoutSuccess: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.isEmailVerified = false;
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Verifica dello stato di autenticazione
    checkAuthStart: (state) => {
      state.isLoading = true;
    },
    checkAuthSuccess: (state, action: PayloadAction<User | null>) => {
      state.isLoading = false;
      state.isAuthenticated = !!action.payload;
      state.user = action.payload;
      // Se l'utente è loggato, assumiamo che l'email sia verificata
      // Questo può essere sovrascritto successivamente
      state.isEmailVerified = !!action.payload;
    },
    checkAuthFailure: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.isEmailVerified = false;
    },
    
    // Aggiornamento del profilo utente
    updateProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<Partial<User>>) => {
      state.isLoading = false;
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
      state.error = null;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Reset dello stato degli errori
    clearErrors: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  setEmailVerified,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  checkAuthStart,
  checkAuthSuccess,
  checkAuthFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  clearErrors,
} = authSlice.actions;

// Selettori
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsEmailVerified = (state: { auth: AuthState }) => state.auth.isEmailVerified;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;