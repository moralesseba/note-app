// utils/formatting.js — Formateo de datos para mostrar en pantalla.
// Separación de responsabilidades: calculations.js CALCULA (números puros),
// formatting.js PRESENTA (strings bonitos). Nunca mezclar las dos cosas.

// Intl es la API nativa del navegador para formatos locales — sin librerías.
const formatoCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** 120000 → "$120.000" */
export function formatCLP(monto) {
  return formatoCLP.format(monto)
}

/** "2026-08-06" → "6 ago 2026" */
export function formatFecha(iso) {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return formatoFecha.format(new Date(y, m - 1, d))
}

/** Vencimiento con hora límite opcional: "6 ago 2026 · 12:00 p.m." */
export function formatVencimiento(iso, horaLimite) {
  return horaLimite ? `${formatFecha(iso)} · ${horaLimite}` : formatFecha(iso)
}
