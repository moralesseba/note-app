// components/layout/Sidebar.jsx — Navegación principal (tema oscuro).
// Estilo "fintech": superficie ink-900, ítem activo en azul de marca.
// Los iconos son SVG inline (trazos limpios > emojis para look profesional).
import { NavLink } from 'react-router'

const ICONOS = {
  dashboard: 'M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z',
  prestamos: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  historial: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  referencia: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
}

function Icono({ d }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 shrink-0"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

const LINKS = [
  { to: '/', label: 'Dashboard', icono: ICONOS.dashboard },
  { to: '/prestamos', label: 'Préstamos', icono: ICONOS.prestamos },
  { to: '/historial', label: 'Historial', icono: ICONOS.historial },
  { to: '/referencia', label: 'Tabla referencia', icono: ICONOS.referencia },
]

export default function Sidebar() {
  return (
    <nav
      aria-label="Navegación principal"
      className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto bg-ink-900 p-2
        md:min-h-screen md:w-60 md:flex-col md:p-4"
    >
      {/* Marca: isotipo + nombre */}
      <div className="hidden md:mb-8 md:flex md:items-center md:gap-2.5 md:px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-extrabold text-white">
          N
        </span>
        <div>
          <span className="block text-base leading-tight font-bold text-white">NOTE</span>
          <span className="block text-[11px] leading-tight text-slate-400">
            Gestión de préstamos
          </span>
        </div>
      </div>

      {LINKS.map(({ to, label, icono }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
             ${isActive
               ? 'bg-brand-600 text-white shadow-sm'
               : 'text-slate-300 hover:bg-ink-800 hover:text-white'}`
          }
        >
          <Icono d={icono} />
          {label}
        </NavLink>
      ))}

      <div className="hidden md:mt-auto md:block md:px-3 md:pb-1">
        <p className="text-[11px] text-slate-500">App privada · v0.4</p>
      </div>
    </nav>
  )
}
