// components/ProtectedRoute.jsx — Guardia de rutas privadas.
// Tres estados posibles:
//   cargando  → spinner (Firebase aún verifica la sesión)
//   sin user  → redirigir a /login
//   con user  → renderizar el contenido protegido
import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"
          role="status"
          aria-label="Cargando sesión"
        />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
