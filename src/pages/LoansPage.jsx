// pages/LoansPage.jsx — Tabla de préstamos: alta, edición, pagado/deshacer, mensajes.
// UX: sin "¿estás seguro?" — el error se corrige con Deshacer (undo > confirm).
import { useState } from 'react'
import { useLoans } from '../hooks/useLoans.js'
import { estadoPrestamo } from '../utils/calculations.js'
import { formatCLP, formatFecha, formatVencimiento } from '../utils/formatting.js'
import { Card, Badge, Button } from '../components/common'
import LoanForm from '../components/loans/LoanForm.jsx'
import LoanMessageModal from '../components/loans/LoanMessageModal.jsx'

export default function LoansPage() {
  const { loans, loading, error, addLoan, updateLoan, setPaid } = useLoans()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [prestamoEditar, setPrestamoEditar] = useState(null)
  const [prestamoMensaje, setPrestamoMensaje] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  if (loading) return <p className="text-gray-500">Cargando…</p>

  async function handleAdd(datos) {
    await addLoan(datos)
    setMostrarForm(false)
  }

  async function handleEdit(datos) {
    await updateLoan(prestamoEditar.id, datos)
    setPrestamoEditar(null)
  }

  async function handlePagado(p) {
    try {
      setErrorAccion(null)
      await setPaid(p.id, !p.pagado) // toggle: marcar o deshacer
    } catch (err) {
      setErrorAccion(err.message)
    }
  }

  const formVisible = mostrarForm || prestamoEditar !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Préstamos</h1>
        {!formVisible && (
          <Button onClick={() => setMostrarForm(true)}>+ Nuevo préstamo</Button>
        )}
      </div>

      {mostrarForm && (
        <LoanForm onSubmit={handleAdd} onCancel={() => setMostrarForm(false)} />
      )}

      {prestamoEditar && (
        <LoanForm
          key={prestamoEditar.id} /* key: React remonta el form al cambiar de préstamo */
          initial={prestamoEditar}
          onSubmit={handleEdit}
          onCancel={() => setPrestamoEditar(null)}
        />
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
                  <td className="tnum px-3 py-3">{formatCLP(p.principal)}</td>
                  <td className="tnum px-3 py-3 text-gray-500">{formatCLP(p.interes)}</td>
                  <td className="tnum px-3 py-3 font-semibold">{formatCLP(p.total)}</td>
                  <td className="px-3 py-3">{formatFecha(p.fechaPrestamo)}</td>
                  <td className="px-3 py-3">{formatVencimiento(p.vencimiento, p.horaLimite)}</td>
                  <td className="px-3 py-3"><Badge estado={estadoPrestamo(p)} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setPrestamoMensaje(p)}>
                        💬 Mensaje
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setMostrarForm(false)
                          setPrestamoEditar(p)
                        }}
                      >
                        ✏️ Editar
                      </Button>
                      <Button variant="secondary" onClick={() => handlePagado(p)}>
                        {p.pagado ? '↩ Deshacer pago' : 'Marcar pagado'}
                      </Button>
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

      {prestamoMensaje && (
        <LoanMessageModal
          prestamo={prestamoMensaje}
          onClose={() => setPrestamoMensaje(null)}
        />
      )}
    </div>
  )
}
