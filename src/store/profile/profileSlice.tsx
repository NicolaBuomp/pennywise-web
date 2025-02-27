import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../lib/api';
import {ProfileDto} from '../../types/profile';
import {supabase} from '../../lib/supabase';

interface ProfileState {
    data: ProfileDto | null;
    loading: boolean;
    error: string | null;
    updateSuccess: boolean;
}

const initialState: ProfileState = {
    data: null,
    loading: false,
    error: null,
    updateSuccess: false
};

// Funzione helper per ottenere il token di accesso
const getAccessToken = async () => {
    let {data: {session}, error} = await supabase.auth.getSession();

    // Se la sessione è assente o il token scaduto, prova a rinfrescare
    if (!session || error) {
        const {data, error: refreshError} = await supabase.auth.refreshSession();
        if (refreshError) {
            console.error("Errore nel refresh del token:", refreshError);
            throw refreshError;
        }
        session = data.session;
    }

    return session?.access_token;
};

export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, {rejectWithValue}) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                throw new Error('Nessun token di accesso disponibile');
            }

            const response = await api.get<ProfileDto>('/profiles', {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData: Partial<ProfileDto>, {rejectWithValue}) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                throw new Error('Nessun token di accesso disponibile');
            }

            return await api.put<ProfileDto>('/profiles', profileData, {
                headers: {Authorization: `Bearer ${token}`}
            });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async (file: File, {rejectWithValue}) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                throw new Error('Nessun token di accesso disponibile');
            }

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.post<{ avatarUrl: string }>('/profiles/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            return response.avatarUrl;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const ensureProfile = createAsyncThunk(
    'profile/ensureProfile',
    async (_, {rejectWithValue, dispatch}) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                throw new Error('Nessun token di accesso disponibile');
            }

            const result = await api.post<ProfileDto>('/profiles/ensure', {}, {
                headers: {Authorization: `Bearer ${token}`}
            });

            // Import setProfileInitialized here to avoid circular dependency
            const {setProfileInitialized} = require('../auth/authSlice');
            dispatch(setProfileInitialized(true));

            return result;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        resetProfileErrors: (state) => {
            state.error = null;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchProfile
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // updateProfile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.updateSuccess = false;
            })

            // uploadAvatar
            .addCase(uploadAvatar.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.loading = false;
                if (state.data) {
                    state.data.avatarUrl = action.payload;
                }
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ensureProfile
            .addCase(ensureProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(ensureProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(ensureProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const {resetProfileErrors, resetUpdateSuccess} = profileSlice.actions;
export default profileSlice.reducer;