// components/layout/MainLayout.jsx — Esqueleto de las páginas privadas.
// max-w-6xl + mx-auto: el contenido no se estira infinito en pantallas
// grandes — legibilidad primero (línea de lectura acotada).
import { Outlet } from 'react-router'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
