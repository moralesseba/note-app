// pages/HistoryPage.jsx — Historial de préstamos pagados.
// Buen hábito de UX: un "empty state" claro en vez de una tabla vacía.
import { useLoans } from '../hooks/useLoans.js'
import { formatCLP, formatFecha } from '../utils/formatting.js'
import { Card } from '../components/common'

export default function HistoryPage() {
  const { loans, loading } = useLoans()

  if (loading) return <p className="text-gray-500">Cargando…</p>

  const pagados = loans.filter((p) => p.pagado)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historial</h1>

      {pagados.length === 0 ? (
        <Card>
          <div className="py-10 text-center text-gray-500">
            <p className="text-4xl" aria-hidden="true">📜</p>
            <p className="mt-2 font-medium">Aún no hay préstamos pagados</p>
            <p className="text-sm">Cuando marques un préstamo como pagado, aparecerá aquí.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-gray-100">
            {pagados.map((p) => (
              <li key={p.id} className="flex justify-between py-3">
                <span className="font-medium">{p.prestatario}</span>
                <span className="text-gray-500">{formatFecha(p.vencimiento)}</span>
                <span className="font-semibold">{formatCLP(p.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
