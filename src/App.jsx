// App.jsx — Mapa de rutas de la aplicación.
// Patrón profesional: "rutas anidadas". MainLayout (sidebar + header) envuelve
// a todas las páginas privadas; cada página se renderiza en su <Outlet />.
// ProtectedRoute es el guardia: si no hay sesión, redirige a /login.
import { Routes, Route, Navigate } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './components/layout/MainLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoansPage from './pages/LoansPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import ReferencePage from './pages/ReferencePage.jsx'

export default function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas privadas: primero pasa el guardia, luego el layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/prestamos" element={<LoansPage />} />
        <Route path="/historial" element={<HistoryPage />} />
        <Route path="/referencia" element={<ReferencePage />} />
      </Route>

      {/* Cualquier URL desconocida vuelve al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
