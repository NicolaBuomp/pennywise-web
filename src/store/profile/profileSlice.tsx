import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../lib/api';
import {RootState} from '../store';

// Interfaccia per il tipo ProfileDto
export interface ProfileDto {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

// Interfaccia per la risposta dell'API quando si carica l'avatar
interface AvatarResponse {
    avatar_url: string;
}

// Interfaccia per lo stato del profilo
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
    updateSuccess: false,
};

// Helper per gestire gli errori in modo consistente
const handleProfileError = (error: any): string => {
    console.error('Profile operation error:', error);
    return error.response?.data?.message || error.message || 'Si è verificato un errore durante l\'operazione';
};

export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, {rejectWithValue}) => {
        try {
            const response = await api.get<ProfileDto>('/profiles/me');
            return response;
        } catch (error: any) {
            return rejectWithValue(handleProfileError(error));
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData: Partial<ProfileDto>, {rejectWithValue}) => {
        try {
            const response = await api.put<ProfileDto>('/profiles/me', profileData);
            return response;
        } catch (error: any) {
            return rejectWithValue(handleProfileError(error));
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'profile/uploadAvatar',
    async (file: File, {rejectWithValue}) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<AvatarResponse>('/profiles/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.avatar_url;
        } catch (error: any) {
            return rejectWithValue(handleProfileError(error));
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
        },
        clearProfileState: () => initialState,
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
                state.error = null;
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
                state.error = null;
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
                    state.data.avatar_url = action.payload;
                }
                state.error = null;
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// Selettori
export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoading = (state: RootState) => state.profile.loading;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectUpdateSuccess = (state: RootState) => state.profile.updateSuccess;
export const selectFullName = (state: RootState) => {
    const profile = state.profile.data;
    if (!profile) return '';
    return `${profile.first_name} ${profile.last_name}`;
};
export const selectAvatarUrl = (state: RootState) => state.profile.data?.avatar_url;

export const {resetProfileErrors, resetUpdateSuccess, clearProfileState} = profileSlice.actions;
export default profileSlice.reducer;