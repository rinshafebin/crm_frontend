import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import { PusherProvider } from './context/PusherContext';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
        <PusherProvider>
          <App />
        </PusherProvider>
    </AuthProvider>
  </StrictMode>,
)
