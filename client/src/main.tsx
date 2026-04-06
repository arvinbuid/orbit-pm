import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { StrictMode } from 'react'
import './index.css'
import App from './App.tsx'
import ClerkRouterProvider from './components/auth/ClerkRouterProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkRouterProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </ClerkRouterProvider>
    </BrowserRouter>
  </StrictMode>
)
