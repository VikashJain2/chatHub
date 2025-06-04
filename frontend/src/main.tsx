import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './routes/AppRouter.tsx'
import { Provider } from "react-redux";
import { store,persistor } from './store/store.ts';
import { PersistGate } from 'redux-persist/integration/react';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>

   <AppRouter/>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
