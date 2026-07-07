// main.jsx — Punto de entrada. Aquí React toma control del <div id="root">.
// Orden de las "capas" (de afuera hacia adentro):
//   StrictMode   → avisa de malas prácticas en desarrollo
//   BrowserRouter→ habilita navegación por URL sin recargar la página
//   AuthProvider → comparte el usuario logueado con TODA la app (Context API)
//   App          → define las rutas
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import './styles/globals.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
