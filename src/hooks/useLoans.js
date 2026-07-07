// hooks/useLoans.js — Fuente de datos de préstamos (ahora con Supabase).
//
// La promesa de la fase anterior se cumple: las páginas siguen consumiendo
// la MISMA interfaz; solo cambió la implementación interna.
//   { loans, loading, error, addLoan, markPaid, importSeed }
//
// Dos implementaciones detrás de la misma interfaz:
//   • Supabase configurado → tabla "loans" en Postgres (protegida por RLS)
//   • Modo demo            → estado local en memoria (mismos métodos)
//
// Concepto: "capa de mapeo". La BD habla snake_case (convención SQL) y la
// app camelCase (convención JS). Las funciones fromDb/toDb traducen en la
// frontera — ninguna página conoce los nombres de columnas.
import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { calcularInteres, calcularTotal } from '../utils/calculations.js'
import { seedLoans } from '../data/seedLoans.js'

// ── Mapeo BD ↔ App ────────────────────────────────────────────────────
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

/** Completa interés y total a partir del principal (única fuente: calculations). */
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
      // Modo demo: los datos de ejemplo, en memoria
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

  // ── Alta de préstamo ────────────────────────────────────────────────
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

  // ── Marcar como pagado ──────────────────────────────────────────────
  async function markPaid(id) {
    if (!isSupabaseConfigured) {
      setLoans((prev) => prev.map((p) => (p.id === id ? { ...p, pagado: true } : p)))
      return
    }
    const { error: err } = await supabase.from('loans').update({ pagado: true }).eq('id', id)
    if (err) throw new Error('No se pudo actualizar: ' + err.message)
    setLoans((prev) => prev.map((p) => (p.id === id ? { ...p, pagado: true } : p)))
  }

  // ── Importar los 4 préstamos iniciales (primera vez) ────────────────
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

  return { loans, loading, error, addLoan, markPaid, importSeed }
}
