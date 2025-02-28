import {configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {combineReducers} from 'redux';
import authReducer from './auth/authSlice';
import groupsReducer from './groups/groupsSlice';
import shoppingListsReducer from './shoppingLists/shoppingListsSlice';
import expensesReducer from './expenses/expensesSlice';
import profileReducer from './profile/profileSlice';
import themeReducer from "./theme/themeSlice.ts";

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'] // solo lo stato auth verrà persistito
};

const rootReducer = combineReducers({
    auth: authReducer,
    groups: groupsReducer,
    shoppingLists: shoppingListsReducer,
    expenses: expensesReducer,
    profile: profileReducer,
    theme: themeReducer,
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