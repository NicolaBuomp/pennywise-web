import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../lib/api';
import {ProfileDto} from '../../types/profile';

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

// Ottiene il profilo dell'utente corrente
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, {rejectWithValue}) => {
        try {
            return await api.get<ProfileDto>('/profiles');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Aggiorna il profilo dell'utente
export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData: Partial<ProfileDto>, {rejectWithValue}) => {
        try {
            return await api.put<ProfileDto>('/profiles', profileData);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Carica l'avatar dell'utente
export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async (file: File, {rejectWithValue}) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.post<{ avatarUrl: string }>('/profiles/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.avatarUrl;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Assicura che il profilo esista (utile durante il primo accesso)
export const ensureProfile = createAsyncThunk(
    'profile/ensureProfile',
    async (_, {rejectWithValue}) => {
        try {
            return await api.post<ProfileDto>('/profiles/ensure');
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