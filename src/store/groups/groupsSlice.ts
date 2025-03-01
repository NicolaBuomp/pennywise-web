import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import api from "../../lib/api";
import {RootState} from "../store";

// 📌 Interfacce per i tipi di dati
export interface User {
    id: string;
    full_name: string;
    role?: string;
    avatar_url?: string;
    joined_at: string;
    phone_number: string;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'denied';

export interface JoinRequest {
    id: string;
    status: JoinRequestStatus;
    created_at: string;
    user?: User;
    user_id?: string;
    group_id?: string;
}

export interface Group {
    id: string;
    name: string;
    tag: string;
    require_password: boolean;
    created_at: string;
    userRole?: string;
    adminId?: string;
    members?: User[];
    join_requests?: JoinRequest[];
    members_count?: number;
}

export type GroupsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface GroupsState {
    groups: Group[];
    currentGroup: Group | null;
    status: GroupsStatus;
    error: string | null;
}

// Stato iniziale
const initialState: GroupsState = {
    groups: [],
    currentGroup: null,
    status: 'idle',
    error: null,
};

// 📌 Helper per gli errori
const handleGroupsError = (error: any, defaultMessage: string): string => {
    console.error(`Groups operation error (${defaultMessage}):`, error);
    return error.response?.data?.message || error.message || defaultMessage;
};

// Reducer helpers
const pendingReducer = (state: GroupsState) => {
    state.status = 'loading';
    state.error = null;
};

const rejectedReducer = (state: GroupsState, action: PayloadAction<unknown>) => {
    state.status = 'failed';
    state.error = typeof action.payload === 'string' ? action.payload : "Errore sconosciuto";
};

// ─────────────────────────────────────────────────────────────────────────────
// 📌 Azioni asincrone
// ─────────────────────────────────────────────────────────────────────────────

// 🔹 Recupera i gruppi dell'utente
export const fetchGroups = createAsyncThunk(
    'groups/fetchGroups',
    async (_, {rejectWithValue}) => {
        try {
            return await api.get('/groups/my');

        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile recuperare i gruppi'));
        }
    }
);

// 🔹 Cerca un gruppo tramite TAG
export const searchGroupByTag = createAsyncThunk(
    'groups/searchGroupByTag',
    async (tag: string, {rejectWithValue}) => {
        try {
            return await api.get(`/groups/tag/${tag}`);
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Gruppo non trovato'));
        }
    }
);

// 🔹 Crea un nuovo gruppo e aggiorna i gruppi
export const createGroup = createAsyncThunk(
    'groups/createGroup',
    async (
        groupData: {
            name: string;
            tag: string;
            requirePassword?: boolean;
            password?: string;
        },
        {dispatch, rejectWithValue}
    ) => {
        try {
            await api.post('/groups', groupData);
            dispatch(fetchGroups()); // Aggiorna lo store
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile creare il gruppo'));
        }
    }
);

// 🔹 Recupera i dettagli di un singolo gruppo
export const fetchGroupDetails = createAsyncThunk(
    'groups/fetchGroupDetails',
    async (groupId: string, {rejectWithValue}) => {
        try {
            return await api.get(`/groups/${groupId}`);
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile recuperare i dettagli del gruppo'));
        }
    }
);

// 🔹 Aggiorna un gruppo (nome, descrizione...) e poi fetchGroups
export const updateGroup = createAsyncThunk(
    'groups/updateGroup',
    async (
        {
            groupId,
            groupData,
        }: {
            groupId: string;
            groupData: Partial<Pick<Group, 'name' | 'tag' | 'description'>>;
        },
        {dispatch, rejectWithValue}
    ) => {
        try {
            await api.put(`/groups/${groupId}`, groupData);
            dispatch(fetchGroups());
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile aggiornare il gruppo'));
        }
    }
);

// 🔹 Elimina un gruppo e aggiorna i gruppi
export const deleteGroup = createAsyncThunk(
    'groups/deleteGroup',
    async (groupId: string, {dispatch, rejectWithValue}) => {
        try {
            await api.delete(`/groups/${groupId}`);
            dispatch(fetchGroups());
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile eliminare il gruppo'));
        }
    }
);

// 🔹 Rimuove un membro e aggiorna i gruppi
export const removeMember = createAsyncThunk(
    'groups/removeMember',
    async (
        {groupId, userId}: { groupId: string; userId: string },
        {dispatch, rejectWithValue}
    ) => {
        try {
            await api.delete(`/groups/${groupId}/remove-user/${userId}`);
            dispatch(fetchGroups());
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile rimuovere il membro'));
        }
    }
);

// 🔹 Invia una richiesta di ingresso (ex requestJoinGroup)
export const requestJoinGroup = createAsyncThunk(
    'groups/requestJoinGroup',
    async (tag: string, {dispatch, rejectWithValue}) => {
        try {
            await api.post(`/groups/join/${tag}`);
            dispatch(fetchGroups());
        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile richiedere di entrare nel gruppo'));
        }
    }
);

// 🔹 Azione generica per approvare/rifiutare una richiesta di ingresso
export const handleJoinRequest = createAsyncThunk(
    'groups/handleJoinRequest',
    async (
        {
            groupId,
            requestId,
            status,
        }: { groupId: string; requestId: string; status: 'approved' | 'denied' },
        {dispatch, rejectWithValue}
    ) => {
        try {
            await api.patch(`/groups/${groupId}/join-requests/${requestId}`, {status});
            dispatch(fetchGroups());
        } catch (error) {
            return rejectWithValue(
                handleGroupsError(
                    error,
                    `Impossibile ${status === 'approved' ? 'approvare' : 'rifiutare'} la richiesta`
                )
            );
        }
    }
);

// 🔹 Wrapper: approva la richiesta
export const approveJoinRequest = createAsyncThunk(
    'groups/approveJoinRequest',
    async (
        {groupId, requestId}: { groupId: string; requestId: string },
        {dispatch, rejectWithValue}
    ) => {
        try {
            await dispatch(handleJoinRequest({groupId, requestId, status: 'approved'})).unwrap();
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// 🔹 Wrapper: rifiuta la richiesta
export const denyJoinRequest = createAsyncThunk(
    'groups/denyJoinRequest',
    async (
        {groupId, requestId}: { groupId: string; requestId: string },
        {dispatch, rejectWithValue}
    ) => {
        try {
            await dispatch(handleJoinRequest({groupId, requestId, status: 'denied'})).unwrap();
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// 🔹 Se vuoi fetchare direttamente le joinRequests
export const fetchJoinRequests = createAsyncThunk(
    'groups/fetchJoinRequests',
    async (groupId: string, {rejectWithValue}) => {
        try {
            return await api.get(`/groups/${groupId}/join-requests`);

        } catch (error) {
            return rejectWithValue(handleGroupsError(error, 'Impossibile recuperare le richieste di ingresso'));
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// 📌 Slice Redux
// ─────────────────────────────────────────────────────────────────────────────
const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        resetCurrentGroup: (state) => {
            state.currentGroup = null;
        },
        resetGroupsError: (state) => {
            state.error = null;
        },
        clearGroupsState: () => initialState,
    },
    extraReducers: (builder) => {
        // fetchGroups
        builder
            .addCase(fetchGroups.pending, pendingReducer)
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.groups = action.payload;
            })
            .addCase(fetchGroups.rejected, rejectedReducer);

        // searchGroupByTag
        builder
            .addCase(searchGroupByTag.pending, pendingReducer)
            .addCase(searchGroupByTag.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(searchGroupByTag.rejected, rejectedReducer);

        // createGroup
        builder
            .addCase(createGroup.pending, pendingReducer)
            .addCase(createGroup.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(createGroup.rejected, rejectedReducer);

        // fetchGroupDetails
        builder
            .addCase(fetchGroupDetails.pending, pendingReducer)
            .addCase(fetchGroupDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentGroup = action.payload;
            })
            .addCase(fetchGroupDetails.rejected, rejectedReducer);

        // updateGroup
        builder
            .addCase(updateGroup.pending, pendingReducer)
            .addCase(updateGroup.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(updateGroup.rejected, rejectedReducer);

        // deleteGroup
        builder
            .addCase(deleteGroup.pending, pendingReducer)
            .addCase(deleteGroup.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(deleteGroup.rejected, rejectedReducer);

        // removeMember
        builder
            .addCase(removeMember.pending, pendingReducer)
            .addCase(removeMember.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(removeMember.rejected, rejectedReducer);

        // requestJoinGroup
        builder
            .addCase(requestJoinGroup.pending, pendingReducer)
            .addCase(requestJoinGroup.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(requestJoinGroup.rejected, rejectedReducer);

        // handleJoinRequest
        builder
            .addCase(handleJoinRequest.pending, pendingReducer)
            .addCase(handleJoinRequest.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(handleJoinRequest.rejected, rejectedReducer);

        // approveJoinRequest
        builder
            .addCase(approveJoinRequest.pending, pendingReducer)
            .addCase(approveJoinRequest.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(approveJoinRequest.rejected, rejectedReducer);

        // denyJoinRequest
        builder
            .addCase(denyJoinRequest.pending, pendingReducer)
            .addCase(denyJoinRequest.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(denyJoinRequest.rejected, rejectedReducer);

        // fetchJoinRequests
        builder
            .addCase(fetchJoinRequests.pending, pendingReducer)
            .addCase(fetchJoinRequests.fulfilled, (state, action) => {
                state.status = 'succeeded';

                // Se stai già usando `state.currentGroup`, aggiorna le joinRequests se l'ID corrisponde
                const {groupId, joinRequests} = action.payload;
                if (state.currentGroup && state.currentGroup.id === groupId) {
                    state.currentGroup.joinRequests = joinRequests;
                }
            })
            .addCase(fetchJoinRequests.rejected, rejectedReducer);
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// 📌 Selettori
// ─────────────────────────────────────────────────────────────────────────────
export const selectGroups = (state: RootState) => state.groups.groups;
export const selectCurrentGroup = (state: RootState) => state.groups.currentGroup;
export const selectGroupsLoading = (state: RootState) => state.groups.status === 'loading';
export const selectGroupsError = (state: RootState) => state.groups.error;

// ─────────────────────────────────────────────────────────────────────────────
// Azioni del reducer
// ─────────────────────────────────────────────────────────────────────────────
export const {resetCurrentGroup, resetGroupsError, clearGroupsState} = groupsSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// Export finale
// ─────────────────────────────────────────────────────────────────────────────
export default groupsSlice.reducer;
