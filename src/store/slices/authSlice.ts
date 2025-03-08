import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';
import { User, Session } from '@supabase/supabase-js';
import { RootState } from '../index';

// Types
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

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  loading: false,
  error: null,
  registrationSuccess: false,
  emailVerificationSent: false,
};

// Check for existing session
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

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Handle specific Supabase error codes
        if (error.message.includes('Email not confirmed')) {
          // This is thrown when the email hasn't been verified yet
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

// Register thunk
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
      
      // Check if email confirmation is required (it usually is)
      // If data.session is null but data.user exists, it means email confirmation is required
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

// Logout thunk
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

// Auth slice
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
      // Check session
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
      
      // Login cases
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
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
        state.emailVerificationSent = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // If email confirmation is required
        if (action.payload.emailConfirmationRequired) {
          state.emailVerificationSent = true;
          state.registrationSuccess = true;
          // Don't authenticate yet - user needs to verify email
        } 
        // If immediate login is allowed (rare with Supabase defaults)
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
      
      // Logout case
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
      });
  },
});

// Export actions
export const { clearError, resetRegistrationSuccess, resetEmailVerificationSent } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectSession = (state: RootState) => state.auth.session;
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
export const selectRegistrationSuccess = (state: RootState) => state.auth.registrationSuccess;
export const selectEmailVerificationSent = (state: RootState) => state.auth.emailVerificationSent;

export default authSlice.reducer;