import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {supabase} from '../../lib/supabase';
import {RootState} from '../store';

// Definisci interfacce più dettagliate per i tipi di dati
interface AuthUser {
    id: string;
    email: string;
    user_metadata: {
        first_name?: string;
        last_name?: string;
        phone_number?: string;
        avatar_url?: string;
    };
    app_metadata: {
        provider?: string;
        [key: string]: any;
    };
    aud: string;
    created_at: string;
    updated_at?: string;

    [key: string]: any; // Per eventuali campi aggiuntivi
}

interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: AuthUser;

    [key: string]: any; // Per eventuali campi aggiuntivi
}

interface AuthResponse {
    user: AuthUser | null;
    session: AuthSession | null;
}

interface AuthState {
    user: AuthUser | null;
    session: AuthSession | null;
    loading: boolean;
    error: string | null;
    profileInitialized: boolean;
}

const initialState: AuthState = {
    user: null,
    session: null,
    loading: false,
    error: null,
    profileInitialized: false
};

// Helper per gestire gli errori in modo consistente
const handleAuthError = (error: any): string => {
    console.error('Auth error:', error);

    // Personalizza i messaggi di errore per migliorare l'esperienza utente
    if (error.message?.includes('Invalid login credentials')) {
        return 'Credenziali non valide. Controlla email e password.';
    }

    if (error.message?.includes('Email not confirmed')) {
        return 'Email non confermata. Verifica la tua casella di posta per il link di conferma.';
    }

    return error.message || 'Si è verificato un errore durante l\'autenticazione';
};

export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({email, password}: { email: string; password: string }, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({email, password});
            if (error) return rejectWithValue(handleAuthError(error));
            return data;
        } catch (error: any) {
            return rejectWithValue(handleAuthError(error));
        }
    }
);

export const signInWithGoogle = createAsyncThunk(
    'auth/signInWithGoogle',
    async (_, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) return rejectWithValue(handleAuthError(error));
            return data;
        } catch (error: any) {
            return rejectWithValue(handleAuthError(error));
        }
    }
);

export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({
               email,
               password,
               first_name,
               last_name,
               phone_number
           }: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone_number?: string;
    }, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name,
                        last_name,
                        phone_number: phone_number || null
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) return rejectWithValue(handleAuthError(error));

            return data;
        } catch (error: any) {
            return rejectWithValue(handleAuthError(error));
        }
    }
);

export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, {rejectWithValue}) => {
        try {
            const {error} = await supabase.auth.signOut();
            if (error) return rejectWithValue(handleAuthError(error));
            return null;
        } catch (error: any) {
            return rejectWithValue(handleAuthError(error));
        }
    }
);

export const getSession = createAsyncThunk(
    'auth/getSession',
    async (_, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.getSession();
            if (error) return rejectWithValue(handleAuthError(error));
            return data;
        } catch (error: any) {
            console.error('getSession error:', error);
            return rejectWithValue(handleAuthError(error));
        }
    }
);

export const refreshSession = createAsyncThunk(
    'auth/refreshSession',
    async (_, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.refreshSession();
            if (error) return rejectWithValue(handleAuthError(error));
            return data;
        } catch (error: any) {
            console.error('refreshSession error:', error);
            return rejectWithValue(handleAuthError(error));
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthError: (state) => {
            state.error = null;
        },
        setProfileInitialized: (state, action: PayloadAction<boolean>) => {
            state.profileInitialized = action.payload;
        },
        clearAuthState: () => initialState
    },
    extraReducers: (builder) => {
        builder
            // Sign In
            .addCase(signIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signIn.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.session = action.payload.session;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Sign In with Google
            .addCase(signInWithGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInWithGoogle.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(signInWithGoogle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Sign Up
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.session = action.payload.session;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Sign Out
            .addCase(signOut.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signOut.fulfilled, (state) => {
                return initialState; // Reset completo dello stato
            })
            .addCase(signOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Session
            .addCase(getSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSession.fulfilled, (state, action) => {
                state.loading = false;
                state.session = action.payload.session;
                state.user = action.payload.session?.user ?? null;
            })
            .addCase(getSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Refresh Session
            .addCase(refreshSession.pending, (state) => {
                // Non impostiamo loading a true per evitare caricamenti visibili
                state.error = null;
            })
            .addCase(refreshSession.fulfilled, (state, action) => {
                state.session = action.payload.session;
                state.user = action.payload.session?.user ?? null;
            })
            .addCase(refreshSession.rejected, (state, action) => {
                state.error = action.payload as string;
                // Se il refresh fallisce, potremmo voler pulire la sessione
                if (action.payload?.includes('expired')) {
                    state.session = null;
                    state.user = null;
                }
            });
    }
});

// Selettori
export const selectUser = (state: RootState) => state.auth.user;
export const selectSession = (state: RootState) => state.auth.session;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.session;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectProfileInitialized = (state: RootState) => state.auth.profileInitialized;

export const {resetAuthError, setProfileInitialized, clearAuthState} = authSlice.actions;
export default authSlice.reducer;