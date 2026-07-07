// hooks/useLoans.js — Fuente de datos de préstamos (Supabase).
//
// Interfaz que consumen las páginas (no saben qué hay detrás):
//   { loans, loading, error, addLoan, updateLoan, setPaid, importSeed }
//
// setPaid(id, true|false) reemplaza al antiguo markPaid: mismo mecanismo
// en ambos sentidos → "deshacer pago" sale gratis (patrón undo > confirm).
import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { calcularInteres, calcularTotal } from '../utils/calculations.js'
import { seedLoans } from '../data/seedLoans.js'

// ── Mapeo BD ↔ App (la BD habla snake_case, la app camelCase) ─────────
function fromDb(row) {
  return {
    id: row.id,
    prestatario: row.prestatario,
    principal: row.principal,
    interes: row.interes,
    total: row.total,
    fechaPrestamo: row.fecha_prestamo,
    vencimiento: row.vencimiento,
    horaLimite: row.hora_limite,
    pagado: row.pagado,
  }
}

function toDb(loan) {
  return {
    prestatario: loan.prestatario,
    principal: loan.principal,
    interes: loan.interes,
    total: loan.total,
    fecha_prestamo: loan.fechaPrestamo,
    vencimiento: loan.vencimiento,
    hora_limite: loan.horaLimite ?? null,
    pagado: loan.pagado ?? false,
    // user_id NO se envía: lo pone la BD con default auth.uid()
  }
}

/** Completa interés y total desde el principal (única fuente: calculations). */
function conMontos(datos) {
  return {
    ...datos,
    interes: calcularInteres(datos.principal),
    total: calcularTotal(datos.principal),
  }
}

export function useLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Lectura ─────────────────────────────────────────────────────────
  const fetchLoans = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoans(seedLoans)
      setLoading(false)
      return
    }
    setError(null)
    const { data, error: err } = await supabase
      .from('loans')
      .select('*')
      .order('vencimiento', { ascending: true })
    if (err) {
      setError('No se pudieron cargar los préstamos: ' + err.message)
    } else {
      setLoans(data.map(fromDb))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  // ── Alta ────────────────────────────────────────────────────────────
  async function addLoan(datos) {
    const nuevo = conMontos(datos)
    if (!isSupabaseConfigured) {
      const local = { ...nuevo, id: `demo-${Date.now()}`, pagado: false }
      setLoans((prev) => [...prev, local])
      return local
    }
    const { data, error: err } = await supabase
      .from('loans')
      .insert(toDb(nuevo))
      .select()
      .single()
    if (err) throw new Error('No se pudo guardar: ' + err.message)
    const guardado = fromDb(data)
    setLoans((prev) => [...prev, guardado])
    return guardado
  }

  // ── Edición (recalcula interés/total si cambió el principal) ────────
  async function updateLoan(id, datos) {
    const actualizado = conMontos(datos)
    if (!isSupabaseConfigured) {
      setLoans((prev) => prev.map((p) => (p.id === id ? { ...p, ...actualizado } : p)))
      return
    }
    // Importante: NO enviamos "pagado" en la edición — ese campo solo lo
    // cambia setPaid. Si lo incluyéramos, toDb lo llenaría con false y
    // editar un préstamo pagado lo "des-pagaría" en silencio (bug sutil).
    const { pagado: _omitido, ...campos } = toDb(actualizado)
    const { data, error: err } = await supabase
      .from('loans')
      .update(campos)
      .eq('id', id)
      .select()
      .single()
    if (err) throw new Error('No se pudo actualizar: ' + err.message)
    setLoans((prev) => prev.map((p) => (p.id === id ? fromDb(data) : p)))
  }

  // ── Pagado / deshacer pagado ────────────────────────────────────────
  async function setPaid(id, pagado) {
    if (!isSupabaseConfigured) {
      setLoans((prev) => prev.map((p) => (p.id === id ? { ...p, pagado } : p)))
      return
    }
    const { error: err } = await supabase.from('loans').update({ pagado }).eq('id', id)
    if (err) throw new Error('No se pudo actualizar: ' + err.message)
    setLoans((prev) => prev.map((p) => (p.id === id ? { ...p, pagado } : p)))
  }

  // ── Importar seed (primera vez) ─────────────────────────────────────
  async function importSeed() {
    if (!isSupabaseConfigured) {
      setLoans(seedLoans)
      return
    }
    const filas = seedLoans.map(toDb)
    const { data, error: err } = await supabase.from('loans').insert(filas).select()
    if (err) throw new Error('No se pudo importar: ' + err.message)
    setLoans((prev) => [...prev, ...data.map(fromDb)])
  }

  return { loans, loading, error, addLoan, updateLoan, setPaid, importSeed }
}
