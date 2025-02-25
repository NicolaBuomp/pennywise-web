import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface Expense {
    id: string;
    group_id: string;
    amount: number;
    currency: string;
    description: string;
    paid_by: string;
    category: string;
    split_method: 'equal' | 'custom';
    created_at: string;
}

interface ExpenseParticipant {
    expense_id: string;
    user_id: string;
    amount: number;
    settled: boolean;
    settled_at: string | null;
}

interface Balance {
    user_id: string;
    owes_to: string;
    amount: number;
}

interface ExpensesState {
    expenses: Expense[];
    balances: Balance[];
    loading: boolean;
    error: string | null;
}

const initialState: ExpensesState = {
    expenses: [],
    balances: [],
    loading: false,
    error: null
};

export const fetchExpenses = createAsyncThunk(
    'expenses/fetchExpenses',
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/expenses/${groupId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createExpense = createAsyncThunk(
    'expenses/createExpense',
    async (expenseData: {
        groupId: string;
        amount: number;
        currency: string;
        description: string;
        paidBy: string;
        category?: string;
        splitMethod: 'equal' | 'custom';
        participants: { userId: string; amount: number }[];
    }, { rejectWithValue }) => {
        try {
            const response = await api.post('/expenses', expenseData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchBalances = createAsyncThunk(
    'expenses/fetchBalances',
    async (groupId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/expenses/balances/${groupId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const settleExpense = createAsyncThunk(
    'expenses/settleExpense',
    async ({ expenseId, userId }: { expenseId: string; userId: string }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/expenses/${expenseId}/settle`, { userId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        resetExpensesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(createExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses.push(action.payload.expense);
            })
            .addCase(createExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchBalances.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBalances.fulfilled, (state, action) => {
                state.loading = false;
                state.balances = action.payload;
            })
            .addCase(fetchBalances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(settleExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(settleExpense.fulfilled, (state) => {
                state.loading = false;
                // Qui potremmo aggiornare lo stato delle spese o richiedere un aggiornamento
                // Dipende dalla risposta API e da come vogliamo gestire l'UI
            })
            .addCase(settleExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetExpensesError } = expensesSlice.actions;
export default expensesSlice.reducer;