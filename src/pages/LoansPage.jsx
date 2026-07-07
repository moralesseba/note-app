// pages/LoansPage.jsx — Tabla de préstamos + alta + marcar pagado.
// El estado "mostrarForm" es UI pura (no negocio): vive aquí, no en el hook.
import { useState } from 'react'
import { useLoans } from '../hooks/useLoans.js'
import { estadoPrestamo } from '../utils/calculations.js'
import { formatCLP, formatFecha, formatVencimiento } from '../utils/formatting.js'
import { Card, Badge, Button } from '../components/common'
import NewLoanForm from '../components/loans/NewLoanForm.jsx'
import LoanMessageModal from '../components/loans/LoanMessageModal.jsx'

export default function LoansPage() {
  const { loans, loading, error, addLoan, markPaid } = useLoans()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [errorAccion, setErrorAccion] = useState(null)
  const [prestamoMensaje, setPrestamoMensaje] = useState(null)

  if (loading) return <p className="text-gray-500">Cargando…</p>

  async function handleAdd(datos) {
    await addLoan(datos) // si falla, NewLoanForm muestra el error
    setMostrarForm(false)
  }

  async function handlePagado(id) {
    try {
      setErrorAccion(null)
      await markPaid(id)
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Préstamos</h1>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>+ Nuevo préstamo</Button>
        )}
      </div>

      {mostrarForm && (
        <NewLoanForm onSubmit={handleAdd} onCancel={() => setMostrarForm(false)} />
      )}

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {errorAccion && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{errorAccion}</p>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2">Prestatario</th>
                <th className="px-3 py-2">Prestado</th>
                <th className="px-3 py-2">Interés</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Fecha préstamo</th>
                <th className="px-3 py-2">Vencimiento</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium">{p.prestatario}</td>
                  <td className="px-3 py-3">{formatCLP(p.principal)}</td>
                  <td className="px-3 py-3 text-gray-500">{formatCLP(p.interes)}</td>
                  <td className="px-3 py-3 font-semibold">{formatCLP(p.total)}</td>
                  <td className="px-3 py-3">{formatFecha(p.fechaPrestamo)}</td>
                  <td className="px-3 py-3">{formatVencimiento(p.vencimiento, p.horaLimite)}</td>
                  <td className="px-3 py-3"><Badge estado={estadoPrestamo(p)} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setPrestamoMensaje(p)}>
                        💬 Mensaje
                      </Button>
                      {!p.pagado && (
                        <Button variant="secondary" onClick={() => handlePagado(p.id)}>
                          Marcar pagado
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                    Sin préstamos todavía. Crea el primero con "+ Nuevo préstamo",
                    o importa tus datos iniciales desde el Dashboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* El modal se monta solo cuando hay un préstamo seleccionado */}
      {prestamoMensaje && (
        <LoanMessageModal
          prestamo={prestamoMensaje}
          onClose={() => setPrestamoMensaje(null)}
        />
      )}
    </div>
  )
}
