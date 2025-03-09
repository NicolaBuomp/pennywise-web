import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Importazione dei reducer
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
// Altri reducer verranno importati in seguito

// Configurazione redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'] // Solo questi reducer verranno persistiti
};

// Combinazione dei reducer
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  // Altri reducer verranno aggiunti in seguito
});

// Creazione del reducer persistente
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurazione dello store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore le azioni di redux-persist che non sono serializzabili
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore alcuni path specifici che contengono Date o altri valori non serializzabili
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.updatedAt',
        ],
      },
    }),
});

// Creazione del persistor
export const persistor = persistStore(store);

// Esportazione dei tipi per TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default { store, persistor };