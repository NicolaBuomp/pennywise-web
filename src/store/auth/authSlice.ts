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

// export const signUp = createAsyncThunk(
//     'auth/signUp',
//     async ({
//                email,
//                password,
//                firstName,
//                lastName,
//                phoneNumber
//            }: {
//         email: string;
//         password: string;
//         firstName?: string;
//         lastName?: string;
//         phoneNumber?: string;
//     }, {rejectWithValue}) => {
//         try {
//             // 1. Registriamo l'utente
//             const {data, error} = await supabase.auth.signUp({
//                 email,
//                 password,
//                 options: {
//                     emailRedirectTo: `${window.location.origin}/auth/callback`,
//                     data: {
//                         first_name: firstName,
//                         last_name: lastName,
//                         phone: phoneNumber
//                     }
//                 }
//             });
//
//             if (error) throw error;
//
//             // 2. Se abbiamo dati del profilo, tentiamo di creare manualmente il profilo
//             if (data.user && (firstName || lastName || phoneNumber)) {
//                 try {
//                     // Utilizziamo direttamente l'API Supabase per inserire il profilo
//                     const {error: profileError} = await supabase
//                         .from('profiles')
//                         .upsert({
//                             id: data.user.id,
//                             first_name: firstName || '',
//                             last_name: lastName || '',
//                             display_name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
//                             phone_number: phoneNumber || '',
//                             created_at: new Date().toISOString(),
//                             updated_at: new Date().toISOString()
//                         });
//
//                     if (profileError) {
//                         console.error('Errore nella creazione del profilo:', profileError);
//                     }
//                 } catch (profileErr) {
//                     console.error('Errore nella creazione del profilo:', profileErr);
//                     // Non facciamo fallire la registrazione se il profilo non è creato
//                 }
//             }
//
//             return data;
//         } catch (error: any) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({
               email,
               password
           }: {
        email: string;
        password: string;
    }, {rejectWithValue}) => {
        try {
            // Solo registrazione base per verificare se il problema è nei metadati
            const {data, error} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
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
            });
    }
});

export const {resetAuthError} = authSlice.actions;
export default authSlice.reducer;