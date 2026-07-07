// components/loans/LoanForm.jsx — Formulario de préstamo (crear Y editar).
//
// Refactor de NewLoanForm: un solo componente para ambos casos.
// La prop "initial" decide el modo: null → crear · préstamo → editar.
// Patrón: en vez de duplicar formularios, se parametriza el existente.
import { useState } from 'react'
import {
  validarMonto,
  calcularInteres,
  calcularTotal,
  calcularVencimiento,
} from '../../utils/calculations.js'
import { formatCLP, formatFecha } from '../../utils/formatting.js'
import { Button, Card, Input } from '../common'

const hoyISO = () => {
  const h = new Date()
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`
}

export default function LoanForm({ initial = null, onSubmit, onCancel }) {
  const editando = initial !== null
  const [prestatario, setPrestatario] = useState(initial?.prestatario ?? '')
  const [monto, setMonto] = useState(initial ? String(initial.principal) : '')
  const [fechaPrestamo, setFechaPrestamo] = useState(initial?.fechaPrestamo ?? hoyISO())
  const [conHora, setConHora] = useState(initial ? Boolean(initial.horaLimite) : true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const montoNum = Number(monto)
  const montoValido = validarMonto(montoNum)
  const vencimiento = fechaPrestamo ? calcularVencimiento(fechaPrestamo) : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prestatario.trim() || !montoValido.valido || !fechaPrestamo) return
    setEnviando(true)
    setError(null)
    try {
      await onSubmit({
        prestatario: prestatario.trim(),
        principal: montoNum,
        fechaPrestamo,
        vencimiento,
        horaLimite: conHora ? '12:00 p.m.' : null,
      })
      if (!editando) {
        setPrestatario('')
        setMonto('')
        setFechaPrestamo(hoyISO())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card title={editando ? `Editar préstamo — ${initial.prestatario}` : 'Nuevo préstamo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="prestatario"
            label="Prestatario"
            placeholder="Nombre de la persona"
            value={prestatario}
            onChange={(e) => setPrestatario(e.target.value)}
            required
          />
          <Input
            id="monto"
            label="Monto a prestar (CLP)"
            type="number"
            placeholder="50000"
            min="50000"
            max="500000"
            step="1000"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            error={monto !== '' && !montoValido.valido ? montoValido.error : null}
            required
          />
          <Input
            id="fechaPrestamo"
            label="Fecha del préstamo"
            type="date"
            value={fechaPrestamo}
            onChange={(e) => setFechaPrestamo(e.target.value)}
            required
          />
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={conHora}
                onChange={(e) => setConHora(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Hora límite 12:00 p.m.
            </label>
          </div>
        </div>

        {/* Vista previa derivada: si cambias monto o fecha, se recalcula sola */}
        {montoValido.valido && vencimiento && (
          <div className="rounded-lg bg-brand-50 p-3 text-sm text-brand-900">
            Interés (20%): <strong>{formatCLP(calcularInteres(montoNum))}</strong>
            {' · '}Total a devolver: <strong>{formatCLP(calcularTotal(montoNum))}</strong>
            {' · '}Vence: <strong>{formatFecha(vencimiento)}</strong>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={enviando || !montoValido.valido || !prestatario.trim()}>
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar préstamo'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
