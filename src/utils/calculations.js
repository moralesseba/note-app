// utils/calculations.js — Reglas de negocio de NOTE.
//
// Concepto clave: FUNCIONES PURAS. Reciben datos, devuelven datos, sin tocar
// pantalla ni base de datos. Ventajas: se testean solas (ver calculations.test.js)
// y se reutilizan igual en un formulario, una tabla o un reporte.

// ── Parámetros del negocio ────────────────────────────────────────────
export const TASA_INTERES = 0.2        // 20% fijo por préstamo
export const MONTO_MINIMO = 50_000     // CLP
export const MONTO_MAXIMO = 500_000    // CLP
export const PASO_TABLA = 50_000       // incremento de la tabla de referencia
export const DIAS_RECORDATORIO_1 = 5   // 1er recordatorio: 5 días antes

// ── Cálculos ──────────────────────────────────────────────────────────
export function calcularInteres(monto) {
  return Math.round(monto * TASA_INTERES)
}

export function calcularTotal(monto) {
  return monto + calcularInteres(monto)
}

/** Valida un monto de préstamo. Devuelve { valido, error }. */
export function validarMonto(monto) {
  if (typeof monto !== 'number' || Number.isNaN(monto)) {
    return { valido: false, error: 'El monto debe ser un número' }
  }
  if (monto < MONTO_MINIMO) {
    return { valido: false, error: `El mínimo es $${MONTO_MINIMO.toLocaleString('es-CL')}` }
  }
  if (monto > MONTO_MAXIMO) {
    return { valido: false, error: `El máximo es $${MONTO_MAXIMO.toLocaleString('es-CL')}` }
  }
  return { valido: true, error: null }
}

// ── Fechas ────────────────────────────────────────────────────────────
/** Días entre hoy y el vencimiento (negativo si ya venció). */
export function diasRestantes(vencimientoISO, hoy = new Date()) {
  const [y, m, d] = vencimientoISO.split('T')[0].split('-').map(Number)
  const vence = new Date(y, m - 1, d)
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((vence - base) / (1000 * 60 * 60 * 24))
}

/**
 * Estado de un préstamo según fecha y pago:
 *   'pagado' | 'vencido' | 'por_vencer' (≤5 días) | 'activo'
 */
export function estadoPrestamo(prestamo, hoy = new Date()) {
  if (prestamo.pagado) return 'pagado'
  const dias = diasRestantes(prestamo.vencimiento, hoy)
  if (dias < 0) return 'vencido'
  if (dias <= DIAS_RECORDATORIO_1) return 'por_vencer'
  return 'activo'
}

/**
 * Vencimiento = fecha del préstamo + 1 mes (regla del negocio).
 * Detalle fino: si el día no existe en el mes destino (ej: 31 ene + 1 mes),
 * JavaScript "desborda" al mes siguiente (3 mar). Lo correcto para un
 * préstamo es el ÚLTIMO día del mes destino (28/29 feb) — lo clampeamos.
 */
export function calcularVencimiento(fechaPrestamoISO) {
  const [y, m, d] = fechaPrestamoISO.split('T')[0].split('-').map(Number)
  const fecha = new Date(y, m - 1, d)
  const diaOriginal = fecha.getDate()
  fecha.setMonth(fecha.getMonth() + 1)
  if (fecha.getDate() !== diaOriginal) fecha.setDate(0) // clamp a fin de mes
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

/** Fechas de recordatorio según la regla acordada: 5 días antes + el mismo día. */
export function fechasRecordatorio(vencimientoISO) {
  const [y, m, d] = vencimientoISO.split('T')[0].split('-').map(Number)
  const vence = new Date(y, m - 1, d)
  const primero = new Date(vence)
  primero.setDate(primero.getDate() - DIAS_RECORDATORIO_1)
  const toISO = (f) =>
    `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`
  return { primero: toISO(primero), segundo: toISO(vence) }
}

// ── Tabla de referencia (PRIVADA: solo para el administrador) ─────────
/** Genera la tabla de montos $50.000 → $500.000 con interés y total. */
export function generarTablaReferencia() {
  const filas = []
  for (let monto = MONTO_MINIMO; monto <= MONTO_MAXIMO; monto += PASO_TABLA) {
    filas.push({ monto, interes: calcularInteres(monto), total: calcularTotal(monto) })
  }
  return filas
}
