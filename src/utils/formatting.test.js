// formatting.test.js — Tests de formateo.
import { describe, it, expect } from 'vitest'
import { formatCLP, formatFecha, formatVencimiento } from './formatting.js'

describe('formatCLP', () => {
  it('formatea pesos chilenos sin decimales', () => {
    // Intl usa espacio no separable ($ 120.000) según el runtime:
    // comparamos sin distinguir tipos de espacio para que sea robusto.
    expect(formatCLP(120_000).replace(/\s/g, '')).toBe('$120.000')
    expect(formatCLP(60_000).replace(/\s/g, '')).toBe('$60.000')
  })
})

describe('formatFecha', () => {
  it('convierte ISO a formato chileno corto', () => {
    const out = formatFecha('2026-08-06')
    expect(out).toContain('2026')
    expect(out).toContain('6')
    expect(out.toLowerCase()).toContain('ago')
  })
})

describe('formatVencimiento', () => {
  it('agrega la hora límite cuando existe', () => {
    expect(formatVencimiento('2026-08-06', '12:00 p.m.')).toContain('12:00 p.m.')
  })

  it('sin hora límite devuelve solo la fecha', () => {
    expect(formatVencimiento('2026-08-03', null)).not.toContain('·')
  })
})
