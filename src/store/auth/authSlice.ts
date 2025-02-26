import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {supabase} from '../../lib/supabase';

interface AuthState {
    user: any | null;
    session: any | null;
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

export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({email, password}: { email: string; password: string }, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({email, password});
            if (error) throw error;
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
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
            if (error) throw error;
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({email, password}: { email: string; password: string }, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, {rejectWithValue}) => {
        try {
            const {error} = await supabase.auth.signOut();
            if (error) throw error;
            return null;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getSession = createAsyncThunk(
    'auth/getSession',
    async (_, {rejectWithValue}) => {
        try {
            const {data, error} = await supabase.auth.getSession();
            if (error) throw error;
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Nuova azione per inizializzare il profilo utente
export const initializeUserProfile = createAsyncThunk(
    'auth/initializeUserProfile',
    async ({userId, firstName, lastName, phoneNumber}: {
        userId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
    }, {rejectWithValue}) => {
        try {
            // Attendiamo un momento per essere sicuri che l'utente sia completamente creato
            await new Promise(resolve => setTimeout(resolve, 1000));

            const {error} = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('Error initializing profile:', error);
                throw error;
            }

            return {firstName, lastName, phoneNumber};
        } catch (error: any) {
            console.error('Error in initializeUserProfile thunk:', error);
            return rejectWithValue(error.message || 'Failed to initialize user profile');
        }
    }
);

// Service role/Admin API per inizializzare/aggiornare un profilo
export const adminUpdateProfile = createAsyncThunk(
    'auth/adminUpdateProfile',
    async ({userId, userData}: { userId: string; userData: any }, {rejectWithValue}) => {
        try {
            // Usa l'API di servizio per aggiornare/creare profilo
            // Richiede una funzione serverless o una chiamata al backend sicura
            const {error} = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    ...userData,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            return userData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthError: (state) => {
            state.error = null;
        }
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
            })
            .addCase(signOut.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.session = null;
                state.profileInitialized = false;
            })
            .addCase(signOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Session
            .addCase(getSession.pending, (state) => {
                state.loading = true;
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

            // Initialize User Profile
            .addCase(initializeUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(initializeUserProfile.fulfilled, (state) => {
                state.loading = false;
                state.profileInitialized = true;
            })
            .addCase(initializeUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = `Errore nell'inizializzazione del profilo: ${action.payload as string}`;
            });
    }
});

export const {resetAuthError} = authSlice.actions;
export default authSlice.reducer;