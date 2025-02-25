import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface Group {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
}

interface GroupsState {
    groups: Group[];
    currentGroup: Group | null;
    members: any[];
    invites: any[];
    loading: boolean;
    error: string | null;
}

const initialState: GroupsState = {
    groups: [],
    currentGroup: null,
    members: [],
    invites: [],
    loading: false,
    error: null
};

export const fetchGroups = createAsyncThunk(
    'groups/fetchGroups',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/groups');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createGroup = createAsyncThunk(
    'groups/createGroup',
    async (name: string, { rejectWithValue }) => {
        try {
            const response = await api.post('/groups', { name });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchGroupMembers = createAsyncThunk(
    'groups/fetchGroupMembers',
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/groups/${groupId}/members`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createInvite = createAsyncThunk(
    'groups/createInvite',
    async ({ groupId, inviteeEmail, role }: { groupId: string; inviteeEmail: string; role?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/groups/${groupId}/invite`, { groupId, inviteeEmail, role });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchSentInvites = createAsyncThunk(
    'groups/fetchSentInvites',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/groups/my-invites');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const acceptInvite = createAsyncThunk(
    'groups/acceptInvite',
    async (inviteId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(`/groups/invite/accept/${inviteId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        setCurrentGroup: (state, action) => {
            state.currentGroup = action.payload;
        },
        resetGroupsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(createGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.groups.push(action.payload);
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchGroupMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.members = action.payload;
            })
            .addCase(fetchGroupMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(createInvite.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createInvite.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createInvite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchSentInvites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSentInvites.fulfilled, (state, action) => {
                state.loading = false;
                state.invites = action.payload;
            })
            .addCase(fetchSentInvites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(acceptInvite.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(acceptInvite.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(acceptInvite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { setCurrentGroup, resetGroupsError } = groupsSlice.actions;
export default groupsSlice.reducer;