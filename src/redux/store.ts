// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import themeReducer from './slices/themeSlice'; // Added import
import alertReducer from './slices/alertSlice';

// redux-persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui', 'theme'] // Added 'theme' to persist
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  theme: themeReducer,
  alert: alertReducer,
  // Others will be added later
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.updatedAt',
        ],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default { store, persistor };