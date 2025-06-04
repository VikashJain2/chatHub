import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
};


const persistedReducer = persistReducer(persistConfig, userReducer);
export const store = configureStore({
    reducer:{
        user: persistedReducer
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);