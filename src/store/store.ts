import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './auth/authSlice';
import groupsReducer from './groups/groupsSlice';
import shoppingListsReducer from './shoppingLists/shoppingListsSlice';
import expensesReducer from './expenses/expensesSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'] // solo lo stato auth verrà persistito
};

const rootReducer = combineReducers({
    auth: authReducer,
    groups: groupsReducer,
    shoppingLists: shoppingListsReducer,
    expenses: expensesReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;