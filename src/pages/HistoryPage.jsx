// pages/HistoryPage.jsx — Historial de préstamos pagados.
// Incluye "Deshacer pago" por si marcaste a la persona equivocada:
// el préstamo vuelve a la lista de activos con todos sus datos intactos.
import { useState } from 'react'
import { useLoans } from '../hooks/useLoans.js'
import { formatCLP, formatFecha } from '../utils/formatting.js'
import { Card, Button } from '../components/common'

export default function HistoryPage() {
  const { loans, loading, setPaid } = useLoans()
  const [errorAccion, setErrorAccion] = useState(null)

  if (loading) return <p className="text-gray-500">Cargando…</p>

  const pagados = loans.filter((p) => p.pagado)

  async function handleDeshacer(id) {
    try {
      setErrorAccion(null)
      await setPaid(id, false)
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historial</h1>

      {errorAccion && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{errorAccion}</p>}

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
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{p.prestatario}</p>
                  <p className="text-sm text-gray-500">
                    Prestado {formatFecha(p.fechaPrestamo)} · vencía {formatFecha(p.vencimiento)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tnum font-semibold text-green-700">{formatCLP(p.total)} ✓</span>
                  <Button variant="secondary" onClick={() => handleDeshacer(p.id)}>
                    ↩ Deshacer pago
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
