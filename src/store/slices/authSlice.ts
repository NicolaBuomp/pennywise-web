// src/store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';
import { User } from '@supabase/supabase-js';
import { RootState } from '../index';

// Thunk per il login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
);

// Thunk per registrazione
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, firstName, lastName }: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string 
  }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://tuo-dominio.com/confirm', // il tuo URL di redirect
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    if (error) return rejectWithValue(error.message);
    return data;
  }
);

// Thunk per logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await supabase.auth.signOut();
  }
);

// Stato iniziale
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading?: boolean;
  error?: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Slice Redux
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Errore login";
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Errore registrazione";
      })
      // Logout case
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { login, logout, setUser, clearError } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;