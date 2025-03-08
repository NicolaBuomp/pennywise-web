// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';
import { User, Session } from '@supabase/supabase-js';
import { RootState } from '../index';

// Definizione dei tipi
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
  emailVerificationSent: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Stato iniziale
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  loading: false,
  error: null,
  registrationSuccess: false,
  emailVerificationSent: false,
};

// Thunk per verificare la sessione esistente
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to check session');
    }
  }
);

// Thunk per il login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Gestione specifica per errore di email non verificata
        if (error.message.includes('Email not confirmed')) {
          return rejectWithValue('Please check your email for the verification link before logging in.');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

// Thunk per la registrazione
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, firstName, lastName }: RegisterCredentials, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) throw error;
      
      // Verifica se è richiesta la conferma email
      const emailConfirmationRequired = data.user && !data.session;
      
      return {
        ...data,
        emailConfirmationRequired
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

// Thunk per il logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

// Slice di autenticazione
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetRegistrationSuccess(state) {
      state.registrationSuccess = false;
    },
    resetEmailVerificationSent(state) {
      state.emailVerificationSent = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Gestione del controllo sessione
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.session) {
          state.isAuthenticated = true;
          state.session = action.payload.session;
          state.user = action.payload.session.user;
        }
      })
      .addCase(checkSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.session = null;
        state.user = null;
      })
      
      // Gestione del login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Gestione della registrazione
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
        state.emailVerificationSent = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Se è richiesta la conferma email
        if (action.payload.emailConfirmationRequired) {
          state.emailVerificationSent = true;
          state.registrationSuccess = true;
          // Non autenticare ancora - l'utente deve verificare l'email
        } 
        // Se è consentito l'accesso immediato (raro con le impostazioni predefinite di Supabase)
        else if (action.payload.session) {
          state.isAuthenticated = true;
          state.session = action.payload.session;
          state.user = action.payload.user;
          state.registrationSuccess = true;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Gestione del logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
      });
  },
});

// Esportazione delle azioni
export const { clearError, resetRegistrationSuccess, resetEmailVerificationSent } = authSlice.actions;

// Selettori
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectSession = (state: RootState) => state.auth.session;
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
export const selectRegistrationSuccess = (state: RootState) => state.auth.registrationSuccess;
export const selectEmailVerificationSent = (state: RootState) => state.auth.emailVerificationSent;

export default authSlice.reducer;