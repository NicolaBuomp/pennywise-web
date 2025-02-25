import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface ShoppingList {
    id: string;
    name: string;
    group_id: string;
    created_by: string;
    created_at: string;
}

interface ShoppingItem {
    id: string;
    list_id: string;
    name: string;
    quantity: number;
    unit: string;
    completed: boolean;
    created_by: string;
    created_at: string;
    completed_by: string | null;
    completed_at: string | null;
}

interface ShoppingListsState {
    lists: ShoppingList[];
    currentList: ShoppingList | null;
    items: ShoppingItem[];
    loading: boolean;
    error: string | null;
}

const initialState: ShoppingListsState = {
    lists: [],
    currentList: null,
    items: [],
    loading: false,
    error: null
};

export const fetchShoppingLists = createAsyncThunk(
    'shoppingLists/fetchShoppingLists',
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/shopping-lists/${groupId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createShoppingList = createAsyncThunk(
    'shoppingLists/createShoppingList',
    async ({ groupId, name }: { groupId: string; name: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/shopping-lists', { groupId, name });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchShoppingItems = createAsyncThunk(
    'shoppingLists/fetchShoppingItems',
    async (listId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/shopping-items/${listId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createShoppingItem = createAsyncThunk(
    'shoppingLists/createShoppingItem',
    async ({ listId, name, quantity, unit }: { listId: string; name: string; quantity?: number; unit?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/shopping-items', { listId, name, quantity, unit });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const toggleItemCompletion = createAsyncThunk(
    'shoppingLists/toggleItemCompletion',
    async ({ itemId, completed }: { itemId: string; completed: boolean }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/shopping-items/${itemId}`, { completed });
            return { ...response.data, id: itemId, completed };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const shoppingListsSlice = createSlice({
    name: 'shoppingLists',
    initialState,
    reducers: {
        setCurrentList: (state, action) => {
            state.currentList = action.payload;
        },
        resetShoppingListsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShoppingLists.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShoppingLists.fulfilled, (state, action) => {
                state.loading = false;
                state.lists = action.payload;
            })
            .addCase(fetchShoppingLists.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(createShoppingList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createShoppingList.fulfilled, (state, action) => {
                state.loading = false;
                state.lists.push(action.payload);
            })
            .addCase(createShoppingList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchShoppingItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShoppingItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchShoppingItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(createShoppingItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createShoppingItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createShoppingItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(toggleItemCompletion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleItemCompletion.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index].completed = action.payload.completed;
                    if (action.payload.completed) {
                        state.items[index].completed_at = new Date().toISOString();
                        state.items[index].completed_by = 'current-user'; // Idealmente sostituito con l'ID utente reale
                    } else {
                        state.items[index].completed_at = null;
                        state.items[index].completed_by = null;
                    }
                }
            })
            .addCase(toggleItemCompletion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { setCurrentList, resetShoppingListsError } = shoppingListsSlice.actions;
export default shoppingListsSlice.reducer;