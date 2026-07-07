// components/common/Badge.jsx — Etiqueta de estado con punto de color.
// El punto + texto (no solo color) ayuda a distinguir estados también
// a personas con daltonismo — detalle de accesibilidad del design system.
const ESTILOS = {
  activo: { chip: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  por_vencer: { chip: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  vencido: { chip: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' },
  pagado: { chip: 'bg-green-50 text-green-700 ring-green-600/20', dot: 'bg-green-500' },
}

const TEXTOS = {
  activo: 'Activo',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  pagado: 'Pagado',
}

export default function Badge({ estado }) {
  const s = ESTILOS[estado] ?? { chip: 'bg-gray-100 text-gray-600 ring-gray-500/20', dot: 'bg-gray-400' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {TEXTOS[estado] ?? estado}
    </span>
  )
}
