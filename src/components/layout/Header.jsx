// components/layout/Header.jsx — Barra superior: título de página + usuario.
// El título se deriva de la URL (useLocation) — una sola fuente de verdad.
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth.js'
import { Button } from '../common'

const TITULOS = {
  '/': 'Dashboard',
  '/prestamos': 'Préstamos',
  '/historial': 'Historial',
  '/referencia': 'Tabla de referencia',
}

export default function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const correo = user?.email ?? ''
  const inicial = (correo[0] ?? '?').toUpperCase()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-400 md:hidden">NOTE</span>
        <span className="hidden text-sm font-medium text-gray-500 md:block">
          {TITULOS[pathname] ?? ''}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Chip de usuario: avatar con inicial + correo */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {inicial}
          </span>
          <span className="hidden text-sm text-gray-600 sm:block">
            {correo}
            {user?.isDemo && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                demo
              </span>
            )}
          </span>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Salir
        </Button>
      </div>
    </header>
  )
}
